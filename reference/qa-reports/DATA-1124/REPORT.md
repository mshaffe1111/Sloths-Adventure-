# DATA-1124 REPORT: the 11-23..11-24 tester window read against the bots (R-165.421)
Start 10:44 AM ET 11-24 (`TZ=America/New_York date`). Branch t-data-1124. Lessons applied: validate every counter before reading it
(analyst.md traps; found the climb-section and climb-speed counters wrong), sums quoted beside report.py's own totals, P-numbers only.
## 1. The window (report.py on Sessions rows 5700-5996, build 0.10.2 = main cdffdc627; 297 rows, 0 unread, 4 sessions)
Arrived 11-23 12:32 PM to 11-24 10:38 AM ET. **2 players, not 3**: P27 (child tier) and P24 (expert tier); each key carries one name, so
no shared phone. Every session starts at part 1 (a clean delta). 5 runs, **no 1-1 run and no World 2 run**.
| Player | Stage | Setting | Variant | End | Finish (game s) | Play s | Falls >=150 px | Lives / put-backs / hurts |
|---|---|---|---|---|---|---|---|---|
| P27 | 1-4 | Easy | 28 | finish | 2782 | 3339 | 56 (17,883 px) | 0 / 0 / 0 |
| P27 | 1-4 | Easy | 90 | left at y 4018 (66% up) | - | 1927 | 38 (9,765 px) | 0 / 0 / 0 |
| P27 | 1-4 | Easy | unlisted roll 99738 | left near the bottom | - | 372 | 4 | 0 / 0 / 0 |
| P24 | 1-2 | Normal | 83 | finish | 115 | 114 | 10 | 0 / 0 / 0 |
| P24 | 1-5 | Normal | 63 | finish | 145 | 144 | 14 | 0 / 1 / 1 (w1-15-big-sign: tendril trap, snake) |
Help: no stuckHelp, no rescues (players have none); quits: none chosen (two 1-4 runs simply left). Surveys (chips only): P24 on 1-2
and 1-5 both fun 5, long "About right", knew "Always"; P27 sent none.
## 2. Bots vs players on the same layouts, ranked (biggest gap first)
castBots (kid, adult, child, middle, expert; both settings) on variants 1-4 #28 and #90, 1-2 #83, 1-5 #63 (36 runs, worktree HEAD
0bb0080c, lists identical to the build's: 07470274, 6b772e6e, 957ac56d). The unlisted 1-4 roll cannot be rebuilt by castBots.
1. **1-4 Easy, the climb: the child bot leaves in minutes where the child player falls for half an hour.** P27: 2782 s and a 1927 s
   quit; the stall is the SAME band on both layouts, y 5000-5999 (mid-climb): #28 582 s and 18 falls there, #90 828 s and 24 falls,
   then left just above it. Child bot Easy: #28 FAIL 248 s (2 rescues, "fell back down from here 8 times" twice), #90 FAIL 212 s
   (1 rescue). The bot's 20 s rescue ends what the player had to climb out of: it hides about 90% of the cost. Kid bot: pass 120-122 s.
   One player, 2 layouts: a pattern for P27 (whose one 1-1 run was also 37 min), not yet for children.
2. **Bots stop at "the way on is 281 px down" where the player went on.** Child Easy #90 (x 41), and on #28 Normal the child (FAIL 305 s),
   middle (time-out 1200 s, 1 life) and expert (FAIL 200 s, 2 rescues). P27 climbed #28 to the top and #90 to 66% with no such stop.
   No player ran 1-4 on Normal, so the Normal half is bot-only evidence.
3. **1-2 #83 Normal: the expert bot is 26% slow, and the expert player beats the 2-minute floor.** P24 115 s (0 hurts); expert bot 145 s,
   middle 168, kid/adult 121-122. 115 s is under STAGE-RULES' 120 s floor for a quick player (one run: a flag for the Designer).
