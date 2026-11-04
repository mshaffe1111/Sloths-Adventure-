# The late lift-off fix: before and after (bot-fix, 2026-11-04)

NOT MERGED. The lead merges it at one planned moment (after w8-rope2's R-159.1 counts and fix-petals' current runs land), and then every
bot-based number is re-measured together.

**The defect** (found by w8-rope2): `tools/inspect/firsttimer.ts` thumbify(): the "late lift-off" returned early before `lastSteer` was
cleared, so it re-armed every frame. A "wait here" (`{}`) walked him on until he pressed or turned. The kid (releaseMax low bound 1)
could never stop by easing off; the adult (low bound 0) sometimes could.
**The fix** (bot-fix abab4dbe): the lift-off is armed once and lasts releaseMax frames at most, then the thumb is off.
**Self-test** (src/game/firstTimerBot.test.ts, "his late lift-off lasts at most releaseMax frames"): fails without the fix (kid 60 of 60
frames held, adult 6, limits 4 and 2), passes with it.

## Method used
reference/methods/stage-fix.md step 0 (a bot change carries a self-test that fails without it), then the full re-baseline as on
2026-11-01: `tools/inspect/botBaseline.ts --worlds 1-10 --detail`, seeds 1-3, kid and adult, 552 runs a side. Before = abab4dbe~1 (the
lead branch with main 0.9.4), after = abab4dbe, run side by side in two worktrees. Runs are first-timer (kid, Easy) and adult (Normal).

## Per world (sums over the world's stages x 3 seeds; "ends" = runs reaching the shrine)

| world | who | runs | rescues before -> after | lives lost before -> after | median time s before -> after | shrine ends before -> after |
|---|---|---|---|---|---|---|
| 1 | adult (Normal) | 27/27 | 65 -> 63 | 45 -> 40 | 164.0 -> 170.0 | 18 -> 18 |
| 1 | kid (first-timer, Easy) | 27/27 | 90 -> 76 | 23 -> 21 | 168.0 -> 176.0 | 17 -> 20 |
| 2 | adult (Normal) | 27/27 | 29 -> 19 | 228 -> 93 | 162.0 -> 167 | 10 -> 13 |
| 2 | kid (first-timer, Easy) | 27/27 | 31 -> 26 | 236 -> 78 | 137.0 -> 156 | 13 -> 15 |
| 3 | adult (Normal) | 27/27 | 31 -> 36 | 95 -> 101 | 169.0 -> 181.0 | 15 -> 14 |
| 3 | kid (first-timer, Easy) | 27/27 | 24 -> 20 | 30 -> 29 | 149.0 -> 157.0 | 15 -> 15 |
| 4 | adult (Normal) | 30/30 | 259 -> 231 | 200 -> 201 | 269.0 -> 263.0 | 21 -> 19 |
| 4 | kid (first-timer, Easy) | 30/30 | 250 -> 222 | 76 -> 73 | 280.0 -> 276.0 | 20 -> 19 |
| 5 | adult (Normal) | 30/30 | 36 -> 37 | 14 -> 17 | 174.0 -> 170.0 | 19 -> 18 |
| 5 | kid (first-timer, Easy) | 30/30 | 40 -> 34 | 5 -> 4 | 161.0 -> 176.0 | 21 -> 21 |
| 6 | adult (Normal) | 27/27 | 45 -> 52 | 173 -> 178 | 192.0 -> 210.0 | 18 -> 18 |
| 6 | kid (first-timer, Easy) | 27/27 | 36 -> 42 | 92 -> 114 | 151.0 -> 169.0 | 18 -> 19 |
| 7 | adult (Normal) | 27/27 | 115 -> 115 | 116 -> 132 | 170.0 -> 175.0 | 15 -> 16 |
| 7 | kid (first-timer, Easy) | 27/27 | 131 -> 100 | 31 -> 31 | 146.0 -> 167.0 | 12 -> 16 |
| 8 | adult (Normal) | 27/27 | 192 -> 183 | 60 -> 65 | 199.0 -> 197.0 | 16 -> 18 |
| 8 | kid (first-timer, Easy) | 27/27 | 55 -> 25 | 3 -> 1 | 174.0 -> 182.0 | 20 -> 20 |
| 9 | adult (Normal) | 27/27 | 91 -> 88 | 165 -> 138 | 149.0 -> 158.0 | 19 -> 21 |
| 9 | kid (first-timer, Easy) | 27/27 | 94 -> 68 | 79 -> 66 | 144.0 -> 161.0 | 21 -> 20 |
| 10 | adult (Normal) | 27/27 | 140 -> 120 | 130 -> 139 | 219.0 -> 212.0 | 19 -> 20 |
| 10 | kid (first-timer, Easy) | 27/27 | 158 -> 103 | 61 -> 81 | 172.0 -> 197 | 17 -> 18 |

All 552 runs: shrine 344 -> 358, sealed door 151 -> 139, timeout 37 -> 35, stranded 20 -> 20. 0 errors either side.

## The thumb itself (tools/inspect/liftoffHeld.mts, frames he meant no steer but the thumb still steered)

