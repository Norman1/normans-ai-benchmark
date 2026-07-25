/* content.js — what each thing is, and what it was for.
 *
 * House rule for every entry below: if scripture gives a number, the number is
 * here and the verse is beside it. If scripture is silent, the entry says so
 * out loud rather than quietly filling the gap. The silences are as
 * interesting as the measurements — the laver has no size, the lampstand no
 * height, the cherubim no shape.
 */
(function (global) {
  "use strict";
  const TB = global.TB || (global.TB = {});

  TB.content = {
    courtGate: {
      title: "The Gate of the Court",
      hebrew: "sha'ar he-chatzer",
      reference: "Exodus 27:16; 38:18",
      body: [
        "One screen, twenty cubits wide, of blue and purple and scarlet yarn worked into fine twined linen, hung on four pillars. It is the only way in.",
        "The hangings all round the court are plain undyed linen. Only here is there colour, and only here is there a door — on the east side, facing the sunrise. Any Israelite could come through it; the court was public ground, and the crowd stood here while the priests worked. But there was one gate and no other."
      ],
      facts: [
        "Twenty cubits wide — Exodus 27:16",
        "Four pillars, four sockets",
        "Blue, purple, scarlet and fine twined linen"
      ]
    },

    court: {
      title: "The Outer Court",
      hebrew: "he-chatzer",
      reference: "Exodus 27:9–19; 38:9–20",
      body: [
        "A hundred cubits long and fifty broad, enclosed by hangings of fine twined linen five cubits high on sixty pillars. The pillars stand in sockets of bronze; their hooks and the rods that join them along the top are silver.",
        "Five cubits is well above head height, so from outside the camp you saw the coverings of the tent and nothing else. Everything the ordinary worshipper ever saw of the tabernacle happened in this rectangle: he brought his animal to the gate, laid a hand on its head, and it was killed at the altar. He went no further."
      ],
      facts: [
        "100 × 50 cubits, hangings 5 cubits high — Exodus 27:18",
        "60 pillars at five-cubit intervals round a 300-cubit perimeter",
        "Bronze sockets, silver hooks and fillets, bronze pins and cords"
      ]
    },

    bronzeAltar: {
      title: "The Bronze Altar",
      hebrew: "mizbe'ach ha-olah — the altar of burnt offering",
      reference: "Exodus 27:1–8; 38:1–7; Leviticus 6:13",
      body: [
        "Five cubits square and three cubits high, hollow, built of acacia boards and plated in bronze, with a horn worked into each of the four corners as one piece with it. A grate of bronze network sits inside, halfway up, and the fire and the offering rested on that.",
        "Every animal offering was killed and burned here. Nothing went further in until blood had been shed at this altar, and the fire on it was never to go out.",
        "Notice what is missing: there are no steps. An earlier command had already forbidden them, so the altar was reached by a ramp or not at all."
      ],
      facts: [
        "5 × 5 × 3 cubits — Exodus 27:1",
        "Four horns, of one piece with the altar — Exodus 27:2",
        "Bronze grate at mid-height — Exodus 27:4–5",
        "No steps — Exodus 20:26"
      ]
    },

    laver: {
      title: "The Laver",
      hebrew: "kiyor",
      reference: "Exodus 30:17–21; 38:8",
      body: [
        "A bronze basin on a bronze foot, standing between the altar and the door of the tent, and kept filled with water. Aaron and his sons washed their hands and their feet here before they went in to serve, or came near the altar — and the command adds, so that they do not die.",
        "It was cast from the polished bronze mirrors of the women who served at the entrance of the tent. That is all we are told about how it was made.",
        "This is the one furnishing whose measurements scripture withholds entirely. Every other article in the tabernacle is given in cubits; the laver is given only a material and a purpose."
      ],
      facts: [
        "No dimensions given anywhere in scripture",
        "Bronze, from the mirrors of the serving women — Exodus 38:8",
        "Set between the tent and the altar — Exodus 30:18"
      ],
      note: "The size and shape you are looking at are a reconstruction. Only the material and the position are given."
    },

    doorScreen: {
      title: "The Door of the Tent",
      hebrew: "masach petach ha-ohel",
      reference: "Exodus 26:36–37; 36:37–38",
      body: [
        "A screen of blue, purple and scarlet on fine twined linen closes the east end of the tent, hung on five pillars of acacia overlaid with gold, standing in five sockets of bronze.",
        "Past this point only the priests went. Watch the metal as you move inward: bronze in the court, bronze at the sockets of this door, silver under the boards and under the veil's pillars, gold on everything in the two rooms beyond. The nearer the ark, the more precious the material — and the fewer the people allowed to see it."
      ],
      facts: [
        "Five pillars overlaid with gold, five sockets of bronze — Exodus 26:37",
        "Blue, purple, scarlet and fine twined linen"
      ]
    },

    boards: {
      title: "The Boards and the Sockets",
      hebrew: "kerashim wa-adanim",
      reference: "Exodus 26:15–30; 36:20–34; 38:27",
      body: [
        "The walls are forty-eight standing boards of acacia overlaid with gold, each ten cubits tall and a cubit and a half broad: twenty on the south, twenty on the north, and eight closing the west end — six across the back and one doubled into each corner.",
        "Every board rests on two sockets of silver. Ninety-six under the boards and four under the pillars of the veil make one hundred sockets, cast from one hundred talents of silver, a talent to a socket. That silver was the census money, half a shekel from every man numbered in Israel: the whole nation is literally the foundation this building stands on.",
        "Five bars of gold-plated acacia hold each wall together, the middle bar running the entire length from end to end. They lie on the outside, under the coverings, where you cannot see them from in here."
      ],
      facts: [
        "48 boards, each 10 × 1.5 cubits — Exodus 26:16",
        "100 silver sockets, one talent each — Exodus 38:27",
        "Five bars to a wall, the middle one end to end — Exodus 26:28"
      ],
      note: "Scripture never gives the boards a thickness. Half a cubit is used here because it is the value that closes the rear wall: six boards of a cubit and a half, plus half a cubit from each corner board, gives exactly the ten-cubit width."
    },

    coverings: {
      title: "The Four Coverings",
      hebrew: "yeri'ot ha-mishkan",
      reference: "Exodus 26:1–14; 36:8–19",
      body: [
        "Four layers lie over this frame. Innermost — the ceiling above your head — are ten curtains of fine twined linen in blue, purple and scarlet, with cherubim worked into them, each twenty-eight cubits by four, joined in two sets of five by fifty loops and fifty clasps of gold. Over them go eleven curtains of goats' hair, each thirty by four, with fifty clasps of bronze. Then rams' skins dyed red. Then a covering of tachash skin.",
        "The measurements decide the shape of the roof, and they only close if it is flat. Twenty-eight cubits reaches across the ten-cubit width and hangs nine cubits down each side — leaving the lowest cubit of gold board and the silver sockets showing. The goats' hair is two cubits longer each way and covers what the linen leaves bare, which is exactly the reason Exodus gives for the extra cubit.",
        "The seam where the two sets of five linen curtains couple falls directly overhead, at the line of the gold clasps. The veil hangs under those clasps. That is how we know where the inner room begins."
      ],
      facts: [
        "10 linen curtains, 28 × 4 cubits, 50 gold clasps — Exodus 26:1–6",
        "11 goats'-hair curtains, 30 × 4 cubits, 50 bronze clasps — Exodus 26:7–11",
        "Rams' skins dyed red, and tachash skin above — Exodus 26:14"
      ],
      note: "Scripture never describes the roof's form. A flat roof is used here because it is the only shape in which all the curtain measurements land exactly where Exodus says they land. The animal behind the word tachash is unknown."
    },

    menorah: {
      title: "The Lampstand",
      hebrew: "menorah",
      reference: "Exodus 25:31–40; 37:17–24; Leviticus 24:1–4",
      body: [
        "One talent of pure gold, beaten out of a single piece — not cast, not assembled from parts. A central shaft with three branches curving out on each side, seven lamps in all. Each branch carries three cups shaped like almond blossoms with their buds and their flowers; the shaft carries four more of its own, and a knop under each pair of branches where they leave it.",
        "It stands on the south side, opposite the table. There are no windows in this room and no other lamp: what you can see in here, you are seeing by this. The lamps were tended morning and evening and kept burning from evening until morning, continually.",
        "Moses was shown a pattern on the mountain and told to make it after that pattern. The description that follows is unusually detailed about ornament and completely silent about size."
      ],
      facts: [
        "Pure gold, one beaten talent — Exodus 25:31, 39",
        "Seven lamps, six branches — Exodus 25:32, 37",
        "Three almond-blossom cups per branch, four on the shaft — Exodus 25:33–34",
        "No height or width given anywhere in scripture"
      ],
      note: "The height here is three cubits, following the rabbinic tradition of eighteen handbreadths. Scripture gives no dimension for the lampstand at all."
    },

    table: {
      title: "The Table of Showbread",
      hebrew: "shulchan lechem ha-panim — the table of the bread of the Presence",
      reference: "Exodus 25:23–30; 37:10–16; Leviticus 24:5–9",
      body: [
        "Two cubits long, one cubit broad and a cubit and a half high: acacia overlaid with pure gold, with a crown of gold round the top, a border a handbreadth wide beneath it, and a second gold crown on the border. Four rings at the corners carry the staves.",
        "It stands on the north side, opposite the lampstand. Twelve loaves lie on it in two rows of six, one for each tribe, with frankincense set beside them. Fresh bread was laid out every sabbath and the loaves it replaced were eaten by the priests, in a holy place, because they were most holy.",
        "The table was never to be empty. The bread is called the bread of the Presence, and it was to be before God continually."
      ],
      facts: [
        "2 × 1 × 1.5 cubits — Exodus 25:23",
        "Border of a handbreadth, two gold crowns — Exodus 25:25",
        "Twelve loaves in two rows of six — Leviticus 24:5–6"
      ]
    },

    incenseAltar: {
      title: "The Altar of Incense",
      hebrew: "mizbach ha-ketoret",
      reference: "Exodus 30:1–10; 37:25–28",
      body: [
        "A cubit long, a cubit broad, and two cubits high, with four horns and a crown of gold — the smallest article in the tabernacle and the one standing closest to the veil.",
        "Aaron burned a fragrant incense on it every morning when he tended the lamps, and again between the evenings when he lit them: a perpetual incense before the LORD throughout your generations. No other incense was permitted on it, and no burnt offering, no grain offering and no drink offering.",
        "Once a year, on the Day of Atonement, its horns were smeared with the blood of the sin offering. That is the only blood this altar ever saw."
      ],
      facts: [
        "1 × 1 × 2 cubits — Exodus 30:2",
        "Four horns, a crown of gold, two rings and staves",
        "Incense morning and evening; blood on the horns once a year — Exodus 30:7–10"
      ]
    },

    veil: {
      title: "The Veil",
      hebrew: "parochet",
      reference: "Exodus 26:31–35; 36:35–36; Leviticus 16",
      body: [
        "Blue, purple and scarlet on fine twined linen, with cherubim worked into it, hung by hooks of gold on four pillars of acacia overlaid with gold, standing in four sockets of silver. It divides the Holy Place from the Most Holy.",
        "It hangs under the clasps — the line where the two sets of five linen curtains are coupled overhead. That single instruction is what fixes the inner room at ten cubits and makes it a cube.",
        "Behind it the high priest went once a year, on the Day of Atonement, and not without blood, and not without a cloud of incense. The cherubim woven into it are the same figures set to guard the way back into Eden."
      ],
      facts: [
        "Four pillars overlaid with gold, four sockets of silver — Exodus 26:32",
        "Hung under the clasps — Exodus 26:33",
        "Entered once a year, by one man — Leviticus 16:2, 34"
      ],
      note: "The veil is given no measurements; it spans the ten-cubit width and the ten-cubit height of the frame it hangs in."
    },

    holyOfHolies: {
      title: "The Most Holy Place",
      hebrew: "kodesh ha-kodashim",
      reference: "Exodus 26:33–34; Leviticus 16:2; 1 Kings 6:20",
      body: [
        "A perfect cube: ten cubits long, ten broad and ten high, at the west end of the tent. There is no lamp in this room, no window, and no furniture except one thing.",
        "Exodus never states its size directly. You get it by subtraction — thirty cubits of frame, the veil hanging under the clasps at twenty cubits from the door — and Solomon's temple later confirms the shape by making its own inner room a cube of twenty cubits.",
        "The LORD said he would appear in the cloud above the mercy seat, and that Aaron was not to come in at any time he chose, lest he die."
      ],
      facts: [
        "10 × 10 × 10 cubits, derived from Exodus 26:33",
        "No light source",
        "Entered once a year — Leviticus 16"
      ],
      note: "Rendered honestly this room is completely black. There is a faint glow here at the mercy seat so that the ark can be seen at all — a concession to you, not a claim about the architecture."
    },

    ark: {
      title: "The Ark of the Covenant",
      hebrew: "aron ha-brit",
      reference: "Exodus 25:10–16; 37:1–5; Hebrews 9:4",
      body: [
        "Two cubits and a half long, a cubit and a half broad, a cubit and a half high: acacia overlaid with pure gold within and without, with a crown of gold round about it.",
        "Four rings of gold hold two staves of gold-plated acacia, and the command about them is unusual — they were never to be taken out of the rings. This is a thing that stays ready to travel.",
        "Inside went the testimony: the two tablets of stone. Hebrews adds the golden jar of manna and Aaron's rod that budded."
      ],
      facts: [
        "2.5 × 1.5 × 1.5 cubits — Exodus 25:10",
        "Overlaid with pure gold within and without — Exodus 25:11",
        "The staves were never to be removed — Exodus 25:15"
      ],
      note: "The staves are shown running east and west, following the note in 1 Kings 8:8 that their ends could be seen from the room in front. Exodus itself does not settle the orientation."
    },

    mercySeat: {
      title: "The Mercy Seat and the Cherubim",
      hebrew: "kapporet",
      reference: "Exodus 25:17–22; 37:6–9; Leviticus 16:14–15",
      body: [
        "The lid is a separate article, not a part of the chest: pure gold, two cubits and a half by a cubit and a half, with two cherubim of beaten gold rising from its two ends — of one piece with the lid itself.",
        "Their wings are stretched upward and forward, covering the lid, and their faces are turned toward one another and downward toward it. On the Day of Atonement blood was sprinkled on this lid and before it, seven times.",
        "This is the place God named for meeting: there I will meet with thee, and I will commune with thee from above the mercy seat, from between the two cherubim."
      ],
      facts: [
        "2.5 × 1.5 cubits — Exodus 25:17",
        "Two cherubim, of beaten gold, of one piece with the lid — Exodus 25:18–19",
        "No thickness, size or form given"
      ],
      note: "The lid's thickness and the shape of the cherubim are both reconstructions. Scripture describes wings, faces and their direction, and stops there — so the figures here are kept deliberately plain."
    }
  };

  /** Room names for the position readout. */
  TB.zones = {
    outside: "Outside the camp",
    court: "The Outer Court",
    holy: "The Holy Place",
    mostHoly: "The Most Holy Place"
  };
})(window);
