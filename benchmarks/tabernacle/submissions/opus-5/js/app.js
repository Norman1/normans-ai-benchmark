/* app.js — the walkthrough: renderer, camera, collision, picking, interface.
 *
 * Two design notes worth stating up front.
 *
 * Collision. The visitor is a vertical cylinder half a cubit in radius, resolved
 * against boxes, circles and rope segments by pushing out along the shortest
 * axis and iterating. Nothing is a trigger volume you pass through: the
 * curtains at the court gate, the tent door and the veil are solid until they
 * are physically drawn aside, and the blocker behind each one only lifts once
 * the cloth has actually moved. You never pass through cloth; the cloth gets
 * out of your way, which is how anyone ever got in.
 *
 * Light. Ex 25:37 gives the Holy Place seven lamps and no window, and the room
 * beyond the veil not even that. Both rooms are lit accordingly — the shader
 * cuts the sun almost entirely for anything indoors and lets the lampstand do
 * the work. Walking in from a hundred cubits of desert glare and having your
 * eyes adjust is most of the point.
 */
(function (global) {
  "use strict";
  const TB = global.TB;
  const M4 = TB.M4;

  const CUBIT_METRES = 0.45;      // the common short cubit, for the readout only
  const EYE_HEIGHT = 3.7;         // about 1.67 m
  const BODY_RADIUS = 0.5;
  const WALK_SPEED = 4.6;         // cubits per second
  const RUN_MULTIPLIER = 2.1;
  const TURN_SPEED = 1.9;         // radians per second, for the arrow keys
  const SHADOW_SIZE = 2048;
  const SUN = normalise([0.5, 0.74, -0.46]);

  function normalise(v) {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }

  // ----------------------------------------------------------- shaders -----
  const SCENE_VERT = `
    attribute vec3 aPos;
    attribute vec3 aNormal;
    attribute vec2 aUV;
    uniform mat4 uProj, uView, uModel, uLightVP;
    uniform float uPleat;
    varying vec3 vWorld, vNormal;
    varying vec2 vUV;
    varying vec4 vShadow;
    void main() {
      vec3 local = aPos;
      local.x += sin(aPos.z * 9.0) * uPleat;
      vec4 world = uModel * vec4(local, 1.0);
      vWorld = world.xyz;
      // mat3(mat4) is not valid GLSL ES 1.00 — ANGLE accepts it, stricter
      // drivers reject it and the whole page fails to start. Build the mat3
      // from three columns instead, which is portable.
      mat3 rotation = mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz);
      vNormal = normalize(rotation * aNormal);
      vUV = aUV;
      // Offset the shadow lookup along the normal instead of biasing depth:
      // with no back-face culling anywhere in this scene it is far steadier.
      vShadow = uLightVP * vec4(world.xyz + vNormal * 0.09, 1.0);
      gl_Position = uProj * uView * world;
    }`;

  const SCENE_FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    varying vec3 vWorld, vNormal;
    varying vec2 vUV;
    varying vec4 vShadow;
    uniform sampler2D uTex, uShadowMap;
    uniform vec3 uTint, uSunDir, uSunColour, uSkyColour, uGroundColour, uEye, uFogColour;
    uniform vec3 uLampColour, uGlowPos, uGlowColour;
    uniform vec3 uLampPos[7];
    uniform float uSpecular, uShininess, uEmissive, uIndoor;
    uniform float uLampOn, uGlowOn, uShadowOn, uFogDensity, uExposure, uShadowTexel;

    float shadowed() {
      if (uShadowOn < 0.5) return 1.0;
      vec3 c = vShadow.xyz / vShadow.w * 0.5 + 0.5;
      if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || c.z > 1.0) return 1.0;
      float sum = 0.0;
      for (int i = 0; i < 4; i++) {
        vec2 o = vec2(
          i == 0 ? -0.7 : (i == 1 ? 0.7 : (i == 2 ? -0.7 : 0.7)),
          i < 2 ? -0.7 : 0.7
        ) * uShadowTexel;
        sum += texture2D(uShadowMap, c.xy + o).r < c.z - 0.0012 ? 0.0 : 1.0;
      }
      return sum * 0.25;
    }

    vec3 tonemap(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(uEye - vWorld);
      if (dot(N, V) < 0.0) N = -N;          // every sheet here is two-sided
      vec3 albedo = pow(texture2D(uTex, vUV).rgb, vec3(2.2)) * uTint;

      float day = 1.0 - 0.965 * uIndoor;
      vec3 ambient = mix(uGroundColour, uSkyColour, N.y * 0.5 + 0.5) * (1.0 - 0.93 * uIndoor);
      vec3 direct = uSunColour * max(dot(N, uSunDir), 0.0) * shadowed() * day;

      vec3 spec = vec3(0.0);
      if (uSpecular > 0.0) {
        vec3 H = normalize(uSunDir + V);
        spec = uSunColour * pow(max(dot(N, H), 0.0), uShininess) * uSpecular * day;
      }

      vec3 lamps = vec3(0.0);
      if (uLampOn > 0.5) {
        for (int i = 0; i < 7; i++) {
          vec3 L = uLampPos[i] - vWorld;
          float d = length(L);
          L /= max(d, 0.0001);
          // Steep enough that the far end of the Holy Place falls away. Seven
          // lamps a handspan apart otherwise add up to something closer to
          // floodlighting than to seven wicks of olive oil.
          float att = 1.0 / (1.0 + 0.35 * d + 0.22 * d * d);
          lamps += uLampColour * att * max(dot(N, L), 0.0);
          if (uSpecular > 0.0) {
            vec3 H = normalize(L + V);
            spec += uLampColour * att * pow(max(dot(N, H), 0.0), uShininess) * uSpecular * 0.6;
          }
        }
      }
      if (uGlowOn > 0.5) {
        vec3 L = uGlowPos - vWorld;
        float d = length(L);
        L /= max(d, 0.0001);
        float att = 1.0 / (1.0 + 0.18 * d + 0.07 * d * d);
        lamps += uGlowColour * att * (0.4 + 0.6 * max(dot(N, L), 0.0));
      }

      vec3 colour = albedo * (ambient + direct + lamps) + spec + albedo * uEmissive;
      float dist = length(uEye - vWorld);
      float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
      colour = mix(colour, uFogColour, clamp(fog, 0.0, 1.0) * (1.0 - uIndoor));
      gl_FragColor = vec4(pow(tonemap(colour * uExposure), vec3(1.0 / 2.2)), 1.0);
    }`;

  const DEPTH_VERT = `
    attribute vec3 aPos;
    uniform mat4 uLightVP, uModel;
    uniform float uPleat;
    void main() {
      vec3 local = aPos;
      local.x += sin(aPos.z * 9.0) * uPleat;
      gl_Position = uLightVP * uModel * vec4(local, 1.0);
    }`;

  const DEPTH_FRAG = `
    precision mediump float;
    void main() { gl_FragColor = vec4(1.0); }`;

  const SKY_VERT = `
    attribute vec2 aCorner;
    varying vec2 vClip;
    void main() { vClip = aCorner; gl_Position = vec4(aCorner, 0.999999, 1.0); }`;

  const SKY_FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    varying vec2 vClip;
    uniform mat4 uInvViewProj;
    uniform vec3 uEye, uSunDir, uZenith, uHorizon, uSunColour;
    uniform float uExposure;
    vec3 tonemap(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }
    void main() {
      vec4 far = uInvViewProj * vec4(vClip, 1.0, 1.0);
      vec3 dir = normalize(far.xyz / far.w - uEye);
      float h = clamp(dir.y, 0.0, 1.0);
      vec3 sky = mix(uHorizon, uZenith, pow(h, 0.55));
      float sun = max(dot(dir, uSunDir), 0.0);
      sky += uSunColour * (pow(sun, 900.0) * 6.0 + pow(sun, 12.0) * 0.22);
      gl_FragColor = vec4(pow(tonemap(sky * uExposure), vec3(1.0 / 2.2)), 1.0);
    }`;

  const SPRITE_VERT = `
    attribute vec2 aCorner;
    uniform mat4 uProj, uView;
    uniform vec3 uCentre, uRight, uUp;
    uniform vec2 uSize;
    varying vec2 vUV;
    void main() {
      vec3 p = uCentre + uRight * (aCorner.x * uSize.x) + uUp * (aCorner.y * uSize.y);
      vUV = aCorner + 0.5;
      gl_Position = uProj * uView * vec4(p, 1.0);
    }`;

  const SPRITE_FRAG = `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTex;
    uniform vec3 uTint;
    uniform float uAlpha;
    void main() {
      vec4 t = texture2D(uTex, vUV);
      gl_FragColor = vec4(t.rgb * uTint, t.a * uAlpha);
    }`;

  // -------------------------------------------------------------- boot -----
  const el = (id) => document.getElementById(id);
  const canvas = el("gl");
  const loading = el("loading");

  /**
   * Put a failure on the screen.
   *
   * Everything that can throw during start-up runs inside boot() below, because
   * an uncaught error out here leaves the page sitting on "Building the
   * tabernacle" for ever, which looks exactly like a hang and says nothing
   * about what went wrong. A visitor should never have to open a console to
   * find out that their driver rejected a shader.
   */
  function fail(headline, detail) {
    loading.hidden = false;
    loading.classList.add("failed");
    loading.innerHTML = `<b>${headline}</b>` +
      (detail ? `<span class="detail">${String(detail).replace(/[<&]/g, (c) => (c === "<" ? "&lt;" : "&amp;"))}</span>` : "") +
      `<span class="detail">The measurements this page declares are in its ` +
      `<code>tabernacle-dimensions</code> block either way.</span>`;
    if (window.console) console.error(headline, detail);
  }

  window.addEventListener("error", (event) => {
    if (!loading.hidden) fail("The walkthrough could not start.", event.message);
  });

  let gl = null;
  try {
    const options = { antialias: true, alpha: false, depth: true, powerPreference: "high-performance" };
    gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
  } catch (error) {
    gl = null;
  }

  if (!gl) {
    fail("This walkthrough needs WebGL, and this browser did not give it.");
    return;
  }

  const scene = { nodes: [], colliders: [], hotspots: [], openings: [], lamps: [], flames: [] };
  let sceneProgram, depthProgram, skyProgram, spriteProgram, quad, sprite, anisotropy;
  let shadow = null;

  /** Shader programs, static buffers, and the shadow target. May throw. */
  function createResources() {
    const anisoExt = gl.getExtension("EXT_texture_filter_anisotropic")
      || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")
      || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
    anisotropy = anisoExt
      ? { ext: anisoExt, max: Math.min(8, gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) }
      : null;

    sceneProgram = TB.gl.createProgram(gl, SCENE_VERT, SCENE_FRAG, "scene");
    depthProgram = TB.gl.createProgram(gl, DEPTH_VERT, DEPTH_FRAG, "depth");
    skyProgram = TB.gl.createProgram(gl, SKY_VERT, SKY_FRAG, "sky");
    spriteProgram = TB.gl.createProgram(gl, SPRITE_VERT, SPRITE_FRAG, "sprite");

    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    sprite = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sprite);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5]), gl.STATIC_DRAW);

    createShadowTarget();
  }

  // ------------------------------------------------------- shadow setup ----
  // Entirely optional: without a depth texture the scene just loses its
  // shadows, so a failure here is swallowed rather than fatal.
  function createShadowTarget() {
    let depthExt = null;
    try {
      depthExt = gl.getExtension("WEBGL_depth_texture")
        || gl.getExtension("WEBKIT_WEBGL_depth_texture")
        || gl.getExtension("MOZ_WEBGL_depth_texture");
    } catch (error) {
      return;
    }
    if (!depthExt) return;
    try {
      const depthTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, depthTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, SHADOW_SIZE, SHADOW_SIZE, 0,
        gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
                            [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) {
        gl.texParameteri(gl.TEXTURE_2D, k, v);
      }
      const colour = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, colour);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SHADOW_SIZE, SHADOW_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colour, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
        shadow = { fbo, texture: depthTexture, matrix: M4.create() };
        // Sunlight view: an orthographic box wide enough for the whole court.
        const lightView = M4.create(), lightProj = M4.create();
        M4.lookAt(lightView, [50 + SUN[0] * 130, SUN[1] * 130, SUN[2] * 130], [50, 4, 0], [0, 1, 0]);
        M4.ortho(lightProj, -74, 74, -52, 52, 1, 280);
        M4.multiply(shadow.matrix, lightProj, lightView);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } catch (error) {
      shadow = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }

  // ------------------------------------------------------------- state -----
  const camera = { x: 0, z: 0, yaw: 0, pitch: 0, bob: 0 };
  const keys = new Set();
  const proj = M4.create();
  const view = M4.create();
  const invViewProj = M4.create();
  const viewProj = M4.create();
  const identity = M4.create();

  // The ground never casts: it is flat, it is at y = 0, and letting it into the
  // shadow map buys nothing but acne.
  const NO_CAST = new Set(["desert", "hills", "courtFloor", "holyFloor", "hohFloor"]);

  let textures = null;
  let hovered = null;
  let openEntry = null;
  let mapVisible = true;
  let started = false;
  let lastTime = 0;
  let elapsed = 0;

  // ------------------------------------------------------------ render -----
  function bindMesh(program, mesh) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
    const stride = 32;
    gl.enableVertexAttribArray(program.attribs.aPos);
    gl.vertexAttribPointer(program.attribs.aPos, 3, gl.FLOAT, false, stride, 0);
    if (program.attribs.aNormal !== undefined) {
      gl.enableVertexAttribArray(program.attribs.aNormal);
      gl.vertexAttribPointer(program.attribs.aNormal, 3, gl.FLOAT, false, stride, 12);
    }
    if (program.attribs.aUV !== undefined) {
      gl.enableVertexAttribArray(program.attribs.aUV);
      gl.vertexAttribPointer(program.attribs.aUV, 2, gl.FLOAT, false, stride, 24);
    }
  }

  /** Attribute arrays are global, not per-program: turn off what the two-float
   *  passes do not use before they draw. */
  function onlyCorner(program, buffer) {
    if (sceneProgram.attribs.aNormal !== undefined) gl.disableVertexAttribArray(sceneProgram.attribs.aNormal);
    if (sceneProgram.attribs.aUV !== undefined) gl.disableVertexAttribArray(sceneProgram.attribs.aUV);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(program.attribs.aCorner);
    gl.vertexAttribPointer(program.attribs.aCorner, 2, gl.FLOAT, false, 0, 0);
  }

  function drawShadowPass() {
    if (!shadow) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadow.fbo);
    gl.viewport(0, 0, SHADOW_SIZE, SHADOW_SIZE);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(depthProgram.program);
    gl.uniformMatrix4fv(depthProgram.uniforms.uLightVP, false, shadow.matrix);
    for (const node of scene.nodes) {
      if (NO_CAST.has(node.key)) continue;
      gl.uniformMatrix4fv(depthProgram.uniforms.uModel, false, node.model);
      gl.uniform1f(depthProgram.uniforms.uPleat, node.pleat || 0);
      bindMesh(depthProgram, node.mesh);
      gl.drawElements(gl.TRIANGLES, node.mesh.count, node.mesh.type, 0);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function drawScene(eye) {
    const u = sceneProgram.uniforms;
    gl.useProgram(sceneProgram.program);
    gl.uniformMatrix4fv(u.uProj, false, proj);
    gl.uniformMatrix4fv(u.uView, false, view);
    gl.uniformMatrix4fv(u.uLightVP, false, shadow ? shadow.matrix : identity);
    // Calibrated so that sand in full sun lands near 0.73 and goats' hair near
    // 0.33 after the tone curve. The filmic curve wants scene-referred values
    // around 0.18 for mid grey, so the exposure sits well below one.
    gl.uniform3fv(u.uSunDir, SUN);
    gl.uniform3f(u.uSunColour, 1.05, 0.98, 0.85);
    gl.uniform3f(u.uSkyColour, 0.17, 0.21, 0.30);
    gl.uniform3f(u.uGroundColour, 0.17, 0.14, 0.10);
    gl.uniform3fv(u.uEye, eye);
    gl.uniform3f(u.uFogColour, 0.55, 0.56, 0.55);
    gl.uniform1f(u.uFogDensity, 0.0032);
    gl.uniform1f(u.uExposure, 0.55);
    gl.uniform1f(u.uShadowOn, shadow ? 1 : 0);
    gl.uniform1f(u.uShadowTexel, 1 / SHADOW_SIZE);
    gl.uniform1i(u.uTex, 0);
    gl.uniform1i(u.uShadowMap, 1);

    // The seven lamps flicker together but not in step.
    const lampPositions = new Float32Array(21);
    scene.lamps.forEach((lamp, i) => {
      lampPositions[i * 3] = lamp.pos[0];
      lampPositions[i * 3 + 1] = lamp.pos[1];
      lampPositions[i * 3 + 2] = lamp.pos[2];
    });
    gl.uniform3fv(u.uLampPos, lampPositions);
    const flicker = 0.92 + 0.08 * Math.sin(elapsed * 6.1) * Math.sin(elapsed * 2.7);
    // Per lamp, and the shader sums all seven — so this is a seventh of what a
    // single light would need.
    gl.uniform3f(u.uLampColour, 2.0 * flicker, 1.16 * flicker, 0.5 * flicker);
    // Not a lamp. Nothing burned in the Most Holy Place, and rendered honestly
    // the room is pure black. This is a fill at the mercy seat, tuned to the
    // least that leaves the ark legible and the walls barely there; the panel
    // for the room says plainly that it is a concession to the viewer.
    gl.uniform3f(u.uGlowPos, 25, 2.2, 0);
    gl.uniform3f(u.uGlowColour, 1.5, 1.24, 0.86);

    if (shadow) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, shadow.texture);
    }
    gl.activeTexture(gl.TEXTURE0);

    for (const node of scene.nodes) {
      gl.uniformMatrix4fv(u.uModel, false, node.model);
      gl.uniform3fv(u.uTint, node.tint);
      gl.uniform1f(u.uSpecular, node.specular);
      gl.uniform1f(u.uShininess, node.shininess);
      gl.uniform1f(u.uEmissive, node.emissive + (node.hotspotId && node.hotspotId === hovered ? 0.16 : 0));
      gl.uniform1f(u.uIndoor, node.indoor);
      gl.uniform1f(u.uLampOn, node.lampLit || 0);
      gl.uniform1f(u.uGlowOn, node.glowLit || 0);
      gl.uniform1f(u.uPleat, node.pleat || 0);
      gl.bindTexture(gl.TEXTURE_2D, node.texture);
      bindMesh(sceneProgram, node.mesh);
      gl.drawElements(gl.TRIANGLES, node.mesh.count, node.mesh.type, 0);
    }
  }

  function drawSky(eye) {
    const u = skyProgram.uniforms;
    gl.useProgram(skyProgram.program);
    gl.depthMask(false);
    onlyCorner(skyProgram, quad);
    gl.uniformMatrix4fv(u.uInvViewProj, false, invViewProj);
    gl.uniform3fv(u.uEye, eye);
    gl.uniform3fv(u.uSunDir, SUN);
    gl.uniform3f(u.uZenith, 0.16, 0.32, 0.72);
    gl.uniform3f(u.uHorizon, 0.55, 0.56, 0.55);
    gl.uniform3f(u.uSunColour, 1.0, 0.93, 0.78);
    gl.uniform1f(u.uExposure, 0.55);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);
  }

  function drawFlames(eye) {
    if (!scene.flames.length) return;
    const u = spriteProgram.uniforms;
    gl.useProgram(spriteProgram.program);
    onlyCorner(spriteProgram, sprite);
    gl.uniformMatrix4fv(u.uProj, false, proj);
    gl.uniformMatrix4fv(u.uView, false, view);
    gl.uniform1i(u.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.flame);

    // Billboard axes straight out of the view matrix.
    const right = [view[0], view[4], view[8]];
    const up = [view[1], view[5], view[9]];
    gl.uniform3fv(u.uRight, right);
    gl.uniform3fv(u.uUp, up);

    gl.enable(gl.BLEND);
    gl.depthMask(false);

    for (const pass of [false, true]) {
      gl.blendFunc(gl.SRC_ALPHA, pass ? gl.ONE_MINUS_SRC_ALPHA : gl.ONE);
      for (const flame of scene.flames) {
        if (Boolean(flame.smoke) !== pass) continue;
        const t = elapsed + flame.phase;
        const pulse = 0.78 + 0.22 * Math.sin(t * 7.3) + 0.12 * Math.sin(t * 3.1);
        const drift = flame.smoke ? Math.sin(t * 0.9) * 0.16 : Math.sin(t * 4.4) * 0.03;
        gl.uniform3f(u.uCentre,
          flame.pos[0] + drift,
          flame.pos[1] + flame.rise * 0.5 * pulse,
          flame.pos[2] + drift * 0.6);
        gl.uniform2f(u.uSize, flame.size * pulse, (flame.size + flame.rise) * pulse);
        gl.uniform3fv(u.uTint, flame.tint);
        gl.uniform1f(u.uAlpha, flame.alpha * (flame.smoke ? 1 : pulse));
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }

    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  // --------------------------------------------------------- collision -----
  /**
   * Radial push-out, plus a small tangential slip.
   *
   * The slip matters. Walk dead-on into a pillar and the push-out is exactly
   * opposite your travel, so you stop and stay stopped — and this court has a
   * pillar on the centre line of both the gate and the tent door, which is
   * precisely where anyone walks. The slip is proportional to how far you are
   * pressing in, so it does nothing until you lean on something and then walks
   * you round it. You are still never allowed inside the geometry.
   */
  function pushOffRound(cx, cz, dx, dz, d, min) {
    if (d <= 1e-6) return [cx + min, cz];
    const ux = dx / d, uz = dz / d;
    const slip = (min - d) * 0.4;
    return [cx + ux * min - uz * slip, cz + uz * min + ux * slip];
  }

  /**
   * Push the visitor out of everything solid. Boxes resolve along their
   * shallowest axis, which gives clean sliding along a wall; circles and rope
   * segments resolve radially.
   */
  function resolveCollisions(px, pz) {
    let x = px, z = pz;
    for (let pass = 0; pass < 3; pass += 1) {
      let moved = false;
      for (const c of scene.colliders) {
        if (c.disabled) continue;
        if (c.kind === "box") {
          const [x0, , z0] = c.min;
          const [x1, , z1] = c.max;
          const cx = Math.max(x0, Math.min(x, x1));
          const cz = Math.max(z0, Math.min(z, z1));
          const dx = x - cx, dz = z - cz;
          const d2 = dx * dx + dz * dz;
          if (d2 > BODY_RADIUS * BODY_RADIUS) continue;
          if (d2 > 1e-8) {
            const d = Math.sqrt(d2);
            const push = (BODY_RADIUS - d) / d;
            x += dx * push; z += dz * push;
          } else {
            // Centre is inside: leave by the nearest face.
            const left = x - x0, right = x1 - x, back = z - z0, front = z1 - z;
            const m = Math.min(left, right, back, front);
            if (m === left) x = x0 - BODY_RADIUS;
            else if (m === right) x = x1 + BODY_RADIUS;
            else if (m === back) z = z0 - BODY_RADIUS;
            else z = z1 + BODY_RADIUS;
          }
          moved = true;
        } else if (c.kind === "circle") {
          const dx = x - c.x, dz = z - c.z;
          const d = Math.hypot(dx, dz);
          const min = BODY_RADIUS + c.r;
          if (d >= min) continue;
          [x, z] = pushOffRound(c.x, c.z, dx, dz, d, min);
          moved = true;
        } else if (c.kind === "segment") {
          const ex = c.bx - c.ax, ez = c.bz - c.az;
          const len2 = ex * ex + ez * ez || 1;
          const t = Math.max(0, Math.min(1, ((x - c.ax) * ex + (z - c.az) * ez) / len2));
          const nx = c.ax + ex * t, nz = c.az + ez * t;
          const dx = x - nx, dz = z - nz;
          const d = Math.hypot(dx, dz);
          const min = BODY_RADIUS + c.r;
          if (d >= min) continue;
          [x, z] = pushOffRound(nx, nz, dx, dz, d, min);
          moved = true;
        }
      }
      if (!moved) break;
    }

    // A soft edge to the world, so you cannot wander off into nothing.
    const dx = x - 50, dz = z;
    const d = Math.hypot(dx, dz);
    if (d > 150) { x = 50 + (dx / d) * 150; z = (dz / d) * 150; }
    return [x, z];
  }

  // ----------------------------------------------------------- picking -----
  function pick(eye, dir) {
    let best = null, bestT = Infinity;
    for (const spot of scene.hotspots) {
      const t = rayBox(eye, dir, spot.min, spot.max);
      if (t !== null && t < bestT && t < 44) { bestT = t; best = spot; }
    }
    return best;
  }

  function rayBox(origin, dir, min, max) {
    let tmin = 0, tmax = Infinity;
    for (let i = 0; i < 3; i += 1) {
      if (Math.abs(dir[i]) < 1e-8) {
        if (origin[i] < min[i] || origin[i] > max[i]) return null;
      } else {
        const inv = 1 / dir[i];
        let t0 = (min[i] - origin[i]) * inv;
        let t1 = (max[i] - origin[i]) * inv;
        if (t0 > t1) { const s = t0; t0 = t1; t1 = s; }
        tmin = Math.max(tmin, t0);
        tmax = Math.min(tmax, t1);
        if (tmin > tmax) return null;
      }
    }
    return tmin;
  }

  // -------------------------------------------------------------- ui -------
  function openInfo(id) {
    const entry = TB.content[id];
    if (!entry) return;
    openEntry = id;
    el("infoTitle").textContent = entry.title;
    el("infoSub").textContent = entry.hebrew || "";
    el("infoRef").textContent = entry.reference;
    el("infoBody").innerHTML = entry.body.map((p) => `<p>${p}</p>`).join("");
    el("infoFacts").innerHTML = entry.facts.map((f) => `<li>${f}</li>`).join("");
    const note = el("infoNote");
    if (entry.note) { note.textContent = entry.note; note.hidden = false; }
    else { note.hidden = true; }
    el("panel").hidden = false;
    el("panel").scrollTop = 0;
  }

  function closeInfo() {
    openEntry = null;
    el("panel").hidden = true;
  }

  function zoneOf(x, z) {
    const M = TB.model;
    if (x >= M.TX0 - 0.6 && x <= M.TX1 && z >= M.TZ0 && z <= M.TZ1) {
      return x < M.VEIL_X ? "mostHoly" : "holy";
    }
    if (x >= M.CX0 && x <= M.CX1 && z >= M.CZ0 && z <= M.CZ1) return "court";
    return "outside";
  }

  // A plan of the court, drawn the way it is laid out on the ground: gate east,
  // ark west. Purely an orientation aid — it holds no state and tracks nothing.
  const mapCanvas = el("map");
  const mapCtx = mapCanvas.getContext("2d");
  function drawMap() {
    const w = mapCanvas.width, h = mapCanvas.height;
    mapCtx.clearRect(0, 0, w, h);
    if (!mapVisible) return;
    const pad = 10;
    const sx = (w - pad * 2) / 100, sz = (h - pad * 2) / 50;
    const s = Math.min(sx, sz);
    // West is drawn on the left, so the world's +X (east) runs to the right.
    const px = (x) => pad + x * s;
    const pz = (z) => h / 2 + z * s;

    mapCtx.fillStyle = "rgba(24,20,16,0.55)";
    mapCtx.fillRect(0, 0, w, h);
    mapCtx.strokeStyle = "#d8cdb4";
    mapCtx.lineWidth = 1.5;
    mapCtx.strokeRect(px(0), pz(-25), 100 * s, 50 * s);

    mapCtx.strokeStyle = "#7fa7d8";
    mapCtx.lineWidth = 3;
    mapCtx.beginPath();
    mapCtx.moveTo(px(100), pz(-10));
    mapCtx.lineTo(px(100), pz(10));
    mapCtx.stroke();

    mapCtx.fillStyle = "rgba(214,178,86,0.32)";
    mapCtx.fillRect(px(20), pz(-5), 30 * s, 10 * s);
    mapCtx.strokeStyle = "#d6b256";
    mapCtx.lineWidth = 1.2;
    mapCtx.strokeRect(px(20), pz(-5), 30 * s, 10 * s);
    mapCtx.beginPath();
    mapCtx.moveTo(px(30), pz(-5));
    mapCtx.lineTo(px(30), pz(5));
    mapCtx.stroke();

    for (const [x, z] of [[75, 0], [60, 0], [40, -3.4], [40, 3.4], [31.6, 0], [25, 0]]) {
      mapCtx.fillStyle = "#e2d6bb";
      mapCtx.beginPath();
      mapCtx.arc(px(x), pz(z), 2.4, 0, Math.PI * 2);
      mapCtx.fill();
    }

    mapCtx.save();
    mapCtx.translate(px(camera.x), pz(camera.z));
    mapCtx.rotate(-camera.yaw + Math.PI / 2);
    mapCtx.fillStyle = "#f0574a";
    mapCtx.beginPath();
    mapCtx.moveTo(0, -6);
    mapCtx.lineTo(4.2, 5);
    mapCtx.lineTo(0, 2.6);
    mapCtx.lineTo(-4.2, 5);
    mapCtx.closePath();
    mapCtx.fill();
    mapCtx.restore();
  }

  // ------------------------------------------------------------- input -----
  const MOVE_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "PageUp", "PageDown", "Home", "End"]);

  window.addEventListener("keydown", (event) => {
    if (MOVE_KEYS.has(event.key)) event.preventDefault();
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    keys.add(key);
    if (key === "Escape") {
      if (document.pointerLockElement) document.exitPointerLock();
      else if (openEntry) closeInfo();
      else if (!el("help").hidden) el("help").hidden = true;
    }
    if (key === "h") toggleHelp();
    if (key === "m") { mapVisible = !mapVisible; mapCanvas.classList.toggle("off", !mapVisible); }
    if (key === "r") { camera.x = scene.start.x; camera.z = scene.start.z; camera.yaw = scene.start.yaw; camera.pitch = 0; }
    if (!started && (MOVE_KEYS.has(event.key) || "wasd".includes(key))) dismissHelp();
  });
  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  });
  window.addEventListener("blur", () => keys.clear());

  // Drag to look, click to inspect. Pointer lock is offered but never forced —
  // it is a walkthrough, not a shooter, and some people hate having their
  // cursor taken away.
  let dragging = false, dragMoved = 0, lastPointer = null;
  canvas.addEventListener("pointerdown", (event) => {
    dismissHelp();
    dragging = true;
    dragMoved = 0;
    lastPointer = [event.clientX, event.clientY];
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (document.pointerLockElement === canvas) {
      look(event.movementX * 0.0022, event.movementY * 0.0022);
      return;
    }
    if (!dragging || !lastPointer) return;
    const dx = event.clientX - lastPointer[0];
    const dy = event.clientY - lastPointer[1];
    dragMoved += Math.abs(dx) + Math.abs(dy);
    lastPointer = [event.clientX, event.clientY];
    look(dx * 0.0035, dy * 0.0035);
  });
  canvas.addEventListener("pointerup", (event) => {
    if (dragging && dragMoved < 6) {
      if (hovered) openInfo(hovered);
      else closeInfo();
    }
    dragging = false;
    lastPointer = null;
    try { canvas.releasePointerCapture(event.pointerId); } catch (error) { /* already gone */ }
  });
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  function look(dx, dy) {
    camera.yaw -= dx;
    camera.pitch = Math.max(-1.2, Math.min(1.2, camera.pitch - dy));
  }

  el("lockBtn").addEventListener("click", () => {
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    else if (canvas.requestPointerLock) canvas.requestPointerLock();
  });
  document.addEventListener("pointerlockchange", () => {
    el("lockBtn").classList.toggle("on", document.pointerLockElement === canvas);
  });

  el("infoClose").addEventListener("click", closeInfo);
  el("helpBtn").addEventListener("click", toggleHelp);
  el("helpClose").addEventListener("click", dismissHelp);
  el("helpStart").addEventListener("click", dismissHelp);
  el("mapBtn").addEventListener("click", () => {
    mapVisible = !mapVisible;
    mapCanvas.classList.toggle("off", !mapVisible);
  });

  window.addEventListener("resize", redraw);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) redraw(); });

  function toggleHelp() {
    const help = el("help");
    help.hidden = !help.hidden;
    started = true;
  }
  function dismissHelp() {
    el("help").hidden = true;
    started = true;
  }

  // -------------------------------------------------------------- loop -----
  function resize() {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const h = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const mapW = Math.round(mapCanvas.clientWidth * ratio);
    const mapH = Math.round(mapCanvas.clientHeight * ratio);
    if (mapCanvas.width !== mapW || mapCanvas.height !== mapH) {
      mapCanvas.width = mapW;
      mapCanvas.height = mapH;
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    step(now);
  }

  /**
   * Draw one frame without asking for another.
   *
   * Frame callbacks stop entirely while a tab is in the background, so a page
   * that only ever draws from inside the loop comes back showing whatever was
   * on screen when it was hidden — and a resize while hidden leaves that stale
   * image stretched. Redrawing on both events costs nothing and fixes both.
   */
  function redraw() {
    if (scene.nodes.length) step(performance.now());
  }

  function step(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
    lastTime = now;
    elapsed += dt;
    resize();

    // --- movement ---
    const fast = keys.has("Shift") ? RUN_MULTIPLIER : 1;
    let forward = 0, strafe = 0, turn = 0;
    if (keys.has("ArrowUp") || keys.has("w")) forward += 1;
    if (keys.has("ArrowDown") || keys.has("s")) forward -= 1;
    if (keys.has("a")) strafe -= 1;
    if (keys.has("d")) strafe += 1;
    if (keys.has("ArrowLeft")) turn += 1;
    if (keys.has("ArrowRight")) turn -= 1;
    if (keys.has("q")) turn += 1;
    if (keys.has("e")) turn -= 1;

    camera.yaw += turn * TURN_SPEED * dt;
    const sinYaw = Math.sin(camera.yaw), cosYaw = Math.cos(camera.yaw);
    const speed = WALK_SPEED * fast * dt;
    let nx = camera.x + (-sinYaw * forward + cosYaw * strafe) * speed;
    let nz = camera.z + (-cosYaw * forward - sinYaw * strafe) * speed;

    const moving = forward !== 0 || strafe !== 0;
    camera.bob += moving ? dt * (7.5 * fast) : 0;
    if (!moving) camera.bob *= 1 - Math.min(1, dt * 6);

    // --- curtains: they open because you are there, and only then unblock ---
    for (const opening of scene.openings) {
      const z = Math.max(opening.z0, Math.min(nz, opening.z1));
      const distance = Math.hypot(nx - opening.x, nz - z);
      const target = distance < opening.radius ? 1 : 0;
      const rate = dt * 2.4;
      opening.part += Math.max(-rate, Math.min(rate, target - opening.part));
      opening.collider.disabled = opening.part > 0.45;
      for (const panel of opening.panels) {
        const gather = 1 - 0.88 * opening.part;
        const pivot = panel.curtain.pivot;
        M4.identity(panel.model);
        panel.model[10] = gather;
        panel.model[14] = pivot * (1 - gather);
        panel.pleat = opening.part * 0.16;
      }
    }

    [camera.x, camera.z] = resolveCollisions(nx, nz);

    // --- camera ---
    const eyeY = EYE_HEIGHT + Math.sin(camera.bob) * 0.05;
    const eye = [camera.x, eyeY, camera.z];
    const dir = [
      -sinYaw * Math.cos(camera.pitch),
      Math.sin(camera.pitch),
      -cosYaw * Math.cos(camera.pitch)
    ];
    const aspect = canvas.width / canvas.height;
    M4.perspective(proj, 1.16, aspect, 0.06, 700);
    M4.lookAt(view, eye, [eye[0] + dir[0], eye[1] + dir[1], eye[2] + dir[2]], [0, 1, 0]);
    M4.multiply(viewProj, proj, view);
    M4.invert(invViewProj, viewProj);

    // --- hover ---
    const spot = pick(eye, dir);
    hovered = spot ? spot.id : null;
    const label = el("hoverLabel");
    if (hovered && TB.content[hovered]) {
      label.textContent = TB.content[hovered].title;
      label.classList.add("on");
      canvas.classList.add("pointing");
    } else {
      label.classList.remove("on");
      canvas.classList.remove("pointing");
    }

    el("zone").textContent = TB.zones[zoneOf(camera.x, camera.z)];

    // --- draw ---
    drawShadowPass();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.62, 0.63, 0.62, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawSky(eye);
    drawScene(eye);
    drawFlames(eye);
    drawMap();
  }

  // -------------------------------------------------------------- init -----
  // Texture generation and mesh building both block for a moment; yield once so
  // the loading line paints first. A plain timeout rather than a frame callback,
  // because a page opened in a background tab gets no frames at all and would
  // otherwise sit on "Building the tabernacle" until it was looked at.
  setTimeout(() => {
    try {
      createResources();
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);          // every fabric sheet here is two-sided
      textures = TB.textures.createAll(gl, anisotropy);
      const built = TB.model.build(gl, textures);
      Object.assign(scene, built);
      scene.start = built.start;
      camera.x = built.start.x;
      camera.z = built.start.z;
      camera.yaw = built.start.yaw;

      el("cubitNote").textContent =
        `One cubit ≈ ${Math.round(CUBIT_METRES * 100)} cm. The court is ${DIMText()}.`;

      loading.hidden = true;
      lastTime = performance.now();
      frame(lastTime);            // draw once now; the loop takes over after
    } catch (error) {
      fail("Could not build the scene.", error && (error.message || error));
    }
  }, 30);

  function DIMText() {
    const D = TB.model.DIM.court;
    const metres = (n) => (n * CUBIT_METRES).toFixed(0);
    return `${D.length} × ${D.width} cubits, about ${metres(D.length)} × ${metres(D.width)} m`;
  }
})(window);
