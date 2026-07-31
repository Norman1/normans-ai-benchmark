// Anchors for the Roman provinces the book of Acts moves through.
//
// The bundled border file is bare linework — inland segments only, with no
// names and no closed shapes — so a province cannot simply be read off it. What
// the build does instead: grow each province outward from these anchor points
// across land only, letting neighbours meet where they meet, and charging a
// heavy toll to cross one of the real border lines. Where the data has a border
// the region snaps to it; where it does not, two provinces divide the ground
// between them.
//
// The result is an approximate region, which is the honest thing to draw. The
// borders in the data are AD 200 and Acts runs AD 30-62, and Roman provincial
// boundaries were not lines on the ground in the first place.
//
// Anchors are real cities, placed from their known positions.

export const PROVINCES = [
  {
    id: "asia", name: "ASIA", tone: 0,
    anchors: [[27.34, 37.94], [27.14, 38.42], [27.18, 39.13], [28.04, 38.49], [27.28, 37.53],
      [26.16, 39.75], [26.94, 39.50], [29.11, 37.84], [29.13, 37.93], [27.89, 40.38],
      [26.34, 39.49], [27.42, 37.04], [28.72, 37.71], [28.66, 38.35], [27.84, 38.92],
      [30.00, 38.30], [26.55, 39.11], [26.13, 38.37], [26.84, 37.73], [27.29, 36.89],
      [28.23, 36.44], [26.55, 37.31], [25.27, 37.39], [25.52, 37.10], [24.95, 37.44]]
  },
  {
    id: "galatia", name: "GALATIA", tone: 1,
    anchors: [[32.85, 39.93], [31.77, 39.34], [34.87, 39.87], [31.19, 38.31], [32.49, 37.87],
      [32.34, 37.59], [33.36, 37.35], [30.52, 37.68], [31.28, 39.02], [33.50, 38.60],
      [31.90, 37.20], [30.90, 38.80]]
  },
  {
    id: "cappadocia", name: "CAPPADOCIA", tone: 2,
    anchors: [[35.48, 38.73], [34.61, 37.83], [38.35, 38.35], [36.35, 38.35], [36.50, 39.50],
      [37.20, 38.90], [35.60, 39.70]]
  },
  {
    id: "bithynia", name: "BITHYNIA ET PONTUS", tone: 3,
    anchors: [[29.92, 40.76], [29.72, 40.43], [29.06, 40.18], [31.62, 40.74], [32.38, 41.75],
      [35.15, 42.03], [36.33, 41.29], [35.83, 40.65], [36.96, 40.32], [33.50, 41.20],
      [38.40, 40.90], [30.70, 40.70]]
  },
  {
    id: "cilicia", name: "CILICIA", tone: 4,
    anchors: [[34.90, 36.91], [35.32, 36.99], [35.90, 37.26], [35.62, 36.96], [34.15, 36.46],
      [33.94, 36.38], [36.20, 36.70], [34.60, 37.20]]
  },
  {
    id: "lycia", name: "LYCIA ET PAMPHYLIA", tone: 5,
    anchors: [[29.31, 36.26], [29.99, 36.26], [29.32, 36.36], [30.85, 36.96], [30.70, 36.89],
      [31.39, 36.77], [31.17, 36.94], [30.46, 36.98], [29.12, 36.65], [29.60, 36.90]]
  },
  {
    id: "syria", name: "SYRIA", tone: 6,
    anchors: [[36.18, 36.22], [35.93, 36.12], [36.31, 33.51], [35.79, 35.52], [36.40, 35.42],
      [36.72, 34.73], [38.27, 34.55], [37.16, 36.20], [37.05, 36.05], [37.87, 37.06],
      [35.20, 33.27], [35.37, 33.56], [35.50, 33.90], [35.65, 34.12], [35.85, 34.44],
      [38.50, 35.60], [36.90, 33.00], [39.00, 34.20]]
  },
  {
    id: "iudaea", name: "IUDAEA", tone: 7,
    anchors: [[35.24, 31.78], [34.89, 32.50], [34.75, 32.05], [34.89, 31.96], [34.66, 31.76],
      [35.19, 32.28], [34.93, 32.11], [34.45, 31.52], [35.45, 31.87], [35.10, 31.53],
      [34.55, 31.67], [35.53, 32.79], [35.28, 32.75], [35.50, 32.50], [35.35, 31.32],
      [35.30, 32.05], [35.55, 33.10]]
  },
  {
    id: "macedonia", name: "MACEDONIA", tone: 8,
    anchors: [[22.95, 40.63], [24.29, 41.01], [22.20, 40.52], [23.84, 40.83], [23.47, 40.62],
      [22.52, 40.76], [22.49, 40.17], [24.41, 40.93], [22.05, 40.80], [22.42, 39.64],
      [21.34, 41.01], [21.97, 41.55], [19.45, 41.31], [19.44, 40.72], [20.73, 39.01],
      [20.20, 39.93], [21.20, 39.80], [23.30, 40.20], [25.20, 40.90]]
  },
  {
    id: "achaia", name: "ACHAIA", tone: 9,
    anchors: [[22.88, 37.91], [23.72, 37.97], [22.43, 37.08], [21.73, 38.25], [22.50, 38.48],
      [22.72, 37.63], [23.32, 38.32], [21.63, 37.64], [23.34, 37.99], [22.99, 37.88],
      [23.60, 38.46], [21.37, 37.89], [21.92, 37.18], [22.10, 38.90], [23.90, 38.90]]
  },
  {
    id: "thracia", name: "THRACIA", tone: 10,
    anchors: [[28.98, 41.01], [27.96, 40.97], [24.75, 42.15], [23.32, 42.70], [26.08, 40.72],
      [27.70, 42.42], [25.90, 40.95], [26.50, 41.70], [24.20, 41.60]]
  },
  {
    id: "creta", name: "CRETA ET CYRENAICA", tone: 11,
    anchors: [[24.95, 35.06], [25.16, 35.30], [24.02, 35.51], [24.81, 34.93], [23.65, 35.35],
      [26.10, 35.15], [21.86, 32.82], [20.94, 32.71], [20.07, 32.12], [21.97, 32.90],
      [22.60, 32.60], [20.50, 32.50]]
  },
  {
    id: "cyprus", name: "CYPRUS", tone: 12,
    anchors: [[32.41, 34.76], [33.90, 35.18], [33.64, 34.92], [33.14, 34.71], [32.81, 35.13],
      [33.30, 35.10]]
  },
  {
    id: "aegyptus", name: "AEGYPTUS", tone: 13,
    anchors: [[29.91, 31.20], [31.25, 29.85], [32.54, 31.05], [30.58, 30.90], [30.65, 28.55],
      [31.29, 30.13], [31.80, 30.60], [30.90, 29.30], [32.30, 29.90], [31.20, 27.20]]
  },
  {
    id: "italia", name: "ITALIA", tone: 14,
    anchors: [[12.49, 41.89], [14.12, 40.83], [14.25, 41.09], [14.25, 40.85], [17.94, 40.63],
      [14.77, 41.13], [17.24, 40.47], [12.29, 41.76], [11.25, 43.77], [12.57, 44.06],
      [13.51, 43.62], [13.37, 45.77], [9.19, 45.46], [8.93, 44.41], [15.64, 38.11],
      [17.13, 39.08], [11.34, 44.49], [10.40, 43.70], [16.60, 41.10], [13.00, 42.50]]
  },
  {
    id: "sicilia", name: "SICILIA", tone: 15,
    anchors: [[15.28, 37.07], [13.36, 38.12], [15.55, 38.19], [13.58, 37.31], [15.09, 37.50],
      [14.40, 35.89], [12.60, 37.80]]
  },
  {
    id: "africa", name: "AFRICA", tone: 16,
    anchors: [[10.32, 36.85], [10.06, 37.06], [10.64, 35.87], [10.71, 35.30], [14.29, 32.64],
      [13.18, 32.90], [12.49, 32.79], [9.20, 35.50], [8.60, 36.60], [16.00, 31.20]]
  },
  {
    id: "arabia", name: "ARABIA", tone: 17, client: true,
    anchors: [[35.44, 30.32], [36.48, 32.52], [36.50, 30.50], [37.50, 29.50], [35.90, 29.20],
      [38.50, 31.00], [37.00, 31.60]]
  },
  {
    id: "mesopotamia", name: "MESOPOTAMIA", tone: 18, outside: true,
    anchors: [[38.79, 37.15], [41.22, 37.07], [39.03, 36.87], [40.73, 34.75], [44.42, 32.54],
      [42.50, 35.50], [43.50, 33.50], [41.00, 34.00], [40.00, 36.00]]
  }
];

