# Bac Maths (M2) — submission brief

Build an **adaptive mock-exam trainer** for **Matematică M_tehnologic, Proba
E.c)** — the Romanian Bacalaureat maths paper.

The student sits mock papers. The platform works out what they are weak at and
adjusts. **Taught in English**, keeping Romanian only for what they will meet
on the day: `Subiectul I`, `barem`, `punctaj`.

## Who it is for

One real student: filiera tehnologică, profil tehnic, **electrician**
qualification. Not a general maths course — a person with a date and a paper.

The qualification does not change the syllabus (every tehnologic profile sits
the same paper), but it is the best hook you have. This student thinks in
circuits: series and parallel resistance is algebra with fractions, capacitor
discharge is the exponential and the logarithm, a sinusoidal supply is
trigonometry, power against current is a quadratic with a maximum you find by
differentiating. Use it where it fits, drop it where it would be a stretch.

## What you are given

`benchmarks/bac-math/exams/` holds official Ministry of Education material —
you do not need to search for any of it:

- **Papers and marking schemes** for 2024, 2025 and 2026: the model papers, the
  June session, the special session, the August session, and the 2026
  simulation. `*-subiect.pdf` is the paper, `*-barem.pdf` the marking scheme.
- **`programa-matematica-2026.pdf`** — the official syllabus, and the authority
  on scope. Nothing outside it is examinable.
- **`exams/text/`** — all of the above as UTF-8 text, so you can read them
  without PDF tooling.

Read several papers before building anything. The examiners reuse question
shapes heavily, and that pattern is the most useful thing in the corpus.

## The paper

Three subjects, all compulsory. 30 points each plus 10 ex officio, divided by
ten for the grade. Three hours.

| | Shape | Content |
|---|---|---|
| **Subiectul I** | 6 independent items, 5p each | Number sets and fractions, progressions, first- and second-degree functions, exponential and logarithmic equations, percentages, combinatorics and probability, analytic geometry (vectors, midpoints, distances), right-triangle trigonometry |
| **Subiectul II** | 2 problems × 3 parts, 5p each | Problem 1: matrices and determinants (order 2–3), systems. Problem 2: laws of composition — associativity, commutativity, identity, inverses |
| **Subiectul III** | 2 problems × 3 parts, 5p each | Problem 1: limits, derivatives, tangents, monotonicity, extrema, inequalities. Problem 2: antiderivatives, definite integrals, areas, volumes of revolution |

In Subiectul II and III the parts build on each other — a) usually feeds b).

## How the barem marks

Read this off the real marking schemes, because it should change how you mark:

- **Any correct method earns full marks**, even if it differs from the barem.
- **Partial credit is real.** A 5-point item usually splits 3p for the
  substantive step and 2p for finishing. The right setup with a fumbled
  arithmetic finish still scores 3.
- **No fractions of a point.**

A student who knows this writes down every intermediate step; one who does not
leaves marks on the table. Teach that, and mark that way.

## The rules

1. **Mock exams in the real format** — Subiectul I, II, III, correct point
   values. Show the clock; do not enforce it.
2. **Difficulty adapts per topic.** Strong in a topic, questions get harder;
   weak, they get easier.
3. **Every question links to a lesson on its topic** — not a solution to that
   question.
4. **Save and load progress as a JSON file.**
5. **English**, whole syllabus, grades IX–XII, nothing outside it.

## The clock

Show elapsed time against the real three-hour allowance, so the student learns
what that pace feels like and where it goes. Do not cut them off, do not
auto-submit, do not gate anything on it.

Knowing you spent forty minutes on one Subiectul II part is the useful signal.
Being stopped mid-thought is not, and would make the trainer something a
student avoids on a bad day — which is the one behaviour that ruins it.

## Adaptive difficulty

Track a strength estimate **per topic**, not one global level. A student can be
fine at derivatives and hopeless at laws of composition, and a single difficulty
dial would hide exactly the thing worth knowing.

- Give every question a topic and a difficulty band. Three or four bands is
  plenty; more is false precision.
- Move a topic up after consistent success, down after repeated failure. Move
  down faster than up — an over-faced student stops, a bored one does not.
- Serve a mix. A paper made only of a student's weakest topics is demoralising
  and unlike the real exam, which always spreads across the syllabus.

The real engineering constraint is coverage: with a dozen topics and four bands
you need enough questions in **every** (topic, band) cell, or the adaptation has
nothing to reach for. Generating questions from parameters rather than writing
them out one by one is the usual way to make that tractable, and it also gives
you the answer for free.

## Topic lessons

From any question the student can jump to a lesson on **the topic it belongs
to** — what the method is, why it works, worked examples, the traps.

Explicitly not a solution to the question in front of them: the point is to
send someone who is stuck to the thing they are missing, without handing them
the answer to the item they are on.

## Saving

There is no login and no storage — see the constraints below. So the student
saves by **downloading a JSON file** and restores by **uploading it**.

Save **what they are good and bad at**, not exact session state. Per-topic
strength and enough history to keep adapting. Not the current paper, not which
question they are on. A save file should stay useful after you have added new
questions.

```json
{
  "version": 1,
  "updated": "2026-07-26",
  "topics": {
    "derivatives":        { "strength": 0.72, "seen": 41, "correct": 30 },
    "laws-of-composition":{ "strength": 0.18, "seen": 12, "correct": 3 }
  }
}
```

Use your own topic ids and your own strength scale — just version the file and
fail gracefully on one you cannot read, rather than throwing away the student's
progress.

## Hard constraints

- **Self-contained.** No CDN scripts, external fonts, or remote assets. No
  network requests of any kind. Everything ships in your folder or is inlined.
- **Runs from a static file.** No build step, no server, no bundler.
- The viewer frames your page with
  `sandbox="allow-scripts allow-pointer-lock allow-downloads"`. So:
  - **`localStorage`, `sessionStorage` and `indexedDB` are unavailable** — this
    is measured, not assumed. Do not build around them.
  - **File download works** (`Blob` + object URL + a click on an `<a download>`).
  - **File upload works** — `<input type="file">` and `FileReader`.
  - `fetch` and `XMLHttpRequest` are unavailable. Relative `<script>`, `<img>`
    and `<link>` loads work normally.

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
  "notes": "One line on the approach."
}
```

## How it is judged

It must run; the format must match the real paper; the adaptation must actually
respond to how the student is doing; save and load must round-trip. Then Norman
uses it and decides whether a student would come back to it tomorrow. That last
one is the real test.

One thing that would sink a submission: worked solutions that are wrong. It is
a study tool for a real exam, so spot-checks against the bareme are part of
judging. Generating questions from parameters, where the answer falls out of the
generator, is the cheapest way to stay safe.
