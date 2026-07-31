import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SUBMISSIONS = join(ROOT, "benchmarks", "tabernacle", "submissions");
const SUBMISSION_ID = "gpt-5-6-sol-xhigh";
const SUBMISSION = join(SUBMISSIONS, SUBMISSION_ID);

const EXPECTED_DIMENSIONS = {
  unit: "cubit",
  court: { length: 100, width: 50, height: 5 },
  tent: { length: 30, width: 10, height: 10 },
  ark: { length: 2.5, width: 1.5, height: 1.5 },
  table: { length: 2, width: 1, height: 1.5 },
  altarOfIncense: { length: 1, width: 1, height: 2 },
  bronzeAltar: { length: 5, width: 5, height: 3 },
  curtains: { count: 10, length: 28, width: 4 },
  goatHairCurtains: { count: 11, length: 30, width: 4 }
};

test("submission manifest points to a complete local entry", async () => {
  const manifest = JSON.parse(await readFile(join(SUBMISSIONS, "index.json"), "utf8"));
  const entry = manifest.submissions.find((candidate) => candidate.id === SUBMISSION_ID);
  assert.ok(entry, `${SUBMISSION_ID} is missing from the submission manifest`);
  assert.equal(entry.title, "GPT-5.6 Sol · Extra High solution");
  assert.equal(entry.agent, "GPT-5.6 Sol · Extra High");
  assert.equal(
    entry.entry,
    "./benchmarks/tabernacle/submissions/gpt-5-6-sol-xhigh/index.html"
  );
  assert.equal(entry.thumbnail, undefined);

  const entryPath = join(ROOT, entry.entry.replace(/^\.\//, ""));
  assert.equal((await readFile(entryPath, "utf8")).startsWith("<!doctype html>"), true);
});

test("gallery presents only the embedded walkthrough action", async () => {
  // The card markup moved into the shared gallery; the Tabernacle view now
  // just supplies the button wording.
  const view = await readFile(join(ROOT, "benchmarks", "tabernacle", "view.js"), "utf8");
  const gallery = await readFile(join(ROOT, "src", "ui", "gallery.js"), "utf8");
  assert.match(view, /openLabel: "Walk through"/);
  assert.match(gallery, /data-open="\$\{escapeHtml\(submission\.id\)\}" class="primary">\$\{escapeHtml\(openLabel\)\}<\/button>/);
  assert.doesNotMatch(gallery, />New tab<\/a>/);
});

test("declared dimensions exactly match the benchmark brief", async () => {
  const html = await readFile(join(SUBMISSION, "index.html"), "utf8");
  const match = html.match(
    /<script type="application\/json" id="tabernacle-dimensions">([\s\S]*?)<\/script>/
  );
  assert.ok(match, "machine-readable dimension block is missing");
  assert.deepEqual(JSON.parse(match[1]), EXPECTED_DIMENSIONS);
  assert.match(html, /GPT-5\.6 Sol · Extra High solution/);
  assert.doesNotMatch(html, /The Dwelling/);
});

test("the walkthrough is offline, self-contained, and exposes required controls", async () => {
  const [html, css, script] = await Promise.all([
    readFile(join(SUBMISSION, "index.html"), "utf8"),
    readFile(join(SUBMISSION, "app.css"), "utf8"),
    readFile(join(SUBMISSION, "app.js"), "utf8")
  ]);
  const combined = `${html}\n${css}\n${script}`;

  assert.doesNotMatch(combined, /\bhttps?:\/\//i);
  assert.doesNotMatch(
    script,
    /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|localStorage|sessionStorage|indexedDB)\b/
  );
  assert.match(html, /<canvas[\s\S]*id="world"/);
  assert.match(html, /Arrow keys/i);
  assert.match(html, /<kbd>↑<\/kbd>[\s\S]*move/i);
  assert.match(script, /"ArrowUp"/);
  assert.match(script, /requestPointerLock/);
  assert.match(script, /function blocked\(/);
  assert.match(script, /camera\.radius/);

  for (const asset of ["./app.css", "./app.js"]) {
    const localPath = join(SUBMISSION, asset.replace(/^\.\//, ""));
    assert.ok((await readFile(localPath)).length > 0, `${asset} is missing`);
  }
});

test("every required place is inspectable and sourced", async () => {
  const script = await readFile(join(SUBMISSION, "app.js"), "utf8");
  const required = [
    "court",
    "gate",
    "altar",
    "laver",
    "coverings",
    "entrance",
    "frames",
    "table",
    "menorah",
    "incense",
    "veil",
    "ark",
    "presence"
  ];

  for (const id of required) {
    assert.match(script, new RegExp(`\\n    ${id}: \\{`), `${id} has no educational entry`);
    assert.match(script, new RegExp(`addHotspot\\("${id}"`), `${id} has no scene hotspot`);
  }

  const sourceReferences = script.match(/source: "Exodus [^"]+"/g) ?? [];
  assert.ok(sourceReferences.length >= required.length - 1);
});

test("the self-contained application initializes against browser APIs", async () => {
  const source = await readFile(join(SUBMISSION, "app.js"), "utf8");
  const gl = fakeWebGL();
  const elements = new Map();

  function fakeElement(id) {
    const element = {
      id,
      hidden: id === "infoPanel" || id === "targetPrompt" || id === "unsupported",
      textContent: "",
      clientWidth: 1280,
      clientHeight: 720,
      width: 1280,
      height: 720,
      classList: {
        add() {},
        remove() {},
        toggle() {}
      },
      addEventListener() {},
      focus() {},
      getBoundingClientRect() {
        return { left: 0, top: 0, width: 1280, height: 720 };
      }
    };
    if (id === "world") {
      element.getContext = (name) => name === "webgl" ? gl : null;
      element.requestPointerLock = () => undefined;
    }
    return element;
  }

  const document = {
    body: fakeElement("body"),
    pointerLockElement: null,
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, fakeElement(id));
      return elements.get(id);
    },
    addEventListener() {},
    exitPointerLock() {}
  };

  const context = {
    document,
    window: {
      devicePixelRatio: 1,
      addEventListener() {}
    },
    performance,
    console,
    Float32Array,
    Math,
    setTimeout() {
      return 0;
    },
    requestAnimationFrame() {
      return 0;
    }
  };

  assert.doesNotThrow(() => vm.runInNewContext(source, context, {
    filename: join(SUBMISSION, "app.js")
  }));
  assert.ok(elements.has("world"));
});

function fakeWebGL() {
  let objectId = 0;
  const object = () => ({ id: ++objectId });
  return {
    VERTEX_SHADER: 0x8B31,
    FRAGMENT_SHADER: 0x8B30,
    COMPILE_STATUS: 0x8B81,
    LINK_STATUS: 0x8B82,
    ARRAY_BUFFER: 0x8892,
    STATIC_DRAW: 0x88E4,
    DYNAMIC_DRAW: 0x88E8,
    FLOAT: 0x1406,
    TRIANGLES: 0x0004,
    POINTS: 0x0000,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    DEPTH_TEST: 0x0B71,
    CULL_FACE: 0x0B44,
    BLEND: 0x0BE2,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    createShader: object,
    shaderSource() {},
    compileShader() {},
    getShaderParameter() {
      return true;
    },
    getShaderInfoLog() {
      return "";
    },
    createProgram: object,
    attachShader() {},
    linkProgram() {},
    getProgramParameter() {
      return true;
    },
    getProgramInfoLog() {
      return "";
    },
    createBuffer: object,
    bindBuffer() {},
    bufferData() {},
    getAttribLocation() {
      return 0;
    },
    enableVertexAttribArray() {},
    vertexAttribPointer() {},
    getUniformLocation: object,
    viewport() {},
    clearColor() {},
    clear() {},
    enable() {},
    disable() {},
    useProgram() {},
    uniformMatrix4fv() {},
    uniform3fv() {},
    uniform1f() {},
    drawArrays() {},
    blendFunc() {},
    depthMask() {}
  };
}
