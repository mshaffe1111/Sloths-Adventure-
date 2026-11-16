# ENG-16H REPORT: t-tools-2 merged (twice); five global rules, each planted; 1-6 NOT GREEN, stopped at 43% context (R-165.246)
t-build-16 from 2973477d; packet reference/packets/2026-11-14/ENG-16H.md. Start 7:06 PM ET; stopped 8:19 PM ET at 426k/1M (the box's 40%).
Code head cb88b088: tsc PASS, knowncheck PASS, generalitycheck PASS; roadmapcheck could not run (this clone is shallow: "proofs cannot
be checked"). Bots, the whole suite, build, perf gates, stills and clips NOT run: no GREEN claimed.

## EXACT NEXT STEP (engine tier, in order)
1. **Relist 1-6 on this head**: `npx tsx tools/engine/addlevel.ts 1-6 --par 3 --relist --no-bots` (started 8:17 PM on c2d0d8a4 in a scratch
   worktree; rolls 24/24 CLEAN both settings in 30 s, `libstage-1-6-c2d0d8a4.txt`; the list step unfinished at the stop). Commit
   src/game/gen2/proven/seeds-1-6.ts + provenIndex.ts from that run only.
2. **Re-prove every other moved listed stage** (`lock-check-97f83a4a.txt` vs t-tools-2@5d0d33be: 30 of 102 moved besides 1-6):
   `npx tsx tools/engine/seedlist.ts <id> --check` for 1-1, 1-2, 1-3, 1-4, 1-5, 1-7 (started, unfinished); relist any that fails.
   Moved by the walked span (collectibles): 1-1..1-5, 1-7, 5-7, 5-9, 6-1..6-7, 6-9, 7-1, 7-3, 7-5..7-7, 7-9, 8-1..8-3, 8-5, 8-6, 8-8, 8-9;
   by the floor fill (platforms): 1-7, 8-2, 8-3, 8-5; goals moved on 1-2 and 8-2 (easyGoal/normalGoal: read why before relisting).
3. **1-6's meter red, a Designer/lead call** (`meter-1-6-97f83a4a.txt`): w1Arc16.test 'difficulty meter' reads Normal 3.3 (band 5.5-7.5,
   DIFFICULTY.md:61), Easy 1.8; 1-6's raw score (10.8-12.1) is now under 1-1's (12.4-15.2). Most of it is TOOLS-1's meter fix (each liana
   scored once: TOOLS-1 measured 9.5 -> 6.4 on an earlier 1-6); the floors under the perches (a miss there was a hidden death) take some
   more. Not loosened (LAWS 22). The stage is easier than its band by the corrected meter: harden 1-6 or re-set its band (Matt's number).
4. castBots 1-6 seeds 1-40 both settings on the new list (0 rescues, 0 sealed); read the expert's sealed doors against the walked span.
5. The whole suite on the head after 1-4; re-pin only after it (rule 20). Then stills + clips (shoot.mjs / exit.mjs, CLIP=1, copied here).

## Done-items (each planted: `python3 reference/qa-reports/ENG-16H/planted-faults.py`, 4/4 CAUGHT, restored GREEN, planted-faults.out.txt)
0. **Merged origin/t-tools-2** 5d0d33be (8b8dc02a, 36 conflicts) and 19b45a06 (3fa47ddc, the lead's 7:59 PM). Both sides had deleted a
   hand-built stage (here 1-6's proto, there 1-7's): the union deletes both (StagePlan, W1_ROOMS ['1-4'], section rows; flowerReach and
   sectionTrack walk 1-9; World 1's room dressing held on a toy room). firsttimer.ts = ours + BUILD-17's shallow-pit face + POLISH-9's
   inputGrace; pitClimb.test both sets. pipeline.ts's forward-end flight on withSetting (settingDials.test 19/19).
0b. **Soft-pit floors never end at a hole** (pipeline.ts pitFloorJoin + pitHoleFill, a pass before the settle; every stage). The merge
   made every 1-6 roll throw (INT-9's settle: the creaky landing's stair stone over the void under the limb) and then fail INT-9's
   per-gap ruler (drop.untyped / floor.unmarked under FAR's boughs). The floor now reaches the next earth under a floating perch.
   pitJoin.test.ts 3/3 (toy floors, toy bank, 1-6 rolls 1-6 both settings). Plant 'pit-join': RED.
1. **The walked-span petal lay** (gen2/walkedSpan.ts; fillSockets): petals inside [farthest set-down, earliest take-off] of the BUILT
   piece, by the engine's own flights; an empty span puts them on the next piece. walkedSpan.test.ts 2/2; plant 'walked-span': RED.
   The packet's "b1 builds 83-118 px against 280 in its data" did not reproduce: first-liana b1 is 280 px built on seeds 1-3 Normal.
2. **Liana pit way back**: the stair is laid by backPit for every back pit, and ENG-16G's "fell into this pit 3 times" record is written
   only after pitWayUp found the way up, so on all six the stair was there and taken. The bot fault: back up the stair his way was BACK,
   and on the liana the "keep the way he was going" rule kept it, a let-go on the backswing into the same pit (s14/s20/s21). Fixed in
   firsttimer.ts (on a liana: the side of pastLiana's point). pitClimb.test.ts 13/13; plant 'stale-way': RED (both bots, from 0.3 rad).
3. **The vine creature's tell** (vineSnakePiece.ts `held`): no startle inside TELL_MIN (predators/core.ts 0.5 s; the packet named
   rolling.ts, which does not exist) of his catch. vineSnake.test.ts 15/15; plant 'tell-min': RED ("let go 1 frame after the catch").
4. **requiredMove.test.ts** walks 1-2 (layout 1's no-bounce run: 3 soft falls, 0 bounces; no-double: a rescue); assertions unchanged.
   1-1 does not need the bounce (no-bounce run clean). The "every listed seed" sweep was NOT run (step 2's lists move first).
5. The story keeper's 1-6 lines (R-165.260, t-story@88d35b8e, 1-6 rows only), verbatim in w1Arc16.test.ts.
6. 1-1 tier calibration re-run on the merged bots (a5c04e42: same 1-1 and bots as the head) and recommitted; tierBots.test 7/7.

## Polish check
None: no stills or clips were shot (cut at the context line). Nothing here is claimed to look right on a phone.

## Pushback
- The packet's TELL_MIN source (rolling.ts) does not exist; it is predators/core.ts:19.
- The false liana still startles on the catch: its tell (a vine that does not swing) shows before he takes it. Lead's call.
- Walked span on every stage moves 29 stages' petals; that is rule 22's cost, and every moved list must be re-proved before any link.

## ENGINE-WORTHY / Unresolved
- 1-6's meter band (step 3). Lists 1-1..1-5, 1-7 unproven on this head (step 2). 1-6 list, bots, suite, stills, clips not done.
- 1-7 may take `gathers: 'petals'` now that StageSpec.gathers is merged (stagePlan.ts SEALED_LINES note): the lead's call.

## Learned / Method update
- Merge the integration base FIRST and roll the stage before any fix: the merge broke 1-6 twice (settle, ruler) before my items mattered.
- A first tsx run includes ~80 s of transform; time a build twice before calling it slow (I mis-read 27 s a build).
- Proposed level.md rule: a pit floor never ends at a hole under a perch (check: pitJoin.test's hole scan on every rolled stage).

## Lessons applied / Turnover
D19 (the lay and its test call walkedSpan), D29, D30 (times from date), D36, D55 (context %), D57 (queue read at pushes).
Turnover: reference/handoffs/engine-core.md §0zc (cfc78b36).
