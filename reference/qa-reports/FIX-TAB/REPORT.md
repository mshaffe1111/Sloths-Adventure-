# FIX-TAB REPORT (R-165.344): the grass tab under World 1's painted stones, fixed at the root in the draw
Engine (draw). Branch t-fix-tab (base 453b69c2 + merged t-int-14 ca74f4fa, which adds no code). Updated 4:58 PM ET.

## EXACT NEXT STEP
DONE (4:58 PM ET): every gate below run, logs in gates/ (rest-summary.txt, gate-*.log); engine-core.md §0zq-TAB written. Nothing left on this packet.

## Done-items
| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | What the tab is + is it on main | FACTS.md §1 (floor lip run under the wall in a notch; on main too: 71 on main's 1-6) | PASS (2:38 PM) |
| 2 | Count | FACTS.md §2: 100 tabs in 16/72 W1 builds, all 1-6 (N51 E25) + 1-7 (N16 E8) | PASS |
| 3a | Root fix in the draw, no stage data | protoArt.ts `stepDownTo` (the highest lower bank beside an end) + `faceCut`; drawGround's lower() and drawBankArt's side() call them | PASS 8d0ecd05 |
| 3b | Planted RED (toy) | groundSeams.test.ts 'R-165.344': planted (first lower bank) = 21 visible lip rows under the block, FAIL; fix = 0, PASS; same test holds the hole check (the notch is the wall's soil from the block's foot down). probe/planted-red.txt | PASS |
| 3c | W1 count after | probe/count-after-fix.txt: 1-6 + 1-7, 16 builds: 100 -> 0 tabs, 43 -> 0 lone strips | PASS |
| 3d | Hole check (pixels) | 160 orphan lip runs: changed px when the run is drawn vs not, base max 559 (143 > 20) -> fixed max 0: nothing can show through | PASS |
| 3e | Reach, every world | probe/endsteps.ts -> endsteps.txt / endsteps-changed.json: 425 open bank ends change step: W1 100 (1-6, 1-7), W5 8 (5-M), W7 53 (7-5, 7-9 Easy), W8 264 (8-2/3/5/6/9); W2, 3, 4, 6, 9, 10: 0 | PASS |
| 3f | Before/after stills per world | stills/before-after/: w1a 1-6, w1b 1-7, w5 5-M, w7a 7-5, w7b 7-9, w8a 8-2, w8b 8-3, w8c 8-6, w8d 8-9; each -sideways, -upright (side by side, before left) and -crop2x | PASS; ACCEPTED by the lead 3:19 PM ET |
| 3g | Gates | table below; gates/ | PASS (funcheck FAIL is the base's, identical) |

## Polish check (stills/before-after, judged at phone size and in the 2x crops)
- W1 1-6, 1-7: the grass tab under the stone/stump is gone; the soil runs on under the art (w1a, w1b crop2x).
- W5 5-M: before, a see-through gap of backdrop down the wall's face beside the step; after, soil (w5 crop2x).
- W7 7-5: before, a pale see-through box under the temple wall's end; after, soil (w7a crop2x). 7-9: same look at this sample.
- W8 8-2/8-3/8-6/8-9: before, a column of chopped lip and face pieces down the wall's end (each stair step's lip run peeking in the notch); after, one clean soil face (w8a..w8d; w8a-stair-before-top-after-bottom.jpg).
- NAMED, not new: where the new step is a deep plinth (48-59 below, e.g. 8-2's wall over its first stair step, 56), the face stops flat at the
  step's top and the wall's soil runs on below: a straight foot edge. That is the existing plinth look on the base (BASE-existing-deep-plinths-
  8-6-x18365-2-1-x1400.jpg: same edge on unchanged ends in 8-6 and 2-1). Suggestion below.

## Gates (D93: every line PASS or FAIL)
| Gate | Result |
|---|---|
| tsc | PASS |
| artcheck | PASS |
| knowncheck | PASS |
| generalitycheck | PASS (26 literals, 26 known) |
| roadmapcheck (after unshallow) | PASS |
| timecheck | PASS (after merging t-int-14: 453b69c2 alone FAILS on VAR-19/REPORT.md:243, fixed at 6ef8de7b5 on t-int-14) |
| vite build (deploy base) + chunkcheck | PASS + PASS |
| coveragecheck | PASS |
| registrycheck | PASS (12 stages) |
| lockall vs 453b69c2 (no --intended) | PASS: 102/102 stages unchanged (probe/lockall-vs-453b69c2.txt) |
| unit suite (3 shards) | PASS: 1385 + 1420 + 1175, 0 fail |
| drawcheck | PASS (737 s) |
| clipcheck | PASS (83 known; its planted never-opening screen FAILED as it must) |
| kbdcheck | PASS (its regenerated stills restored, not mine) |
| paintcheck 0/3, 1/3, 2/3 | PASS, PASS, PASS (170 / 107 / 106 known ids seen) |
| seedlist --check, all 12 lists | PASS each (1-1 161 seeds, 1-5 150, the rest 100; both settings) |
| CI tool line (gates.yml) | PASS: 318 pass, 0 fail |
| tipwalk / tierBots / buildcheck | PASS / PASS (9, 0 fail) / PASS (p95 <= 150 ms) |
| funcheck | FAIL: 22 worse or new (layout flags, 1-1..1-6). NOT this change: the same run on release 1's head ca74f4fa fails with the identical 22 lines (gates/funcheck-base-ca74f4fab.log); a draw-only change cannot move it. Not in gates.yml. |

## Lessons applied / method
- Planted RED before the fix; check the fact on the base before calling a red mine (funcheck); every gate runs, the FULL set (D96); probe hooks never committed.
- Method: a draw fix is proven by a pixel diff with the drawn piece on vs off (hole check), not by stills alone: written in engine-core §0zq-TAB.

## Suggestions
- Plinth packet: draw the lower bank's lip over a deep plinth's foot (step 48-59) after the banks, as stepFootLips does (8-2, 8-6 x18365, 2-1 x1400).
- funcheck's 22 base flags need an owner (layout, not engine draw).
