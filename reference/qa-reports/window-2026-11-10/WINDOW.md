# Play window ending Tue 11-10: gen2 1-1, live 0.9.5 (R-165.77)

## Delta to the close (attempt 3, pulled Wed 11-11 2:09 AM ET; the window is CLOSED)
- **Added:** sheet rows 4553-4592: 40 rows, 0 unread, 3 sessions, 3 players, 4 runs. All are on the since side (build 181d284, list
  e03e9c8c). Before: 0 rows. Other: 0 rows. Last row 11-10 5:31 PM ET. All 3 sessions start at part 1, so none continues an earlier session.
  Command: `python3 -I tools/playtesters/report.py <folder of the new rows> --delta "11/9/2026 19:25:00"`.
- **Runs:** Normal: 2 runs from 2 players; 1 finished in 214 s, and 1 was left mid-stage in `w1-dip-double-teach` (seed 15079, ONE).
  Easy: 2 runs from 1 player, both finished (180 and 187 s).
- **0 lives lost and 0 stuck.** No top-10 finding rose or fell. #1-2 and #4 (raised pits), #5-6 and #8-10 got no new hits.
  - #3 (tap read as punch): CORRECTED 11-11 (attempt 5). The window total is **154 of 700 punches**, from 9 of 10 players, not 481. The old rule
    counted `jumpUp`, which is the jump RELEASE (TouchController.tsx:50), as a jump. It also counted the 257 punches that the jab rule takes
    back by design when the finger flicks (punchCancel, touchGestures.ts:487-499). Now only a kept punch followed by a jump PRESS counts.
  - #7 (Easy `w1-double-teach` put-backs): +2 from 1 player (seed 4364).
  - New, ONE player: a mid-stage leave at `w1-dip-double-teach` (score 5).
  - Window totals for the 1-1 runs: 99 runs, 36 Normal lives (all raised pits).
- **Can't tell from the new rows alone:** whether these 3 players are new or returning. The delta's P-numbers are local to it (P1-P3),
  and joining codes would need the full sheet again.
- **Nothing new in 1-1:** 0 glitches. The Easy landscape run held fps median 23.4 (min 14.8, sd 9.7 ms; ONE device), the same pattern as
  §4. The Easy first run never showed the double line (1 of 1, ONE). 0 skipOffer, 0 stuckHelp.

**Pulled Mon 11-09 8:39 PM ET. The window is still OPEN.** The last row arrived 11-09 7:25 PM ET. All 4,549 rows were read (sheet rows
2-4552) and every data cell decoded (0 unread). This is attempt 1. The close is a delta (attempt 2).
**Rerun (one command):** export Sessions!A2:H to JSON files in a scratch folder outside the repo, then
`python3 -I tools/playtesters/report.py <that folder>` (add `--delta "11/9/2026 19:25:00"` to see only the runs from sessions that sent rows after this pull).
`python3 -I tools/playtesters/report.py --self-test` checks the slicing.
Players are P-numbers only (P24 to P32 are the 9 players since 0.9.5). A finding on 1 or 2 players is marked ONE or FEW. All 95 runs
are on seed list `e03e9c8c`, round `1-1 gen2 r1`. Rebuild a layout from its seed and that list.

## 1. Before 0.9.5 / since / other (R-165.59: the lead can delete "before")
| Side | Rows | Sessions | Players | Arrived (ET) |
|---|---|---|---|---|
| Before (build time < 11-06 6:32 PM ET, no commit) | 3,145 | 123 | 22 | 10-23 8:17 PM .. 11-06 9:21 PM |
| Since (gen2/env commit on main, after e92bdcdb) | 1,403 | 40 | 9 | 11-06 7:12 PM .. 11-09 7:25 PM |
| Other (Version cell `new`, no commit) | 1 | 1 | 1 | 10-24 2:37 PM |
- The "since" commits are a89564f (PR #64), 1124252 (PR #66) and 181d284 (PR #68). All three are on main after e92bdcdb (`git merge-base --is-ancestor`).
  No `dev` builds and no test-link branch commits. Every gen2 run is on the since side, so the analysis below is since-only.
- The sheet's Arrived column is in Pacific time (the spreadsheet's own setting). report.py adds 3 h. The "before" side's last row
  (9:21 PM ET) came from an old cached build: its build time is before the boundary.
- "Players on both sides: 0" cannot be checked. The before side has no tester codes (they start 11-06), so its 22 is a count of names.