4. **1-5 #63 Normal: the expert bot sails through the big sign where the player was hit.** P24 145 s with the tendril trap, the snake and
   1 put-back at w1-15-big-sign; expert bot 171 s, 0 hits (the middle bot took the snake). n = 1.
## 3. Calibration proposals (no code; any recalibration is an engine job the lead rules on)
- **tierBots' 1-1 match holds**: no 1-1 run in the window, so the tier inputs did not move; `tierBots.test.ts` 7/7 pass on HEAD.
- **expert (P24, 4.3 min of play)**: jump hold p50 179 -> 150 ms (n 135); reversal share 0.314 -> 0.17; move hold 592 -> 643 ms; punches
  2.52 -> 0.23 /min; second press p50 493 ms. Pace off 1-1: bot/player 1.26 (1-2) and 1.18 (1-5). Proposal: do NOT retune on n = 1 a
  stage; ask for 3+ expert runs on 1-2..1-5 first, then fit the expert's run pace off 1-1 (its 1-1 match must still hold).
- **child (P27, 94 min, all 1-4 Easy, a climb)**: jump hold p50 219 -> 274 ms (n 444); stand-still 631 -> 1186 ms; steering let-go
  297 -> 1501 ms; flick share 0.262 -> 0.045 (a climb is dragged, so not comparable); punches 4.44 -> 6.17 /min, misreads 1.17 -> 0.21.
  Proposal: a climb mode for the child bot: no 20 s rescue on Easy climbs, and a fall rate fitted to the mid band (18-24 falls of
  280-350 px each), so the bot pays what P27 paid. Climb speed is no skill signal: 221 (P27) and 220 (P24) px/s, the engine's own.
- **middle**: no middle player in the window: nothing moved.
- **World 2 (R-165.413, R-165.398)**: no World 2 run exists in the window; it says nothing about either row.
## 4. Profiles
`tools/playtesters/profiles/window-1124.json` (new, aggregates only: the runs, the per-player window numbers, the 36 bot rows).
The player/tier files are NOT rebuilt (pushback below). report.py grew a STAGES section, a fixed climb speed and a self-test for it.
## Pushback
- Done-item 4 as written would break the profiles: report.py --profiles rebuilds from the rows it is given, so a new-rows-only pull
  would replace P1-P33's numbers with two players', and the packet forbids the whole-sheet pull. And with no 1-1 run the tier files
  cannot change. So the window is an addendum file; a full rebuild waits for the next whole-tab pull.
- "Matt and two testers": the sheet holds 2 players in this build. A third player's rows have not arrived (or played without sending).
## Instrumentation found (validate before reading)
- **The recorder names climb sections by x only**: 1-4 logs 3 ids (roots, going-up, rotting) across 10,979 px of height; placed
  sections carry x0/x1 and no y. Every 1-4 "section" time in the sheet is wrong; report.py now flags it and reads climbs by height.
- **climbSpeedPxPerS read vy, which is 0 on climb lines** (4,836 of 4,836 on 1-4): fixed to dy/dt (self-test plants it; the old code fails it).
## Checks
PASS: report.py --self-test, tsc, tierBots.test.ts (7/0), knowncheck. NO VERDICT: roadmapcheck (shallow clone, exit 2). NOT RUN (usage; no game code changed; CI runs them): suite, build, perf gates.
## Suggestions (ready packets)
- ENG: record climb sections by height (sectionAt by y on a climb stage; R-165.421 evidence above); then 1-4 places get names.
- ENG: castBots child climb mode (no rescue on Easy climbs; fall rate from window-1124.json); expert pace off 1-1 after 3+ runs a stage.
- DESIGNER: 1-2 #83 took an expert 115 s on Normal: check 1-2's 2-minute floor. LEAD: ask testers for 1-1 and World 2 runs (R-165.413/.398).
## Turnover note: reference/handoffs/analyst.md rewritten (this commit).
