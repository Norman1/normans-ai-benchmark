// Every movement in Acts, as the book gives it.
//
// This is the single source of truth for the routes: the build tool turns each
// leg into geometry, and the page reads the result. Two fields carry the weight.
//
// `mode`     "sea" or "land". Acts is unusually good about saying which, and
//            where it does not, the leg says so rather than quietly picking.
//
// `evidence` "stated"       the stop and the mode are both in the text
//            "implied"      the stop is named, the mode is not
//            "reconstructed" the leg fills a gap the text leaves open
//
// A leg may also be "attempted" — a direction taken and abandoned. Acts has two
// of those and they are among the most interesting lines on the map.

export const LEGS = [
  // --- Philip, and the scattering out of Jerusalem (Acts 8) --------------
  { id: "philip-samaria", from: "Jerusalem", to: "Samaria", mode: "land", evidence: "stated",
    note: "Philip goes down into Samaria — the first time the message is carried outside Judaea on purpose." },
  { id: "philip-gaza-road", from: "Jerusalem", to: "Gaza", mode: "land", evidence: "stated",
    note: "The desert road down to Gaza. Acts is specific that this is the southern route, and empty." },
  { id: "philip-coast", from: "Azotus", to: "Caesarea", mode: "land", evidence: "stated",
    note: "Philip works his way north through every town on the coastal plain." },

  // --- Saul (Acts 9) -----------------------------------------------------
  { id: "saul-to-damascus", from: "Jerusalem", to: "Damascus", mode: "land", evidence: "stated",
    note: "Roughly a week on the road, with warrants in hand." },
  { id: "saul-to-jerusalem", from: "Damascus", to: "Jerusalem", mode: "land", evidence: "stated",
    note: "The return, after the escape over the wall." },
  { id: "saul-to-caesarea", from: "Jerusalem", to: "Caesarea", mode: "land", evidence: "stated",
    note: "The believers move him out of Jerusalem when a plot forms." },
  { id: "saul-to-tarsus", from: "Caesarea", to: "Tarsus", mode: "sea", evidence: "implied",
    note: "Acts says they sent him to Tarsus from Caesarea and says no more. Caesarea is a harbour, so a ship is the natural reading — but the book does not say it." },

  // --- Peter on the coastal plain (Acts 9-11) ----------------------------
  { id: "peter-lydda", from: "Jerusalem", to: "Lydda", mode: "land", evidence: "implied",
    note: "Acts has Peter travelling the whole district; Lydda is where it stops to tell a story." },
  { id: "peter-joppa", from: "Lydda", to: "Joppa", mode: "land", evidence: "stated",
    note: "Two men fetch him from Joppa, about a morning's walk away." },
  { id: "peter-caesarea", from: "Joppa", to: "Caesarea", mode: "land", evidence: "stated",
    note: "A day and a half up the coast, with six witnesses brought along." },
  { id: "peter-back", from: "Caesarea", to: "Jerusalem", mode: "land", evidence: "implied",
    note: "He goes up to answer for it." },

  // --- The word reaches Antioch (Acts 11) --------------------------------
  { id: "scatter-phoenicia", from: "Jerusalem", to: "Tyre", mode: "land", evidence: "reconstructed",
    note: "Acts names no route, only the reach: refugees from the persecution got as far as Phoenicia." },
  { id: "scatter-cyprus", from: "Tyre", to: "Salamis", mode: "sea", evidence: "reconstructed",
    note: "Cyprus is named as one of the places they reached. The crossing is the obvious way there; the book does not describe it." },
  { id: "scatter-antioch", from: "Tyre", to: "Antioch", mode: "land", evidence: "reconstructed",
    note: "Antioch is the third place named. The coast road is the natural approach." },
  { id: "barnabas-to-tarsus", from: "Antioch", to: "Tarsus", mode: "land", evidence: "implied",
    note: "Barnabas goes looking for Saul, who has been at home for years." },
  { id: "barnabas-back", from: "Tarsus", to: "Antioch", mode: "land", evidence: "implied",
    note: "They come back together and spend a year teaching." },
  { id: "famine-relief", from: "Antioch", to: "Jerusalem", mode: "land", evidence: "implied",
    note: "Money collected in Antioch, carried down to Judaea for the famine." },

  // --- First journey (Acts 13-14) ---------------------------------------
  { id: "j1-seleucia", from: "Antioch", to: "Seleucia", mode: "land", evidence: "stated",
    note: "Antioch's port, a day down the Orontes." },
  { id: "j1-salamis", from: "Seleucia", to: "Salamis", mode: "sea", evidence: "stated" },
  { id: "j1-across-cyprus", from: "Salamis", to: "Paphos", mode: "land", evidence: "stated",
    note: "Acts says they went through the whole island — so this is a march across Cyprus, not a coastal hop." },
  { id: "j1-perga", from: "Paphos", to: "Perga", mode: "sea", evidence: "stated",
    note: "Where John Mark turns round and goes home." },
  { id: "j1-pisidian-antioch", from: "Perga", to: "Pisidian Antioch", mode: "land", evidence: "stated",
    note: "Up out of the malarial coast onto the plateau — a climb of well over a kilometre through bandit country." },
  { id: "j1-iconium", from: "Pisidian Antioch", to: "Iconium", mode: "land", evidence: "stated" },
  { id: "j1-lystra", from: "Iconium", to: "Lystra", mode: "land", evidence: "stated" },
  { id: "j1-derbe", from: "Lystra", to: "Derbe", mode: "land", evidence: "stated" },
  { id: "j1-back-lystra", from: "Derbe", to: "Lystra", mode: "land", evidence: "stated",
    note: "They turn round and walk back through every town that threw them out." },
  { id: "j1-back-iconium", from: "Lystra", to: "Iconium", mode: "land", evidence: "stated" },
  { id: "j1-back-antioch", from: "Iconium", to: "Pisidian Antioch", mode: "land", evidence: "stated" },
  { id: "j1-back-perga", from: "Pisidian Antioch", to: "Perga", mode: "land", evidence: "stated" },
  { id: "j1-attalia", from: "Perga", to: "Attalia", mode: "land", evidence: "stated" },
  { id: "j1-home", from: "Attalia", to: "Antioch", mode: "sea", evidence: "stated",
    note: "Home, to report." },

  // --- The council (Acts 15) --------------------------------------------
  { id: "council-up", from: "Antioch", to: "Jerusalem", mode: "land", evidence: "stated",
    note: "Deliberately overland through Phoenicia and Samaria, telling the story of the Gentiles as they go." },
  { id: "council-down", from: "Jerusalem", to: "Antioch", mode: "land", evidence: "implied",
    note: "Back with a letter and two men to vouch for it." },
  { id: "mark-to-cyprus", from: "Antioch", to: "Salamis", mode: "sea", evidence: "implied",
    note: "Barnabas takes Mark and sails for Cyprus. Acts follows Paul from here and never says what came of them." },

  // --- Second journey (Acts 15-18) --------------------------------------
  { id: "j2-cilicia", from: "Antioch", to: "Tarsus", mode: "land", evidence: "stated",
    note: "Overland this time, through Syria and Cilicia." },
  { id: "j2-derbe", from: "Tarsus", to: "Derbe", mode: "land", evidence: "implied",
    note: "Through the Cilician Gates, a cleft in the Taurus barely wide enough for a cart." },
  { id: "j2-lystra", from: "Derbe", to: "Lystra", mode: "land", evidence: "stated",
    note: "Where they pick up Timothy." },
  { id: "j2-phrygia-galatia", from: "Lystra", to: "Pisidian Antioch", mode: "land", evidence: "implied",
    note: "Into the Phrygian and Galatian country. Acts names the region, not the towns." },
  { id: "j2-toward-bithynia", from: "Pisidian Antioch", to: "Bithynia", mode: "land", evidence: "stated",
    kind: "attempted",
    note: "They try for Bithynia and are stopped. One of two directions in Acts that are refused rather than taken." },
  { id: "j2-toward-asia", from: "Pisidian Antioch", to: "Ephesus", mode: "land", evidence: "stated",
    kind: "attempted",
    note: "Forbidden to speak the message in Asia — the richest province in reach, and the door is shut. He will spend three years there later." },
  { id: "j2-troas", from: "Pisidian Antioch", to: "Troas", mode: "land", evidence: "implied",
    note: "Past Mysia and down to the coast, out of options and out of road." },
  { id: "j2-samothrace", from: "Troas", to: "Samothrace", mode: "sea", evidence: "stated",
    note: "A straight run with the wind behind them; the island is a night's anchorage." },
  { id: "j2-neapolis", from: "Samothrace", to: "Neapolis", mode: "sea", evidence: "stated",
    note: "Europe, on the second day." },
  { id: "j2-philippi", from: "Neapolis", to: "Philippi", mode: "land", evidence: "stated",
    note: "Up over the ridge on the Egnatian Way." },
  { id: "j2-amphipolis", from: "Philippi", to: "Amphipolis", mode: "land", evidence: "stated" },
  { id: "j2-apollonia", from: "Amphipolis", to: "Apollonia", mode: "land", evidence: "stated" },
  { id: "j2-thessalonica", from: "Apollonia", to: "Thessalonica", mode: "land", evidence: "stated" },
  { id: "j2-berea", from: "Thessalonica", to: "Berea", mode: "land", evidence: "stated",
    note: "Moved at night, ahead of a mob." },
  { id: "j2-athens", from: "Berea", to: "Athens", mode: "sea", evidence: "implied",
    note: "Acts says they took him as far as the sea and brought him to Athens. It does not name the port he sailed from." },
  { id: "j2-corinth", from: "Athens", to: "Corinth", mode: "land", evidence: "implied",
    note: "Acts says only that he left Athens and came to Corinth. Two days on foot, or a few hours across the gulf." },
  { id: "j2-cenchreae", from: "Corinth", to: "Cenchreae", mode: "land", evidence: "stated",
    note: "Corinth's eastern harbour, where he cut his hair for a vow." },
  { id: "j2-ephesus", from: "Cenchreae", to: "Ephesus", mode: "sea", evidence: "stated",
    note: "A short stop; he will not stay." },
  { id: "j2-caesarea", from: "Ephesus", to: "Caesarea", mode: "sea", evidence: "stated" },
  { id: "j2-up-to-jerusalem", from: "Caesarea", to: "Jerusalem", mode: "land", evidence: "reconstructed",
    note: "Acts says he went up and greeted the church, then went down to Antioch. Going up almost certainly means Jerusalem, but the book does not name it." },
  { id: "j2-home", from: "Jerusalem", to: "Antioch", mode: "land", evidence: "implied" },

  // --- Third journey (Acts 18-21) ---------------------------------------
  { id: "j3-galatia", from: "Antioch", to: "Pisidian Antioch", mode: "land", evidence: "implied",
    note: "Through the Galatian country and Phrygia again, strengthening the churches." },
  { id: "j3-ephesus", from: "Pisidian Antioch", to: "Ephesus", mode: "land", evidence: "stated",
    note: "Down through the upland road to Ephesus, where he stays nearly three years — longer than anywhere else in the book." },
  { id: "j3-macedonia", from: "Ephesus", to: "Neapolis", mode: "sea", evidence: "reconstructed",
    note: "Acts says he left for Macedonia and gives no ports. The crossing is drawn to Neapolis because that is Macedonia's door." },
  { id: "j3-greece", from: "Neapolis", to: "Corinth", mode: "land", evidence: "reconstructed",
    note: "Three months in Greece. Acts names the region, not the road." },
  { id: "j3-back-macedonia", from: "Corinth", to: "Philippi", mode: "land", evidence: "stated",
    note: "He meant to sail straight for Syria; a plot against him on the ship turned him back overland." },
  { id: "j3-troas", from: "Philippi", to: "Troas", mode: "sea", evidence: "stated",
    note: "Five days over — slow, against the wind that had taken two days the other way." },
  { id: "j3-assos-ship", from: "Troas", to: "Assos", mode: "sea", evidence: "stated",
    note: "The ship goes round the cape without him." },
  { id: "j3-assos-foot", from: "Troas", to: "Assos", mode: "land", evidence: "stated",
    kind: "onfoot",
    note: "Paul walks it. Acts says he arranged this himself, and gives no reason — thirty-odd kilometres alone across the Troad." },
  { id: "j3-mitylene", from: "Assos", to: "Mitylene", mode: "sea", evidence: "stated" },
  { id: "j3-chios", from: "Mitylene", to: "Chios", mode: "sea", evidence: "stated" },
  { id: "j3-samos", from: "Chios", to: "Samos", mode: "sea", evidence: "stated" },
  { id: "j3-miletus", from: "Samos", to: "Miletus", mode: "sea", evidence: "stated",
    note: "He sails past Ephesus deliberately, to save time." },
  { id: "j3-cos", from: "Miletus", to: "Cos", mode: "sea", evidence: "stated" },
  { id: "j3-rhodes", from: "Cos", to: "Rhodes", mode: "sea", evidence: "stated" },
  { id: "j3-patara", from: "Rhodes", to: "Patara", mode: "sea", evidence: "stated",
    note: "Where they leave the coasting ship for one that will cross open water." },
  { id: "j3-tyre", from: "Patara", to: "Tyre", mode: "sea", evidence: "stated",
    via: [[32.4, 34.35]],
    note: "Acts says Cyprus was on their left — so they ran south of it, four days across open sea." },
  { id: "j3-ptolemais", from: "Tyre", to: "Ptolemais", mode: "sea", evidence: "stated" },
  { id: "j3-caesarea", from: "Ptolemais", to: "Caesarea", mode: "land", evidence: "implied",
    note: "Acts does not say whether they finished by ship or by road." },
  { id: "j3-jerusalem", from: "Caesarea", to: "Jerusalem", mode: "land", evidence: "stated",
    note: "Warned at every stop that arrest is waiting, and going anyway." },

  // --- Under guard (Acts 23) --------------------------------------------
  { id: "guard-antipatris", from: "Jerusalem", to: "Antipatris", mode: "land", evidence: "stated",
    note: "Moved out at nine at night under two hundred soldiers, seventy horsemen and two hundred spearmen, because forty men had sworn to kill him." },
  { id: "guard-caesarea", from: "Antipatris", to: "Caesarea", mode: "land", evidence: "stated",
    note: "The infantry turn back; the cavalry take him the rest of the way." },

  // --- The voyage to Rome (Acts 27-28) ----------------------------------
  { id: "v-sidon", from: "Caesarea", to: "Sidon", mode: "sea", evidence: "stated",
    note: "First day out, in a coaster out of Adramyttium. The centurion lets him go ashore to friends." },
  { id: "v-cyprus", from: "Sidon", to: "Myra", mode: "sea", evidence: "stated",
    via: [[35.15, 35.35], [34.2, 36.5], [32.0, 36.6]],
    note: "They pass on the sheltered side of Cyprus because the wind is against them, then work west along the Cilician and Pamphylian coast." },
  { id: "v-cnidus", from: "Myra", to: "Cnidus", mode: "sea", evidence: "stated",
    note: "Now in an Alexandrian grain ship bound for Italy. Many days to cover very little: the wind will not let them past the corner." },
  { id: "v-salmone", from: "Cnidus", to: "Salmone", mode: "sea", evidence: "stated",
    note: "Beaten off the direct course, they duck south to run along the sheltered side of Crete." },
  { id: "v-fair-havens", from: "Salmone", to: "Fair Havens", mode: "sea", evidence: "stated",
    note: "A bay that is hard to get to and, as the sailors point out, no place to spend a winter." },
  { id: "v-phoenix", from: "Fair Havens", to: "Phoenix", mode: "sea", evidence: "stated",
    kind: "attempted",
    note: "The plan: forty miles west to a harbour that faces the right way. A soft south wind comes up and they take it — and never arrive." },
  { id: "v-cauda", from: "Fair Havens", to: "Cauda", mode: "sea", evidence: "stated",
    note: "A hurricane wind off the mountains catches them broadside. They cannot steer into it, so they run before it and get one small island's worth of shelter to haul in the boat and undergird the hull." },
  { id: "v-drift", from: "Cauda", to: "Malta", mode: "sea", evidence: "reconstructed",
    kind: "drift",
    note: "Fourteen days driven with no sun and no stars. The line is a reconstruction: it is where the wind and the time put them, not a course anyone steered." },
  { id: "v-syracuse", from: "Malta", to: "Syracuse", mode: "sea", evidence: "stated",
    note: "After three months, in another Alexandrian ship that had wintered at the island." },
  { id: "v-rhegium", from: "Syracuse", to: "Rhegium", mode: "sea", evidence: "stated",
    note: "Up to the toe of Italy, waiting a day for a wind to take them through the strait." },
  { id: "v-puteoli", from: "Rhegium", to: "Puteoli", mode: "sea", evidence: "stated",
    note: "A south wind, and they cover the last three hundred kilometres in a day and a half." },
  { id: "v-appii", from: "Puteoli", to: "Appii Forum", mode: "land", evidence: "stated",
    note: "On the Appian Way. Believers from Rome walk sixty kilometres down the road to meet him." },
  { id: "v-three-taverns", from: "Appii Forum", to: "Three Taverns", mode: "land", evidence: "stated" },
  { id: "v-rome", from: "Three Taverns", to: "Rome", mode: "land", evidence: "stated",
    note: "The last fifty kilometres, under guard, into the city." }
];

