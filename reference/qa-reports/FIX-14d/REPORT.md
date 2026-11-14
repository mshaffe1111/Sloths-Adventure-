# FIX-14d REPORT (R-165.206). STOPPED on the lead's pause (5:31 AM ET). t-fix-14d from origin/t-fix-14c@e5e69979. Code head 05cf82a8. 11-14, 5:10-5:33 AM ET
**NOT READY: tower.test.ts / towerBots.test.ts RED on 05cf82a8 (11 fails, below); no relist; most gates UNRUN. Not for Matt's link.**
## EXACT NEXT STEP (in order)
1. **Fix the toy-tower reds first** (tests-05cf82a8.txt: tower.test.ts 20/28/34/35/41/46 + towerBots.test.ts 48-53). Cause, read on the
   fixture (seed 2, normal): the turn-back's new UPPER run-on (pipeline.ts towerJoin `turnBackUp`, 726..832 at 5235) ends past the
   ledge under it (lower storey 428..832 at 5516 ends at the SAME x, 832), so a step off its end drops two storeys (628 px). Fix to try:
   end the upper run-on at least ~40 px inside the lower ledge's end (run the lower seam that much further, or shorten the upper one to
   TOP_ROOM exactly and lengthen the lower), then re-run tower.test.ts + towerBots.test.ts. Then the 1-4 tests on raw rolls.
2. ONE relist (`npx tsx tools/engine/addlevel.ts 1-4 --relist`): 14c's listed seeds no longer all build on this code (w1Arc14.test.ts
   lay tests need it; 20 of t-fix-14b's 40 listed seeds refuse by name at a gate top, "rest-c/f ... vine 32 px from the piece's end").
3. Then like-for-like bots again (method below) on the finished head, child tier included (cut here), the fork clips both ways, full Checks.
## Done (pushed)
- **Turn back up (5935defc):** the storey over runs on past the turn's vine, the way he walked, TOP_ROOM (or to the tower's side), sealed
  gate-top exits too; the vine stands pre-cleared under the run-on. The lay records each turn's `walk` (pipeline.ts Laid + assemble;
  types.ts Gen2Stage.tower.turns gets an optional `walk`: Architect's file, one additive field, named for the integrator).
  vineTop.ts topRoomShort takes `walk`: the top must run TOP_ROOM on past the vine that way, face or no face. Lay test (w1Arc14.test.ts)
  planted from the 14c turn (run-on cut: caught; the old exemption alone passed it). Count over raw 1-4 seeds 1-60 both settings: 1102
  short with the run-on switched off, 0 with it.
- **Rotting boughs (7dd25b2b), found by tracing the kid, NOT the vault:** after the turn fix the kid Normal still failed 18/40 at x 1036.
  FT_FRAMES trace (seed 7): a creak drops him onto the sound wood (y 10179), he walks right under the way out (z at the boughs' height,
  overhanging the sound wood's end by 120 px) and off its hidden end at x 974, a storey down. Fix (1-4 data): z runs on from the sound
  wood at its own height (exitDy 80, SOUND_W 640 -> 560 to fit the storey). vineTop.ts `hiddenEdges` + a lay test over every shipped
  roll, planted with the old way out (red on 36/36 raw builds of the old shape; 0/42 on this head).
- **Pushback on the packet's diagnosis (evidence above):** "drop the near-side exemption" in full flags 4392 vines on 100 rolls (every
  same-way link and GOING_UP's v1/v2, where no bot fell); I kept it for the face BEHIND him and check the side he walked toward. And
  the kid's main fall was the rotting dip, not the vault (14c's REPORT read the same x 1036 stuck point as the vault).
## castBots 1-4 (bots/: jsonl + sum.py)
- Kid x40 on the branch's own list (14c's): 14c head N 19 / E 35; after the turn fix N 22 / E 38; after the rotting fix **N 39 / E 40**.
- LIKE-FOR-LIKE (t-fix-14b's list, same seed + plan, on /home/user/w14b = d3501970 and /home/user/w14d = 7dd25b2b with 14b's list
  copied in). 20 of the 40 seeds do not build on 7dd25b2b (named refusal, step 2). On the 20 that build on both, PASS 14b -> 14d:
  kid N 15 -> **19**, kid E 17 -> **20**, adult N 20 -> **19** (one fall, x 444, not chased), adult E 20 -> 20, middle N 12 -> 13,
  middle E 10 -> **16**, expert N 13 -> **19**; child N 4/20 -> 3/6 and child E: INCOMPLETE (runs stopped at the pause). Not yet "no
  worse on every tier": adult N is one worse, child unmeasured.
## Gates on 05cf82a8: tsc PASS. 1-4/tower tests: 79 pass / 11 fail (tests-05cf82a8.txt). UNRUN: the full suite, w1Arc14.test.ts (needs
  the relist), vite build, chunkcheck, artcheck, drawcheck, clipcheck, knowncheck, generalitycheck, roadmapcheck, kbdcheck, buildcheck,
  seedlist --check, tool tests, tierBots. No gate left running (D59). No relist, no clips (cut).
## Polish check: none shot (no stills/clips this task). The rotting change alters the look of the T beat (the way out is one step lower).
## Lessons applied: D57 (queue read at each push), D59, D64 (about 190k tokens of 1M, 19%), D40 (built on 14c's tower turn, nothing replaces it).
## Learned: trace the bot's frames (FT_FRAMES=t0,t1) before believing a stuck x: "fell back down at x 1036" is the route point, not where
  he fell. Run tower.test.ts/towerBots.test.ts right after any towerJoin change (I ran them 15 min late).
## Turnover note: not rewritten (cut at the pause); this REPORT is the handoff. Scratch tools (FT trace, geometry dumps, counts) are in scratch/ (they import ../../src paths from tools/scratch14d: move them back there to run).
