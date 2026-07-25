/* model.js — the tabernacle itself, built in cubits.
 *
 * Every number in this file that comes out of Exodus carries its verse.
 * Everything that is *not* in Exodus — the boards' thickness, the size of the
 * laver, the height of the lampstand, the form of the cherubim, the roof — is
 * marked RECONSTRUCTION here and is also declared to the reader in the page, so
 * that nothing invented is ever passed off as revealed.
 *
 * Axes: +X runs east (the gate is at x = 100, the ark at x = 25),
 *       +Y is up, +Z runs north. One world unit is one cubit.
 */
(function (global) {
  "use strict";
  const TB = global.TB;
  const M4 = TB.M4;
  const Builder = TB.Builder;

  // ---------------------------------------------------------- dimensions ---
  const DIM = {
    // Ex 27:18 — the court: a hundred cubits long, fifty broad, five high.
    court: { length: 100, width: 50, height: 5 },
    // Ex 26:16 — every board ten cubits long, a cubit and a half broad.
    board: { height: 10, width: 1.5 },
    // RECONSTRUCTION: Exodus never gives the boards a thickness. Half a cubit
    // is the choice that closes the rear wall exactly — six boards of a cubit
    // and a half is nine cubits, and half a cubit from each corner board makes
    // the ten-cubit interior the curtain arithmetic needs.
    boardThickness: 0.5,
    tent: { length: 30, width: 10, height: 10 },
    bronzeAltar: { length: 5, width: 5, height: 3 },     // Ex 27:1
    ark: { length: 2.5, width: 1.5, height: 1.5 },       // Ex 25:10
    table: { length: 2, width: 1, height: 1.5 },         // Ex 25:23
    altarOfIncense: { length: 1, width: 1, height: 2 },  // Ex 30:2
    handbreadth: 1 / 6,                                  // Ex 25:25, the table's border
    // RECONSTRUCTION: the lampstand's size is never given. Rabbinic tradition
    // puts it at eighteen handbreadths — three cubits — which is used here.
    menorah: { height: 3, spread: 1.8 },
    // RECONSTRUCTION: the laver has no measurements anywhere in scripture.
    laver: { radius: 1.05, rim: 1.85 }
  };

  const CX0 = 0, CX1 = DIM.court.length;
  const CZ0 = -DIM.court.width / 2, CZ1 = DIM.court.width / 2;
  const GATE_HALF = 10;                 // Ex 27:16 — a screen of twenty cubits
  const SPACING = 5;                    // 300-cubit perimeter over 60 pillars

  const TX0 = 20, TX1 = 50;             // tent interior, west .. east (the door)
  const TZ0 = -5, TZ1 = 5;              // tent interior, south .. north
  const BT = DIM.boardThickness;
  const VEIL_X = 30;                    // Ex 26:33 — the veil hangs under the clasps
  const TENT_H = DIM.tent.height;

  // uv units per cubit, so one weave keeps the same physical size whether it is
  // on a ten-cubit board or a one-cubit altar.
  const UV = {
    linen: 0.62, screen: 0.3, veil: 0.2, ceiling: 0.22,
    gold: 0.9, bronze: 0.75, silver: 0.9, acacia: 0.6,
    goatHair: 0.34, ramSkin: 0.3, tachash: 0.28,
    sand: 0.05, ground: 0.1, bread: 2.4, water: 0.5
  };

  // Lighting zones. There are no windows: the Holy Place is lit by the lampstand
  // alone, and the Holy of Holies by nothing at all.
  const OUTSIDE = { indoor: 0 };
  const HOLY_PLACE = { indoor: 1, lampLit: 1 };
  const HOLY_OF_HOLIES = { indoor: 1, glowLit: 1 };

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x9e3779b9) >>> 0;
      let t = Math.imul(a ^ (a >>> 16), 0x21f0aaad);
      t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
      return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
    };
  }

  function uvRect(w, h) {
    return [[0, 0], [w, 0], [w, h], [0, h]];
  }

  /** Lay a staff along the east-west axis, through rings on the two sides. */
  function staffAlongX(builder, cx, y, z, halfLength, radius, scale) {
    const from = builder.count();
    builder.cylinder(0, 0, -halfLength, halfLength, radius, radius, 8, scale, true);
    const m = M4.create();
    M4.rotationZ(m, -Math.PI / 2);
    m[12] = cx; m[13] = y; m[14] = z;
    builder.transformFrom(from, m);
  }

  /** Thin horizontal rod between two posts, used for the court's silver fillets. */
  function railBetween(builder, a, b, y, radius, scale) {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len = Math.hypot(dx, dz);
    if (len < 0.01) return;
    const from = builder.count();
    builder.cylinder(0, 0, 0, len, radius, radius, 8, scale, false);
    const lay = M4.create(), swing = M4.create(), out = M4.create();
    M4.rotationZ(lay, -Math.PI / 2);                   // +Y becomes +X
    M4.rotationY(swing, -Math.atan2(dz, dx));          // +X onto the a->b bearing
    M4.multiply(out, swing, lay);
    out[12] = a[0]; out[13] = y; out[14] = a[1];
    builder.transformFrom(from, out);
  }

  /** Raised gold moulding — the "crown" round a table or an altar. */
  function crown(builder, x0, x1, z0, z1, y, lip, height, scale) {
    builder.box([x0 - lip, y, z0 - lip], [x1 + lip, y + height, z0 + lip * 0.6], scale);
    builder.box([x0 - lip, y, z1 - lip * 0.6], [x1 + lip, y + height, z1 + lip], scale);
    builder.box([x0 - lip, y, z0 - lip], [x0 + lip * 0.6, y + height, z1 + lip], scale);
    builder.box([x1 - lip * 0.6, y, z0 - lip], [x1 + lip, y + height, z1 + lip], scale);
  }

  /**
   * One bay of hanging cloth between two points, bellying under its own weight.
   * A flat rectangle reads as painted board, which is exactly what these are not.
   */
  function fabricPanel(builder, ax, az, bx, bz, height, amp, scale, nu, nv) {
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz) || 1;
    const px = -dz / len, pz = dx / len;
    builder.sheet(
      [ax, 0, az], [dx, 0, dz], [0, height, 0], nu, nv, scale,
      (u, v) => {
        const belly = Math.sin(u * Math.PI) * (1 - v * 0.55);
        const ripple = Math.sin(u * Math.PI * 3 + 0.7) * 0.35 * (1 - v * 0.7);
        const k = amp * (belly + ripple);
        return [px * k, -Math.sin(u * Math.PI) * 0.05 * (1 - v), pz * k];
      }
    );
  }

  /** Flat roof panel, sagging a little between the boards. */
  function drape(builder, x0, x1, z0, z1, y, scale, sag) {
    builder.sheet(
      [x0, y, z0], [x1 - x0, 0, 0], [0, 0, z1 - z0], 10, 6, scale,
      (u, v) => [0, -Math.sin(u * Math.PI) * sag * 0.4 - Math.sin(v * Math.PI) * sag, 0],
      true
    );
  }

  /** Short hanging lip round all four sides of a roof covering. */
  function skirt(builder, x0, x1, z0, z1, y, depth, scale) {
    builder.sheet([x0, y, z0], [x1 - x0, 0, 0], [0, -depth, 0], 10, 2, scale, (u, v) => [0, 0, -v * 0.08]);
    builder.sheet([x0, y, z1], [x1 - x0, 0, 0], [0, -depth, 0], 10, 2, scale, (u, v) => [0, 0, v * 0.08]);
    builder.sheet([x0, y, z0], [0, 0, z1 - z0], [0, -depth, 0], 6, 2, scale, (u, v) => [-v * 0.08, 0, 0]);
    builder.sheet([x1, y, z0], [0, 0, z1 - z0], [0, -depth, 0], 6, 2, scale, (u, v) => [v * 0.08, 0, 0]);
  }

  // ------------------------------------------------------------- build -----
  function build(gl, textures) {
    const parts = new Map();
    const nodes = [];
    const colliders = [];
    const hotspots = [];
    const openings = [];
    const lamps = [];
    const flames = [];

    function part(key, texture, options) {
      let entry = parts.get(key);
      if (!entry) {
        entry = { builder: new Builder(), texture, options: options || {} };
        parts.set(key, entry);
      }
      return entry.builder;
    }
    const box = (min, max, id) => colliders.push({ kind: "box", min, max, id });
    const circle = (x, z, r, id) => colliders.push({ kind: "circle", x, z, r, id });
    const hotspot = (id, min, max) => hotspots.push({ id, min, max });

    const ctx = { part, box, circle, hotspot, colliders, nodes, openings, lamps, flames, gl, textures };

    ground(ctx);
    court(ctx);
    bronzeAltar(ctx);
    laver(ctx);
    tentShell(ctx);
    // The door screen takes daylight, not lamplight: it is the tent's east
    // face, standing in an open court. Lighting it as an interior surface
    // renders it black from the one side almost everybody sees it from, and
    // from inside a sunlit curtain really is the brightest thing in the room.
    doorway(ctx, "doorScreen", TX1, 5, "screen", UV.screen, OUTSIDE, 3.8);
    doorway(ctx, "veil", VEIL_X, 4, "veil", UV.veil, HOLY_PLACE, 3.4);
    menorah(ctx);
    table(ctx);
    incenseAltar(ctx);
    ark(ctx);

    // Every doorway's blocker joins the collider list once, here, so the
    // opening code has exactly one object to switch on and off.
    for (const opening of openings) colliders.push(opening.collider);

    for (const [key, entry] of parts) {
      if (entry.builder.count() === 0) continue;
      nodes.push(Object.assign({
        key,
        mesh: TB.gl.createMesh(gl, entry.builder),
        texture: textures[entry.texture],
        tint: [1, 1, 1],
        specular: 0,
        shininess: 24,
        emissive: 0,
        indoor: 0,
        lampLit: 0,
        glowLit: 0,
        pleat: 0,
        model: M4.create()
      }, entry.options));
    }

    return {
      nodes, colliders, hotspots, openings, lamps, flames,
      // Start outside the gate, facing west up the court's long axis. Coming in
      // through the one door is meant to be the first thing you do.
      // yaw = pi/2 points the view down -X; see the heading convention in app.js.
      // Far enough back that the tent's coverings clear the five-cubit court
      // hangings — from closer in, the two tops coincide and the tent vanishes
      // behind the wall, which is true to life but a poor first sight of it.
      start: { x: CX1 + 26, z: 0, yaw: Math.PI / 2 }
    };
  }

  // ------------------------------------------------------------ ground -----
  function ground({ part }) {
    const desert = part("desert", "sand", Object.assign({ specular: 0.02 }, OUTSIDE));
    desert.quad(
      [-260, -0.02, -300], [360, -0.02, -300], [360, -0.02, 300], [-260, -0.02, 300],
      uvRect(620 * UV.sand, 600 * UV.sand), [0, 1, 0]
    );

    // Low hills on the horizon. Not scripture — just somewhere for the eye to
    // stop, and a reminder that this is a camp pitched in a wilderness.
    const hills = part("hills", "sand", Object.assign({ specular: 0, tint: [0.95, 0.94, 0.92] }, OUTSIDE));
    const rand = rng(7717);
    const segments = 84;
    for (let i = 0; i < segments; i += 1) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1.06) / segments) * Math.PI * 2;
      const radius = 205 + rand() * 95;
      const height = 4 + rand() * 24;
      const p0 = [50 + Math.cos(a0) * radius, 0, Math.sin(a0) * radius];
      const p1 = [50 + Math.cos(a1) * radius, 0, Math.sin(a1) * radius];
      const base = hills.count();
      hills.vertex(p0[0], p0[1], p0[2], 0, 0.5, 0, 0, 0);
      hills.vertex(p1[0], p1[1], p1[2], 0, 0.5, 0, 9, 0);
      hills.vertex((p0[0] + p1[0]) / 2, height, (p0[2] + p1[2]) / 2, 0, 1, 0, 4.5, 7);
      hills.idx.push(base, base + 1, base + 2);
    }

    const courtFloor = part("courtFloor", "courtGround", Object.assign({ specular: 0.01 }, OUTSIDE));
    courtFloor.quad([CX0, 0, CZ0], [CX1, 0, CZ0], [CX1, 0, CZ1], [CX0, 0, CZ1],
      uvRect(DIM.court.length * UV.ground, DIM.court.width * UV.ground), [0, 1, 0]);

    const holyFloor = part("holyFloor", "courtGround", Object.assign({ specular: 0.01 }, HOLY_PLACE));
    holyFloor.quad([VEIL_X, 0.012, TZ0], [TX1, 0.012, TZ0], [TX1, 0.012, TZ1], [VEIL_X, 0.012, TZ1],
      uvRect(20 * UV.ground, 10 * UV.ground), [0, 1, 0]);

    const hohFloor = part("hohFloor", "courtGround", Object.assign({ specular: 0.01 }, HOLY_OF_HOLIES));
    hohFloor.quad([TX0, 0.012, TZ0], [VEIL_X, 0.012, TZ0], [VEIL_X, 0.012, TZ1], [TX0, 0.012, TZ1],
      uvRect(10 * UV.ground, 10 * UV.ground), [0, 1, 0]);
  }

  // ------------------------------------------------------------- court -----
  function court(ctx) {
    const { part, box, circle, hotspot, colliders, nodes, openings, gl, textures } = ctx;
    const H = DIM.court.height;
    const wood = part("courtPillars", "acacia", Object.assign({ specular: 0.06, shininess: 12 }, OUTSIDE));
    const silver = part("courtSilver", "silver", Object.assign({ specular: 0.5, shininess: 48 }, OUTSIDE));
    const bronze = part("courtBronze", "bronze", Object.assign({ specular: 0.35, shininess: 32 }, OUTSIDE));
    const linen = part("courtLinen", "linen", Object.assign({ specular: 0.03, shininess: 8 }, OUTSIDE));

    // Sixty pillars at five-cubit intervals: twenty south, twenty north, ten
    // west, ten east (Ex 27:9-16), corners counted once.
    const posts = [];
    for (let x = CX0; x < CX1; x += SPACING) posts.push([x, CZ0]);
    for (let z = CZ0; z < CZ1; z += SPACING) posts.push([CX1, z]);
    for (let x = CX1; x > CX0; x -= SPACING) posts.push([x, CZ1]);
    for (let z = CZ1; z > CZ0; z -= SPACING) posts.push([CX0, z]);

    for (const [x, z] of posts) {
      // Sockets of bronze, hooks and fillets of silver (Ex 27:10-11, 17).
      bronze.revolve(x, 0, z, [[0, 0], [0.36, 0], [0.34, 0.26], [0.2, 0.34]], 12, UV.bronze);
      wood.cylinder(x, z, 0.28, H, 0.17, 0.15, 12, UV.acacia, false);
      silver.revolve(x, 0, z, [
        [0.15, H - 0.08], [0.27, H + 0.02], [0.24, H + 0.2], [0.1, H + 0.34], [0, H + 0.36]
      ], 12, UV.silver);
      circle(x, z, 0.4, "courtPillar");
    }

    for (let i = 0; i < posts.length; i += 1) {
      railBetween(silver, posts[i], posts[(i + 1) % posts.length], H - 0.14, 0.05, UV.silver);
    }

    // Cords and pins of bronze (Ex 27:19; 35:18), leaning outward off each pillar.
    const outward = (x, z) => (z === CZ0 ? [0, -1] : z === CZ1 ? [0, 1] : x === CX0 ? [-1, 0] : [1, 0]);
    for (const [x, z] of posts) {
      // No stays across the doorway. The gate's pillars were braced somehow,
      // but not with ropes strung over the one way in.
      if (x === CX1 && z >= -GATE_HALF && z <= GATE_HALF) continue;
      const [ox, oz] = outward(x, z);
      const reach = 2.6;
      const pegX = x + ox * reach, pegZ = z + oz * reach;
      cord(silver, [x, H + 0.18, z], [pegX, 0.05, pegZ]);
      bronze.cylinder(pegX, pegZ, 0, 0.34, 0.075, 0.05, 6, UV.bronze, true);
      // A taut rope is a solid thing to walk into. Block the run of it that is
      // below head height; nearer the pillar you can pass under it.
      const t = 1 - 3.3 / (H + 0.18);
      colliders.push({
        kind: "segment",
        ax: x + ox * reach * t, az: z + oz * reach * t,
        bx: pegX, bz: pegZ, r: 0.26, id: "cord"
      });
    }

    // Hangings of fine twined linen, one bay per five cubits, except at the gate.
    for (let i = 0; i < posts.length; i += 1) {
      const a = posts[i], b = posts[(i + 1) % posts.length];
      const onGate = a[0] === CX1 && b[0] === CX1 &&
        Math.min(a[1], b[1]) >= -GATE_HALF && Math.max(a[1], b[1]) <= GATE_HALF;
      if (onGate) continue;
      fabricPanel(linen, a[0], a[1], b[0], b[1], H, 0.11, UV.linen, 6, 4);
    }

    // The gate: twenty cubits of blue, purple and scarlet, in four bays that
    // gather to their posts as you come up to them.
    const panels = [];
    for (let z = -GATE_HALF; z < GATE_HALF; z += SPACING) {
      const pivot = z + SPACING <= 0 ? z : z + SPACING;
      panels.push(curtainNode(gl, textures, "screen", CX1, z, z + SPACING, H, pivot, UV.screen, OUTSIDE, "courtGate"));
    }
    for (const node of panels) nodes.push(node);
    openings.push({
      id: "courtGate", x: CX1, z0: -GATE_HALF, z1: GATE_HALF, part: 0, panels, radius: 5.5,
      collider: { kind: "box", min: [CX1 - 0.25, 0, -GATE_HALF], max: [CX1 + 0.25, H, GATE_HALF], id: "courtGate", disabled: false }
    });

    box([CX0 - 0.25, 0, CZ0 - 0.25], [CX1 + 0.25, H, CZ0 + 0.25], "courtWall");
    box([CX0 - 0.25, 0, CZ1 - 0.25], [CX1 + 0.25, H, CZ1 + 0.25], "courtWall");
    box([CX0 - 0.25, 0, CZ0], [CX0 + 0.25, H, CZ1], "courtWall");
    box([CX1 - 0.25, 0, CZ0], [CX1 + 0.25, H, -GATE_HALF], "courtWall");
    box([CX1 - 0.25, 0, GATE_HALF], [CX1 + 0.25, H, CZ1], "courtWall");

    hotspot("courtGate", [CX1 - 0.7, 0, -GATE_HALF], [CX1 + 0.7, H, GATE_HALF]);
    hotspot("court", [CX0 - 0.7, 0, CZ0 - 0.7], [CX1 + 0.7, H, CZ0 + 0.7]);
    hotspot("court", [CX0 - 0.7, 0, CZ1 - 0.7], [CX1 + 0.7, H, CZ1 + 0.7]);
    hotspot("court", [CX0 - 0.7, 0, CZ0], [CX0 + 0.7, H, CZ1]);
    hotspot("court", [CX1 - 0.7, 0, CZ0], [CX1 + 0.7, H, -GATE_HALF]);
    hotspot("court", [CX1 - 0.7, 0, GATE_HALF], [CX1 + 0.7, H, CZ1]);
  }

  function cord(builder, from, to) {
    const path = [], radii = [];
    for (let i = 0; i <= 6; i += 1) {
      const t = i / 6;
      path.push([
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * 0.12,
        from[2] + (to[2] - from[2]) * t
      ]);
      radii.push(0.035);
    }
    builder.tube(path, radii, 5, 1.5);
  }

  /**
   * A curtain bay that can be drawn aside. It is its own draw node so the
   * renderer can gather it toward `pivot` and run pleats through it; the
   * doorway's collider only lifts once the cloth is genuinely out of the way.
   */
  function curtainNode(gl, textures, texture, x, z0, z1, height, pivot, scale, zone, id) {
    const builder = new Builder();
    builder.sheet(
      [x, 0, z0], [0, 0, z1 - z0], [0, height, 0], 8, 6, scale,
      (u, v) => {
        const belly = Math.sin(u * Math.PI) * (1 - v * 0.5);
        const ripple = Math.sin(u * Math.PI * 4 + 0.4) * 0.3 * (1 - v * 0.6);
        return [0.1 * (belly + ripple), -Math.sin(u * Math.PI) * 0.04 * (1 - v), 0];
      }
    );
    return Object.assign({
      key: `${id}:${z0}`,
      mesh: TB.gl.createMesh(gl, builder),
      texture: textures[texture],
      tint: [1, 1, 1], specular: 0.05, shininess: 10, emissive: 0, pleat: 0,
      indoor: 0, lampLit: 0, glowLit: 0,
      model: M4.create(),
      curtain: { pivot },
      hotspotId: id
    }, zone);
  }

  /** Tent door and veil: the cloth between the posts, and the blocker behind it. */
  function doorway(ctx, id, x, postCount, texture, scale, zone, radius) {
    const panels = [];
    const step = DIM.tent.width / (postCount - 1);
    for (let i = 0; i < postCount - 1; i += 1) {
      const a = TZ0 + step * i;
      const b = a + step;
      panels.push(curtainNode(ctx.gl, ctx.textures, texture, x, a, b, TENT_H, b <= 0 ? a : b, scale, zone, id));
    }
    for (const node of panels) ctx.nodes.push(node);
    ctx.openings.push({
      id, x, z0: TZ0, z1: TZ1, part: 0, panels, radius,
      collider: { kind: "box", min: [x - 0.22, 0, TZ0], max: [x + 0.22, TENT_H, TZ1], id, disabled: false }
    });
    ctx.hotspot(id, [x - 0.7, 0, TZ0], [x + 0.7, TENT_H, TZ1]);
  }

  // -------------------------------------------------------- tent shell -----
  function tentShell(ctx) {
    const { part, box, circle, hotspot } = ctx;
    const goldOut = part("tentGoldOut", "gold", Object.assign({ specular: 0.55, shininess: 40 }, OUTSIDE));
    const goldHoly = part("tentGoldHoly", "gold", Object.assign({ specular: 0.65, shininess: 44 }, HOLY_PLACE));
    const goldHoH = part("tentGoldHoH", "gold", Object.assign({ specular: 0.65, shininess: 44 }, HOLY_OF_HOLIES));
    const silver = part("tentSilver", "silver", Object.assign({ specular: 0.5, shininess: 48 }, OUTSIDE));
    const bronze = part("tentBronze", "bronze", Object.assign({ specular: 0.35, shininess: 32 }, OUTSIDE));

    const W = DIM.board.width;
    const gap = 0.02;

    /**
     * One gold-plated board standing in its two silver sockets. The board is
     * built once, into whichever room it faces; only the strip of its outer
     * face that shows below the goats'-hair covering is built again outside, so
     * the two never fight for the same depth.
     */
    function board(min, max, outAxis, outSign) {
      const centreX = (min[0] + max[0]) / 2;
      (centreX <= VEIL_X ? goldHoH : goldHoly).box(min, max, UV.gold);

      const skirtTop = 1.15;
      const e = 0.012 * outSign;
      if (outAxis === "z") {
        const z = outSign > 0 ? max[2] + e : min[2] + e;
        goldOut.quad(
          [min[0], 0, z], [max[0], 0, z], [max[0], skirtTop, z], [min[0], skirtTop, z],
          uvRect((max[0] - min[0]) * UV.gold, skirtTop * UV.gold), [0, 0, outSign]
        );
      } else {
        const x = outSign > 0 ? max[0] + e : min[0] + e;
        goldOut.quad(
          [x, 0, max[2]], [x, 0, min[2]], [x, skirtTop, min[2]], [x, skirtTop, max[2]],
          uvRect((max[2] - min[2]) * UV.gold, skirtTop * UV.gold), [outSign, 0, 0]
        );
      }

      const alongZ = outAxis === "x";
      const a = alongZ ? min[2] : min[0];
      const span = (alongZ ? max[2] : max[0]) - a;
      for (let s = 0; s < 2; s += 1) {
        const c = a + span * (s === 0 ? 0.26 : 0.74);
        const half = span * 0.19;
        silver.box(
          alongZ ? [min[0] - 0.09, 0, c - half] : [c - half, 0, min[2] - 0.09],
          alongZ ? [max[0] + 0.09, 0.5, c + half] : [c + half, 0.5, max[2] + 0.09],
          UV.silver
        );
      }
    }

    // Twenty boards south, twenty north (Ex 26:18, 20).
    for (let i = 0; i < 20; i += 1) {
      const x0 = TX0 + i * W + gap / 2;
      const x1 = TX0 + (i + 1) * W - gap / 2;
      board([x0, 0, TZ0 - BT], [x1, TENT_H, TZ0], "z", -1);
      board([x0, 0, TZ1], [x1, TENT_H, TZ1 + BT], "z", 1);
    }

    // Six boards for the west end, and the two corner boards (Ex 26:22-23).
    for (let i = 0; i < 6; i += 1) {
      const z0 = -4.5 + i * W + gap / 2;
      const z1 = -4.5 + (i + 1) * W - gap / 2;
      board([TX0 - BT, 0, z0], [TX0, TENT_H, z1], "x", -1);
    }
    for (const side of [-1, 1]) {
      const z0 = side < 0 ? TZ0 - BT : 4.5;
      const z1 = side < 0 ? -4.5 : TZ1 + BT;
      board([TX0 - BT, 0, z0 + gap / 2], [TX0, TENT_H, z1 - gap / 2], "x", -1);
      // "Coupled together beneath, and coupled together at the head" — the
      // corner board's remaining half cubit doubles round the corner.
      goldOut.box([TX0 - BT * 2, 0, z0], [TX0 - BT, TENT_H, z1], UV.gold);
    }

    // Five bars to a wall, the middle one reaching end to end (Ex 26:26-28).
    // They lie outside the boards, under the coverings, where they belonged.
    for (const [zc, sign] of [[TZ0 - BT, -1], [TZ1 + BT, 1]]) {
      for (let i = 0; i < 5; i += 1) {
        const y = 1.2 + i * 1.9;
        const middle = i === 2;
        const x0 = middle ? TX0 : TX0 + (i % 2 === 0 ? 0 : 15);
        const x1 = middle ? TX1 : x0 + 15;
        const zi = sign < 0 ? zc - 0.24 : zc;
        goldOut.box([x0, y, zi], [x1, y + 0.28, zi + 0.24], UV.gold);
      }
    }

    // Five pillars of acacia overlaid with gold in five sockets of bronze for
    // the door (Ex 26:37); four pillars in four sockets of silver for the veil
    // (Ex 26:32). Ninety-six board sockets plus these four make the hundred
    // talents of silver counted in Ex 38:27.
    for (let i = 0; i < 5; i += 1) {
      const z = TZ0 + i * (DIM.tent.width / 4);
      bronze.revolve(TX1, 0, z, [[0, 0], [0.34, 0], [0.32, 0.3], [0.2, 0.4]], 12, UV.bronze);
      goldOut.cylinder(TX1, z, 0.34, TENT_H + 0.2, 0.17, 0.15, 12, UV.gold, false);
      circle(TX1, z, 0.22, "doorPillar");
    }
    for (let i = 0; i < 4; i += 1) {
      const z = TZ0 + i * (DIM.tent.width / 3);
      silver.revolve(VEIL_X, 0, z, [[0, 0], [0.34, 0], [0.32, 0.3], [0.2, 0.4]], 12, UV.silver);
      goldHoly.cylinder(VEIL_X, z, 0.34, TENT_H + 0.2, 0.17, 0.15, 12, UV.gold, false);
      circle(VEIL_X, z, 0.22, "veilPillar");
    }

    // ---- the four coverings (Ex 26:1-14) ----
    // Innermost: ten curtains of fine twined linen with cherubim. From inside
    // this is the ceiling, and it is the only one of the four you ever see.
    ceiling(goldHolyCeiling(part), VEIL_X - 0.1, TX1 + 0.1, TZ0 - BT, TZ1 + BT);
    ceiling(goldHoHCeiling(part), TX0 - BT, VEIL_X + 0.1, TZ0 - BT, TZ1 + BT);

    // Fifty clasps of gold along the seam where the two sets of five curtains
    // couple — and it is under those clasps that the veil hangs (Ex 26:6, 33).
    for (let i = 0; i < 11; i += 1) {
      const z = TZ0 - BT + (i / 10) * (DIM.tent.width + BT * 2);
      goldHoly.box([VEIL_X - 0.09, TENT_H - 0.24, z - 0.06], [VEIL_X + 0.09, TENT_H - 0.06, z + 0.06], UV.gold);
    }

    // Eleven curtains of goats' hair, over the top and down to within a cubit
    // of the ground on both sides (Ex 26:7-13).
    const goat = part("goat", "goatHair", Object.assign({ specular: 0.02, shininess: 6 }, OUTSIDE));
    const roofY = TENT_H + 0.12;
    const gx0 = TX0 - BT * 2 - 0.35, gx1 = TX1 + 0.4;
    const gz0 = TZ0 - BT - 0.35, gz1 = TZ1 + BT + 0.35;
    const fall = roofY - 0.75;
    drape(goat, gx0, gx1, gz0, gz1, roofY, UV.goatHair, 0.14);
    goat.sheet([gx0, roofY, gz0], [gx1 - gx0, 0, 0], [0, -fall, 0], 10, 5, UV.goatHair,
      (u, v) => [0, 0, -Math.sin(u * Math.PI) * 0.16 - v * 0.1]);
    goat.sheet([gx0, roofY, gz1], [gx1 - gx0, 0, 0], [0, -fall, 0], 10, 5, UV.goatHair,
      (u, v) => [0, 0, Math.sin(u * Math.PI) * 0.16 + v * 0.1]);
    goat.sheet([gx0, roofY, gz0], [0, 0, gz1 - gz0], [0, -fall, 0], 6, 5, UV.goatHair,
      (u, v) => [-Math.sin(u * Math.PI) * 0.16 - v * 0.1, 0, 0]);
    // The sixth curtain, doubled in the forefront of the tent (Ex 26:9).
    goat.sheet([gx1, roofY, gz0], [0, 0, gz1 - gz0], [0, -1.6, 0], 6, 3, UV.goatHair,
      (u, v) => [Math.sin(u * Math.PI) * 0.1 + v * 0.18, 0, 0]);

    // Rams' skins dyed red, and above them the covering of tachash skin
    // (Ex 26:14) — roof coverings, each overhanging the one beneath.
    const ram = part("ram", "ramSkin", Object.assign({ specular: 0.12, shininess: 14 }, OUTSIDE));
    drape(ram, gx0 - 0.2, gx1 + 0.18, gz0 - 0.2, gz1 + 0.2, roofY + 0.18, UV.ramSkin, 0.1);
    skirt(ram, gx0 - 0.2, gx1 + 0.18, gz0 - 0.2, gz1 + 0.2, roofY + 0.18, 0.85, UV.ramSkin);

    const tachash = part("tachash", "tachash", Object.assign({ specular: 0.16, shininess: 18 }, OUTSIDE));
    drape(tachash, gx0 - 0.44, gx1 + 0.38, gz0 - 0.44, gz1 + 0.44, roofY + 0.36, UV.tachash, 0.08);
    skirt(tachash, gx0 - 0.44, gx1 + 0.38, gz0 - 0.44, gz1 + 0.44, roofY + 0.36, 0.66, UV.tachash);

    // Three solid walls. The east face is the door, handled as an opening, and
    // the roof is well above head height.
    box([gx0, 0, gz0], [TX0, TENT_H, gz1], "tentWall");
    box([TX0 - BT, 0, gz0], [TX1, TENT_H, TZ0], "tentWall");
    box([TX0 - BT, 0, TZ1], [TX1, TENT_H, gz1], "tentWall");

    // From inside you are looking at gold board and an embroidered ceiling;
    // from outside, at goats' hair. The pick targets are split the same way, so
    // clicking always names the thing actually in front of your eyes.
    hotspot("boards", [TX0 - BT, 0, TZ0], [TX1, TENT_H, TZ0 + 0.25]);
    hotspot("boards", [TX0 - BT, 0, TZ1 - 0.25], [TX1, TENT_H, TZ1]);
    hotspot("coverings", [TX0, TENT_H - 0.95, TZ0], [TX1, TENT_H + 0.05, TZ1]);
    hotspot("holyOfHolies", [TX0 - BT, 0, TZ0], [TX0 + 0.25, TENT_H, TZ1]);

    hotspot("coverings", [gx0, 0, gz0 - 0.5], [gx1, roofY + 0.8, gz0 + 0.15]);
    hotspot("coverings", [gx0, 0, gz1 - 0.15], [gx1, roofY + 0.8, gz1 + 0.5]);
    hotspot("coverings", [gx0 - 0.7, 0, gz0], [gx0 + 0.15, roofY + 0.8, gz1]);
    hotspot("coverings", [gx0, roofY - 0.25, gz0], [gx1, roofY + 0.9, gz1]);
  }

  function goldHolyCeiling(part) {
    return part("ceilHoly", "ceiling", Object.assign({ specular: 0.04, shininess: 8 }, HOLY_PLACE));
  }
  function goldHoHCeiling(part) {
    return part("ceilHoH", "ceiling", Object.assign({ specular: 0.04, shininess: 8 }, HOLY_OF_HOLIES));
  }
  function ceiling(builder, x0, x1, z0, z1) {
    builder.sheet(
      [x0, TENT_H - 0.03, z0], [x1 - x0, 0, 0], [0, 0, z1 - z0], 8, 6, UV.ceiling,
      (u, v) => [0, -Math.sin(u * Math.PI) * 0.05 - Math.sin(v * Math.PI) * 0.14, 0],
      true
    );
  }

  // ------------------------------------------------------ bronze altar -----
  function bronzeAltar({ part, box, hotspot, flames }) {
    const A = DIM.bronzeAltar;
    const cx = 75, cz = 0;                        // the centre of the eastern half
    const x0 = cx - A.length / 2, x1 = cx + A.length / 2;
    const z0 = cz - A.width / 2, z1 = cz + A.width / 2;
    const h = A.height;
    const grate = h / 2;                          // Ex 27:5 — even to the midst

    const bronze = part("altarBronze", "bronze", Object.assign({ specular: 0.4, shininess: 30 }, OUTSIDE));

    // Hollow with boards (Ex 27:8), plated in bronze, open at the top.
    bronze.box([x0, 0, z0], [x1, h, z1], UV.bronze, ["px", "nx", "pz", "nz"]);
    const inset = 0.14;
    const ix0 = x0 + inset, ix1 = x1 - inset, iz0 = z0 + inset, iz1 = z1 - inset;
    bronze.quad([ix0, grate, iz0], [ix0, grate, iz1], [ix0, h, iz1], [ix0, h, iz0], uvRect(A.width * UV.bronze, (h - grate) * UV.bronze), [1, 0, 0]);
    bronze.quad([ix1, grate, iz1], [ix1, grate, iz0], [ix1, h, iz0], [ix1, h, iz1], uvRect(A.width * UV.bronze, (h - grate) * UV.bronze), [-1, 0, 0]);
    bronze.quad([ix1, grate, iz0], [ix0, grate, iz0], [ix0, h, iz0], [ix1, h, iz0], uvRect(A.length * UV.bronze, (h - grate) * UV.bronze), [0, 0, 1]);
    bronze.quad([ix0, grate, iz1], [ix1, grate, iz1], [ix1, h, iz1], [ix0, h, iz1], uvRect(A.length * UV.bronze, (h - grate) * UV.bronze), [0, 0, -1]);
    bronze.quad([ix0, grate - 0.06, iz0], [ix1, grate - 0.06, iz0], [ix1, grate - 0.06, iz1], [ix0, grate - 0.06, iz1],
      uvRect(A.length * UV.bronze, A.width * UV.bronze), [0, 1, 0]);
    // The top of the wall, so it reads as a rim rather than a paper edge.
    bronze.quad([x0, h, z0], [x1, h, z0], [x1, h, iz0], [x0, h, iz0], uvRect(A.length * UV.bronze, inset * UV.bronze), [0, 1, 0]);
    bronze.quad([x0, h, iz1], [x1, h, iz1], [x1, h, z1], [x0, h, z1], uvRect(A.length * UV.bronze, inset * UV.bronze), [0, 1, 0]);
    bronze.quad([x0, h, iz0], [ix0, h, iz0], [ix0, h, iz1], [x0, h, iz1], uvRect(inset * UV.bronze, A.width * UV.bronze), [0, 1, 0]);
    bronze.quad([ix1, h, iz0], [x1, h, iz0], [x1, h, iz1], [ix1, h, iz1], uvRect(inset * UV.bronze, A.width * UV.bronze), [0, 1, 0]);

    // A grate of network of brass, reaching to the middle of the altar
    // (Ex 27:4-5). The fire and the offering rested on this.
    for (let i = 1; i < 10; i += 1) {
      const t = i / 10;
      bronze.box([ix0, grate - 0.05, z0 + t * A.width - 0.028], [ix1, grate + 0.01, z0 + t * A.width + 0.028], UV.bronze);
      bronze.box([x0 + t * A.length - 0.028, grate - 0.05, iz0], [x0 + t * A.length + 0.028, grate + 0.01, iz1], UV.bronze);
    }

    // The compass — the ledge round the altar — and the rings and staves on it.
    bronze.box([x0 - 0.18, grate - 0.14, z0 - 0.18], [x1 + 0.18, grate + 0.04, z1 + 0.18], UV.bronze);
    for (const rz of [z0 - 0.24, z1 + 0.24]) {
      for (const rx of [x0 + 0.7, x1 - 0.7]) {
        bronze.revolve(rx, grate + 0.22, rz, [[0.11, -0.06], [0.15, 0], [0.11, 0.06]], 10, UV.bronze);
      }
      staffAlongX(bronze, cx, grate + 0.22, rz, A.length / 2 + 0.9, 0.085, UV.bronze);
    }

    // Horns on the four corners, of one piece with it (Ex 27:2).
    for (const hx of [x0 + 0.34, x1 - 0.34]) {
      for (const hz of [z0 + 0.34, z1 - 0.34]) {
        bronze.revolve(hx, 0, hz, [
          [0.3, h - 0.12], [0.27, h + 0.18], [0.16, h + 0.44], [0.06, h + 0.62], [0, h + 0.64]
        ], 10, UV.bronze);
      }
    }

    box([x0 - 0.24, 0, z0 - 0.24], [x1 + 0.24, h, z1 + 0.24], "bronzeAltar");
    hotspot("bronzeAltar", [x0 - 0.5, 0, z0 - 0.5], [x1 + 0.5, h + 0.8, z1 + 0.5]);

    // The fire shall ever be burning upon the altar; it shall never go out
    // (Lev 6:13).
    const rand = rng(4021);
    for (let i = 0; i < 10; i += 1) {
      flames.push({
        pos: [ix0 + 0.25 + rand() * (ix1 - ix0 - 0.5), grate + 0.15, iz0 + 0.25 + rand() * (iz1 - iz0 - 0.5)],
        size: 0.5 + rand() * 0.8, rise: 0.85 + rand() * 0.8, phase: rand() * 10,
        tint: [1, 0.6, 0.22], alpha: 0.8
      });
    }
  }

  // ------------------------------------------------------------- laver -----
  function laver({ part, circle, hotspot }) {
    const cx = 60, cz = 0;                       // Ex 30:18 — between tent and altar
    const bronze = part("laverBronze", "bronze", Object.assign({ specular: 0.55, shininess: 46 }, OUTSIDE));
    const water = part("laverWater", "water", Object.assign({ specular: 0.7, shininess: 90 }, OUTSIDE));
    const R = DIM.laver.radius, rim = DIM.laver.rim;

    // RECONSTRUCTION: scripture gives the laver and its foot no measurements at
    // all — it is the only furnishing whose size is withheld. The shape here is
    // invented; the material, bronze from the women's mirrors, is not
    // (Ex 30:18; 38:8).
    bronze.revolve(cx, 0, cz, [
      [0, 0], [0.74, 0], [0.68, 0.13], [0.3, 0.32], [0.24, 0.74],
      [0.34, 0.92], [0.3, 1.02], [0.74, 1.2], [R, rim - 0.09],
      [R + 0.07, rim], [R - 0.07, rim - 0.03], [R - 0.12, 1.24], [0.28, 1.08]
    ], 24, UV.bronze);
    water.revolve(cx, 0, cz, [[0, rim - 0.3], [R - 0.14, rim - 0.28]], 24, UV.water);

    circle(cx, cz, R + 0.2, "laver");
    hotspot("laver", [cx - R - 0.4, 0, cz - R - 0.4], [cx + R + 0.4, rim + 0.3, cz + R + 0.4]);
  }

  // ---------------------------------------------------------- lampstand ----
  function menorah({ part, circle, hotspot, lamps, flames }) {
    const cx = 40, cz = -3.4;                    // Ex 26:35 — on the south side
    const gold = part("menorah", "gold", Object.assign({ specular: 0.8, shininess: 64 }, HOLY_PLACE));
    const top = DIM.menorah.height;
    const junctions = [1.02, 1.5, 1.98];

    // The shaft. Four cups made like almond blossoms belong to the shaft itself
    // (Ex 25:34); three more knops sit under the three pairs of branches
    // (Ex 25:35). The whole thing is one beaten piece of pure gold.
    gold.revolve(cx, 0, cz, [
      [0, 0], [0.46, 0.02], [0.43, 0.1], [0.24, 0.22], [0.12, 0.36],
      [0.085, 0.5], [0.17, 0.62], [0.085, 0.74],
      [0.08, junctions[0] - 0.09], [0.18, junctions[0]], [0.08, junctions[0] + 0.09],
      [0.08, junctions[1] - 0.09], [0.18, junctions[1]], [0.08, junctions[1] + 0.09],
      [0.08, junctions[2] - 0.09], [0.18, junctions[2]], [0.08, junctions[2] + 0.09],
      [0.075, 2.32], [0.16, 2.42], [0.075, 2.52],
      [0.075, 2.74], [0.15, 2.84], [0.09, 2.94], [0.14, top], [0.1, top + 0.03]
    ], 18, UV.gold);

    const lampTops = [[cx, top + 0.03, cz]];

    // Three branches out of one side and three out of the other (Ex 25:32),
    // each with three almond-blossom cups (Ex 25:33). Every branch is a half
    // circle from its knop on the shaft up to the common lamp height, so all
    // seven flames stand level.
    const spread = DIM.menorah.spread / 2;
    for (let k = 0; k < 3; k += 1) {
      const reach = spread * (1 - k * 0.3333);
      const startY = junctions[k];
      for (const side of [-1, 1]) {
        const dx = side * reach, dy = (top - 0.06) - startY;
        const len = Math.hypot(dx, dy);
        let perp = [dy / len, -dx / len];
        if (perp[0] * side < 0) perp = [-perp[0], -perp[1]];

        const steps = 18;
        const path = [], radii = [];
        for (let i = 0; i <= steps; i += 1) {
          const t = i / steps;
          const bulge = Math.sin(t * Math.PI) * (len / 2);
          path.push([
            cx + dx * t + perp[0] * bulge,
            startY + dy * t + perp[1] * bulge,
            cz
          ]);
          radii.push(0.062 + 0.012 * Math.sin(t * Math.PI));
        }
        gold.tube(path, radii, 10, UV.gold);

        for (const t of [0.26, 0.55, 0.84]) {
          const i = Math.round(t * steps);
          const p = path[i], q = path[Math.min(steps, i + 1)];
          blossom(gold, p, -Math.atan2(q[0] - p[0], q[1] - p[1]));
        }
        lampTops.push([path[steps][0], path[steps][1] + 0.06, cz]);
      }
    }

    // Seven lamps, and the light they give (Ex 25:37). The Holy Place has no
    // window: this is all of it.
    for (const p of lampTops) {
      gold.revolve(p[0], p[1], p[2], [
        [0, 0], [0.13, 0.01], [0.15, 0.09], [0.17, 0.17], [0.13, 0.19], [0.12, 0.1], [0.1, 0.02]
      ], 14, UV.gold);
      const from = gold.count();
      gold.revolve(0, 0, 0, [[0.07, 0], [0.05, 0.16], [0.03, 0.2]], 8, UV.gold);
      const m = M4.create();
      M4.rotationX(m, -1.15);                    // spout turned toward the table
      m[12] = p[0]; m[13] = p[1] + 0.12; m[14] = p[2] + 0.13;
      gold.transformFrom(from, m);

      lamps.push({ pos: [p[0], p[1] + 0.26, p[2] + 0.08], colour: [1.0, 0.64, 0.3] });
      flames.push({
        pos: [p[0], p[1] + 0.2, p[2] + 0.16],
        size: 0.22, rise: 0.14, phase: p[0] * 3.1 + p[1] * 5.7,
        tint: [1, 0.8, 0.44], alpha: 0.95, indoor: true
      });
    }

    circle(cx, cz, 0.6, "menorah");
    // Reaches above the lamps: their flames sit at roughly a visitor's eye
    // height, and looking straight at them should name the lampstand, not the
    // wall behind it.
    hotspot("menorah", [cx - spread - 0.4, 0, cz - 0.7], [cx + spread + 0.4, top + 1.3, cz + 0.7]);
  }

  /** One cup made like an almond blossom, with its knop and its flower. */
  function blossom(builder, at, tilt) {
    const from = builder.count();
    builder.revolve(0, 0, 0, [
      [0.05, -0.13], [0.105, -0.06], [0.115, 0],
      [0.07, 0.04], [0.055, 0.065],
      [0.105, 0.145], [0.12, 0.185], [0.09, 0.195], [0.045, 0.13]
    ], 12, UV.gold);
    const m = M4.create();
    M4.rotationZ(m, tilt);
    m[12] = at[0]; m[13] = at[1]; m[14] = at[2];
    builder.transformFrom(from, m);
  }

  // ------------------------------------------------- table of showbread ----
  function table({ part, box, hotspot }) {
    const T = DIM.table;
    const cx = 40, cz = 3.4;                     // Ex 26:35 — on the north side
    const x0 = cx - T.length / 2, x1 = cx + T.length / 2;
    const z0 = cz - T.width / 2, z1 = cz + T.width / 2;
    const h = T.height, hb = DIM.handbreadth;

    const gold = part("table", "gold", Object.assign({ specular: 0.75, shininess: 58 }, HOLY_PLACE));
    const bread = part("bread", "bread", Object.assign({ specular: 0.06, shininess: 8 }, HOLY_PLACE));

    gold.box([x0, h - 0.09, z0], [x1, h, z1], UV.gold);
    crown(gold, x0, x1, z0, z1, h, 0.06, 0.09, UV.gold);      // Ex 25:24

    // A border of a handbreadth round about, with a golden crown to the border
    // also (Ex 25:25).
    const by = h - 0.44;
    gold.box([x0, by, z0], [x1, by + hb, z0 + 0.07], UV.gold);
    gold.box([x0, by, z1 - 0.07], [x1, by + hb, z1], UV.gold);
    gold.box([x0, by, z0], [x0 + 0.07, by + hb, z1], UV.gold);
    gold.box([x1 - 0.07, by, z0], [x1, by + hb, z1], UV.gold);
    crown(gold, x0, x1, z0, z1, by + hb, 0.04, 0.05, UV.gold);

    for (const lx of [x0 + 0.06, x1 - 0.15]) {
      for (const lz of [z0 + 0.06, z1 - 0.15]) {
        gold.box([lx, 0, lz], [lx + 0.14, h - 0.09, lz + 0.14], UV.gold);
      }
    }

    // Rings by the border, for the staves (Ex 25:26-28).
    for (const rz of [z0 - 0.04, z1 + 0.04]) {
      for (const rx of [x0 + 0.24, x1 - 0.24]) {
        gold.revolve(rx, by + hb * 0.5, rz, [[0.08, -0.05], [0.115, 0], [0.08, 0.05]], 10, UV.gold);
      }
      staffAlongX(gold, cx, by + hb * 0.5, rz, T.length / 2 + 0.55, 0.05, UV.gold);
    }

    // Twelve loaves, two rows of six (Lev 24:5-6), with the frankincense set
    // beside them (Lev 24:7).
    for (let row = 0; row < 2; row += 1) {
      for (let i = 0; i < 6; i += 1) {
        const lx = x0 + 0.32 + i * 0.235;
        const lz = cz + (row === 0 ? -0.21 : 0.02);
        bread.box([lx, h, lz], [lx + 0.2, h + 0.1, lz + 0.19], UV.bread);
      }
    }
    for (const dx of [x0 + 0.17, x1 - 0.17]) {
      gold.revolve(dx, h, cz, [[0, 0], [0.1, 0.005], [0.115, 0.07], [0.095, 0.075], [0.085, 0.02]], 12, UV.gold);
    }

    box([x0 - 0.12, 0, z0 - 0.12], [x1 + 0.12, h, z1 + 0.12], "table");
    hotspot("table", [x0 - 0.7, 0, z0 - 0.35], [x1 + 0.7, h + 0.5, z1 + 0.35]);
  }

  // ---------------------------------------------------- altar of incense ---
  function incenseAltar({ part, box, hotspot, flames }) {
    const A = DIM.altarOfIncense;
    const cx = VEIL_X + 1.6, cz = 0;             // Ex 30:6 — before the veil
    const x0 = cx - A.length / 2, x1 = cx + A.length / 2;
    const z0 = cz - A.width / 2, z1 = cz + A.width / 2;
    const h = A.height;

    const gold = part("incense", "gold", Object.assign({ specular: 0.75, shininess: 58 }, HOLY_PLACE));
    gold.box([x0, 0, z0], [x1, h, z1], UV.gold);
    crown(gold, x0, x1, z0, z1, h, 0.05, 0.07, UV.gold);
    for (const hx of [x0 + 0.13, x1 - 0.13]) {
      for (const hz of [z0 + 0.13, z1 - 0.13]) {
        gold.revolve(hx, 0, hz, [[0.1, h], [0.085, h + 0.16], [0.05, h + 0.28], [0, h + 0.32]], 8, UV.gold);
      }
    }
    // Two golden rings under the crown, on the two sides (Ex 30:4).
    for (const rz of [z0 - 0.03, z1 + 0.03]) {
      gold.revolve(cx, h - 0.34, rz, [[0.075, -0.05], [0.105, 0], [0.075, 0.05]], 10, UV.gold);
    }
    staffAlongX(gold, cx, h - 0.34, z1 + 0.03, 0.9, 0.05, UV.gold);

    // A perpetual incense before the LORD, morning and evening (Ex 30:7-8).
    for (let i = 0; i < 5; i += 1) {
      flames.push({
        pos: [cx, h + 0.24 + i * 0.42, cz],
        size: 0.17 + i * 0.14, rise: 0.55 + i * 0.28, phase: i * 2.3,
        tint: [0.74, 0.79, 0.87], alpha: 0.2 - i * 0.03, indoor: true, smoke: true
      });
    }

    box([x0 - 0.12, 0, z0 - 0.12], [x1 + 0.12, h, z1 + 0.12], "incenseAltar");
    hotspot("incenseAltar", [x0 - 0.55, 0, z0 - 0.55], [x1 + 0.55, h + 0.5, z1 + 0.55]);
  }

  // --------------------------------------------------------------- ark -----
  function ark({ part, box, hotspot }) {
    const A = DIM.ark;
    const cx = 25, cz = 0;                       // the centre of the Holy of Holies
    const x0 = cx - A.length / 2, x1 = cx + A.length / 2;
    const z0 = cz - A.width / 2, z1 = cz + A.width / 2;
    const h = A.height;

    const gold = part("ark", "gold", Object.assign({ specular: 0.85, shininess: 70, emissive: 0.04 }, HOLY_OF_HOLIES));

    // Overlaid with pure gold within and without (Ex 25:11).
    gold.box([x0, 0, z0], [x1, h, z1], UV.gold);
    crown(gold, x0, x1, z0, z1, h - 0.11, 0.045, 0.11, UV.gold);

    // The mercy seat: a separate piece of pure gold, two cubits and a half by a
    // cubit and a half (Ex 25:17). RECONSTRUCTION: its thickness is not given.
    const lid = h + 0.14;
    gold.box([x0 - 0.02, h, z0 - 0.02], [x1 + 0.02, lid, z1 + 0.02], UV.gold);

    // Four rings, and staves that were never to be taken out (Ex 25:12-15). The
    // staves run east and west, the arrangement 1 Kings 8:8 implies when it says
    // their ends could be seen from the Holy Place.
    for (const rz of [z0 - 0.04, z1 + 0.04]) {
      for (const rx of [x0 + 0.3, x1 - 0.3]) {
        gold.revolve(rx, 0.3, rz, [[0.1, -0.055], [0.14, 0], [0.1, 0.055]], 10, UV.gold);
      }
      staffAlongX(gold, cx, 0.3, rz, A.length / 2 + 1.05, 0.062, UV.gold);
    }

    // Two cherubim of beaten gold at the two ends, wings stretched on high and
    // covering the mercy seat, their faces one to another (Ex 25:18-20).
    // RECONSTRUCTION: scripture gives them no size and no form beyond that.
    cherub(gold, x0 + 0.36, lid, cz, 1);
    cherub(gold, x1 - 0.36, lid, cz, -1);

    box([x0 - 0.18, 0, z0 - 0.18], [x1 + 0.18, lid, z1 + 0.18], "ark");
    hotspot("ark", [x0 - 0.45, 0, z0 - 0.6], [x1 + 0.45, h, z1 + 0.6]);
    hotspot("mercySeat", [x0 - 0.45, h, z0 - 0.8], [x1 + 0.45, lid + 1.6, z1 + 0.8]);
  }

  /**
   * One cherub, facing along +X when `facing` is 1. Deliberately unspecific: a
   * body, a bowed head, and two wings arched up and forward until they meet the
   * other's over the mercy seat. Exodus describes the wings and the faces and
   * nothing else, so nothing else is asserted here.
   */
  function cherub(builder, x, y, z, facing) {
    const from = builder.count();
    builder.revolve(0, 0, 0, [
      [0, 0], [0.26, 0.01], [0.24, 0.1], [0.15, 0.34], [0.13, 0.64],
      [0.17, 0.78], [0.1, 0.88], [0.13, 0.94], [0.15, 1.02], [0.1, 1.1], [0, 1.13]
    ], 14, UV.gold);

    // Wings: curved sheets rising from the shoulders, sweeping forward and
    // arching over toward the middle of the lid.
    for (const side of [-1, 1]) {
      builder.sheet(
        [0, 0.64, side * 0.11], [0, 0, side * 0.6], [0.9, 0.72, 0], 5, 8, UV.gold,
        (u, v) => [
          -Math.sin(v * Math.PI * 0.85) * 0.34 - u * 0.1,
          Math.sin(v * Math.PI) * 0.14 - v * v * 0.2,
          -side * Math.sin(v * Math.PI * 0.6) * 0.28 * u
        ],
        true
      );
    }

    const m = M4.create();
    M4.rotationY(m, facing > 0 ? 0 : Math.PI);
    m[12] = x; m[13] = y; m[14] = z;
    builder.transformFrom(from, m);
  }

  TB.model = { DIM, build, VEIL_X, TX0, TX1, TZ0, TZ1, CX0, CX1, CZ0, CZ1, TENT_H, GATE_HALF };
})(window);
