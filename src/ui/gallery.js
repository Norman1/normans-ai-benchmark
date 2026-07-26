// Shared submission gallery and viewer.
//
// Two benchmarks now show "here is what each agent built, open one" — so this
// lives here rather than being copied. A benchmark supplies its manifest URL
// and its own empty-state copy; everything else is identical, which is the
// point: submissions are framed on the same terms whichever benchmark they
// belong to.

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

export async function loadSubmissions(url) {
  const manifest = await fetch(url, { cache: "no-store" }).then((r) => r.json());
  return manifest.submissions ?? [];
}

/**
 * Fill `host` with cards, wire up the viewer, and return a cleanup function.
 *
 * @param {string} emptyHtml   Shown when there are no submissions yet.
 * @param {string} openLabel   Button wording — "walk through" reads better for
 *                             a 3D space than a generic "open".
 */
export function mountGallery(host, submissions, { emptyHtml, openLabel = "Open" }) {
  host.innerHTML = submissions.length ? renderCards(submissions, openLabel) : emptyHtml;

  const onClick = (event) => {
    const button = event.target.closest("[data-open]");
    if (!button) return;
    const submission = submissions.find((entry) => entry.id === button.dataset.open);
    if (submission) openViewer(submission);
  };

  host.addEventListener("click", onClick);
  return () => {
    host.removeEventListener("click", onClick);
    closeViewer();
  };
}

function renderCards(submissions, openLabel) {
  return `<div class="gallery">${submissions.map((submission) => `
    <article class="card">
      <div class="card-body">
        <h4>${escapeHtml(submission.title ?? submission.id)}</h4>
        <div class="card-meta">
          ${escapeHtml(submission.agent ?? "unknown")}${submission.created ? ` &middot; ${escapeHtml(submission.created)}` : ""}
        </div>
        ${submission.notes ? `<p class="card-notes">${escapeHtml(submission.notes)}</p>` : ""}
      </div>
      <div class="card-actions">
        <button data-open="${escapeHtml(submission.id)}" class="primary">${escapeHtml(openLabel)}</button>
      </div>
    </article>`).join("")}</div>`;
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
      src="${escapeHtml(submission.entry)}"
      title="${escapeHtml(submission.title ?? submission.id)}"
      sandbox="allow-scripts allow-pointer-lock allow-downloads"></iframe>
  `;

  overlay.querySelector(".viewer-close").addEventListener("click", closeViewer);
  document.body.append(overlay);
  document.addEventListener("keydown", onKey);
}

function onKey(event) {
  if (event.key === "Escape") closeViewer();
}

export function closeViewer() {
  document.removeEventListener("keydown", onKey);
  overlay?.remove();
  overlay = null;
}