| run | before: held / no-steer frames, longest | after |
|---|---|---|
| 2-1 kid seed 1 | 1531 / 2285 (67%), longest 0.8 s; 36 lives | 301 / 2086 (14%), longest 4 frames; 2 lives |
| 2-1 adult seed 1 | 1650 / 3419 (48%), 0.8 s; 43 lives | 213 / 1945 (11%), 2 frames; 6 lives |
| 1-1 kid seed 1 | 965 / 1538 (63%), 0.6 s | 424 / 1664 (25%), 4 frames |
| 4-6 kid seed 1 | 10285 / 11671 (88%), **115 s in one stretch** | 247 / 20079 (1%), 4 frames |
| 4-6 adult seed 1 | 1190 / 6770 (18%), 2.6 s | 152 / 14608 (1%), 2 frames |
| 5-9 kid seed 1 | 259 / 329 (79%), 3.1 s | 83 / 643 (13%), 4 frames |

After the fix the longest lift-off is exactly releaseMax's top (kid 4, adult 2).

## Numbers it moves (old -> new)

- **KID_RUNS_59** (gen2/game.ts, 5-9's Easy goal): [8, 3, 3, 5, 7, 5] -> [10, 15, 17, 16, 4, 7]; kidMedian 5 -> **10**; gen2EasyGoal =
  min(65% floor 12 of 18, 10) -> **5-9's Easy goal 5 -> 10 spiders**. The only kid-measured Easy goal (grep kidRuns: 5-9 only).
  Left unchanged on bot-fix on purpose (its test is red here) until the lead's planned merge; then set from the new runs.
- **funcheck** (World 1, 16 layouts): unchanged, PASS both sides, 152 known, 2072 flags (it checks stage structure, not the bot).
- **Full test globs on abab4dbe**: see "Checks" below.
- Stages moving more than 20% (rescues + lives, or median time), kid or adult: 84 of 184 stage-rows. Biggest:
  - better: 2-1 adult 85 -> 14 rescues+lives (water: he no longer walks off the bank while waiting for a log), 2-5 kid 47 -> 7 and
    2 of 3 runs now reach the shrine (was 0), 2-8 kid 42 -> 7, 10-2 / 10-5 kid timeouts gone, 7-2 kid timeouts gone.
  - worse, to look at: **4-6** both bots now time out 2 of 3 seeds at 720 s (was 0): he stands 14,600-20,000 frames meaning no steer, so
    an intend() wait there never ends; the stuck thumb used to walk him out of it. **1-1 kid** 2 of 3 timeouts (was 1). **10-8 kid** 2
    timeouts (was 0). **10-3** rescues+lives 38 -> 55 adult, 16 -> 33 kid. **6-x** worlds slightly worse (kid lives 92 -> 114).
  These are the bot's real waits showing now; each is a bot or stage question to file, not a reason to keep the stuck thumb.
  Full list: `python3` over before.jsonl.gz / after.jsonl.gz (here).

## Clip

`2-1-kid-seed1-before-after.mp4` (44 s, 0:36-1:20 of the run, sideways 844x390, old bot on top, fixed below; same stage, same seed):
on top he loses 7 lives in the water in that window, below he loses 2
(0:59, 1:16) and is at x 9,600 by 1:00 where the old bot is still at 8,300. Still: `still-43s.png` (0:43, top "life lost (water)", below on the bank, no life lost).
One clip for the biggest mover, not one a stage: 84 stage-rows move over 20%, and the thumb table above shows the same cause on each.

## Checks
On abab4dbe (the fix), this container, 2026-11-04 ~1:00 PM ET:
- `npx tsc --noEmit -p .`: PASS.
- Full test globs: 2,306 tests, 2,303 pass, **1 fail**, 2 todo. The one fail is `5-9's Easy goal rests on the kid's runs` (KID_RUNS_59, above),
  red on purpose until the planned merge re-measures it. firstTimerBot.test.ts: the new lift-off case passes, and fails without the fix.
- `npx tsx tools/validate/funcheck.ts`: PASS both sides (152 known, 2072 flags, 62 s / 65 s).
- Not run (no build, art, menu or draw code touched): vite build, artcheck, knowncheck, clipcheck, drawcheck. They run at the planned merge.

## Polish check
- The clip: looked at stills at 0:40, 0:41, 0:42 and 0:43 (top) and 0:44 (bottom). Captions legible, both halves the same stage and
  seed, nothing cut off. The labels BEFORE / AFTER sit top-left, clear of the HUD's lives counter.
- Rough spot named: the clip shows the outcome (7 vs 2 lives in the window), not the thumb itself; the thumb is proven by the self-test
  and the liftoffHeld table, not by eye.

## Lessons applied / method update
- Lessons applied: the ruler is checked first (law 3); a bot change ships with a self-test that fails without it (stage-fix.md step 0);
  before and after on the same seeds in two worktrees, never against an old file.
- Method update: when a bot "wait" ({}) is written, measure the held-thumb frames with tools/inspect/liftoffHeld.mts; the thumb must come
  off within releaseMax frames.
