# ENG-27 REPORT (stopped by the lead at 8:33 PM ET 11-20, D76: real context ~427k). Base 0eefc707e; branch t-eng-27; code head 458315ba
## EXACT NEXT STEP (ENG-27b, from t-eng-27 head; read only this section, D90)
1. Setup: worktree of t-eng-27, `npm install --legacy-peer-deps` (restore package-lock.json after: it is tracked).
2. UNRUN, run first: `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` on 0eefc707e, then `--check lock-base.json` on
   t-eng-27: expect 102/102 unchanged (no shipped graph has a leg mark; levelCheck's run-leg rule and w2Finish's side read only flow 'legs';
   riverAt changes play, not layout). Then the suite in 3 shards (my run was on a mixed working tree: UNRUN), seedlist --check of every
   listed stage (riverAt + firsttimer.ts changed: D86's spread rule), tierBots.test, then THE FULL SET (gates.md) at ENG-27b's final.
3. Bots on the toy (step 0's last open item; `npx tsx reference/qa-reports/ENG-27/botTable.ts middle,expert normal,easy 1,2,3`,
   botTable-1.txt): seed 1 middle/expert finish both settings (192.8 s / 205.3 s, 2-4 lives, 1 rescue); seeds 2-3 drown in the HOME
   leg's rivers (56-94 lives, 900-1100 s). Seed 3 drowns with the home leg laid RIGHT too (probe18.ts: 76 lives): that roll's rows, not
   the left leg. Seed 2 is direction-sensitive (5 lives laid right, 56 left). First death traced (probe19.ts, t 92.1): he runs off the
   near (right) bank at full speed as a log slides out and lands in the 72 px gap. Suspect first: firsttimer.ts:2733 `wet()` reads
   rivers by x alone (the out leg's rivers lie over the home leg: use river.ts riverAt or the leg's own rivers), then the edge look
   (floorAt at p.x + dir*look). Re-run the table; planted toy: seed 2 left within 2x its right-laid lives.
4. The column rescue (every seed): the bot stands ~13 s on the down column's last storey (seed 1: x 18075 y 1217) and is rescued to
   the floor. towerRoute.ts towerCorners `within()` draws a straight diagonal down a no-vine descent (dropsDown): give it each storey's
   end, as it gives a vine field its vines. Planted: rescues 0 on the toy, seeds 1-3.
5. Then the packet's items 1-6: NEW 1 the mail boat pacer, NEW 2 the post, the `race` bot skill, the art by ART-NEXT-b's inventory ids
   (origin/t-art-next f4f724269, reference/qa-reports/ART-NEXT-b/REPORT.md; I did not open it: no id read, none wired), stills/clip.
## Step 0 (the READY toy, show first): DONE for the lay; bots partly (item 3-4 above)
- The toy: src/game/gen2/toyHome.ts `A Pg1> Xw1> R /D Dc_ /L Pf1< Pw1> Mg1> Ww1> R Sw1> E` on World 2's ground and river rows; laid by
  gen2 on a listed test row (tools/inspect/homeToys.ts: withTestStage + plantSeedList + w2Finish, ENG-26's pattern, D75). Map with the
  middle bot's path: toy-map-s1-normal.png (toyMap.ts).
- Planted (src/game/gen2/legsHome.test.ts, 5 tests; legs.test.ts +3): RED same-ground `/L` overlay refused BY NAME on every roll both
  settings ("legs: leg 2 (left) overlays leg 1 (right) ..."); GREEN `/D /L` clean on 6 seeds x both settings, home leg >= LEG_CLEAR (260)
  under the out leg, rivers on it dir -1 way -1, out leg's dir -1 unmarked, >=3 flags and >=10 petals on it, same stage from same seed.
  RED evidence: red-base-0eefc707e.txt (base: the toy throws "a river in a leg laid left is not mirrored yet"; without the shrine fix
  0 petals; without the verdict the RED test fails).
- Engine changes (all general, no stage id: generalitycheck PASS): legs.ts reflectLeg turns a left leg's rivers, logs, splash-back and
  riding petals (tail / wheel pond / sluice refused by name); legOverlaps + LEG_CLEAR; pipeline.ts: no throw for left-leg rivers, the
  start's back wall when a later leg lies beyond it, the overlay refused alone in checkStage (no repair swaps: refuseNotThrow's rule);
  river.ts RiverZone.way (Architect's type: a field ADDED, flag for review) + riverAt/RIVER_DEPTH 120; riverLay.ts riverFaults judges a
  left-crossed river in its own frame; levelCheck.ts hop limit relative to him, 'past the shrine' by the stage's travel, no link between
  two run legs; engine.ts water check by riverAt (was x alone: a life every frame on the home leg under the out leg's river);
  w2.ts w2Finish splash pond on a left leg sets him back on its right bank; firsttimer.ts bots follow the lay's route on a stage of legs.
## Gates (head 458315ba)
| tsc | PASS | generalitycheck | PASS (26 literals, 26 known) | legs.test + legsLay.test + legsHome.test | PASS (25/0 at 8:30 PM ET) |
| suite (3 shards), lockall vs base, seedlist --check (all lists), tierBots, castBots, coverage/registry/paint, drawcheck/clipcheck | UNRUN |
## Found, open (named)
- Inspector phantom (pre-existing): findRoute hops from the out leg's last bank to a way-down column's floor through its wall (levelCheck
  drop links do not see walls; legsLay's DOWN_CODE too). Bots no longer follow it on legs; the meter/coverage tools still read findRoute.
- engine.ts:3607 a SEALED door pushes him back to x - 35, vx -140: wrong way on a stage that ends LEFT (2-7 is a sprint: never seals).
- The toy's home leg is ~3x the out leg (chunkSeconds fills); a level's lengths are its builder's.
## Polish check: no stills/clip of the real page yet (the toy map only). Pushback: none. Learned: an out-and-back puts one leg UNDER another,
and every "by x alone" lookup (river under him, past the shrine, wet ahead, falls' links) breaks: grep `x > r.x0 && x < r.x1` first.
Lessons applied: D30, D57, D59 (the suite named UNRUN), D75, D94, D97. Turnover note: engine-core.md §0zq-27 added (top), this commit.
