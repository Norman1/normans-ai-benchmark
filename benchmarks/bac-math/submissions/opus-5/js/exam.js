// Assembling and marking a full paper.
//
// The shape is taken straight off the corpus, not invented: three subjects,
// 30 points each, ten ex officio, and the same slot-by-slot layout every
// CNPEE paper in exams/ uses. The levels are the ones those slots actually sit
// at — Subiectul I around level 3, and a) b) c) climbing from 1 or 2 up to 4
// inside each Subiectul II and III problem.
//
// Exam mode does *not* aim at the student's weak topics. A paper's job is to
// find out where they stand, which means covering the syllabus the way the
// real one does.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const { Rng } = BAC.core;

  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

  /**
   * The paper's skeleton. Where the corpus alternates between two topics for a
   * slot, both are listed and the paper picks — the way the examiners do.
   */
  const BLUEPRINT = [
    {
      id: "I",
      heading: "SUBIECTUL I",
      note: "Six independent items, 5 points each.",
      groups: [{
        label: null,
        items: [
          { label: "1", topics: ["numbers", "numbers", "progressions"], level: 3 },
          { label: "2", topics: ["functions"], level: 3 },
          { label: "3", topics: ["equations"], level: 3 },
          { label: "4", topics: ["probability", "percentages"], level: 3 },
          { label: "5", topics: ["geometry"], level: 3 },
          { label: "6", topics: ["trigonometry"], level: 3 }
        ]
      }]
    },
    {
      id: "II",
      heading: "SUBIECTUL al II-lea",
      note: "Two problems of three parts, 5 points each.",
      groups: [
        {
          label: "1",
          items: [
            { label: "a)", topics: ["matrices"], level: 1 },
            { label: "b)", topics: ["matrices"], level: 3 },
            { label: "c)", topics: ["matrices"], level: 4 }
          ]
        },
        {
          // Five of the seven official papers set a law of composition here;
          // the other two set a polynomial. Both come up.
          label: "2",
          alternates: [["composition", "composition", "composition", "polynomials", "polynomials"]],
          items: [
            { label: "a)", level: 1 },
            { label: "b)", level: 3 },
            { label: "c)", level: 4 }
          ]
        }
      ]
    },
    {
      id: "III",
      heading: "SUBIECTUL al III-lea",
      note: "Two problems of three parts, 5 points each.",
      groups: [
        {
          label: "1",
          items: [
            { label: "a)", topics: ["derivatives"], level: 2 },
            { label: "b)", topics: ["derivatives"], level: 3 },
            { label: "c)", topics: ["derivatives"], level: 4 }
          ]
        },
        {
          label: "2",
          items: [
            { label: "a)", topics: ["integrals"], level: 2 },
            { label: "b)", topics: ["integrals"], level: 3 },
            { label: "c)", topics: ["integrals"], level: 4 }
          ]
        }
      ]
    }
  ];

  const EX_OFFICIO = 10;

  function buildPaper(seed) {
    const rng = new Rng((Number(seed) || 1) >>> 0);
    let counter = 0;
    const sections = BLUEPRINT.map((section) => ({
      id: section.id,
      heading: section.heading,
      note: section.note,
      groups: section.groups.map((group) => {
        const shared = group.alternates ? rng.pick(group.alternates[0]) : null;
        return {
          label: group.label,
          items: group.items.map((slot) => {
            const topicId = shared ?? rng.pick(slot.topics);
            counter += 1;
            const item = BAC.bank.build(topicId, slot.level, ((seed >>> 0) * 977 + counter * 7919) >>> 0);
            return Object.assign(item, { label: slot.label, examIndex: counter });
          })
        };
      })
    }));

    const items = sections.flatMap((section) =>
      section.groups.flatMap((group) => group.items));

    return {
      seed: Number(seed) || 1,
      sections,
      items,
      maxPoints: items.reduce((sum, item) => sum + item.points, 0),
      exOfficio: EX_OFFICIO,
      allowanceMs: THREE_HOURS_MS
    };
  }

  /**
   * Mark a paper.
   *
   * Part by part, the way a barem does — 3p for the substantive step and 2p
   * for the finish, or the other way round where the setup is the cheap half.
   * A right method with a fumbled arithmetic finish keeps its 3 points, which
   * is the single most useful thing this trainer can teach.
   */
  function markPaper(paper, answers) {
    const perItem = paper.items.map((item) => {
      const marks = item.parts.map((part, index) => {
        const typed = answers[`${item.id}::${index}`];
        const verdict = BAC.answer.check(typed, part.answer);
        return {
          index,
          typed: typed ?? "",
          points: verdict.ok ? part.points : 0,
          outOf: part.points,
          ok: verdict.ok,
          empty: Boolean(verdict.empty),
          error: verdict.error ?? null
        };
      });
      return {
        item,
        marks,
        scored: marks.reduce((sum, mark) => sum + mark.points, 0),
        outOf: item.points
      };
    });

    const scored = perItem.reduce((sum, entry) => sum + entry.scored, 0);
    const total = scored + paper.exOfficio;

    const byTopic = {};
    for (const entry of perItem) {
      const bucket = (byTopic[entry.item.topic] ??= { scored: 0, outOf: 0, items: 0 });
      bucket.scored += entry.scored;
      bucket.outOf += entry.outOf;
      bucket.items += 1;
    }

    const bySection = paper.sections.map((section) => {
      const ids = new Set(section.groups.flatMap((group) => group.items.map((item) => item.id)));
      const entries = perItem.filter((entry) => ids.has(entry.item.id));
      return {
        id: section.id,
        heading: section.heading,
        scored: entries.reduce((sum, entry) => sum + entry.scored, 0),
        outOf: entries.reduce((sum, entry) => sum + entry.outOf, 0)
      };
    });

    return {
      perItem,
      byTopic,
      bySection,
      scored,
      total,
      exOfficio: paper.exOfficio,
      maxPoints: paper.maxPoints + paper.exOfficio,
      grade: total / 10
    };
  }

  /** Feed a marked paper into the ladders. Exam evidence counts double. */
  function applyToProgress(result) {
    for (const entry of result.perItem) {
      BAC.progress.record(entry.item.topic, entry.item.level, entry.scored, entry.outOf, { weight: 2 });
    }
    BAC.progress.recordPaper(result);
  }

  BAC.exam = { buildPaper, markPaper, applyToProgress, THREE_HOURS_MS, EX_OFFICIO };
})(typeof window !== "undefined" ? window : globalThis);
