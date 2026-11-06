# Kit audit: all 10 worlds against one checklist (art director, 2026-11-06)

The rule this serves (lead, from Matt's fear "a very creative World 1 and the rest of the game junk"): **level the floor before raising
the ceiling.** This is the floor, measured the same way in every world.

## How it was measured
- Real game frames, not the art sheets: `node tools/art/kitaudit/shoot.mjs <out> <stages>` (its own dev vite, `?layout=1&lessons=off`,
  Pokey pinned on solid platforms at 20/50/80% along the stage). Sideways 844x390 (3 spots) and upright 390x844 (middle spot), dsf 1.
  Contact sheets: `python3 tools/art/kitaudit/sheet.py`. Shot 8:38-8:57 AM ET 11-06 on this branch (art-director, from
  ccr-23292c36-550qmt).
- Stages: 1-1, 1-2, 1-5, 1-8, then x-2, x-5, x-8 for Worlds 2-10 (31 stages, 124 stills). Every sheet was looked at; the rough spots
  were cropped and zoomed (the `zoom-*.jpg` files).
- Also read: each world's kit atlas (`src/game/kitAtlasData.ts`, World 1's `protoAtlasData.ts` + `proto2AtlasData.ts`), montage in
  `kit-audit/kitsheets-0.jpg` (W1-W5) and `kitsheets-1.jpg` (W6-W10).
- **Harness artefact, not a game bug:** in most stills Pokey hangs a little above the ground. That is the pin (the frame is drawn
  between the pin and the physics step). Ignore his height; judge the scenery.
- **Limits:** 3 stages per world on the designed roll. A piece the world owns but that these rolls did not place is marked "not
  seen", which counts as a fail for the floor (a player on these stages does not see it either). Puzzle rooms, bosses and secrets
  were not shot.

