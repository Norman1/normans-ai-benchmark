// Builds the source for a bot's Web Worker.
//
// Two jobs, and they are separate concerns:
//
//   1. Capability stripping — a bot should not be able to phone home, read
//      storage, or talk to the other bot running in the same page. That last one
//      matters most: two workers sharing a BroadcastChannel is a collusion
//      channel the old process-per-bot design never had to worry about.
//
//   2. Determinism — same seed plus same bots must reproduce a match exactly,
//      forever. That means no wall-clock and no unseeded randomness, because a
//      bot that branches on `Date.now()` produces a different game every run and
//      the replay stops being evidence.
//
// This is not a hardened sandbox against hostile code. A bot can still burn CPU
// (handled by terminate()) and dynamic import() of a remote URL is only blocked
// by the page's CSP, not by anything in here. For a private benchmark where I
// choose which bots to run, that is the right amount of paranoia.

const STRIPPED = [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "importScripts",
  "indexedDB",
  "caches",
  "BroadcastChannel",
  "SharedArrayBuffer",
  "Notification",
  "navigator"
];

/**
 * @param {string} botUrl  Absolute URL of the bot's ES module.
 * @param {number} seed    Bot-side RNG seed, derived from the match seed.
 */
export function buildWorkerSource(botUrl, seed) {
  return `
const STRIPPED = ${JSON.stringify(STRIPPED)};
for (const name of STRIPPED) {
  try {
    Object.defineProperty(self, name, { value: undefined, configurable: false, writable: false });
  } catch {
    try { delete self[name]; } catch {}
  }
}

// Deterministic replacements for every source of ambient nondeterminism a bot
// could reach. Bots get a real RNG — it is just seeded and reproducible.
let rngState = ${seed >>> 0} || 1;
Math.random = function random() {
  rngState ^= rngState << 13; rngState >>>= 0;
  rngState ^= rngState >> 17;
  rngState ^= rngState << 5;  rngState >>>= 0;
  return rngState / 4294967296;
};

const FROZEN_TIME = 0;
Date.now = () => FROZEN_TIME;
if (typeof performance !== "undefined") performance.now = () => FROZEN_TIME;
const RealDate = Date;
self.Date = new Proxy(RealDate, {
  construct(target, args) {
    return args.length === 0 ? new target(FROZEN_TIME) : new target(...args);
  }
});

let bot = null;
const loading = import(${JSON.stringify(botUrl)})
  .then((module) => { bot = module; })
  .catch((error) => { bot = { __loadError: String(error && error.stack || error) }; });

self.onmessage = async (event) => {
  const { id, type, request } = event.data;
  await loading;

  if (bot && bot.__loadError) {
    self.postMessage({ id, ok: false, error: "bot failed to load: " + bot.__loadError });
    return;
  }

  if (type === "gameOver") {
    if (typeof bot.gameOver === "function") {
      try { bot.gameOver(request); } catch {}
    }
    self.postMessage({ id, ok: true, reply: null });
    return;
  }

  const handler = bot[type];
  if (typeof handler !== "function") {
    self.postMessage({ id, ok: false, error: 'bot does not export a "' + type + '" function' });
    return;
  }

  try {
    const reply = await handler(request);
    self.postMessage({ id, ok: true, reply });
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error && error.stack || error) });
  }
};

self.postMessage({ id: "ready", ok: true });
`;
}
