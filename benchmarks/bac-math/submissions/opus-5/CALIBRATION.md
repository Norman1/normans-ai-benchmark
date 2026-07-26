# Calibration against the corpus

Every level in this trainer is anchored on an item somebody actually sat. The
rule the brief sets is:

- **Level 4** = the hardest item the examiners have set in that topic.
- **Level 5** = one notch above that, still inside `programa-matematica-2026`.
- **Level 1** = the easiest thing that still counts as the topic.

Levels 2 and 3 fill the gap. Level 3 is roughly "a typical item at that
position on a typical paper", which is why exam mode draws most of Subiectul I
from level 2–3 and the c) parts of Subiectul II and III from level 4.

The corpus is the nine papers in `benchmarks/bac-math/exams/`: the 2024, 2025
and 2026 model papers, 2024 varianta 1, 2025 iunie varianta 1, 2025 specială
varianta 3, 2025 august varianta 9, the 2026 Bihor simulare, and the 2025
Sibiu aprilie simulare (barem only). The seven CNPEE papers are treated as the
authority on shape; the two county simulations are treated as evidence of what
is *in scope* but not of what is typical.

## Where each item on the paper comes from

The skeleton is remarkably stable across all nine papers:

| Slot | Topic | Seen in |
|---|---|---|
| I.1 | `numbers` (or `progressions`) | fraction arithmetic in 2024 model, 2024 v1, 2025 iunie, 2026 model, 2026 simulare; radicals in 2025 model; decimals in 2025 august; progression in 2025 specială |
| I.2 | `functions` | every paper, always `f(x) = ax + b` |
| I.3 | `equations` | every paper: exponential, radical or logarithmic |
| I.4 | `probability` or `percentages` | probability in 2024 model, 2024 v1, 2025 iunie, 2026 model; percentages in 2025 model, 2025 specială, 2025 august, 2026 simulare |
| I.5 | `geometry` | every paper |
| I.6 | `trigonometry` | every paper |
| II.1 | `matrices` | every paper |
| II.2 | `composition` or `polynomials` | composition in 5 of 7 CNPEE papers, polynomials in 2025 iunie and 2025 august |
| III.1 | `derivatives` | every paper |
| III.2 | `integrals` | every paper |

The brief describes II.2 as laws of composition. That is the majority case, but
two of the seven official papers in the corpus set polynomials there instead,
so both are in the bank and exam mode picks between them the way the examiners
do. A student who never met a Viète question would be caught out roughly one
year in three.

## Level 4 anchors, topic by topic

The item quoted is the hardest real one found in the corpus for that topic;
that is what level 4 generates variants of.

**numbers** — 2025 model I.1, arithmetic mixing surds that has to collapse to
an integer. Level 5 adds rationalising a denominator and logarithm arithmetic
(`programa` X: proprietăţi ale logaritmilor), still integer-valued.

**progressions** — 2025 specială I.1 is only `a₁, a₂ ⊢ a₃`, which is level 1
work; the topic is under-set in this corpus relative to its weight in the
`programa` (IX: termenul general, suma primilor n termeni). Level 4 is
therefore anchored on the syllabus rather than on a paper: find `n` from `Sₙ`,
and three-numbers-in-progression conditions. This is the one topic where the
corpus could not supply the ceiling, and it is flagged rather than hidden.

**functions** — 2025 iunie I.2, `f(2) = a + f(0)`: self-referential, the value
you are solving for also appears inside a function value. Level 4 moves to the
second-degree function the `programa` requires (vertex, Viète, sign); level 5
asks for a parameter making a condition on both roots hold.

**equations** — 2026 model I.3, `√(2x + 1) = x`: squaring introduces a root
that must be rejected. That rejection *is* the difficulty, and the barem awards
the last 2p for it. Level 5 is substitution (`4ˣ − 3·2ˣ + 2 = 0`) and two-log
equations, both listed in the `programa` for grade X.

**percentages** — 2025 august I.4 and 2026 simulare I.4, recovering the price
*before* a rise or a discount. Level 5 puts two changes in a row and asks for
the rate rather than the price.

**probability** — 2026 model I.4, the probability that `n(n+1)` is a multiple
of 10. Level 5 requires two conditions at once, or `C(n,2) = k` solved for `n`
(2025 aprilie simulare II).

**geometry** — 2025 aprilie simulare I.5, perpendicularity from slopes, and the
line through two points as a determinant. Among CNPEE papers the ceiling is
lower (2025 iunie I.5, `BC = a·AB`), so this is one place where the county
paper raises the anchor. Level 5 asks for the parameter that makes three points
collinear or two lines perpendicular.

**trigonometry** — 2025 model I.6, a right triangle with a given acute angle,
and 2025 aprilie simulare I.6, reduction to the first quadrant with
`sin²+cos² = 1`. Level 5 is the sine and cosine rules in a non-right triangle,
which the `programa` lists but the corpus never sets.

**matrices** — 2025 iunie II.1.c, `det(A(B − A) + xI₂) ≤ 2`, i.e. a determinant
that comes out as a quadratic in `x` and then an inequality to solve. Level 5
is a 3×3 determinant with a parameter and a 2×2 matrix equation `AX = B`, both
inside the `programa` (XI: determinant de ordin cel mult 3, ecuaţii matriceale).

