# Acts — submission brief

Build an **interactive map of the book of Acts**, driven by a timeline.

The problem it solves: a modern reader meets "they sailed from Troas to
Neapolis" and it is noise. They do not know where those places are, what they
were, or why anyone would go there. Make Acts palpable.

## The rules

1. **A timeline slider is the spine.** It moves through the *narrative
   sequence*, not dated years.
2. **What you can do depends on where the slider is.** When a journey is
   running, you can follow it.
3. **Toggleable overlays** showing how Christianity spread.
4. **The whole book**, not just Paul — Pentecost, the scattering, Philip,
   Peter, Antioch.
5. **Ancient map.** Roman provinces as visible regions, ancient names. Modern
   names belong in the place card, not on the map.
6. **Place cards**: brief historical background plus what happened there.
7. **No Bible verses.** Write it in your own words.

## Why sequence and not years

Acts gives very few absolute dates. There are a handful of anchors — Gallio at
Corinth, the famine under Claudius, Festus replacing Felix — and the rest is
scholarly reconstruction with real disagreement. A slider labelled in years
forces you to commit to one chronology and present it as fact.

The *order* of events is certain even where the dates are not. Years may appear
as soft context on a card — "around AD 50" — but the slider moves through the
book.

## Why provinces matter more than pins

Acts speaks in provinces constantly. Paul is forbidden to preach the word in
**Asia**; he crosses to **Macedonia**; he is in **Achaia**, **Galatia**,
**Cilicia**. To a modern reader those words are noise — Asia especially, since
it means a Roman province the size of western Turkey, not the continent.

Draw the provinces as regions and whole sentences become legible that were not
before. That is a bigger payoff than pin placement.

## Place cards

Two things, both short: **what the place was**, and **what happened there in
Acts**.

Aim for the detail that makes someone sit up. Ephesus was a quarter of a million
people, capital of Asia, home to one of the wonders of the world — and the same
dot on most maps as Philippi, a small colony of a few thousand. Athens had been
a museum piece for centuries by the time Paul argued in it. Puteoli was where
Rome's grain came in. That texture is the point; it is what turns a name into a
place.

Do not quote scripture. Describe what happened in your own words.

## What you are given

`benchmarks/acts/mapdata/` — read `SOURCES.md` there first. It holds the 76
places named in Acts with coordinates from Pleiades, the ancient coastline,
Roman province borders, region names, the road network, and Herod's kingdom.
All clipped to the world of Acts and simplified for the browser.

`mapdata/js/` holds every one of those files as a **classic script** that
assigns into `window.ACTS_MAPDATA` — `places`, `coastline`, `provinceBorders`,
`regionLabels`, `roads`, `herodsKingdom`. Use those, not the `.geojson`
originals, which your page cannot load at all (see the constraints below).

```html
<script src="../../mapdata/js/acts-places.js"></script>
<script src="../../mapdata/js/coastline.js"></script>
<script>
  const { places } = window.ACTS_MAPDATA.places;   // 76 entries, lat/lon each
  const coast = window.ACTS_MAPDATA.coastline;     // GeoJSON FeatureCollection
</script>
```

You should not need to look up a single coordinate. Guessing where Lystra is
puts it tens of kilometres off, or in the sea, and the map is quietly wrong in a
way that looks fine.

Two things that file warns about and this brief repeats: the province borders
are **AD 200** while Acts runs AD 30–62, so draw approximate regions rather than
crisp lines; and **borders and names are separate files** that you have to join
yourself.

## The failure mode to avoid

This is far easier to fake than it looks. Forty pins on a Mediterranean outline
passes a glance. What separates a real submission:

- **Routes follow the text.** Acts usually says whether a leg was by land or by
  sea. Straight lines between pins mean the book was not read.
- **The spread overlay reflects what actually happened**, in the order it
  happened, not a decorative expanding blob.
- **Acts 27 is right.** The voyage to Rome is extraordinarily detailed — winds,
  drifting, soundings, the wreck off Malta. It is almost impossible to bluff and
  a good place to prove you did the work.
- **Inference is labelled.** Acts does not name every stop; some routes are
  reconstructed. Presenting a guess as narrative is the one thing that would
  make this untrustworthy.

## Hard constraints

- **Self-contained.** No CDN scripts, external fonts, or remote assets. No
  network requests of any kind. Everything ships in your folder or is inlined.
  The one exception is `mapdata/js/`, which you can reference in place with
  `<script src="../../mapdata/js/coastline.js">` — verified working from inside
  a submission, so there is no need to copy it.
- **Runs from a static file.** No build step, no server, no bundler.
- The viewer frames your page with
  `sandbox="allow-scripts allow-pointer-lock allow-downloads"`. There is no
  `allow-same-origin`, so your page runs on an **opaque origin**. That has one
  consequence worth reading twice, because it is measured, not guessed:

  | How you might load data | Result |
  |---|---|
  | Classic `<script src="./data.js">` setting a global | **works** |
  | ES modules — `type="module"`, `import()` | **fails** |
  | `fetch` | exists, every call **fails** |
  | `XMLHttpRequest` | exists, every call **fails** |
  | `localStorage`, `sessionStorage`, `indexedDB` | **unavailable** |

  So **ship data as classic scripts that assign to a global.** `fetch` and
  `import` will not throw at parse time — they fail at runtime, which is a
  slow and annoying way to find this out. Relative `<img>` and `<link>` loads
  work normally.

## Deliverable

A folder under `benchmarks/acts/submissions/<your-id>/` with an `index.html`,
listed in `submissions/index.json`:

```json
{
  "id": "your-id",
  "title": "Short title",
  "agent": "<model that built it>",
  "created": "2026-07-31",
  "entry": "./benchmarks/acts/submissions/your-id/index.html",
  "notes": "One line on the approach."
}
```

## How it is judged

It must run; the timeline must drive the map; the geography must be right; the
routes must match the text. Then Norman uses it and decides whether Acts feels
like it happened in real places. That last one is the real test.
