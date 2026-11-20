# NEEDS-W2W3: what the next levels' players SEE vs what the inventory has (ART-NEXT, R-165.342)
Written 3:32 PM ET 11-20 (`TZ=America/New_York date`). Base origin/main 6e7b85f8f. Sources: the designs on origin/t-design-26 (2-6..2-8),
t-design-29 (2-9), t-design-31-32, t-design-33-35, t-design-36-39 (3-1..3-9, 3-hidden): each design's own **Art** paragraph, grepped;
src/game/art/inventory/w1..w10.json + cast.json (every row, by id); KIT-AUDIT.md World 2/3; WORLD-3-PLAN.md §3 (origin/t-plan-w3).
Off-main art counted: ART-W2B (origin/t-art-w2b c877623e2: 2-6's noria, buckets dry/spilling, millrace lip) and ART-W2A
(origin/t-art-w2a 4f664fde3: the little ones' waddle/paddle/hide, the heron's look). Pokey = 89.1 px drawn (heroSprite.ts:30,32; D41).
Look checks: contact sheets at Pokey scale (yellow bar = Pokey), scratch only; the batch's takes sheet is the record.

**HAVE** = a World 2/3 row fits (world, footing, scale). **REUSE** = another world's row fits by look and its `worlds` (named). **GAP** =
nothing painted fits. "check" = fits by the catalog; the level builder's stills in the stage's own light decide (D65).

## World 2
| Stage | Piece the player sees | Verdict | Row / note | Batch |
|---|---|---|---|---|
| 2-6 | noria wheel, buckets (dry + spilling), millrace lip | HAVE (off main) | ART-W2B: src/assets/props/w2-wheel.webp, 5 catalog rows part W2B | - |
| 2-6 | streets: doors, roofs, porches, steps; raft | HAVE | w2-props#door/doorRoof (ok), #porch/#steps (platform, scale 1.46/1.23 NOT ok: check), puzzle-kit#raft (0.79 ok) | - |
| 2-6..2-9 | logs, pads, stones, bounce | HAVE | 2-1..2-5's kit (w2-1115 pads, w2-new#stone-a/b/c, w2#boulder 0.83 ok, the bamboo bounce) | - |
| 2-7 | the mail boat: punt + the mailman at the oar, 2 rowing frames | GAP | hull REUSE dressnew-w2#w2Canoe (0.95 ok, has an oar); the mailman exists only as story cels (cels-4#po.*), no rower | **1** |
| 2-7 | letter + reply envelope pickups (~28 px, flutter x2) | GAP | cels-3#gv.letter is a story cel, not a pickup | **1** |
| 2-7 | an OPEN state of w2-props#door | GAP | puzzle-kit#nestDoorOpen is a log nest, another look | **1** |
| 2-7 | the weir: a stepped stone face with white water | GAP | no weir/cascade row in any world | **1** |
| 2-7 | post-office jetty; stilt porches | HAVE, check | w2-props#jetty (560x300, 1.32 NOT ok, never drawn), w2-props#porch; W6 stilt-deck-ledge (REUSE, 1.12 NOT ok) | - |
| 2-8 | cages (shut/lifted), steps, porch; the little ones' Happy/Sad; walk/paddle | HAVE | w2-props#cageA/B/C, puzzle-kit#cageShut/cageLifted, w2-props#otterHappy/otterSad, ART-W2A frames | - |
| 2-8 | a little one sitting in the reeds, waiting | HAVE | w2-props#otterSad (0.79 ok) behind w2-props#reedTall (in front): no new pose | - |
| 2-8 | the deep marsh water | HAVE | World 2's painted river (riverLay's water) | - |
| 2-8 | a flood line on the reeds (wet mark) | GAP (small) | w2-props#reedTall/reedLean are dry; an edit of them | **1** |
| 2-9 | **the King's Barge** (384-390 px, flat standable deck at a log's height, croc prow, reed canopy, gold + teal) | GAP | w2Canoe is a rowboat 0.95 Pokey; no barge | **1** |
| 2-9 | the court bell on its arch, still + swung | HAVE | puzzle-kit#bellFrame + #bell (73x100, 0.9 ok) + #bellRing; the swing is the painted bell turned (a code touch) | - |
| 2-9 | the throne island far off at dusk (throne of roots, log drum, croc tail, lanterns) | GAP (backdrop, lead's call) | w2-props#throne (1.46 ok) is a near prop; no far layer | 7 |
| 2-9 | snappers, the court's logs/stones | HAVE | 2-5's snapper (w2Cast), the kit above | - |

## World 3
| Stage | Piece the player sees | Verdict | Row / note | Batch |
|---|---|---|---|---|
| all | grotto stone shelves to stand on | HAVE | w3-new#shelf-long (582x178, 0.75 ok), #shelf-short (348x168, 0.71 ok): never in the build yet | - |
| all | a small shelf (120 px, 3-1's drops) and the floor lip (PLAN-W3: "every stage") | GAP | the two shelves are the only W3 shelves at scale; w3-props#ledge 1.04 NOT ok, #rim is a basin | **2** |
| all | stepping stone / tuff block | HAVE | w3-new#stone-a (0.83 ok, glowing seam), w2#boulder (W3 in worlds, 0.83 ok) | - |
| 3-1 | lit rims S/M/L (the dark rule: every edge carries its light) | GAP | no lit-edge shelf; shelves are evenly lit | **2** |
| 3-1 | a soft fungus mat at Pokey's scale | GAP | w1-fungus-shelf-big: scale NOT ok, "needs fix" | **2** |
| 3-1 | a sleepy-mushroom shelf | GAP | w3-props#mushrooms is dressing (no walk line) | **2** |
| 3-1 | bounce cap; thorn bed; spore cloud; glow caps; glowworms | HAVE / REUSE | bounce#cap-w3 (ok); w1-thorn-bramble-a/b (best W3, unscored: check); w3-new#spore-0..2; w3-props#glowLit/Dim, #glowSleep0, #glowHang0-2 | - |
| 3-1 | the climb (root curtain) | HAVE | w3-props#rootLadder (W3, 1.46 ok, never drawn); w1-vine-column-a/b FAIL ("needs fix", 81 px wide) | - |
| 3-1 | the glowworm sky | GAP (backdrop, lead's call) | w3-props#glowWave0-3 tiled is the fallback | 7 |
| 3-2 | the roof root + its ends | HAVE / REUSE, check | the vine rope look (castArt.ts vineTile) + game/w7/vine-anchors#anchor-1..4 (W7, 1.15 ok); a grotto root-in-rock end only if the anchors read wrong in the dark | 3 (conditional) |
| 3-2 | ferns, moss curtain, glowworm patches; the ocelot | HAVE | w3-props#fern/fernRustle/mossCurtain; ocelot-anim (walk, leap, land, gather, hurt, dazed) | - |
| 3-3 | chime stone, mushroom patch, pawprints, prowler eyes | HAVE | w3-props#stalactite, #mushrooms, #pawprint/#pawStrip, #catEyes | - |
| 3-3 | the ocelot's yawn + pad-home (sleepy, not scared) | GAP | ocelot-anim has walk/leap/land/gather/hurt/dazed only | 4 |
| 3-3 | the grandfather puffball (rest, swell, FLOOMP) | GAP | no puffball row | 4 |
| 3-4 | ledges, root columns, bounce, glowworms, eyes | HAVE | w3-new shelves/stone-a, w3-props#rootLadder, hf678/w17-moss-liana (W1/W3 climb, unscored), bounce#cap-w3 | - |
| 3-4 | taller root columns for the sinkhole shaft (2-4 Pokey) | GAP | rootLadder is one 1.46-Pokey piece: tiling it repeats (polish bar 2) | 3 |
| 3-4 | sinkhole wall stone | GAP | no grotto wall piece (flume-cave#wallL/R are W7 timber) | 3 |
| 3-4 | the moonflower STEP: bud, open cup (walk top 120 px), drooping | GAP | meeca-night#moonBud/#moonOpen are dressing, no walk line | 5 |
| 3-4 | the moonbeam shaft (painted, additive) | GAP | flume-cave#beam is a W7 backdrop (2.37), timber; no soft shaft | 6 |
| 3-4 | the moon over the mouth | GAP (backdrop, lead's call) | - | 7 |
| 3-5 | the vines (sleeping/waking buds), moss carpets, roots, ledges, loose rock | HAVE | w3-props#thorn0..15 (never drawn), hf678/w17-moss-carpet/#w17-moss-patch, w3-new#stone-a | - |
| 3-5 | the oldest vine: one great eye, open + shut, ~3 Pokey | GAP | thorn frames x2 only if they hold up (lead's call); an edit of thorn0 | 4 |
| 3-5 | a GLOWING moss carpet, soft, unlike the floor moss | GAP | the W1/W3 moss carpets are daylight green | 5 |
| 3-5 | the sound ripple: a dust-and-spore puff (not a code ring) | GAP | w3-new#spore-0..2 is a cloud, not a ring-out puff | 6 |
| 3-6 | the cap to carry, patch, marked fern, glowworm roof, carry poses | HAVE | puzzle-kit#mushroom/#mushroomDim (0.59 ok), w3-props#mushrooms/glowLit, puzzle-kit#fernStone, pokey-carry | - |
| 3-6 | Grandma's lamp: a hollow giant glow cap in the wall, dark + lit | GAP | w3-new#root-basket (0.67 ok) alone does not read as "her lamp" | 5 |
| 3-6 | light-only ledges with a lit edge | covered by batch 2's lit rims | w3-props#ledge (NOT ok scale) | 2 |
| 3-7 | ferns, eyes, moss, shelves, the root | HAVE | w3-props#fern/fernRustle, stage-art#fern, #catEyes, #mossCurtain | - |
| 3-7 | the ARCH-SHAPED SHADOW on the grotto wall (painted) | GAP | w1-rock-arch / w1-hide-rock-arch-low (W3 best, 1.35 ok) are the crack, not the shadow | 6 |
| 3-7 | the golden guarana (the hidden find) | GAP | the hf1113 fruits have no guarana | 5 |
| 3-8 | the HOLDABLE thorn vine as a liana: asleep / stirring (one amber eye) / looking (thorns up) | GAP | w3#liana ("needs fix: cut off") + thorn buds do not read as a rope | 4 |
| 3-8 | lianas, fungus shelf/mat, lake glow, roof root | HAVE / batch 2 | props-atlas#liana (1.68), w3-props#glowHang0-2; the mat from batch 2 | - |
| 3-9 | ring stones, signs, everything from 3-1..3-8 | HAVE | w3-props#ringWall/#pillar/#pillarCracked (ok), #pawprint/#catEyes/#bones | - |
| 3-9 | the shrine steps in moonlight (the ending picture) | GAP (backdrop, lead's call) | - | 7 |
| hidden | raft, W3 water, rocks, glowworms, curtains | HAVE / REUSE | puzzle-kit#raft (0.79 ok), props/pitwater/w3.webp, w2#boulder, w3-props#glowHang/#mossCurtain, flume-props#glowworms | - |
| hidden | a grotto stone jetty | GAP | w2-props#jetty is timber (W2) | 5 |
| hidden | the dome (the reward picture) | GAP (backdrop, lead's call) | - | 7 |

**KIT-AUDIT World 3 (11-06), still open:** (1) the code-drawn grey pedestal and teal box were on the OLD generated 3-2, which the new
3-2 design replaces: no paint for it (D40); the new stages lay from the painted shelves above. (2) Dark flat-topped backdrop shelves at
Pokey's height (L9): a code-and-tint push-back of the far layers (KIT-AUDIT Phase A item 3), free, an engine/level job, not Hugging Face.
(3) Stalagmites on the walk line read as spikes (L3): a dressing rule for the level builders, no new art.

## Special stages: Worlds 2 and 3's hidden stages, puzzle rooms and bosses (Matt 11-20 3:52 PM: "Special stages and regular"; ART-NEXT-b)
Found by grep (D90): `git ls-tree` of every origin/t-design-*, origin/boss-design-* and origin/t-*-design branch for reference/design/
2-hidden / 3-hidden / 2-10 / 3-10 / boss files; WORLD-MAP.html (each world's hidden + boss); PREDATORS.md "The ten guardians"; the
designs' own "replaces" lines; w2Puzzles.test.ts / w3Puzzles.test.ts headers (the rooms in game today). 3-hidden (The Cave Slide) is in
the World 3 table above (DESIGN-36-39). Bosses are hand-built fights, not gen2 stages: their art is in game.
| Stage | Piece the player sees | Verdict | Row / note | Batch |
|---|---|---|---|---|
| W2 hidden **The Rapids** | (WORLD-MAP: "a raft ride down white water"; INSPIRED-BY #6: a lily-pad raft that scrolls by itself) | **NO DESIGN YET** | no reference/design/2-hidden.md on any design branch (grep 11-20). The list below is provisional, for the designer; the real GAPs come from its design's Art paragraph | after its design |
| The Rapids | the raft | HAVE | puzzle-kit#raft (platform 0.79 ok), dressnew-w2#w2Raft (0.77 ok); a lily-pad raft: w2-props#lily (2-2's sinking pad) if the design keeps INSPIRED-BY's pad | - |
| The Rapids | the white-water river's backdrop | HAVE | B3-w2rapids-sky/far/mid/near (World 2's packed rapids set, in game) | - |
| The Rapids | rocks to dodge in the current | HAVE / check | w2#boulder (step 0.83 ok); World 2's brown rocks (origin/t-eng-rock w2-rocks.webp) | - |
| The Rapids | a drop over a ledge | HAVE (off main) | w2-next#weir (ART-NEXT-b, this branch: tiers + white water) | - |
| The Rapids | the white-water lane itself (foam, standing waves, a surface the raft rides) | likely GAP | World 2's shallow strip and pit water are calm; no foaming strip in any world. Not batched until designed (D40: nothing for a stage with no design) | after its design |
| W2 puzzle rooms | the rooms in game: 2-2's ferry raft + sluice, 2-3/2-8's reed cages on pulleys, 2-9's court bell and reed gate wall | HAVE (in game) | puzzle-kit#* + riverArt.ts cages (code-drawn reeds) + puzzlePlay.ts reed wall | - |
| W2 puzzle rooms | the NEW designs | **NONE DESIGNED** | 2-8's and 2-9's designs take their stages out of W2_PUZZLES ("replaces" lines; the old 2-2 room went with the hand-built 2-2, ENG-W2 11-14). No new room is designed for 2-6..2-9 | - |
| W3 puzzle rooms | the rooms in game: 3-2's glowing mushroom, 3-5's awake thorn vines + bell + pebbles, 3-7's "Which fern?" | HAVE (in game) | puzzle-kit#mushroom/#mushroomDim, #fernStone, w3-props#thorn0..15 | - |
| W3 puzzle rooms | the NEW designs | **NONE DESIGNED** as rooms; 3-6 lays a real kit room (the carried light) inside a stage | 3-2, 3-5, 3-7 leave W3_PUZZLES (their "replaces" lines); 3-6's pieces are in the World 3 table above (3-6 rows) | - |
| W2 boss **Crocus Rex** | the croc (all moves), his crest, the lair calm + rage, the foreground reeds, the story card | HAVE (in game) | enemies/croc-anim (117 frames) + croc-atlas (crest), lairs/lair-croc-calm, lair-croc-rage, fg-croc, story/cards/crocus-rex | - |
| Crocus Rex | the BIGGER guardian (PREDATORS.md: 270 x 600, 3.0 Pokey, long and low; headroom today 0.78: the art is already stretched) | GAP **if adopted** (the lead's call, then Matt's) | no boss design for 2-10 on any branch (PLAN-ROADMAP asks "hand-made? on gen2?"); new art at ~1.7x today's sheet res for every move frame: a big job (117 frames), not a Qwen edit batch | not batched |
| W3 boss **Shadow Prowler** | the jaguar (all moves), his crest, the lair, the story card | HAVE (in game) | enemies/prowler-anim (172 frames) + prowler-atlas (crest), lairs/prowler-lair (one plate: no calm/rage pair as Crocus Rex and Sky Sovereign have), story/cards/shadow-prowler | - |
| Shadow Prowler | the BIGGER guardian (PREDATORS.md: 270 x 640, 3.0 Pokey; headroom today 0.92) | GAP **if adopted** (the lead's call) | as Crocus Rex: no boss design for 3-10; 172 frames at ~1.6x | not batched |

## The GAPs ranked by first stage, in batches (one prompt style each)
| Batch | First stage | Pieces | Style |
|---|---|---|---|
| **1 World 2 village** | 2-7 | mail boat (2 rowing frames), letter + reply (2 flutter frames each), door OPEN, the weir, flood-line reeds, the King's Barge | Qwen-Image-Edit-2511 from World 2's own pieces (ART-W2A/W2B's method) |
| **2 grotto floor kit** (+ 2-8's flood-line reeds, redone: dark wet brown + silt, never grey; the lead 5:15 PM) | 3-1 | small shelf S, floor lip x2, lit-rim versions of shelf S/short/long, soft fungus mat, sleepy-mushroom shelf | Qwen-Image-Edit from w3-new#shelf-long/short (World 3's own stone) |
| 3 grotto climbs + walls | 3-4 (3-2 if needed) | root columns 2/3/4 Pokey, sinkhole wall stone, root-in-rock ends x2 (only if 3-2's dark stills fail the W7 anchors) | Qwen-Image-Edit from w3-props#rootLadder + shelf stone |
| 4 grotto sleepers | 3-3 | ocelot yawn + pad-home frames, the puffball (rest, swell), the oldest vine's eye (shut/open), the holdable thorn liana (3 states) | Qwen-Image-Edit from ocelot-anim, thorn0, w3#liana |
| 5 grotto glow props | 3-4 | moonflower step (3 states), glowing moss carpet, Grandma's lamp (dark/lit), golden guarana, grotto stone jetty | Qwen-Image + style LoRA (hfpalm's method), magenta key |
| 6 painted light + shadow | 3-4 | moonbeam shaft, the arch shadow, the dust-and-spore puff | Qwen-Image + LoRA on black, cut as additive/alpha (hf-backdrops' light method) |
| 7 backdrops (lead's call, each) | 2-9 | throne island at dusk, glowworm sky, moon over the mouth, shrine steps in moonlight, the dome | hf-backdrops.md (far layers) |

**Special stages in the batches (ART-NEXT-b):** none enter batches 2-7. The Rapids has no design (its likely white-water lane is named
above, batched once designed); no new W2/W3 puzzle room is designed; the two bosses' art is in game, and their bigger re-paint is a
separate, much larger job that waits on the lead's ruling on PREDATORS.md's "ten guardians" proposal.

Estimate for all 7 (measured: ART-W2B 15 edit takes in 25 min $1.15; ART-W2 30 takes in 11 min $0.50): edits ~70 s a take at 1024,
LoRA stills ~25-33 s. Batches 1-4 ~$2-3 each, 5-6 ~$1 each, 7 ~$2-3: **about $13-17 in all**, inside $50.25 less the $10 reserve.

## Batch 1 plan (World 2 village: 2-7, 2-8, 2-9): RUN and CUT (ART-NEXT-b 11-20: 9 cuts, rows w2-next#*, sheet hfnext/batch1-cuts.jpg; the reeds to batch 2)
Method: tools/art/hfpokey/pokeygpu.py, Qwen-Image-Edit-2511, no LoRA (ART-W2A/W2B's method: geometry paste-ups on flat grey + World 2's
own painted pieces as the style reference). ONE sandbox (rtx-pro-6000, $2.75/h); round 2 is chained in the same run on EVERY round-1
take of the two-frame pieces, so the lead picks matched pairs from one takes sheet and the sandbox is terminated the moment the takes
are back (no paid idle time waiting on a pick). Takes sheet reference/art/hfnext/batch1-takes.jpg to the lead BEFORE any cut.
| Piece | Start (paste-up) + style refs | Size | Takes | Est. s |
|---|---|---|---|---|
| mail boat A (oar forward) | dressnew-w2#w2Canoe + the mailman (cels-4#po.carry_stand) seated in it, a post sack; refs w2Canoe, po.walk_parcel | 1024x640 | 4 | 240 |
| mail boat B (oar swept back) | edit of each A take | 1024x640 | 4 | 240 |
| letter A + B (flutter), reply A + B | a cream envelope paste-up (red wax seal / green leaf seal); ref cels-3#gv.letter's paper | 512x512 | 3+3 / 3+3 | 360 |
| door OPEN | w2-props#door, the round door swung in on its hinge, warm dark inside | 768x512 | 3 | 135 |
| the weir | w2-new#stone-a/b/c stacked in 3 steps + World 2's shallow-water strip pouring white over them; ref w2#lip0 | 1024x512 | 4 | 240 |
| flood-line reeds | w2-props#reedTall + #reedLean, a dark wet band and silt at mid-stem | 512x768 | 3 | 135 |
| the King's Barge | w2Canoe's hull stretched to 4.3 Pokeys, a flat plank deck (walk line level), carved croc prow, reed canopy at the stern; refs w2Canoe, w2-props#throne (gold + teal) | 1280x512 | 4 | 280 |
Total 34 takes, ~1,630 s of generation + two model loads (~2 min) + setup/cut/fetch (~6 min): **about 36 GPU-min, ~$1.65.**
**Cap asked: $3** (room for ONE redo round on a single piece if a whole row fails; no second sandbox).
Pick criteria on the sheet: the stage's own light, Pokey's yellow bar beside each, edges 3x on light and dark (ART-W2B's show-first).
