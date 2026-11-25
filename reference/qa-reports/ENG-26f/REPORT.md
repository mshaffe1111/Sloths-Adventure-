# ENG-26f REPORT: 2-6 "The Water Wheels" readiness: the last x-only water reads, the full lock, rule 28's row diff, the table, stills, gates
t-eng-26c from fb297bdc9. HANDED OVER on the lead's ruling (context about 280k by the lead's read; stills and the engine gates go to
BUILD-26, no ENG-26g). Commits: cfdca80e3 (step 0), 721b9e672 (step 1 evidence), 4a0a8677c (R-165.375), c1fe87a6e (plantRow.ts),
411638a73 (step 2), c50c8406f (step 3), a71c69427 (tsc).
Lessons applied: D57/D87/D105 (inbox at every step and push), D75/D101 (proven on the draft row), D102 (grep and line ranges; the
lead's context number is the one), D107, D109 (no clock times in messages), D40 (the draft bricks are throwaway; the fixes are general).
MISS (owned): during step 0's plant I restored the three planted files with `git checkout`, which also threw away the fix itself; I
re-applied it from a saved copy and the same edit script before any commit (tests 11/11 after). Countermeasure I used from then on:
a plant is restored from a copy of the fixed file, never from git.

## EXACT NEXT STEP (for BUILD-26, the lead's ruling: no ENG-26g; BUILD-26 starts from this branch's head)
1. **Step 0 of BUILD-26, the engine gates on this head (UNRUN here, name each result in your REPORT):** the planted tests
   (`npx tsx --test src/game/gen2/towerWaterReads.test.ts src/game/gen2/listedWheelSheet.test.ts src/game/gen2/towerCatchWater.test.ts
   src/game/stageSheets.test.ts tools/inspect/rowWheels.test.ts`), the CI tool line (`npx tsx --test tools/engine/library.test.ts
   tools/engine/seedlist.test.ts tools/engine/yield.test.ts tools/inspect/travelBots.test.ts`), generality (`npx tsx
   tools/engine/generalitycheck.ts`), coverage (`npx tsx tools/difficulty/coveragecheck.ts`), `npx tsx tools/engine/seedlist.ts 1-1
   --check`. RUN here: tsc on 411638a73 PASS (gates/01-tsc.txt); the planted tests each RED then GREEN in this session (towerWaterReads
   11/11 at cfdca80e3, listedWheelSheet 1/1 + stageSheets 9/9 at 4a0a8677c, rowWheels.test 5/5 on c1fe87a6e's code); tierBots 1-1 9/9 and
   lockall (102/102, both bases) above. Every other gate in CLAUDE.md's list (the vite build, chunkcheck, artcheck, drawcheck, clipcheck,
   knowncheck, roadmapcheck, kbdcheck, buildcheck, the full suite): UNRUN, BUILD-26's or the merge's.
2. **Write reference/handoffs/engine-core.md** from 'For engine-core.md' below (not rewritten here: context).
3. **Stills are BUILD-26's own first look of the real stage** with the painted noria (the draft row's stills are throwaway, the lead's
   ruling). If you want the bots' real moments on the page: tools/inspect/plantRow.ts plants a row in a dev page (`await
   import('/tools/inspect/plantRow.ts')`, then `__play`); a bot's pads can be replayed through the page engine (buckets are placed from
   the game clock, wheel.ts bucketAt(host.t), so the replay reproduces the wheel). With R-165.375 a listed row that lays a wheel preloads
   the noria's sheet: the first frames must show the painted rim, not plain buckets.

## For engine-core.md (the lines BUILD-26 writes, lead's ruling)
- **River reads, one rule (river.ts):** riverAt(rivers, x, y) is the water he is in or over (window holds x, y no deeper than
  RIVER_DEPTH 120 under the surface; of two, the higher); waterUnder(rivers, x, y, floors) is the FIRST thing a fall from (x, y) meets
  (riverAt's river unless a storey's floor spanning x lies between, more than RIVER_DEPTH over the surface; nearer, a floor is ON the
  river: a bank, island, lily, stone); waterNear(r, x, y, floors) asks it at the window point nearest x. Never judge water by x alone:
  every reader now goes through these (pipeline.ts dropsOf, easyMode.ts clearOfWater/easyStones/easyWaterLandings/bankEdge/
  easyPadsWider, lessons.ts pickLesson, waterTeach.ts floorWater, jumpTrails.ts routeGaps). Plants: gen2/towerWaterReads.test.ts.
- **dropsOf's floor** is the HIGHEST floor under the fall's middle (the first one he meets), no longer the first in array order; only
  `ends.y` of floor drops moved (12 shipped stages), and no reader uses it.
- **The tower river:** wheelLay.ts waterFloors (every river's water lies under a tower's open ends, towerCatches and towerFalls; was
  pondFloors, ponds only). Plant: gen2/towerCatchWater.test.ts.
- **The wheel's art:** stageSheets 'w2-wheel' is asked for by any kit that lays a wheel (laysWheel(kit): GEN2_STAGES' or the listed
  row's, pieces and sub-block versions, both settings): R-165.375, plant gen2/listedWheelSheet.test.ts. Buckets sit where wheel.ts
  bucketAt(wheel, i, host.t) says each fixed step (pieces/wheelPiece.ts): no timer of its own.
- **Bots:** firsttimer.ts SKILLS.trunkCatch (a jump that catches a trunk straight off the ground is over that frame): 0 of 360 rows
  moved on 2-3 and on 2-5. rowWheels.ts plays a row not yet listed (plantRow.ts) with every wheel tallied (wheelCrossings.ts).

## Done
| step | result | evidence |
|---|---|---|
| 0: the last four x-only water reads | waterTeach.ts floorWater (a river is the floor's water only on the floor's storey at its near bank; an opening is covered only by a river on its storey), jumpTrails.ts routeGaps (a river makes a gap "crossed its own way" only on the gap's storey, at the lower lip), easyMode.ts bankEdge (ONE helper for both bank reads: Easy's landing widening in easyHoldSoften, and the creek stones) and easyPadsWider (the pad and creek-stone widening, lifted out whole; every stone read before any grows). All by river.ts waterNear (the RIVER_DEPTH band). None was bigger than a small change. | cfdca80e3; towerWaterReads.test.ts 11/11 |
| 0: plants | each of the four new tests RED with waterNear read as x alone in those three files (tests 8-11; ENG-26e's three easyMode tests RED too, as they share the reads), GREEN with the fix | the run in this session |
| 1: the lock | head cfdca80e3 vs 0eefc707e AND vs e67e01113, every stage, 16 layouts, both settings: **102/102 stages unchanged** (3264 builds each) | lock/lock-and-drops.txt |
| 1: the drops fingerprint | MOVED on 12 shipped stages (1-1, 1-6, 1-7, 1-8, 2-1, 2-5, 5-7, 5-9, 8-2, 8-5, 8-6, 8-9); the two bases identical to each other. All 1243 moved entries: the same fall (x0, x1, lip), the same ends.kind 'floor' and look 'ground'; ONLY ends.y, now 35-75 px higher. Example: 1-1 normal v1, the fall at x 6116-6371, lip 1180: floor y 1250 -> 1215. Verdicts identical on every build. Cause: ENG-26e's dropsOf (5a67dba93/dfc90a509): the base took the FIRST platform in array order under the fall's middle, the head the HIGHEST, the first floor a fall really meets. Readers: none reads ends.y on a floor drop (verdicts.ts, promises11.ts and pipeline.ts:4219 falls read kind, cause and look). STOP sent; **lead ruled ACCEPTED** (a correction, not a player change) | lock/drops-diff-e67e01113-vs-head.txt; lock/lockplus.ts, alldrops.ts, cmp.mjs (run from tools/engine/) |
| R-165.375 | a LISTED stage that lays a water wheel never asked for the painted noria's sheet (stageSheets laysWheel read GEN2_STAGES only, which holds no stageTable row: R-165.288's rafts miss again), so 2-6, once listed, would pop its noria in. laysWheel now reads a kit (GEN2_STAGES' or the listed row's), its pieces and sub-block versions, both settings | 4a0a8677c; src/game/gen2/listedWheelSheet.test.ts RED with the listed branch false; stageSheets.test.ts 9/9 |
| plantRow.ts | rowWheels' row plant lifted into tools/inspect/plantRow.ts (returns its undo), for the bots and the DEV stills page | c1fe87a6e; rowWheels.test.ts 5/5 |

## Rule 28 (step 2): the trunkCatch bot fix, row for row (rows/rowdiff.txt, rowdiff.py; key bot + setting + seed; end, pass, time, rescues, goal, hits, lives, turnBacks, stuck)
- **2-3**: origin/t-build-23 66775dabf with ONLY 9346f3948's tools/inspect/firsttimer.ts hunk applied, `castBots --stage 2-3 --seeds 1-40
  --setting both`, vs BUILD-23e's committed castbots23e-rows.jsonl: **360 compared, 0 moved.**
- **2-5**: the head, vs BUILD-25d's castrows-2-5-25d.jsonl (74b72c84b): **360 compared, 0 moved** (the bot fix and every engine change
  since 25d, ENG-26d/e and step 0 here, together).
- Nothing to trace; trunkCatch is not narrowed. **tierBots 1-1: 9/9** on the head (rows/tierBots-1-1.txt).

## The table (step 3): rowWheels on the draft row, finish / rescues (table/*.txt; every run: lives 0, put-backs 0)
| run | s1 ON v1 | s1 ON v2 | s2 ON v1 | s2 ON v2 | s1 OFF v1 | s1 OFF v2 | s2 OFF v1 | s2 OFF v2 |
|---|---|---|---|---|---|---|---|---|
| child Easy | 157.6 / 0 | 167.1 / 0 | 156.9 / 0 | 142.8 / 0 | 143.3 / 0 | 116.2 / 0 | 181.3 / 0 | 125.6 / 0 |
| child Normal | 137.6 / 0 | 191.9 / 0 | 142.1 / 0 | 157.5 / 0 | 224.3 / 0 | 327.0 / 0 | 409.5 / **1** | 272.8 / 0 |
| middle Normal | 133.3 / 0 | 123.1 / 0 | 110.9 / 0 | 110.9 / 0 | 219.4 / **2** | 156.6 / 0 | 191.6 / 0 | 285.4 / 0 |
| middle Easy | 127.0 / 0 | 130.3 / 0 | 123.3 / 0 | 124.9 / 0 | 170.1 / 0 | 94.9 / 0 | 107.6 / 0 | 133.2 / 0 |
| expert Normal | 105.6 / 0 | 108.7 / 0 | 102.4 / 0 | 121.0 / 0 | 90.5 / 0 | 121.6 / 0 | 175.3 / 0 | 173.7 / 0 |
ON (the shipped bots): 20/20 reach the shrine, **0 rescues on every run; middle and expert 0**. Seed 1 ON is ENG-26e's table exactly.
OFF (the plant, SKILLS.rideWheel off): the wheels are scrambled up, not ridden (scrambles per wheel up to 46 against 0-1 ON; the child
Easy v1 never rides the teaching wheel, 'teachL never'), with 3 rescues and the slowest runs (409.5 s). The expert ON finishes in
102-121 s, under the 2-minute rule on 3 of 4 runs: the real bricks must hold him over 120 s.

## What the 2-6 builder needs (ENG-26c's list, updated)
- The expert finished the draft in about 106 s, under the 2-minute stage rule: the real bricks must hold the expert over 2 minutes.
- R-165.375: the listed row preloads its painted noria; check the first frames of a wheel on the phone show the painted rim, not plain.
- (the rest: filled in at hand-over from ENG-26c/26e's list with the table and stills)
- The bots ON are calm on the draft: 0-1 scrambles a wheel. The real bricks must keep them riding: the table's OFF column is what a
  wheel nobody can ride looks like (up to 46 scrambles, rescues).
- The gates in the EXACT NEXT STEP, step 1, are your step 0.

## Polish check
No stills shot (the lead's ruling: BUILD-26 shoots the real stage). Nothing here draws except R-165.375, which makes the painted noria
load with the stage instead of popping in; checked by its test, not by a still.

## Pushback
None on the packet's substance. The drops fingerprint as the packet worded it ("identical on every shipped stage") could not hold after
ENG-26e's dropsOf fix: it was reported as a STOP and ruled.

## Suggestions
- lockall could hash `gen2.drops` as its own part (it strips it with verdicts): this task's fingerprint took a side script
  (lock/lockplus.ts); a part of its own would make the next move show by itself. A ready packet: tools/engine/lockall.ts, add
  `parts['gen2.drops'] = h(st.gen2?.drops)`, re-record, check that only that part is new.

## Unresolved
- Step 4 (stills) and the step 5 gates named UNRUN above, moved to BUILD-26 by the lead's ruling. engine-core.md not rewritten (the
  lines are above).

## Method update
level.md rule 28's row diff can be run against a branch's committed rows by applying ONLY the bot hunk in a worktree at that branch
(`git show <commit> -- tools/inspect/firsttimer.ts | git apply`): it isolates the bot change from the engine's. rowdiff.py does the diff.

## Turnover note
reference/handoffs/engine-core.md: NOT rewritten (context, the lead's ruling); its lines are in 'For engine-core.md' for BUILD-26.
