# hf-backdrops: where it stands (2026-10-31, 9:30 PM ET cutoff)

Branch `hf-backdrops`. HF spend so far: **~$5.60 of $40** (log: `tools/art/hfbackdrops/jobs.txt`).

## Done tonight (finished, wired, checked)

1. **Worlds 7-10 moods set in** (`src/game/stageBackdrops.ts`, $0): W7 dawn 7-1..3 / dusk 7-7..9; W8 sunset 8-1..2 / night 8-7..9;
   W9 dawn 9-1..3 / night 9-7..9; W10 dusk 10-1..3. Stage 10 (lairs) and the stages in between keep the world's own set.
   Before/after: `w7to10-moods-before-after.jpg`.
2. **24 new middle and near strips** (the far moods now carry their own middle and/or near strip, painted in that light):

   | World | Set | Middle | Near |
   |---|---|---|---|
   | 1 | sunrise (1-1..3) | new | new |
   | 1 | kapok (1-7..9) | new | new |
   | 2 | rapids (2-4..6) | new | world's own |
   | 2 | evening (2-7..9) | new | world's own |
   | 3 | cavern (3-6..9) | new (lit glowworm curtains, fungus) | new |
   | 4 | terraces (4-1..3) | new | world's own |
   | 4 | mist (4-7..9) | new | new |
   | 6 | dusk (6-7..9) | new | new |
   | 7 | dawn (7-1..3) | new | new |
   | 7 | dusk (7-7..9) | new | new |
   | 8 | sunset (8-1..2) | world's own | new |
   | 8 | night (8-7..9) | world's own | new |
   | 9 | dawn (9-1..3) | world's own | new |
   | 9 | night (9-7..9) | new | new |
   | 10 | dusk (10-1..3) | new | new |

   How: `tools/art/hfbackdrops/` (`starts.py` paste-ups of the world's own strip on magenta; `make_spec.py batch` img2img with the
   style model, s60/s66 x 2 seeds; `process.py key|keyfull` key + seamless join; `process.py hdspec` the native-resolution pass;
   `process.py finish` cut2 + `tools/art/edges/defringe.py` (ink, middle top 7% faded) + `haze.py` into the far strip's light).
   Sizes: middle 2076-2113 x 1302, near 2803-2902 x 1736, all under 250 KB.
   After shots 412x915 / 915x412: `after-review-w1to6.jpg`, `after-review-w7to10.jpg`, per stage `after/<stage>.jpg`.

## Left (the plan for the rest of the $40, ~$34)

**Redo the rejects with better starts (~$3):** every W8 middle (the old strip's flat faded canopy came back as a hard band: cut the
canopy band off the start and let the repaint finish round crowns, s70+), W2 near x2 (pink river water from the key: key on green, or
mask the water band out of the start), W4 terraces near and W6 dawn near (squared notches where paste-up pieces met: overlap and
feather the pieces in `starts.py`), W3 sinkhole middle+near (a straight cut down a pillar: same fix), W6 dawn and W9 dawn middles.
Starts also need to fill the full width (some came out 1272-1650 px wide; `keyfull` saved them tonight at 1792).

**Third and fourth moods (~$18), so every world has 4+ sets and no two neighbouring stages share one.** Each a full set: far
(text to image works for the opaque far strip, 1792x768 then the native pass to 2640x1302) + sky (tallstart way) + middle + near:
- W1 rain-soaked afternoon (1-4..6 now the world's own); W2 misty dawn on the river; W3 crystal grotto; W4 storm on the cliffs;
  W5 already has 7; W6 moonlit swamp; W7 temple interior courtyard at noon; W8 dawn over the canopy; W9 ash storm; W10 summit night.
- Then split each world's runs so neighbours differ: e.g. 1-1 sunrise, 1-2 own, 1-3 sunrise, ... (`FAR_BY_STAGE` is a per-stage table).

**Fixes (~$4):**
- Crown tops for the five old middle strips that run off their top (w1, w1c, w3, w6, w7): repaint the top quarter round.
- New W5 gold middle strip (the old one is one orchid tree four times).
- The 11 far sets with no painted sky upright (w1sunrise, w1kapok, w3sinkhole, w6dawn, w7, w7dawn, w7dusk, w10after, w5dusk2,
  w5twi1, w5twi2): the X-16 tallstart way.

**Question for the World 10 helper:** does the rain end with the storm? Then `w10after` (the clearing gold sky, painted, plus its
middle and near takes already made: `hfbackdrops/batch/props/w10after-*`) goes on 10-7..10-9. Until then it stays unused.

**Polish notes found tonight:** W1 sunrise/kapok middle strips keep a soft faded top on some crowns (from the old strip's fade);
reads as morning mist in play but should be redone with the crown-top fix. W2 evening middle is quite washed out by the haze grade
(haze 0.18): try 0.1 for that set.
