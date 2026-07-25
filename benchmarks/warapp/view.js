// War.app benchmark: run a match, then watch it.
//
// No scoring layer. You judge strength by watching, so playback is the product
// here — not a debugging afterthought.

import { MEDIUM_EARTH_MAP } from "../../src/engine/map.js";
import { runMatch } from "../../src/runtime/match.js";
import { buildBoard, loadGeometry, renderFrame } from "./board.js";

export const id = "warapp";
export const title = "War.app bots";

const BOTS_URL = "./bots/index.json";
const SPEEDS = [
  { label: "0.5×", ms: 900 },
  { label: "1×", ms: 450 },
  { label: "2×", ms: 200 },
  { label: "4×", ms: 80 }
];

export async function mount(root) {
  root.innerHTML = `
    <div class="view-head">
      <h2>War.app bots</h2>
      <p>A Warzone-style 1v1 on Medium Earth. Both sides commit their whole turn
         blind and it resolves at once &mdash; full board visibility, 0% luck,
         elimination only.</p>
    </div>

    <div class="columns">
      <div class="panel">
        <h3>Match</h3>
        <label class="field">Bot A<select id="botA"></select></label>
        <label class="field">Bot B<select id="botB"></select></label>
        <label class="field">Seed<input id="seed" value="42"></label>
        <label class="field">Timeout per move (ms)<input id="timeout" type="number" min="50" step="50" value="300"></label>
        <div class="button-row"><button id="run" class="primary">Run match</button></div>
        <div id="outcome" class="outcome"></div>
      </div>

      <div>
        <div class="panel board-panel">
          <div class="board-toolbar">
            <div id="boardTitle">No match loaded</div>
            <div class="legend">
              <span><i class="p0"></i> <b id="nameA">Bot A</b> <span id="statA"></span></span>
              <span><i class="p1"></i> <b id="nameB">Bot B</b> <span id="statB"></span></span>
            </div>
          </div>

          <div class="board-wrap"><svg id="board" role="img" aria-label="Medium Earth board"></svg></div>

          <div class="playback">
            <button id="play" class="play" disabled>&#9654;</button>
            <button id="turnBack" title="Previous turn" disabled>&#171;</button>
            <button id="stepBack" title="Previous step" disabled>&#8249;</button>
            <button id="stepFwd" title="Next step" disabled>&#8250;</button>
            <button id="turnFwd" title="Next turn" disabled>&#187;</button>
            <input id="scrub" type="range" min="0" max="0" value="0" disabled>
            <select id="speed" class="speed">
              ${SPEEDS.map((speed, index) => `<option value="${index}"${index === 1 ? " selected" : ""}>${speed.label}</option>`).join("")}
            </select>
            <div id="frameLabel" class="frame-label">&mdash;</div>
          </div>
        </div>

        <div class="panel">
          <h3>This step</h3>
          <div id="stepDetail" class="empty">Run a match to watch it play out.</div>
        </div>
      </div>
    </div>
  `;

  const el = (name) => root.querySelector(`#${name}`);
  const controls = ["play", "turnBack", "stepBack", "stepFwd", "turnFwd", "scrub"].map(el);

  const manifest = await fetch(BOTS_URL, { cache: "no-store" }).then((r) => r.json());
  const bots = manifest.bots ?? [];
  for (const select of [el("botA"), el("botB")]) {
    select.replaceChildren(...bots.map((bot) => new Option(bot.name, bot.id)));
  }
  // Default to a mirror match. With no submissions yet, a starter against
  // itself is the honest baseline — it shows what the game looks like without
  // pretending one hand-written bot beating another means anything.

  const geometry = await loadGeometry();
  const board = buildBoard(el("board"), MEDIUM_EARTH_MAP, geometry);
  const territoryName = new Map(MEDIUM_EARTH_MAP.territories.map((t) => [t.id, t.name]));

  let replay = null;
  let timer = null;

  const stopPlayback = () => {
    clearInterval(timer);
    timer = null;
    el("play").innerHTML = "&#9654;";
  };

  function paint() {
    if (!replay) return;
    const index = Number(el("scrub").value);
    const frame = replay.frames[index];
    renderFrame(board, frame);

    el("frameLabel").textContent = `Turn ${frame.turn} · ${frame.phase} · ${index + 1}/${replay.frames.length}`;

    const counts = [0, 0];
    for (const state of Object.values(frame.territories)) {
      if (state.owner === 0 || state.owner === 1) counts[state.owner] += 1;
    }
    el("statA").textContent = `${counts[0]} · +${frame.incomes?.[0]?.total ?? 0}`;
    el("statB").textContent = `${counts[1]} · +${frame.incomes?.[1]?.total ?? 0}`;

    const event = frame.currentEventIndex != null ? frame.events?.[frame.currentEventIndex] : null;
    el("stepDetail").innerHTML = event
      ? describe(event, replay.players, territoryName)
      : `<span class="empty">Start of turn ${frame.turn}.</span>`;

    if (index >= replay.frames.length - 1) stopPlayback();
  }

  const seek = (index) => {
    el("scrub").value = String(Math.max(0, Math.min(replay.frames.length - 1, index)));
    paint();
  };

  el("scrub").addEventListener("input", () => { stopPlayback(); paint(); });
  el("stepBack").addEventListener("click", () => { stopPlayback(); seek(Number(el("scrub").value) - 1); });
  el("stepFwd").addEventListener("click", () => { stopPlayback(); seek(Number(el("scrub").value) + 1); });

  const jumpTurn = (direction) => {
    stopPlayback();
    const from = Number(el("scrub").value);
    const currentTurn = replay.frames[from].turn;
    for (let i = from + direction; i >= 0 && i < replay.frames.length; i += direction) {
      if (replay.frames[i].turn !== currentTurn) {
        // Land on the first frame of that turn, whichever way we came.
        let target = i;
        while (direction < 0 && target > 0 && replay.frames[target - 1].turn === replay.frames[i].turn) target -= 1;
        return seek(target);
      }
    }
    seek(direction < 0 ? 0 : replay.frames.length - 1);
  };
  el("turnBack").addEventListener("click", () => jumpTurn(-1));
  el("turnFwd").addEventListener("click", () => jumpTurn(1));

  const startPlayback = () => {
    if (Number(el("scrub").value) >= replay.frames.length - 1) el("scrub").value = "0";
    el("play").innerHTML = "&#10073;&#10073;";
    timer = setInterval(() => seek(Number(el("scrub").value) + 1), SPEEDS[Number(el("speed").value)].ms);
  };
  el("play").addEventListener("click", () => (timer ? stopPlayback() : startPlayback()));
  el("speed").addEventListener("change", () => { if (timer) { stopPlayback(); startPlayback(); } });

  el("run").addEventListener("click", async () => {
    const aId = el("botA").value;
    const bId = el("botB").value;
    const defOf = (botId) => bots.find((bot) => bot.id === botId);

    stopPlayback();
    el("run").disabled = true;
    el("outcome").textContent = "Running…";

    try {
      const result = await runMatch([defOf(aId), defOf(bId)], {
        seed: el("seed").value,
        timeoutMs: Math.max(50, Number(el("timeout").value) || 300)
      });
      replay = result.replay;

      el("nameA").textContent = aId;
      el("nameB").textContent = bId;
      el("boardTitle").textContent = `${aId} vs ${bId} — seed ${result.summary.seed}`;
      for (const control of controls) control.disabled = false;
      el("scrub").max = String(replay.frames.length - 1);
      seek(0);

      const { winner, reason } = result.summary.result;
      // Always show the final split. A turn-limit draw can be 130-1, and
      // "Draw" on its own would hide that completely.
      const [finalA, finalB] = result.summary.territoryCounts;
      const split = `<span class="muted-line">${aId} ${finalA} &ndash; ${finalB} ${bId}</span>`;
      el("outcome").innerHTML = winner === null
        ? `<b>Draw</b> <span class="muted-line">&middot; ${reason}, turn ${result.summary.turns}</span><br>${split}`
        : `<b>${winner === 0 ? aId : bId} won</b> <span class="muted-line">&middot; ${reason}, turn ${result.summary.turns}</span><br>${split}`;
    } catch (error) {
      el("outcome").innerHTML = `<b class="bad">Failed</b><br><span class="muted-line">${escapeHtml(error.message ?? error)}</span>`;
    } finally {
      el("run").disabled = false;
    }
  });

  return stopPlayback;
}

function describe(event, players, names) {
  const who = players?.[event.playerId] ?? `Player ${event.playerId + 1}`;
  const at = (territoryId) => escapeHtml(names.get(territoryId) ?? territoryId);
  const tag = `<span class="who p${event.playerId}">${escapeHtml(who)}</span>`;

  if (event.type === "deploy") {
    return `${tag} deployed <b>${event.armies}</b> to ${at(event.territoryId)}${event.fallback ? " <i>(unspent income)</i>" : ""}`;
  }
  if (event.type === "transfer") {
    return `${tag} moved <b>${event.armies}</b> from ${at(event.from)} to ${at(event.to)}`;
  }
  if (event.type === "attack") {
    const verdict = event.captured
      ? `<b class="good">captured</b> with ${event.remainingAttackers} left`
      : `<b class="bad">repelled</b>, ${event.remainingDefenders} defenders hold`;
    return `${tag} attacked ${at(event.to)} from ${at(event.from)} with <b>${event.armies}</b>
            vs ${event.defendingArmies} — ${verdict}`;
  }
  return escapeHtml(event.type);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
