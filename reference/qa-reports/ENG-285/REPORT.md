# ENG-285 REPORT (tonight's part: steps 1, 1b, 1c, 2 MEASURE): the judges and bots fly the engine's Pokey
Engine, t-eng-285 from t-int-12 ce4ad461. Started 7:55 PM ET 11-18 (by `date`); wound down on the lead's word 8:29 PM (real context 414k).
Commits: 818319b3 (step 1, the model hash sent at 8:12 PM), 8eae49e0 (1c), 8ac8ffc9 (1b), 03ba54ef (engine-core.md §0zo-285), 0db8e62a + this (report).

## EXACT NEXT STEP (ENG-285b, Thu 8:30 AM ET, on t-eng-285's head, after the lead rules on the table below)
0. The unit suite is UNRUN as a whole (shards 1-2 stopped at the 30-min background limit: run it once, in the background, limit over 40 min).
1. Seed lists: none fail (all 11 PASS). So no relist is forced. The lead rules whether the stages whose
   layouts moved but whose lists pass (1-6, 1-8, 2-1) are re-proved anyway (`seedlist.ts <id>` = a new list hash; QA pins re-picked).
2. The red pin: src/game/gen2/seeds.test.ts:40 (a curated World 6 seed's section plan moved: w6s pieces, 6-1). Re-curate or re-pin
   per its own file's method, as the model change intends (never loosen; law 22). Then the suite's other shards' reds (table).
3. castBots every shipped stage whose layouts moved (1-6, 1-8, 2-1 tonight; packet step 3's 1-6 list: child N L28, child N L34,
   middle N L39 (still a rescue tonight: "fell back down from here 8 times" at the gorge x44004, traced with (a) in: he climbs back
   out at 272.8 s), kid N, adult N), child/middle/expert 40/40 both, each miss traced. tierBots needs NO recalibration (below).
4. Packet steps 4-5 as written (the full CLAUDE.md list once on the final head, funcheck, coveragecheck, registrycheck, every list
   --check, lockall vs main --intended <the lead's stages>; the still pair of one back-swing hop, old vs new path).

## Done-items tonight
1. **One model (818319b3).** airStep turns for every caller (`turn` gone); pressLaunches/forwardEndLands climb his grip from the press
   frame to the leave frame (`pressClimb`); the bot's drop aim reads the press at the frame it reaches the engine (`pressIn`).
   riverLay's letGoFall/fallOnLog split as ENG-24c wrote it. Planted: src/game/judgeFliesEngine.test.ts (every press of one swing x
   both grips, 120 presses, vs the real engine via InputEngine: worst 1e-3 px; let-gos over logs: the judge's own landing = the
   engine's on every sampled pair, the logs' clock checked each frame): RED on the base model (an early press leaves 10 px lower;
   landings disagree). lianaRide.test.ts "aims its presses": 17 of 17 presses off the aimed frame with the old aim, 0 now.
   Finding: the JUDGE's log clock already matched the engine; the one-frame slip was the BOT's.
2. **1c (8eae49e0).** vineClock = gameTime (+ a test-only shift). Planted src/game/lianaClock.test.ts (1-6 L3, straight run vs a flag
   resume, 30 frames): RED on the old engine (-0.3275 vs -0.3608 rad). The 107 tests that read the vine clock: 107/107.
3. **1b (8ac8ffc9).** (a) relocate's level points within LEVEL_REACH 600 px, else the plain nearest: planted (red on the old code: put
   at x 37000). (b) pitWayBack NOT changed: not reproduced (castBots 1-6 child+middle N L28/34/39 on the step-1 head: 5/6 pass, no pit
   stall; t-build-24's own head L34 middle N: no stall over 12 s; a toy from the description climbs back on the old code). No red, no fix.

## MEASURE (lock/lists on the step-1 model 818319b3; bots and suite on 03ba54ef; 1b/1c touch no gen2 code)
| Check | Result |
|---|---|
| lockall --layouts 16 vs base ce4ad461 | 89/102 unchanged. Moved (layouts N / E): 1-6 16/6 (whole layout), 1-8 4/0 [3,7,10,11] gen2 only, 2-1 1/0 [13] proto.gen2 only, 3-8 13/16 proto.thorns only, 4-4 5/0 [3,9,10,13,16] whole layout, 6-1 16/16 whole, 6-3 6-6 6-7 8-3 16/16 gen2+collectibles, 7-5 16/14 whole, 7-9 15/11 gen2+collectibles, 8-5 16/14 gen2+collectibles |
| lockall vs main 6e7b85f8 | 15 stages: the 13 above + 1-7, 1-9 (INT-12's own: base vs main moves exactly 1-6, 1-7, 1-9, all layouts) |
| seedlist --check | all 11 lists PASS (1-1..1-9, 2-1, 2-2): the verdicts refuse 0 seeds of each (1-6 100/100 in 836 s; 2-1/2-2 rerun after the first runner's 30-min stop) |
| tierBots.test.ts | 7/7. Full calibration (3 tiers x both x 1-40): 200/200 runs IDENTICAL to calibration-main.jsonl: no tier moves; recommit not needed |
| engine tools' tests (gates.yml:135 list) | 225 pass, 0 fail, 1 TODO as before (chase child reaches the fork 1 of 3, ENG-B4) |
| unit suite (CLAUDE.md set, 3 shards) | UNRUN as a whole: shard 3 1405/1405 PASS; shards 1-2 stopped at the 30-min background limit after 1057 and 1188 tests: 1 red, seeds.test.ts:40 (above), none other |
| drop judge, ENG-24 calib.ts rows, base -> now | Normal: back wait 0.97->1.03 s, gap200 wait 1.50->1.23 s, the rest equal. Easy: back 82->77% (Easy bar 85%), ride/deep wait 0.57->0.60 s, lashed 0.60->0.63 s (bar 0.6), gap280 46->45%. BUILD-24c lays 2-4 on these |
| back-swing hop reach | +4..28.5 px forward (median 22-28) over every back-swing press of a 300/420 px liana: the 20-30 px expected |
My read: small, as expected. No list fails, no tier moves; the stages that move are those whose laying flies a back-swing or a let-go
(the 1-6 lianas; World 6-8's swing and thorn placement; 4-4, 7-5 re-roll). The relist question is the lead's (EXACT NEXT STEP 1).

## Found (for the lead)
1. Still drifted: a no-steer air tick (dir 0) brakes at PHYS.airDec 520; the engine brakes 0 (refined touch) or airStop 1300
   (engine.ts:2587). Callers protoCheck.ts:50, jumps.ts:240 (and any dir-0 frame in levelCheck/score). Same class; worth an R-id.
2. vineFromLog and lianaWait aim with `clock + lag` (the same one-frame slip as the drop aim had); not changed tonight (no plant yet).
3. INT-13 merging t-eng-24c: take this branch's riverLay (no `, true`); letGoCue CUE.climbFrames -> 0 (pressLaunchesFrom climbs now).

## Lessons applied / method
D59 (long runs in the background; the killed list runner named and rerun), D64/D76 (my context estimate read low: 414k real), D83
(probes in the scratchpad, not the repo), D86 (the measure lists what the CLAUDE.md list will need), D19 (the test calls the judge's
own landing, not a copy). Method update (engine-core.md §0zo-285): a harness sets the game's clock BEFORE placing a swing now.
Turnover note: reference/handoffs/engine-core.md §0zo-285 (03ba54ef).
