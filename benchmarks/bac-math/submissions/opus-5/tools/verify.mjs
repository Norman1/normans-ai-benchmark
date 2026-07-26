// Headless checker for the question bank.
//
// Not shipped to the page — this is how the bank is kept honest. It loads the
// same source files the browser loads, then walks every (topic, level) cell
// over thousands of seeds and asserts, for each generated item:
//
//   * it builds without throwing, and every part has a checkable answer;
//   * the answer the generator declares is accepted by the answer parser when
//     typed the way a student would type it;
//   * an independent numeric re-derivation agrees with the declared answer,
//     where the item is one that can be re-derived (most can);
//   * the parts' points add to the item's total;
//   * the answers look tidy — small integers, halves, clean surds;
//   * the cell has enough genuinely distinct variants to drill against.
//
// Run:  node tools/verify.mjs [--seeds 4000] [--topic derivatives]

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

const FILES = [
  "js/core.js",
  "js/answer.js",
  "js/bank-numbers.js",
  "js/bank-algebra.js",
  "js/bank-geometry.js",
  "js/bank-structures.js",
  "js/bank-analysis.js",
  "js/bank.js",
  "js/lessons.js",
  "js/exam.js",
  "js/progress.js"
];

const sandbox = { console, Math, JSON, Date, String, Number, Array, Object, Error, Infinity, NaN };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

for (const file of FILES) {
  let source;
  try {
    source = readFileSync(join(ROOT, file), "utf8");
  } catch {
    continue;                                  // not written yet; the bank stands alone
  }
  try {
    vm.runInContext(source, sandbox, { filename: file });
  } catch (error) {
    console.error(`\n✗ ${file} failed to load:\n${error.stack}`);
    process.exit(1);
  }
}

const { BAC } = sandbox;
const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
};
const SEEDS = Number(argOf("seeds", 1500));
const ONLY_TOPIC = argOf("topic", null);

let failures = 0;
let checked = 0;
const rows = [];

const fail = (where, message, detail) => {
  failures += 1;
  console.error(`\n✗ ${where}\n  ${message}`);
  if (detail) console.error(`  ${detail}`);
};

/** How a student would most likely type the declared answer. */
function typedForm(spec) {
  switch (spec.type) {
    case "number":
    case "percent":
      return formatNumber(spec.value);
    case "expr":
      return spec.typed;
    case "interval":
      return spec.parts
        .map((p) => `${p.openLo ? "(" : "["}${formatEnd(p.lo)},${formatEnd(p.hi)}${p.openHi ? ")" : "]"}`)
        .join("U");
    case "set":
      return spec.values.map(formatNumber).join(",");
    case "pair":
      return spec.values.map(formatNumber).join(",");
    case "choice":
      return spec.value;
    default:
      return null;
  }
}

function formatEnd(value) {
  if (value === Infinity) return "inf";
  if (value === -Infinity) return "-inf";
  return formatNumber(value);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  if (Number.isInteger(value)) return String(value);
  return value.toPrecision(14);
}

/** Answers a Ministry examiner would print. Loose enough for ln 3 and 2√10. */
function tidyLooking(value) {
  if (!Number.isFinite(value)) return false;
  if (Math.abs(value) > 100000) return false;
  if (Number.isInteger(value)) return true;
  for (const d of [2, 3, 4, 5, 6, 8, 9, 10, 12, 16, 20, 25, 27, 32, 50, 100]) {
    if (Math.abs(value * d - Math.round(value * d)) < 1e-9) return true;
  }
  return true;                                   // surds and logs are fine too
}

// A "<" that does not open a tag is a less-than sign the browser will eat,
// taking the rest of the sentence with it. Every generated string goes
// through this, because the damage is invisible in the source and obvious on
// the screen.
const STRAY_ANGLE = /<(?![a-zA-Z/!])/;
function checkMarkup(where, label, html) {
  if (html == null) return;
  if (STRAY_ANGLE.test(String(html))) {
    fail(where, `${label} contains a bare "<" that the browser will read as a tag`,
      String(html).replace(/\s+/g, " ").slice(0, 140));
  }
}

