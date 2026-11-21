# ENG-27b REPORT (stopped by the lead at 10:46 AM ET 11-21, D76: real context ~369k). Base 0eefc707e; branch t-eng-27; code head 5a579bb16
## EXACT NEXT STEP (ENG-27c, from t-eng-27 head; read only this section, D90)
1. Setup: worktree of t-eng-27, `npm install --legacy-peer-deps` (restore package-lock.json after). Every engine step below is on THIS head.
2. NEW 2 the post: WIP, NOT committed as code: `git apply reference/qa-reports/ENG-27/ENG-27b-post-wip.patch` (post.ts, gen2/postLay.ts,
   pieces/postPiece.ts, postDraw.ts (no-op until art), gen2/postLay.test.ts; hooks in pipeline.ts layChaseStage + PIECES_OF, types.ts
   Collectible.mark 'letter'|'reply', gen2/types.ts GraphBrief.post, stageGenerator.ts GeneratedStage.post, engine.ts draw hook, w2.ts
   W2_POST_ART, toyHome.ts TOY_DOORS 2). State: tsc PASS; postLay.test tests 1-2 PASS (slot on path on 12 rolls, planted RED 60 px up;
   a door opens on the pass); test 3 (bots) FAILS on 'middle normal seed 1: every letter posted' after the LAST edit (the slot search
   from the walked span's middle out in 20 px steps, SLOT_CLEAR = 2 x PICKUP_APART). Before that edit the bots posted 9/9 but 4 of 12
   rolls were refused ('only 1 route piece'). Find which door the run lacks (scratch probe: compare homeStage(1).post with the played
   stage's sim.e.collectibles letters: the played stage once dropped a NEW letter 38 px from a petal; the slot search may now take over
   a petal the played assembly moves). Then the 12 rolls clean AND 9/9 bot runs, commit.
3. The race margin as SHARES (the lead's ruling, 10:46 AM): PacerRow.margin becomes a share of the careful middle's time, Normal 7%,
   Easy 12% (2-7.md: 3/42.1, 5/47.8 → 0.07, 0.10; the lead said 12% for Easy: use the lead's numbers); pacerLay.ts seconds = min(middle
   x (1 + share), rideOnly - under); W2_RACE.margin {normal: 0.07, easy: 0.12}; DROP TOY_RACE (toyHome.ts) and use W2_RACE on the toy;
   pacerLay.test asserts the share. Re-run pacerLay.test: middle 6/6 ahead, ride-only 6/6 behind (on 5a579bb16 with TOY_RACE x2.5 the
   middle won 6/6, thinly: normal seeds 1, 3 by 0.2 and 0.6 s; expert normal 2/3, lost seed 1 by 0.1 s after 5 deaths).
4. ART (the lead did not rule against): pack 2-7's 7 frames (w2-next#mailBoat, #mailBoatB, #letter, #letterB, #reply, #replyB,
   #doorOpen; cuts at origin/t-art-next:reference/art/hfnext/cut/{boat,boatB,letter,letterB,reply,replyB,door-open}.png, catalog rows
   in t-art-next's CATALOG-MASTER.csv, file 'origin/t-art-next:...') into src/assets/w2-next/w2-next.webp (ENG-ROCK's precedent:
   21af89b4e), rows' file + frame rects, `tools/art/catalog_master.py --emit`; then pacerDraw.ts drawPacer (two rowing frames on its lane,
   ~240 px long against Pokey's 89.1) and postDraw.ts drawDoor / drawPostItem by those ids (w2-props#door is packed already). No
   code-drawn stand-in. Pacer.lane is the race leg's lowest river surface: judge it on stills (behind the banks on layer 'back' it is
   hidden over every bank; the design wants it beside him in every frame: the lane is the open question, show the lead first).
5. Stills of the toy upright + sideways, the whole screen (the boat beside him on the race leg, a letter going into a slot, an open
   door) and a CLIP of the race leg with the boat in every frame (D63). REPORT: the race table, "What the 2-7 builder needs".
