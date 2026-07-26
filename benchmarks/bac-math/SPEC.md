# Bac Maths (M2) — submission brief

Build a learning platform that takes one student from wherever they are to a
good grade in **Matematică M_tehnologic, Proba E.c)** — the Romanian
Bacalaureat maths paper.

**Taught in English**, even though the exam is Romanian. Keep Romanian only
where the student will meet it on the day: `Subiectul I`, `barem`, `punctaj`.

## Who it is for

One real student: filiera tehnologică, profil tehnic, **electrician**
qualification. Not a general maths course — a person with a date and a paper.

The qualification does not change the syllabus (every tehnologic profile sits
the same paper), but it is the best hook you have. This student thinks in
circuits. Series and parallel resistance is algebra with fractions; capacitor
discharge is the exponential and the logarithm; a sinusoidal supply is
trigonometry; power as a function of current is a quadratic with a maximum you
find by differentiating. Use that where it fits, and drop it where it would be
a stretch — forced analogies are worse than none.

## What you are given

`benchmarks/bac-math/exams/` holds official Ministry of Education material —
you do not need to search for any of it:

- **Papers and marking schemes** for 2024, 2025 and 2026, covering the model
  papers, the June session, the special session, the August session, and the
  2026 simulation. Files are `*-subiect.pdf` (paper) and `*-barem.pdf`
  (marking scheme).
- **`programa-matematica-2026.pdf`** — the official syllabus. This is the
  authority on scope. Nothing outside it is examinable.
- **`exams/text/`** — every one of those as UTF-8 text, so you can read them
  without PDF tooling.

Read several papers before you build anything. The examiners reuse question
shapes heavily, and that pattern is the single most useful thing in the corpus.

## The paper

Three subjects, all compulsory. 30 points each, plus 10 ex officio, divided by
ten for the final grade. Three hours.

| | Shape | Content |
|---|---|---|
| **Subiectul I** | 6 independent items, 5p each | Number sets and fraction arithmetic, progressions, first- and second-degree functions, exponential and logarithmic equations, percentages, combinatorics and probability, analytic geometry (vectors, midpoints, distances), right-triangle trigonometry |
| **Subiectul II** | 2 problems × 3 parts, 5p each | Problem 1: matrices and determinants (order 2–3), systems. Problem 2: laws of composition — associativity, commutativity, identity, inverses |
| **Subiectul III** | 2 problems × 3 parts, 5p each | Problem 1: limits, derivatives, tangents, monotonicity, extrema, inequalities. Problem 2: antiderivatives, definite integrals, areas, volumes of revolution |

Subiectul II and III parts build on each other — a) usually feeds b).

## How the barem marks

Read this off the real marking schemes, because it changes how you should
teach. Three rules stated at the top of every barem:

- **Any correct method earns full marks**, even if it differs from the barem.
- **Partial credit is real.** A 5-point item is typically split 3p for the
  substantive step and 2p for finishing. Writing down the right setup and
  fumbling the arithmetic still scores.
- **No fractions of a point.**

A student who knows this writes down every intermediate step. One who does not
leaves marks on the table. Teach it.

## The rules

1. **English**, for the Romanian M2 exam.
2. **Covers the whole syllabus**, grades IX–XII, and nothing outside it.
3. **Every problem has a worked solution, and the maths is right.** See below.
4. **Timed mock papers**, in the real format, marked like the barem with
   partial credit.
5. **Teaches, not just tests** — and holds attention. A wall of exercises is
   not a platform.

## Correctness is the hard gate

This is the difference between this benchmark and a nice-looking demo. A
maths platform with subtly wrong solutions is *worse than nothing*: it teaches
a real person the wrong method before a real exam.

So: every worked solution must be checked, not merely written. Where you can,
make the checking mechanical — generate a problem from parameters and verify
the answer in code rather than asserting it in prose. State in your `notes` how
you verified the maths. "I was careful" is not a method.

Prefer fewer problems that are certainly right over many that are probably
right.

## Hard constraints

- **Self-contained.** No CDN scripts, external fonts, or remote assets. No
  network requests of any kind. Everything ships in your folder or is inlined.
- **Runs from a static file.** No build step, no server, no bundler.
- The viewer frames your page with `sandbox="allow-scripts allow-pointer-lock"`,
  so `fetch`, `XMLHttpRequest` and storage are unavailable. Relative
  `<script>`, `<img>` and `<link>` loads work normally.
- **No storage means no persistence.** Progress lives in memory for the
  session. Design around it rather than pretending otherwise.

## Deliverable

A folder under `benchmarks/bac-math/submissions/<your-id>/` with an
`index.html`, listed in `submissions/index.json`:

```json
{
  "id": "your-id",
  "title": "Short title",
  "agent": "<model that built it>",
  "created": "2026-07-26",
  "entry": "./benchmarks/bac-math/submissions/your-id/index.html",
  "notes": "One line on the approach, and how you verified the maths."
}
```

## How it is judged

It must run; the syllabus coverage must be honest; the maths must survive
spot-checking against the bareme. Then Norman uses it and decides whether a
student would actually come back to it tomorrow. The third one is the real
test, and it is why "engaging" is a rule and not a nicety.
