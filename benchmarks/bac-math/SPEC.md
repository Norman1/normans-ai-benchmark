# Bac Maths (M2) — submission brief

Build an **adaptive trainer** for **Matematică M_tehnologic, Proba E.c)** —
the Romanian Bacalaureat maths paper.

Two modes: learn a topic, or sit a full paper. The platform works out what the
student is weak at and adjusts. **Taught in English**, keeping Romanian only for what they will meet
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

1. **Two modes** — learn a topic, or sit a full paper in the real format.
2. **Levels per topic**, adapting automatically. Strong in a topic, you climb;
   weak, you drop back.
3. **The top level is above the exam.** Reach it and the Bac holds no surprises
   in that topic.
4. **Every question links to a lesson on its topic** — not a solution to that
   question.
5. **Save and load progress as a JSON file.**
6. **English**, whole syllabus, grades IX–XII, nothing outside it.

## Two modes

**Learn a topic.** Where the actual learning happens, and where the student
will spend most of their time. They pick a topic — or take the one the platform
says is weakest — and work through questions at their current level, one at a
time, with feedback straight away and the lesson always one click off. Short
sittings. Someone should be able to do fifteen minutes of this and feel it was
worth it.

**Sit a full paper.** Subiectul I, II and III in the real format and point
values, spread across the syllabus the way a real paper is — *not* narrowed to
weak topics. No feedback and no lessons until it is submitted, because the
point is finding out where they actually stand. Marked at the end like the
barem, with partial credit.

Show elapsed time against the real three-hour allowance so they learn what that
pace feels like, but **do not cut them off**, auto-submit, or gate anything on
it. Knowing you spent forty minutes on one Subiectul II part is the useful
signal; being stopped mid-thought is not, and would make the trainer something
to avoid on a bad day.

The two modes are one system, not two features: a paper tells you where the
student is weak, and that decides what topic mode serves next.

## Levels

Every topic has its own ladder, and the student climbs it. Say five levels —
the count matters less than where the two ends sit.

**Calibrate against the corpus, not against a feeling.** You have several years
of real papers in `exams/`. For each topic, find the hardest item the examiners
have actually set. That is your **level four**. **Level five sits a notch
above it** — so a student at the top of a topic is working past anything the
Bac has ever asked, and the real thing feels easy. That is the whole point:
max level should mean a straight A is not in doubt.

**Level one** is the easiest thing that still counts as the topic — for
somebody starting from nothing, not a slightly gentler exam question.

This anchoring is what makes the gamification honest. "Level five in
derivatives" is not a score you farmed; it is a claim about readiness that the
exam will bear out. Points and badges that mean nothing would be worse than no
gamification at all, because this student needs to be able to trust the number.

## Adapting

Levels move on their own — the student does not pick their difficulty, though
letting them drop back and drill something easier on purpose is fine.

- Climb after consistent success; drop back after repeated failure.
- **Drop faster than you climb.** An over-faced student stops; a bored one
  does not.
- Both modes feed the same per-topic estimate. A paper is what tells you a
  level was flattering.

Make the ladder visible. A student who can see they are level four in
derivatives and level one in laws of composition knows exactly what tonight is
for, and that display is doing more work than any streak counter would.

The real engineering constraint is coverage: with a dozen topics and five
levels you need questions in **every** (topic, level) cell, or the adaptation
has nothing to reach for. Generating them from parameters rather than writing
them out one by one is the usual way to make that tractable, and it hands you
the answer for free.

## Topic lessons

From any question the student can jump to a lesson on **the topic it belongs
to** — what the method is, why it works, worked examples, the traps.

Explicitly not a solution to the question in front of them: the point is to
send someone who is stuck to the thing they are missing, without handing them
the answer to the item they are on.

## Saving

There is no login and no storage — see the constraints below. So the student
saves by **downloading a JSON file** and restores by **uploading it**.

Save **where they are on each ladder**, not exact session state. Per-topic
level plus enough history to keep adapting. Not the current paper, not which
question they are on. A save file should stay useful after you have added new
questions.

```json
{
  "version": 1,
  "updated": "2026-07-26",
  "topics": {
    "derivatives":         { "level": 4, "seen": 41, "correct": 30 },
    "laws-of-composition": { "level": 1, "seen": 12, "correct": 3 }
  }
}
```

Use your own topic ids and your own level scale — just version the file and
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

It must run; both modes must work; the paper format must match the real one;
the levels must actually respond to how the student is doing and be calibrated
against the corpus rather than invented; save and load must round-trip. Then
Norman uses it and decides whether a student would come back to it tomorrow.
That last one is the real test.

One thing that would sink a submission: worked solutions that are wrong. It is
a study tool for a real exam, so spot-checks against the bareme are part of
judging. Generating questions from parameters, where the answer falls out of the
generator, is the cheapest way to stay safe.