6. THE FULL SET (reference/methods/gates.md, D96) on the final head, the suite in shards, lockall vs 0eefc707e, every list --check,
   coveragecheck (the race and the post must price), registrycheck, paintcheck, generalitycheck, tierBots.test, funcheck.
## ENG-27b: what was done (10:48 AM ET)
- Lockall (NEXT STEP 2): 102/102 unchanged, base 0eefc707e vs f2705ecd, 3264 builds each, byte-identical (two --out runs compared by
  --check's logic). Nothing shipped moved.
- Steps 2-3, one root (647e172d9): towerRoute.ts towerCorners left a column's last turn for after the stage's last leg: the bot reached
  the home leg's end, walked 17,500 px back to the column through every river and home again (56-94 lives), and at the column's last
  storey read the way on as straight down through its floor (~13 s, rescued). Now a column of a stage of legs climbs its own last turn
  at its foot (keyed on gen2.tower.legs: up/down towers unchanged). ENG-27's suspect wet() by x alone was ruled out first (a y-aware wet
  changed 0 of 6 rows). Planted: legsHome.test 'the column's last turn...' RED without (seed 1), GREEN with; toy 9/9 finish, 0 rescues,
  1-6 lives; seed 2 left 4 lives vs 6 laid right.
- NEW 1 (5a579bb16): pacer.ts, gen2/pacerLay.ts (rivers matched to flown rows by speed + log length: no RiverZone change), pieces/
  pacerPiece.ts, StageStats.race (badges.ts: the verdict; the medal itself is the Designer's), W2_RACE, SKILLS.race / SKILLS.rideOnly
  (firsttimer.ts), pacerLay.test (4 tests, RED for each bound and an unflown row; the respawn re-place; the bots). Type additions for
  the lead's review: GraphBrief.pacer, GeneratedStage.pacer, StageStats.race (and, in the WIP patch, GraphBrief.post,
  GeneratedStage.post, Collectible.mark 'letter'|'reply').
- RiverZone.way (ENG-27's field): a river in a leg laid left keeps the screen's dir (what the engine moves logs by) but must be judged
  in its own frame: riverFaults reads 'upstream' and 'with him' from dir relative to the way he crosses, and without `way` a fair
  river mirrored left reads as flowing against him (legsHome.test 'judged in its own frame' plants it). The alternative, a dir in his
  frame, would change what every engine reader of dir does; one optional field read only by the judge is the smaller change.
## Gates (code head 5a579bb16 unless named)
| gate | result |
|---|---|
| tsc | PASS (5a579bb16) |
| lockall vs 0eefc707e (f2705ecd) | PASS 102/102 |
| suite shard 1/3 (647e172d9) | PASS 1285/1286, 0 fail |
| suite shards 2/3, 3/3 (647e172d9) | UNRUN at stop (running) |
| seedlist --check 1-1..1-8 (647e172d9) | PASS |
| seedlist --check 1-9, 2-1, 2-2, 2-4, 2-5 | UNRUN at stop |
| legsHome.test, pacerLay.test (5a579bb16) | PASS |
| tierBots.test, THE FULL SET | UNRUN |
## Learned
- A stage of legs breaks every tool that assumed the route ends at the last section (towerCorners' leftover turn): when a bot's route
  looks wrong, print the route's corners before tuning the bot (one print found steps 3 and 4).
- A race decided by an absolute margin is only as fair as the leg is long: state margins as shares (the lead's ruling).
- The played stage can drop a collectible the build laid (the post's new letter 38 px from a petal): test a NEW pickup on the played
  run (homeRun), never only on buildGen2Stage.
## Lessons applied: D76 (stopped at the lead's line), D86/D96 (the full list named, the unrun named), D94 (reds are this branch's),
D101 (proven on the rolled toy, played the game's way), D102 (read by greps and line ranges), D103.

# ENG-27 REPORT (stopped by the lead at 8:33 PM ET 11-20, D76: real context ~427k). Base 0eefc707e; branch t-eng-27; code head 458315ba
## (ENG-27's) EXACT NEXT STEP for ENG-27b: DONE through step 4 and NEW 1; see ENG-27b above
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