// Places Acts names that are not in the bundled Pleiades set, or that the map
// needs as a marker rather than a stop. Every one is flagged approximate in the
// page, because that is what it is.
export const EXTRA_PLACES = [
  { name: "Phoenix", lon: 24.08, lat: 35.20, approx: true,
    note: "Usually identified with Loutro on the south coast of Crete. Position approximate." },
  { name: "Lasea", lon: 24.90, lat: 34.90, approx: true,
    note: "The town Acts puts next to Fair Havens. Position approximate." },
  { name: "Appii Forum", lon: 12.98, lat: 41.45, approx: true,
    note: "A staging post on the Appian Way, near modern Borgo Faiti. Position approximate." },
  { name: "Mount of Olives", lon: 35.246, lat: 31.778, approx: true,
    note: "The ridge east of Jerusalem. Drawn at the city for legibility." }
];

// Named by Acts, or needed to read it, but not places you go.
export const SEA_MARKS = [
  { name: "Syrtis", lon: 18.2, lat: 31.6, kind: "hazard",
    note: "The shoal water off North Africa. The sailors' first fear when the gale took them: not the storm, but being driven down onto it." },
  { name: "Adria", lon: 18.0, lat: 36.2, kind: "sea",
    note: "In the first century this name covered the whole open sea between Sicily, Greece and Crete — not just the gulf that carries it now." },
  { name: "Mare Internum", lon: 21.0, lat: 33.4, kind: "sea", note: "" },
  { name: "Aegaeum Mare", lon: 25.1, lat: 37.6, kind: "sea", note: "" },
  { name: "Pontus Euxinus", lon: 34.5, lat: 43.5, kind: "sea", note: "" },
  { name: "Mare Tyrrhenum", lon: 12.4, lat: 39.9, kind: "sea", note: "" }
];