## 2. The distrusted recorder fields, judged (R-165.58)
- **Top speed.** 430 px/s (engine.ts:7810) is NOT the highest. The swing leap's cap is `SWING.leapMax: 520` (physics.ts:373, used by
  `tarzanLaunch` :689-690). The other speeds: run 285 (physics.ts:9), ×1.4 with the speed power-up = 399 (engine.ts:2130), comeOut 420
  (:6817), lunge cap 380 (:4005). The floor I use is **520 px/s**.
- **"A 4,000 px section logged a 5 s median": the 11-07 METHOD is wrong. The section is fine.** `w1-leap-stones` spans a median of
  4,242 px (Pokey's own x range on that seed). 4242 / 520 = **8.2 s**, the least it can take, and the 11-07 method gives a median of
  5.6 s (29 slices), which is impossible. The cause is that the 11-07 method counts every slice as a separate entry. 16 of the 29 slices
  are one Easy player (P27) going back and forth over its line with `w1-hop-bounce` on seed 12727 (3-10 s each). Clean runs take 17-51 s
  for 4,080-4,454 px (about 160 px/s, under the 285 run).
- **"End-section times of 0 s": a report bug, not the recorder.** The old report.py closed a section only when the next section line
  came. The last section never got a time, and `median(t) if t else 0` printed 0. Example: `w1-sunlit-log`, 1,288 px, floor
  1288/520 = 2.5 s, printed 0 s. The new report closes the last slice at `finish`. Its median is 7.8 s Normal.
- **New check:** 9 of 1,286 slices span x faster than 520 px/s. All 9 hold a put-back or a lost life: the respawn moves him back, so
  that span was never run. 0 clean slices break the speed. Section times are now per run (all slices added up, time away removed).
- **Double jump:** `move double` is logged once per stage START, not per use (`movesSeen` cleared in `stageStart`, playRecorder.ts:409-416,
  called from the engine constructor, engine.ts:864-867, and set at :2211). Data: 91 runs logged exactly 1, 4 logged 0, none more. It
  counts runs that used the double jump. It can never count uses or tries.

## 3. Normal (81 runs, 8 players, 66 layouts)
**Sections.** 75 runs finished (all 8 players). The finish time median is 188 s (range 135-612), which meets the 2-minute rule. 6 runs
did not finish. 4 of those left before the first section line (no play). Only 2 left mid-stage, both P25 (ONE): one in
`w1-log-chain-rise` after 2 lives at 2.9 min, and one in `w1-double-teach` at 0.5 min.
**All 36 lives lost on Normal are pits (`lostLife pit`), and all 36 are in raised pieces** (report.py's per-player lives sum to 36; the table rows below sum to 10+8+6+4+2+2+2+1+1 = 36). They hit 7 of the 8 players. This confirms
the 11-07 "treetop" finding on 4x the runs.
| Piece (stretch) | Runs in | Lives (players) | Put-backs (players) | Time med (range) |
|---|---|---|---|---|
| w1-log-chain-rise (The logs) | 18 | **10 (5 of 6)**, 7 runs | 0 | 17.7 s (11-145) |
| w1-mushroom-chain-back (The climb into the branches) | 16 | **8 (5 of 5)**, 7 runs | 0 | 27.2 s (13-63) |
| w1-log-chain (The logs) | 19 | **6 (3 of 6)** | 0 | 18.5 s (15-40) |
| w1-mushroom-chain | 8 | 4 (1, ONE) | 0 | 16.8 s |
| w1-log-stair-test, w1-high-walk-up, w1-canopy-rungs | 44, 13, 5 | 2 (2), 2 (2), 2 (1) FEW | 0 | 13, 6, 17 s |
| w1-last-step-up (Walking: the raised last step) | 12 | 1 (1, ONE) | 0 | 7.8 s (6-16) |
| w1-canopy-rungs-level (The high branches) | 27 | 1 (1) | **12 (5 of 5)** | 20.1 s (13-42) |
| w1-double-teach (The double-jump gaps) | 32 | 0 | 18 (3 of 5; P26 has 12, SKEWED) | 14.3 s (6-150) |
| w1-dip-double-teach | 42 | 0 | 7 (5 of 8) | 11.5 s (9-33) |
| w1-two-answers | 5 | 0 | 6 (3 of 4) | 27.6 s |
Stuck (120 s or more in one piece): 2 runs, both P26 (ONE, the slow player): `w1-log-chain-rise` (145 s, seed 3747) and `w1-double-teach` (150 s, seed 23436).
**Tempo:** the longest stretch is "The mushroom bounce", median 32.5 s per run, with 0 lives. It is also the most-picked "hardest" answer:
9 runs from 4 players. "Walking" totals 28.7 s per run.
**Players.** Lives per minute range 0.04-0.35. Lives do NOT fall with practice: P24's lives per run over runs 1-12 are 0,0,0,1,0,0,1,1,0,1,0,2.
P28's are 1,0,4,0,2,1,1,2,2,0. The raised pits keep killing experienced players. Finish times: P24 177 s first, median 166 over 38 runs.
P26 is slow (612, 444, 559, 386: FEW-run outlier). P32 414 (ONE run).
**Input misreads.** 1-1 has nothing to punch: 0 stomps and 0 hurts in all 95 runs. Even so, 693 taps were read as punches. **Corrected 11-11:** 257 of the full window's 700
were taken back by the jab rule as designed (a flick, CT-17). **154 were kept and followed by a jump press within 0.6 s** (looking at the
next 5 intents): the player meant to jump. That is 9 of 10 players, both settings: P27 44, P24 43, P25 32, P30 20. It is not one player's
habit. (Attempt 1 said 475, but that count included jump releases and the designed take-backs.)
**Survey (v2, 87 surveys, 9 players):** fun 5 in 63/5 players, 4 in 22/7, 3 in 2/2. Length "About right" 87/9. Knew where to go:
Always 57/6, Mostly 30/6. Tips: "Didn't notice them" 18/4, Yes 3/2.
**Phones.** Median fps is 30.0 in both orientations. Portrait: 47 stalls, 110 long tasks, 83 resolution step-downs. 55 of the Normal
step-downs (and 34 on Easy) are ONE device (P25). Landscape: 13 runs, 4 players, fps min 23.7.
**Glitches.** 6 `jitter` lines, all pokey-x, n7, in 6 layouts and from 4 players (`w1-log-chain`, `w1-learn`, `w1-step-stones-teach`, `w1-seed-perch`,
`w1-two-answers`, `w1-clearing`; seeds 12727, 30782, 3747, 28035, 18992, 28212). 1 `camjump` (dx42 dy138, `w1-seed-perch`, seed 12943, P29).
0 `err`. (`skipOffer` is not a glitch: it is the "Skip tips" button on Dot's first tip, DotGuide.tsx:409-424; report.py now counts it under teaching.)
**Teaching** (each player's first run, because hints show once per device): `hint.1-1.double` came before the first double-jump section
in 7 of 8 first runs. In 5 of 8, he used the double before that section. The first double came 25 s into the run (median, range 8-82).

## 4. Easy (14 runs, 3 players: P25, P27, P29, all FEW)
All 14 runs finished. Easy has no lives, so its put-backs (`softFall`) stand in for lives (LOG_EVENTS.md).
**The 37-minute run holds. It is ONE player (P27, 1 run, seed 12727), and it is the real child-bot pattern:** the finish took 2,231 s.
The time went to `w1-log-chain` (6 entries, 1,353 s, 152 put-backs spread across the whole chain, x 35135-37099),
`w1-canopy-rungs-level` (115 s, 14 put-backs) and `w1-leap-stones` (117 s, 12 put-backs). No help-after-put-backs exists; stuckHelp watches walls only (engine.ts:4524), so it could not fire here (0 `stuckHelp` in
all 95 runs). He also never saw `hint.1-1.double` (his Dot lines: coach.run, coach.jump, hint.1-1.gaps, hint.1-1.noMoss). He tapped
167 punches in 37.6 minutes of play (report.py's in-section time, time away removed) = 4.4 a minute; 44 were followed by a jump press
within 0.6 s (corrected 11-11 from 81, which counted releases).
The other Easy put-backs: `w1-canopy-rungs-level` 17 (2 of 3 players, P27 has 14), `w1-dip-double-teach` 9 (2 of 2), `w1-double-teach` 6
(2 of 2). Finish times without P27: median 187.5 s for P25 (10 runs) and 191 s for P29 (3 runs).
**Phones.** Portrait: 13 runs, fps median 29.9, min 15.2, sd 2.3 ms, 48 step-downs (P25's device 34, P29's 13). Landscape: 1 run (P29, seed 12943),
fps median 25.2, sd 12.2 ms: ONE.
**Teaching:** the double line was shown before the need in 2 of 3 first runs (P27 never).
**Glitches:** 1 `blank` mid-stage (`wait w1c-mid-…`, `w1-log-chain` x36288, seed 12727, P27), and 1 jitter (the same run).

## 5. Layout change or engine change
| Problem | Fix by layout (Content/Designer) | Needs the engine |
|---|---|---|
| Raised-pit deaths in the log and branch chains (Normal) | Yes: a catch road or a low floor under `w1-log-chain-rise`, `w1-mushroom-chain-back` and `w1-log-chain` (the log chain's mid road covers only its approach), or shorter gaps | Or: let the level double-gap put-back rule (it already puts him back in `w1-double-teach` and canopy-rungs-level) cover the raised chains. That is an Engine and Designer call. |
| The Easy put-back loop with no exit (P27, 152 in one piece) | Partly: an easier Easy version of the chain | Yes: after N put-backs in one piece, offer help or a bridge. No help-after-put-backs exists; stuckHelp watches walls only (engine.ts:4524). |
| Taps read as punches in a stage with nothing to punch | No | Yes: the touch rules (when nothing is in reach, a tap followed by an upward flick within 0.6 s should be a jump) |
| Put-backs at the Normal double gaps (canopy-rungs-level, dip-double-teach) | Yes: gap widths, or a practice gap first | No (the put-back already works as designed) |
| Mushroom-bounce tempo (longest stretch, top "hardest" answer) | Yes: fewer or shorter bounce pieces | No |
| Resolution step-downs on one phone, and Easy fps min 15 | No | Yes (perf), but it rests on 1-2 devices |
| The double hint never shown (P27) | No | Check tipMemory: on a shared device, was the hint already "seen" from an old build? |

## 6. Top 10 (score = players affected × severity: quit 5, life 3, stuck 3, Easy put-back 3, Normal put-back 1, misread 1)
| # | Score | Setting, piece | What | Players | Seeds to reproduce (list e03e9c8c) | Fix |
|---|---|---|---|---|---|---|
| 1 | 15 | Normal, w1-log-chain-rise | 10 pit lives in 7 of 18 runs | 5 of 6 | 3747, 15458, 19582, 26871, 35286 | layout, else engine |
| 2 | 15 | Normal, w1-mushroom-chain-back | 8 pit lives in 7 of 16 runs | 5 of 5 | 23436, 1769, 25908, 29944, 172 | layout, else engine |
| 3 | 9 | Both, every piece | 154 kept punches, then a jump press (corrected from 475) | 9 of 10 | any; P24's runs, e.g. 3747 | engine (touch rules) |
| 4 | 9 | Normal, w1-log-chain | 6 pit lives in 5 of 19 runs | 3 of 6 | 21537, 30782, 1589, 14194, 30947 | layout, else engine |
| 5 | 6 | Easy, w1-canopy-rungs-level | 17 put-backs (FEW, SKEWED: P27 14) | 2 of 3 | 12727, 33940, 24110 | layout |
| 6 | 6 | Easy, w1-dip-double-teach | 9 put-backs (FEW) | 2 of 2 | 12727, 33940, 25908, 24110 | layout |
| 7 | 6 | Easy, w1-double-teach | 6 put-backs (FEW, SKEWED) | 2 of 2 | 21533, 12943, 476, 172 | layout |
| 8 | 6 | Normal, w1-log-stair-test | 2 pit lives (FEW) | 2 of 7 | 13895, 18992 | layout |
| 9 | 6 | Normal, w1-high-walk-up | 2 pit lives (FEW) | 2 of 4 | 15861, 32138 | layout |
| 10 | 5 | Normal, w1-canopy-rungs-level | 12 put-backs in 9 of 27 runs | 5 of 5 | 1769, 18341, 3747, 7878, 30782, 20955 | layout |
**Added by judgment, above its score (3, ONE player):** the Easy put-back loop in `w1-log-chain`, seed 12727. It is 152 put-backs and
22.5 min in one piece, with no help offered. The score undercounts it because the formula counts players, not minutes. It is the
child-bot pattern, and it is the one engine fix (help after N put-backs) that also covers #5-7. I'd fix it with #1-2.
Next by score: Normal w1-dip-double-teach put-backs (5, 5 of 8 players), and the 2 mid-stage leaves (5 each, ONE player: P25).
