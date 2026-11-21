# ENG-26f REPORT: 2-6 "The Water Wheels" readiness: the last x-only water reads, the full lock, rule 28's row diff, the table, stills, gates
t-eng-26c from fb297bdc9. IN PROGRESS (first written 1:16 PM ET 11-21; kept current at each step). Commits: cfdca80e3 (step 0),
721b9e672 (step 1 evidence), 4a0a8677c (R-165.375), c1fe87a6e (plantRow.ts).
Lessons applied: D57/D87/D105 (inbox at every step and push), D75/D101 (proven on the draft row), D102 (grep and line ranges; the
lead's context number is the one), D107, D109 (no clock times in messages), D40 (the draft bricks are throwaway; the fixes are general).
MISS (owned): during step 0's plant I restored the three planted files with `git checkout`, which also threw away the fix itself; I
re-applied it from a saved copy and the same edit script before any commit (tests 11/11 after). Countermeasure I used from then on:
a plant is restored from a copy of the fixed file, never from git.

## EXACT NEXT STEP (for whoever picks this up, in this order)
1. **Rule 28 (step 2): DONE** (below).
2. **The table (step 3): DONE** (below).
3. **Stills (step 4):** tools/inspect/plantRow.ts is the DEV route's plant (nothing in src imports it, so no shipped build holds it):
   a stills script starts a dev vite, and in the page `await import('/tools/inspect/plantRow.ts')` and the draft kit
   (`/src/game/gen2/worlds/w2Arc26.ts` kitLib26/STAGE_26, `/src/game/gen2/worlds/w2.ts` w2Finish), calls plantRow(row, 1), then
   `__play('2-6', 1)`. Plan for real moments: record a tier bot's run headless (wrap RealPlay.prototype.frame to log each pad and
   Pokey's x/y/t), replay those pads in the page (replace the engine's input with a FakeInput-shaped object, step e.update(1/30) by
   hand, check Pokey's x/y against the record each frame), and shoot at the board, ride, step-off, rightward wheel, great wheel and a
   tower turn, upright 390x844 and sideways 844x390 at 2x. Buckets are placed from the game clock (wheel.ts bucketAt(host.t)), so the
   replay reproduces the wheel too. With R-165.375 the painted noria preloads on the listed row; look at every still before sending.
4. **Gates (step 5)** on the head, then rewrite reference/handoffs/engine-core.md (the wheel, riverAt/waterUnder/waterNear, the tower river).

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
