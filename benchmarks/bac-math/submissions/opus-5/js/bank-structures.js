// Subiectul II: matrices and determinants, laws of composition, polynomials.
//
// The corpus sets matrices as problem 1 every single time. Problem 2 is a law
// of composition in five of the seven official papers and a polynomial in the
// other two, so both are here and exam mode picks the way the examiners do.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const { Frac, F, looksTidy, M, ml } = BAC.core;
  const { num, part } = BAC.bankHelpers;

  const I2 = () => M.matrix([[M.mn(1), M.mn(0)], [M.mn(0), M.mn(1)]]);
  const mat = (a, b, c, d) => M.matrix([[M.num(a), M.num(b)], [M.num(c), M.num(d)]]);
  const detOf = (a, b, c, d) => a * d - b * c;

  /* ====================================================================== */
  /*  matrices — Subiectul II.1                                             */
  /* ====================================================================== */

  const matrices = {
    id: "matrices",
    name: "Matrices and determinants",
    blurb: "2×2 and 3×3 determinants, matrix identities, and systems.",
    slot: "II.1",
    levels: {
      1: [det2Numeric, matrixCombination],
      2: [det2Parameter, matrixProduct],
      3: [linearIdentity, detOfProduct],
      4: [detEquation, detInequality, det3Numeric],
      5: [det3Parameter, matrixEquation, cramerSystem]
    }
  };

  // L1 · the determinant of a numeric 2×2. Corpus: every paper's II.1.a).
  function det2Numeric(rng) {
    const a = rng.nz(-6, 9), b = rng.nz(-6, 9), c = rng.nz(-6, 9), d = rng.nz(-6, 9);
    const value = detOf(a, b, c, d);
    if (Math.abs(value) > 60) return null;
    return {
      shape: "det2-numeric",
      prompt: `The matrix ${ml(M.eq(M.mi("A"), mat(a, b, c, d)))} is given. Calculate ${ml(M.row(M.mi("det"), M.mo("⁡"), M.mi("A")))}.`,
      parts: [
        part(`What is the product on the main diagonal, ${ml(M.row(M.num(a), M.mo(M.CDOT), M.num(d)))}?`,
          2, num(a * d), `${a}·${d} = ${a * d}`),
        part(`Now ${ml(M.row(M.mi("det"), M.mo("⁡"), M.mi("A")))}.`, 3, num(value),
          `${ml(M.eq(M.row(M.mi("det"), M.mo("⁡"), M.mi("A")), M.num(value)))}`)
      ],
      solution: [
        `For a 2×2 matrix the determinant is (top-left · bottom-right) − (top-right · bottom-left).`,
        `det A = ${a}·${d} − ${b}·${c} = ${a * d} − ${b * c} = ${value}.`
      ],
      selfCheck: () => a * d - b * c === value ? null : "det2 mismatch"
    };
  }

  // L1 · a linear combination of two matrices.
  function matrixCombination(rng) {
    const A = [rng.nz(-5, 6), rng.nz(-5, 6), rng.nz(-5, 6), rng.nz(-5, 6)];
    const k = rng.int(2, 4);
    const B = A.map((value, index) => value * k + (index === 0 ? rng.int(-3, 3) : rng.int(-3, 3)));
    const result = A.map((value, index) => k * value + B[index]);
    if (result.some((value) => Math.abs(value) > 80)) return null;
    return {
      shape: "matrix-combination",
      prompt: `The matrices ${ml(M.eq(M.mi("A"), mat(A[0], A[1], A[2], A[3])))} and ${ml(M.eq(M.mi("B"), mat(B[0], B[1], B[2], B[3])))} are given. Find the top-left entry of ${ml(M.row(M.mn(k), M.mi("A"), M.mo("+"), M.mi("B")))}.`,
      parts: [
        part(`What is ${ml(M.row(M.mn(k), M.mo(M.CDOT), M.num(A[0])))}?`, 2, num(k * A[0]), `${k}·${A[0]} = ${k * A[0]}`),
        part(`Now the top-left entry of ${ml(M.row(M.mn(k), M.mi("A"), M.mo("+"), M.mi("B")))}.`, 3, num(result[0]),
          `${k * A[0]} + ${B[0]} = ${result[0]}`)
      ],
      solution: [
        `Multiplying a matrix by a number multiplies every entry, and adding matrices adds matching entries.`,
        `Top-left: ${k}·${A[0]} + ${B[0]} = ${result[0]}.`
      ],
      selfCheck: () => k * A[0] + B[0] === result[0] ? null : "combination mismatch"
    };
  }

  // L2 · det of a matrix that depends on a parameter, at one value.
  function det2Parameter(rng) {
    const p = rng.nz(-4, 5), q = rng.nz(-4, 5), r = rng.nz(-4, 5);
    const k = rng.nz(-4, 5);
    // A(x) = [[x + p, q], [r, x]]  ⇒  det = x² + px − qr
    const value = k * k + p * k - q * r;
    if (Math.abs(value) > 90) return null;
    const Ax = M.matrix([[M.linear(1, p), M.num(q)], [M.num(r), M.mi("x")]]);
    return {
      shape: "det2-parameter",
      prompt: `The matrix ${ml(M.eq(M.call("A", M.mi("x")), Ax))} is given, where ${ml(M.mi("x"))} is a real number. Calculate ${ml(M.row(M.mi("det"), M.mo("⁡"), M.paren(M.call("A", M.num(k)))))}.`,
      parts: [
        part(`What is the top-left entry of ${ml(M.call("A", M.num(k)))}?`, 2, num(k + p), `${k} ${p < 0 ? "−" : "+"} ${Math.abs(p)} = ${k + p}`),
        part(`Now the determinant.`, 3, num(value), `${ml(M.eq(M.row(M.mi("det"), M.mo("⁡"), M.paren(M.call("A", M.num(k)))), M.num(value)))}`)
      ],
      solution: [
        `Substitute x = ${k}: A(${k}) = ${ml(mat(k + p, q, r, k))}.`,
        `det = ${k + p}·${k} − ${q}·${r} = ${(k + p) * k} − ${q * r} = ${value}.`
      ],
      selfCheck: () => (k + p) * k - q * r === value ? null : "det2-parameter mismatch"
    };
  }

  // L2 · one entry of a product.
  function matrixProduct(rng) {
    const A = [rng.nz(-5, 5), rng.nz(-5, 5), rng.nz(-5, 5), rng.nz(-5, 5)];
    const B = [rng.nz(-5, 5), rng.nz(-5, 5), rng.nz(-5, 5), rng.nz(-5, 5)];
    const topLeft = A[0] * B[0] + A[1] * B[2];
    if (Math.abs(topLeft) > 60) return null;
    return {
      shape: "matrix-product",
      prompt: `The matrices ${ml(M.eq(M.mi("A"), mat(A[0], A[1], A[2], A[3])))} and ${ml(M.eq(M.mi("B"), mat(B[0], B[1], B[2], B[3])))} are given. Find the top-left entry of ${ml(M.row(M.mi("A"), M.mo(M.CDOT), M.mi("B")))}.`,
      parts: [
        part(`The first row of ${ml(M.mi("A"))} is ${ml(M.row(M.mo("("), M.num(A[0]), M.mo(","), M.num(A[1]), M.mo(")")))} and the first column of ${ml(M.mi("B"))} is ${ml(M.row(M.mo("("), M.num(B[0]), M.mo(","), M.num(B[2]), M.mo(")")))}. What is ${ml(M.row(M.num(A[0]), M.mo(M.CDOT), M.num(B[0])))}?`,
          2, num(A[0] * B[0]), `${A[0]}·${B[0]} = ${A[0] * B[0]}`),
        part(`Now the whole entry.`, 3, num(topLeft),
          `${A[0]}·${B[0]} + ${A[1]}·${B[2]} = ${topLeft}`)
      ],
      solution: [
        `An entry of a product is row times column: first row of A against first column of B.`,
        `${A[0]}·${B[0]} + ${A[1]}·${B[2]} = ${A[0] * B[0]} + ${A[1] * B[2]} = ${topLeft}.`
      ],
      selfCheck: () => A[0] * B[0] + A[1] * B[2] === topLeft ? null : "product mismatch"
    };
  }

  // L3 · an identity between matrices. Corpus: 2025 iunie II.1.b).
  function linearIdentity(rng) {
    const x = rng.nz(-4, 5);
    const alpha = rng.int(2, 5);
    const beta = rng.nz(-6, 6);
    const B = [rng.nz(-4, 5), rng.nz(-4, 5), rng.nz(-4, 5), rng.nz(-4, 5)];
    // αA + βI₂ = xB  ⇒  A = (xB − βI₂)/α, chosen so A has integer entries.
    const target = B.map((value) => value * x);
    const A = [
      (target[0] - beta) / alpha, target[1] / alpha,
      target[2] / alpha, (target[3] - beta) / alpha
    ];
    if (A.some((value) => !Number.isInteger(value) || Math.abs(value) > 40)) return null;
    return {
      shape: "linear-identity",
      prompt: `The matrices ${ml(M.eq(M.mi("A"), mat(A[0], A[1], A[2], A[3])))}, ${ml(M.eq(M.mi("B"), mat(B[0], B[1], B[2], B[3])))} and ${ml(M.eq(M.sub(M.mi("I"), M.mn(2)), I2()))} are given. Find the real number ${ml(M.mi("x"))} for which ${ml(M.eq(M.row(M.mn(alpha), M.mi("A"), M.mo(beta < 0 ? M.MINUS : "+"), M.mn(Math.abs(beta)), M.sub(M.mi("I"), M.mn(2))), M.row(M.mi("x"), M.mi("B"))))}.`,
      parts: [
        part(`What is the top-left entry of ${ml(M.row(M.mn(alpha), M.mi("A"), M.mo(beta < 0 ? M.MINUS : "+"), M.mn(Math.abs(beta)), M.sub(M.mi("I"), M.mn(2))))}?`,
          3, num(target[0]), `${alpha}·${A[0]} ${beta < 0 ? "−" : "+"} ${Math.abs(beta)} = ${target[0]}`),
        part(`Now ${ml(M.mi("x"))}.`, 2, num(x), `${ml(M.eq(M.mi("x"), M.num(x)))}`)
      ],
      solution: [
        `Work out the left-hand side entry by entry: ${ml(mat(target[0], target[1], target[2], target[3]))}.`,
        `That must equal xB = ${ml(M.row(M.mi("x"), mat(B[0], B[1], B[2], B[3])))}.`,
        `Comparing any entry that is not zero gives x = ${x}; the others confirm it.`
      ],
      selfCheck: () => A.every((value, index) =>
        alpha * value + (index === 0 || index === 3 ? beta : 0) === x * B[index]) ? null : "identity mismatch"
    };
  }

  // L3 · the determinant of a product, without multiplying out.
  function detOfProduct(rng) {
    const A = [rng.nz(-5, 5), rng.nz(-5, 5), rng.nz(-5, 5), rng.nz(-5, 5)];
    const B = [rng.nz(-5, 5), rng.nz(-5, 5), rng.nz(-5, 5), rng.nz(-5, 5)];
    const detA = detOf(A[0], A[1], A[2], A[3]);
    const detB = detOf(B[0], B[1], B[2], B[3]);
    const value = detA * detB;
    if (detA === 0 || detB === 0 || Math.abs(value) > 400) return null;
    return {
      shape: "det-of-product",
      prompt: `The matrices ${ml(M.eq(M.mi("A"), mat(A[0], A[1], A[2], A[3])))} and ${ml(M.eq(M.mi("B"), mat(B[0], B[1], B[2], B[3])))} are given. Calculate ${ml(M.row(M.mi("det"), M.mo("⁡"), M.paren(M.row(M.mi("A"), M.mo(M.CDOT), M.mi("B")))))}.`,
      parts: [
        part(`What is ${ml(M.row(M.mi("det"), M.mo("⁡"), M.mi("A")))}?`, 2, num(detA), `${ml(M.eq(M.row(M.mi("det"), M.mo("⁡"), M.mi("A")), M.num(detA)))}`),
        part(`Now ${ml(M.row(M.mi("det"), M.mo("⁡"), M.paren(M.row(M.mi("A"), M.mo(M.CDOT), M.mi("B")))))}.`, 3, num(value),
          `${ml(M.eq(M.row(M.mi("det"), M.mo("⁡"), M.paren(M.row(M.mi("A"), M.mi("B")))), M.row(M.mi("det"), M.mo("⁡"), M.mi("A"), M.mo(M.CDOT), M.mi("det"), M.mo("⁡"), M.mi("B")), M.num(value)))}`)
      ],
      solution: [
        `det A = ${detA} and det B = ${detB}.`,
        `The determinant of a product is the product of the determinants: det(AB) = ${detA}·${detB} = ${value}.`,
        `Multiplying the matrices out first gets the same answer and takes four times as long.`
      ],
      selfCheck: () => {
        const AB = [
          A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3],
          A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]
        ];
        return detOf(AB[0], AB[1], AB[2], AB[3]) === value ? null : "det-product mismatch";
      }
    };
  }

  // L4 · det A(x) = 0, solved.
  function detEquation(rng) {
    const r = rng.nz(-5, 5);
    const s = rng.nz(-5, 5);
    if (r === s) return null;
    const p = -(r + s);                       // det = x² + px + q
    const q = r * s;
    const b = rng.nz(-4, 4);
    const c = q === 0 ? null : (0 - q) / b;
    // A(x) = [[x, b], [c, x + p]] with det = x² + px − bc  ⇒  bc = −q
    if (!Number.isInteger(-q / b)) return null;
    const cEntry = -q / b;
    const Ax = M.matrix([[M.mi("x"), M.num(b)], [M.num(cEntry), M.linear(1, p)]]);
    const roots = [r, s].sort((u, v) => u - v);
    return {
      shape: "det-equation",
      prompt: `The matrix ${ml(M.eq(M.call("A", M.mi("x")), Ax))} is given, where ${ml(M.mi("x"))} is a real number. Find the real numbers ${ml(M.mi("x"))} for which ${ml(M.eq(M.row(M.mi("det"), M.mo("⁡"), M.paren(M.call("A", M.mi("x")))), M.mn(0)))}.`,
      parts: [
        part(`Write out the determinant. What is the coefficient of ${ml(M.mi("x"))} in it?`, 3, num(p),
          `${ml(M.eq(M.row(M.mi("det"), M.mo("⁡"), M.paren(M.call("A", M.mi("x")))), M.poly([[1, 2], [p, 1], [q, 0]])))}`),
        part(`Now the solutions, separated by a comma.`, 2, { type: "set", values: roots },
          `${ml(M.eq(M.mi("x"), M.num(roots[0])))} and ${ml(M.eq(M.mi("x"), M.num(roots[1])))}`)
      ],
      solution: [
        `det A(x) = x(x ${p < 0 ? "−" : "+"} ${Math.abs(p)}) − ${b}·${cEntry} = x² ${p < 0 ? "−" : "+"} ${Math.abs(p)}x ${q < 0 ? "−" : "+"} ${Math.abs(q)}.`,
        `Setting that to zero: the roots are x = ${roots[0]} and x = ${roots[1]}.`
      ],
      selfCheck: () => {
        const det = (x) => x * (x + p) - b * cEntry;
        return Math.abs(det(r)) < 1e-9 && Math.abs(det(s)) < 1e-9 ? null : "det-equation mismatch";
      }
    };
  }

  // L4 · a determinant inequality. Corpus: 2025 iunie II.1.c) — the corpus ceiling.
  function detInequality(rng) {
    const r = rng.int(-6, 2);
    const s = rng.int(r + 1, 6);
    const p = -(r + s);
    const q = r * s;
    const b = rng.nz(-4, 4);
    const k = rng.int(-3, 3);                     // right-hand side
    const constant = q + k;                       // det = x² + px + (q + k), inequality ≤ k
    if (constant % b !== 0) return null;
    const cEntry = -constant / b;
    const Ax = M.matrix([[M.mi("x"), M.num(b)], [M.num(cEntry), M.linear(1, p)]]);
    return {
      shape: "det-inequality",
      prompt: `The matrix ${ml(M.eq(M.call("A", M.mi("x")), Ax))} is given, where ${ml(M.mi("x"))} is a real number. Find all real ${ml(M.mi("x"))} for which ${ml(M.le(M.row(M.mi("det"), M.mo("⁡"), M.paren(M.call("A", M.mi("x")))), M.num(k)))}.`,
      parts: [
        part(`The inequality becomes ${ml(M.le(M.row(M.sup(M.mi("x"), M.mn(2)), M.mo("+"), M.mi("p"), M.mi("x"), M.mo("+"), M.mi("c")), M.mn(0)))}. What is ${ml(M.mi("c"))}?`,
          3, num(q), `${ml(M.eq(M.row(M.mi("det"), M.mo("⁡"), M.paren(M.call("A", M.mi("x")))), M.poly([[1, 2], [p, 1], [constant, 0]])))}, so the inequality is ${ml(M.le(M.poly([[1, 2], [p, 1], [q, 0]]), M.mn(0)))}`),
        part(`Now the set of solutions, as an interval.`, 2,
          { type: "interval", parts: [{ lo: r, hi: s, openLo: false, openHi: false }] },
          `${ml(M.in(M.mi("x"), M.interval(M.num(r), M.num(s), false, false)))}`,
          { placeholder: "for example [-3,1]" })
      ],
      solution: [
        `det A(x) = x(x ${p < 0 ? "−" : "+"} ${Math.abs(p)}) − ${b}·${cEntry} = x² ${p < 0 ? "−" : "+"} ${Math.abs(p)}x ${constant < 0 ? "−" : "+"} ${Math.abs(constant)}.`,
        `The condition det A(x) ≤ ${k} is x² ${p < 0 ? "−" : "+"} ${Math.abs(p)}x ${q < 0 ? "−" : "+"} ${Math.abs(q)} ≤ 0.`,
        `That quadratic has roots ${r} and ${s} and opens upwards, so it is ≤ 0 exactly between them: x ∈ [${r}, ${s}].`,
        `A quadratic with a positive leading coefficient is negative *between* its roots — sketching the parabola is faster than a sign table.`
      ],
      selfCheck: () => {
        const det = (x) => x * (x + p) - b * cEntry;
        const inside = det((r + s) / 2) <= k;
        const outside = det(s + 1) > k && det(r - 1) > k;
        return inside && outside ? null : "det-inequality mismatch";
      }
    };
  }

  // L4 · a 3×3 determinant.
  function det3Numeric(rng) {
    const rows = [
      [rng.nz(-4, 5), rng.int(-3, 4), rng.int(-3, 4)],
      [rng.int(-3, 4), rng.nz(-4, 5), rng.int(-3, 4)],
      [rng.int(-3, 4), rng.int(-3, 4), rng.nz(-4, 5)]
    ];
    const [a, b, c] = rows[0], [d, e, f] = rows[1], [g, h, i] = rows[2];
    const minor = e * i - f * h;
    const value = a * minor - b * (d * i - f * g) + c * (d * h - e * g);
    if (Math.abs(value) > 300 || value === 0) return null;
    return {
      shape: "det3-numeric",
      prompt: `Calculate the determinant ${ml(M.detBars(rows.map((row) => row.map((v) => M.num(v)))))}.`,
      parts: [
        part(`Expanding along the first row, what is the 2×2 minor that multiplies ${ml(M.num(a))}?`,
          3, num(minor), `${ml(M.eq(M.detBars([[M.num(e), M.num(f)], [M.num(h), M.num(i)]]), M.num(minor)))}`),
        part(`Now the whole determinant.`, 2, num(value), `the determinant is ${value}`)
      ],
      solution: [
        `Expand along the first row: Δ = ${a}·|${e} ${f}; ${h} ${i}| − ${b}·|${d} ${f}; ${g} ${i}| + ${c}·|${d} ${e}; ${g} ${h}|.`,
        `The three minors are ${minor}, ${d * i - f * g} and ${d * h - e * g}.`,
        `Δ = ${a}·${minor} − ${b}·${d * i - f * g} + ${c}·${d * h - e * g} = ${value}. Watch the minus sign in the middle — that is where most marks are lost.`
      ],
      selfCheck: () => {
        const sarrus = a * e * i + b * f * g + c * d * h - c * e * g - a * f * h - b * d * i;
        return sarrus === value ? null : "det3 mismatch";
      }
    };
  }

  // L5 · a 3×3 determinant with a parameter.
  function det3Parameter(rng) {
    const k = rng.nz(-4, 4);
    const p = rng.nz(-3, 3);
    const q = rng.nz(-3, 4);
    // Δ(a) = k·a + m by construction: keep the parameter in one entry only.
    const rows = [
      [M.mi("a"), M.num(p), M.mn(0)],
      [M.mn(0), M.num(q), M.num(k)],
      [M.mn(1), M.mn(0), M.mn(1)]
    ];
    // Δ = a(q·1 − k·0) − p(0·1 − k·1) + 0 = aq + pk
    const coefficient = q;
    const constant = p * k;
    const target = rng.int(-20, 20);
    const solution = F(target - constant, coefficient);
    if (!looksTidy(solution, { denoms: [1, 2, 3, 4] })) return null;
    return {
      shape: "det3-parameter",
      prompt: `Find the real number ${ml(M.mi("a"))} for which ${ml(M.eq(M.detBars(rows), M.num(target)))}.`,
      parts: [
        part(`Expand the determinant. What is the coefficient of ${ml(M.mi("a"))} in it?`, 3, num(coefficient),
          `${ml(M.eq(M.mi("Δ"), M.row(M.num(coefficient), M.mi("a"), M.mo(constant < 0 ? M.MINUS : "+"), M.mn(Math.abs(constant)))))}`),
        part(`Now ${ml(M.mi("a"))}.`, 2, num(solution), `${ml(M.eq(M.mi("a"), M.num(solution)))}`)
      ],
      solution: [
        `Expanding along the first row: Δ = a·(${q}·1 − ${k}·0) − ${p}·(0·1 − ${k}·1) + 0 = ${q}a + ${p * k}.`,
        `Setting Δ = ${target}: ${q}a = ${target - constant}, so a = ${ml(M.num(solution))}.`,
        `Choosing a row or column with zeros in it is what keeps a 3×3 determinant short.`
      ],
      selfCheck: () => Math.abs(coefficient * solution.value + constant - target) < 1e-9 ? null : "det3-parameter mismatch"
    };
  }

  // L5 · a matrix equation AX = B.
  function matrixEquation(rng) {
    const A = [rng.nz(-4, 4), rng.int(-3, 3), rng.int(-3, 3), rng.nz(-4, 4)];
    const detA = detOf(A[0], A[1], A[2], A[3]);
    if (detA === 0 || Math.abs(detA) > 12) return null;
    const X = [rng.nz(-4, 4), rng.int(-4, 4)];          // a column, to keep it typeable
    const B = [A[0] * X[0] + A[1] * X[1], A[2] * X[0] + A[3] * X[1]];
    if (B.some((value) => Math.abs(value) > 40)) return null;
    return {
      shape: "matrix-equation",
      prompt: `Solve the matrix equation ${ml(M.eq(M.row(mat(A[0], A[1], A[2], A[3]), M.mo(M.CDOT), M.matrix([[M.mi("x")], [M.mi("y")]])), M.matrix([[M.num(B[0])], [M.num(B[1])]])))}.`,
      parts: [
        part(`What is the determinant of the matrix on the left?`, 3, num(detA),
          `${ml(M.eq(M.mi("Δ"), M.num(detA)))}, which is not zero, so the system has one solution`),
        part(`Now ${ml(M.mi("x"))} and ${ml(M.mi("y"))}, separated by a comma.`, 2,
          { type: "pair", values: X }, `${ml(M.eq(M.mi("x"), M.num(X[0])))}, ${ml(M.eq(M.mi("y"), M.num(X[1])))}`)
      ],
      solution: [
        `Written out, the equation is the system ${A[0]}x ${A[1] < 0 ? "−" : "+"} ${Math.abs(A[1])}y = ${B[0]} and ${A[2]}x ${A[3] < 0 ? "−" : "+"} ${Math.abs(A[3])}y = ${B[1]}.`,
        `Δ = ${detA} ≠ 0, so there is exactly one solution.`,
        `Cramer: x = Δ_x/Δ = ${X[0]}, y = Δ_y/Δ = ${X[1]}.`
      ],
      selfCheck: () => A[0] * X[0] + A[1] * X[1] === B[0] && A[2] * X[0] + A[3] * X[1] === B[1]
        ? null : "matrix-equation mismatch"
    };
  }

  // L5 · a 2×2 system solved by Cramer's rule.
  function cramerSystem(rng) {
    const a = rng.nz(-5, 5), b = rng.nz(-5, 5), c = rng.nz(-5, 5), d = rng.nz(-5, 5);
    const delta = detOf(a, b, c, d);
    if (delta === 0) return null;
    const x = rng.nz(-5, 5), y = rng.nz(-5, 5);
    const e = a * x + b * y;
    const f = c * x + d * y;
    if (Math.abs(e) > 50 || Math.abs(f) > 50) return null;
    const deltaX = detOf(e, b, f, d);
    return {
      shape: "cramer",
      prompt: `Solve the system ${ml(M.row(M.mo("{", 'stretchy="true"'), `<mtable columnalign="left"><mtr><mtd>${M.row(M.eq(M.row(M.poly([[a, 1]], "x"), M.mo(b < 0 ? M.MINUS : "+"), M.poly([[Math.abs(b), 1]], "y")), M.num(e)))}</mtd></mtr><mtr><mtd>${M.row(M.eq(M.row(M.poly([[c, 1]], "x"), M.mo(d < 0 ? M.MINUS : "+"), M.poly([[Math.abs(d), 1]], "y")), M.num(f)))}</mtd></mtr></mtable>`))} using determinants.`,
      parts: [
        part(`What is ${ml(M.mi("Δ"))}, the determinant of the coefficients?`, 2, num(delta),
          `${ml(M.eq(M.mi("Δ"), M.num(delta)))}`),
        part(`Now ${ml(M.mi("x"))} and ${ml(M.mi("y"))}, separated by a comma.`, 3, { type: "pair", values: [x, y] },
          `${ml(M.eq(M.mi("x"), M.num(x)))}, ${ml(M.eq(M.mi("y"), M.num(y)))}`)
      ],
      solution: [
        `Δ = |${a} ${b}; ${c} ${d}| = ${delta}.`,
        `Δ_x replaces the x column by the right-hand side: Δ_x = ${deltaX}, so x = ${deltaX}/${delta} = ${x}.`,
        `Substituting back gives y = ${y}.`
      ],
      selfCheck: () => a * x + b * y === e && c * x + d * y === f ? null : "cramer mismatch"
    };
  }

  /* ====================================================================== */
  /*  composition — Subiectul II.2                                          */
  /* ====================================================================== */

  const composition = {
    id: "composition",
    name: "Laws of composition",
    blurb: "x ∗ y rules: computing, solving, the identity element, inverses.",
    slot: "II.2",
    levels: {
      1: [compCompute, compComputeSum],
      2: [compSolveLinear, compSymmetric],
      3: [compSolveMultiple, compIdentity],
      4: [compFactorPairs, compInequality],
      5: [compInverse, compExponential]
    }
  };

  // The law is always x ∗ y = xy − c(x + y) + c² + k, i.e. (x − c)(y − c) + k.
  // Corpus laws all fit this: 2025 specială has c = 8, k = −56.
  function makeLaw(rng, options = {}) {
    const c = options.c ?? rng.nz(-8, 8);
    const k = options.k ?? rng.nz(-9, 9);
    const linear = -c;
    const constant = c * c + k;
    const apply = (x, y) => x * y + linear * (x + y) + constant;
    const bodyML = M.row(
      M.mi("x"), M.mi("y"),
      M.mo(linear < 0 ? M.MINUS : "+"), M.mn(Math.abs(linear)), M.paren(M.row(M.mi("x"), M.mo("+"), M.mi("y"))),
      ...(constant === 0 ? [] : [M.mo(constant < 0 ? M.MINUS : "+"), M.mn(Math.abs(constant))])
    );
    const lawML = M.eq(M.row(M.mi("x"), M.mo("∗"), M.mi("y")), bodyML);
    return { c, k, linear, constant, apply, lawML, bodyML };
  }

  const lawIntro = (law) =>
    `On the set of real numbers the law of composition ${ml(law.lawML)} is defined.`;

  /** "x − 8" or "x + 9" — never "x − −9". */
  const shiftText = (name, c) => (c < 0 ? `${name} + ${Math.abs(c)}` : `${name} − ${c}`);
  const signed = (value) => String(value).replace(/^-/, "−");

  // L1 · compute one value. Corpus: every II.2.a).
  function compCompute(rng) {
    const law = makeLaw(rng);
    const x = rng.int(-6, 8);
    const y = rng.int(-6, 8);
    const value = law.apply(x, y);
    if (Math.abs(value) > 200) return null;
    return {
      shape: "comp-compute",
      prompt: `${lawIntro(law)} Calculate ${ml(M.row(M.num(x), M.mo("∗"), M.num(y)))}.`,
      parts: [
        part(`What is ${ml(M.row(M.num(x), M.mo(M.CDOT), M.num(y)))}?`, 2, num(x * y), `${x}·${y} = ${x * y}`),
        part(`Now ${ml(M.row(M.num(x), M.mo("∗"), M.num(y)))}.`, 3, num(value),
          `${ml(M.eq(M.row(M.num(x), M.mo("∗"), M.num(y)), M.num(value)))}`)
      ],
      solution: [
        `Substitute x = ${x} and y = ${y} into the rule.`,
        `${x}·${y} ${law.linear < 0 ? "−" : "+"} ${Math.abs(law.linear)}·(${x} + ${y}) ${law.constant < 0 ? "−" : "+"} ${Math.abs(law.constant)} = ${value}.`
      ],
      selfCheck: () => law.apply(x, y) === value ? null : "comp-compute mismatch"
    };
  }

  // L1 · two values added.
  function compComputeSum(rng) {
    const law = makeLaw(rng);
    const x = rng.int(-5, 6);
    const y = rng.int(-5, 6);
    const first = law.apply(x, y);
    const second = law.apply(y, x);
    if (Math.abs(first) > 150) return null;
    return {
      shape: "comp-compute-sum",
      prompt: `${lawIntro(law)} Calculate ${ml(M.row(M.paren(M.row(M.num(x), M.mo("∗"), M.num(y))), M.mo("+"), M.paren(M.row(M.num(y), M.mo("∗"), M.num(x)))))}.`,
      parts: [
        part(`What is ${ml(M.row(M.num(x), M.mo("∗"), M.num(y)))}?`, 3, num(first), `${ml(M.eq(M.row(M.num(x), M.mo("∗"), M.num(y)), M.num(first)))}`),
        part(`Now the whole expression.`, 2, num(first + second), `the value is ${first + second}`)
      ],
      solution: [
        `${x} ∗ ${y} = ${first}.`,
        `The rule treats x and y the same way, so ${y} ∗ ${x} = ${second} as well — the law is commutative.`,
        `The total is ${first + second}.`
      ],
      selfCheck: () => law.apply(x, y) === law.apply(y, x) ? null : "commutativity broken"
    };
  }

  // L2 · x ∗ k = c.
  function compSolveLinear(rng) {
    const law = makeLaw(rng);
    const k = rng.int(-6, 8);
    if (k + law.linear === 0) return null;             // would remove x entirely
    const x = rng.int(-8, 9);
    const target = law.apply(x, k);
    if (Math.abs(target) > 200) return null;
    return {
      shape: "comp-solve-linear",
      prompt: `${lawIntro(law)} Find the real number ${ml(M.mi("x"))} for which ${ml(M.eq(M.row(M.mi("x"), M.mo("∗"), M.num(k)), M.num(target)))}.`,
      parts: [
        part(`Written out, ${ml(M.row(M.mi("x"), M.mo("∗"), M.num(k)))} is ${ml(M.row(M.mi("a"), M.mi("x"), M.mo("+"), M.mi("b")))}. What is ${ml(M.mi("a"))}?`,
          2, num(k + law.linear), `${ml(M.eq(M.mi("a"), M.num(k + law.linear)))}`),
        part(`Now ${ml(M.mi("x"))}.`, 3, num(x), `${ml(M.eq(M.mi("x"), M.num(x)))}`)
      ],
      solution: [
        `x ∗ ${k} = ${k}x ${law.linear < 0 ? "−" : "+"} ${Math.abs(law.linear)}(x + ${k}) ${law.constant < 0 ? "−" : "+"} ${Math.abs(law.constant)} = ${k + law.linear}x + ${law.linear * k + law.constant}.`,
        `Setting that equal to ${target}: ${k + law.linear}x = ${target - (law.linear * k + law.constant)}, so x = ${x}.`
      ],
      selfCheck: () => law.apply(x, k) === target ? null : "comp-solve mismatch"
    };
  }

  // L2 · show the law is commutative on a pair, then in general.
  function compSymmetric(rng) {
    const law = makeLaw(rng);
    const x = rng.int(-5, 7);
    const y = rng.int(-5, 7);
    if (x === y) return null;
    return {
      shape: "comp-symmetric",
      prompt: `${lawIntro(law)} Show that ${ml(M.eq(M.row(M.mi("x"), M.mo("∗"), M.mi("y")), M.row(M.mi("y"), M.mo("∗"), M.mi("x"))))} for all real ${ml(M.mi("x"))} and ${ml(M.mi("y"))}, and check it with ${ml(M.mi("x"))} = ${ml(M.num(x))}, ${ml(M.mi("y"))} = ${ml(M.num(y))}.`,
      parts: [
        part(`What is ${ml(M.row(M.num(x), M.mo("∗"), M.num(y)))}?`, 3, num(law.apply(x, y)),
          `${ml(M.eq(M.row(M.num(x), M.mo("∗"), M.num(y)), M.num(law.apply(x, y))))}`),
        part(`And ${ml(M.row(M.num(y), M.mo("∗"), M.num(x)))}?`, 2, num(law.apply(y, x)), `the same value, ${law.apply(y, x)}`)
      ],
      solution: [
        `Swapping x and y in the rule gives yx ${law.linear < 0 ? "−" : "+"} ${Math.abs(law.linear)}(y + x) ${law.constant < 0 ? "−" : "+"} ${Math.abs(law.constant)}.`,
        `Multiplication and addition are both commutative, so this is the same expression: x ∗ y = y ∗ x for every x and y.`,
        `Checking: ${x} ∗ ${y} = ${law.apply(x, y)} and ${y} ∗ ${x} = ${law.apply(y, x)}. ✓`
      ],
      selfCheck: () => law.apply(x, y) === law.apply(y, x) ? null : "symmetry mismatch"
    };
  }

  // L3 · x ∗ k = mx. Corpus: 2025 model II.2.b), 2026 model II.2.b).
  function compSolveMultiple(rng) {
    const law = makeLaw(rng);
    const k = rng.int(-6, 8);
    const m = rng.int(2, 5);
    const slope = k + law.linear - m;
    if (slope === 0) return null;
    const constant = law.linear * k + law.constant;
    const x = F(-constant, slope);
    if (!looksTidy(x, { denoms: [1, 2, 3, 4, 5] })) return null;
    return {
      shape: "comp-solve-multiple",
      prompt: `${lawIntro(law)} Find the real number ${ml(M.mi("x"))} for which ${ml(M.eq(M.row(M.mi("x"), M.mo("∗"), M.num(k)), M.row(M.mn(m), M.mi("x"))))}.`,
      parts: [
        part(`Bringing everything to one side gives ${ml(M.eq(M.row(M.mi("a"), M.mi("x"), M.mo("+"), M.mi("b")), M.mn(0)))}. What is ${ml(M.mi("a"))}?`,
          3, num(slope), `${ml(M.eq(M.mi("a"), M.num(slope)))}`),
        part(`Now ${ml(M.mi("x"))}.`, 2, num(x), `${ml(M.eq(M.mi("x"), M.num(x)))}`)
      ],
      solution: [
        `x ∗ ${k} = ${k + law.linear}x ${constant < 0 ? "−" : "+"} ${Math.abs(constant)}.`,
        `The equation is ${k + law.linear}x ${constant < 0 ? "−" : "+"} ${Math.abs(constant)} = ${m}x, so ${slope}x = ${-constant}.`,
        `x = ${ml(M.num(x))}.`
      ],
      selfCheck: () => Math.abs(law.apply(x.value, k) - m * x.value) < 1e-9 ? null : "comp-multiple mismatch"
    };
  }

  // L3 · the identity element.
  function compIdentity(rng) {
    const c = rng.nz(-7, 7);
    const law = makeLaw(rng, { c, k: c });         // identity exists exactly when k = c
    const identity = c + 1;
    const test = rng.int(-5, 6);
    return {
      shape: "comp-identity",
      prompt: `${lawIntro(law)} Find the element ${ml(M.mi("e"))} for which ${ml(M.eq(M.row(M.mi("x"), M.mo("∗"), M.mi("e")), M.mi("x")))} for every real ${ml(M.mi("x"))}.`,
      parts: [
        part(`What is ${ml(M.mi("e"))}?`, 3, num(identity), `${ml(M.eq(M.mi("e"), M.num(identity)))}`),
        part(`Check it: what is ${ml(M.row(M.num(test), M.mo("∗"), M.mi("e")))}?`, 2, num(test),
          `${ml(M.eq(M.row(M.num(test), M.mo("∗"), M.num(identity)), M.num(test)))}`)
      ],
      solution: [
        `The rule factorises: x ∗ y = (${shiftText("x", c)})(${shiftText("y", c)}) ${c < 0 ? "−" : "+"} ${Math.abs(c)}.`,
        `So x ∗ e = (${shiftText("x", c)})(${shiftText("e", c)}) ${c < 0 ? "−" : "+"} ${Math.abs(c)} = x needs (${shiftText("x", c)})(${shiftText("e", c)}) = ${shiftText("x", c)} for every x, that is ${shiftText("e", c)} = 1.`,
        `e = ${signed(identity)}.`,
        `Spotting the factorised form is the whole question; grinding it out with a general x works too but takes three times as long.`
      ],
      selfCheck: () => {
        const values = [-3, 0, 2, 7.5];
        return values.every((x) => Math.abs(law.apply(x, identity) - x) < 1e-9) ? null : "identity mismatch";
      }
    };
  }

  // L4 · natural-number pairs. Corpus: 2025 specială II.2.c) — the corpus ceiling.
  function compFactorPairs(rng) {
    const c = rng.nz(-9, 9);
    const k = rng.nz(-9, 9);
    const law = makeLaw(rng, { c, k });
    const products = [6, 8, 10, 12, 15, 16, 18, 20, 24];
    const product = rng.pick(products);
    const target = product + k;
    const pairs = [];
    for (let m = 1; m * m < product; m += 1) {
      if (product % m === 0) pairs.push([m, product / m]);
    }
    if (!pairs.length) return null;
    const answer = pairs.length;
    return {
      shape: "comp-factor-pairs",
      prompt: `${lawIntro(law)} Find the pairs ${ml(M.row(M.mo("("), M.mi("m"), M.mo(","), M.mi("n"), M.mo(")")))} of natural numbers with ${ml(M.lt(M.mi("m"), M.mi("n")))} for which ${ml(M.eq(M.row(M.paren(M.row(M.num(c), M.mo("+"), M.mi("m"))), M.mo("∗"), M.paren(M.row(M.num(c), M.mo("+"), M.mi("n")))), M.num(target)))}.`,
      parts: [
        part(`The law factorises as ${ml(M.row(M.paren(M.row(M.mi("x"), M.mo(c < 0 ? "+" : M.MINUS), M.mn(Math.abs(c)))), M.paren(M.row(M.mi("y"), M.mo(c < 0 ? "+" : M.MINUS), M.mn(Math.abs(c)))), M.mo(k < 0 ? M.MINUS : "+"), M.mn(Math.abs(k))))}. So what must ${ml(M.row(M.mi("m"), M.mi("n")))} equal?`,
          3, num(product), `${ml(M.eq(M.row(M.mi("m"), M.mi("n")), M.num(product)))}`),
        part(`How many such pairs are there?`, 2, num(answer),
          `${answer}: ${pairs.map(([m, n]) => `(${m}, ${n})`).join(", ")}`)
      ],
      solution: [
        `Every law of this shape factorises: x ∗ y = (${shiftText("x", c)})(${shiftText("y", c)}) ${k < 0 ? "−" : "+"} ${Math.abs(k)}.`,
        `With x = ${signed(c)} + m and y = ${signed(c)} + n the brackets are just m and n, so the equation becomes mn ${k < 0 ? "−" : "+"} ${Math.abs(k)} = ${signed(target)}, that is mn = ${product}.`,
        `The factor pairs of ${product} with m &lt; n are ${pairs.map(([m, n]) => `(${m}, ${n})`).join(", ")} — ${answer} of them.`
      ],
      selfCheck: () => pairs.every(([m, n]) => Math.abs(law.apply(c + m, c + n) - target) < 1e-9)
        ? null : "factor-pairs mismatch"
    };
  }

  // L4 · an inequality. Corpus: 2026 simulare II.2.c).
  function compInequality(rng) {
    const c = rng.nz(-8, 8);
    const k = rng.nz(-9, 9);
    const law = makeLaw(rng, { c, k });
    // n ∗ (−n) = −n² − c·0 + c² + k = −n² + c² + k
    const bound = c * c + k;
    const threshold = rng.int(bound - 30, bound - 1);
    const limit = bound - threshold;                    // n² ≤ limit
    if (limit <= 0) return null;
    const maxN = Math.floor(Math.sqrt(limit));
    if (maxN < 1 || maxN > 8) return null;
    const count = maxN + 1;                             // n = 0 … maxN
    return {
      shape: "comp-inequality",
      prompt: `${lawIntro(law)} Find the natural numbers ${ml(M.mi("n"))} for which ${ml(M.ge(M.row(M.mi("n"), M.mo("∗"), M.paren(M.row(M.mo(M.MINUS), M.mi("n")))), M.num(threshold)))}.`,
      parts: [
        part(`Work out ${ml(M.row(M.mi("n"), M.mo("∗"), M.paren(M.row(M.mo(M.MINUS), M.mi("n")))))}: it is ${ml(M.row(M.mo(M.MINUS), M.sup(M.mi("n"), M.mn(2)), M.mo("+"), M.mi("t")))}. What is ${ml(M.mi("t"))}?`,
          3, num(bound), `${ml(M.eq(M.row(M.mi("n"), M.mo("∗"), M.paren(M.row(M.mo(M.MINUS), M.mi("n")))), M.row(M.mo(M.MINUS), M.sup(M.mi("n"), M.mn(2)), M.mo(bound < 0 ? M.MINUS : "+"), M.mn(Math.abs(bound)))))}`),
        part(`What is the largest natural number ${ml(M.mi("n"))} that works?`, 2, num(maxN),
          `${ml(M.le(M.sup(M.mi("n"), M.mn(2)), M.mn(limit)))}, so ${ml(M.eq(M.sub(M.mi("n"), M.mi("max")), M.mn(maxN)))}`)
      ],
      solution: [
        `n ∗ (−n) = n·(−n) ${law.linear < 0 ? "−" : "+"} ${Math.abs(law.linear)}(n + (−n)) ${law.constant < 0 ? "−" : "+"} ${Math.abs(law.constant)} = −n² ${bound < 0 ? "−" : "+"} ${Math.abs(bound)}.`,
        `The middle term dies because n + (−n) = 0 — that is the point of choosing −n.`,
        `The condition is −n² ${bound < 0 ? "−" : "+"} ${Math.abs(bound)} ≥ ${threshold}, that is n² ≤ ${limit}.`,
        `So n ∈ {0, 1, …, ${maxN}} — ${count} natural numbers, the largest being ${maxN}.`
      ],
      selfCheck: () => law.apply(maxN, -maxN) >= threshold && law.apply(maxN + 1, -(maxN + 1)) < threshold
        ? null : "comp-inequality mismatch"
    };
  }

  // L5 · the inverse of an element.
  function compInverse(rng) {
    const c = rng.nz(-6, 6);
    const law = makeLaw(rng, { c, k: c });
    // offset 1 would make x the identity element, whose inverse is itself —
    // true, but a question that teaches nothing.
    const offset = rng.pick([-1, 2, -2, 3, 4, -4, 5]);
    const x = c + offset;
    const inverse = c + 1 / offset;
    if (!looksTidy(F(Math.round(inverse * 4), 4), { denoms: [1, 2, 4] })) return null;
    const identity = c + 1;
    return {
      shape: "comp-inverse",
      prompt: `${lawIntro(law)} Its identity element is ${ml(M.eq(M.mi("e"), M.num(identity)))}. Find the inverse of ${ml(M.num(x))} — the number ${ml(M.mi("y"))} with ${ml(M.eq(M.row(M.num(x), M.mo("∗"), M.mi("y")), M.mi("e")))}.`,
      parts: [
        part(`In factorised form the equation is ${ml(M.eq(M.row(M.num(offset), M.paren(M.row(M.mi("y"), M.mo(c < 0 ? "+" : M.MINUS), M.mn(Math.abs(c))))), M.mn(1)))}. What is ${ml(M.row(M.mi("y"), M.mo(c < 0 ? "+" : M.MINUS), M.mn(Math.abs(c))))}?`,
          3, num(F(1, offset)), `${ml(M.num(F(1, offset)))}`),
        part(`Now ${ml(M.mi("y"))}.`, 2, num(inverse), `${ml(M.eq(M.mi("y"), M.num(F(c * offset + 1, offset))))}`)
      ],
      solution: [
        `x ∗ y = (${shiftText("x", c)})(${shiftText("y", c)}) ${c < 0 ? "−" : "+"} ${Math.abs(c)}, and e = ${signed(identity)}.`,
        `So (${signed(x)} ${c < 0 ? "+" : "−"} ${Math.abs(c)})(${shiftText("y", c)}) ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${signed(identity)}, that is ${signed(offset)}(${shiftText("y", c)}) = 1.`,
        `${shiftText("y", c)} = ${ml(M.num(F(1, offset)))}, so y = ${ml(M.num(F(c * offset + 1, offset)))}.`,
        `Every element except x = ${signed(c)} has an inverse — that one would need a bracket of 0 to equal 1.`
      ],
      selfCheck: () => Math.abs(law.apply(x, inverse) - identity) < 1e-9 ? null : "inverse mismatch"
    };
  }

  // L5 · the law applied to powers. Corpus: 2026 model II.2.c).
  function compExponential(rng) {
    const base = rng.pick([2, 3]);
    const c = rng.nz(-6, 6);
    const law = makeLaw(rng, { c, k: c });
    // 2^x ∗ 2^y = (2^x − c)(2^y − c) + c; ask for x with 2^x ∗ (c + 1) = 2^x.
    // The identity is c + 1, so any x works — instead use: 2^x ∗ m = value.
    const m = c + rng.pick([2, 3, 4]);
    const offset = m - c;
    const exponent = rng.int(1, 5);
    const power = Math.pow(base, exponent);
    const value = law.apply(power, m);
    if (Math.abs(value) > 5000) return null;
    return {
      shape: "comp-exponential",
      prompt: `${lawIntro(law)} Find the real number ${ml(M.mi("x"))} for which ${ml(M.eq(M.row(M.sup(M.mn(base), M.mi("x")), M.mo("∗"), M.num(m)), M.num(value)))}.`,
      parts: [
        part(`In factorised form the equation is ${ml(M.eq(M.row(M.num(offset), M.paren(M.row(M.sup(M.mn(base), M.mi("x")), M.mo(c < 0 ? "+" : M.MINUS), M.mn(Math.abs(c))))), M.mi("t")))}. What is ${ml(M.mi("t"))}?`,
          3, num(value - c), `${ml(M.eq(M.mi("t"), M.num(value - c)))}`),
        part(`Now ${ml(M.mi("x"))}.`, 2, num(exponent), `${ml(M.eq(M.sup(M.mn(base), M.mi("x")), M.mn(power)))}, so ${ml(M.eq(M.mi("x"), M.mn(exponent)))}`)
      ],
      solution: [
        `x ∗ y = (${shiftText("x", c)})(${shiftText("y", c)}) ${c < 0 ? "−" : "+"} ${Math.abs(c)}, so ${base}<sup>x</sup> ∗ ${signed(m)} = (${shiftText(`${base}<sup>x</sup>`, c)})·${signed(offset)} ${c < 0 ? "−" : "+"} ${Math.abs(c)}.`,
        `Setting that equal to ${signed(value)}: ${signed(offset)}(${shiftText(`${base}<sup>x</sup>`, c)}) = ${signed(value - c)}, so ${shiftText(`${base}<sup>x</sup>`, c)} = ${signed((value - c) / offset)}.`,
        `${base}<sup>x</sup> = ${power} = ${base}<sup>${exponent}</sup>, so x = ${exponent}.`
      ],
      selfCheck: () => Math.abs(law.apply(power, m) - value) < 1e-9 ? null : "comp-exponential mismatch"
    };
  }

  /* ====================================================================== */
  /*  polynomials — Subiectul II.2 (alternate)                              */
  /* ====================================================================== */

  const polynomials = {
    id: "polynomials",
    name: "Polynomials",
    blurb: "Cubics: values, roots, Viète's relations, remainders and factors.",
    slot: "II.2",
    levels: {
      1: [polyEvaluate, polyCoefficient],
      2: [polyFindM, polyRemainder],
      3: [polyViete, polyRootGiven],
      4: [polyVieteCondition, polyDivisibility],
      5: [polySumSquares, polyFactorQuadratic]
    }
  };

  const cubicML = (a, b, c, useM = false) => M.row(
    M.sup(M.mi("X"), M.mn(3)),
    ...(a === 0 ? [] : [M.mo(a < 0 ? M.MINUS : "+"), ...(Math.abs(a) === 1 ? [] : [M.mn(Math.abs(a))]), M.sup(M.mi("X"), M.mn(2))]),
    ...(b === 0 ? [] : [M.mo(b < 0 ? M.MINUS : "+"), ...(Math.abs(b) === 1 ? [] : [M.mn(Math.abs(b))]), M.mi("X")]),
    ...(useM ? [M.mo("+"), M.mi("m")] : (c === 0 ? [] : [M.mo(c < 0 ? M.MINUS : "+"), M.mn(Math.abs(c))]))
  );

  const polyIntro = (body) => `The polynomial ${ml(M.eq(M.mi("f"), body))} is given`;

  // L1 · evaluate.
  function polyEvaluate(rng) {
    const a = rng.int(-4, 4), b = rng.int(-6, 6), c = rng.int(-8, 8);
    const t = rng.int(-3, 3);
    const value = t * t * t + a * t * t + b * t + c;
    if (Math.abs(value) > 120) return null;
    return {
      shape: "poly-evaluate",
      prompt: `${polyIntro(cubicML(a, b, c))}. Calculate ${ml(M.call("f", M.num(t)))}.`,
      parts: [
        part(`What is ${ml(M.sup(M.paren(M.num(t)), M.mn(3)))}?`, 2, num(t * t * t), `(${t})³ = ${t * t * t}`),
        part(`Now ${ml(M.call("f", M.num(t)))}.`, 3, num(value), `${ml(M.eq(M.call("f", M.num(t)), M.num(value)))}`)
      ],
      solution: [
        `Substitute X = ${t}: (${t})³ ${a < 0 ? "−" : "+"} ${Math.abs(a)}(${t})² ${b < 0 ? "−" : "+"} ${Math.abs(b)}(${t}) ${c < 0 ? "−" : "+"} ${Math.abs(c)}.`,
        `= ${t * t * t} ${a * t * t < 0 ? "−" : "+"} ${Math.abs(a * t * t)} ${b * t < 0 ? "−" : "+"} ${Math.abs(b * t)} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${value}.`
      ],
      selfCheck: () => t ** 3 + a * t * t + b * t + c === value ? null : "poly-evaluate mismatch"
    };
  }

  // L1 · read off a coefficient as a Viète sum.
  function polyCoefficient(rng) {
    const a = rng.nz(-5, 5), b = rng.nz(-6, 6), c = rng.nz(-8, 8);
    return {
      shape: "poly-coefficient",
      prompt: `${polyIntro(cubicML(a, b, c))}, with roots ${ml(M.sub(M.mi("x"), M.mn(1)))}, ${ml(M.sub(M.mi("x"), M.mn(2)))} and ${ml(M.sub(M.mi("x"), M.mn(3)))}. Find their sum.`,
      parts: [
        part(`What is the coefficient of ${ml(M.sup(M.mi("X"), M.mn(2)))}?`, 2, num(a), `it is ${a}`),
        part(`Now ${ml(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2)), M.mo("+"), M.sub(M.mi("x"), M.mn(3))))}.`,
          3, num(-a), `${ml(M.eq(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2)), M.mo("+"), M.sub(M.mi("x"), M.mn(3))), M.num(-a)))}`)
      ],
      solution: [
        `For X³ + aX² + bX + c the first of Viète's relations is x₁ + x₂ + x₃ = −a.`,
        `Here a = ${a}, so the sum is ${-a}. The sign is the part people drop.`
      ],
      selfCheck: () => -a === -a ? null : null
    };
  }

  // L2 · find m so that a given number is a root. Corpus: 2025 iunie II.2.a).
  function polyFindM(rng) {
    const a = rng.int(-4, 4), b = rng.int(-6, 6);
    const root = rng.pick([-2, -1, 1, 2, 3]);
    const m = -(root ** 3 + a * root * root + b * root);
    if (Math.abs(m) > 60) return null;
    return {
      shape: "poly-find-m",
      prompt: `${polyIntro(cubicML(a, b, 0, true))}, where ${ml(M.mi("m"))} is a real number. Find ${ml(M.mi("m"))} for which ${ml(M.eq(M.call("f", M.num(root)), M.mn(0)))}.`,
      parts: [
        part(`What is ${ml(M.call("f", M.num(root)))} in terms of ${ml(M.mi("m"))}? Give the part without ${ml(M.mi("m"))}.`,
          2, num(-m), `${ml(M.eq(M.call("f", M.num(root)), M.row(M.num(-m), M.mo("+"), M.mi("m"))))}`),
        part(`Now ${ml(M.mi("m"))}.`, 3, num(m), `${ml(M.eq(M.mi("m"), M.num(m)))}`)
      ],
      solution: [
        `f(${root}) = (${root})³ ${a < 0 ? "−" : "+"} ${Math.abs(a)}(${root})² ${b < 0 ? "−" : "+"} ${Math.abs(b)}(${root}) + m = ${-m} + m.`,
        `Setting f(${root}) = 0 gives m = ${m}.`
      ],
      selfCheck: () => root ** 3 + a * root * root + b * root + m === 0 ? null : "poly-find-m mismatch"
    };
  }

  // L2 · the remainder theorem.
  function polyRemainder(rng) {
    const a = rng.int(-4, 4), b = rng.int(-6, 6), c = rng.int(-8, 8);
    const t = rng.pick([-3, -2, -1, 1, 2, 3]);
    const value = t ** 3 + a * t * t + b * t + c;
    if (Math.abs(value) > 100) return null;
    return {
      shape: "poly-remainder",
      prompt: `${polyIntro(cubicML(a, b, c))}. Find the remainder when ${ml(M.mi("f"))} is divided by ${ml(M.row(M.mi("X"), M.mo(t < 0 ? "+" : M.MINUS), M.mn(Math.abs(t))))}.`,
      parts: [
        part(`Which value of ${ml(M.mi("X"))} makes the divisor zero?`, 2, num(t), `${ml(M.eq(M.mi("X"), M.num(t)))}`),
        part(`Now the remainder.`, 3, num(value), `${ml(M.eq(M.call("f", M.num(t)), M.num(value)))}`)
      ],
      solution: [
        `The remainder theorem: dividing by X − a leaves f(a).`,
        `Here a = ${t}, so the remainder is f(${t}) = ${value}.`,
        `No long division needed — one substitution does it.`
      ],
      selfCheck: () => t ** 3 + a * t * t + b * t + c === value ? null : "remainder mismatch"
    };
  }

  // L3 · all three Viète relations.
  function polyViete(rng) {
    const a = rng.nz(-5, 5), b = rng.nz(-7, 7), c = rng.nz(-9, 9);
    return {
      shape: "poly-viete",
      prompt: `${polyIntro(cubicML(a, b, c))}, with roots ${ml(M.sub(M.mi("x"), M.mn(1)))}, ${ml(M.sub(M.mi("x"), M.mn(2)))} and ${ml(M.sub(M.mi("x"), M.mn(3)))}. Find ${ml(M.row(M.sub(M.mi("x"), M.mn(1)), M.sub(M.mi("x"), M.mn(2)), M.sub(M.mi("x"), M.mn(3))))} and ${ml(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2)), M.mo("+"), M.sub(M.mi("x"), M.mn(3))))}.`,
      parts: [
        part(`What is the product ${ml(M.row(M.sub(M.mi("x"), M.mn(1)), M.sub(M.mi("x"), M.mn(2)), M.sub(M.mi("x"), M.mn(3))))}?`,
          3, num(-c), `${ml(M.eq(M.row(M.sub(M.mi("x"), M.mn(1)), M.sub(M.mi("x"), M.mn(2)), M.sub(M.mi("x"), M.mn(3))), M.num(-c)))}`),
        part(`And the sum?`, 2, num(-a), `${ml(M.eq(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2)), M.mo("+"), M.sub(M.mi("x"), M.mn(3))), M.num(-a)))}`)
      ],
      solution: [
        `For X³ + aX² + bX + c: x₁ + x₂ + x₃ = −a, x₁x₂ + x₁x₃ + x₂x₃ = b, x₁x₂x₃ = −c.`,
        `Here the product is −(${c}) = ${-c} and the sum is −(${a}) = ${-a}.`,
        `The signs alternate — that is the only thing to remember.`
      ],
      selfCheck: () => -c === -c ? null : null
    };
  }

  // L3 · a root is given, find another value. Corpus: 2025 august II.2.b).
  function polyRootGiven(rng) {
    const r = rng.pick([-3, -2, -1, 1, 2, 3]);
    const s = rng.pick([-3, -2, -1, 1, 2, 3, 4]);
    const t = rng.pick([-2, -1, 1, 2, 4]);
    if (r === s || s === t || r === t) return null;
    const a = -(r + s + t);
    const b = r * s + r * t + s * t;
    const c = -(r * s * t);
    if (Math.abs(b) > 20 || Math.abs(c) > 40) return null;
    const others = [s, t].sort((u, v) => u - v);
    return {
      shape: "poly-root-given",
      prompt: `${polyIntro(cubicML(a, b, c))}, and ${ml(M.eq(M.call("f", M.num(r)), M.mn(0)))}. Find the other two roots.`,
      parts: [
        part(`What is the sum of all three roots?`, 2, num(-a), `${ml(M.eq(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2)), M.mo("+"), M.sub(M.mi("x"), M.mn(3))), M.num(-a)))}`),
        part(`Now the other two roots, separated by a comma.`, 3, { type: "set", values: others },
          `${ml(M.num(others[0]))} and ${ml(M.num(others[1]))}`)
      ],
      solution: [
        `Since ${r} is a root, f = (X ${r < 0 ? "+" : "−"} ${Math.abs(r)})(X² ${a + r < 0 ? "−" : "+"} ${Math.abs(a + r)}X ${-c / r < 0 ? "−" : "+"} ${Math.abs(-c / r)}).`,
        `The quadratic factor has roots ${others[0]} and ${others[1]}.`,
        `Check with Viète: the three roots sum to ${r} + ${s} + ${t} = ${-a} = −a ✓, and multiply to ${r * s * t} = ${-c} ✓.`
      ],
      selfCheck: () => {
        const f = (x) => x ** 3 + a * x * x + b * x + c;
        return [r, s, t].every((root) => f(root) === 0) ? null : "root-given mismatch";
      }
    };
  }

  // L4 · a symmetric condition on the roots. Corpus: 2025 iunie II.2.b).
  function polyVieteCondition(rng) {
    const a = rng.nz(-5, 5);
    const b = rng.int(-6, 6);
    const k = rng.int(2, 4);
    // k(x₁ + x₂ + x₃) = t + x₁x₂x₃  with  Σ = −a  and  product = −m
    const m = rng.int(-12, 12);
    const t = k * (-a) - (-m);
    if (Math.abs(t) > 60) return null;
    return {
      shape: "poly-viete-condition",
      prompt: `${polyIntro(cubicML(a, b, 0, true))}, where ${ml(M.mi("m"))} is a real number, with roots ${ml(M.sub(M.mi("x"), M.mn(1)))}, ${ml(M.sub(M.mi("x"), M.mn(2)))} and ${ml(M.sub(M.mi("x"), M.mn(3)))}. Find ${ml(M.mi("m"))} for which ${ml(M.eq(M.row(M.mn(k), M.paren(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2)), M.mo("+"), M.sub(M.mi("x"), M.mn(3))))), M.row(M.num(t), M.mo("+"), M.sub(M.mi("x"), M.mn(1)), M.sub(M.mi("x"), M.mn(2)), M.sub(M.mi("x"), M.mn(3)))))}.`,
      parts: [
        part(`What is ${ml(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2)), M.mo("+"), M.sub(M.mi("x"), M.mn(3))))}?`,
          3, num(-a), `${ml(M.eq(M.row(M.sub(M.mi("x"), M.mn(1)), M.mo("+"), M.sub(M.mi("x"), M.mn(2)), M.mo("+"), M.sub(M.mi("x"), M.mn(3))), M.num(-a)))}, and ${ml(M.eq(M.row(M.sub(M.mi("x"), M.mn(1)), M.sub(M.mi("x"), M.mn(2)), M.sub(M.mi("x"), M.mn(3))), M.row(M.mo(M.MINUS), M.mi("m"))))}`),
        part(`Now ${ml(M.mi("m"))}.`, 2, num(m), `${ml(M.eq(M.mi("m"), M.num(m)))}`)
      ],
      solution: [
        `Viète on X³ ${a < 0 ? "−" : "+"} ${Math.abs(a)}X² ${b < 0 ? "−" : "+"} ${Math.abs(b)}X + m: the sum of the roots is ${-a} and their product is −m.`,
        `The condition becomes ${k}·${-a} = ${t} + (−m), that is ${k * -a} = ${t} − m.`,
        `m = ${m}.`,
        `Notice the roots themselves are never found — Viète turns a question about them into one about the coefficients.`
      ],
      selfCheck: () => k * (-a) === t + (-m) ? null : "viete-condition mismatch"
    };
  }

  // L4 · divisibility, from a remainder condition. Corpus: 2025 iunie II.2.c).
  function polyDivisibility(rng) {
    const a = rng.int(-4, 4), b = rng.int(-5, 5);
    const t = rng.pick([-2, 2, 3]);
    const m = rng.int(-10, 10);
    const remainder = t ** 3 + a * t * t + b * t + m;
    if (Math.abs(remainder) > 60) return null;
    const root = rng.pick([-2, -1, 1, 2]);
    const rootValue = root ** 3 + a * root * root + b * root + m;
    if (rootValue !== 0) return null;
    return {
      shape: "poly-divisibility",
      prompt: `${polyIntro(cubicML(a, b, 0, true))}, where ${ml(M.mi("m"))} is a real number. The remainder when ${ml(M.mi("f"))} is divided by ${ml(M.row(M.mi("X"), M.mo(t < 0 ? "+" : M.MINUS), M.mn(Math.abs(t))))} is ${ml(M.num(remainder))}. Find ${ml(M.mi("m"))}, then a root of ${ml(M.mi("f"))}.`,
      parts: [
        part(`What is ${ml(M.mi("m"))}?`, 3, num(m), `${ml(M.eq(M.call("f", M.num(t)), M.num(remainder)))} gives ${ml(M.eq(M.mi("m"), M.num(m)))}`),
        part(`Now give a root of ${ml(M.mi("f"))}.`, 2, num(root), `${ml(M.eq(M.call("f", M.num(root)), M.mn(0)))}`)
      ],
      solution: [
        `The remainder on dividing by X − ${t} is f(${t}) = ${t ** 3 + a * t * t + b * t} + m = ${remainder}.`,
        `So m = ${m}, and f = X³ ${a < 0 ? "−" : "+"} ${Math.abs(a)}X² ${b < 0 ? "−" : "+"} ${Math.abs(b)}X ${m < 0 ? "−" : "+"} ${Math.abs(m)}.`,
        `Trying the divisors of ${m === 0 ? "the constant term" : Math.abs(m)}: f(${root}) = 0, so X ${root < 0 ? "+" : "−"} ${Math.abs(root)} divides f.`
      ],
      selfCheck: () => {
        const f = (x) => x ** 3 + a * x * x + b * x + m;
        return f(t) === remainder && f(root) === 0 ? null : "divisibility mismatch";
      }
    };
  }

  // L5 · the sum of the squares of the roots.
  function polySumSquares(rng) {
    const a = rng.nz(-6, 6), b = rng.nz(-8, 8), c = rng.nz(-9, 9);
    const value = a * a - 2 * b;
    if (value < 0 || value > 100) return null;
    return {
      shape: "poly-sum-squares",
      prompt: `${polyIntro(cubicML(a, b, c))}, with roots ${ml(M.sub(M.mi("x"), M.mn(1)))}, ${ml(M.sub(M.mi("x"), M.mn(2)))} and ${ml(M.sub(M.mi("x"), M.mn(3)))}. Find ${ml(M.row(M.sup(M.sub(M.mi("x"), M.mn(1)), M.mn(2)), M.mo("+"), M.sup(M.sub(M.mi("x"), M.mn(2)), M.mn(2)), M.mo("+"), M.sup(M.sub(M.mi("x"), M.mn(3)), M.mn(2))))}.`,
      parts: [
        part(`What is ${ml(M.row(M.sub(M.mi("x"), M.mn(1)), M.sub(M.mi("x"), M.mn(2)), M.mo("+"), M.sub(M.mi("x"), M.mn(1)), M.sub(M.mi("x"), M.mn(3)), M.mo("+"), M.sub(M.mi("x"), M.mn(2)), M.sub(M.mi("x"), M.mn(3))))}?`,
          3, num(b), `${ml(M.eq(M.row(M.mo("∑"), M.sub(M.mi("x"), M.mi("i")), M.sub(M.mi("x"), M.mi("j"))), M.num(b)))}`),
        part(`Now the sum of the squares.`, 2, num(value),
          `${ml(M.eq(M.row(M.mo("∑"), M.sup(M.sub(M.mi("x"), M.mi("i")), M.mn(2))), M.num(value)))}`)
      ],
      solution: [
        `Viète: x₁ + x₂ + x₃ = ${-a} and x₁x₂ + x₁x₃ + x₂x₃ = ${b}.`,
        `Squaring the first: (x₁ + x₂ + x₃)² = Σx² + 2Σx_ix_j.`,
        `So Σx² = (${-a})² − 2·${b} = ${a * a} − ${2 * b} = ${value}.`
      ],
      selfCheck: () => a * a - 2 * b === value ? null : "sum-squares mismatch"
    };
  }

  // L5 · factor out a quadratic. Corpus: 2025 iunie II.2.c) second half.
  function polyFactorQuadratic(rng) {
    const root = rng.pick([-3, -2, 2, 3]);
    const k = rng.pick([1, 4, 9]);                 // f = (X − root)(X² + k)
    const a = -root;
    const b = k;
    const c = -root * k;
    return {
      shape: "poly-factor-quadratic",
      prompt: `${polyIntro(cubicML(a, b, c))}. Show that ${ml(M.mi("f"))} is divisible by ${ml(M.row(M.sup(M.mi("X"), M.mn(2)), M.mo("+"), M.mn(k)))}, and give the other factor's constant term.`,
      parts: [
        part(`${ml(M.mi("f"))} has one real root. What is it?`, 3, num(root), `${ml(M.eq(M.call("f", M.num(root)), M.mn(0)))}`),
        part(`Writing ${ml(M.eq(M.mi("f"), M.row(M.paren(M.row(M.mi("X"), M.mo(root < 0 ? "+" : M.MINUS), M.mn(Math.abs(root)))), M.paren(M.row(M.sup(M.mi("X"), M.mn(2)), M.mo("+"), M.mn(k))))))}, what is the constant term of the first bracket?`,
          2, num(-root), `${ml(M.num(-root))}`)
      ],
      solution: [
        `Group the terms: X³ ${a < 0 ? "−" : "+"} ${Math.abs(a)}X² + ${k}X ${c < 0 ? "−" : "+"} ${Math.abs(c)} = X²(X ${a < 0 ? "−" : "+"} ${Math.abs(a)}) + ${k}(X ${a < 0 ? "−" : "+"} ${Math.abs(a)}).`,
        `Both terms carry the factor (X ${a < 0 ? "−" : "+"} ${Math.abs(a)}), so f = (X ${a < 0 ? "−" : "+"} ${Math.abs(a)})(X² + ${k}).`,
        `X² + ${k} is never zero for real X, so the only real root is X = ${root}.`
      ],
      selfCheck: () => {
        const f = (x) => x ** 3 + a * x * x + b * x + c;
        return f(root) === 0 ? null : "factor-quadratic mismatch";
      }
    };
  }

  BAC.bankStructures = [matrices, composition, polynomials];
})(typeof window !== "undefined" ? window : globalThis);
