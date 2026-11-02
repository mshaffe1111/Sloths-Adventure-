# Backdrop audit, Worlds 1-10 (hf-backdrops, 2026-10-31)

Shots: every world in play at stages 2, 5 and 8 (one per light), upright 390x844 and sideways 844x390, Pokey placed 45% along
(`tools/art/hfbackdrops/audit.mjs`). Contact sheets: `audit/w1.jpg` to `audit/w10.jpg` (top row upright, bottom row sideways),
every middle strip `audit/all-mid-strips.jpg`, every near strip `audit/all-near-strips.jpg`.

## What the game has now

| World | Far moods (sky + distance) | Middle strips | Near strips |
|---|---|---|---|
| 1 | sunrise, own, kapok (+ canopy set for 1-8 / ascents) | 1 (+ canopy) | 1 (+ canopy) |
| 2 | own, rapids, evening | 1 | 1 |
| 3 | own, sinkhole, cavern | 1 | 1 |
| 4 | terraces, own, mist | 1 | 1 |
| 5 | six full sets (gold x2, dusk x2, twilight x2) + night | 7 | 7 |
| 6 | dawn, own, dusk | 1 | 1 |
| 7 | **own only** (dawn and dusk painted 2026-10-29, never set in) | 1 | 1 |
| 8 | **own only** (sunset and night painted, never set in) | 1 | 1 |
| 9 | **own only** (dawn and night painted, never set in) | 1 | 1 |
| 10 | **own only** (dusk and after-storm painted, never set in) | 1 | 1 |

So outside World 5, every stage of a world plays in front of the same middle and near strip: only the sky changes, and in Worlds 7-10
not even that.

## Ranked list (worst first), with cost

| # | Problem | Where | Fix | Cost |
|---|---|---|---|---|
| 1 | Every stage of the world looks the same behind: two painted far moods each sit unused | W7, W8, W9, W10 | Set them in `stageBackdrops.ts` by each world's story light (W7 dawn 1-3 / dusk 7-9; W8 sunset 1-2 / night 7-9; W9 dawn 1-3 / night 7-9; W10 dusk 1-3 / after the storm 7-9). Mock: `w7to10-moods-before-after.jpg` | $0 |
| 2 | One middle strip per world: the same trees / huts / ruins / crags behind all 9 stages, whatever the sky does | W1-4, W6-10 | A new middle strip for each of the world's two other moods, painted in that light (img2img from a paste-up of the world's own strip, so the paint matches; new landmarks), every crown whole | ~$0.40 a strip incl. retries; 18 strips ~$7.50 |
| 3 | Upright: the middle strip's trees run off its top and fade along a straight line (a visible cut across the canopy) | W1 (1-2, 1-5), W1 canopy (1-8), W6, W7, W3 | New strips are painted with whole crowns (no fade needed). The five old ones: repaint their top quarter round (crowns finished) | ~$1.50 |
| 4 | One near strip per world: the same foreground band in every stage | W1-4, W6-10 | A new near strip per mood with the middle strips | ~$0.30 a strip; 18 ~$5.50 |
| 5 | Visible repeat: the gold middle strip is one orchid tree painted four times, two at once on a sideways screen | W5 (5-1 to 5-3) | One new gold middle strip with different trees | ~$0.50 |
| 6 | Upright sky missing above 11 far sets (the plain stand-in gradient shows above them) | w1sunrise, w1kapok, w3sinkhole, w6dawn, w7, w7dawn, w7dusk, w10after, w5dusk2, w5twi1, w5twi2 | Paint the skies (tallstart way, the round that passed in X-16) | ~$2 |
| 7 | Very dark and empty upright: little but black above Pokey | W3 (3-2, 3-5) | Covered by #2: the new cave middle strip carries its own light (glowworm curtains, glowing fungus) per STAGE-RULES §4 | in #2 |
| 8 | Sky and weather clash: 10-7 to 10-9 under the clearing gold sky still have rain falling | W10 | The rain is World 10's code (its helper's). Ask the W10 helper to end the rain with the storm, or keep 10-7..9 on the storm sky | $0 |
| 9 | 2-5 (rapids) upright: a hard band where the far strip meets its sky | W2 | Sky join repaint with #6 | in #6 |
| 10 | Middle strips sparse and flat, read as a few lumps | W9, W10 | Covered by #2 (more landmarks per strip) | in #2 |

Not a problem: no strip is blurry at phone size any more (X-16 put every strip at native resolution); no seam showed in any shot.

## The $28 plan

| Batch | What | Est. |
|---|---|---|
| 0 | Pilots (done, ~$0.55): text to image thrown (no key kept), img2img from paste-ups works (`mock-7-8-before-after.jpg`) | $0.55 |
| A | 18 new middle strips (2 per world, W1-4 and W6-10), one GPU job, 2 strengths x 2 seeds, then the native-resolution pass (striphdgpu s25) and `tools/art/edges` | $7.50 |
| B | 18 new near strips to go with them, same job way | $5.50 |
| C | Crown tops for the five old middle strips + a new W5 gold middle strip | $2 |
| D | The 11 missing skies | $2 |
| E | Retries of anything that fails review | $5 |
| | Reserve | $5.50 |

Wiring: each new mood becomes a full set (`w7dusk-far/-mid/-near`), picked per stage by `FAR_BY_STAGE` as now, so neighbouring
stages differ; no new layer, no new draw call (a set swaps its strips, it does not add any); at most two sets per world stay decoded
(`SETS_PER_WORLD`), so memory stays where it is.

## Mock stills

- `w7to10-moods-before-after.jpg`: item 1, Worlds 7-10 at stages 2 and 8 before and after the unused moods are set in (real game shots).
- `mock-7-8-before-after.jpg`: items 1 + 2 on 7-8: today, then the dusk sky, then the dusk sky plus a new dusk ruins middle strip
  (a pilot take, cut through `tools/art/edges`, graded to the far strip with `haze.py`; its loose root near the top is what the
  grounded-only starts fix).
- `audit/w*.jpg`: the before of every other item.
