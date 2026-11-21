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
