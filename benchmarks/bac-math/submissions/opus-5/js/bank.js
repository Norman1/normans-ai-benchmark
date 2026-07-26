// The bank: one registry, and one way to ask it for a question.
//
// A question is fully determined by (topic, level, seed). Nothing is stored,
// nothing is pre-generated — which is why the bank is as deep as the parameter
// ranges allow rather than as deep as somebody had patience to type.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const { Rng } = BAC.core;

  const TOPICS = [].concat(
    BAC.bankNumbers, BAC.bankAlgebra, BAC.bankGeometry, BAC.bankStructures, BAC.bankAnalysis
  );

  const byId = new Map(TOPICS.map((topic) => [topic.id, topic]));

  /** Where each topic sits on the paper, for the ladder display. */
  const SUBJECTS = {
    "I.1": "Subiectul I", "I.2": "Subiectul I", "I.3": "Subiectul I",
    "I.4": "Subiectul I", "I.5": "Subiectul I", "I.6": "Subiectul I",
    "II.1": "Subiectul II", "II.2": "Subiectul II",
    "III.1": "Subiectul III", "III.2": "Subiectul III"
  };

  const LEVEL_NAMES = {
    1: "Foundations",
    2: "Building",
    3: "Exam standard",
    4: "Top of the paper",
    5: "Above the Bac"
  };

  const LEVEL_NOTES = {
    1: "The easiest thing that still counts as this topic.",
    2: "One step harder — still below what a paper would set.",
    3: "About what a typical paper asks in this topic.",
    4: "The hardest the examiners have actually set in this topic.",
    5: "A notch above anything in the papers. Reach this and the Bac holds no surprises here."
  };

  function hashSeed(topicId, level, seed) {
    let hash = 2166136261;
    const text = `${topicId}|${level}|${seed}`;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  /**
   * Build one question.
   *
   * Generators return null when their parameter draw would produce an untidy
   * answer, so this keeps drawing — cycling through the level's generators so
   * that one fussy shape cannot starve the others.
   */
  function build(topicId, level, seed) {
    const topic = byId.get(topicId);
    if (!topic) throw new Error(`no such topic: ${topicId}`);
    const generators = topic.levels[level];
    if (!generators || !generators.length) throw new Error(`${topicId} has no level ${level}`);

    const rng = new Rng(hashSeed(topicId, level, seed));
    const offset = rng.int(0, generators.length - 1);

    for (let attempt = 0; attempt < 200; attempt += 1) {
      const generator = generators[(offset + attempt) % generators.length];
      let built = null;
      try {
        built = generator(rng);
      } catch (error) {
        throw new Error(`${topicId} L${level} seed ${seed}: ${error.message}`);
      }
      if (built) {
        return Object.assign(built, {
          id: `${topicId}-${level}-${seed}`,
          topic: topicId,
          topicName: topic.name,
          level,
          seed,
          slot: topic.slot,
          points: built.parts.reduce((sum, part) => sum + part.points, 0)
        });
      }
    }
    throw new Error(`${topicId} L${level} seed ${seed}: no generator produced a question`);
  }

  BAC.bank = {
    topics: TOPICS,
    byId,
    build,
    SUBJECTS,
    LEVEL_NAMES,
    LEVEL_NOTES,
    /** Topics in the order they appear on a paper. */
    ordered: () => TOPICS.slice().sort((a, b) => a.slot.localeCompare(b.slot, undefined, { numeric: true }))
  };
})(typeof window !== "undefined" ? window : globalThis);
