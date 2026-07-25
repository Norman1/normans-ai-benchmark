// Tabernacle benchmark: a gallery of what each agent built, and a viewer to
// walk through them.

export const id = "tabernacle";
export const title = "Tabernacle";

const SUBMISSIONS_URL = "./benchmarks/tabernacle/submissions/index.json";

export async function mount(root) {
  root.innerHTML = `
    <div class="view-head">
      <h2>Tabernacle</h2>
      <p>Agents build an explorable walkthrough of the Mosaic Tabernacle that
         runs in the browser. Open one and walk through it.</p>
    </div>

    <div class="columns">
      <div class="panel">
        <h3>Rules</h3>
        <ul class="rules">
          <li>First person walkthrough</li>
          <li>Particle collision</li>
          <li>No gameplay features</li>
          <li>Bible fidelity</li>
          <li>Arrow keys move; click an object for a short text</li>
        </ul>
      </div>

      <div id="gallery"></div>
    </div>
  `;

  const gallery = root.querySelector("#gallery");
  let submissions = [];

  try {
    const manifest = await fetch(SUBMISSIONS_URL, { cache: "no-store" }).then((r) => r.json());
    submissions = manifest.submissions ?? [];
  } catch {
    gallery.innerHTML = `<div class="panel"><div class="empty">Could not read the submission manifest.</div></div>`;
    return;
  }

  gallery.innerHTML = submissions.length ? renderCards(submissions) : renderEmpty();

  gallery.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open]");
    if (!button) return;
    const submission = submissions.find((entry) => entry.id === button.dataset.open);
    if (submission) openViewer(submission);
  });

  return closeViewer;
}

function renderCards(submissions) {
  return `<div class="gallery">${submissions.map((submission) => `
    <article class="card">
      <div class="card-thumb">
        ${submission.thumbnail
          ? `<img src="${escapeAttr(submission.thumbnail)}" alt="" loading="lazy">`
          : `<span class="card-thumb-empty">No preview</span>`}
      </div>
      <div class="card-body">
        <h4>${escapeHtml(submission.title ?? submission.id)}</h4>
        <div class="card-meta">
          ${escapeHtml(submission.agent ?? "unknown")}${submission.created ? ` &middot; ${escapeHtml(submission.created)}` : ""}
        </div>
        ${submission.notes ? `<p class="card-notes">${escapeHtml(submission.notes)}</p>` : ""}
      </div>
      <div class="card-actions">
        <button data-open="${escapeAttr(submission.id)}" class="primary">Walk through</button>
        <a class="button-link" href="${escapeAttr(submission.entry)}" target="_blank" rel="noopener">New tab</a>
      </div>
    </article>`).join("")}</div>`;
}

function renderEmpty() {
  return `
    <div class="panel prose">
      <h3>No submissions yet</h3>
      <p>Add a folder under <code>submissions/</code> and list it in that
         folder's <code>index.json</code>. Brief:
         <code>benchmarks/tabernacle/SPEC.md</code>.</p>
    </div>`;
}

let overlay = null;

function openViewer(submission) {
  closeViewer();

  overlay = document.createElement("div");
  overlay.className = "viewer";
  overlay.innerHTML = `
    <header class="viewer-bar">
      <div>
        <b>${escapeHtml(submission.title ?? submission.id)}</b>
        <span class="muted-line">&middot; ${escapeHtml(submission.agent ?? "unknown")}</span>
      </div>
      <button class="viewer-close" aria-label="Close">&times;</button>
    </header>
    <iframe
      src="${escapeAttr(submission.entry)}"
      title="${escapeAttr(submission.title ?? submission.id)}"
      sandbox="allow-scripts allow-pointer-lock"></iframe>
  `;

  overlay.querySelector(".viewer-close").addEventListener("click", closeViewer);
  document.body.append(overlay);
  document.addEventListener("keydown", onKey);
}

function onKey(event) {
  if (event.key === "Escape") closeViewer();
}

function closeViewer() {
  document.removeEventListener("keydown", onKey);
  overlay?.remove();
  overlay = null;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

const escapeAttr = escapeHtml;
