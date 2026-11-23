# ENG-DOWNBOT REPORT (lane 2: the down lay's head room, then the bots on a way down) — PAUSED (the lead's call: the slot went to 2-7)
**EXACT NEXT STEP (box 2 pause, resume Wednesday from here):** STEP 0 is DONE (below). Nothing is running (both runs were stopped at the
pause; their partial output was not kept). (1) Two heavy runs, each on a chattr-frozen worktree (D115), both run_in_background:
(a) `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` on c1008d8ed (about 8 minutes beside one other run: it reached 7-4
in 7 min), then `--layouts 16 --check lock-base.json` on the candidate head; the bar is 102/102 unchanged. (b) `GEN2_DRAFT=3-1 npx tsx
tools/inspect/castBots.ts --stage 3-1 --seeds 1-40 --par 3 --rows rows.jsonl` on the candidate head (first full run; never finished yet).
(2) towerRoute.ts / firsttimer.ts on what stalls, a toy per new skill RED off. (3) Toys still owed for ENG-W3a's other skills: downEnd
(step off toward the way on, firsttimer.ts ~1730 and ~2358), the drop that ignores a near-level catch (~2917), the own route always on a
way down (~1475); each built on castBots.test.ts `downArena` (it clears the carrier's water and deepens it: a 2-2 carrier's water put him
back and its 900 px floor killed a two-storey fall). (4) Item 3: rule 28 x40, suite + CI tool line + tierBots on a frozen head, land.
Start 12:53 PM ET (by `date`). Box 1: 12:53-1:21 PM ET. **Box 2 (ENG-DOWNBOT-b): 1:13-1:23 PM ET (by `date`), paused by the lead.**
Hours used: about 0.7 of the 2 h (box 1 0.5, box 2 0.2). Left: the lockall verdict, the bots (item 2), item 3.

## Box 2 done (candidate on t-eng-w3-wip-b)
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
