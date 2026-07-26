// Where the student is on each ladder, and how that moves.
//
// The rule is deliberately simple enough to state on the screen, because a
// number the student cannot explain is a number they cannot trust:
//
//     three clean answers in a row move you up.
//     two bad ones move you down.
//
// It drops faster than it climbs, which is the brief's instruction and the
// right way round: an over-faced student stops, a bored one does not. Exam
// answers count twice, because a paper is the honest evidence — it is what
// tells you a level was flattering.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});
  const SAVE_VERSION = 1;

  const CLIMB_NEEDED = 3;      // consecutive answers scoring 4 or 5 out of 5
  const DROP_NEEDED = 2;       // consecutive answers scoring 2 or less
  const MAX_LEVEL = 5;
  const MIN_LEVEL = 1;

  function blankTopic() {
    return { level: 1, streak: [], seen: 0, correct: 0, points: 0, attempted: 0 };
  }

  function blankState() {
    const topics = {};
    for (const topic of BAC.bank.topics) topics[topic.id] = blankTopic();
    return { version: SAVE_VERSION, updated: today(), topics, papers: [] };
  }

  function today() {
    // The sandbox has no clock privileges to worry about, but a save file that
    // says when it was written is worth having.
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  const state = blankState();
  const listeners = [];

  const notify = () => listeners.forEach((fn) => fn(state));
  const onChange = (fn) => { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); };

  function topicState(topicId) {
    if (!state.topics[topicId]) state.topics[topicId] = blankTopic();
    return state.topics[topicId];
  }

  /** Trailing run of results matching a test. */
  function trailing(streak, test) {
    let count = 0;
    for (let i = streak.length - 1; i >= 0; i -= 1) {
      if (!test(streak[i])) break;
      count += 1;
    }
    return count;
  }

  /**
   * Record one marked item.
   *
   * @param {string} topicId
   * @param {number} level    the level the question was set at
   * @param {number} scored   marks out of `outOf`
   * @param {number} outOf    almost always 5
   * @param {object} options  { weight } — 2 for exam items
   * @returns {{ moved: -1|0|1, level: number }}
   */
  function record(topicId, level, scored, outOf = 5, options = {}) {
    const entry = topicState(topicId);
    const weight = options.weight ?? 1;
    const normalised = Math.round((scored / outOf) * 5);

    entry.seen += 1;
    entry.attempted += 1;
    entry.points += scored;
    if (normalised === 5) entry.correct += 1;

    // A question answered below the student's current level says less about
    // whether they are ready to climb, so it can drop them but not lift them.
    const belowLevel = level < entry.level;

    for (let i = 0; i < weight; i += 1) entry.streak.push(normalised);
    if (entry.streak.length > 12) entry.streak = entry.streak.slice(-12);

    // Evidence from *outside* the current level is stronger than evidence
    // from inside it, and moves the ladder at once.
    //
    // Full marks on a question harder than where the ladder had you means the
    // ladder was understating you, so it corrects upward immediately. Nothing
    // at all on a question easier than your level means it was flattering you,
    // and that corrects downward. This is what makes a paper worth sitting:
    // it is the only place a student meets questions off their own rung.
    if (normalised === 5 && level > entry.level) {
      entry.level = Math.min(level, entry.level + 1);
      entry.streak = [];
      state.updated = today();
      notify();
      return { moved: 1, level: entry.level, jumped: true };
    }
    if (normalised === 0 && level < entry.level) {
      entry.level = Math.max(level, entry.level - 1);
      entry.streak = [];
      state.updated = today();
      notify();
      return { moved: -1, level: entry.level, jumped: true };
    }

    let moved = 0;
    if (trailing(entry.streak, (value) => value <= 2) >= DROP_NEEDED && entry.level > MIN_LEVEL) {
      entry.level -= 1;
      entry.streak = [];
      moved = -1;
    } else if (!belowLevel
      && trailing(entry.streak, (value) => value >= 4) >= CLIMB_NEEDED
      && entry.level < MAX_LEVEL) {
      entry.level += 1;
      entry.streak = [];
      moved = 1;
    }

    state.updated = today();
    notify();
    return { moved, level: entry.level };
  }

  /** How far along the current level the student is, as 0…1. */
  function climbProgress(topicId) {
    const entry = topicState(topicId);
    if (entry.level >= MAX_LEVEL) {
      return trailing(entry.streak, (value) => value >= 4) >= CLIMB_NEEDED ? 1 : 0;
    }
    return Math.min(1, trailing(entry.streak, (value) => value >= 4) / CLIMB_NEEDED);
  }

  function goodAnswersTowardsClimb(topicId) {
    return Math.min(CLIMB_NEEDED, trailing(topicState(topicId).streak, (value) => value >= 4));
  }

  function atRisk(topicId) {
    return trailing(topicState(topicId).streak, (value) => value <= 2) >= 1
      && topicState(topicId).level > MIN_LEVEL;
  }

  /**
   * The topic to work on next.
   *
   * Lowest level first, then the weakest accuracy, then the one seen least —
   * so a topic never touched is preferred over one already drilled hard.
   */
  function weakestTopic() {
    const scored = BAC.bank.topics.map((topic) => {
      const entry = topicState(topic.id);
      const accuracy = entry.attempted ? entry.points / (entry.attempted * 5) : 0.5;
      return { topic, entry, accuracy };
    });
    scored.sort((a, b) =>
      a.entry.level - b.entry.level
      || a.accuracy - b.accuracy
      || a.entry.seen - b.entry.seen);
    return scored[0].topic;
  }

  function summary() {
    const levels = BAC.bank.topics.map((topic) => topicState(topic.id).level);
    const total = levels.reduce((sum, level) => sum + level, 0);
    const attempted = BAC.bank.topics.reduce((sum, topic) => sum + topicState(topic.id).attempted, 0);
    const points = BAC.bank.topics.reduce((sum, topic) => sum + topicState(topic.id).points, 0);
    return {
      averageLevel: total / levels.length,
      atTop: levels.filter((level) => level === MAX_LEVEL).length,
      atBottom: levels.filter((level) => level === MIN_LEVEL).length,
      attempted,
      points,
      accuracy: attempted ? points / (attempted * 5) : 0,
      papers: state.papers.length
    };
  }

  function recordPaper(result) {
    state.papers.push({
      at: today(),
      total: result.total,
      grade: result.grade,
      byTopic: result.byTopic
    });
    if (state.papers.length > 20) state.papers = state.papers.slice(-20);
    state.updated = today();
    notify();
  }

  /* --- save and load ---------------------------------------------------- */

  function toJSON() {
    const topics = {};
    for (const [id, entry] of Object.entries(state.topics)) {
      topics[id] = {
        level: entry.level,
        seen: entry.seen,
        correct: entry.correct,
        points: entry.points,
        attempted: entry.attempted,
        streak: entry.streak
      };
    }
    return {
      version: SAVE_VERSION,
      updated: today(),
      app: "bac-maths-trainer",
      topics,
      papers: state.papers
    };
  }

  /**
   * Read a save file.
   *
   * Fails gracefully by design: an unknown version, a missing topic or a topic
   * this build has never heard of must not throw away the rest of the file. A
   * student who has been using this for a month should never lose everything
   * because the bank gained a topic.
   */
  function fromJSON(raw) {
    const notes = [];
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: "That file does not look like a saved progress file." };
    }
    if (raw.version == null) notes.push("The file has no version number; reading it as version 1.");
    else if (raw.version > SAVE_VERSION) {
      notes.push(`The file was written by a newer version (${raw.version}). Anything unrecognised was skipped.`);
    }
    if (!raw.topics || typeof raw.topics !== "object") {
      return { ok: false, error: "That file has no topic progress in it." };
    }

    const fresh = blankState();
    let restored = 0;
    let unknown = 0;
    for (const [id, entry] of Object.entries(raw.topics)) {
      if (!fresh.topics[id]) { unknown += 1; continue; }
      const level = Number(entry?.level);
      fresh.topics[id] = {
        level: Number.isFinite(level) ? Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(level))) : 1,
        streak: Array.isArray(entry?.streak) ? entry.streak.filter((v) => Number.isFinite(v)).slice(-12) : [],
        seen: Number(entry?.seen) || 0,
        correct: Number(entry?.correct) || 0,
        points: Number(entry?.points) || 0,
        attempted: Number(entry?.attempted) || Number(entry?.seen) || 0
      };
      restored += 1;
    }
    if (unknown) notes.push(`${unknown} topic${unknown === 1 ? "" : "s"} in the file are not in this version, and were ignored.`);
    const missing = Object.keys(fresh.topics).length - restored;
    if (missing > 0) notes.push(`${missing} topic${missing === 1 ? " was" : "s were"} not in the file, and start at level 1.`);

    state.topics = fresh.topics;
    state.papers = Array.isArray(raw.papers) ? raw.papers.slice(-20) : [];
    state.updated = typeof raw.updated === "string" ? raw.updated : today();
    notify();
    return { ok: true, restored, notes };
  }

  function reset() {
    const fresh = blankState();
    state.topics = fresh.topics;
    state.papers = [];
    state.updated = today();
    notify();
  }

  BAC.progress = {
    state,
    topicState,
    record,
    recordPaper,
    climbProgress,
    goodAnswersTowardsClimb,
    atRisk,
    weakestTopic,
    summary,
    toJSON,
    fromJSON,
    reset,
    onChange,
    today,
    CLIMB_NEEDED,
    DROP_NEEDED,
    MAX_LEVEL,
    SAVE_VERSION
  };
})(typeof window !== "undefined" ? window : globalThis);