## The checklist (one line each, the same for every world)
| # | Line |
|---|---|
| L1 | Standable floor: at least 3 painted kinds each of stone, stump, log (or the world's kin) |
| L2 | A hazard that clearly reads as dangerous, painted |
| L3 | Nothing harmless that reads as dangerous (spiky red plants on landing tops, skull/bone remains, barbs) |
| L4 | Hiding spots |
| L5 | Climbs |
| L6 | Vertical pieces in one picture (a wall or trunk), no stacked unrelated supports (a trunk on a plank) |
| L7 | Enough dressing, in front and behind |
| L8 | No flat code-drawn platforms, boxes, lines or see-through panes next to the painted art |
| L9 | Backdrop pieces don't read as standable |

## Game-wide findings first (they explain most fails)
1. **Every world's kit has ONE floor piece of each kind, and in Worlds 2-10 the "stump" and the "boulder" are the same picture.**
   Each kit sheet has the same 15 slots (liana, perch, wall, buttress, trunk, bankEnd, fill, snapL/R, bank, branchCreak, branch,
   stump, boulder, mossStrip); World 5 has only 8. In the W2-W10 sheets the stump and boulder slots hold two copies of one painting
   (see kitsheets-0/1: W2 two mounds, W3 two moss mounds, W4 two slate discs, W5 two orchid stumps, W6 and W8 two ring stumps, W7 two
   rocks, W9 two black boulders, W10 two rock piles). So the real count is 1 kind, not 3. **L1 fails in every world** except where a
   world's own set pieces add kinds (W6 6-8, a little W3 and W8). This is the single biggest floor gap and it is game-wide, so
   World 1 is not the outlier here: every world is thin.
2. **The same platform piece repeats until it reads as a pattern:** W2's river pillar 5 in a row (2-8), W7's carved slab, W9's grey
   slab, W10's iron grate (every platform in 10-2/10-5/10-8 is the one grate), W1/W5's branch.
3. **Code-drawn shapes on screen (L8):**
   - the **pit pocket**: a hard-edged see-through rectangle in the soil at the bottom of a gap (W1 1-1/1-2, W4 every gap, W5 5-5);
     `zoom-w1-pitpocket-pillarseam-redplants.jpg`, `zoom-w4-codeblock-pocket.jpg`;
   - **flat boxes**: W3's grey pedestal and dark teal box (3-2), W4's green-topped grey block (4-8), W5's grey stone box (5-5) and
     wooden crate (5-2); `zoom-w3-codeboxes.jpg`, `zoom-w5-codeboxes-pitpocket.jpg`;
   - **full-height straight lines** (poles or rails drawn as plain strokes): W7 7-8, W9 9-2/9-5, W10 all three stages, and a thin line
     across a W4 gap (4-8); `zoom-w7-lines-stacked-overlap.jpg`;
   - **flat water**: W2's water between pillars is a flat teal rectangle (2-2, 2-5, 2-8), next to W6's and W9's painted water/lava,
     which pass; `zoom-w1-strip-w2-flatwater.jpg`;
   - **see-through panes**: W4 4-2's rain-streak rectangle (upright), W8 8-5's rectangle over the backdrop, W7 7-5's temple wall laid
     half-transparent over the rock bank; `zoom-w8-cutbox-pane.jpg`;
   - **a square-cut strip**: 1-8's long platform is an earth strip cut square at both ends with a pink line under it.
4. **Red spiky plants on landing tops (L3):** the W1 branch piece carries a red bromeliad on its top, and W5 draws W1's branch, so
   1-1, 1-5, 5-2, 5-5, 5-8 all have red spikes where Pokey lands. W9's floor strip has red spiky flowers along every top (9-5, 9-8).
   W9 also shows **skulls in the soil** (9-8), against the lead's no-remains ruling (skulls and bones as soil dressing; a skull warning sign is allowed).
5. **Stacked supports (L6):** a vine pillar standing on a carved slab (7-8), a trunk under a branch (5-8), birch posts under planks
   and logs on posts (6-8), ladders standing on slabs and a dead trunk hanging with no base (9-2, 9-8), the 1-5 pillar that is earth
   bank on the left and root wall on the right with a seam down the middle.
6. **Backdrops that read as standable (L9):** 1-1's fallen-log pile at Pokey's floor height; W3's dark flat-topped rock shelves at
   Pokey's height (3-2); W4's grey mesas in the same colour and outline as the playable cliffs (every W4 still); W7's big stone
   blocks and paved floor behind the slabs; W9's lava ground at platform height; W10's rock ground under the floating grates. The
   fix for most is not new art: push the far layers back (less contrast, cooler, softer outline) so only the play layer has a hard
   dark outline. That is a code-and-tint job, free.
7. **Hazards are mostly animals with a red glow ring.** Painted ground hazards exist only as W3's thorn vine and carnivorous plant,
   W6's swamp and mud, W9's lava, W10's spike rods. No world has a painted thorn bramble (W1-09 on Matt's list is the first).
8. **World 5 draws World 1's soil and World 1's branch** (its kit has no branch, log, liana or perch), so the orchid garden stands on
   the home forest's ground with the home forest's red-topped branches.

## Per world

Legend: PASS, PART (partly), FAIL, "not seen" (counts as fail for the floor).

### World 1, Home Forest (1-1, 1-2, 1-5, 1-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| FAIL: earth bank + one branch-log; atlas has 1 log, 1 stump, 1 boulder | FAIL: snake only, no painted hazard | FAIL: red bromeliads on branch tops | PART: bushes + hollow exist (props2), not seen in these 4 | PASS: hanging vine 1-8 | FAIL: 1-5 two-texture pillar | PASS: richest dressing in the game | FAIL: pit pockets, 1-8 square strip | FAIL: 1-1 log pile, canopy tables |

Biggest gaps: (1) floor kinds (stones, stumps, logs); (2) a painted thorn hazard and no harmless red spikes; (3) one-piece vertical walls.
Stills: `1-1.jpg`, `1-2.jpg`, `1-5.jpg`, `1-8.jpg`, `upright-0.jpg`.

### World 2, River and village (2-2, 2-5, 2-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| FAIL: one pillar, repeated; kit planks not seen | PART: water is the hazard but flat; turtles with glow | PASS | FAIL: not seen | FAIL: not seen (kit has liana, rope) | not seen | PASS: reeds, huts, cages | FAIL: flat teal water, 2-5 inset blocks | PASS |

