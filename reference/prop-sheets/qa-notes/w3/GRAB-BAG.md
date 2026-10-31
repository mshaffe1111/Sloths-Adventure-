# World 3 grab bag: The Grotto (2026-10-31, w1-4-sheets helper, for the lead's review before any art job)

The gen2 rebuild (`origin/plan-gen2-w1-4:reference/GEN2-W1-4-PLAN.md` §4) follows STAGE-RULES §1c: all pieces and art first, and
curation once. **Climbs B**: 3-4, *The Sinkhole*, becomes a generated ascent. Underground light rule (STAGE-RULES §4):
- props are painted evenly lit;
- only sources give light (glowworms, fungi, crystals, the way out);
- every gap carries its own light or a lit rim, and reads 1 s ahead (1.6 s on Easy).

Beat letters are as in `tools/inspect/beats.ts` (W, h, J, V, C, Z, P). World 3's Z today is spores (one 6.4 s rhythm), the dark and
thorn vines. The bag adds Z beats with their own rhythms and V/P beats that the grotto lacks: drips, stalactites, bats, root lifts and a
boulder push.

## 1. Section types (24; 7 timing beats)

| # | Section | Beats | Plays like | Art (existing / NEW) | First taught | Dot line (proposed, Matt approves) |
|---|---|---|---|---|---|---|
| 1 | Grotto stones | J h | Lit stepping stones over a soft pit | NEW grotto stepping stones ×3, lit rims (now generic moss_stone) | 3-1 | (existing) |
| 2 | First water / deep run | J | Stones across a lethal stream | existing `deepRun`, pit water w3; NEW stones (#1) | 3-1 (`:3007`) | (existing) |
| 3 | **Spore rest / spore gap** (timing) | Z J | Spores puff on a rhythm; cross in the lull | existing `mushrooms` (bases), code puffs | 3-1 (`:3011`) | (existing) |
| 4 | **Fast and slow spores** (timing) | Z | Two spore beds out of step (4.2 s and 6.4 s); wait for both lulls | NEW painted spore puff (3 frames: swell, burst, fade) | 3-5 or later (after 3-1's rhythm) | "Two beds. Wait till both are quiet." |
| 5 | Glowworm dark | Z J h | Dark stretch lit by sleeping glowworms that wake as Pokey passes | existing glowworm frames, `glowLit/Dim` | 3-1 (`:3019`) | (existing) |
| 6 | Eyes and ferns | Z h | The eyes open on a rhythm; hide in a fern | existing `fernRustle`, `fern`; **`catEyes` painted, now unused in this beat** (eyes are code gradients, `engine.ts:6349`) | 3-2 (`dotTips:44`) | (existing) |
| 7 | **Hollow-log hide** | Z h | A hollow log as a second hide kind under the eyes: crawl in, wait, crawl out | existing `hollowLog` (packed, never drawn) | 3-2 | "Logs hide you too." |
| 8 | Prowler floor | C h | Ocelot prowls the floor, pounce tell | existing ocelot atlas and anim | 3-3 (`:3134`) | (existing) |
| 9 | Prowler shelves | C J | Ocelots on limestone shelves | NEW limestone shelf pieces ×2 (now generic branch) | 3-3 | (existing) |
| 10 | Jaguar pass | C | A jaguar's slow patrol, a bigger tell | existing jaguar atlas and anim | 3-3 (`:3155`) | (existing) |
| 11 | Root climb | V J | Climb hanging roots, step off | existing kit `liana`, `trunk`; existing `rootLadder` (packed, never drawn) | 3-4 (`:296`) | (existing) |
| 12 | **Root bridge** | V | Shimmy under a root bridge over a gap | existing `rootBridge` (packed, never drawn), hero-rope | 3-4 | - |
| 13 | **Root lift** (timing) | V | A glowworm-lit root basket on a counterweight rises and falls on a rhythm | existing puzzle-kit `basket`, `pulley`; NEW root-woven basket and counterweight stone | 3-4 | "Step on when the roots come down." |
| 14 | **Falling stalactites** (timing) | Z | Drips shake a stalactite (dust and a drip, 1.2 s warning), then it drops; never over a landing | existing `stalactite`; NEW stalactite falling and shattered frames, drip-warning dust | 3-4 (taught with one, far from a jump) | "Dripping stone falls. Wait for it." |
| 15 | Thorn vine row | Z J | Sleeping thorn vines; freeze when they wake | existing thorn0-15 | 3-5 (`:3336`) | (existing) |
| 16 | Lure bell and pebbles | P | Ring or throw to lure the vines | existing Keeper's Bell, `pebble` | 3-5 | (existing) |
| 17 | **Bat roost run** (timing) | Z | Cave bats hang asleep under a low ceiling; they stir on a rhythm. Walk under them while still (a stir pushes Pokey back with a flutter, no life lost). | NEW cave bat (asleep, stir, flutter) | 3-6 | "Bats are light sleepers. Go when still." |
| 18 | Fern search | P h | Search a rustling fern for Grandma's things | existing `fernRustle`, puzzle-kit ferns | 3-6 (`dotTips:51`) | (existing) |
| 19 | Which fern | P Z | The right fern by its tell; search while still | existing puzzle-kit fern set | 3-7 (`:3587`) | (existing) |
| 20 | Thorn chain | V Z | Thorn-vine swings | existing thorn frames, kit `liana` | 3-8 (`dotTips:50`) | (existing) |
| 21 | **Boulder push** | P | Roll a boulder into the stream as a step, or onto a plate | existing kit `boulder`, puzzle-kit `stonePlate/Down` | 3-6 (a plain push first, nothing chasing) | "Push the boulder in. Make a step." |
| 22 | **Crumbling cave floor** (timing) | Z | A cracked shelf crumbles 0.8 s after landing, with a safe low route always kept (never required, STAGE-RULES §1) | NEW cracked limestone shelf (whole, cracking, gone) | 3-7 | (1-5's crumble tip) |
| 23 | Plate, glow and lure rooms | P | The existing rooms | puzzle-kit (all 20 W3 cells drawn) | 3-2, 3-5, 3-7 | (existing) |
| 24 | Prowler ring | C P | Waves, then the wall lock opens (Dot explains) | existing `ringWall`, `pawprint`, `pawStrip` (now undrawn), `bones`, `clawRock` | 3-9 (`:3800`) | (existing) |

**Timing beats (7):**
- spores;
- fast and slow spores;
- the root lift;
- falling stalactites;
- the bat roost (a stir pushes Pokey back with no life lost, so it fits the third world);
- the crumbling floor;
- the eyes (#6).

## 2. Themes per stage (5+ each)

| Stage | Lesson (Ki, required) | Themes |
|---|---|---|
| 3-1 Into the Grotto | spores, darkness, first water | **spore beds** (3, 1); **deep water** (2, 1); **glowworms** (5, 1); **vines** (11, 3); **mushroom road** (3, 5) |
| 3-2 Glowworm Path | eyes and fern hiding; glow and plate rooms required | **ferns** (6, 5); **logs** (7, 6); **dark** (5, 6); **roots** (11, 6); **stones** (1, 6) |
| 3-3 Footprints in a Circle | prowler, jaguar | **floor** (8, 1); **shelves** (9, 8); **jaguar** (10, 8); **spore hunt** (3, 8); **dark hunt** (5, 8) |
| 3-4 The Sinkhole (gen2 ascent) | root climb | **roots** (11, 12); **lifts** (13, 11); **stalactites** (14, 11); **shelves** (9, 11); **bridges** (12, 14) |
| 3-5 Sleeping Vines | thorn freeze; lure room required | **vine rows** (15); **pits** (15, 2); **spore vines** (15, 4); **dark vines** (15, 5); **stalactite vines** (15, 14) |
| 3-6 Grandma's Things | fern search | **fern patch** (18, 1); **bats** (17, 18); **boulders** (21, 18); **spores** (3, 18); **dark ferns** (5, 18) |
| 3-7 Which Fern? | search while still; which-fern room required | **watched ferns** (6, 19); **crumble** (22, 18); **vines** (15, 19); **bats** (17, 19); **logs** (7, 19) |
| 3-8 Thorn Vine Swing | thorn chain | **chains** (20); **deep chains** (20, 2); **vine rows** (15, 20); **stalactite swing** (20, 14); **root bridge** (12, 20) |
| 3-9 The Prowler's Ring | ring lock required (Dot explains) | **floor** (8, 10); **trees** (11, 8); **shelves** (9, 10); **bats** (17, 8); **crumble hunt** (22, 8) |

## 3. NEW art for World 3 (one HF batch, with `w3-style-sheet.png`: evenly lit cool stone, teal sources painted bright and separate)

| # | Piece | Frames | Size | For |
|---|---|---|---|---|
| 1 | Grotto stepping stones, with damp lit rims and a little glow moss | 3 | ~300 x 170 | #1, #2 |
| 2 | Limestone shelves (standable, side view) | 2 (short, long) | 420 / 640 x 140 | #9 |
| 3 | Cracked limestone shelf | whole, cracking, gone (rubble) | 520 x 150 | #22 |
| 4 | Stalactite drop | hanging-shaking, falling, shattered | 160 x 360 | #14 |
| 5 | Cave bats (small, grey-brown, big ears) | asleep (hanging), stir, flutter ×2 | 192 x 192 | #17 |
| 6 | Root lift: a root-woven basket and its counterweight stone | 2 | 260 x 220 | #13 |
| 7 | Spore puff (lavender, painted glow) | swell, burst, fade | 256 x 256 | #3, #4 (now code discs; the code glow stays on top) |

**Cost:** one job, about 3 canvases (2 strengths x 2 seeds) plus the bats as 4 poses from the first approved bat. ~18 min:
**~$0.85, cap $2.5**.

## 4. Gaps left

- New gen2 pieces: the timed root lift (reuses the lift), falling stalactites (like World 4's rocks: `beats.ts:231`), the bat roost
  (W8's watcher with a setback), and the crumbling shelf (World 7's crumble tiles). The W3 builder owns them; the art comes first.
- perf: 3-3 is the `drawImageScreens` worst case (7.22 of 7.5). New W3 decor must replace code draws, not add layers.