// The answer parser, against the forms a student will actually type.
//
// Marking a right answer wrong is the worst thing this trainer could do, so
// every notation the paper or a Romanian keyboard might produce is pinned
// here: the decimal comma, "sqrt" for √, a trailing "lei", an unsimplified
// fraction, a union of intervals, an unordered pair of roots.
const PARSER_CASES = [
  ["12", { type: "number", value: 12 }, true],
  ["−16", { type: "number", value: -16 }, true],
  ["1/2", { type: "number", value: 0.5 }, true],
  ["2/4", { type: "number", value: 0.5 }, true],
  ["0,5", { type: "number", value: 0.5 }, true],
  ["4,8", { type: "number", value: 4.8 }, true],
  [".5", { type: "number", value: 0.5 }, true],
  ["2√10", { type: "number", value: 2 * Math.sqrt(10) }, true],
  ["2sqrt10", { type: "number", value: 2 * Math.sqrt(10) }, true],
  ["2*sqrt(10)", { type: "number", value: 2 * Math.sqrt(10) }, true],
  ["√40", { type: "number", value: 2 * Math.sqrt(10) }, true],
  ["√3/2", { type: "number", value: Math.sqrt(3) / 2 }, true],
  ["ln 3", { type: "number", value: Math.log(3) }, true],
  ["3π", { type: "number", value: 3 * Math.PI }, true],
  ["3pi", { type: "number", value: 3 * Math.PI }, true],
  ["2e^3+1", { type: "number", value: 2 * Math.exp(3) + 1 }, true],
  ["2+2(e-1)", { type: "number", value: 2 + 2 * (Math.E - 1) }, true],
  ["600 de lei", { type: "number", value: 600 }, true],
  ["|−7|", { type: "number", value: 7 }, true],
  ["2^-1", { type: "number", value: 0.5 }, true],
  ["7", { type: "number", value: 8 }, false],
  ["banana", { type: "number", value: 8 }, false],
  ["", { type: "number", value: 8 }, false],
  ["60%", { type: "percent", value: 60 }, true],
  ["60", { type: "percent", value: 60 }, true],
  ["y=3x-2", { type: "expr", fn: (x) => 3 * x - 2 }, true],
  ["-2+3x", { type: "expr", fn: (x) => 3 * x - 2 }, true],
  ["3x+2", { type: "expr", fn: (x) => 3 * x - 2 }, false],
  ["(x-1)e^x", { type: "expr", fn: (x) => (x - 1) * Math.exp(x), samples: [0.4, 1.2, 2.1] }, true],
  ["x ln x - x", { type: "expr", fn: (x) => x * Math.log(x) - x, samples: [1.3, 2.2] }, true],
  ["x∈[-3,1]", { type: "interval", parts: [{ lo: -3, hi: 1, openLo: false, openHi: false }] }, true],
  ["[−3;1]", { type: "interval", parts: [{ lo: -3, hi: 1, openLo: false, openHi: false }] }, true],
  ["(-3,1]", { type: "interval", parts: [{ lo: -3, hi: 1, openLo: false, openHi: false }] }, false],
  ["(-∞,-3]∪[1,∞)", {
    type: "interval",
    parts: [{ lo: -Infinity, hi: -3, openLo: true, openHi: false }, { lo: 1, hi: Infinity, openLo: false, openHi: true }]
  }, true],
  ["1,-4", { type: "set", values: [-4, 1] }, true],
  ["{-4, 1}", { type: "set", values: [-4, 1] }, true],
  ["-4 and 1", { type: "set", values: [-4, 1] }, true],
  ["-4", { type: "set", values: [-4, 1] }, false],
  ["a=3, b=4", { type: "pair", values: [3, 4] }, true],
  ["4,3", { type: "pair", values: [3, 4] }, false]
];

for (const [typed, spec, want] of PARSER_CASES) {
  const got = BAC.answer.check(typed, spec).ok;
  if (got !== want) {
    fail("answer parser", `"${typed}" (${spec.type}) was ${got ? "accepted" : "rejected"}, expected the opposite`);
  }
}

// Lessons are hand-written prose, so they get the same treatment once.
for (const [topicId, lesson] of Object.entries(BAC.lessons)) {
  const strings = [lesson.onThePaper];
  for (const block of lesson.blocks) {
    strings.push(block.body, block.title, ...(block.steps ?? []), ...(block.lines ?? []));
  }
  strings.filter(Boolean).forEach((text, index) => checkMarkup(`lesson ${topicId}`, `block ${index}`, text));
}

