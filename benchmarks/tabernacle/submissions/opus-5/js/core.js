/* core.js — matrix maths, WebGL helpers, and a small geometry builder.
 *
 * Everything hangs off window.TB and loads as a *classic* script, not an ES
 * module. That is deliberate: the gallery frames this page with
 * sandbox="allow-scripts allow-pointer-lock" and no allow-same-origin, so the
 * document has an opaque origin. Module fetches are CORS-checked and would send
 * `Origin: null`; classic script, <link> and <img> loads are not, and work
 * normally. Same reason there is no fetch() anywhere in this submission.
 */
(function (global) {
  "use strict";
  const TB = global.TB || (global.TB = {});

  // ---------------------------------------------------------------- mat4 ----
  // Column-major, same convention as OpenGL and gl-matrix.
  const M4 = {
    create() {
      const m = new Float32Array(16);
      m[0] = m[5] = m[10] = m[15] = 1;
      return m;
    },

    identity(out) {
      out.fill(0);
      out[0] = out[5] = out[10] = out[15] = 1;
      return out;
    },

    multiply(out, a, b) {
      for (let col = 0; col < 4; col += 1) {
        const b0 = b[col * 4], b1 = b[col * 4 + 1], b2 = b[col * 4 + 2], b3 = b[col * 4 + 3];
        for (let row = 0; row < 4; row += 1) {
          out[col * 4 + row] =
            a[row] * b0 + a[4 + row] * b1 + a[8 + row] * b2 + a[12 + row] * b3;
        }
      }
      return out;
    },

    perspective(out, fovY, aspect, near, far) {
      const f = 1 / Math.tan(fovY / 2);
      out.fill(0);
      out[0] = f / aspect;
      out[5] = f;
      out[10] = (far + near) / (near - far);
      out[11] = -1;
      out[14] = (2 * far * near) / (near - far);
      return out;
    },

    ortho(out, left, right, bottom, top, near, far) {
      out.fill(0);
      out[0] = 2 / (right - left);
      out[5] = 2 / (top - bottom);
      out[10] = -2 / (far - near);
      out[12] = -(right + left) / (right - left);
      out[13] = -(top + bottom) / (top - bottom);
      out[14] = -(far + near) / (far - near);
      out[15] = 1;
      return out;
    },

    lookAt(out, eye, target, up) {
      let zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2];
      let len = Math.hypot(zx, zy, zz) || 1;
      zx /= len; zy /= len; zz /= len;

      let xx = up[1] * zz - up[2] * zy;
      let xy = up[2] * zx - up[0] * zz;
      let xz = up[0] * zy - up[1] * zx;
      len = Math.hypot(xx, xy, xz) || 1;
      xx /= len; xy /= len; xz /= len;

      const yx = zy * xz - zz * xy;
      const yy = zz * xx - zx * xz;
      const yz = zx * xy - zy * xx;

      out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
      out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
      out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
      out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
      out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
      out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
      out[15] = 1;
      return out;
    },

    translation(out, x, y, z) {
      M4.identity(out);
      out[12] = x; out[13] = y; out[14] = z;
      return out;
    },

    scaling(out, x, y, z) {
      M4.identity(out);
      out[0] = x; out[5] = y; out[10] = z;
      return out;
    },

    rotationY(out, angle) {
      const s = Math.sin(angle), c = Math.cos(angle);
      M4.identity(out);
      out[0] = c; out[2] = -s; out[8] = s; out[10] = c;
      return out;
    },

    rotationZ(out, angle) {
      const s = Math.sin(angle), c = Math.cos(angle);
      M4.identity(out);
      out[0] = c; out[1] = s; out[4] = -s; out[5] = c;
      return out;
    },

    rotationX(out, angle) {
      const s = Math.sin(angle), c = Math.cos(angle);
      M4.identity(out);
      out[5] = c; out[6] = s; out[9] = -s; out[10] = c;
      return out;
    },

    invert(out, a) {
      const b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4];
      const b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5];
      const b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6];
      const b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12];
      const b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13];
      const b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];

      let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det) return M4.identity(out);
      det = 1 / det;

      out[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * det;
      out[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * det;
      out[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * det;
      out[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * det;
      out[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * det;
      out[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * det;
      out[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * det;
      out[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * det;
      out[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * det;
      out[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * det;
      out[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * det;
      out[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * det;
      out[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * det;
      out[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * det;
      out[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * det;
      out[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * det;
      return out;
    }
  };

  // ------------------------------------------------------- geometry build ---
  // Positions/normals/uvs into flat arrays, then one interleaved VBO. Nothing
  // here is clever; it just has to be exact, because every number it is fed is
  // a number out of Exodus.

  function Builder() {
    this.pos = [];
    this.nor = [];
    this.uv = [];
    this.idx = [];
  }

  Builder.prototype.vertex = function (x, y, z, nx, ny, nz, u, v) {
    this.pos.push(x, y, z);
    this.nor.push(nx, ny, nz);
    this.uv.push(u, v);
    return this.pos.length / 3 - 1;
  };

  Builder.prototype.count = function () {
    return this.pos.length / 3;
  };

  /** Quad from four CCW corners. Normal is derived unless one is supplied. */
  Builder.prototype.quad = function (p0, p1, p2, p3, uvs, normal) {
    let n = normal;
    if (!n) {
      const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2];
      const bx = p3[0] - p0[0], by = p3[1] - p0[1], bz = p3[2] - p0[2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const len = Math.hypot(nx, ny, nz) || 1;
      n = [nx / len, ny / len, nz / len];
    }
    const t = uvs || [[0, 0], [1, 0], [1, 1], [0, 1]];
    const base = this.count();
    this.vertex(p0[0], p0[1], p0[2], n[0], n[1], n[2], t[0][0], t[0][1]);
    this.vertex(p1[0], p1[1], p1[2], n[0], n[1], n[2], t[1][0], t[1][1]);
    this.vertex(p2[0], p2[1], p2[2], n[0], n[1], n[2], t[2][0], t[2][1]);
    this.vertex(p3[0], p3[1], p3[2], n[0], n[1], n[2], t[3][0], t[3][1]);
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    return this;
  };

  /**
   * Axis-aligned box from min/max corners. UVs come from world size times
   * `scale`, so one texture keeps the same physical grain on a 10-cubit board
   * and on a 1-cubit altar.
   */
  Builder.prototype.box = function (min, max, scale, faces) {
    const s = scale === undefined ? 1 : scale;
    const [x0, y0, z0] = min;
    const [x1, y1, z1] = max;
    const dx = (x1 - x0) * s, dy = (y1 - y0) * s, dz = (z1 - z0) * s;
    const on = (name) => !faces || faces.indexOf(name) >= 0;

    if (on("px")) this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], rect(dz, dy), [1, 0, 0]);
    if (on("nx")) this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], rect(dz, dy), [-1, 0, 0]);
    if (on("py")) this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], rect(dx, dz), [0, 1, 0]);
    if (on("ny")) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], rect(dx, dz), [0, -1, 0]);
    if (on("pz")) this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], rect(dx, dy), [0, 0, 1]);
    if (on("nz")) this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], rect(dx, dy), [0, 0, -1]);
    return this;
  };

  function rect(w, h) {
    return [[0, 0], [w, 0], [w, h], [0, h]];
  }

  /**
   * Surface of revolution about the Y axis through (cx, cz).
   * `profile` is a list of [radius, y] pairs read bottom to top.
   */
  Builder.prototype.revolve = function (cx, cy, cz, profile, segments, scale) {
    const s = scale === undefined ? 1 : scale;
    const segs = segments || 16;
    const rows = [];

    for (let i = 0; i < profile.length; i += 1) {
      const [r, y] = profile[i];
      // Profile tangent -> surface normal in the (radial, y) plane.
      const prev = profile[Math.max(0, i - 1)];
      const next = profile[Math.min(profile.length - 1, i + 1)];
      const dr = next[0] - prev[0];
      const dy = next[1] - prev[1];
      let nr = dy, ny = -dr;
      const len = Math.hypot(nr, ny) || 1;
      nr /= len; ny /= len;

      const row = [];
      for (let j = 0; j <= segs; j += 1) {
        const a = (j / segs) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        row.push(this.vertex(
          cx + ca * r, cy + y, cz + sa * r,
          ca * nr, ny, sa * nr,
          (j / segs) * Math.PI * 2 * Math.max(r, 0.05) * s, (y - profile[0][1]) * s
        ));
      }
      rows.push(row);
    }

    for (let i = 0; i < rows.length - 1; i += 1) {
      for (let j = 0; j < segs; j += 1) {
        const a = rows[i][j], b = rows[i][j + 1], c = rows[i + 1][j + 1], d = rows[i + 1][j];
        this.idx.push(a, b, c, a, c, d);
      }
    }
    return this;
  };

  /** Straight cylinder, optionally capped. Convenience over revolve(). */
  Builder.prototype.cylinder = function (cx, cz, y0, y1, r0, r1, segs, scale, caps) {
    const profile = [];
    if (caps) profile.push([0, y0]);
    profile.push([r0, y0], [r1, y1]);
    if (caps) profile.push([0, y1]);
    return this.revolve(cx, 0, cz, profile, segs, scale);
  };

  Builder.prototype.sphere = function (cx, cy, cz, r, segs, scale) {
    const rings = Math.max(4, Math.round(segs / 2));
    const profile = [];
    for (let i = 0; i <= rings; i += 1) {
      const a = -Math.PI / 2 + (i / rings) * Math.PI;
      profile.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return this.revolve(cx, cy, cz, profile, segs, scale);
  };

  /**
   * Tube swept along a polyline. Used for the menorah's branches, which are the
   * one part of this model that has to look hand-beaten rather than boxy.
   */
  Builder.prototype.tube = function (path, radii, radialSegs, scale) {
    const segs = radialSegs || 8;
    const s = scale === undefined ? 1 : scale;
    const rows = [];
    let up = [0, 1, 0];

    for (let i = 0; i < path.length; i += 1) {
      const p = path[i];
      const prev = path[Math.max(0, i - 1)];
      const next = path[Math.min(path.length - 1, i + 1)];
      let tx = next[0] - prev[0], ty = next[1] - prev[1], tz = next[2] - prev[2];
      const tl = Math.hypot(tx, ty, tz) || 1;
      tx /= tl; ty /= tl; tz /= tl;

      // Parallel-transport-ish frame: keep the reference axis off the tangent.
      if (Math.abs(tx * up[0] + ty * up[1] + tz * up[2]) > 0.95) up = [1, 0, 0];
      let ax = up[1] * tz - up[2] * ty;
      let ay = up[2] * tx - up[0] * tz;
      let az = up[0] * ty - up[1] * tx;
      const al = Math.hypot(ax, ay, az) || 1;
      ax /= al; ay /= al; az /= al;
      const bx = ty * az - tz * ay, by = tz * ax - tx * az, bz = tx * ay - ty * ax;

      const r = radii[i];
      const row = [];
      for (let j = 0; j <= segs; j += 1) {
        const a = (j / segs) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        const nx = ax * ca + bx * sa, ny = ay * ca + by * sa, nz = az * ca + bz * sa;
        row.push(this.vertex(
          p[0] + nx * r, p[1] + ny * r, p[2] + nz * r,
          nx, ny, nz,
          (j / segs) * 2 * s, (i / (path.length - 1)) * 4 * s
        ));
      }
      rows.push(row);
    }

    for (let i = 0; i < rows.length - 1; i += 1) {
      for (let j = 0; j < segs; j += 1) {
        const a = rows[i][j], b = rows[i][j + 1], c = rows[i + 1][j + 1], d = rows[i + 1][j];
        this.idx.push(a, b, c, a, c, d);
      }
    }
    return this;
  };

  /**
   * Subdivided quad in a plane, with an optional displacement callback.
   * Fabric everywhere in this model is one of these, sagging under its own
   * weight — a flat rectangle reads as cardboard.
   */
  Builder.prototype.sheet = function (origin, uAxis, vAxis, nu, nv, scale, displace, doubleSided) {
    const s = scale === undefined ? 1 : scale;
    const ul = Math.hypot(uAxis[0], uAxis[1], uAxis[2]);
    const vl = Math.hypot(vAxis[0], vAxis[1], vAxis[2]);
    const grid = [];

    for (let i = 0; i <= nu; i += 1) {
      const row = [];
      for (let j = 0; j <= nv; j += 1) {
        const fu = i / nu, fv = j / nv;
        let x = origin[0] + uAxis[0] * fu + vAxis[0] * fv;
        let y = origin[1] + uAxis[1] * fu + vAxis[1] * fv;
        let z = origin[2] + uAxis[2] * fu + vAxis[2] * fv;
        if (displace) {
          const d = displace(fu, fv);
          x += d[0]; y += d[1]; z += d[2];
        }
        row.push([x, y, z, fu * ul * s, fv * vl * s]);
      }
      grid.push(row);
    }

    // The back face is emitted as its own set of triangles, nudged along its
    // own normal. Without that nudge the two copies sit at identical depth and
    // z-fight, which on a curtain looks like static.
    const push = (flip) => {
      const base = this.count();
      const nudge = flip ? 0.004 : 0;
      for (let i = 0; i <= nu; i += 1) {
        for (let j = 0; j <= nv; j += 1) {
          const p = grid[i][j];
          // Normals from finite differences across the displaced grid.
          const a = grid[Math.min(nu, i + 1)][j], b = grid[Math.max(0, i - 1)][j];
          const c = grid[i][Math.min(nv, j + 1)], d = grid[i][Math.max(0, j - 1)];
          const ux = a[0] - b[0], uy = a[1] - b[1], uz = a[2] - b[2];
          const vx = c[0] - d[0], vy = c[1] - d[1], vz = c[2] - d[2];
          let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
          const nl = Math.hypot(nx, ny, nz) || 1;
          const f = flip ? -1 : 1;
          const ox = f * nx / nl, oy = f * ny / nl, oz = f * nz / nl;
          this.vertex(
            p[0] + ox * nudge, p[1] + oy * nudge, p[2] + oz * nudge,
            ox, oy, oz, p[3], p[4]
          );
        }
      }
      for (let i = 0; i < nu; i += 1) {
        for (let j = 0; j < nv; j += 1) {
          const a = base + i * (nv + 1) + j;
          const b = a + 1;
          const c = a + (nv + 1) + 1;
          const d = a + (nv + 1);
          if (flip) this.idx.push(a, c, b, a, d, c);
          else this.idx.push(a, b, c, a, c, d);
        }
      }
    };

    push(false);
    if (doubleSided !== false) push(true);
    return this;
  };

  /** Translate every vertex written so far from index `from` onward. */
  Builder.prototype.translateFrom = function (from, dx, dy, dz) {
    for (let i = from * 3; i < this.pos.length; i += 3) {
      this.pos[i] += dx; this.pos[i + 1] += dy; this.pos[i + 2] += dz;
    }
    return this;
  };

  /**
   * Apply a matrix to everything written from index `from` onward. Positions
   * get the full transform, normals the rotation part — which is enough here
   * because nothing in this model is scaled non-uniformly at build time.
   */
  Builder.prototype.transformFrom = function (from, m) {
    for (let i = from * 3; i < this.pos.length; i += 3) {
      const x = this.pos[i], y = this.pos[i + 1], z = this.pos[i + 2];
      this.pos[i] = m[0] * x + m[4] * y + m[8] * z + m[12];
      this.pos[i + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
      this.pos[i + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      const nx = this.nor[i], ny = this.nor[i + 1], nz = this.nor[i + 2];
      const ox = m[0] * nx + m[4] * ny + m[8] * nz;
      const oy = m[1] * nx + m[5] * ny + m[9] * nz;
      const oz = m[2] * nx + m[6] * ny + m[10] * nz;
      const len = Math.hypot(ox, oy, oz) || 1;
      this.nor[i] = ox / len; this.nor[i + 1] = oy / len; this.nor[i + 2] = oz / len;
    }
    return this;
  };

  /** Rotate vertices from index `from` onward about the Y axis through (cx,cz). */
  Builder.prototype.rotateYFrom = function (from, angle, cx, cz) {
    const s = Math.sin(angle), c = Math.cos(angle);
    for (let i = from * 3; i < this.pos.length; i += 3) {
      const x = this.pos[i] - cx, z = this.pos[i + 2] - cz;
      this.pos[i] = cx + x * c + z * s;
      this.pos[i + 2] = cz - x * s + z * c;
      const nx = this.nor[i], nz = this.nor[i + 2];
      this.nor[i] = nx * c + nz * s;
      this.nor[i + 2] = -nx * s + nz * c;
    }
    return this;
  };

  // ------------------------------------------------------------- WebGL -----
  function compile(gl, type, source, label) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`${label} shader: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }

  /** Program plus eagerly-resolved uniform and attribute locations. */
  function createProgram(gl, vertexSource, fragmentSource, label) {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource, `${label} vertex`));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource, `${label} fragment`));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`${label} link: ${gl.getProgramInfoLog(program)}`);
    }

    const uniforms = {};
    const attribs = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i += 1) {
      const name = gl.getActiveUniform(program, i).name.replace(/\[0\]$/, "");
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    const attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < attribCount; i += 1) {
      const name = gl.getActiveAttrib(program, i).name;
      attribs[name] = gl.getAttribLocation(program, name);
    }
    return { program, uniforms, attribs };
  }

  /** Interleave a Builder into one VBO + index buffer. Stride is 8 floats. */
  function createMesh(gl, builder) {
    const count = builder.count();
    const data = new Float32Array(count * 8);
    for (let i = 0; i < count; i += 1) {
      data[i * 8 + 0] = builder.pos[i * 3];
      data[i * 8 + 1] = builder.pos[i * 3 + 1];
      data[i * 8 + 2] = builder.pos[i * 3 + 2];
      data[i * 8 + 3] = builder.nor[i * 3];
      data[i * 8 + 4] = builder.nor[i * 3 + 1];
      data[i * 8 + 5] = builder.nor[i * 3 + 2];
      data[i * 8 + 6] = builder.uv[i * 2];
      data[i * 8 + 7] = builder.uv[i * 2 + 1];
    }

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    const use32 = count > 65535;
    const indices = use32 ? new Uint32Array(builder.idx) : new Uint16Array(builder.idx);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return {
      vbo,
      ibo,
      count: builder.idx.length,
      type: use32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
    };
  }

  function createTexture(gl, canvas, anisotropy) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    if (anisotropy) {
      gl.texParameterf(gl.TEXTURE_2D, anisotropy.ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy.max);
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    return texture;
  }

  TB.M4 = M4;
  TB.Builder = Builder;
  TB.gl = { createProgram, createMesh, createTexture };
})(window);
