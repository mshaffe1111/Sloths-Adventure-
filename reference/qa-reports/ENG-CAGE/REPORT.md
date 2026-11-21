# ENG-CAGE-b REPORT (t-eng-cage @ 5bad38879 from b34352b58; 8:54-9:55 PM ET 11-20, every time by `date`; the end corrected by BUILD-23d to its commit time, timecheck)

## EXACT NEXT STEP
1. LEAD: assign the cage CHANNEL (the last coveragecheck red): tools/difficulty/score.ts must price a cage beat (a `cageChallenges`, or an
   OTHER_BITS entry: a cage struck at his height = one punch challenge; one hung up a climbing vine = the climb plus a punch from the vine,
   engine airKick, one blow), named in reference/design/meter-coverage.json `beat:cages.channel`, with its channel test added to gates.yml:157.
2. BUILD-23b/c (DATA, not changed by me): 2-3's watched mud is too long for the calibrated child (below, "the child trace"). Then re-run
   `npx tsx tools/inspect/castBots.ts --stage 2-3 --seeds 1-40 --bots kid,adult,child,middle,expert --setting both --par 3` (about 90 s).
3. BUILD-23's own open 2-3 reds (identical on t-build-23 @ 3f206514b, so not born here): find #15 at (7020, y) inside platform 26 (7 suite
   tests); 2-3's rolls draw foe:eagle and props2, which its preload list (stageSheets.ts) lacks (stageSheets.test, registrycheck); no drawcheck
   scenario, no proven seed list, row not `judged` (registrycheck x2 on the CI line); the map line count (stagePlanGoals: 5 stages name a count, it needs 6).
4. Not traced (time): the kid's 0/40 (both settings). His stalls are at the same two watched stretches (x about 11500 and 20500-21000) and at the
   pond (17500-18500; Normal "set down here 3 times" 16x).

## castBots 2-3 1-40 on 5bad38879 (5 bots x both settings, par 3; the gen2 row, no preload)
| bot | Normal b34352b58 | Normal 5bad38879 | Easy b34352b58 | Easy 5bad38879 |
|---|---|---|---|---|
| child | 0/40 | 1/40 | 37/40 | 40/40 |
| middle | 36/40 | 39/40 | 40/40 | 40/40 |
| expert | 35/40 | 37/40 | - | - |
| adult | 36/40 | 37/40 | 40/40 | 40/40 |
| kid | 0/40 | 0/40 | 0/40 | 0/40 |
b34352b58 = ENG-CAGE's head re-run here (8:58 PM): the same as ENG-CAGE's table. Every miss is a rescue (the goal 5/5 at the shrine).

## What changed (5bad38879)
- FETCH-CLOCK (tools/inspect/firsttimer.ts, LINE_SKILL.fetchClock): the 20 s stuck clock HOLDS while he walks back for a spooked little one
  (as it holds while he hides) and STARTS OVER once he has it; three fetches with no step further are a loop (tries3) and the clock runs again.
  Planted: lineBot.test 'fetch-clock' (the hop-back toy with the CHILD, 2-3 gen2 row seed 5, 90 s): on 0 rescues; 'planted' with it off: 2 rescues.
- coverage: meter-coverage.json `beat:cages.bot` = tools/inspect/firsttimer.ts#FirstTimerRun.cagePlan (resolves; coveragecheck 2 reds -> 1).
- 1-1 calibration recommitted (BOTS.md 11-20 note): tierBots was RED on ENG-CAGE's head, 2 of 200 runs moved (child Normal v1 put-backs 9 -> 8,
  v12 10 -> 9). Cause proved: ENG-CAGE's SET-DOWN LOOP rule (switched off in a scratch edit, both replay exactly as committed). Re-run per
  BOTS.md: only those 2 runs and their roll-ups moved; every verdict unchanged (child N finish p50 406.7 -> 408.1 s vs 444; put-backs 3.38 -> 3.33 vs 3.4).

## The child trace (child Normal, rule 28: two runs per cause)
- B1, BOT (fixed above): rescued mid-fetch. s5: x11843 t176 the look spooks a joining little one, he walks back for it (t176-188), hides
  (189-197), creeps on; the clock never held, rescue at t203.4, which put him at 12012 past his line, and the next look spooked it (t212).
  s8: x11968 t165 back for two spooked, np 14.6 s by t183, a second spook at x12103 t184.5, rescue (stuck t188.3, 20 s).
