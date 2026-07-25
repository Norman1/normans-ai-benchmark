# Bot Author Guide

A bot is **one self-contained ES module**. No dependencies, no build step, no
filesystem. It runs in a Web Worker inside the benchmark page.

```js
export const meta = { id: "my-bot", name: "My Bot", author: "<model>" };

export function pick(request) { return { picks: ["t144", "t12"] }; }
export function turn(request) { return { orders: { deployments: [], orders: [] } }; }
export function gameOver(request) {}   // optional
```

Add an entry to `bots/index.json` — a static site has no directory listing, so
that manifest is how the page finds your bot.

## What the sandbox takes away

Before your module loads, the worker strips `fetch`, `XMLHttpRequest`,
`WebSocket`, `EventSource`, `importScripts`, `indexedDB`, `caches`,
`BroadcastChannel`, `SharedArrayBuffer` and `navigator`. `BroadcastChannel`
matters most: without it, two bots in the same page could simply talk to each
other.

It also replaces every source of ambient nondeterminism:

| You call | You get |
|---|---|
| `Math.random()` | Seeded PRNG, derived from the match seed |
| `Date.now()`, `performance.now()` | Always `0` |
| `new Date()` | Epoch |

This is not negotiable and it is not hostile: **same seed plus same bots must
reproduce a match exactly, forever.** A bot that branches on wall-clock produces
a different game every run, and then the replay stops being evidence.

## Two limits

**`budgetNodes`** — a deterministic work allowance carried on every request.
This is what you steer by. It is reproducible on any machine, so it is the
limit that decides matches fairly.

**A wall-clock timeout** — 300ms per reply by default, configurable per match.
**Overrunning it loses the game.** Since the clock is stubbed inside the worker
you cannot see it approaching, so treat it as a guard against getting stuck
rather than a resource to spend: budget your search in nodes, never in
milliseconds, and keep well clear.

## `pick(request)`

Both bots commit their full preference list blind and simultaneously.

```js
{
  type: "pick", protocolVersion: 1, playerId: 0,
  botSeed: 3819085840, budgetNodes: 200000,
  rules: { /* frozen RULES */ },
  map: { id, name, territories, bonuses },
  distribution: ["t144", "t12"],   // one territory per non-zero bonus
  availablePicks: ["t144"],        // distribution minus wastelands
  wastelands: ["t128"],
  requiredPicks: 6
}
```

Reply `{ picks: [...] }` in preference order. Both bots may rank the same
territory. Allocation runs a snake draft (`A B B A A B`); on each slot a player
receives their highest-ranked still-available territory. Submit too few and the
engine fills from what is left.

## `turn(request)`

```js
{
  type: "turn", protocolVersion: 1, playerId: 0,
  botSeed: 1238142772, turn: 1, budgetNodes: 200000,
  observation: {
    playerId, turn,
    income: { total: 5, base: 5, completedBonuses: [] },
    lastTurnEvents: [ /* the full previous turn */ ],
    map: { /* territories, bonuses, adjacency */ },
    territories: [ /* see below */ ]
  }
}
```

There is no fog — you see the entire board, every turn. Each entry:

```js
{ id: "t144", name: "West China 144", bonusId: "west_china",
  x: 760.3, y: 112.9, neighbors: ["t55", "t119"],
  mine: true, owner: 0, armies: 7 }
```

`owner` is `0`, `1`, or `null` for neutral. `lastTurnEvents` is the previous
turn in full — every deploy, transfer and attack from both sides, with army
counts and combat results.

The uncertainty in this game is not *where* the opponent is. It is what they are
committing to **this turn**, at the same moment you are.

Reply:

```js
{ orders: {
    deployments: [{ territoryId: "t144", armies: 5 }],
    orders: [{ from: "t144", to: "t113", armies: 3, mode: "attackTransfer" }]
} }
```

Modes are `attackTransfer`, `attackOnly`, `transferOnly`. Percentage orders work
too: `{ from, to, byPercent: true, percent: 50 }`.

Any reply may carry a `thoughts` field with arbitrary JSON. It never touches game
logic — the replay stores it, so a bot can explain its reasoning turn by turn.

## Rules that shape order generation

- One army must stand guard: a territory with `N` armies can move at most `N-1`.
- Multi-attack is **off**. Armies that capture cannot move again that turn.
- A failed attack retreats survivors to the source; they are still spent.
- Deployments and moves use **cycle order**, alternating by turn and by round,
  and it is deliberately hidden from observations.
- Offence kills 60% of what it sends; defence kills 70% of what it faces.
- **0% luck, straight rounding** — so combat is exactly plannable. Against 2
  neutrals, 3 attackers capture with 2 survivors: `round(3 × 0.6) = 2` kills the
  defenders, `round(2 × 0.7) = 1` kills one attacker.
- No cards. Income is base 5 plus completed bonuses; territory count pays
  nothing.
- Invalid orders are skipped, not fatal. Underspent income is force-deployed on
  your first territory — but deploy deliberately.
- Winner is decided by **elimination only**. Reaching turn 80 is a draw.

## Practical advice

Start deterministic before adding randomness. During picking, value bonus income
per territory, compactness, and starts not trapped behind wastelands. During
turns, spend all income, expand efficiently into low neutrals, and hold armies
where the border actually is. Since you can see everything, the edge is in
reading intent: `lastTurnEvents` shows where the opponent is massing and which
bonus they are working toward.

Read `bots/starter-greedy/bot.js` and `bots/starter-turtle/bot.js` for runnable
examples. They are intentionally simple.
