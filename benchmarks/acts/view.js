// Acts benchmark: an interactive map of the book, driven by a timeline.

import { loadSubmissions, mountGallery } from "../../src/ui/gallery.js";

export const id = "acts";
export const title = "Acts";

const SUBMISSIONS_URL = "./benchmarks/acts/submissions/index.json";

const EMPTY = `
  <div class="panel prose">
    <h3>No submissions yet</h3>
    <p>Add a folder under <code>submissions/</code> and list it in that
       folder's <code>index.json</code>. Brief:
       <code>benchmarks/acts/SPEC.md</code>. Coordinates, coastline, provinces
       and roads are in <code>benchmarks/acts/mapdata/</code>.</p>
  </div>`;

export async function mount(root) {
  root.innerHTML = `
    <div class="view-head">
      <h2>Acts</h2>
      <p>Agents build an interactive map of the book of Acts. A reader meets
         &ldquo;they sailed from Troas to Neapolis&rdquo; and it means nothing;
         the job is to make those places real.</p>
    </div>

    <div class="columns">
      <div>
        <div class="panel">
          <h3>Rules</h3>
          <ul class="rules">
            <li>A timeline slider is the spine</li>
            <li>It moves through the narrative, not dated years</li>
            <li>Slider position decides what you can do</li>
            <li>Toggleable overlays for how the faith spread</li>
            <li>The whole book, not just Paul</li>
            <li>Ancient map, provinces drawn as regions</li>
            <li>No Bible verses</li>
          </ul>
        </div>

        <div class="panel">
          <h3>Bundled data</h3>
          <table class="data">
            <tbody>
              <tr><td>Places in Acts</td><td class="num">76</td></tr>
              <tr><td>Coastline</td><td class="num">1401</td></tr>
              <tr><td>Road segments</td><td class="num">2330</td></tr>
              <tr><td>Region labels</td><td class="num">1833</td></tr>
              <tr><td>Province borders</td><td class="num">56</td></tr>
            </tbody>
          </table>
          <p class="card-notes">Coordinates from Pleiades, geometry from the
             Ancient World Mapping Center. Ancient shoreline &mdash; Ephesus was
             a port, and today it sits five kilometres inland.</p>
        </div>
      </div>

      <div id="gallery"></div>
    </div>
  `;

  const host = root.querySelector("#gallery");
  try {
    return mountGallery(host, await loadSubmissions(SUBMISSIONS_URL), { emptyHtml: EMPTY });
  } catch {
    host.innerHTML = `<div class="panel"><div class="empty">Could not read the submission manifest.</div></div>`;
  }
}