- B2, DATA (for BUILD-23b/c): the open mud between the reeds is longer than the look's window for the calibrated child. s5, frames
  5910-6150 (t197-205): after the look ends at t197 he goes from the reeds' end (11312) to the boulder's face (11435) in 7 s; the next look
  (t204) spooks all three on the mud. s8, t176-184.5: from 11357 he reaches the face (11691) at t179, stands at it 3.5 s (his stop
  reaction counts only his pushes, P13's rule), hops at t183, and the look at t183.5 spooks the line behind him.
  THE SPOT: the first watched stretch ("beat 4" in lineBot's hop-back toy: the clumps that hold cage 3): s5 heron 11052-12132, reeds
  11012-11312 and 11712-12012 (300 px each), open mud 11312-11712 = 400 px with the 50 px moss_stone boulder 11454-11571 (117 wide);
  s8 heron 11306-12386, boulder 11710+112. The same at the two-heron stretch (s5 herons 20444-21764, reeds 20404/21054/21704, 350 px of mud
  between them). Measured s5: a look every ~10.4 s (162.5, 172.5, 183, 194, 204, 214.5), each ~3 s: a window of ~7.5 s. The child needs
  ~15 s: ~40 px/s on open ground (his testers' steer p50 120 ms / gap p50 630 ms), ~3 s at the boulder's face, and his line's 102 px tail.
  The designer's options (not mine): a reed clump mid-mud (gaps of 200 px or less), the boulder out of the mud, or a longer look gap on Normal.
- REJECTED (measured, not committed): counting a face he can see within 30 px in real time (not only his pushes). 2-3 child N 1 -> 16/40,
  but child E 40 -> 38, and 1-1's calibration breaks (child N finish p50 408 -> 358 s, outside 444 +-12%; expert N PASS -> FAIL on put-backs).
  The slow face reaction is part of what matches the testers.

## Gates on 5bad38879 (unless named)
| gate | verdict |
|---|---|
| tsc | PASS |
| toys: lineBot 8, cageBot 4, firsttimer.test 11 | PASS 23/23 |
| tierBots.test (CI=1) | PASS 9/9 (b34352b58: FAIL 8/9, the 2 moved runs) |
| CI tool line gates.yml:157, CI=1 FORCE_COLOR=1 | FAIL: tests 341, pass 338, fail 2, todo 1. Both registrycheck.test on 2-3 (drawcheck scenario, seed list, flown, sheets); `registrycheck.ts` identical on t-build-23 @ 3f206514b (BUILD-23's) |
| full unit suite (CLAUDE.md glob, 3 shards, on code 1f276d32e, before FETCH-CLOCK) | FAIL: tests 4006, pass 3993, fail 10, todo 3 (shards 1195/1189/4/2, 1427/1422/4/1, 1384/1382/2/0). All 10 are 2-3 data, the same 10 red on 3f206514b (47 tests, 10 fail). The 6 suite files that import the bot re-run on 5bad38879: 50/50 |
| coveragecheck | FAIL (1): beat:cages on 2-3, no channel (the bot half fixed; red on 3f206514b with 2) |
| generalitycheck | PASS |
| knowncheck | PASS |
| roadmapcheck | not judged: "shallow clone, proofs cannot be checked" (this container's clone) |
Not run (not in my packet; the integrator's full set): the vite build, chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck, buildcheck, seedlist 1-1, tipwalk, the seedlists matrix.

## Learned
- A "stuck" clock must know every reason the game makes him walk back: a fetch is the game's demand, like a hide. Trace the clock
  (noProg, more, hiding) frame by frame before naming a cause: "the boulder" was the visible spot, the clock was half the cause.
- A bot change is judged on 1-1's calibration before it is judged on the new stage: the real-time face reaction lifted 2-3 by 15 runs and broke the calibration.
- Never edit a tracked file while a background test run loads it: instrument a worktree copy (I did once, inert under an unset env var, then moved to a worktree).
## Lessons applied
D30 (every time from date), D75 (the toy on 2-3's own gen2 row), D86 (the full suite with its shard totals), D94 (every red checked on the
integration base t-build-23 @ 3f206514b, not on ENG-CAGE's own commits), D96 (coveragecheck and registrycheck run), D102 (read lean: grep
and line ranges only), D76 (stopped well inside 350k).

# ENG-CAGE REPORT (t-eng-cage @ 1f276d32e, stopped 8:52 PM ET at the lead's D76 line, ~370k real context)

## EXACT NEXT STEP (ENG-CAGE-b)
Head 1f276d32e = t-build-23 @ 3f206514b merged + the cage skill + the two traced bot fixes. The toys are GREEN on this head (cageBot 4/4,
lineBot 6/6, firsttimer.test 11/11 = 21/21). Every run below this line is UNRUN ON THIS HEAD and is ENG-CAGE-b's, in this order, each in the BACKGROUND:
1. `npx tsx tools/inspect/castBots.ts --stage 2-3 --seeds 1-40 --bots kid,adult,child,middle,expert --setting both --par 3 --rows rows.jsonl`
   (no preload now: the hand-built 2-3 is deleted). Compare with the table below (taken with the hand 2-3 stepped aside, the same gen2 row).
2. `npx tsx --test tools/inspect/tierBots.test.ts` (1-1 calibration must stay PASS: lineMove/cagePlan return null with no follow/cage on 1-1;
   the set-down loop rule CAN touch 1-1 if the game sets him down 3x at one spot: if red, that is the cause to read first).
3. The CI tool line, gates.yml:157, with `CI=1 FORCE_COLOR=1` (cageBot.test.ts added after lineBot.test.ts), and the full unit suite (CLAUDE.md glob).
4. coveragecheck: FAIL on this head (2): "beat:cages on 2-3: no bot / no channel". The bot now exists (CAGE_SKILL); its registry entry
   (METER-COVERAGE §2, tools/difficulty/) and its meter channel are not made. Check whether it is red on t-build-23 @ 3f206514b too
   (BUILD-23's own then), then add the bot entry; the channel is the meter owner's (ask the lead).
5. generalitycheck: PASS (8:43 PM, pre-merge head; re-run).
6. Trace child Normal (0/40 at fix4: every run rescued). Cause B below is the open one.

## Done-items
- **RED** 405a7599 (8:30 PM): cageBot.test.ts on 2-3's own gen2 row: the bank cage (hp 2) and the mooring post's cage stay shut for all 5 bots; plants pass.
- **Climb-punch: YES** on the real engine (PadInput.punchButton -> InputEngine.triggerTouchPunch): Pokey punches while climbing, stays on
  the vine; 2 blows open the post cage when he is 0-80 px below it (seeds 1, 2; 100+ px below: nothing). From the vine the engine throws an airKick (2 damage: one blow).
- **GREEN** 3b9a912 (8:34 PM): firsttimer.ts CAGE_SKILL { punch, climb } + cagePlan: any world's cage (type 'cage', not kit.holdsCage) in the
  engine's strike reach at his height, or hung up a climbing vine at whose foot he stands: up, the tier's hesitation, a tap at his swap gap, down. No stage id (generality PASS).
- 5737946 fix2: cagePlan runs ahead of the line's reeds and heron (not mid-jump) and takes a cage up to 60 px behind (he hopped past cage 5 and hid beside it).
  CORRECTION: its commit message says "was 4/5 on 47 of 360"; the rows say 126 of 360 runs were short of the goal before it, 0 after.
- 46bb80a fix3 HOP-BACK (LINE_SKILL.hopBack) + fix4 SET-DOWN LOOP, each planted (lineBot 'hop-back' on the gen2 row seed 5; firsttimer.test
  'set down...', RED on the old bot: "set down 12 times", no loop).
- startFollow review: **KEEP** (without it the gen2 2-3 throws TypeError in the constructor). Merged with BUILD-23's copy; mine dropped.

## castBots 2-3 1-40 (gen2 row; fix4 head 46bb80a minus the "+2 points" tolerance; 9 bot/setting pairs, expert has no Easy bot)
| bot | Normal | Easy |
|---|---|---|
| child | 0/40 (all rescued) | 37/40 |
| middle | 36/40 | 40/40 |
| expert | 35/40 | - |
| adult | 36/40 | 40/40 |
| kid | 0/40 | 0/40 |
Every run reaches the shrine with the goal 5/5 (rescues counted as fails). Before the skill (BUILD-23, old 2-3): 0/18. Pass 155 -> 224 of 360 over fix3/4.

## Misses traced (rule 28: two runs per cause)
- A (FIXED, fix3): fetching a spooked line he stood against the 50 px moss_stone boulder on the mud: middle N s1 x20828 (rock 20691-20809), child N s5 x11590 (11454-11571), child N s8 x11841 (11710-11822).
- B (OPEN, likely data/design, BUILD-23's call): on the watched mud between clumps the child stops at the boulder's face (his stop reaction) before
  hopping; the line catches up on the open mud and the look spooks it; the cycle repeats to a rescue: child N s8 t160-169 x11691, child N s5 x11685.
- C (FIXED, fix4): kid N at the pond twist set down by splash-back every ~20 s, progress wound back each time, never rescued: kid N s6 (relocates at x16783, 300-385 s), 34/40 kid N.
- D (not a miss): "the sealed shrine" stuck spots are the wait for the line at the door; rescues 0 there (middle N s8 x27717).

## Gates (on 1f276d32e unless named)
| gate | verdict |
|---|---|
| tsc | PASS |
| planted toys (cageBot 4, lineBot 6, firsttimer.test 11) | PASS 21/21 |
| generalitycheck | PASS (pre-merge 57379465) |
| coveragecheck | FAIL (2): beat:cages on 2-3 no bot / no channel |
| CI tool line (CI=1), tierBots, full suite, castBots on this head | UNRUN |

## Pushback
- RealPlay.frame in real-input mode drops pad.punch (realPlay.ts real branch): castBots --input touch|pad never punches. Suggest: forward it via inp.triggerTouchPunch().
## Learned
- Check which stage the harness builds before trusting a bot table: W2_STAGES beat the listed row (0/18 was the old 2-3).
- A bot's reach window comes from the engine's strike box, not a guess; overshoot from thumb lag needs a turn-back, not a narrower window.
## Lessons applied
D30 (every time from date), D57/D87 (queue read at push; long runs in background), D75 (toys on the gen2 row), D76 (stopped at the lead's line), D94 (base named), D96/D86 (coveragecheck run, found red).
## Turnover note
reference/handoffs/engine-core.md NOT rewritten (context): ENG-CAGE-b writes §0zq-CAGE from this REPORT.
