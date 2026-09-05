# A Place Set Apart — Astra

A first-person exploration of the Mosaic Tabernacle, built for Norman’s AI Benchmark on `astra-tabernacle`.

Open the Astra card in the Tabernacle gallery. From the repository root, `npm start` serves it at `http://localhost:4173/#/tabernacle`. This folder’s `index.html` also runs directly: every runtime script is classic, every asset is local, and every texture is generated in memory. There is no install or build step for the submission.

## Walking and reading

- Arrow keys or WASD move; Shift increases walking pace.
- Drag the scene to look. Q/E turn, R/F look up/down, and Enter inspects the centre of the view.
- Click a furnishing or hanging for its field note. The entrance screen and veil have **Draw aside for study** controls in their notes.
- M opens the plan, with a live position marker and first-person study viewpoints. G opens the field guide; H hides the interface.
- Escape closes the field note or releases continuous mouse look. Continuous mouse look is optional and depends on the browser; dragging works in the benchmark’s sandbox.
- Settings provide rendering detail, walking pace, sensitivity and reduced ambient motion. On touch devices, movement buttons accompany drag-to-look.

The study viewpoints are jumps between safe first-person positions. They do not animate the visitor through walls. They draw the relevant screens aside for examination. The freely accessible rooms are an educational accommodation, not a reenactment of priestly access.

## What was built

The court, tent and furnishings use cubits as scene units. Sixty distinct court pillars carry linen hangings, with bronze bases and silver fittings. Forty-eight gold-covered boards form the tent; four pillars support the veil and five support the entrance screen. The table is on the north side, the lampstand on the south, and the incense altar stands before the veil. Seven modeled oil lamps illuminate the Holy Place.

Textile weave, embroidery, sand, metal grain, light glows and contact shadows are generated with canvas. Geometry is built locally, including the vessels, carrying rings and poles, almond decorations, wing feathers, ropes, folded textiles, terrain and distant ridges. Opaque static pieces are batched by material and inspection target to keep rendering responsive. Optional light flicker, dust and incense smoke are disabled by the reduced-motion setting.

## Dimensions and interpretation

The JSON block in `index.html` reproduces the brief’s dimensions. Tests measure the actual furniture vertices and the complete tent framework, as well as the court’s hanging lines. Furniture body measurements exclude the ark cover and cherubim, poles, altar horn tips, bread and service vessels.

The ten linen panels are developed rectangles of 28 × 4 cubits; the eleven goat-hair panels are 30 × 4. They are folded around the frame. Diagonal folds tuck the rear corners onto the sides, the front goat-hair half-panel doubles back, and the trailing hem turns up at ground level. Triangulation follows the fold lines: the tests compare **every triangle edge and the total surface area** against the original flat panels. Folding preserves the material dimensions within Float32 rounding. Fifty gold and fifty bronze clasps join the two assemblies.

The fold layout is an interpretation. So are the flat roof, skin-cover profiles, thin boards and overlapping western corner joints, the 20/10-cubit room division, embroidery designs, cherubim, pillar profiles, the laver and lampstand dimensions, and the precise spacing of furnishings. The uncertain outer-covering term *tachash* is represented as neutral hide without claiming an animal species. Sunlight, mountains, and the inner room’s viewing illumination provide context; they do not depict divine presence. Each object’s note states its relevant uncertainties.

## Sources

The field notes paraphrase the instructions and construction accounts in **Exodus 25–27, 30, 36–40**. Leviticus 24:5–9 supplies the twelve loaves in two arrangements of six. References accompany the individual objects.

Primary-text checks used the public-domain King James text: [Exodus](https://en.wikisource.org/wiki/Bible_(King_James)/Exodus) and [Leviticus](https://en.wikisource.org/wiki/Bible_(King_James)/Leviticus). These links are documentation only; the walkthrough never contacts them.

## Verification

Run `npm test` at the repository root, or `node --test test/astra-tabernacle.test.js` for this submission’s checks. The suite covers local runtime assets, declared and measured dimensions, scriptural piece counts, folded textile lengths and areas, solid bodies and projecting poles, anti-tunnelling, moving-curtain safety, a complete traversable route, object coverage and cardinal placement.

Browser checks were performed in the gallery’s actual opaque-origin iframe. A complete arrow-key walk reached the inner sanctuary from outside the eastern gate, going around the altar, laver and incense altar and through both opened hangings. Other checks covered direct object inspection, drag-to-look, opening the veil, study viewpoints, the field guide and settings, desktop and narrow-screen layouts, and runtime errors. All 15 repository tests passed. In Codex’s embedded browser, continuous pointer lock was unavailable; the drag fallback worked. The desktop scene was observed running at approximately 60 fps on the test machine; performance depends on hardware and viewport.

## Included library

`vendor/three.min.js` is the unmodified classic build of **Three.js 0.160.0**, under the [included MIT licence](vendor/THREE-LICENSE.txt). It was obtained from the version-pinned npm distribution, `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js`. SHA-256: `170c6789f43217c96b3170f4b42fafe135de7f7cd48497a4218f9757ee1d49fa`.

This version provides the classic-script interface required by the opaque-origin viewer. Its console deprecation warning is expected. None of the library’s asset loaders are used; the scene generates all resources locally.
