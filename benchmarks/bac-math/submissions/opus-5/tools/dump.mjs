// Print generated items as plain text, for reading them the way a person would.
//
//   node tools/dump.mjs derivatives 4 3      topic, level, how many

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["js/core.js", "js/answer.js", "js/bank-numbers.js", "js/bank-algebra.js",
  "js/bank-geometry.js", "js/bank-structures.js", "js/bank-analysis.js", "js/bank.js"];

const sandbox = { console, Math, JSON, Date, String, Number, Array, Object, Error, Infinity, NaN };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const file of FILES) vm.runInContext(readFileSync(join(ROOT, file), "utf8"), sandbox, { filename: file });

const { BAC } = sandbox;
const [topic, level = "3", count = "3", start = "1"] = process.argv.slice(2);

/** MathML → something readable in a terminal. */
function plain(html) {
  return String(html)
    .replace(/<mfrac>\s*<mrow>(.*?)<\/mrow>\s*<mrow>(.*?)<\/mrow>\s*<\/mfrac>/gs, "($1)/($2)")
    .replace(/<msqrt>(.*?)<\/msqrt>/gs, "√($1)")
    .replace(/<msup>\s*<mrow>(.*?)<\/mrow>\s*<mrow>(.*?)<\/mrow>\s*<\/msup>/gs, "$1^($2)")
    .replace(/<msub>\s*<mrow>(.*?)<\/mrow>\s*<mrow>(.*?)<\/mrow>\s*<\/msub>/gs, "$1_$2")
    .replace(/<mtd>/g, " ").replace(/<\/mtd>/g, " |")
    .replace(/<mtr>/g, "[ ").replace(/<\/mtr>/g, " ]")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const topics = topic ? [topic] : BAC.bank.topics.map((t) => t.id);
for (const id of topics) {
  for (let i = 0; i < Number(count); i += 1) {
    const item = BAC.bank.build(id, Number(level), Number(start) + i);
    console.log(`\n── ${id} L${level} seed ${Number(start) + i} · ${item.shape} ─────────────`);
    console.log(`Q: ${plain(item.prompt)}`);
    for (const part of item.parts) {
      const answer = part.answer.type === "expr" ? part.answer.typed
        : part.answer.values ? part.answer.values.join(", ")
          : part.answer.parts ? JSON.stringify(part.answer.parts)
            : part.answer.value;
      console.log(`   [${part.points}p] ${plain(part.ask)}`);
      console.log(`        → ${answer}     (barem: ${plain(part.mark)})`);
    }
    (item.solution ?? []).forEach((step) => console.log(`   · ${plain(step)}`));
  }
}
