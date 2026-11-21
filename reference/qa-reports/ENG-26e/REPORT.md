# ENG-26e REPORT: 2-6 "The Water Wheels", the water reads and the tower-turn rescues. HANDED OVER at about 300k real context (written 12:49 PM ET 11-21)
t-eng-26c from e67e01113. Commits: 5a67dba93 + dfc90a509 + fd8c39590 (step 1), 9346f3948 (step 2).
Lessons applied: D57/D87/D105 (inbox at each step and push), D75/D101 (proven on the draft row, played), D102 (grep and line ranges;
I still read my context about 130k low, D55: the lead's number is the one to use), D103, D107, D40 (the draft bricks are throwaway; the
fixes are general). MISSES: (1) one message to the lead carried a guessed clock time instead of one read from date (D106/D30), corrected
the same minute. No commit or REPORT line carries it (checked by grep). (2) 5a67dba93 moved shipped stages (below); I stopped and reported, the lead ruled.

## EXACT NEXT STEP (for the next engine member, in this order)
1. **The lock, ALL stages, on the head (fd8c39590 or later):** `npx tsx tools/engine/lockall.ts --layouts 16 --intended 2-6 --check <lock>`
   against 0eefc707e AND against e67e01113 (record each with `--out` in a worktree at that commit). Only 2-6 may move: its draft row loses
   the millrace's catch bough P70, from step 2 (a). The hand-built 2-6 is routed first in the game, so the lock may show nothing.
   Step 1 alone at dfc90a509 vs e67e01113: 2-2/2-3/2-8/2-9 NO STAGE MOVED (16 layouts, both settings); the full run of dfc90a509 vs
   0eefc707e was at 7-4 when I handed over (scratchpad, lost with this container: re-run it). If a SHIPPED stage moves: STOP and send the lead the stage.
   The drop judge's output is NOT in the lock (lockall strips gen2.drops): fingerprint `st.gen2.drops` per stage x setting x layout
   before and after (a 20-line script: build as lockall does, hash gen2.drops). It must be the same on every shipped stage.
2. **Rule 28 (the lead's ruling): a row-for-row castBots diff** for the bot fix (b), against the last committed rows: 2-3's BUILD-23e rows,
   and 2-5's if they are on this base. Trace any row that moved, or narrow trunkCatch. (tierBots on 1-1: 9/9 PASS already, below.)
3. **The table:** `npx tsx tools/inspect/rowWheels.ts` with SEED=1 and SEED=2, ON and OFF=1, gaining the rescues column per run (tool line
   runLine already prints rescues). Seed 1 ON is below.
4. **Stills** (packet step 4): a dev-only route that plays the draft row (as ?fixture=wheel plays the toys; DEV only, never in the shipped
   build), showing a board, a ride, a step-off, a rightward wheel, the great wheel and a tower turn, upright and sideways at 2x, with the
   painted noria (wheelDraw.ts paintWheel). Look at each one before sending it.
5. **Gates on the head:** tsc (PASS on 9346f3948), the planted tests, the CI tool line, tierBots, generality, coverage, lockall; name
   the rest as UNRUN for BUILD-26. Rewrite reference/handoffs/engine-core.md for the wheel, riverAt/waterUnder and the tower river (NOT done: context).

## Done
| step | result | plant |
|---|---|---|
| 1: the four x-only water reads | ONE rule in river.ts: `waterUnder(rivers, x, y, floors)` = riverAt's river unless a STOREY lies between (a floor spanning x, at or under y, more than RIVER_DEPTH over the surface), plus `waterNear(r, x, y, floors)` (waterUnder at the window point nearest x). Readers: pipeline.ts dropsOf (the FIRST thing under the lip; ground = the highest floor under it), easyMode.ts clearOfWater (now exported, takes the flag's y), easyStones and easyWaterLandings (judged at the gap's mid and y), lessons.ts pickLesson (LessonScene.rivers gains surfaceY) | src/game/gen2/towerWaterReads.test.ts 7/7: tests 1-6 RED on the x-only reads (6 of 6), test 7 (the island) RED on 5a67dba93's any-floor rule |
| 1: shipped stages | 5a67dba93 moved 2-3, 2-8, 2-9 (flags) and 2-2 Easy (rebuilt): the flag read counted islands and lilies inside World 2's river windows as floors between. STOP reported; ruled GO; fixed by dfc90a509 (the RIVER_DEPTH band). 4 stages, 16 layouts: NO STAGE MOVED | the island test |
| 2: diagnosis (sent before the fix; accepted) | seed 1, 10 runs, 14 rescues. (b) THE BOT, 9: a double that grabs a turn vine straight off the ground (no frame in the air) kept running, and its second press 0.43 s later flicked him off the vine (x 1369; x 261/603/1485) onto the catch bough below. (a) THE LAY, 5: P70 (1118-1298, y 5028) is a towerCatches catch bough laid 58 px under the millrace's surface and under its near bank, because pondFloors counted only wheel ponds as water; the inspector's route ran vine, P70, a hop to the log, which cannot be flown. (c) none | |
| 2: fix (b) | firsttimer.ts after(): SKILLS.trunkCatch, a jump that catches a trunk with no frame in the air is over (scored ok, cleared) | rowWheels.test.ts 'PLANTED: trunkCatch OFF' RED (rescues come back) |
| 2: fix (a) | wheelLay.ts pondFloors -> waterFloors: every river's water lies under a tower's open ends (towerCatches and towerFalls) | src/game/gen2/towerCatchWater.test.ts 2/2: the pond-only read lays a bough in the water (RED) |
| 2: result | seed 1 ON, all 10 runs reach the shrine with 0 rescues (below). rowWheels.test.ts 5/5: middle and expert 0 rescues on seeds 1 AND 2. tierBots.test.ts 9/9 on 1-1 (the testers still match) | |

## Bots table (draft row, seed 1, ON, after both fixes; per run: finish / rescues)
| run | v1 | v2 |
|---|---|---|
| child Easy | 157.6 s / 0 | 167.1 s / 0 |
| child Normal | 137.6 s / 0 | 191.9 s / 0 |
| middle Normal | 133.3 s / 0 | 123.1 s / 0 |
| middle Easy | 127.0 s / 0 | 130.3 s / 0 |
| expert Normal | 105.6 s / 0 | 108.7 s / 0 |
Before (e67e01113): 14 rescues (child 1-2, middle 0-1, expert 2 a run). NOTE for BUILD-26: the expert now finishes in about 106 s,
under the 2-minute stage rule. That number comes from the draft bricks, and the real bricks will set it.

## What the 2-6 builder needs (ENG-26c's list, updated)
- Water on a tower storey is read by x AND y everywhere: the engine (riverAt), the drop judge, Easy's flags and steps, and the lesson.
  Still x-only and not in this packet's four (name them to the lead): waterTeach.ts:48 `covered`, jumpTrails.ts:60, easyMode.ts:163/438 (the bank edges by x).
- A river on a storey is the floor under its banks' ends: no catch bough is laid in its water.
- The turn's vine is the way up. The bots no longer leave it on a double's second press.

## Unresolved (named plainly)
- Steps 3-5 not done: the table for seed 2 and OFF, the stills, the gates, and the engine-core.md rewrite. The full lock and the drops fingerprint were unfinished at hand-over.
- Rule 28's castBots row diff for the bot fix: not run.
