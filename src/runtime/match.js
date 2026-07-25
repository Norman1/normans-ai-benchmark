// Runs one 1v1 match entirely in the browser.
//
// Differs from the old Node runner in one behavioural way worth knowing: both
// bots are asked for their turn *concurrently* via Promise.all. The engine has
// always been simultaneous-commit, so this changes no outcome — it just stops
// one slow bot from serialising behind the other, which matters when you are
// running thousands of matches in a tab.

import { WarGame, createDraft, summarizeReplay } from "../engine/game.js";
import { MEDIUM_EARTH_MAP } from "../engine/map.js";
import { RULES } from "../engine/rules.js";
import { normalizeSeed } from "../engine/random.js";
import { BotHandle, BotFailure } from "./bot-handle.js";

/** Deterministic work allowance a bot may spend per request. See BOT_API.md. */
export const DEFAULT_BUDGET_NODES = 200_000;

/**
 * Wall-clock ceiling per reply. Overrun loses the game.
 *
 * This is a guard, not the resource a bot should plan against — the clock is
 * stubbed inside the worker, so a bot cannot see this coming and must steer by
 * budgetNodes instead. Set it loose enough that only genuinely stuck bots hit
 * it; a timeout tight enough to race would make results machine-dependent.
 */
export const DEFAULT_TIMEOUT_MS = 300;

export async function runMatch(botDefs, options = {}) {
  const seed = normalizeSeed(options.seed ?? 1);
  const maxTurns = options.maxTurns ?? RULES.maxTurns;
  const budgetNodes = options.budgetNodes ?? DEFAULT_BUDGET_NODES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const draft = createDraft(seed, MEDIUM_EARTH_MAP);

  const bots = botDefs.map((def, playerId) => new BotHandle({
    id: def.id,
    url: def.url,
    seed: normalizeSeed(`${seed}:bot:${playerId}`),
    timeoutMs
  }));

  const pickOrders = [[], []];
  const thoughts = {};
  let failure = null;
  let failedPlayer = null;

  const note = (turn, playerId, response) => {
    if (response && typeof response === "object" && "thoughts" in response) {
      (thoughts[turn] ??= {})[playerId] = response.thoughts;
    }
  };

  try {
    // --- Picking: both bots commit blind, concurrently. --------------------
    const pickRequests = [0, 1].map((playerId) => bots[playerId].request("pick", {
      protocolVersion: 1,
      playerId,
      botSeed: normalizeSeed(`${seed}:bot:${playerId}:pick`),
      budgetNodes,
      rules: { ...RULES },
      map: publicMap(),
      distribution: draft.distribution,
      availablePicks: draft.availablePicks,
      wastelands: draft.wastelands,
      requiredPicks: RULES.picksPerPlayer
    }));

    const pickResults = await Promise.allSettled(pickRequests);
    for (let playerId = 0; playerId < 2; playerId += 1) {
      const result = pickResults[playerId];
      if (result.status === "rejected") {
        failure ??= result.reason;
        failedPlayer ??= playerId;
        continue;
      }
      pickOrders[playerId] = normalizePicks(result.value?.picks, draft.availablePicks);
      note(0, playerId, result.value);
    }

    const game = new WarGame({
      seed,
      draft,
      pickOrders,
      botNames: botDefs.map((def) => def.name ?? def.id)
    });
    game.replay.setup.submittedPicks = pickOrders;

    if (failure) {
      finishByFailure(game, failure, failedPlayer, 0);
    }

    // --- Turn loop --------------------------------------------------------
    while (!game.finished && game.turn <= maxTurns) {
      const turn = game.turn;
      const results = await Promise.allSettled([0, 1].map((playerId) => bots[playerId].request("turn", {
        protocolVersion: 1,
        playerId,
        botSeed: normalizeSeed(`${seed}:bot:${playerId}:turn:${turn}`),
        turn,
        budgetNodes,
        observation: game.buildObservation(playerId)
      })));

      const turnOrders = [];
      for (let playerId = 0; playerId < 2; playerId += 1) {
        const result = results[playerId];
        if (result.status === "rejected") {
          failure ??= result.reason;
          failedPlayer ??= playerId;
          continue;
        }
        turnOrders[playerId] = result.value?.orders ?? result.value ?? {};
        note(turn, playerId, result.value);
      }

      if (failure) {
        finishByFailure(game, failure, failedPlayer, turn);
        break;
      }
      game.runTurn(turnOrders);
    }

    if (!game.finished) {
      game.finished = true;
      game.result = {
        winner: null,
        loser: null,
        reason: "turn_limit_draw",
        turn: game.replay.frames.at(-1)?.turn ?? maxTurns
      };
      game.replay.result = game.result;
    }

    game.replay.thoughts = thoughts;
    game.replay.botFailure = failure
      ? { botId: failure.botId, playerId: failedPlayer, detail: failure.detail ?? failure.message }
      : null;

    await Promise.allSettled([0, 1].map((playerId) =>
      bots[playerId].request("gameOver", { playerId, result: game.result })
    ));

    return { replay: game.replay, summary: summarizeReplay(game.replay) };
  } finally {
    for (const bot of bots) bot.dispose();
  }
}

function finishByFailure(game, failure, playerId, turn) {
  game.finished = true;
  game.result = {
    winner: playerId === 0 ? 1 : 0,
    loser: playerId,
    reason: "bot_failure",
    detail: failure instanceof BotFailure ? failure.detail : String(failure),
    turn
  };
  game.replay.result = game.result;
}

/** Picks the bot sent, filtered to legal ones and de-duplicated, order preserved. */
function normalizePicks(picks, availablePicks) {
  if (!Array.isArray(picks)) return [];
  const available = new Set(availablePicks);
  const seen = new Set();
  const clean = [];
  for (const territoryId of picks) {
    if (typeof territoryId !== "string") continue;
    if (!available.has(territoryId) || seen.has(territoryId)) continue;
    seen.add(territoryId);
    clean.push(territoryId);
  }
  return clean;
}

function publicMap() {
  return {
    id: MEDIUM_EARTH_MAP.id,
    name: MEDIUM_EARTH_MAP.name,
    territories: MEDIUM_EARTH_MAP.territories,
    bonuses: MEDIUM_EARTH_MAP.bonuses
  };
}
