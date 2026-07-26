// The trainer itself: the ladder, topic drill, and the full paper.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const { el, $, prose, levelPips, formatTime, openLesson, openOverlay, closeOverlay, toast } = BAC.ui;
  const { LEVEL_NAMES, LEVEL_NOTES, SUBJECTS } = BAC.bank;

  const app = {
    view: "ladder",
    drill: null,
    exam: null,
    dirty: false,
    lastSaved: null,
    usedSeeds: new Map()
  };

  const root = () => $("#view");

  /* --- seeds ------------------------------------------------------------ */

  function freshSeed(topicId, level) {
    const key = `${topicId}:${level}`;
    const used = app.usedSeeds.get(key) ?? new Set();
    let seed = 0;
    let guard = 0;
    do {
      seed = Math.floor(Math.random() * 1e9) + 1;
      guard += 1;
    } while (used.has(seed) && guard < 50);
    used.add(seed);
    app.usedSeeds.set(key, used);
    return seed;
  }

  /* --- shared question rendering ---------------------------------------- */

  /**
   * One question, with an input per marked part.
   *
   * The two-part shape is not decoration: the bareme really do split a
   * five-point item into a substantive step and a finish, and a student who
   * writes the intermediate value down keeps those marks when the arithmetic
   * at the end goes wrong. Asking for both is how that becomes true here too.
   */
  function itemCard(item, options = {}) {
    const { label = null, answers, marks = null, readonly = false, onInput = null, onEnter = null } = options;
    const card = el("article", { class: `qcard${marks ? " marked" : ""}`, "data-item": item.id });

    const head = el("header", { class: "qhead" });
    if (label) head.append(el("span", { class: "qlabel" }, label));
    head.append(el("span", { class: "qtopic" }, item.topicName));
    head.append(el("span", { class: "qlevel" }, `L${item.level}`));
    head.append(el("span", { class: "qpoints" }, `${item.points}p`));
    if (!readonly || marks) {
      head.append(el("button", { class: "link-button", type: "button", onclick: () => openLesson(item.topic) },
        "Lesson"));
    }
    card.append(head);

    card.append(el("div", { class: "qprompt", html: prose(item.prompt) }));

    item.parts.forEach((part, index) => {
      const key = `${item.id}::${index}`;
      const mark = marks ? marks[index] : null;
      const row = el("div", { class: `qpart${mark ? (mark.ok ? " right" : " wrong") : ""}` });

      row.append(el("div", { class: "qask" },
        el("span", { class: "part-points" }, `${part.points}p`),
        el("span", { html: prose(part.ask) })));

      const input = el("input", {
        class: "answer",
        type: "text",
        value: answers.get(key) ?? "",
        placeholder: part.placeholder ?? "your answer",
        autocomplete: "off",
        autocapitalize: "off",
        spellcheck: "false",
        "data-key": key,
        "aria-label": `Answer, worth ${part.points} points`,
        disabled: readonly
      });
      input.addEventListener("input", () => {
        answers.set(key, input.value);
        onInput?.();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const inputs = Array.from(card.closest(".qlist, .drill-card, #view").querySelectorAll("input.answer:not([disabled])"));
        const next = inputs[inputs.indexOf(input) + 1];
        if (next) next.focus();
        else onEnter?.();
      });

      const line = el("div", { class: "answer-line" }, input);
      if (mark) {
        line.append(el("span", { class: `verdict ${mark.ok ? "ok" : "no"}` },
          mark.ok ? `✓ ${mark.points}p` : (mark.empty ? "— 0p" : "✗ 0p")));
      }
      row.append(line);

      if (mark && !mark.ok) {
        row.append(el("div", { class: "barem-line" },
          el("span", { class: "barem-tag" }, "barem"),
          el("span", { html: prose(part.mark) })));
        if (mark.error) row.append(el("div", { class: "parse-note" }, `Could not read “${mark.typed}” — ${mark.error}.`));
      }
      card.append(row);
    });

    if (marks) {
      const scored = marks.reduce((sum, mark) => sum + mark.points, 0);
      card.append(el("div", { class: "qscore" },
        el("strong", {}, `${scored} / ${item.points}`),
        el("span", { class: "muted" }, scored === item.points ? " — full marks"
          : scored === 0 ? " — nothing scored"
            : " — partial credit, exactly as the barem allows")));
      card.append(solutionNode(item));
    }
    return card;
  }

  function solutionNode(item) {
    const details = el("details", { class: "solution" },
      el("summary", {}, "How it is done"),
      el("ol", { class: "solution-steps" },
        (item.solution ?? []).map((step) => el("li", { html: prose(step) }))),
      el("div", { class: "solution-barem" },
        el("span", { class: "barem-tag" }, "barem"),
        el("ul", {}, item.parts.map((part) =>
          el("li", {}, el("b", {}, `${part.points}p `), el("span", { html: prose(part.mark) }))))));
    return details;
  }

  /* --- symbols palette --------------------------------------------------- */

  let lastFocused = null;
  document.addEventListener("focusin", (event) => {
    if (event.target.matches?.("input.answer")) lastFocused = event.target;
  });

  function symbolBar() {
    const insert = (text) => {
      const input = lastFocused && document.contains(lastFocused) ? lastFocused : null;
      if (!input) return;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      input.value = input.value.slice(0, start) + text + input.value.slice(end);
      input.selectionStart = input.selectionEnd = start + text.length;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    };
    return el("div", { class: "symbols" },
      ["√", "π", "e", "^", "/", "∞", "≤", "≥"].map((symbol) =>
        el("button", { class: "symbol", type: "button", onclick: () => insert(symbol) }, symbol)),
      el("span", { class: "symbols-hint" }, "or type sqrt5, pi, inf — fractions like 3/4 and forms like 2√10 are all accepted"));
  }

  /* --- the ladder -------------------------------------------------------- */

  function ladderView() {
    const summary = BAC.progress.summary();
    const weakest = BAC.progress.weakestTopic();
    const weakestEntry = BAC.progress.topicState(weakest.id);

    const wrap = el("div", { class: "stack" });

    wrap.append(el("section", { class: "panel hero" },
      el("div", { class: "hero-main" },
        el("h2", {}, "Where you stand"),
        el("p", { class: "hero-line" },
          `Average level `, el("b", {}, summary.averageLevel.toFixed(1)), ` across ${BAC.bank.topics.length} topics`,
          summary.atTop ? `, ${summary.atTop} of them above the Bac` : "",
          `. `,
          summary.attempted
            ? `You have answered ${summary.attempted} question${summary.attempted === 1 ? "" : "s"} and scored ${Math.round(summary.accuracy * 100)}% of the marks going.`
            : `Nothing answered yet — the ladders all start at level 1, which is where a level means nothing until you have shown it.`),
        el("div", { class: "hero-actions" },
          el("button", { class: "primary", onclick: () => startDrill(weakest.id) },
            `Work on ${weakest.name.toLowerCase()}`),
          el("button", { onclick: () => go("exam") }, "Sit a full paper"))),
      el("aside", { class: "hero-side" },
        el("div", { class: "hero-weak" },
          el("span", { class: "eyebrow" }, "Weakest topic"),
          el("strong", {}, weakest.name),
          levelPips(weakestEntry.level),
          el("span", { class: "muted" }, `${LEVEL_NAMES[weakestEntry.level]} · ${weakest.slot}`)))));

    if (BAC.progress.state.papers.length) {
      const last = BAC.progress.state.papers[BAC.progress.state.papers.length - 1];
      wrap.append(el("section", { class: "panel strip" },
        el("span", { class: "eyebrow" }, "Last paper"),
        el("strong", { class: "grade" }, last.grade.toFixed(2)),
        el("span", { class: "muted" }, `${last.total} of 100 points · ${last.at}`),
        el("span", { class: "muted right" }, `${BAC.progress.state.papers.length} paper${BAC.progress.state.papers.length === 1 ? "" : "s"} sat`)));
    }

    const bySubject = new Map();
    for (const topic of BAC.bank.ordered()) {
      const subject = SUBJECTS[topic.slot];
      if (!bySubject.has(subject)) bySubject.set(subject, []);
      bySubject.get(subject).push(topic);
    }

    for (const [subject, topics] of bySubject) {
      wrap.append(el("section", { class: "panel" },
        el("h3", { class: "subject-head" }, subject),
        el("div", { class: "ladder-grid" }, topics.map((topic) => topicCard(topic)))));
    }

    wrap.append(el("section", { class: "panel note" },
      el("h3", {}, "How the levels move"),
      el("p", {},
        `Three answers in a row worth 4 or 5 marks out of 5 take you up a level. `,
        el("b", {}, "Two bad answers take you down"),
        ` — it drops faster than it climbs on purpose, because being over-faced is what makes people stop. Answers in a paper count double, since a paper is the honest evidence.`),
      el("p", {},
        `Answers from outside your current rung move it at once: full marks on something `,
        el("i", {}, "harder"),
        ` than your level lifts you there and then, and nothing at all on something `,
        el("i", {}, "easier"),
        ` drops you. That is mostly what a paper does — it is the one place you meet questions that are not already pitched at you.`),
      el("p", { class: "muted" },
        `Level 4 in a topic is the hardest thing the examiners have actually set in it, taken from the nine papers in `,
        el("code", {}, "exams/"),
        `. Level 5 is a notch above that, still inside the syllabus. So level 5 is not a score you farmed — it is a claim that the real paper holds no surprises for you there.`)));

    return wrap;
  }

  function topicCard(topic) {
    const entry = BAC.progress.topicState(topic.id);
    const towards = BAC.progress.goodAnswersTowardsClimb(topic.id);
    const accuracy = entry.attempted ? Math.round((entry.points / (entry.attempted * 5)) * 100) : null;

    return el("article", { class: `tcard${BAC.progress.atRisk(topic.id) ? " at-risk" : ""}` },
      el("header", {},
        el("div", { class: "tcard-title" },
          el("strong", {}, topic.name),
          el("span", { class: "slot" }, topic.slot)),
        levelPips(entry.level, { small: true })),
      el("p", { class: "tcard-blurb" }, topic.blurb),
      el("div", { class: "tcard-level" },
        el("span", { class: `level-name l${entry.level}` }, `Level ${entry.level} — ${LEVEL_NAMES[entry.level]}`)),
      el("div", { class: "climb" },
        el("div", { class: "climb-bar" },
          [0, 1, 2].map((index) => el("i", { class: index < towards ? "on" : "" }))),
        el("span", { class: "muted" }, entry.level === 5
          ? (towards >= 3 ? "top of the ladder" : "holding the top level")
          : `${towards} of 3 clean answers to level ${entry.level + 1}`)),
      el("footer", {},
        el("span", { class: "muted" }, entry.attempted
          ? `${entry.attempted} answered · ${accuracy}% of marks`
          : "not started"),
        el("span", { class: "tcard-buttons" },
          el("button", { class: "link-button", onclick: () => openLesson(topic.id) }, "Lesson"),
          el("button", { class: "small primary", onclick: () => startDrill(topic.id) }, "Drill"))));
  }

  /* --- topic drill ------------------------------------------------------- */

  function startDrill(topicId, level = null) {
    const entry = BAC.progress.topicState(topicId);
    app.drill = {
      topicId,
      level: level ?? entry.level,
      followLadder: level == null,
      item: null,
      answers: new Map(),
      marks: null,
      moved: 0,
      done: 0,
      scoredTotal: 0,
      possibleTotal: 0
    };
    nextQuestion();
    go("drill");
  }

  function nextQuestion() {
    const drill = app.drill;
    if (drill.followLadder) drill.level = BAC.progress.topicState(drill.topicId).level;
    drill.item = BAC.bank.build(drill.topicId, drill.level, freshSeed(drill.topicId, drill.level));
    drill.answers = new Map();
    drill.marks = null;
    drill.moved = 0;
  }

  function checkDrill() {
    const drill = app.drill;
    if (drill.marks) return;
    const marks = drill.item.parts.map((part, index) => {
      const typed = drill.answers.get(`${drill.item.id}::${index}`);
      const verdict = BAC.answer.check(typed, part.answer);
      return {
        typed: typed ?? "",
        ok: verdict.ok,
        empty: Boolean(verdict.empty),
        error: verdict.error ?? null,
        points: verdict.ok ? part.points : 0
      };
    });
    const scored = marks.reduce((sum, mark) => sum + mark.points, 0);
    drill.marks = marks;
    drill.done += 1;
    drill.scoredTotal += scored;
    drill.possibleTotal += drill.item.points;

    const moved = BAC.progress.record(drill.topicId, drill.item.level, scored, drill.item.points);
    drill.moved = moved.moved;
    app.dirty = true;
    render();

    const card = root().querySelector(".qcard");
    card?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    // Keep the keyboard flowing: Enter checked the answer, Enter moves on.
    root().querySelector(".drill-card .actions button.primary")?.focus();
  }

  function drillView() {
    const drill = app.drill;
    const topic = BAC.bank.byId.get(drill.topicId);
    const entry = BAC.progress.topicState(drill.topicId);
    const wrap = el("div", { class: "stack drill" });

    wrap.append(el("section", { class: "panel drill-head" },
      el("div", {},
        el("button", { class: "link-button back", onclick: () => go("ladder") }, "← the ladder"),
        el("h2", {}, topic.name),
        el("p", { class: "muted" }, `${SUBJECTS[topic.slot]}, item ${topic.slot.split(".")[1]} — ${topic.blurb}`)),
      el("div", { class: "drill-meta" },
        el("div", { class: "drill-level" },
          el("span", { class: "eyebrow" }, "Practising at"),
          el("div", { class: "level-picker" },
            [1, 2, 3, 4, 5].map((level) => el("button", {
              class: `level-button${level === drill.level ? " on" : ""}${level === entry.level ? " ladder" : ""}`,
              title: `Level ${level} — ${LEVEL_NAMES[level]}. ${LEVEL_NOTES[level]}`,
              onclick: () => {
                app.drill.level = level;
                app.drill.followLadder = level === entry.level;
                nextQuestion();
                render();
              }
            }, String(level)))),
          el("span", { class: "muted" },
            `${LEVEL_NAMES[drill.level]}${drill.level === entry.level ? " · your level" : " · chosen by hand"}`)),
        drill.done
          ? el("div", { class: "drill-tally" },
            el("span", { class: "eyebrow" }, "This sitting"),
            el("strong", {}, `${drill.scoredTotal} / ${drill.possibleTotal}`),
            el("span", { class: "muted" }, `over ${drill.done} question${drill.done === 1 ? "" : "s"}`))
          : null)));

    const card = itemCard(drill.item, {
      answers: drill.answers,
      marks: drill.marks,
      readonly: Boolean(drill.marks),
      onEnter: () => (drill.marks ? nextAndRender() : checkDrill())
    });
    const holder = el("section", { class: "panel drill-card" }, card);

    if (!drill.marks) {
      holder.append(symbolBar());
      holder.append(el("div", { class: "actions" },
        el("button", { class: "primary", onclick: checkDrill }, "Check my answer"),
        el("button", { onclick: () => { nextQuestion(); render(); } }, "Skip this one"),
        el("span", { class: "muted hint" }, "Answer both parts — the first is worth marks on its own, exactly as on the day.")));
    } else {
      const scored = drill.marks.reduce((sum, mark) => sum + mark.points, 0);
      if (drill.moved !== 0) {
        holder.append(el("div", { class: `level-move ${drill.moved > 0 ? "up" : "down"}` },
          drill.moved > 0
            ? `Level up — ${topic.name.toLowerCase()} is now level ${entry.level}, ${LEVEL_NAMES[entry.level].toLowerCase()}.`
            : `Dropped back to level ${entry.level}. That is the trainer doing its job: two poor answers and it eases off, so you drill where you actually are.`));
      }
      holder.append(el("div", { class: "actions" },
        el("button", { class: "primary", onclick: nextAndRender }, "Next question"),
        el("button", { onclick: () => openLesson(drill.topicId) }, "Read the lesson"),
        el("button", { onclick: () => go("ladder") }, "Back to the ladder"),
        el("span", { class: "muted hint" }, scored === drill.item.points
          ? "Clean. Two more like that and you climb."
          : "The barem for the parts you missed is above, and the full working is under “How it is done”.")));
    }

    wrap.append(holder);
    return wrap;
  }

  function nextAndRender() {
    nextQuestion();
    render();
    root().querySelector("input.answer")?.focus();
  }

  /* --- the paper --------------------------------------------------------- */

  function examIntroView() {
    const wrap = el("div", { class: "stack" });
    wrap.append(el("section", { class: "panel prose-panel" },
      el("h2", {}, "Sit a full paper"),
      el("p", {}, `Three subjects, all compulsory, in the real format: `,
        el("b", {}, "Subiectul I"), ` — six independent items at 5 points each; `,
        el("b", {}, "Subiectul al II-lea"), ` — two problems of three parts, matrices and then either a law of composition or a polynomial, the way the papers alternate; `,
        el("b", {}, "Subiectul al III-lea"), ` — two problems of three parts, differential then integral calculus. Thirty points a subject, ten ex officio, divided by ten for the grade.`),
      el("p", {}, `Inside each problem the parts climb the way they do on the day: a) is straightforward, b) is standard, c) is the hardest thing the examiners set in that topic.`),
      el("p", {}, `No feedback and no lessons until you submit — the point of a paper is finding out where you actually stand, and it cannot do that if you are being told.`),
      el("p", { class: "callout" },
        el("b", {}, "The clock runs but never stops you."), ` You will see the elapsed time against the real three-hour allowance, because learning what that pace feels like matters. Nothing is submitted for you and nothing is locked. Knowing you spent forty minutes on one Subiectul II part is the useful signal; being cut off mid-thought is not.`),
      el("p", { class: "muted" }, `A paper does not aim at your weak topics — it spreads across the syllabus like the real one. Afterwards, every item feeds back into the ladders at double weight.`),
      el("div", { class: "actions" },
        el("button", { class: "primary big", onclick: startExam }, "Start the paper"),
        el("button", { onclick: () => go("ladder") }, "Not now"))));
    return wrap;
  }

  function startExam() {
    const paper = BAC.exam.buildPaper(Math.floor(Math.random() * 1e9) + 1);
    app.exam = {
      paper,
      answers: new Map(),
      startedAt: Date.now(),
      result: null,
      tick: null
    };
    go("exam-paper");
  }

  function updateClock() {
    if (!app.exam || app.exam.result) return;
    const elapsed = Date.now() - app.exam.startedAt;
    const clock = $("#examClock");
    if (!clock) return;
    clock.textContent = formatTime(elapsed);
    clock.parentElement.classList.toggle("over", elapsed > app.exam.paper.allowanceMs);
    const answered = countAnswered();
    const progress = $("#examProgress");
    if (progress) progress.textContent = `${answered} of ${totalFields()} answers given`;
  }

  const totalFields = () => app.exam.paper.items.reduce((sum, item) => sum + item.parts.length, 0);
  const countAnswered = () => Array.from(app.exam.answers.values()).filter((value) => String(value).trim()).length;

  function examPaperView() {
    const { paper, answers } = app.exam;
    const wrap = el("div", { class: "stack exam" });

    wrap.append(el("section", { class: "exam-bar" },
      el("div", { class: "clock-wrap" },
        el("span", { class: "eyebrow" }, "Elapsed"),
        el("span", { id: "examClock", class: "clock" }, "0:00"),
        el("span", { class: "muted" }, `of 3:00:00 — not enforced`)),
      el("div", { class: "exam-bar-mid" },
        el("span", { id: "examProgress", class: "muted" }, `0 of ${totalFields()} answers given`)),
      el("div", {},
        el("button", { class: "primary", onclick: confirmSubmit }, "Submit the paper"))));

    wrap.append(el("section", { class: "panel exam-head" },
      el("h2", {}, "Matematică M_tehnologic · Proba E.c)"),
      el("p", { class: "muted" }, `Toate subiectele sunt obligatorii. Se acordă zece puncte din oficiu. Timpul de lucru efectiv este de trei ore.`),
      symbolBar()));

    for (const section of paper.sections) {
      const list = el("div", { class: "qlist" });
      for (const group of section.groups) {
        if (group.label) list.append(el("h4", { class: "group-label" }, `${group.label}.`));
        for (const item of group.items) {
          list.append(itemCard(item, {
            label: item.label,
            answers,
            readonly: false,
            onInput: () => { app.dirty = true; updateClock(); }
          }));
        }
      }
      wrap.append(el("section", { class: "panel exam-section" },
        el("header", { class: "section-head" },
          el("h3", {}, section.heading),
          el("span", { class: "muted" }, `(30 de puncte) · ${section.note}`)),
        list));
    }

    wrap.append(el("div", { class: "actions center" },
      el("button", { class: "primary big", onclick: confirmSubmit }, "Submit the paper")));
    return wrap;
  }

  function confirmSubmit() {
    const missing = totalFields() - countAnswered();
    const body = el("div", { class: "confirm" },
      el("p", {}, missing
        ? `${missing} of the ${totalFields()} answer boxes are still empty. Blank answers score nothing, but on the real paper so does a blank page — submit when you are ready.`
        : `Everything is filled in. It will be marked like the barem, part by part, with partial credit.`),
      el("div", { class: "actions" },
        el("button", { class: "primary", onclick: () => { closeOverlay(); submitExam(); } }, "Submit and mark it"),
        el("button", { onclick: closeOverlay }, "Keep working")));
    openOverlay("Submit the paper?", body);
  }

  function submitExam() {
    const exam = app.exam;
    clearInterval(exam.tick);
    exam.elapsed = Date.now() - exam.startedAt;
    exam.result = BAC.exam.markPaper(exam.paper, Object.fromEntries(exam.answers));
    const before = new Map(BAC.bank.topics.map((topic) => [topic.id, BAC.progress.topicState(topic.id).level]));
    BAC.exam.applyToProgress(exam.result);
    exam.movement = BAC.bank.topics
      .map((topic) => ({ topic, from: before.get(topic.id), to: BAC.progress.topicState(topic.id).level }))
      .filter((entry) => entry.from !== entry.to);
    app.dirty = true;
    go("exam-result");
    window.scrollTo({ top: 0 });
  }

  function examResultView() {
    const { paper, result, elapsed, movement } = app.exam;
    const wrap = el("div", { class: "stack" });

    const grade = result.grade;
    const verdict = grade >= 6 ? "pass" : grade >= 5 ? "borderline" : "fail";

    wrap.append(el("section", { class: "panel result-hero" },
      el("div", {},
        el("span", { class: "eyebrow" }, "Nota"),
        el("div", { class: `big-grade ${verdict}` }, grade.toFixed(2)),
        el("p", { class: "muted" }, `${result.total} of 100 points — ${result.scored} earned plus ${result.exOfficio} ex officio.`),
        el("p", { class: "muted" }, `Time taken ${formatTime(elapsed)} of the three hours allowed.`),
        el("p", {}, grade >= 6
          ? `That passes the paper, and clears the 6 you need averaged across the three written exams.`
          : grade >= 5
            ? `That passes this paper — 5 is the bar — but the Bac needs an average of 6 across the three written exams, so there is work to do.`
            : `Below 5 on this paper. The ladders below now know where the gaps are.`)),
      el("div", { class: "result-sections" },
        result.bySection.map((section) => el("div", { class: "result-section" },
          el("span", { class: "eyebrow" }, section.heading),
          el("strong", {}, `${section.scored} / ${section.outOf}`),
          el("div", { class: "bar" }, el("i", { style: `width:${(section.scored / section.outOf) * 100}%` })))))));

    if (movement.length) {
      wrap.append(el("section", { class: "panel" },
        el("h3", {}, "What the paper changed"),
        el("ul", { class: "movement" }, movement.map((entry) =>
          el("li", { class: entry.to > entry.from ? "up" : "down" },
            el("strong", {}, entry.topic.name),
            ` ${entry.from} → ${entry.to}`,
            el("span", { class: "muted" }, entry.to > entry.from
              ? " — the paper confirmed it"
              : " — the paper says that level was flattering"))))));
    }

    const weakest = Object.entries(result.byTopic)
      .map(([id, bucket]) => ({ id, ratio: bucket.scored / bucket.outOf, bucket }))
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 3);
    wrap.append(el("section", { class: "panel" },
      el("h3", {}, "Where to go next"),
      el("div", { class: "next-topics" }, weakest.map(({ id, bucket }) => {
        const topic = BAC.bank.byId.get(id);
        return el("div", { class: "next-topic" },
          el("div", {},
            el("strong", {}, topic.name),
            el("span", { class: "muted" }, ` ${bucket.scored} of ${bucket.outOf} points`)),
          el("div", { class: "tcard-buttons" },
            el("button", { class: "link-button", onclick: () => openLesson(id) }, "Lesson"),
            el("button", { class: "small primary", onclick: () => startDrill(id) }, "Drill")));
      }))));

    for (const section of paper.sections) {
      const list = el("div", { class: "qlist" });
      for (const group of section.groups) {
        if (group.label) list.append(el("h4", { class: "group-label" }, `${group.label}.`));
        for (const item of group.items) {
          const entry = result.perItem.find((candidate) => candidate.item.id === item.id);
          list.append(itemCard(item, {
            label: item.label,
            answers: app.exam.answers,
            marks: entry.marks,
            readonly: true
          }));
        }
      }
      const sectionResult = result.bySection.find((candidate) => candidate.id === section.id);
      wrap.append(el("section", { class: "panel exam-section" },
        el("header", { class: "section-head" },
          el("h3", {}, section.heading),
          el("span", { class: "muted" }, `${sectionResult.scored} of ${sectionResult.outOf} points`)),
        list));
    }

    wrap.append(el("div", { class: "actions center" },
      el("button", { class: "primary", onclick: () => go("ladder") }, "Back to the ladder"),
      el("button", { onclick: saveFile }, "Save my progress"),
      el("button", { onclick: () => { app.exam = null; go("exam"); } }, "Sit another paper")));
    return wrap;
  }

  /* --- save and load ----------------------------------------------------- */

  function saveFile() {
    const data = BAC.progress.toJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = el("a", { href: url, download: `bac-maths-progress-${data.updated}.json` });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    app.dirty = false;
    app.lastSaved = data.updated;
    renderShellState();
    toast("Progress saved. Keep the file — loading it back picks up exactly where you left off.", "ok");
  }

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let parsed = null;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        toast("That file is not readable JSON. Nothing was changed.", "bad");
        return;
      }
      const outcome = BAC.progress.fromJSON(parsed);
      if (!outcome.ok) {
        toast(`${outcome.error} Nothing was changed.`, "bad");
        return;
      }
      app.dirty = false;
      app.usedSeeds = new Map();
      go("ladder");
      const notes = outcome.notes.length ? ` ${outcome.notes.join(" ")}` : "";
      toast(`Loaded ${outcome.restored} topics.${notes}`, "ok");
    };
    reader.onerror = () => toast("That file could not be read.", "bad");
    reader.readAsText(file);
  }

  /* --- shell ------------------------------------------------------------- */

  const NAV = [
    { id: "ladder", label: "The ladder" },
    { id: "drill", label: "Practise" },
    { id: "exam", label: "Full paper" }
  ];

  /**
   * Move between views.
   *
   * A paper in progress survives being navigated away from — the elapsed time
   * is measured from when it started, not from an interval that happens to be
   * running, so looking something up on the ladder costs nothing but the time
   * it takes. Losing an hour's work to a misclick would make the trainer
   * something to be careful around, which is the opposite of the point.
   */
  function go(view) {
    if (app.exam?.tick) {
      clearInterval(app.exam.tick);
      app.exam.tick = null;
    }
    if (view === "exam") {
      if (app.exam && !app.exam.result) view = "exam-paper";
      else if (app.exam?.result) view = "exam-result";
    }
    if (view === "drill" && !app.drill) {
      startDrill(BAC.progress.weakestTopic().id);
      return;
    }
    app.view = view;
    render();
    if (view !== "drill") window.scrollTo({ top: 0 });
  }

  function renderShellState() {
    const dot = $("#dirtyDot");
    if (dot) dot.classList.toggle("on", app.dirty);
    for (const link of BAC.ui.$$("#nav button")) {
      const id = link.dataset.view;
      link.classList.toggle("active", app.view === id
        || (id === "exam" && app.view.startsWith("exam")));
    }
  }

  function render() {
    const view = app.view;
    const node = view === "ladder" ? ladderView()
      : view === "drill" ? drillView()
        : view === "exam" ? (app.exam?.result ? examResultView() : examIntroView())
          : view === "exam-paper" ? examPaperView()
            : view === "exam-result" ? examResultView()
              : ladderView();
    root().replaceChildren(node);
    renderShellState();
    if (view === "exam-paper") {
      updateClock();
      if (!app.exam.tick) app.exam.tick = setInterval(updateClock, 1000);
    }
  }

  function boot() {
    const nav = $("#nav");
    nav.replaceChildren(...NAV.map((entry) => el("button", {
      "data-view": entry.id,
      onclick: () => go(entry.id)
    }, entry.label)));

    $("#saveButton").addEventListener("click", saveFile);
    const fileInput = $("#loadInput");
    $("#loadButton").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      if (fileInput.files?.[0]) loadFile(fileInput.files[0]);
      fileInput.value = "";
    });

    BAC.progress.onChange(() => renderShellState());
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  BAC.app = app;
})(typeof window !== "undefined" ? window : globalThis);
