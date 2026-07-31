// Two small pieces of content that belong to the map rather than to the story:
// the journeys as ordered lists of legs, and the homelands named at Pentecost.

(function (ATLAS) {
  "use strict";

  ATLAS.journeys = {
    first: {
      name: "The first journey",
      legs: ["j1-seleucia", "j1-salamis", "j1-across-cyprus", "j1-perga",
        "j1-pisidian-antioch", "j1-iconium", "j1-lystra", "j1-derbe",
        "j1-back-lystra", "j1-back-iconium", "j1-back-antioch", "j1-back-perga",
        "j1-attalia", "j1-home"]
    },
    second: {
      name: "The second journey",
      legs: ["j2-cilicia", "j2-derbe", "j2-lystra", "j2-phrygia-galatia",
        "j2-toward-asia", "j2-toward-bithynia", "j2-troas", "j2-samothrace",
        "j2-neapolis", "j2-philippi", "j2-amphipolis", "j2-apollonia",
        "j2-thessalonica", "j2-berea", "j2-athens", "j2-corinth", "j2-cenchreae",
        "j2-ephesus", "j2-caesarea", "j2-up-to-jerusalem", "j2-home"]
    },
    third: {
      name: "The third journey",
      legs: ["j3-galatia", "j3-ephesus", "j3-macedonia", "j3-greece",
        "j3-back-macedonia", "j3-troas", "j3-assos-ship", "j3-assos-foot",
        "j3-mitylene", "j3-chios", "j3-samos", "j3-miletus", "j3-cos",
        "j3-rhodes", "j3-patara", "j3-tyre", "j3-ptolemais", "j3-caesarea",
        "j3-jerusalem"]
    },
    voyage: {
      name: "The voyage to Rome",
      legs: ["v-sidon", "v-cyprus", "v-cnidus", "v-salmone", "v-fair-havens",
        "v-phoenix", "v-cauda", "v-drift", "v-syracuse", "v-rhegium",
        "v-puteoli", "v-appii", "v-three-taverns", "v-rome"]
    }
  };

  // The fifteen homelands Acts lists for the Pentecost crowd, in the order the
  // book gives them. Three of them lie east of this map and are drawn as arrows
  // at the edge rather than moved somewhere they are not.
  ATLAS.pentecost = [
    { name: "Parthia", lat: 35.5, offMap: true },
    { name: "Media", lat: 37.4, offMap: true },
    { name: "Elam", lat: 32.5, offMap: true },
    { name: "Mesopotamia", lon: 41.0, lat: 35.6 },
    { name: "Judaea", lon: 34.95, lat: 31.30 },
    { name: "Cappadocia", lon: 35.5, lat: 38.7 },
    { name: "Pontus", lon: 37.0, lat: 40.6 },
    { name: "Asia", lon: 28.3, lat: 38.4 },
    { name: "Phrygia", lon: 30.6, lat: 38.4 },
    { name: "Pamphylia", lon: 31.0, lat: 36.9 },
    { name: "Egypt", lon: 30.8, lat: 30.2 },
    { name: "Cyrene", lon: 21.4, lat: 32.5 },
    { name: "Rome", lon: 12.5, lat: 41.9 },
    { name: "Crete", lon: 24.9, lat: 35.2 },
    { name: "Arabia", lon: 36.6, lat: 30.6 }
  ];

  // Wording for the three levels of evidence a leg can carry.
  ATLAS.evidenceText = {
    stated: {
      label: "Stated",
      blurb: "Acts names this stop and makes the mode of travel clear."
    },
    implied: {
      label: "Implied",
      blurb: "Acts names the stop but not whether it was made by land or by sea. The line takes the likelier of the two and says so."
    },
    reconstructed: {
      label: "Reconstructed",
      blurb: "Acts leaves a gap here. The line is a reasonable filling-in, not something the book reports."
    }
  };

  ATLAS.drawnText = {
    road: "Follows the surveyed Roman road network.",
    direct: "Drawn direct: no road survives in the source data for this stretch.",
    sailed: "A sea track that keeps to water the whole way — the route is found across the coastline itself, so it never crosses land.",
    arc: "Drawn as a plain arc."
  };
})(window.ACTS_ATLAS = window.ACTS_ATLAS || {});