**composition** — 2025 specială II.2.c, pairs of natural numbers `m < n` with
`(8 + m) ∗ (8 + n) = 2`, which needs the law rewritten as `(x − a)(y − a) + a`
first. Level 5 asks for the identity element and the inverse of an element.

**polynomials** — 2025 august II.2.c, a symmetric function of the roots
(`(Σx_ix_j)² + x₁x₂x₃·Σx_i = 1`) solved for the parameter. Level 5 asks for
`x₁² + x₂² + x₃²` and for divisibility by a quadratic.

**derivatives** — 2025 iunie III.1.c, proving a two-sided inequality on a
closed interval by locating the extremum. Level 5 keeps the inequality but on
an open interval, and asks for a parameter making the function monotone.

**integrals** — 2025 specială III.2.c, the volume of a solid of revolution
where the answer is engineered to be reported as a coefficient. Level 5 is
integration by parts and area between two curves, both in the `programa` (XII).

## How the corpus shaped the answer format

The examiners write questions whose answers are typeable: an integer, a small
fraction, a tidy surd, or — when the honest answer is `9π ln 3` — a parameter
`a` defined so that the student writes a number. Every generator here follows
that discipline, and rejects and redraws when a parameter set produces an
answer that does not look like something a Ministry examiner would print.

## How the corpus shaped the marking

Each item is marked in two parts because that is what the bareme do: 3p for the
substantive step and 2p for the finish, or 2p and 3p where the setup is the
cheap half. Compare 2025 iunie I.2 — `f(2) = 9, f(0) = −3` scores 2p before you
have found `a` at all — with 2025 iunie I.1, where getting to a common
denominator is worth 3p of the 5. So each generated item asks for its own
intermediate value, then the answer, and pays them separately.

## Spot-checks against the bareme

Each row is a real item, the official barem's answer, and what this trainer's
generator produces for the same parameters. These were checked by hand against
the `*-barem.txt` files; the numeric self-checks in `tools/verify.mjs` then
re-derive every generated item independently on every run.

| Item | The barem's answer | This trainer |
|---|---|---|
| 2025 iunie I.1 — `1/10 + 3(1/2 − 1/5)` | bracket `3/10` (3p), total `1` (2p) | `frac-two-brackets`, same two-part split |
| 2025 iunie I.2 — `f(2) = a + f(0)`, `f(x) = 6x − 3` | `f(2) = 9, f(0) = −3` (2p), `a = 12` (3p) | `linear-self` returns `a = a·k = 12` |
| 2025 iunie I.4 — `6n > 25` on `{0,…,9}` | 5 favourable, `p = 1/2` | `prob-inequality` counts 5, `p = 1/2` |
| 2026 model I.4 — `n(n+1)` a multiple of 10 on `{1,…,8}` | 2 favourable, `p = 1/4` | `prob-product-multiple` counts 20 and 30 |
| 2025 iunie I.5 — `A(2,0), B(2,1), C(6,4)` | `BC = 5`, `AB = 1`, `a = 5` | `ratio-of-lengths`, same construction |
| 2025 iunie I.6 — `MN = 4·MP`, `MN = 8` | `MP = 2` (2p), area `8` (3p) | `ratio-triangle`, same split |
| 2025 model I.6 — `AC = 4`, `∠C = 60°` | `cos C = AC/BC = 1/2`, `BC = 8` | `angle-given` case 1 gives `BC = 2·AC` |
| 2026 model I.6 — `AC = 6 = 3·AB` | `AB = 2`, `BC = 2√10` | `ratio-triangle` with the surd branch |
| 2026 simulare I.6 — `AC = 6, AB = 8` | `BC = 10`, altitude `4,8` | `altitude-hypotenuse` gives `48/10` |
| 2025 august I.4 — after `+60%` costs 320 | `160%` of x is 320, `x = 200` | `before-rise` asks for `100 + p` then x |
| 2025 iunie II.1.a — `det A` for `(5 2; 2 1)` | `5 − 4 = 1` | `det2-numeric`, same 2p/3p split |
| 2025 iunie II.1.c — `det(A(B−A) + xI₂) ≤ 2` | `x² + 2x − 3 ≤ 0`, `x ∈ [−3,1]` | `det-inequality` builds exactly this shape |
| 2025 iunie II.2.b — `2Σx = 1 + x₁x₂x₃` | `Σx = 3`, `x₁x₂x₃ = −m`, `m = −5` | `poly-viete-condition`, same relation |
| 2025 specială II.2.c — `(8+m)∗(8+n) = 2` | `(x−8)(y−8) − 56`, `mn = 58` | `comp-factor-pairs` factorises identically |
| 2025 iunie III.1.a — `f = (x−2)/eˣ` | `f′ = (3 − x)/eˣ` | `exp-derivative` with `b = −2` gives `k = 3` |
| 2025 iunie III.1.b — tangent at `x = 0` | `f(0) = −2, f′(0) = 3`, `y = 3x − 2` | `tangent-line`, same two-part split |
| 2025 specială III.2.c — volume `= aπ ln 3` | the answer is reported as the coefficient | `volume-of-revolution` asks for `a` the same way |

The one place the trainer deliberately differs from a corpus item is 2026
simulare I.3, `lg(x² − 9x) = 1`. Both roots satisfy the domain condition there,
so `log-quadratic` asks for both and says so in the working, rather than
implying that a negative root is automatically rejected. The rejection case is
taught on `radical-with-x` instead, where it is genuine.