// District names Acts uses that are not provinces — the words a reader trips
// over. Drawn as text only: these are the names of countries inside provinces,
// and giving them outlines would invent boundaries the data does not have.
export const DISTRICTS = [
  { name: "Phrygia", lon: 30.20, lat: 38.45 },
  { name: "Mysia", lon: 27.80, lat: 39.75 },
  { name: "Lydia", lon: 28.30, lat: 38.55 },
  { name: "Ionia", lon: 27.05, lat: 38.10 },
  { name: "Caria", lon: 28.20, lat: 37.30 },
  { name: "Troad", lon: 26.50, lat: 39.80 },
  { name: "Pisidia", lon: 30.80, lat: 37.55 },
  { name: "Lycaonia", lon: 33.20, lat: 37.75 },
  { name: "Isauria", lon: 32.20, lat: 36.95 },
  { name: "Pontus", lon: 37.20, lat: 40.60 },
  { name: "Paphlagonia", lon: 34.20, lat: 41.20 },
  { name: "Galilaea", lon: 35.45, lat: 32.88 },
  { name: "Phoenice", lon: 35.60, lat: 33.85 },
  { name: "Decapolis", lon: 36.05, lat: 32.30 },
  { name: "Idumaea", lon: 34.90, lat: 31.15 },
  { name: "Thessalia", lon: 22.20, lat: 39.50 },
  { name: "Epirus", lon: 20.40, lat: 39.60 },
  { name: "Boeotia", lon: 23.10, lat: 38.40 },
  { name: "Attica", lon: 23.75, lat: 38.15 },
  { name: "Peloponnesus", lon: 22.20, lat: 37.45 },
  { name: "Campania", lon: 14.45, lat: 41.05 },
  { name: "Latium", lon: 12.90, lat: 41.60 },
  { name: "Cilicia Tracheia", lon: 33.20, lat: 36.60 }
];

