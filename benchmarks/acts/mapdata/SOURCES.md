# Map data — sources and attribution

Everything here is reference data so submissions do not have to trace coastlines
or guess coordinates. All of it is clipped to the world of Acts
(**lon 5–45°E, lat 26–48°N**) and simplified for the browser.

## Files

| File | What it is |
|---|---|
| `acts-places.json` | The 76 places named in Acts, with coordinates |
| `coastline.geojson` | Ancient shoreline, 1401 lines |
| `province-borders.geojson` | Roman province borders, **unlabelled**, AD 200 |
| `region-labels.geojson` | 1833 named regions and features — this is where province *names* live |
| `roads.geojson` | Roman road network, 2330 segments |
| `herods-kingdom.geojson` | Herod's kingdom |

## Use the ancient coastline, not a modern one

Ephesus was a working port. The Cayster has silted up so completely that the
site now sits about five kilometres inland, and Miletus and Troas have the same
problem. Drawn on a modern coastline, "they sailed to Ephesus" becomes nonsense.
The shoreline here is the ancient one.

## Two caveats that matter

**Province borders are AD 200; Acts runs AD 30–62.** Provinces were reorganised
in between. Treat the borders as approximate regions rather than surveyed lines
— which is also more honest, since Roman provincial boundaries were not lines on
the ground in the first place.

**Borders and names are separate files.** `province-borders.geojson` is bare
linework with no usable attributes; the names are in `region-labels.geojson`
under `TITLE`, as label placement geometry. Joining them is your problem, and
approximating a region rather than drawing a crisp outline is a legitimate
answer.

## Provenance

**Places** — [Pleiades](https://pleiades.stoa.org/), CC-BY 3.0. Coordinates,
titles and descriptions in `acts-places.json` are Pleiades data; each entry
keeps its `pleiades_id` and `uri`. The `acts_name` field is the common English
name and is not from Pleiades.

**Geometry** — [AWMC geodata](https://github.com/AWMC/geodata), Ancient World
Mapping Center, UNC Chapel Hill, under the ODC Open Database License; derived
from the *Barrington Atlas of the Greek and Roman World* and from AWMC
modifications to OpenStreetMap. Full licence in `AWMC-LICENSE.txt`.

Clipping, simplification (Douglas–Peucker, ~0.01°) and coordinate rounding to
four decimals were applied here. The originals are unmodified upstream.
