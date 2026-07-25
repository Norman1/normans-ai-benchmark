// Site shell: left menu and hash router.
//
// Benchmarks are registered here and nowhere else. Each is a module exporting
// `{ id, title, mount(root) }`, so adding a third is one import and one entry.

import * as warapp from "../../benchmarks/warapp/view.js";
import * as tabernacle from "../../benchmarks/tabernacle/view.js";

const BENCHMARKS = [warapp, tabernacle];

const menuEl = document.getElementById("menu");
const mainEl = document.getElementById("main");

let activeCleanup = null;

function renderMenu(activeId) {
  menuEl.replaceChildren(...BENCHMARKS.map((benchmark) => {
    const link = document.createElement("a");
    link.href = `#/${benchmark.id}`;
    link.textContent = benchmark.title;
    if (benchmark.id === activeId) link.classList.add("active");
    return link;
  }));
}

function currentId() {
  const id = location.hash.replace(/^#\/?/, "");
  return BENCHMARKS.some((benchmark) => benchmark.id === id) ? id : BENCHMARKS[0].id;
}

async function route() {
  const id = currentId();
  const benchmark = BENCHMARKS.find((entry) => entry.id === id);

  activeCleanup?.();
  activeCleanup = null;
  mainEl.replaceChildren();

  renderMenu(id);
  activeCleanup = (await benchmark.mount(mainEl)) ?? null;
}

window.addEventListener("hashchange", route);
route();
