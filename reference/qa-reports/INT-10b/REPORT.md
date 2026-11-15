# INT-10b report: the joined soft-pit floor at its root, the reds of the integrated branches, link #4 (1-6 + 1-7's glancing eagle)
Branch t-int-10b (t-int-10 1750cdbc + 9d8c9fda, ENG-LOOK d2bc1d89/c738e52f, t-eng-watch2 8fbaaacf). Opus 5.5 xhigh. Stopped at
~63% context by the lead's ruling A (12:59 PM ET): gates on this head, then hand off.

## EXACT NEXT STEP (a fresh member, from t-int-10b's head; read gates-rest.txt first)
1. **landingRepair.test:63** (red since ENG-PETAL; GREEN at 7e9fe4d8^): replace the existence proof (seeds 50001-50100 until one roll is
   repaired) with a PLANTED roll: build 1-1 raw seed 50001 Normal (buildGen2Stage + w1World), move one petal to a dead zone (a spot
   deadZones() returns, e.g. over a log under a log as the toy at :20 does), run `repairLandings(st.platforms, st.collectibles, 'normal',
   within)` (landings.ts; the pipeline calls it at pipeline.ts:4123) and assert deadZones is empty after and the petal moved. Keep the
   100-roll clean check. No widened seed range (the lead, agreed).
2. **Three more reds, all red at 1750cdbc** (before this branch; classify at t-eng-petal 3802db95 / t-eng-dr c3c7e658 / 7e9fe4d8^ the
   way this report did, fix at the root, restate only with a revert proof): seeds.test "every shipped gen2 seed still builds and passes
   levelCheck"; walkedPath.test "D: gen2 stages of four worlds ... every standing petal ... is inside"; w8Fair.test "8-2: no fungus step
   floats over the void". (w5.test "the inspector on 20 rolls" failed in the loaded shard only: GREEN alone on this head.)
3. Then the suite again (3 shards), and every gate gates-rest.txt did not reach; `npx tsx tools/engine/lockall.ts --layouts 16 --check
   <base lock>` (record the base at 1750cdbc with --out in a worktree; expect 1-1, 1-4, 1-6, 1-7, 1-8, 8-3 and every stage with soft-pit
   holes to move, and say why).