// Water the flood must be told about: bodies the coastline data encloses, and
// gulfs that simplification pinched shut. Everything else inside a coastline
// ring is treated as land. Found by running the build with --report, which
// lists every basin it could not classify, and naming them one at a time.
//
// The build rejects any seed that turns out to flood a continent, so a seed
// that misses the water by a few hundred metres fails loudly instead of
// silently turning Eurasia into sea. Several of the entries below are rejected
// for exactly that reason and are kept as a record of what was tried.
export const WATER_SEEDS = [
  [18.0, 34.5, "Mediterranean"], [33.0, 43.0, "Pontus Euxinus"], [28.0, 40.7, "Propontis"],
  [36.5, 46.0, "Maeotis"], [35.5, 27.0, "Red Sea"], [32.8, 29.2, "Gulf of Suez"],
  [34.75, 28.9, "Gulf of Aqaba"], [35.47, 31.50, "Dead Sea"], [35.58, 32.82, "Sea of Galilee"],
  [33.38, 38.75, "Lake Tatta"], [31.55, 37.78, "Lake Karalis"], [30.87, 38.05, "Lake Limnai"],
  [43.00, 38.60, "Lake Thospitis"], [23.45, 37.75, "Saronic Gulf"], [26.75, 40.42, "Hellespont"],
  [29.30, 40.43, "Lake Ascanius"], [10.30, 35.60, "Gulf of Gabes"]
];
