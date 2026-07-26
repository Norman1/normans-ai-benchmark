# Bac Maths (M2) — adaptive trainer

Open `index.html`. No build step, no server, no network, nothing installed.

## What is here

```
index.html          the page
css/app.css         one stylesheet
js/core.js          seeded RNG, exact rationals, MathML builders
js/answer.js        reads what the student typed: fractions, surds, π, e, ln, intervals, sets
js/bank-*.js        the question generators, five per topic level
js/bank.js          the registry: build(topic, level, seed) → one question
js/lessons.js       one lesson per topic
js/progress.js      the ladders, the adaptation rule, save and load
js/exam.js          assembling and marking a full paper
js/ui.js, app.js    the interface
tools/verify.mjs    headless checker — not shipped to the page
tools/dump.mjs      prints generated items as plain text, for reading them
CALIBRATION.md      which real item anchors each level, and spot-checks against the bareme
```

## The idea

A question is fully determined by `(topic, level, seed)`, and its answer is
computed from the same parameters that built it. Nothing is stored, nothing is
pre-written, and no answer was ever typed in by hand — which is the only way to
be confident that thirteen thousand questions are all right.

Thirteen topics, five levels each. **Level 4 in a topic is the hardest item the
examiners have actually set in it**, taken from the nine papers in
`benchmarks/bac-math/exams/`; level 5 is a notch above, still inside
`programa-matematica-2026`. `CALIBRATION.md` names the anchor item for every
topic.

Every item is marked in **two parts**, because that is what the bareme do: 3
points for the substantive step and 2 for the finish, or the other way round
where the setup is the cheap half. So partial credit is real, and the habit the
barem rewards — write the intermediate value down — is the habit the trainer
enforces.

## Checking it

```
node tools/verify.mjs --seeds 1000
```

Walks every (topic, level) cell over a thousand seeds and, for each item,
re-derives the answer independently, feeds the declared answer back through the
answer parser as a student would type it, checks the parts add to five points,
checks the answers look like something a Ministry examiner would print, and
counts how many genuinely distinct variants the cell produces. Derivatives are
checked against a central difference and integrals against Simpson's rule, so a
generator that got its calculus wrong fails here rather than reaching a student.

```
node tools/dump.mjs derivatives 4 3
```

prints three level-4 derivative items as plain text, working and all.