4. Stills + clips on that head with `PORT=5291 reference/qa-reports/INT-10b/shoot.sh` (dev server first: `npx vite --port 5291
   --strictPort`): 1-6 L1 joined floors at x 28296 (creaky landing) and 45650 (gorge), low and high, Normal/Easy, fresh/old, up+side;
   1-6 walkthrough x 25000-31000 both settings both ways; 1-7 eagle: glance (#1), fake-out (#5), caught walk (#1 walk), Easy's longer
   tell (#1 glance easy), up+side. Judge the whole screen (D79). Then `python3 tools/testlink/build.py --published`; the LEAD publishes.

## Done-items (heads pasted from git; evidence in this folder)
1. **Root fix** (f2ab9fa6, c40a9bb5): pipeline.ts `joinPitFloors`: joined soft-pit floors are ONE piece (to a bank: lengthened, bank
   deepened; one height: merged; a step: the deeper reaches the shallower, which is deepened). Planted first (plant-first-red.txt).
   Slot scan, 8 listed W1 stages, raw 1-10 x2: 1-6 10/20 -> 0/20, others 0 (slots-before/after.txt).
2. gen2Pits.test:61 on each W1 stage's first two LISTED seeds (ruling A 12:07; 1-8 raw seed 2 is a still-fork refusal): GREEN.
3. **Lists**: seedlist --check PASS for all 8 W1 stages (fix: seedlist-checks-fix.txt; 1-7/1-8 merged: -merged.txt; 1-4: castBots-1-4.txt).
   No relist needed. tierBots 7/7.
4. **Reds of the integrated branches, fixed at the root**: artDress (dcdb036f), G8 + levelWalls (1fb89f19): t-eng-dr removed 1-8 from
   HAND_STAGES while t-eng-petal's tests read it; chase x3 (ENG-LOOK cherry-picked, 49/49); writtenKeys (1-9's seed-1); 1-4 paired petals
   (0f450f06: climb trail under a fig gate starts at the shut lid's head stop; pairPetals reach 38 px; harness first hand); 8-3 L2/L3 and
   KID_RUNS_59 restated with revert proofs (diff-83-join.txt + sheet-83-L2.png; 7e9fe4d8^ green).
5. **t-eng-watch2 merged** (71d7bedc): a spent sweeper never re-checks or glances (planted); still fork's facing plant re-pointed at
   passAt 'far'; the still-fork eagle keeps its glance (lead 12:38).
6. **castBots 1-40 x3 tiers x2**: 1-6 = INT-10's (child N 38/40: s23, s34); 1-7 all 40/40; 1-8 child N 37/40 (s7/9/13 = t-eng-dr's);
   1-4 child 11-12/40, expert 25/40 (identical at 1750cdbc, seeds 1-10: pre-existing, climb rescues).
7. planted.py 12/12 RED, restored GREEN.

## Gates (code of 642cfda6; later commits are tests/reference + 1fb89f19's three test/constant fixes, each run GREEN alone)
tsc 0 | suite: shards 1-2 0 fail, shard 3 7 fail (5-9 kid runs + G8 FIXED after; landingRepair, seeds, walkedPath, w8Fair: step 1-2;
w5 inspector GREEN alone) | build + chunkcheck PASS | artcheck, knowncheck, generality, roadmapcheck PASS | drawcheck, clipcheck,
kbdcheck, buildcheck, seedlist 1-1, tool tests, tierBots: gates-rest.txt | lockall: NOT RUN on the final head (step 3).

## Polish check
8-3 L2 x 4650/7050 (sheet-83-L2.png): one rock floor, no seam or float, upright + sideways: PASS. 1-6/1-7 stills and clips: NOT SHOT (step 4).

## Pushback
- "Relist 1-1..1-7 as needed": none was; every --check passed. The s23 "regression from the t-eng-dr merge": the stage and the swing are
  identical at 3802db95; ENG-B6's liana-hop hold only moved the bot's random path onto an old fault (below).

## Unresolved (named plainly)
- **A liana swings the hanging hero into a bank's face; a let-go there falls THROUGH the bank** (1-6 s23: x 32697 y 765 vs top 726, dead
  at 1525; s23-trace/frames.txt; swingInto.mts 40/40 layouts). Lead 12:27: separate xhigh packet (R-165.271).
- **The tree_climb grab takes the FIRST vine in reach, not the nearest** (engine.ts ~2086): snaps him 55 px in a dense field. Same packet.
- 1-6 child N s34 and s23's pit stuck; 1-8 child N s7/9/13; 1-4's climb bots (all pre-existing).

## Learned
- A bot "regression" from a merge can be a random path moved onto an old fault: compare the stage and engine at both parents first.
- A merge that deletes a stage's plan on one side breaks every test that builds that plan on the other: grep the deleted key at merge time.
- castBots/lockall spawn workers that compile what is on disk: merge and edit in a side worktree, then fast-forward.
- A test that stops at its first miss hides the class: list every miss (pairedMisses.mts) before choosing the root.

## Proposed method changes
- seed-list.md / integration: after a merge, `git grep` every key the merge removed (HAND_STAGES['1-8']) in tests of the other side.
- gates.md: "builds" checks read LISTED seeds; refusing raw rolls is the list's job.

## Method used / Lessons applied
methods/level.md (rules 12, 14, 19-22, 27-29), gates.md, seed-list.md. Lessons: D19, D21, D29, D36, D37, D40, D43, D48, D59, D67, D74, D79.

## Turnover note
reference/handoffs/engine-core.md section 0zh (acc371f6).
