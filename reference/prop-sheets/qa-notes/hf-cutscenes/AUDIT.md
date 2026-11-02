# Cutscene audit (hf-cutscenes, 2026-10-31, Phase 1)

Every story in the game was opened through the dev hooks (`__story`, `__memory`, `?storyAt=N`) at phone size, upright 390x844 and
sideways 844x390. 61 stories, 800 panels in all (`panels.tsv`: story, panel, what is behind it, particles, cast, first words).
185 panels were shot both ways: the first panel of every change of background, then every 6th (`before/contact-up-*.jpg`,
`before/contact-side-*.jpg`). `plates-now.jpg` shows all 22 painted plates.

## What the panels stand on

| Background | Panels | Look on the phone |
|---|---|---|
| A painted plate (16 plates in use) | 204 | Rich, sharp, lit: warroom, cell, tea, nest-night, courtyard. These hold up. |
| A world's gameplay scenery + the drawn ground strip | 580 | **The weak spot.** Upright, the room above the scene is the stage backdrop's upper layers blown up: soft, hazy, low contrast, the cast small at the bottom of a big grey-green field. |
| End cards | 16 | Fine (repainted 10-29). |

The gap between a plate panel and a scenery panel is the biggest thing Matt sees (compare `contact-up-03` mem-map/tea/cell against
`contact-up-01` w8/w10/mid6). The scenery panels make up almost three panels in four.

Scenery panels by world and mood (what one painted plate per row would fix):

| World / mood | Panels | Stories |
|---|---|---|
| W1 day (the home branch) | 81 | prologue, W1, W1 mid, boss 1 both, The Waiting |
| W8 night | 81 | W8, W8 mid, boss 8 both, The Promise, The Lieutenant |
| W10 storm | 55 | W10, W10 mid, the gate, boss 10 both |
| W6 dusk | 47 | W6 mid, boss 6 both, The Sealed Note |
| W4 day | 42 | W4, W4 mid, boss 4 both, prologue |
| W2 day | 41 | W2, W2 mid, boss 2 both, finale |
| W1 storm | 30 | prologue (the chase) |
| W9 dusk | 30 | W9, W9 mid, boss 9 both |
| W3 night | 28 | W3, W3 mid, boss 3 both |
| W5 day | 22 | W5, boss 5 both |
| W9 night | 18 | The Open Gates |
| W5 dusk 13, W7 day 11, W5 glow 10, W6 day 9, W1 dusk 8, W7 dusk 8, W3 glow 8, W3 storm 8, W10 day 7, W10 dusk 5, others 1-2 | | |

Only 3 story panels use a following camera (`follow`), so a still plate can stand behind almost every scenery panel.

## Ranked list

### Weakest panels

1. **W1 day, upright** (81 panels): the canopy above Pokey is a pale soft blur; reads as a loading screen. `contact-up-00` pro#6, w1#6-24.
2. **W8 night** (81): a flat grey-blue field with a flat code-looking moon disc; the cast are small and muddy. `contact-up-01` w8#*.
3. **W10 storm** (55): murky purple-grey, the castle a smear, rain over mud. `contact-up-01` w10#*, `contact-up-02` bi10/bd10.
4. **W6 dusk** (47): brown on brown; the mangrove roots read as scribbles. `contact-up-01` mid6#*.
5. **W3 night** (28): the glowworm threads draw as rows of dots that look like falling computer code. `contact-up-00` w3#0, mid3#0, mem-horn#0.
6. **W2 day** (41): sideways, the river is a flat light-blue band with a hard edge (drawn, not painted: polish bar 5b.1). `contact-side-00` w2#0.
7. **W4 day** (42): the waterfall is a flat grey rectangle; the cliffs are soft. `contact-up-00` w4#*, `contact-up-02` bi4/bd4.
8. **W9 dusk** (30): the volcano is soft; the lava lines are thin code strokes. `contact-up-02` mid9#*.
9. **W1 storm** (30, the prologue chase): dim and hazy; the storm has no weight.
10. **W5 day / dusk** (35): orchids fine sideways, but upright a blown-up soft leaf wall.

