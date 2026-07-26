// Tabernacle benchmark: a gallery of what each agent built, and a viewer to
// walk through them.

import { loadSubmissions, mountGallery } from "../../src/ui/gallery.js";

export const id = "tabernacle";
export const title = "Tabernacle";

const SUBMISSIONS_URL = "./benchmarks/tabernacle/submissions/index.json";

const EMPTY = `
  <div class="panel prose">
    <h3>No submissions yet</h3>
    <p>Add a folder under <code>submissions/</code> and list it in that
       folder's <code>index.json</code>. Brief:
       <code>benchmarks/tabernacle/SPEC.md</code>.</p>
  </div>`;

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

  const host = root.querySelector("#gallery");
  try {
    return mountGallery(host, await loadSubmissions(SUBMISSIONS_URL), { emptyHtml: EMPTY, openLabel: "Walk through" });
  } catch {
    host.innerHTML = `<div class="panel"><div class="empty">Could not read the submission manifest.</div></div>`;
  }
}
