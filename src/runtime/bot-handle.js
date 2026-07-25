// Main-thread handle for one bot running in one Worker.
//
// On the timeout: the *fair, reproducible* limit is `budgetNodes`, a deterministic
// work allowance the bot spends and self-tracks (see BOT_API.md). The wall-clock
// timeout here is only a safety net for runaway loops — terminate() is the one
// thing that reliably kills an infinite `while (true)`. A correct bot never
// reaches it, so it does not affect reproducibility in practice.

import { buildWorkerSource } from "./sandbox.js";

export class BotHandle {
  #worker = null;
  #pending = new Map();
  #nextId = 1;
  #blobUrl = null;
  #dead = null;

  constructor({ id, url, seed, timeoutMs = 5000 }) {
    this.id = id;
    this.url = url;
    this.timeoutMs = timeoutMs;

    const source = buildWorkerSource(new URL(url, location.href).href, seed);
    this.#blobUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
    this.#worker = new Worker(this.#blobUrl, { type: "module", name: `bot:${id}` });

    this.#worker.onmessage = (event) => {
      const { id: requestId, ok, reply, error } = event.data;
      const entry = this.#pending.get(requestId);
      if (!entry) return;
      this.#pending.delete(requestId);
      clearTimeout(entry.timer);
      ok ? entry.resolve(reply) : entry.reject(new BotFailure(this.id, error));
    };

    this.#worker.onerror = (event) => {
      this.#failAll(new BotFailure(this.id, event.message ?? "worker error"));
    };
  }

  get dead() {
    return this.#dead;
  }

  /** Send a request and await the bot's reply. Rejects with BotFailure. */
  request(type, payload) {
    if (this.#dead) return Promise.reject(this.#dead);

    const requestId = this.#nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(requestId);
        const failure = new BotFailure(this.id, `exceeded ${this.timeoutMs}ms safety timeout on "${type}"`);
        this.#failAll(failure);
        reject(failure);
      }, this.timeoutMs);

      this.#pending.set(requestId, { resolve, reject, timer });
      this.#worker.postMessage({ id: requestId, type, request: payload });
    });
  }

  #failAll(failure) {
    this.#dead = failure;
    for (const [, entry] of this.#pending) {
      clearTimeout(entry.timer);
      entry.reject(failure);
    }
    this.#pending.clear();
    this.dispose();
  }

  dispose() {
    this.#worker?.terminate();
    this.#worker = null;
    if (this.#blobUrl) {
      URL.revokeObjectURL(this.#blobUrl);
      this.#blobUrl = null;
    }
  }
}

export class BotFailure extends Error {
  constructor(botId, detail) {
    super(`${botId}: ${detail}`);
    this.name = "BotFailure";
    this.botId = botId;
    this.detail = detail;
  }
}