### Made and never used (STAGE-RULES §4 "use all the art")

- `plates/gorge.webp` (Pokey hanging from the vine over the mist, Dot pulling his claw): painted for the W4 opening, **never wired**.
  Its beat, W4 panel 0 "The vine held. Pokey hung from the end of it...", today shows the W4 scenery with no Pokey visible at all
  (`contact-up-00` w4#0). **A missing picture.**
- `plates/raft.webp` (the village building the raft): painted for W2 mid panel 0 "The village had promised Pokey a raft..." and panel 12
  "a sloth carefully fitted the first log". Never wired.
- `plates/council.webp` (the council fire) and `live/council.webp`, **the only moving plate in the game: neither is used by any story.**
  So today no cutscene moves at all.

### Plates that would gain most from gentle motion (a Wan clip of the plate, only the moving parts kept over the sharp painting, as `livePlates.ts` already does)

| Plate | Panels | What moves |
|---|---|---|
| courtyard | 56 | rain, the storm clouds turning, the lit window |
| W10 storm (new) | 55 | rain, clouds, a lightning flicker |
| W4 day (new) | 42 | the waterfall, mist |
| W2 day (new) | 41 | the river |
| W8 night (new) | 81 | fireflies, leaves |
| W9 dusk (new) | 30 | lava glow, embers, smoke |
| tea | 20 | the web chandeliers swaying, candle light |
| nest-night / nest-storm | 15 | rain, the swirling sky, lightning |
| gates | 13 | rain, the green lights, lightning |
| drake-cave | 14 | the lava crack's glow |
| W3 night (new) | 28 | glowworms |
| cell / door / warroom | 41 | lamp and lantern flicker |
| council (wire it) | - | fire, fireflies (clip already made) |

### Missing beats

- W4 opening (above): Pokey hanging over the gorge has no picture. Fix: wire `gorge` (free).
- W2 mid: the raft is told, never shown. Fix: wire `raft` (free).
- No panel cuts to plain text with no picture: the dark frames in the contact sheets are the chapter title cards (2.6 s) and the
  closing card, as designed.

## Plan and cost (cap $28; rtx-pro-6000 ~$2.75/h; from the logs: a Qwen still ~$0.03-0.05, a Wan clip ~$0.20-0.45)

1. **Wire the three unused plates** (gorge, raft, council with its live clip): $0.
2. **One batch of world story plates**, same style sheet: each start is the game's own story scenery for that world and mood, rendered
   at the plate shape with nobody in it, repainted img2img with the style model (2 strengths x 2 seeds, 2560 x 2720 like the other
   plates, the floor kept where the cast stand). So each plate is the same place the player just played, painted like the plates
   that already work. Tier 1 (9 plates: W1 day, W8 night, W10 storm, W6 dusk, W4 day, W2 day, W1 storm, W9 dusk, W3 night) ~$4.5;
   tier 2 (W5 day, W5 dusk, W9 night, W7 day, W5 glow, W6 day, W1 dusk, W3 glow/storm, W10 day/dusk) ~$4.
   Wired by world and mood in `storyArt.ts` (a scenery panel with no plate of its own, no following camera and no castle gets its
   world's plate); no story text changes.
3. **One batch of motion clips** for ~12 plates in the table above (2 seeds each), cut to the moving parts only: ~$7.
4. Reserve for redos and anything the first pass shows: ~$6. **Planned total ~$21 of $28.**

Performance: a plate is one `drawImage` instead of several parallax layers, the set piece, the ground strip and the overlay, so the
scenery panels get cheaper. A moving plate adds two `drawImage` calls a frame from a sheet kept under ~25 MB decoded, two held at once
(`livePlates.ts` KEEP). Still fallback: the plate itself (`?clips=0`, and the frame governor's low step if it reaches the story).

Seen in passing (not in my scope, for the lead): `drawStoryScene` makes its vignette gradient every frame (PERFORMANCE-RULES §2.3);
the art-use gate `src/game/artUse.test.ts` and `tools/art/artuse.mjs` are not on this branch's base.
