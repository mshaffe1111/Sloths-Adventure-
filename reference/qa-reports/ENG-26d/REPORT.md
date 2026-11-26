# ENG-26d REPORT: 2-6 "The Water Wheels" engine readiness. HANDED OVER at about 300k real context (12:16 PM ET 11-21)
t-eng-26c from 47227d01b. Commits: 18a52d6a7 (steps 0-1), 59a5e4794 (G6), 704165d24 (bots tool + CI test, built before the lead's 12:10 ruling reached me).
Lessons applied: D57/D87/D105 (inbox at each step and push; I still read the 12:10 ruling 5 min late, behind long tool rounds: my miss),
D75/D101 (ready = played on the row, not only laid), D102 (grep and line ranges), D103, D107; D40 (draft bricks are throwaway data).

## EXACT NEXT STEP (for ENG-26e, in this order; the lead's ruling 12:10 PM ET)
1. **The four other x-only water reads, ONE general piece through river.ts riverAt's rule (no second copy), each planted RED on a toy
   tower with water on two storeys, GREEN after; lockall vs 0eefc707e: no shipped stage moves (if one does, STOP and tell the lead):**
   - src/game/gen2/pipeline.ts:4560 (the drop judge, `rivers.find(mid in window)`): a fall ends in the FIRST thing under its lip, river
     surface or ground, whichever is higher; riverAt(rivers, mid, f.y) alone is not enough (a storey between the lip and a lower river).
   - src/game/easyMode.ts:254 `clearOfWater(stage, x)` (Easy's flags) has no y: give it the flag's y; :70 and :382 (Easy's steps over a
     gap skip where a river spans it): judge by the gap's y.
   - src/game/lessons.ts:431 (the water lesson fires near a river by x): add the y test (s.py against the surface).
   If one is bigger than a small change, name it and go on.
2. Re-run `npx tsx --test tools/inspect/rowWheels.test.ts` (Easy's steps can change the rolls) and refresh the table below
   (`npx tsx tools/inspect/rowWheels.ts`, `OFF=1`, `SEED=2`).
3. Step 3, the look: the painted noria is ALREADY drawn (ART-W2B ad176c947, wheelDraw.ts paintWheel; plain bucket fills only until
   src/assets/props/w2-wheel.webp loads). What is missing is stills of the draft row on the real page. No page route plays the draft
   row; ?fixture=wheel (ENG-26b fa8a92bf6) plays the toys. Shoot a board, a ride, a step-off, a rightward wheel and the great wheel,
   upright and sideways at 2x, from a dev-only route that plants the draft row, or from the toy fixture for a rightward and a leftward wheel.
4. Gates on the head (packet step 4), then this REPORT and reference/handoffs/engine-core.md rewritten (I did NOT rewrite it: context).

## Done
| item | result | plant |
|---|---|---|
| 0: 'p' pinned to G1 = A (nodeAsks.test.ts:38, nodeLetters.test.ts:51/55) | 15 neighbouring and planted files: 104 pass / 0 fail | the ruling's words |
| 1: RiverZone.way, ONE implementation | river.ts way, riverLay rightwards + riverFaults lines, levelCheck hop now t-eng-27's (ad23f8b0a) byte for byte; mirroredRiver and the "(crossed right to left)" suffix deleted; kept: layRiver way -1, layRiverLeft, the tower path | riverLeft.test.ts "ONE meaning": a left leg's river (turned as reflectLeg turns it) = a leftward storey's, same fault words, 7 rows x 2 settings; mutation-checked RED twice |
| 1: merge check | trial merge with ad23f8b0a: river.ts, riverLay.ts, levelCheck.ts clean; ONLY conflict pipeline.ts:64-66, two adjacent imports (onClock / legOverlaps): take both | git merge-tree |
| 2: G6 | NOT an axle shift (pushback accepted 12:10): water found by x alone; frame 0 moved him from the spawn (140,6649) onto beat 10's pond jetty (234,2037). Fix: t-eng-27's RIVER_DEPTH + riverAt and engine.ts's read, byte for byte | src/game/gen2/towerWater.test.ts 2/2: RED with the x-only find, GREEN |
| 2: bots table | tools/inspect/rowWheels.ts + rowWheels.test.ts (gates.yml tool line, about 10 s): ON / OFF / the meter | 3/3; ON test RED on the old read (20 of 50 crossed) |

## Bots table (draft row, seed 1; per wheel: crossing s / scrambles; L = turns left, R = right; all 10 runs shrine, 0 lives, 0 put-backs)
| run | finish | rescues | teach L | edge R | top R | edge R | great L |
|---|---|---|---|---|---|---|---|
| child E v1/v2 | 152 / 232 s | 1 / 2 | 16.1/0, 12.2/0 | never (rescued past)/0, 3.8/0 | 10.8/0, 9.2/0 | 11.6/0, 12.9/0 | 16.1/1, 13.9/0 |
| child N v1/v2 | 288 / 246 s | 1 / 2 | 12.2/0, 9.4/0 | 10.8/0, 11.4/0 | 9.2/1, 11.6/1 | 9.7/0, 8.6/0 | 13.9/0, 11.9/0 |
| middle N v1/v2 | 160 / 213 s | 0 / 1 | 10.8/0, 7.6/0 | 10.0/0, 8.6/0 | 7.0/0, 10.3/0 | 6.1/0, 7.9/0 | 12.3/0, 12.8/0 |
| middle E v1/v2 | 134 / 172 s | 0 / 1 | 12.5/1, 10.8/0 | 11.0/0, 12.4/0 | 9.1/0, 8.3/0 | 13.4/0, 12.4/0 | 15.7/0, 14.6/0 |
| expert N v1/v2 | 183 / 185 s | 2 / 2 | 9.9/0, 9.5/0 | 8.4/0, 8.8/0 | 7.5/0, 7.6/0 | 9.8/0, 8.6/0 | 12.3/0, 11.8/0 |
OFF (rideWheel false, the plant): all shrine, scrambles 0-49 a wheel (e.g. middle N v2 edge 172.9 s / 49). Seed 2 ON: same shape, 0 pond.
Meter (Normal / Easy): 5 boards at 0 bits, 3 step-offs 2.5-3.0 bits, none unpriced; route wheel time 9.4-10.5 s / 11.0-13.2 s.

## Unresolved (named plainly)
- **Rescues at the tower's TURNS, every tier, the expert too (0-2 a run):** stuck x lines up with the turns (turn x 252/605/1142/1329/
  1473/1518 vs stuck 261-360, 527-603, 1041-1104, 1228-1361, 1412-1485). Example: the turn at x 1518 rises 351 px from y 5279 to the
  millrace's near bank (1232-1492, y 4928), through a step at (1118-1298, y 5028) that sits right under that bank; the expert jumps
  there 53-68 s, then is lifted. Draft bricks, the pipeline's turn lay, or the bot: not diagnosed. It belongs to BUILD-26's real bricks
  first (G3: the millrace on a 1700 tower); if it stays on the real row, ENGINE-WORTHY (the turn's steps under a bank).
- Step 3 (stills) and step 4 (gates) not started; engine-core.md not rewritten.

## What the 2-6 builder needs (ENG-26c's list, updated)
- Real bricks in place of the draft's; the stage-table row; delete w2Stages '2-6' and its pinning tests; point rowWheels.test.ts's ROW
  at the real row. G3 and G4 are the builder's (tower width or a narrower millrace; a flag spot 1500-2400 px before beat 5).
- Re-run rowWheels.ts on the real row: the rescues at the turns must be 0 before it is called ready.

## Polish check
No stills yet (step 3 not started). Nothing drawn was changed.
