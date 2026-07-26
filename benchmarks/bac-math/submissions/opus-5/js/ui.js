// Rendering helpers shared by the three views.

(function (global) {
  "use strict";

  const BAC = (global.BAC = global.BAC || {});

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "html") node.innerHTML = value;
      else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : String(value));
    }
    for (const child of children.flat()) {
      if (child == null || child === false) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  /**
   * Typographic minus in generated prose.
   *
   * Generators interpolate raw JavaScript numbers into their explanations, so
   * a negative one arrives as "-5" with a hyphen. Fixing it at render time
   * keeps every generator free of the concern — and only text nodes are
   * touched, so markup and MathML attributes are left alone.
   */
  const prose = (html) => String(html)
    .replace(/(<[^>]*>)|([^<]+)/g, (match, tag, text) => (tag != null ? tag : text.replace(/-(?=\d)/g, "−")));

  const escapeHtml = (value) => String(value)
    .replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  /** Level as five pips, filled up to `level`. */
  function levelPips(level, options = {}) {
    return el("span", { class: `pips${options.small ? " pips-small" : ""}`, title: `Level ${level} of 5` },
      [1, 2, 3, 4, 5].map((index) =>
        el("i", { class: index <= level ? `on l${level}` : "off" })));
  }

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const pad = (value) => String(value).padStart(2, "0");
    return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
  }

  /* --- overlay ---------------------------------------------------------- */

  let overlayNode = null;

  function closeOverlay() {
    overlayNode?.remove();
    overlayNode = null;
    document.removeEventListener("keydown", overlayKeys);
  }

  function overlayKeys(event) {
    if (event.key === "Escape") closeOverlay();
  }

  function openOverlay(title, bodyNode, subtitle) {
    closeOverlay();
    overlayNode = el("div", { class: "overlay", onclick: (event) => { if (event.target === overlayNode) closeOverlay(); } },
      el("div", { class: "overlay-card", role: "dialog", "aria-label": title },
        el("header", { class: "overlay-head" },
          el("div", {},
            el("h2", {}, title),
            subtitle ? el("p", { class: "overlay-sub", html: subtitle }) : null),
          el("button", { class: "icon-button", "aria-label": "Close", onclick: closeOverlay }, "×")),
        el("div", { class: "overlay-body" }, bodyNode)));
    document.body.append(overlayNode);
    document.addEventListener("keydown", overlayKeys);
    overlayNode.querySelector(".overlay-body").scrollTop = 0;
  }

  /* --- lesson ----------------------------------------------------------- */

  const BLOCK_LABEL = {
    method: "Method",
    example: "Worked example",
    trap: "Trap",
    workshop: "In the workshop",
    barem: "What the barem pays for"
  };

  function lessonNode(topicId) {
    const topic = BAC.bank.byId.get(topicId);
    const lesson = BAC.lessons[topicId];
    const wrap = el("div", { class: "lesson" });
    wrap.append(el("p", { class: "lesson-slot" }, lesson.onThePaper));

    for (const block of lesson.blocks) {
      if (block.kind === "text") {
        wrap.append(el("p", { class: "lesson-text", html: prose(block.body) }));
      } else if (block.kind === "method") {
        wrap.append(el("section", { class: "lesson-block method" },
          el("h4", {}, BLOCK_LABEL.method, block.title ? el("span", { class: "block-title" }, ` · ${block.title}`) : null),
          el("ol", {}, block.steps.map((step) => el("li", { html: prose(step) })))));
      } else if (block.kind === "example") {
        wrap.append(el("section", { class: "lesson-block example" },
          el("h4", {}, BLOCK_LABEL.example, block.title ? el("span", { class: "block-title" }, ` · ${block.title}`) : null),
          el("div", {}, block.lines.map((line) => el("p", { html: prose(line) })))));
      } else if (block.kind === "trap" || block.kind === "workshop" || block.kind === "barem") {
        wrap.append(el("section", { class: `lesson-block ${block.kind}` },
          el("h4", {}, BLOCK_LABEL[block.kind]),
          el("p", { html: prose(block.body) })));
      }
    }
    return wrap;
  }

  function openLesson(topicId) {
    const topic = BAC.bank.byId.get(topicId);
    const entry = BAC.progress.topicState(topicId);
    openOverlay(topic.name, lessonNode(topicId),
      `${BAC.bank.SUBJECTS[topic.slot]} · item ${topic.slot.split(".")[1]} &nbsp;·&nbsp; you are at level ${entry.level} of 5`);
  }

  /* --- toast ------------------------------------------------------------ */

  let toastTimer = null;

  function toast(message, kind = "") {
    const host = $("#toasts");
    host.replaceChildren(el("div", { class: `toast ${kind}`, html: message }));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => host.replaceChildren(), 4200);
  }

  BAC.ui = { $, $$, el, prose, escapeHtml, levelPips, formatTime, openOverlay, closeOverlay, openLesson, lessonNode, toast };
})(typeof window !== "undefined" ? window : globalThis);
