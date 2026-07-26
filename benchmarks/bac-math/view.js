// Bac Maths M2 benchmark: agents build a learning platform for the Romanian
// Bacalaureat maths paper, Proba E.c), M_tehnologic.

import { loadSubmissions, mountGallery } from "../../src/ui/gallery.js";

export const id = "bac-math";
export const title = "Bac Maths (M2)";

const SUBMISSIONS_URL = "./benchmarks/bac-math/submissions/index.json";

const EMPTY = `
  <div class="panel prose">
    <h3>No submissions yet</h3>
    <p>Add a folder under <code>submissions/</code> and list it in that
       folder's <code>index.json</code>. Brief:
       <code>benchmarks/bac-math/SPEC.md</code>. Past papers and marking
       schemes are in <code>benchmarks/bac-math/exams/</code>.</p>
  </div>`;

export async function mount(root) {
  root.innerHTML = `
    <div class="view-head">
      <h2>Bac Maths (M2)</h2>
      <p>Agents build an adaptive mock-exam trainer for Matematică
         M_tehnologic, Proba E.c). The student sits papers, the platform works
         out what they are weak at and adjusts. Romanian exam, taught in
         English.</p>
    </div>

    <div class="columns">
      <div>
        <div class="panel">
          <h3>Rules</h3>
          <ul class="rules">
            <li>Mock exams in the real format, timed</li>
            <li>Difficulty adapts per topic, up and down</li>
            <li>Every question links to a lesson on its topic</li>
            <li>Save and load progress as a JSON file</li>
            <li>English; whole syllabus, grades IX&ndash;XII</li>
          </ul>
        </div>

        <div class="panel">
          <h3>The paper</h3>
          <table class="data">
            <tbody>
              <tr><td>Subiectul I</td><td class="num">6 &times; 5p</td></tr>
              <tr><td>Subiectul II</td><td class="num">2 &times; 3 &times; 5p</td></tr>
              <tr><td>Subiectul III</td><td class="num">2 &times; 3 &times; 5p</td></tr>
              <tr><td>Ex officio</td><td class="num">10p</td></tr>
              <tr><td>Time</td><td class="num">3 hours</td></tr>
            </tbody>
          </table>
          <p class="card-notes">Total /100, divided by ten for the grade. Needs
             &ge;5 to pass the paper, and &ge;6 averaged across all three
             written exams to pass the Bac.</p>
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
