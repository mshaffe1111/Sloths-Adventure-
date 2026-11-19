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

# ENG-285b (Thu 11-19, a fresh member on t-eng-285): the last two drifts, the final model hash, the measure, the re-prove
Started 1:48 PM ET (by `date`). FINAL MODEL HASH ba6b225b sent to the lead 2:19 PM ET (box 3:30 PM). Commits: 26f5e14b (drift 1),
00bc2c77 (drift 2 + plants), ba6b225b (DROP ON A LOG, ruling A), e236233c (curated seeds re-pinned), this report + engine-core.md §0zo-285b.

## The two drifts (R-165.297), each planted against RealPlay through the game's own InputEngine
1. **No-steer air tick (26f5e14b).** airStep dir 0 braked at PHYS.airDec 520; the engine (refined controls, the default) keeps his speed
   and brakes at PHYS.airStop only while Down is held. airStep(b, dt, dir, hold, down). Plant judgeFliesEngine.test.ts test 3: 6 launch
   speeds x 5 steer plans (coast, Down, steer then let go, push back then let go, let go then Down), 24 frames each: RED on the old tick
   (frame 1: engine vx 285.0, airStep 267.7), GREEN to 1e-3 px. The one dir-0 caller with speed: tools/inspect/jumps.ts.
2. **The bot's liana hop aims (00bc2c77).** Measured: in one engine frame the vine clock steps, the catch scan reads his place from the end
   of the LAST frame against THIS frame's clock, then he moves; so the hop's vine clock is the press frame's (pressIn(lag)) and the take-off
   the frame before. `hopAim` names both; lianaWait and vineFromLog use it (both read `clock + lag`: a frame early on the vine, and the lag
   never rounded to the frame the press reaches the engine on). The plant exposed two more slips of the class, fixed in the same commit:
   the press frame is steered ON THE GROUND (physics.ts takeOffStep; groundStep for the run-up: a held run's top speed steps 285/267.7),
   and the touch layer's 220 ms minimum holds 7 frames (`touchHeld`; lianaWait now holds as pressHold does).
   Plant lianaRide.test.ts test 5: 1,728 hops (2 SWINGING lianas x run/stand x 6 lags x 3 spots x 2 holds x 12 moments): the aim's
   take-off = the engine's to 1e-6 px, the press frame's vine clock = the aim's, the bot's verdict AND catch frame = the engine's on every
   hop. RED on the old aim: 245 of 1,728 wrong (the clock alone 144; one frame earlier still, 140). judgeFliesEngine.test.ts test 4:
   takeOffStep/groundStep vs the engine, 7 speeds x 3 run steers x 3 jump steers x 2 run-ups, every frame to 1e-6 px (RED with the take-off
   frame flown as an air tick: 2001.89 vs 2002.89).
3. **Ruling A (ba6b225b):** with the exact hop judge, DROP ON A LOG's variant 3 hops from the bank onto a log (and lands) and rides across,
   0 lives, never catching the liana. The test runs v1-6: >= 5 catch the liana (6 of 7 do), each lets go onto a log; one that does not
   must cross standing on a log with no life lost (asserted); planted OFF 24 lives over v1-5 (was 19).
The drop judge's calibration table (ENG-24 calib.ts, 16 rows) is IDENTICAL on 925eba15 and this model: today's drifts don't touch it.

## MEASURE on the final model (code head e236233c = ba6b225b + the curated-seed re-pin)
| Check | Result |
|---|---|
| lockall 16 vs 925eba15 (ENG-285's model) | 102/102 unchanged: today's commits move no stage |
| lockall vs ce4ad461 | 89/102; moved = ENG-285's 13: 1-6 N16/E6, 1-8 N[3,7,10,11], 2-1 N[13], 3-8 (proto.thorns), 4-4 N[3,9,10,13,16], 6-1, 6-3, 6-6, 6-7, 7-5, 7-9, 8-3, 8-5 |
| lockall vs main 6e7b85f8 | 87/102: the 13 + 1-7, 1-9 (INT-12's own); the intended list for the final check: 1-6,1-7,1-8,1-9,2-1,3-8,4-4,6-1,6-3,6-6,6-7,7-5,7-9,8-3,8-5 |
| seedlist --check, all 11 lists | PASS each, 0 refused (1-1 161, 1-5 150, the rest 100) |
| tierBots full calibration (3 tiers x both x 1-40) | 200/200 runs identical to calibration-main.jsonl: no recalibration, no recommit |
| funcheck | line for line INT-12's d7cb8240 run: 30 worse/new (main 34): nothing new or worse |
| seeds.test.ts:40 (e236233c) | the 3 plans ENG-285's model moved (6-1 69793, 6-1 205913, 7-5 928604) re-verified with curate.ts's own measures and rules (levelCheck both settings, clock floors, quiet, dead, animals, unswung lianas, kid 85% / adult 70% bots): all pass on the same layout seed; re-pinned (sections + re-measured numbers). All 16 of 6-1's seeds pass. FOUND: 7 more (8-5 x5, 8-6 x2) already differ on main and ce4ad461 (the guard checks 2 seeds a stage) |

## Re-prove: castBots 1-40 x tiers x both on the final model (expert plays Normal only, castBots.ts:31)
| Stage | Calibrated (child / middle / expert) | First-timers (kid / adult) | Each miss |
|---|---|---|---|
| 1-6 | E 40/40; N child 39, middle 40, expert 40 | N kid 26, adult 40; E 40 / 40 | the packet's rows child N L28, child N L34, middle N L39 PASS. child N seed 30: 40 double jumps straight up on the creaky-landing pit's floor (x 29,128, far wall 225 px) for 100 s, rescued: BUILD-24b's bot defect (b), REPRODUCED; pitWayBack's `prog.off(p) < 120` return comes before ENG-16F's liana-foot rule; a one-line fix made it worse (4 rescues), reverted; middle/expert pass seed 30, the child passed it on ce4ad461: the bot, not the level (the lead rules). kid N: the same two pits as INT-12 (x~28-29k, ~46k), re-rolled (INT-12 29) |
| 1-8 | N child 36 (seeds 9,17,25,35), rest 40/40 | 40/40 | identical to main and INT-12 (VAR-1 §4) |
| 2-1 | all 40/40 except child E 39 | kid N 32, E 39; adult N 40, E 39 | vs ce4ad461 today: child E seed 21 NEW (0 lives, stands at the water x 19,694 until rescued; passes on 925eba15 and with the old liana aim: the exact aim re-rolls it; a wait-loop change had no effect, reverted); kid E seed 26 new (x 9,340); kid N 32 = 32; adult E seed 8 = ce4's |

## Diagnoses for the lead (read-only, scratch worktrees)
- letGoCue.test reds on t-build-24c 2a3e061a: NOT the model. GLOW: the test's start() placed the swing before the game clock (since 1c the
  vine clock is gameTime + shift): fix = game clock first + a set-up guard (RED with the old order). Test 4: re-pin t-meter-3's judge numbers
  to the model's (identical on ba6b225b and 2a3e061a). Both applied by BUILD-24c (17e38bda, be615d5e); letGoCue 4/4 three runs.
  Every press of one swing, flicked or held, leaves the liana where pressLaunches says (344/344).
- KID 2-4 Normal 36 -> 28 (BUILD-24c be615d5e): no single bot slip. Full-40 bisect: revert all of drift 2 -> 31; its aim alone -> 28;
  ENG-285 1b/1c -> 28; step 1 not revertible alone. A 12-seed sample first showed 0 -> 8/12 for the aim: selection bias, withdrawn.
  The rule that fires (lianaWait at the mean lag; the float-wait's any-of-3) leaned on the old one-frame error; the vineFromLog rule
  (mid +/- sd/2) in lianaWait gave 26/40, no gain. Named for an R-id.
