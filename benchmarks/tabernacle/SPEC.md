# Tabernacle — submission brief

Build an explorable, educational walkthrough of the Mosaic Tabernacle that runs
in a browser.

## Deliverable

A folder under `benchmarks/tabernacle/submissions/<your-id>/` containing an
`index.html` and whatever assets it needs. Then add an entry to
`submissions/index.json`:

```json
{
  "id": "your-id",
  "title": "Short title",
  "agent": "<model that built it>",
  "created": "2026-07-25",
  "entry": "./benchmarks/tabernacle/submissions/your-id/index.html",
  "notes": "One line on the approach.",
  "thumbnail": "./benchmarks/tabernacle/submissions/your-id/thumb.png"
}
```

`notes` and `thumbnail` are optional.

## The rules

1. First person walkthrough
2. Particle collision — the visitor is a solid body and cannot clip through geometry
3. No gameplay features — no score, objectives, enemies or inventory
4. Bible fidelity — where scripture gives a number, that number is right
5. Arrow keys move; clicking an object opens a short educational text

## Hard constraints

- **Self-contained.** No CDN scripts, no external fonts, no remote assets, no
  network requests of any kind. Everything ships in your folder or is inlined.
- **Runs from a static file.** No build step, no server, no bundler.
- The viewer frames your page with `sandbox="allow-scripts allow-pointer-lock"`,
  so `fetch`, `XMLHttpRequest` and storage are unavailable. Relative
  `<script>`, `<img>` and `<link>` loads work normally.

## What it must cover

The outer court, the bronze altar, the laver, the Holy Place with the menorah,
the table of showbread and the altar of incense, the veil, and the Holy of
Holies with the ark. Each should be inspectable with an explanation of what it
is and what it was for.

## Dimensions

Accuracy is checked against scripture, not judged by eye, so declare your
dimensions in a machine-readable block in `index.html`:

```html
<script type="application/json" id="tabernacle-dimensions">
{
  "unit": "cubit",
  "court":            { "length": 100, "width": 50, "height": 5 },
  "tent":             { "length": 30,  "width": 10, "height": 10 },
  "ark":              { "length": 2.5, "width": 1.5, "height": 1.5 },
  "table":            { "length": 2,   "width": 1,  "height": 1.5 },
  "altarOfIncense":   { "length": 1,   "width": 1,  "height": 2 },
  "bronzeAltar":      { "length": 5,   "width": 5,  "height": 3 },
  "curtains":         { "count": 10,   "length": 28, "width": 4 },
  "goatHairCurtains": { "count": 11,   "length": 30, "width": 4 }
}
</script>
```

Primary sources: Exodus 25–27, 30, and 36–40. Where scripture is silent —
notably the exact form of the roof and the ark's cherubim — make a defensible
choice and say so in `notes`. Inventing a number that scripture does give is the
one thing that counts as wrong.

## How it is judged

Three gates. It must run and obey the five rules; its declared dimensions must
match the manifest; and then Norman walks through it. The third one is the real
test.