Biggest gaps: (1) painted water (W2's own painted river exists elsewhere in the game: reuse it here first); (2) floor kinds: docks, rafts,
stepping stones (W2-01, 03, 04 on Matt's list); (3) the pillar repeat. Stills: `2-2.jpg`, `2-5.jpg`, `2-8.jpg`.

### World 3, Mossy Grotto (3-2, 3-5, 3-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| PART: bank, pillar, moss boulder (stump = boulder picture) | PASS: thorn vine, biting plant | FAIL-likely: spiky stalagmites on the walk line read as spikes | FAIL: not seen | PART: vine-wrapped column | PASS | PASS | FAIL: grey pedestal, teal box | FAIL: rock shelves at Pokey's height |

Also: **light**. The ground is pale and evenly bright in a cave (STAGE-RULES §4 wants dark ambient, light from sources).
Biggest gaps: (1) the code boxes; (2) darker play layer and pushed-back shelves; (3) floor kinds. Matt's sheet 37 (grey stone wall kit)
is filed for W3. Stills: `3-2.jpg`, `3-5.jpg`, `3-8.jpg`.

### World 4, Cliffs and falls (4-2, 4-5, 4-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| FAIL: cliff bank + slate disc | FAIL: pits only, no painted hazard | PASS | FAIL | PASS: trunk climb, rope swing | PASS: cliffs are one piece | PART: thin | FAIL: pit pockets everywhere, block, rain pane, gap line | FAIL: mesas match the cliffs |

Biggest gaps: (1) the backdrop mesas (worst L9 in the game: you can't tell floor from far rock); (2) pit pockets; (3) floor kinds and a
hazard. Stills: `4-2.jpg`, `4-5.jpg`, `4-8.jpg`.

### World 5, Orchid garden (5-2, 5-5, 5-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| FAIL: W1 soil + W1 branch; own kit 8 slots | FAIL: not seen | FAIL: W1's red bromeliads | FAIL | FAIL: not seen | FAIL: trunk under branch 5-8 | PASS: bench, teapot, birdbath, pots | FAIL: stone box, crate, pockets | PASS |

Biggest gaps: (1) its own floor (W5 is the thinnest kit: no branch, log, liana, perch); (2) the borrowed red-topped branch; (3) the code
boxes. Stills: `5-2.jpg`, `5-5.jpg`, `5-8.jpg`.

### World 6, Swamp (6-2, 6-5, 6-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| PART: 6-8 has logs, stumps, planks, posts; 6-2/6-5 one root bank | PASS: painted swamp, mud | PASS | PASS: tall bushes | PASS: ropes | FAIL: 6-8 posts under planks, logs on posts | PASS | PASS | PASS |

The best floor outside World 1. Gaps: (1) 6-8's stacked scaffold; (2) the same log tiled three times end to end; (3) the ground stages
are one bank kind. Stills: `6-2.jpg`, `6-5.jpg`, `6-8.jpg`.

### World 7, Temple (7-2, 7-5, 7-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| FAIL: one carved slab, repeated | FAIL: animals only | PASS | FAIL | PART | FAIL: vine pillar on a slab | PASS | FAIL: straight lines, half-transparent wall | FAIL: stone blocks, paved floor |

Biggest gaps: (1) backdrop vs play layer; (2) floor kinds (rubble blocks, fallen columns, root-split slabs); (3) the lines and stacking.
Stills: `7-2.jpg`, `7-5.jpg`, `7-8.jpg`.

### World 8, Night canopy (8-2, 8-5, 8-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| PART: cliff bank + small logs/stumps (8-8) | FAIL: animals only | PASS | not seen | PASS: lianas | PASS | PASS | FAIL: 8-5 pane; 8-2 cut box (minor) | PASS |

Gaps: (1) a painted hazard; (2) floor kinds on 8-2/8-5; (3) the pane. Stills: `8-2.jpg`, `8-5.jpg`, `8-8.jpg`.

### World 9, Volcano (9-2, 9-5, 9-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| FAIL: basalt bank + one slab | PASS: painted lava | FAIL: red spiky flowers on every top; skulls | FAIL | PART: ladders | FAIL: ladders on slabs, baseless trunk | PASS | FAIL: grey poles | FAIL: lava ground at platform height |

Biggest gaps: (1) red spikes and skulls off the walk line; (2) poles and stacking; (3) floor kinds. Stills: `9-2.jpg`, `9-5.jpg`, `9-8.jpg`.

### World 10, Storm fortress (10-2, 10-5, 10-8)
| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 |
|---|---|---|---|---|---|---|---|---|
| FAIL: one iron grate, every platform | PART: spike rods (thin, drawn-looking), animals | PASS | FAIL | PASS: painted chain | not seen | FAIL: thin | FAIL: grey poles on every stage | FAIL: rock ground under the grates |

Biggest gaps: (1) the grate monoculture (the most repeated piece in the game); (2) poles; (3) backdrop ground. Stills: `10-2.jpg`,
`10-5.jpg`, `10-8.jpg`, `upright-3.jpg`.

### Upright (portrait)
`upright-0..3.jpg`. Upright frames show the same faults; nothing new except 4-2's rain pane, and in 9-2 and 10-x the bottom third is
an empty dark band (framing, not art; for the engine lane).

## Ranking (worst floor first) and the order I'd fix it
W10, W5, W7, W9, W4, W2, W1, W3, W8, W6. World 1 is mid-table, not top: its dressing is the best, its floor is as thin as anyone's.

**Phase A, free, no new art (code; engine/designer lanes, my stills as proof):**
1. Remove the pit-pocket see-through rectangles, the code boxes, the straight lines and the panes (L8), or swap each for a painted
   piece the world already owns (W10 and W2 kits have chains, posts and lianas; W2's painted river exists).
2. Keep red spiky plants and skulls off landing tops and the walk line (L3): a dressing rule plus a gate (no red-spike dressing within
   N px of a platform top).
3. Push backdrops back (L9): lower contrast, cooler and softer on the far and mid layers in W3, W4, W7, W9, W10 and 1-1's log pile.
4. A kin rule for supports (L6, the lead's art-rule row): no trunk on a plank; the gate already planned with engine-core.

**Phase B, Matt's Gemini sheets (free; his time):** per world, the same four asks, using the master prompt in
`reference/art-incoming/ART-REQUEST-LIST.md`: 3 floor kinds (S), a painted hazard (L), a hiding spot (S), a one-piece wall or trunk
(T). World 1's list (W1-01..26) already exists and his batches 2-6 cover much of it (Job 2 cuts them). Worlds 2-10 need the same list;
I'll draft it after Job 2 unless the lead wants it first.

**Phase C, Hugging Face (needs the lead's written OK; nothing spent):**
| Use | Est. | Why HF, not Gemini |
|---|---|---|
| Upscale Gemini keepers that are too small (batch 1 sheets 01-06 and sheet 10, ~120-250 px pieces) | ~$3-5 | Gemini re-rolls cost Matt time; an upscale is cents a piece |
| Re-tint a piece per world by kin where a code tint looks wrong (only if Phase A tinting fails) | ~$5-10 | keeps one shape, a new world palette |
| Backdrop far/mid layer repaints for W4 mesas and W7 floor, only if Phase A's push-back fails | ~$20 | 4-layer backdrops are HF work (Matt's own note: no Gemini backgrounds) |
| Held for gaps Gemini can't do | ~$20 | |
| Reserve (kept back) | $15 | |
Total about $70. Proposed spend now: **$0**. Phase A first; HF only after a stamped greybox and real stills (STUDIO-PRACTICE copy point 3).

## Polish check (on this report itself)
- Every still is a real game frame from this branch, at phone size, both orientations: yes (124, contact sheets in `kit-audit/`).
- Every "FAIL" names the stage and a still; the worst ones have a zoomed crop: yes (7 zooms).
- Rough spots I could not settle from 3 stages are marked "not seen" or "likely", not passed: yes.
- Not covered: puzzle rooms, bosses, secrets, other rolls. Pokey's float in the stills is the harness pin (named above), not a game bug.

## Method update
- The perf harness's pin rule (`tools/perf/run.mjs`) gives fair, repeatable spots in any stage in about 20 s a still; reused as
  `tools/art/kitaudit/shoot.mjs`. Better than playing to a spot by hand.
- Better next time: pin Pokey at the platform top after the physics step so he stands on the ground in stills; and shoot 2 rolls per
  stage. Reading the kit atlas keys first (kitAtlasData.ts) found the game-wide stump = boulder fact in seconds, before any still.
