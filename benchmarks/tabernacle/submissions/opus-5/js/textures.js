/* textures.js — every surface in this model is generated here, in code.
 *
 * The brief forbids remote assets, and inlining photographs as base64 would
 * bloat the page for no gain. Procedural material textures also let the linen,
 * goats' hair and beaten gold stay tileable at any scale, which matters when
 * the same weave has to read correctly on a 5-cubit court hanging and on a
 * 1-cubit altar.
 *
 * Colours are chosen to sit inside what Exodus actually specifies: fine twined
 * linen (undyed, off-white), tekhelet blue, argaman purple, tola'at shani
 * scarlet, gold, bronze, silver, acacia. Nothing here invents a colour that
 * scripture assigns.
 */
(function (global) {
  "use strict";
  const TB = global.TB || (global.TB = {});

  const BLUE = [46, 74, 150];      // tekhelet
  const PURPLE = [104, 56, 132];   // argaman
  const SCARLET = [166, 46, 42];   // tola'at shani

  // ------------------------------------------------------------- noise ------
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Tileable value noise sampled on a `period`-cell lattice. */
  function lattice(period, seed) {
    const rand = mulberry(seed);
    const cells = new Float32Array(period * period);
    for (let i = 0; i < cells.length; i += 1) cells[i] = rand();
    return function (x, y) {
      const fx = x * period, fy = y * period;
      const ix = Math.floor(fx), iy = Math.floor(fy);
      const tx = fx - ix, ty = fy - iy;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);
      const x0 = ((ix % period) + period) % period;
      const y0 = ((iy % period) + period) % period;
      const x1 = (x0 + 1) % period;
      const y1 = (y0 + 1) % period;
      const a = cells[y0 * period + x0], b = cells[y0 * period + x1];
      const c = cells[y1 * period + x0], d = cells[y1 * period + x1];
      return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
    };
  }

  /** Fractal sum of tileable lattices. Returns roughly 0..1. */
  function fbm(period, octaves, seed) {
    const layers = [];
    let amp = 1, total = 0, p = period;
    for (let i = 0; i < octaves; i += 1) {
      layers.push({ noise: lattice(p, seed + i * 7919), amp });
      total += amp;
      amp *= 0.5;
      p *= 2;
    }
    return function (x, y) {
      let sum = 0;
      for (const layer of layers) sum += layer.noise(x, y) * layer.amp;
      return sum / total;
    };
  }

  // ------------------------------------------------------------ helpers -----
  function canvasOf(size) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    return canvas;
  }

  /** Per-pixel generator. `shade(x, y, u, v)` returns [r, g, b] or [r, g, b, a]. */
  function pixels(size, shade) {
    const canvas = canvasOf(size);
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(size, size);
    const data = image.data;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const rgba = shade(x, y, x / size, y / size);
        const i = (y * size + x) * 4;
        data[i] = clamp255(rgba[0]);
        data[i + 1] = clamp255(rgba[1]);
        data[i + 2] = clamp255(rgba[2]);
        data[i + 3] = rgba[3] === undefined ? 255 : clamp255(rgba[3]);
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  }

  function clamp255(v) {
    return v < 0 ? 0 : v > 255 ? 255 : v | 0;
  }

  function tint(base, factor) {
    return [base[0] * factor, base[1] * factor, base[2] * factor];
  }

  /**
   * Plain-weave shading. Warp and weft cross in a checker; whichever thread is
   * on top catches the light, and each thread is rounded across its width.
   */
  function weave(x, y, threadPx) {
    const cx = Math.floor(x / threadPx), cy = Math.floor(y / threadPx);
    const over = (cx + cy) % 2 === 0;
    const across = over ? y % threadPx : x % threadPx;
    const round = 0.86 + 0.26 * Math.sin(((across + 0.5) / threadPx) * Math.PI);
    return round * (over ? 1.05 : 0.9);
  }

  // ---------------------------------------------------------- materials -----
  const build = {
    /** Fine twined linen: undyed, the court hangings and the ground of every screen. */
    linen(size) {
      const mottle = fbm(8, 3, 11);
      return pixels(size, (x, y, u, v) => {
        const w = weave(x, y, 3);
        const m = 0.94 + 0.12 * mottle(u, v);
        return tint([236, 230, 214], w * m);
      });
    },

    /** Blue, purple and scarlet worked into fine twined linen (Ex 27:16; 26:36). */
    screen(size) {
      const mottle = fbm(8, 3, 23);
      const bands = [BLUE, PURPLE, SCARLET];
      const canvas = pixels(size, (x, y, u, v) => {
        const w = weave(x, y, 3);
        const m = 0.94 + 0.12 * mottle(u, v);
        // Broad woven bands, with the linen ground showing between them.
        const t = (v * 6) % 1;
        const band = Math.floor(v * 6) % 3;
        let colour = [236, 230, 214];
        if (t > 0.18 && t < 0.82) {
          const edge = Math.min(t - 0.18, 0.82 - t) / 0.12;
          const k = Math.min(1, edge);
          const c = bands[band];
          colour = [
            colour[0] + (c[0] - colour[0]) * k,
            colour[1] + (c[1] - colour[1]) * k,
            colour[2] + (c[2] - colour[2]) * k
          ];
        }
        return tint(colour, w * m);
      });

      // A woven chevron over the bands, so the screens read as needlework
      // rather than as painted stripes.
      const ctx = canvas.getContext("2d");
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "#efe7d2";
      ctx.lineWidth = Math.max(1, size / 128);
      for (let i = 0; i < 6; i += 1) {
        const y0 = (i + 0.5) * (size / 6);
        ctx.beginPath();
        for (let x = 0; x <= size; x += size / 32) {
          const y = y0 + (Math.floor(x / (size / 16)) % 2 === 0 ? -1 : 1) * (size / 60);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return canvas;
    },

    /**
     * The veil, and the innermost ten curtains: the same coloured yarns on
     * linen, but "with cherubim shall it be made" (Ex 26:1, 31). Scripture gives
     * the figures no form, so these are a restrained reconstruction — two wings
     * arched upward, which is the one detail Exodus does give, at the ark.
     */
    cherubimCloth(size, ground) {
      const mottle = fbm(8, 3, 37);
      const canvas = pixels(size, (x, y, u, v) => {
        const w = weave(x, y, 3);
        const m = 0.94 + 0.12 * mottle(u, v);
        return tint(ground, w * m);
      });

      const ctx = canvas.getContext("2d");
      const half = size / 2;
      for (let i = 0; i < 2; i += 1) {
        for (let j = 0; j < 2; j += 1) {
          drawCherub(ctx, (i + 0.5) * half, (j + 0.5) * half, half * 0.42, (i + j) % 2 === 0);
        }
      }
      return canvas;
    },

    /** Beaten gold: the boards' overlay, the furniture, the lampstand. */
    gold(size) {
      const grain = fbm(12, 4, 51);
      const hammer = fbm(24, 2, 67);
      return pixels(size, (x, y, u, v) => {
        const g = 0.86 + 0.3 * grain(u, v);
        const h = 0.94 + 0.14 * hammer(u * 2, v * 2);
        return tint([206, 164, 62], g * h);
      });
    },

    /** Bronze: the altar's plating, the court sockets, the laver. */
    bronze(size) {
      const grain = fbm(12, 4, 73);
      const patina = fbm(20, 3, 89);
      return pixels(size, (x, y, u, v) => {
        const g = 0.82 + 0.34 * grain(u, v);
        const p = patina(u, v);
        const base = [172, 116, 58];
        const green = [96, 116, 78];
        const k = Math.max(0, p - 0.62) * 0.9;
        return tint([
          base[0] + (green[0] - base[0]) * k,
          base[1] + (green[1] - base[1]) * k,
          base[2] + (green[2] - base[2]) * k
        ], g);
      });
    },

    /** Silver: the hundred sockets, the court hooks and fillets. */
    silver(size) {
      const grain = fbm(14, 4, 101);
      return pixels(size, (x, y, u, v) => tint([196, 200, 206], 0.84 + 0.3 * grain(u, v)));
    },

    /** Acacia — shittim wood. The frame under every gold and bronze overlay. */
    acacia(size) {
      const drift = fbm(10, 3, 113);
      const fibre = fbm(48, 2, 127);
      return pixels(size, (x, y, u, v) => {
        const rings = Math.sin((v * 26 + drift(u, v) * 5) * Math.PI);
        const g = 0.82 + 0.16 * rings * rings + 0.14 * fibre(u * 0.4, v * 3);
        return tint([126, 92, 54], g);
      });
    },

    /** The eleven curtains of goats' hair (Ex 26:7) — coarse, dark, weatherproof. */
    goatHair(size) {
      const fibre = fbm(64, 2, 139);
      const clump = fbm(10, 3, 149);
      return pixels(size, (x, y, u, v) => {
        const f = fibre(u * 0.25, v * 4);
        const c = clump(u, v);
        return tint([78, 68, 58], 0.7 + 0.42 * f + 0.22 * c);
      });
    },

    /** Rams' skins dyed red (Ex 26:14). */
    ramSkin(size) {
      const wrinkle = fbm(16, 4, 157);
      return pixels(size, (x, y, u, v) => {
        const w = wrinkle(u, v);
        return tint([146, 52, 42], 0.78 + 0.4 * w);
      });
    },

    /**
     * The outermost covering of tachash skin. The animal behind the Hebrew word
     * is genuinely unknown — dugong, badger and dyed leather have all been
     * argued — so this is deliberately a plain, hard-wearing hide.
     */
    tachash(size) {
      const grain = fbm(28, 3, 167);
      const pebble = fbm(56, 2, 173);
      return pixels(size, (x, y, u, v) =>
        tint([84, 92, 100], 0.76 + 0.3 * grain(u, v) + 0.16 * pebble(u, v)));
    },

    /** Wilderness floor outside the court. */
    sand(size) {
      const dune = fbm(6, 3, 181);
      const grit = fbm(96, 2, 191);
      return pixels(size, (x, y, u, v) =>
        tint([198, 176, 138], 0.8 + 0.26 * dune(u, v) + 0.16 * grit(u, v)));
    },

    /** Court floor: the same desert, but trodden flat by a nation. */
    courtGround(size) {
      const scuff = fbm(8, 4, 199);
      const grit = fbm(80, 2, 211);
      return pixels(size, (x, y, u, v) =>
        tint([180, 160, 126], 0.82 + 0.24 * scuff(u, v) + 0.12 * grit(u, v)));
    },

    /** The twelve loaves set out every sabbath (Lev 24:5-6). */
    bread(size) {
      const crust = fbm(14, 4, 223);
      const flour = fbm(60, 2, 227);
      return pixels(size, (x, y, u, v) =>
        tint([214, 180, 124], 0.8 + 0.32 * crust(u, v) + 0.12 * flour(u, v)));
    },

    /** Water in the laver. */
    water(size) {
      const ripple = fbm(10, 3, 233);
      return pixels(size, (x, y, u, v) => {
        const r = ripple(u, v);
        return tint([92, 138, 152], 0.76 + 0.4 * r);
      });
    },

    /** Additive lamp flame. Alpha falls off radially; drawn as a billboard. */
    flame(size) {
      const wisp = fbm(12, 3, 241);
      const c = size / 2;
      return pixels(size, (x, y, u, v) => {
        const dx = (x - c) / c;
        const dy = (y - c) / c;
        // Teardrop: narrower and longer above the wick.
        const stretch = dy < 0 ? 0.85 : 1.55;
        const d = Math.hypot(dx * 1.9, dy / stretch);
        const falloff = Math.max(0, 1 - d);
        const body = Math.pow(falloff, 1.8) * (0.72 + 0.5 * wisp(u * 2, v * 2));
        const core = Math.pow(Math.max(0, 1 - d * 1.9), 3);
        const r = 255 * Math.min(1, body * 1.4 + core);
        const g = 255 * Math.min(1, body * 0.72 + core);
        const b = 255 * Math.min(1, body * 0.22 + core * 0.8);
        return [r, g, b, 255 * Math.min(1, body * 1.25)];
      });
    },

    /** Soft round shadow used under free-standing objects. */
    blob(size) {
      const c = size / 2;
      return pixels(size, (x, y) => {
        const d = Math.hypot(x - c, y - c) / c;
        const a = Math.pow(Math.max(0, 1 - d), 1.7);
        return [0, 0, 0, 255 * a];
      });
    }
  };

  /**
   * One woven cherub. Two wings arched up and over, a plain body, no face —
   * Exodus describes wings and faces but never a form, and a vague figure is a
   * more honest reconstruction than a confident one.
   */
  function drawCherub(ctx, cx, cy, s, gilded) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const thread = gilded ? "rgba(214,178,86,0.92)" : "rgba(236,230,214,0.9)";
    const shade = gilded ? "rgba(150,116,44,0.55)" : "rgba(150,150,150,0.4)";

    for (const pass of [{ colour: shade, offset: s * 0.035, width: s * 0.13 },
                        { colour: thread, offset: 0, width: s * 0.1 }]) {
      ctx.strokeStyle = pass.colour;
      ctx.lineWidth = pass.width;
      const o = pass.offset;

      for (const dir of [-1, 1]) {
        // Wing: sweeps out from the shoulder, then arches up and inward.
        ctx.beginPath();
        ctx.moveTo(dir * s * 0.1 + o, -s * 0.15 + o);
        ctx.bezierCurveTo(
          dir * s * 0.78 + o, -s * 0.1 + o,
          dir * s * 0.86 + o, -s * 0.78 + o,
          dir * s * 0.2 + o, -s * 0.86 + o
        );
        ctx.stroke();

        // Three feather strokes, the wing's only detail.
        for (let i = 1; i <= 3; i += 1) {
          const t = i / 4;
          ctx.beginPath();
          ctx.moveTo(dir * s * (0.14 + 0.5 * t) + o, -s * (0.14 + 0.42 * t) + o);
          ctx.lineTo(dir * s * (0.3 + 0.42 * t) + o, -s * (0.02 + 0.4 * t) + o);
          ctx.stroke();
        }

        // Lower wing, folded down.
        ctx.beginPath();
        ctx.moveTo(dir * s * 0.08 + o, -s * 0.05 + o);
        ctx.quadraticCurveTo(dir * s * 0.5 + o, s * 0.34 + o, dir * s * 0.24 + o, s * 0.6 + o);
        ctx.stroke();
      }

      // Body and head.
      ctx.beginPath();
      ctx.moveTo(o, -s * 0.22 + o);
      ctx.lineTo(o, s * 0.52 + o);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(o, -s * 0.36 + o, s * 0.14, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Build every texture once, upload, and hand back a name -> GL texture map. */
  function createAll(gl, anisotropy) {
    const sources = {
      linen: build.linen(512),
      screen: build.screen(512),
      veil: build.cherubimCloth(512, [206, 190, 172]),
      ceiling: build.cherubimCloth(512, [226, 218, 200]),
      gold: build.gold(256),
      bronze: build.bronze(256),
      silver: build.silver(256),
      acacia: build.acacia(256),
      goatHair: build.goatHair(512),
      ramSkin: build.ramSkin(256),
      tachash: build.tachash(256),
      sand: build.sand(512),
      courtGround: build.courtGround(512),
      bread: build.bread(256),
      water: build.water(256),
      flame: build.flame(128),
      blob: build.blob(128)
    };

    const textures = {};
    for (const name of Object.keys(sources)) {
      textures[name] = TB.gl.createTexture(gl, sources[name], anisotropy);
    }
    return textures;
  }

  TB.textures = { createAll, build, BLUE, PURPLE, SCARLET };
})(window);