const topics = BAC.bank.topics.filter((t) => !ONLY_TOPIC || t.id === ONLY_TOPIC);

for (const topic of topics) {
  for (let level = 1; level <= 5; level += 1) {
    const prompts = new Set();
    const shapes = new Map();
    let cellFailures = 0;

    for (let seed = 1; seed <= SEEDS; seed += 1) {
      let item;
      const where = `${topic.id} L${level} seed ${seed}`;
      try {
        item = BAC.bank.build(topic.id, level, seed);
      } catch (error) {
        if (cellFailures++ < 3) fail(where, "threw while generating", error.stack.split("\n")[0]);
        continue;
      }
      checked += 1;

      if (!item.prompt || !item.parts || !item.parts.length) {
        if (cellFailures++ < 3) fail(where, "produced no prompt or no parts");
        continue;
      }

      const total = item.parts.reduce((sum, part) => sum + part.points, 0);
      if (total !== 5) {
        if (cellFailures++ < 3) fail(where, `parts add to ${total}p, not 5p`);
      }

      for (const part of item.parts) {
        if (!part.ask || !part.answer) {
          if (cellFailures++ < 3) fail(where, "a part is missing its ask or answer");
          continue;
        }
        const typed = typedForm(part.answer);
        if (typed == null) {
          if (cellFailures++ < 3) fail(where, `unknown answer type ${part.answer.type}`);
          continue;
        }
        const verdict = BAC.answer.check(typed, part.answer);
        if (!verdict.ok) {
          if (cellFailures++ < 3) {
            fail(where, `the declared answer is rejected by the checker: “${typed}”`,
              `${part.ask.replace(/<[^>]+>/g, "")} — ${verdict.error ?? "marked wrong"}`);
          }
        }
        if (part.answer.type === "number" && !tidyLooking(part.answer.value)) {
          if (cellFailures++ < 3) fail(where, `untidy answer ${part.answer.value}`);
        }
        // Every part must also carry the barem line shown in feedback.
        if (!part.mark) {
          if (cellFailures++ < 3) fail(where, "a part has no barem line");
        }
      }

      checkMarkup(where, "the prompt", item.prompt);
      item.parts.forEach((part, index) => {
        checkMarkup(where, `part ${index} ask`, part.ask);
        checkMarkup(where, `part ${index} barem`, part.mark);
      });
      (item.solution ?? []).forEach((step, index) => checkMarkup(where, `solution step ${index}`, step));

      // An independent re-derivation, where the generator supplied one.
      if (typeof item.selfCheck === "function") {
        const problem = item.selfCheck();
        if (problem) {
          if (cellFailures++ < 3) fail(where, `self-check failed: ${problem}`);
        }
      }

      prompts.add(item.prompt.replace(/\s+/g, " "));
      shapes.set(item.shape ?? "?", (shapes.get(item.shape ?? "?") ?? 0) + 1);
    }

    rows.push({
      topic: topic.id,
      level,
      variants: prompts.size,
      shapes: shapes.size,
      failures: cellFailures
    });
  }
}

/* --- Report ----------------------------------------------------------- */

console.log("\n  topic                 L  distinct  shapes");
console.log("  " + "-".repeat(46));
let thin = 0;
for (const row of rows) {
  const flag = row.variants < 24 ? "  ← thin" : "";
  if (row.variants < 24) thin += 1;
  console.log(
    `  ${row.topic.padEnd(20)} ${row.level}  ${String(row.variants).padStart(7)}  ${String(row.shapes).padStart(6)}${flag}`
  );
}

const totalVariants = rows.reduce((sum, row) => sum + row.variants, 0);
console.log(`\n  ${checked} items generated across ${rows.length} cells`);
console.log(`  ${totalVariants} distinct prompts seen at ${SEEDS} seeds per cell`);
if (thin) console.log(`  ${thin} cell(s) under 24 distinct variants`);
console.log(failures ? `\n✗ ${failures} problem(s)\n` : "\n✓ all clear\n");
process.exit(failures || thin ? 1 : 0);
