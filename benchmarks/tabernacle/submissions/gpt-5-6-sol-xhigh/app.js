(() => {
  "use strict";

  const canvas = document.getElementById("world");
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    depth: true,
    powerPreference: "high-performance"
  });

  if (!gl) {
    document.getElementById("unsupported").hidden = false;
    document.getElementById("intro").hidden = true;
    return;
  }

  const ui = {
    intro: document.getElementById("intro"),
    enter: document.getElementById("enterButton"),
    location: document.getElementById("location"),
    heading: document.getElementById("heading"),
    targetPrompt: document.getElementById("targetPrompt"),
    targetName: document.getElementById("targetName"),
    info: document.getElementById("infoPanel"),
    infoClose: document.getElementById("infoClose"),
    about: document.getElementById("aboutButton"),
    kicker: document.getElementById("infoKicker"),
    title: document.getElementById("infoTitle"),
    body: document.getElementById("infoBody"),
    measure: document.getElementById("infoMeasure"),
    measureRow: document.getElementById("infoMeasureRow"),
    source: document.getElementById("infoSource"),
    note: document.getElementById("infoNote")
  };

  const EXHIBITS = {
    court: {
      kicker: "The outer court · חָצֵר",
      title: "A boundary of linen",
      body: "Fine linen hangings marked out a long, open court: one hundred cubits east to west and fifty north to south. Sixty posts stood in bronze bases with silver hooks and bands. The enclosure made approach visible and deliberate while leaving the sky open above.",
      measure: "100 × 50 × 5 cubits",
      source: "Exodus 27:9–19; 38:9–20"
    },
    gate: {
      kicker: "The eastern entrance",
      title: "The gate of the court",
      body: "A twenty-cubit screen of blue, purple, and scarlet yarn with fine linen formed the court’s single eastern gate. The entrance faced the sunrise; beyond it, the altar stood before the tent.",
      measure: "20 cubits wide",
      source: "Exodus 27:13–16; 38:13–19",
      note: "The screen is shown drawn apart at its center so a modern visitor can pass through."
    },
    altar: {
      kicker: "The outer court · מִזְבֵּחַ",
      title: "The bronze altar",
      body: "This hollow acacia-wood altar was overlaid with bronze. Its four horns were made as one with its corners; a bronze grating, rings, utensils, and bronze-clad carrying poles belonged to it. Here burnt offerings were presented before the entrance of the tent.",
      measure: "5 × 5 × 3 cubits",
      source: "Exodus 27:1–8; 38:1–7; 40:29"
    },
    laver: {
      kicker: "The outer court · כִּיּוֹר",
      title: "The bronze basin",
      body: "The basin stood between altar and tent. Aaron and his sons washed their hands and feet from its water before entering the tent or approaching the altar. Exodus says that its bronze came from the mirrors of the women who served at the entrance.",
      measure: "Dimensions are not given",
      source: "Exodus 30:17–21; 38:8; 40:30–32",
      note: "Its rounded form and size here are interpretive because the text supplies neither."
    },
    coverings: {
      kicker: "The tent of meeting · אֹהֶל מוֹעֵד",
      title: "Layer upon layer",
      body: "The sanctuary was portable architecture: embroidered linen beneath eleven goat-hair curtains, then a covering of red-dyed ram skins and an outer protective covering. Gold-plated acacia frames stood in silver sockets under the layered cloth.",
      measure: "Tent: 30 × 10 × 10 cubits",
      source: "Exodus 26:1–30; 36:8–34",
      note: "Exodus gives curtain and frame dimensions but no roof profile. This reconstruction uses a nearly flat, layered covering."
    },
    entrance: {
      kicker: "The tent of meeting",
      title: "The entrance screen",
      body: "Five gold-plated acacia columns in bronze bases carried a screen of blue, purple, and scarlet yarn and fine linen. It opened from the court into the first chamber, the Holy Place.",
      measure: "Tent width: 10 cubits",
      source: "Exodus 26:36–37; 36:37–38",
      note: "The screen is parted to make the interior accessible in this educational reconstruction."
    },
    frames: {
      kicker: "The structure",
      title: "Frames, bars, and sockets",
      body: "Twenty upright frames formed each long side and eight stood at the western rear, each frame ten cubits high and one and a half wide. They were gold-plated, joined by gold-plated bars, and seated two sockets at a time in silver bases.",
      measure: "Each frame: 10 × 1½ cubits",
      source: "Exodus 26:15–30; 36:20–34"
    },
    table: {
      kicker: "Holy Place · שֻׁלְחָן",
      title: "The table of the Presence",
      body: "An acacia-wood table overlaid with pure gold stood on the north side of the Holy Place. Its gold rim, rings, poles, plates, dishes, pitchers, and bowls belonged to its service. Bread was kept arranged before the LORD; later instruction describes twelve loaves in two rows.",
      measure: "2 × 1 × 1½ cubits",
      source: "Exodus 25:23–30; 37:10–16; 40:22–23; Leviticus 24:5–9"
    },
    menorah: {
      kicker: "Holy Place · מְנוֹרָה",
      title: "The lampstand",
      body: "Hammered from a single talent of pure gold, the lampstand had a central shaft and six branches ornamented like almond blossoms—seven lamps in all. It stood on the south side opposite the table, tended with pure beaten olive oil.",
      measure: "Dimensions are not given",
      source: "Exodus 25:31–40; 27:20–21; 37:17–24; 40:24–25",
      note: "Its height, proportions, and curved branches are a restrained visual interpretation."
    },
    incense: {
      kicker: "Holy Place · מִזְבַּח הַקְּטֹרֶת",
      title: "The altar of incense",
      body: "This small acacia altar was overlaid with pure gold and stood directly before the veil. Fragrant incense was burned on it morning and evening when the lamps were tended; ordinary incense and other offerings did not belong here.",
      measure: "1 × 1 × 2 cubits",
      source: "Exodus 30:1–10, 34–38; 37:25–29; 40:26–27"
    },
    veil: {
      kicker: "The inner boundary · פָּרֹכֶת",
      title: "The veil",
      body: "A veil of blue, purple, and scarlet yarn and fine linen, worked with cherubim, hung from four gold-plated columns in silver bases. It divided the Holy Place from the innermost chamber and screened the ark from view.",
      measure: "Across the 10-cubit tent",
      source: "Exodus 26:31–35; 36:35–36; 40:21",
      note: "The central opening is an interpretive accommodation. In Israel’s worship this boundary was not a public passage."
    },
    ark: {
      kicker: "Holy of Holies · אֲרוֹן הַבְּרִית",
      title: "The ark of the covenant",
      body: "A chest of acacia wood overlaid inside and out with pure gold held the covenant testimony. Its gold cover—the place of atonement—was made with two cherubim facing inward, their wings overshadowing it. The carrying poles remained in its rings.",
      measure: "2½ × 1½ × 1½ cubits",
      source: "Exodus 25:10–22; 37:1–9; 40:20–21",
      note: "Scripture does not define the cherubim’s anatomy. The abstract winged forms avoid claiming a certainty the text does not give."
    },
    presence: {
      kicker: "Completion",
      title: "Cloud over the dwelling",
      body: "When the work was finished, the cloud covered the tent of meeting and the glory of the LORD filled the tabernacle. The cloud’s lifting signaled Israel to set out; when it remained, the people stayed. At night, fire was visible in it.",
      measure: "A sign, not a furnishing",
      source: "Exodus 40:33–38",
      note: "The luminous cloud is atmospheric interpretation rather than a depiction of the divine."
    },
    about: {
      kicker: "Reconstruction notes",
      title: "What is known—and what is not",
      body: "The model keeps the dimensions and east-to-west arrangement given in Exodus. One cubit is one world unit, so relationships are internally exact. The text fixes the court, altar, tent framework, ark, table, incense altar, curtain counts, materials, and placement. It does not specify a modern cubit conversion, the roof profile, the basin’s size, the menorah’s dimensions, or the cherubim’s anatomy.",
      measure: "Scale is relational: 1 unit = 1 cubit",
      source: "Primary model: Exodus 25–27, 30, 36–40",
      note: "This is a respectful educational reconstruction, not a claim that every visual choice is archaeologically certain."
    }
  };

  const C = {
    sand: [0.53, 0.39, 0.24, 0],
    sandLight: [0.64, 0.49, 0.30, 0],
    sandDark: [0.42, 0.30, 0.18, 0],
    linen: [0.79, 0.75, 0.64, 0.03],
    linenShade: [0.66, 0.62, 0.54, 0.01],
    blue: [0.10, 0.28, 0.51, 0.05],
    purple: [0.34, 0.15, 0.38, 0.04],
    scarlet: [0.55, 0.11, 0.10, 0.04],
    bronze: [0.55, 0.30, 0.12, 0.13],
    bronzeDark: [0.28, 0.14, 0.06, 0.03],
    gold: [0.83, 0.59, 0.19, 0.27],
    goldDark: [0.44, 0.27, 0.07, 0.09],
    silver: [0.66, 0.69, 0.68, 0.09],
    wood: [0.36, 0.20, 0.09, 0],
    goatHair: [0.20, 0.17, 0.14, 0],
    ramSkin: [0.39, 0.12, 0.09, 0.01],
    charcoal: [0.08, 0.065, 0.05, 0],
    ember: [0.85, 0.20, 0.035, 0.72],
    water: [0.10, 0.39, 0.48, 0.20],
    bread: [0.73, 0.49, 0.23, 0.03]
  };

  const geometry = {
    positions: [],
    normals: [],
    colors: []
  };
  const colliders = [];
  const hotspots = [];
  const particles = [];

  function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function lengthOf(v) {
    return Math.hypot(v[0], v[1], v[2]);
  }

  function normalize(v) {
    const length = lengthOf(v) || 1;
    return [v[0] / length, v[1] / length, v[2] / length];
  }

  function mix(a, b, t) {
    return a.map((value, index) => value + (b[index] - value) * t);
  }

  function triangle(a, b, c, color, suppliedNormal) {
    const normal = suppliedNormal || normalize(cross(subtract(b, a), subtract(c, a)));
    for (const point of [a, b, c]) {
      geometry.positions.push(...point);
      geometry.normals.push(...normal);
      geometry.colors.push(...color);
    }
  }

  function quad(a, b, c, d, color) {
    const normal = normalize(cross(subtract(b, a), subtract(c, a)));
    triangle(a, b, c, color, normal);
    triangle(a, c, d, color, normal);
  }

  function box(x, y, z, width, height, depth, color) {
    const x0 = x - width / 2;
    const x1 = x + width / 2;
    const y0 = y - height / 2;
    const y1 = y + height / 2;
    const z0 = z - depth / 2;
    const z1 = z + depth / 2;
    quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],color);
    quad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],color);
    quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],color);
    quad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],color);
    quad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],color);
    quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],color);
  }

  function tube(a, b, radiusA, color, segments = 10, radiusB = radiusA) {
    const axis = normalize(subtract(b, a));
    const helper = Math.abs(axis[1]) < 0.85 ? [0, 1, 0] : [1, 0, 0];
    const sideA = normalize(cross(axis, helper));
    const sideB = normalize(cross(axis, sideA));
    const ringA = [];
    const ringB = [];
    for (let index = 0; index < segments; index += 1) {
      const angle = index / segments * Math.PI * 2;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      ringA.push([
        a[0] + (sideA[0] * ca + sideB[0] * sa) * radiusA,
        a[1] + (sideA[1] * ca + sideB[1] * sa) * radiusA,
        a[2] + (sideA[2] * ca + sideB[2] * sa) * radiusA
      ]);
      ringB.push([
        b[0] + (sideA[0] * ca + sideB[0] * sa) * radiusB,
        b[1] + (sideA[1] * ca + sideB[1] * sa) * radiusB,
        b[2] + (sideA[2] * ca + sideB[2] * sa) * radiusB
      ]);
    }
    for (let index = 0; index < segments; index += 1) {
      const next = (index + 1) % segments;
      quad(ringA[index], ringA[next], ringB[next], ringB[index], color);
      triangle(a, ringA[next], ringA[index], color, axis.map((value) => -value));
      triangle(b, ringB[index], ringB[next], color, axis);
    }
  }

  function curtain(x1, z1, x2, z2, bottom, height, palette, segments = 24, amplitude = 0.055) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const distance = Math.hypot(dx, dz) || 1;
    const nx = -dz / distance;
    const nz = dx / distance;
    const rows = 4;
    const points = [];
    for (let row = 0; row <= rows; row += 1) {
      points[row] = [];
      for (let column = 0; column <= segments; column += 1) {
        const t = column / segments;
        const wave = Math.sin(t * Math.PI * segments * 0.5) * amplitude;
        points[row][column] = [
          x1 + dx * t + nx * wave,
          bottom + height * row / rows,
          z1 + dz * t + nz * wave
        ];
      }
    }
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < segments; column += 1) {
        const color = Array.isArray(palette[0])
          ? palette[column % palette.length]
          : palette;
        quad(
          points[row][column],
          points[row][column + 1],
          points[row + 1][column + 1],
          points[row + 1][column],
          color
        );
      }
    }
  }

  function addCollider(x, z, width, depth) {
    colliders.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2
    });
  }

  function addHotspot(id, center, radius) {
    hotspots.push({ id, center, radius, data: EXHIBITS[id] });
  }

  function addParticle(kind, base, color, size, phase = Math.random() * Math.PI * 2) {
    particles.push({ kind, base, color, size, phase });
  }

  let randomState = 947231;
  function random() {
    randomState = (Math.imul(1664525, randomState) + 1013904223) >>> 0;
    return randomState / 4294967296;
  }

  function buildLandscape() {
    quad([-100,0,-100],[-100,0,100],[100,0,100],[100,0,-100],C.sand);

    for (let index = 0; index < 180; index += 1) {
      const x = (random() - 0.5) * 170;
      const z = (random() - 0.5) * 180;
      const size = 0.15 + random() * 0.65;
      const color = random() > 0.55 ? C.sandLight : C.sandDark;
      quad(
        [x - size, 0.012, z],
        [x, 0.012, z + size * 0.28],
        [x + size, 0.012, z],
        [x, 0.012, z - size * 0.28],
        color
      );
    }

    const mountainColor = [0.34, 0.29, 0.24, 0];
    const mountainLight = [0.43, 0.36, 0.28, 0];
    for (let index = 0; index < 18; index += 1) {
      const angle = index / 18 * Math.PI * 2;
      const radius = 78 + random() * 12;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const width = 12 + random() * 16;
      const height = 6 + random() * 13;
      const depth = 8 + random() * 12;
      const color = index % 2 ? mountainColor : mountainLight;
      triangle([x - width/2,0,z + depth/2],[x + width/2,0,z + depth/2],[x, height, z],color);
      triangle([x + width/2,0,z + depth/2],[x + width/2,0,z - depth/2],[x, height, z],color);
      triangle([x + width/2,0,z - depth/2],[x - width/2,0,z - depth/2],[x, height, z],color);
      triangle([x - width/2,0,z - depth/2],[x - width/2,0,z + depth/2],[x, height, z],color);
    }

    for (let index = 0; index < 120; index += 1) {
      addParticle(
        "dust",
        [(random() - 0.5) * 90, 0.4 + random() * 6, (random() - 0.5) * 125],
        [0.96, 0.79, 0.49, 0.20 + random() * 0.18],
        5 + random() * 8,
        random() * Math.PI * 2
      );
    }
  }

  function buildCourt() {
    curtain(-25,-50,-25,50,0.25,4.75,[C.linen,C.linenShade],40);
    curtain(25,50,25,-50,0.25,4.75,[C.linen,C.linenShade],40);
    curtain(25,-50,-25,-50,0.25,4.75,[C.linen,C.linenShade],24);
    curtain(-25,50,-10,50,0.25,4.75,[C.linen,C.linenShade],12);
    curtain(10,50,25,50,0.25,4.75,[C.linen,C.linenShade],12);
    const gatePalette = [C.blue,C.blue,C.purple,C.purple,C.scarlet,C.scarlet,C.linen];
    curtain(-10,50,-1.55,50,0.25,4.75,gatePalette,14,0.08);
    curtain(1.55,50,10,50,0.25,4.75,gatePalette,14,0.08);

    addCollider(-25, 0, 0.35, 100.4);
    addCollider(25, 0, 0.35, 100.4);
    addCollider(0, -50, 50.4, 0.35);
    addCollider(-17.5, 50, 15, 0.35);
    addCollider(17.5, 50, 15, 0.35);
    addCollider(-5.75, 50, 8.5, 0.35);
    addCollider(5.75, 50, 8.5, 0.35);

    const courtPost = (x, z) => {
      tube([x,0,z],[x,0.32,z],0.23,C.bronze,10);
      tube([x,0.32,z],[x,5.15,z],0.095,C.wood,8);
      tube([x,4.68,z],[x,4.82,z],0.15,C.silver,10);
      tube([x,5.06,z],[x,5.22,z],0.14,C.silver,10,0.07);
    };

    for (let index = 0; index < 20; index += 1) {
      const z = -47.5 + index * 5;
      courtPost(-25, z);
      courtPost(25, z);
    }
    for (let index = 0; index < 10; index += 1) {
      const x = -22.5 + index * 5;
      courtPost(x, -50);
    }
    for (const x of [-25,-20,-15,-10,-5,5,10,15,20,25]) {
      courtPost(x, 50);
    }

    addHotspot("court", [23, 2.6, 15], 3.2);
    addHotspot("gate", [0, 2.5, 49.7], 3.0);
  }

  function buildBronzeAltar() {
    box(0, 1.5, 25, 5, 3, 5, C.bronze);
    box(0, 2.92, 25, 4.3, 0.11, 4.3, C.bronzeDark);
    box(0, 3.0, 25, 3.7, 0.08, 3.7, C.charcoal);

    for (const x of [-2.27, 2.27]) {
      for (const z of [22.73, 27.27]) {
        tube([x,2.85,z],[x,3.72,z],0.19,C.bronze,8,0.065);
      }
    }

    for (const z of [22.55, 27.45]) {
      tube([-3.45,1.25,z],[3.45,1.25,z],0.09,C.bronzeDark,10);
      for (const x of [-2.25,2.25]) {
        tube([x,1.0,z],[x,1.48,z],0.15,C.bronze,10);
      }
    }

    for (let index = 0; index < 32; index += 1) {
      addParticle(
        index < 14 ? "flame" : "smoke",
        [(random() - 0.5) * 2.8, 3.05 + random() * 0.4, 25 + (random() - 0.5) * 2.8],
        index < 14 ? [1.0, 0.33 + random() * 0.3, 0.04, 0.74] : [0.22,0.19,0.16,0.18],
        index < 14 ? 18 + random() * 13 : 30 + random() * 25,
        random() * Math.PI * 2
      );
    }

    addCollider(0, 25, 5.7, 5.7);
    addHotspot("altar", [0, 2.0, 25], 3.3);
  }

  function buildLaver() {
    tube([0,0,-1.5],[0,0.55,-1.5],0.62,C.bronzeDark,16,0.47);
    tube([0,0.55,-1.5],[0,1.06,-1.5],0.52,C.bronze,16,1.18);
    tube([0,1.02,-1.5],[0,1.18,-1.5],1.22,C.bronze,18,1.0);
    tube([0,1.17,-1.5],[0,1.2,-1.5],0.93,C.water,20);
    addCollider(0, -1.5, 2.6, 2.6);
    addHotspot("laver", [0, 1.0, -1.5], 2.0);
  }

  function buildTent() {
    box(-5.08,5,-30,0.20,10,30.2,C.ramSkin);
    box(5.08,5,-30,0.20,10,30.2,C.ramSkin);
    box(0,5,-45.08,10.2,10,0.20,C.ramSkin);
    box(-2.94,5,-14.98,4.12,10,0.18,C.goatHair);
    box(2.94,5,-14.98,4.12,10,0.18,C.goatHair);
    box(0,10.06,-30,10.55,0.24,30.55,C.goatHair);
    box(0,10.24,-30,10.2,0.12,30.2,C.ramSkin);

    curtain(-4.93,-15,-4.93,-45,0.2,9.62,[C.linen,C.blue,C.linen,C.purple,C.linen,C.scarlet],40,0.025);
    curtain(4.93,-45,4.93,-15,0.2,9.62,[C.linen,C.blue,C.linen,C.purple,C.linen,C.scarlet],40,0.025);
    curtain(4.9,-44.93,-4.9,-44.93,0.2,9.62,[C.linen,C.purple,C.linen,C.scarlet],20,0.025);
    quad([-4.9,9.92,-15],[-4.9,9.92,-45],[4.9,9.92,-45],[4.9,9.92,-15],C.linenShade);

    const screenPalette = [C.blue,C.blue,C.purple,C.linen,C.scarlet,C.scarlet,C.linen];
    curtain(-5,-14.85,-0.9,-14.85,0.15,9.7,screenPalette,13,0.07);
    curtain(0.9,-14.85,5,-14.85,0.15,9.7,screenPalette,13,0.07);

    addCollider(-5.08, -30, 0.38, 30.4);
    addCollider(5.08, -30, 0.38, 30.4);
    addCollider(0, -45.08, 10.4, 0.38);
    addCollider(-2.95, -14.95, 4.1, 0.3);
    addCollider(2.95, -14.95, 4.1, 0.3);

    for (let index = 0; index < 20; index += 1) {
      const z = -15.75 - index * 1.5;
      for (const x of [-4.76, 4.76]) {
        box(x,5,z,0.16,9.7,0.13,C.goldDark);
        box(x,0.16,z,0.48,0.32,0.44,C.silver);
      }
    }
    for (let index = 0; index < 8; index += 1) {
      const x = -4.35 + index * 1.24;
      box(x,5,-44.76,0.15,9.7,0.13,C.goldDark);
      box(x,0.16,-44.76,0.48,0.32,0.44,C.silver);
    }
    for (const x of [-4.45,-2.2,0,2.2,4.45]) {
      tube([x,0,-14.72],[x,10,-14.72],0.09,C.gold,9);
      tube([x,0,-14.72],[x,0.3,-14.72],0.25,C.bronze,9);
    }
    for (const x of [-4.2,-1.4,1.4,4.2]) {
      tube([x,0,-34.86],[x,10,-34.86],0.09,C.gold,9);
      tube([x,0,-34.86],[x,0.3,-34.86],0.25,C.silver,9);
    }

    for (const x of [-4.7, 4.7]) {
      for (const y of [2.1,3.8,5.0,6.2,7.9]) {
        tube([x,y,-15.2],[x,y,-44.7],0.055,C.goldDark,8);
      }
    }

    addHotspot("coverings", [5.1, 6.7, -21], 3.5);
    addHotspot("entrance", [0, 4.4, -14.8], 3.0);
    addHotspot("frames", [4.65, 3.6, -20.5], 2.6);
  }

  function buildTable() {
    const x = 3.0;
    const z = -24.2;
    box(x,1.41,z,1,0.18,2,C.gold);
    box(x,1.55,z,1.08,0.10,2.08,C.goldDark);
    for (const dx of [-0.37,0.37]) {
      for (const dz of [-0.84,0.84]) {
        box(x + dx,0.70,z + dz,0.12,1.4,0.12,C.gold);
      }
    }
    for (const side of [-1,1]) {
      tube([x + side * 0.66,0.55,z - 1.38],[x + side * 0.66,0.55,z + 1.38],0.055,C.goldDark,8);
      for (const dz of [-0.78,0.78]) {
        tube([x + side * 0.48,0.52,z + dz],[x + side * 0.70,0.52,z + dz],0.11,C.gold,8);
      }
    }
    for (let row = 0; row < 2; row += 1) {
      for (let index = 0; index < 6; index += 1) {
        const loafZ = z - 0.72 + index * 0.29;
        tube(
          [x - 0.22 + row * 0.44,1.58,loafZ - 0.08],
          [x - 0.22 + row * 0.44,1.58,loafZ + 0.08],
          0.10,
          C.bread,
          8,
          0.10
        );
      }
    }
    addCollider(x, z, 1.5, 2.5);
    addHotspot("table", [x, 1.3, z], 2.0);
  }

  function buildMenorah() {
    const originX = -3.0;
    const z = -24.2;
    tube([originX,0,z],[originX,0.18,z],0.48,C.goldDark,14,0.34);
    tube([originX,0.16,z],[originX,0.35,z],0.30,C.gold,12,0.18);
    tube([originX,0.3,z],[originX,2.85,z],0.085,C.gold,10);

    const lampPositions = [[originX,2.85,z]];
    for (let branch = 1; branch <= 3; branch += 1) {
      const sideReach = 0.38 + branch * 0.31;
      const joinY = 0.72 + branch * 0.45;
      const topY = 2.5 + branch * 0.12;
      for (const sign of [-1,1]) {
        const start = [originX,joinY,z];
        const elbow = [originX + sign * sideReach * 0.72, joinY + 0.62, z];
        const end = [originX + sign * sideReach, topY, z];
        tube(start, elbow,0.06,C.gold,9);
        tube(elbow,end,0.06,C.gold,9);
        lampPositions.push(end);
      }
    }
    for (const lamp of lampPositions) {
      tube([lamp[0],lamp[1] - 0.03,z],[lamp[0],lamp[1] + 0.12,z],0.15,C.gold,10,0.10);
      addParticle("lamp", [lamp[0],lamp[1] + 0.20,z], [1.0,0.64,0.13,0.88], 22, random() * 6);
    }
    addCollider(originX, z, 2.8, 1.2);
    addHotspot("menorah", [originX, 1.7, z], 2.1);
  }

  function buildIncenseAltar() {
    const z = -32.25;
    box(0,1,z,1,2,1,C.gold);
    box(0,2.02,z,1.08,0.08,1.08,C.goldDark);
    for (const x of [-0.43,0.43]) {
      for (const zz of [z - 0.43,z + 0.43]) {
        tube([x,1.96,zz],[x,2.31,zz],0.09,C.gold,8,0.035);
      }
    }
    for (const x of [-0.67,0.67]) {
      tube([x,0.82,z - 1.1],[x,0.82,z + 1.1],0.04,C.goldDark,8);
    }
    for (let index = 0; index < 18; index += 1) {
      addParticle(
        "incense",
        [(random() - 0.5) * 0.28,2.08 + random() * 0.2,z + (random() - 0.5) * 0.28],
        [0.72,0.67,0.61,0.16],
        20 + random() * 16,
        random() * Math.PI * 2
      );
    }
    addCollider(0, z, 1.4, 1.4);
    addHotspot("incense", [0,1.4,z], 1.8);
  }

  function buildVeil() {
    const palette = [C.blue,C.blue,C.purple,C.linen,C.scarlet,C.scarlet,C.purple,C.linen];
    curtain(-5,-34.75,-0.78,-34.75,0.12,9.7,palette,16,0.09);
    curtain(0.78,-34.75,5,-34.75,0.12,9.7,palette,16,0.09);

    for (const side of [-1,1]) {
      const offset = side * 2.65;
      const z = -34.62;
      const color = [0.72,0.55,0.23,0.18];
      triangle([offset - 0.65,5.2,z],[offset,6.1,z],[offset - 0.1,4.4,z],color);
      triangle([offset + 0.65,5.2,z],[offset,6.1,z],[offset + 0.1,4.4,z],color);
      tube([offset,4.25,z],[offset,5.55,z],0.075,color,8,0.05);
    }

    addCollider(-2.9,-34.75,4.2,0.30);
    addCollider(2.9,-34.75,4.2,0.30);
    addHotspot("veil", [0,4.5,-34.68], 3.0);
  }

  function buildArk() {
    const z = -40.45;
    box(0,0.75,z,1.5,1.5,2.5,C.gold);
    box(0,1.53,z,1.62,0.10,2.62,C.goldDark);
    box(0,1.63,z,1.5,0.10,2.5,C.gold);

    for (const x of [-0.95,0.95]) {
      tube([x,0.58,z - 1.85],[x,0.58,z + 1.85],0.055,C.goldDark,8);
      for (const zz of [z - 0.87,z + 0.87]) {
        tube([x > 0 ? 0.72 : -0.72,0.58,zz],[x,0.58,zz],0.12,C.gold,8);
      }
    }

    const cherubColor = [0.93,0.70,0.27,0.38];
    for (const sign of [-1,1]) {
      const cz = z + sign * 0.58;
      tube([0,1.63,cz],[0,2.02,cz],0.10,cherubColor,8,0.075);
      tube([0,2.00,cz],[0,2.18,cz - sign * 0.05],0.11,cherubColor,8,0.09);
      triangle([0,1.94,cz],[0.68,2.62,cz - sign * 0.30],[0.13,2.16,cz - sign * 0.55],cherubColor);
      triangle([0,1.94,cz],[-0.68,2.62,cz - sign * 0.30],[-0.13,2.16,cz - sign * 0.55],cherubColor);
      triangle([0.13,2.16,cz - sign * 0.55],[0.68,2.62,cz - sign * 0.30],[0,2.32,z],cherubColor);
      triangle([-0.13,2.16,cz - sign * 0.55],[-0.68,2.62,cz - sign * 0.30],[0,2.32,z],cherubColor);
    }

    addCollider(0, z, 2.2, 3.1);
    addHotspot("ark", [0,1.5,z], 2.4);

    for (let index = 0; index < 24; index += 1) {
      addParticle(
        "glory",
        [(random() - 0.5) * 3.7,0.8 + random() * 4.5,z + (random() - 0.5) * 4.0],
        [1.0,0.79,0.31,0.15 + random() * 0.18],
        12 + random() * 20,
        random() * Math.PI * 2
      );
    }
  }

  function buildCloud() {
    for (let index = 0; index < 54; index += 1) {
      addParticle(
        "cloud",
        [(random() - 0.5) * 15,11.5 + random() * 4.8,-30 + (random() - 0.5) * 31],
        [0.90,0.88,0.80,0.10 + random() * 0.16],
        100 + random() * 150,
        random() * Math.PI * 2
      );
    }
    addHotspot("presence", [0,11.8,-19], 4.2);
  }

  buildLandscape();
  buildCourt();
  buildBronzeAltar();
  buildLaver();
  buildTent();
  buildTable();
  buildMenorah();
  buildIncenseAltar();
  buildVeil();
  buildArk();
  buildCloud();

  const meshVertexShader = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec4 aColor;
    uniform mat4 uProjection;
    uniform mat4 uView;
    varying vec3 vNormal;
    varying vec4 vColor;
    varying float vDepth;
    void main() {
      vec4 viewPosition = uView * vec4(aPosition, 1.0);
      gl_Position = uProjection * viewPosition;
      vNormal = aNormal;
      vColor = aColor;
      vDepth = -viewPosition.z;
    }
  `;

  const meshFragmentShader = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec4 vColor;
    varying float vDepth;
    uniform vec3 uSun;
    uniform vec3 uFogColor;
    uniform float uFogNear;
    uniform float uFogFar;
    uniform float uAmbient;
    void main() {
      vec3 normal = normalize(vNormal);
      float direct = max(0.0, dot(normal, normalize(uSun)));
      float upward = normal.y * 0.5 + 0.5;
      float light = uAmbient + direct * 0.48 + upward * 0.10 + vColor.a;
      vec3 color = vColor.rgb * light;
      float fog = smoothstep(uFogNear, uFogFar, vDepth);
      gl_FragColor = vec4(mix(color, uFogColor, fog), 1.0);
    }
  `;

  const particleVertexShader = `
    attribute vec3 aPosition;
    attribute vec4 aColor;
    attribute float aSize;
    uniform mat4 uProjection;
    uniform mat4 uView;
    varying vec4 vColor;
    void main() {
      vec4 viewPosition = uView * vec4(aPosition, 1.0);
      gl_Position = uProjection * viewPosition;
      gl_PointSize = clamp(aSize * (34.0 / max(2.0, -viewPosition.z)), 1.0, 96.0);
      vColor = aColor;
    }
  `;

  const particleFragmentShader = `
    precision mediump float;
    varying vec4 vColor;
    void main() {
      vec2 point = gl_PointCoord - vec2(0.5);
      float distanceFromCenter = length(point);
      if (distanceFromCenter > 0.5) discard;
      float alpha = smoothstep(0.5, 0.05, distanceFromCenter) * vColor.a;
      gl_FragColor = vec4(vColor.rgb, alpha);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed.");
    }
    return shader;
  }

  function createProgram(vertexSource, fragmentSource) {
    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Shader linking failed.");
    }
    return program;
  }

  const meshProgram = createProgram(meshVertexShader, meshFragmentShader);
  const particleProgram = createProgram(particleVertexShader, particleFragmentShader);

  function createBuffer(data, usage = gl.STATIC_DRAW) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage);
    return buffer;
  }

  const meshBuffers = {
    position: createBuffer(geometry.positions),
    normal: createBuffer(geometry.normals),
    color: createBuffer(geometry.colors)
  };
  const particleBuffers = {
    position: gl.createBuffer(),
    color: gl.createBuffer(),
    size: gl.createBuffer()
  };

  function attribute(program, name, buffer, size) {
    const location = gl.getAttribLocation(program, name);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  const projection = new Float32Array(16);
  const view = new Float32Array(16);
  const FIELD_OF_VIEW = Math.PI * 0.43;

  function perspective(out, fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    out.fill(0);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
  }

  function lookAt(out, eye, target, up) {
    const backward = normalize(subtract(eye, target));
    const right = normalize(cross(up, backward));
    const cameraUp = cross(backward, right);
    out[0] = right[0];
    out[1] = cameraUp[0];
    out[2] = backward[0];
    out[3] = 0;
    out[4] = right[1];
    out[5] = cameraUp[1];
    out[6] = backward[1];
    out[7] = 0;
    out[8] = right[2];
    out[9] = cameraUp[2];
    out[10] = backward[2];
    out[11] = 0;
    out[12] = -dot(right, eye);
    out[13] = -dot(cameraUp, eye);
    out[14] = -dot(backward, eye);
    out[15] = 1;
  }

  const camera = {
    x: 0,
    y: 1.65,
    z: 58,
    yaw: 0,
    pitch: -0.035,
    radius: 0.42,
    bob: 0
  };
  const keys = new Set();
  let entered = false;
  let activeHotspot = null;
  let previousTime = performance.now();
  let dragging = null;

  function cameraForward(includePitch = true) {
    const cp = includePitch ? Math.cos(camera.pitch) : 1;
    return [
      Math.sin(camera.yaw) * cp,
      includePitch ? Math.sin(camera.pitch) : 0,
      -Math.cos(camera.yaw) * cp
    ];
  }

  function cameraRight() {
    return [Math.cos(camera.yaw), 0, Math.sin(camera.yaw)];
  }

  function blocked(x, z) {
    if (Math.abs(x) > 92 || Math.abs(z) > 92) return true;
    for (const collider of colliders) {
      const closestX = Math.max(collider.minX, Math.min(x, collider.maxX));
      const closestZ = Math.max(collider.minZ, Math.min(z, collider.maxZ));
      const dx = x - closestX;
      const dz = z - closestZ;
      if (dx * dx + dz * dz < camera.radius * camera.radius) return true;
    }
    return false;
  }

  function moveCamera(delta) {
    if (!entered || !ui.info.hidden) return;
    let forwardAmount = 0;
    let sideAmount = 0;
    if (keys.has("ArrowUp") || keys.has("KeyW")) forwardAmount += 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) forwardAmount -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) sideAmount += 1;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) sideAmount -= 1;
    if (!forwardAmount && !sideAmount) {
      camera.bob *= Math.pow(0.001, delta);
      return;
    }
    const magnitude = Math.hypot(forwardAmount, sideAmount);
    forwardAmount /= magnitude;
    sideAmount /= magnitude;
    const forward = cameraForward(false);
    const right = cameraRight();
    const speed = (keys.has("ShiftLeft") || keys.has("ShiftRight") ? 6.1 : 4.2) * delta;
    const dx = (forward[0] * forwardAmount + right[0] * sideAmount) * speed;
    const dz = (forward[2] * forwardAmount + right[2] * sideAmount) * speed;

    if (!blocked(camera.x + dx, camera.z)) camera.x += dx;
    if (!blocked(camera.x, camera.z + dz)) camera.z += dz;
    camera.bob += delta * 8.5;
  }

  function raycast(origin, direction, maxDistance = 7.5) {
    let best = null;
    let bestDistance = maxDistance;
    for (const hotspot of hotspots) {
      const offset = subtract(origin, hotspot.center);
      const b = dot(offset, direction);
      const c = dot(offset, offset) - hotspot.radius * hotspot.radius;
      const discriminant = b * b - c;
      if (discriminant < 0) continue;
      const distance = -b - Math.sqrt(discriminant);
      if (distance > 0.2 && distance < bestDistance) {
        best = hotspot;
        bestDistance = distance;
      }
    }
    return best;
  }

  function clickDirection(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width * 2 - 1;
    const y = 1 - (clientY - rect.top) / rect.height * 2;
    const forward = cameraForward(true);
    const right = normalize(cross(forward, [0,1,0]));
    const up = normalize(cross(right, forward));
    const scale = Math.tan(FIELD_OF_VIEW / 2);
    return normalize([
      forward[0] + right[0] * x * scale * rect.width / rect.height + up[0] * y * scale,
      forward[1] + right[1] * x * scale * rect.width / rect.height + up[1] * y * scale,
      forward[2] + right[2] * x * scale * rect.width / rect.height + up[2] * y * scale
    ]);
  }

  function updateTarget() {
    activeHotspot = raycast([camera.x,camera.y,camera.z], cameraForward(true));
    ui.targetPrompt.hidden = !activeHotspot || !ui.info.hidden || !entered;
    document.body.classList.toggle("has-target", Boolean(activeHotspot && ui.info.hidden && entered));
    if (activeHotspot) ui.targetName.textContent = activeHotspot.data.title;
  }

  function updateOrientation() {
    let location = "Beyond the eastern gate";
    if (Math.abs(camera.x) < 25 && camera.z <= 50 && camera.z >= -50) {
      if (Math.abs(camera.x) < 5.2 && camera.z < -15 && camera.z > -45.5) {
        location = camera.z > -35 ? "Holy Place" : "Holy of Holies";
      } else {
        location = "Outer court";
      }
    }
    ui.location.textContent = location;

    const forward = cameraForward(false);
    if (Math.abs(forward[2]) >= Math.abs(forward[0])) {
      ui.heading.textContent = forward[2] < 0 ? "W" : "E";
    } else {
      ui.heading.textContent = forward[0] > 0 ? "N" : "S";
    }
  }

  function showInfo(data) {
    if (!data) return;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    ui.kicker.textContent = data.kicker;
    ui.title.textContent = data.title;
    ui.body.textContent = data.body;
    ui.measure.textContent = data.measure || "";
    ui.measureRow.hidden = !data.measure;
    ui.source.textContent = data.source;
    ui.note.textContent = data.note || "";
    ui.note.hidden = !data.note;
    ui.info.hidden = false;
    ui.targetPrompt.hidden = true;
    document.body.classList.remove("has-target");
    requestAnimationFrame(() => ui.infoClose.focus());
  }

  function closeInfo() {
    ui.info.hidden = true;
    canvas.focus();
  }

  function inspect(direction) {
    const hotspot = raycast([camera.x,camera.y,camera.z], direction);
    if (hotspot) showInfo(hotspot.data);
    return Boolean(hotspot);
  }

  function enterExperience() {
    entered = true;
    ui.intro.classList.add("is-leaving");
    canvas.focus();
    setTimeout(() => {
      ui.intro.hidden = true;
    }, 650);
    if (canvas.requestPointerLock) {
      const result = canvas.requestPointerLock();
      if (result?.catch) result.catch(() => {});
    }
  }

  ui.enter.addEventListener("click", enterExperience);
  ui.infoClose.addEventListener("click", closeInfo);
  ui.about.addEventListener("click", () => showInfo(EXHIBITS.about));

  window.addEventListener("keydown", (event) => {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === "Escape" && !ui.info.hidden) {
      closeInfo();
      return;
    }
    keys.add(event.code);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  window.addEventListener("blur", () => keys.clear());

  document.addEventListener("mousemove", (event) => {
    if (!entered || !ui.info.hidden) return;
    if (document.pointerLockElement === canvas) {
      camera.yaw += event.movementX * 0.0022;
      camera.pitch = Math.max(-1.15, Math.min(1.12, camera.pitch - event.movementY * 0.0019));
      return;
    }
    if (dragging) {
      const dx = event.clientX - dragging.lastX;
      const dy = event.clientY - dragging.lastY;
      dragging.distance += Math.abs(dx) + Math.abs(dy);
      dragging.lastX = event.clientX;
      dragging.lastY = event.clientY;
      camera.yaw += dx * 0.0045;
      camera.pitch = Math.max(-1.15, Math.min(1.12, camera.pitch - dy * 0.0038));
    }
  });

  canvas.addEventListener("mousedown", (event) => {
    if (!entered || !ui.info.hidden) return;
    if (document.pointerLockElement === canvas) {
      if (event.button === 0) inspect(cameraForward(true));
      return;
    }
    dragging = {
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      distance: 0
    };
  });

  window.addEventListener("mouseup", (event) => {
    if (!dragging) return;
    const click = dragging.distance < 7;
    dragging = null;
    if (!click || !entered || !ui.info.hidden) return;
    const found = inspect(clickDirection(event.clientX, event.clientY));
    if (!found && canvas.requestPointerLock) {
      const result = canvas.requestPointerLock();
      if (result?.catch) result.catch(() => {});
    }
  });

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.65);
    const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    perspective(projection, FIELD_OF_VIEW, canvas.width / canvas.height, 0.08, 150);
  }

  function updateParticles(time) {
    const positions = [];
    const colors = [];
    const sizes = [];
    for (const particle of particles) {
      let [x,y,z] = particle.base;
      if (particle.kind === "dust") {
        x += Math.sin(time * 0.00017 + particle.phase) * 0.55;
        y += Math.sin(time * 0.00031 + particle.phase) * 0.22;
      } else if (particle.kind === "smoke") {
        const rise = (time * 0.00022 + particle.phase) % 1;
        y += rise * 5.0;
        x += Math.sin(rise * 8 + particle.phase) * rise * 0.9;
        z += Math.cos(rise * 7 + particle.phase) * rise * 0.7;
      } else if (particle.kind === "incense") {
        const rise = (time * 0.00013 + particle.phase) % 1;
        y += rise * 4.5;
        x += Math.sin(rise * 11 + particle.phase) * rise * 0.55;
        z += Math.cos(rise * 9 + particle.phase) * rise * 0.45;
      } else if (particle.kind === "flame") {
        y += Math.sin(time * 0.011 + particle.phase) * 0.13;
        x += Math.sin(time * 0.008 + particle.phase) * 0.08;
      } else if (particle.kind === "lamp") {
        y += Math.sin(time * 0.009 + particle.phase) * 0.04;
      } else if (particle.kind === "cloud") {
        x += Math.sin(time * 0.00008 + particle.phase) * 0.9;
        z += Math.cos(time * 0.00007 + particle.phase) * 0.7;
      } else if (particle.kind === "glory") {
        y += Math.sin(time * 0.0008 + particle.phase) * 0.22;
      }
      positions.push(x,y,z);
      colors.push(...particle.color);
      sizes.push(particle.size * (particle.kind === "flame" || particle.kind === "lamp"
        ? 0.82 + Math.sin(time * 0.013 + particle.phase) * 0.18
        : 1));
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffers.size);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.DYNAMIC_DRAW);
  }

  function render(time) {
    resize();
    const delta = Math.min(0.05, Math.max(0, (time - previousTime) / 1000));
    previousTime = time;
    moveCamera(delta);
    updateTarget();
    updateOrientation();

    const moving = keys.has("ArrowUp") || keys.has("ArrowDown") || keys.has("ArrowLeft") ||
      keys.has("ArrowRight") || keys.has("KeyW") || keys.has("KeyA") ||
      keys.has("KeyS") || keys.has("KeyD");
    const bob = moving ? Math.sin(camera.bob) * 0.025 : 0;
    const eye = [camera.x, camera.y + bob, camera.z];
    const forward = cameraForward(true);
    lookAt(view, eye, [eye[0] + forward[0], eye[1] + forward[1], eye[2] + forward[2]], [0,1,0]);

    const insideTent = Math.abs(camera.x) < 5.15 && camera.z < -14.7 && camera.z > -45.4;
    const fogColor = insideTent ? [0.055,0.043,0.032] : [0.55,0.55,0.49];
    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.useProgram(meshProgram);
    attribute(meshProgram, "aPosition", meshBuffers.position, 3);
    attribute(meshProgram, "aNormal", meshBuffers.normal, 3);
    attribute(meshProgram, "aColor", meshBuffers.color, 4);
    gl.uniformMatrix4fv(gl.getUniformLocation(meshProgram, "uProjection"), false, projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(meshProgram, "uView"), false, view);
    gl.uniform3fv(gl.getUniformLocation(meshProgram, "uSun"), insideTent ? [0.1,0.62,0.2] : [-0.42,0.80,0.34]);
    gl.uniform3fv(gl.getUniformLocation(meshProgram, "uFogColor"), fogColor);
    gl.uniform1f(gl.getUniformLocation(meshProgram, "uFogNear"), insideTent ? 12 : 72);
    gl.uniform1f(gl.getUniformLocation(meshProgram, "uFogFar"), insideTent ? 35 : 135);
    gl.uniform1f(gl.getUniformLocation(meshProgram, "uAmbient"), insideTent ? 0.34 : 0.47);
    gl.drawArrays(gl.TRIANGLES, 0, geometry.positions.length / 3);

    updateParticles(time);
    gl.useProgram(particleProgram);
    attribute(particleProgram, "aPosition", particleBuffers.position, 3);
    attribute(particleProgram, "aColor", particleBuffers.color, 4);
    attribute(particleProgram, "aSize", particleBuffers.size, 1);
    gl.uniformMatrix4fv(gl.getUniformLocation(particleProgram, "uProjection"), false, projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(particleProgram, "uView"), false, view);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.drawArrays(gl.POINTS, 0, particles.length);
    gl.depthMask(true);
    gl.disable(gl.BLEND);

    requestAnimationFrame(render);
  }

  resize();
  requestAnimationFrame(render);
})();
