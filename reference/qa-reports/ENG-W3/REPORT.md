# ENG-DOWNBOT REPORT (lane 2: the down lay's head room, then the bots on a way down to the shrine) — box 3 (resumed 11-25)
**EXACT NEXT STEP (box 3 hand-over):** head **3ba82c8b8** (pushed). (1) Toys OWED for 3ba82c8b8's two changes (firsttimer.ts
downEnd: applied whenever the way on is below him, not only close across; its wood run seeded from under his feet, not his middle):
each needs a downArena toy RED with that one change off. My lip arena (wood 600-1500 @500 to the wall, route under it then out past
the left end) PASSED with both off, so it proves nothing and was not committed; seed 6's real case: on 1056-1280 @3398 the progress
point stayed at (1110,3712) under his wood (he is 314 px over it, so Progress does not advance) — build the arena so cur stays under
his wood. (2) castBots x40 on 3ba82c8b8 (frozen tree, two halves, --json, background, ~12 min) vs 0cee60a4d's rows (partial, below)
and the baseline; tally: probes/tally.py. (3) Trace the next stalls, two seeds each, probes/stall.mts (`TREE= BOT= SET= SEED=
[FT_FRAMES=a,b] GEN2_DRAFT=3-1`): kid N seed 6 @(493,5929) 'a 15 px waist-high step ahead, a drop of 123 px ahead' (the known
'near-level catch at a step-off'), seed 3 @(372,5811) 'the way on is 136 px down'. (4) The LAY finding below to the lead. (5) lockall
vs c1008d8ed (102/102), tierBots 9/9, suite + CI tool line on the final head; land on t-eng-w3 (merge, no force).
**Stage length flag for 3-1's READY:** with the bots cleaner the kid's fastest clean run is 101 s (Normal), under the 120 s run floor
(castBots stageFloor: 3-1 reads as a run, 120 s; a way down is not a climb): 3-1's build owes length (design), not the bots.
Start 9:45 AM ET 11-25; hand-over 10:08 AM ET (by `date`).

## Box 3 (11-25), on t-eng-w3-wip-downbot (from t-eng-w3-wip-b 007bd2ca8, the paused box 2: the head-room lay + two toys)
- **Baseline, castBots x40 both settings on 007bd2ca8 (360 rows, rows/castbots-007bd2ca8.jsonl):** 360/360 reach the shrine, only 7/360
  clean (no rescue); 1,358 rescues. Stalls: 996 'in a dip N px deep, the way on is N px down', 354 'the way on is N px down'.
- **Cause 1 (route, towerRoute.ts):** going down, the route ran a slant from a leg's exit straight to the turn vine's foot when the lay
  had run that storey's wood on past the exit toward the vine: the way pointed under the wood he stood on (kid N seed 1 @7758:
  exit 737, wood on to 1210, vine 1236; seed 1 @10604 the same). Fix: walk the run of wood to its end by the vine first (runOf, shared
  with dropTo). Toy 'drops ledge by ledge' part (3): RED without (the slant 700->1030 under 700-1000), GREEN with. kid N seed 1: 2 -> 0
  rescues (7133509b).
