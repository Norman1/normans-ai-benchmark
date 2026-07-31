# Acts — an atlas of the book

An interactive map of Acts, driven by a slider that moves through the narrative
in 103 scenes. Open `index.html`. No build step, no server, no network.

## What it does

The slider is the spine, and what it offers you changes with where it is. Inside
a journey it offers to follow that journey leg by leg. At Pentecost it offers the
fifteen homelands the crowd came from, three of which are off the east edge of
the map and are drawn as arrows rather than moved somewhere they are not. At the
two refused directions in Acts 16 it draws both and puts a bar across the end of
each. Off Cauda it shows the arithmetic behind the drift line.

Five overlays: Roman provinces as regions, the Roman road network, the spread of
the message, Herod Agrippa's kingdom, and the ancient names.

Every place has a card with two things on it — what the place was, and what
happens there. Modern names are on the cards and never on the map.

## The three claims worth checking

**Routes follow the text.** Acts is unusually good about saying whether a leg was
by land or by sea, and the 90 legs in `tools/legs.mjs` follow it. Where the book
does not say, the leg says so. Three specific tests:

- The run from Patara passes **south** of Cyprus and the run from Sidon passes
  **north** of it, because Acts says which side each time.
- Troas to Assos is drawn **twice** — the ship round Cape Lectum, 64 km, and
  Paul's walk across the Troad, 47 km. Acts says he arranged that himself.
- Acts 27 has the whole sequence: the lee of Cyprus, the transfer to an
  Alexandrian grain ship at Myra, the failure to weather Cnidus, Cape Salmone,
  Fair Havens, the attempt on Phoenix, the run under Cauda, the fear of Syrtis,
  and fourteen days in the Adria.

**No line crosses land, and no route is a straight line between dots.** Sea legs
are shortest paths over water; land legs follow the surveyed Roman road wherever
the road data supports it — 51 of the 56 do.

**Inference is labelled.** Click any leg for its evidence level: *stated*,
*implied*, or *reconstructed*. Four places are flagged approximate on their cards
because they are not in the supplied coordinate set. Five land legs say they are
drawn direct because no road survives in the data for that ground.

## How it is built

`tools/build-geo.mjs` turns the bundled reference data into the five files in
`js/data-*.js`. Run it with `node tools/build-geo.mjs`; add `--report` to list
enclosed water basins it could not classify.

Everything rests on one grid. The coastline is burned into 8.8 million cells,
about a kilometre across, and the sea is flooded outward from open water. From
that one raster come three things:

| | |
|---|---|
| **The land** | traced as polygons, then simplified — so the fill and the coast are the same line and cannot disagree |
| **The sea routes** | A\* over water cells, then pulled taut so an open crossing is a run and not a staircase |
| **The provinces** | grown from anchor cities across land only, with a heavy toll for crossing a real border line |

A kilometre matters: at a coarser step the Strait of Messina closes and the
voyage to Puteoli sails the long way round Sicily.

The province borders in the data are AD 200 and Acts runs AD 30–62, and the file
is bare linework with no names and no closed shapes. So the regions here are
approximations by intent: where the data has a border they snap to it, and where
it does not, neighbouring provinces divide the ground between them.

`tools/legs.mjs` and `tools/provinces.mjs` hold the judgement calls — one leg per
movement in the book, and the anchor cities for each province. Both are meant to
be read.

## Sources

- **Places** — [Pleiades](https://pleiades.stoa.org/), CC-BY 3.0.
- **Coastline, roads, province borders, Herod's kingdom** —
  [AWMC geodata](https://github.com/AWMC/geodata), Ancient World Mapping Center,
  UNC Chapel Hill, ODC Open Database Licence, derived from the *Barrington
  Atlas*. Licence in `benchmarks/acts/mapdata/AWMC-LICENSE.txt`.

Both were supplied with the brief. Nothing was traced by hand.

## Constraints met

Self-contained: no CDN, no fonts, no images — the parchment is generated in
code. All scripts are classic scripts assigning to a global, because the viewer
frames the page on an opaque origin where modules, `fetch` and `localStorage` all
fail at runtime. The only files referenced outside this folder are
`../../mapdata/js/acts-places.js` and `../../mapdata/js/herods-kingdom.js`, which
the brief allows.

No verses are quoted. Every word of the prose was written for this page.