- **Cause 2 (bot skill, firsttimer.ts downEnd):** on wood that lies OVER the way on (a catch under a turn's end, run on across the
  storey: seed 6 329-1026 @3284 over 397-622 @3462; seed 8 282-975 @3253 over 350-568 @3431) the first route point under him was
  straight under, downEnd gave 0 and he turned on the spot till rescued. Fix: step toward the first point of the way on that lies past
  his run of wood's ends. Toy 'on wood over the way on, he walks off its end where the way comes out' 7 bots x 3: RED 21/21 never left
  the wood without; GREEN 21/21 with (992908c1d). **That head made kid Normal WORSE** (c2, 26 rows: 79 rescues vs 20 on seeds 1-12's
  baseline): a turn vine whose top stands ON his wall-to-wall wood (seed 1 @11257, vine x 56 on 0-82) read as 'under his wood', so he
  went for the far end and turned: 'the way on is 93 px down'. Fix (0cee60a4d): a climb vine down from his wood's height is a way off
  it. Toy part 2 (the route on along the floor past the wood's far end): RED 21/21 on 992908c1d, GREEN on 0cee60a4d. c2's run stopped.
- **0cee60a4d, castBots x40 PARTIAL (166 of 360 rows, the run in this container; rows/castbots-0cee60a4d-partial.jsonl):** kid N
  17/40 clean, 36 rescues (baseline 5, 73); adult N 17/40, 34 (1, 100); kid E 9/40, 64 (0, 147); adult E 6/40, 78 (0, 161).
- **3ba82c8b8 (toys OWED):** seed 6 on 0cee60a4d went to and fro on the catch (downEnd only read close across; far across the route's
  x pulled him back) and then at the lip of 1056-1280 @3398 (his middle past the end: the run came out empty, the answer flipped).
  Both fixed: kid N seed 6 2 -> 1 rescues, seed 2 1 -> 0 (probe, work tree = 3ba82c8b8).
- **LAY finding for the lead (not changed):** going down, a turn's vine top stands at the end's fall line and its drop is 347-351 px
  (> TOWER.see 300), so towerCatches owes a catch under that end, and the catch (then run on by rules 1-2) lies ACROSS the vine:
  probes/vinecut.mts: 247 cuts on 24/24 rolls (seeds 1-12 x both). A vine through a shelf is a polish fault and the shelf covers the
  storey the vine leads to. Options: (a) down storeys <= 300 apart at a turn (no catch owed); (b) the vine stops at the catch, the
  catch hands on within 300; (c) the verdict counts a climb vine at the fall line as the catch (a rule change: the Designer's).
  Recommend (b) or (a); the bots now cope either way.

## Box 2 (11-23, paused by the lead; candidate t-eng-w3-wip-b 007bd2ca8)
- **STEP 0:** CI tool line (gates.yml rolled, 21 files) on FROZEN c1008d8ed: **228 tests, 227 pass, 0 fail, 1 todo** (the base's todo);
  ENG-W3a's '228, 0 fail' was measured on e8c21ef12, whose tools/engine draft files differ from c1008d8ed, so it was re-run.
- **Toys, castBots.test.ts (no stage's numbers), GREEN on the candidate, each RED in a fresh worktree with its skill off:**
  'a way down: the route turns straight down a turn vine, and drops ledge by ledge' (towerRoute.ts): turn skill off: RED 'a corner in
  the air at the vine level with the ledge'; dropTo off: RED 'the way drops through the ledge at y 900 from (100, 500) to (100, 1100)'.
  'he presses down onto it and climbs down to the storey on' (firsttimer.ts ~2828), 7 bots x 3 thumbs: GREEN 21/21; press off: RED,
  18 of 21 fell past the catch.

## Done so far (candidate on t-eng-w3-wip-b)
1. **Head room both ways going down (tower.ts towerCatches), general, every change gated on flow 'down':** (a) `cramped` keeps HEAD
   (84 px) over AND under a down bough or bridge (was: only its own 24 px body); (b) rule 4 slides a down bough along under the end
   (SLIDE: 60 px out past the fall line, 30 back) when the centred one is in the way at a height; (c) rule 2 tries each anchor in
   order going down (was: the nearest only); (d) rule 1 runs a down end on only into ITS OWN side's wall, head room kept (found here:
   a 60 px bridge's right end by the LEFT wall ran on to the RIGHT wall, a 1,196 px plank 70 px over a storey, easy 18).
   **Evidence (probe reference/qa-reports/ENG-W3/probes/headroom.mts, 24 seeds x both):** base c1008d8ed: 1,156 squeezed pairs on
   48/48 rolls, 0 refused; (a) alone: 1 pair, 7/48 refused for blind drops 301-382 px (ENG-W3a's finding reproduced); +(b): 1 pair,
   1 refused; +(c)(d): **0 pairs, 0 refused.**
2. **Planted tests, RED on base / GREEN here:** tower.test.ts 'towerCatches going down keeps his head room both ways' (3 plants, each
   RED alone on c1008d8ed: the bridge 70 px under a shelf, the band catch 60 px over the storey, the 84-1280 run-on); w3.test.ts 'head
   room on the way down' (24 raw rolls x both; RED on base: normal 1, 846-1099 @927 60 px under 987-1167 @867). tower.test 32/32,
   w3.test 8/8, tsc PASS.

# ENG-W3a REPORT (World 3's kit on gen2 + 3-1 drafted DOWN; WORLD-3-PLAN F1, lane 2)
**EXACT NEXT STEP (handed over at the context line, the lead's call):** (1) the lead rules the candidate on t-eng-w3-wip-a, then
land it on t-eng-w3 (not done here). (2) ENG-DOWNBOT (lane 2) starts from: `GEN2_DRAFT=3-1 npx tsx tools/inspect/castBots.ts --stage 3-1
--seeds 1-40 --par 3` (never run in full here); expert seeds 1-6: 3/2/2/3/3/1 rescues (17-21 before this job; seed 3 once 0 at 145.6 s);
stalls 'in a dip 287 px deep, the way on is ~120 px down' on a catch, a jump onto a near-level catch at a step-off. Its lay fix FIRST:
down needs HEAD room both ways (a rule-2 bridge 70 px under a shelf, seed 1 389-881 @6861 under @6791; a band catch ~60 px over the
storey laid after it, seed 2 238-418 @2314 under @2255); HEAD alone gives 7/48 blind drops of 301-313 px, so the catch search changes
with it. Start 11:27 AM ET (by `date`); ended ~12:45 PM ET, about 1.3 h of the 2 h budget.

## Done-items (lead's cut, 12:00 PM ET: bots-to-the-shrine becomes its own lane 2 job)
1. **w3.ts, World 3's kit on gen2:** W3_GROUND; W3_ART (bank, shelf, rock, glow, fern: World 3 inventory rows, in game, in scale);
   W3_CAST (predators/world3.ts ocelot + jaguar, Worlds 6-8 bodies); the way-down pool (ledge, step-off drops 110-150 px, shelf walk);
   listed.ts KITS 'w3' + World 3's own finish (never World 1's). generalitycheck PASS (26 known, none added).
2. **The general draft state (lead's ruling A):** stageTable.ts DRAFT_TABLE `'3-1': { kit: 'w3', travel: 'down' }`, no game path reads
   it; GEN2_DRAFT=<id> readies any draft in a tool (draft.ts/draftReady.ts), a page (draftBoot.ts), addlevel (DRAFT READY). The live
   3-1 (old section maker) and stagePlan.ts are untouched.
3. **Proof:** `GEN2_DRAFT=3-1 addlevel 3-1 --no-bots` (snap2): **DRAFT READY**: row resolves (travel down), rolls 24/24 Normal + 24/24
   Easy CLEAN (168-211 s), sheets met; OWED the bots; LISTING 5 (list, flown, routed, drawcheck, seeds) for 3-1's build. w3.test.ts 7/7 (the way down built by the game's own generateStage, raw rolls clean, last flag on 24 rolls,
   World 3's footing). **The plant:** travel back to 'right' turns 'the way DOWN' RED; planted-faults.py: 9/9 CAUGHT (incl. both
   down-flow fixes, the shadow lift, World 1's finish, art not in game, an animal socket).
4. **gen2's down flow, 2 defects the first down rows found (no listed stage travels down):** (a) tower.ts towerCatches going down: the
   catch band was a 10 px slot (287-296 px), blind drops 350-560 px on 11 of 12 rolls; now a head's room up to clear-HEAD, never
   squeezed. (b) the floor's walk to the shrine was off routeAt and never a flag spot: last flag 2045-2361 px out on 4 of 24; fixed.
5. **Bots (OWED, own job):** expert 17-21 rescues/run -> 1-3 (seed 3: 0, 145.6 s) via towerRoute.ts (a down tower's own route, drops
   ledge by ledge, turns straight down) and firsttimer.ts (step off toward the way down; press down onto a turn vine). Down-only.
6. **Gates:** main cdffdc627 base: suite 4042 (4039 pass, 0 fail, 3 todo), CI line 228 (227 pass, 0 fail, 1 todo). **Branch e8c21ef12 (src as
   landed): suite 4049 (4046 pass, 0 fail, 3 todo, the base's 3); CI line 228 (227 pass, 0 fail, 1 todo, the base's).** vite build,
   chunkcheck, artcheck PASS (1f37e4473).
   tsc PASS; generalitycheck PASS; knowncheck PASS; roadmapcheck FAILS on the container's shallow clone (fetch-depth), not the change.
   **lockall --layouts 16 --check vs main's lock: 102/102 stages unchanged (3,264 builds), exit 0: no listed stage moves.**

## Polish check (draftshoot.mjs, real game, 2x, seed 1 as the game BUILT it: travel down, flow down, 11,024 px top to floor)
- Upright reads as a way DOWN: the camera leads down, Pokey high in the frame, 3-4 shelves under him. Shelves are World 3's painted
  mossy slabs, 2.2-4 Pokeys wide, in scale. Sideways shows 2-3 storeys; the shelves read as stone, the backdrop is World 3's.
- ROUGH, named (not fixed here: the lay-fix job the lead split off): (1) many storeys run wall to wall (catches + run-ons), so WHERE to
  drop is not readable at a glance (3-1's glowworms are the design's answer, ENG-DARK); (2) a DOUBLE SHELF: going down, towerCatches'
  rule-2 bridge checks only its own body, so it runs 70 px under a shelf (seed 1: 389-881 @6861 under 389-767 @6791). HEAD room for
  down (the climb's rule) fixes it but leaves 7 of 48 rolls with blind drops of 301-313 px: the catch search must change with it.
- Stills: reference/qa-reports/ENG-W3/stills/ (3-1-{land,port}-{10,35,60,90}.webp, sheet-land/port.webp). Pokey stands on the
  shelves (the first shots pinned him 70 px over them: the harness, his y is his feet; fixed, reshot). The double shelf shows at
  land-60 / port-35 / port-60 (his head in the shelf over him). The shaft's sides show as the dark cave edge: no painted shaft wall
  yet (WORLD-3-PLAN §1 'MISSING: shaft walls, lit rims', W3-ART-1).

## Pushback
PUSHBACK.md (e6d3f1ef0): READY vs a draft row; stagePlan travel would flip the live 3-1. Ruled A (general draft state).

## Suggestions (ready packet): ENG-DOWNBOT (lane 2; serves 3-1, 4-7, 6-7, 8-6)
Objective: castBots on GEN2_DRAFT=3-1 seeds 1-40 both settings, every bot PASS with 0 rescues. Start: expert 1-3 rescues (seeds 1/2/4);
stalls 'in a dip 287 px deep, the way on is ~120 px down' (on a catch) and a jump onto a near-level catch at a step-off. Lay fix first:
a band catch can sit ~60 px over the storey laid after it (seed 2: 238-418 @2314 under the 2255 row), and a rule-2 bridge runs 70 px under
a shelf (seed 1 @6791/@6861): down needs HEAD room both ways (tried: 7/48 blind drops 301-313 px follow), storeyLimit must clear catches.
Files: tower.ts, pipeline.ts (lay), towerRoute.ts, firsttimer.ts. Done: the plant (a catch 60 px over a storey) red; castBots 40/40.

## Unresolved
Bots-to-shrine 40 seeds (owed, above). The kit's shelf is the painted branch until W3-ART-1's stone shelves load (named, not rough art).

## Method update
level.md / gates.md: a verdict test judges RAW rolls (buildGen2Stage): the game's build rerolls a failing roll and hides the fault.
## Turnover note
reference/handoffs/engine-core.md §0zr-W3a (this commit). Lessons applied: D40, D111, D113-D115, D117, D120, D122-D123, D126-D127.
