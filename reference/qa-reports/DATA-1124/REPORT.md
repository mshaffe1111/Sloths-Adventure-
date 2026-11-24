# DATA-1124b: every test-site run since all nine World 1 stages went up (0.10.1 + 0.10.2), read against the bots
Start 11:08 AM ET 11-24, read finished 11:20 AM ET (`TZ=America/New_York date`). Branch t-data-1124, built on DATA-1124 below (its tools,
P-numbers and climb-by-height method; its 0.10.2 rows are re-read here inside the whole window, not redone). Lessons applied: find the
window from column F alone (rows are not in build order), sums checked against report.py's own totals, P-numbers only, castBots run on
the build the players had (lists checked by hash), one player's runs never counted as many players.

## 1. The window
Sessions rows **5388-5462 and 5500-5996** (572 rows, 0 unreadable, 17 sessions): every row whose F is the 0.10.1 build
(2026-11-21T14:37:27-05:00, first row 5388) or the 0.10.2 build (2026-11-22T16:43:02-05:00). Rows 5463-5499 are a 10-31 build and are
left out. Arrived 11-21 3:59 PM to 11-24 10:38 AM ET. **3 players, 24 runs, 16 finishes, 8 left or quit.**
- **P24** (expert): 4 runs, all Normal, all finished. **P27** (child): 8 runs, 5 finished. **P36** (new: first seen in this window,
  rated **middle** by the tier rule: 1-1 finish 194 s, 0 lives or put-backs): 12 runs, the only player to reach 1-7, 1-8 and 1-9.

| Stage | Setting | Runs (players) | Finished | Left / quit | Finish times (s) | Lives lost, put-backs, hurts: where |
|---|---|---|---|---|---|---|
| 1-1 | Normal | 4 (P24, P36 x3) | 2 | 2 (P36) | 144 (P24), 194 (P36) | P36's first two runs: left at w1-bank-double-teach (the tall steps), 2 put-backs each, 40 and 46 s in |
| 1-2 | Normal | 3 (P24, P36, P27) | 3 | 0 | 115, 174, 266 | P36: 7 put-backs + 7 hurts (again, long x2, crossing x2, finale x2); P27: 84 s in w1-12-hollow-log |
| 1-2 | Easy | 2 (P27) | 2 | 0 | 246, 332 | none |
| 1-3 | Normal | 2 (P24, P36) | 2 | 0 | 186, 188 | none |
| 1-3 | Easy | 1 (P27) | 1 | 0 | 660 | 8 hurts (gallery 4, other-way 3, perch 1); 4 sections over 60 s |
| 1-4 | Normal | 1 (P36, live roll) | 1 | 0 | 326 | 1 life (going-up, hurt), 9 hurts; 16 falls |
| 1-4 | Easy | 3 (P27) | 1 | 2 | 2782 | 0 lives (Easy climb: falls are the cost): 56, 38, 4 falls (DATA-1124) |
| 1-5 | Normal | 2 (P24, P36) | 2 | 0 | 145, 254 | **w1-15-big-sign: both players hit there** (1 put-back each); P36 also blocked, weave |
| 1-6 | Normal | 1 (P36) | 1 | 0 | 324 | 2 lives to pits (chain, rest-hump); chain: 65 s, 4 put-backs, 5 hurts |
| 1-6 | Easy | 1 (P27) | 0 | 1 | - | opened and left at 0 s of play (no section reached) |
| 1-7 | Normal | 2 (P36) | 0 | **2** | - | #47: 3 lives (moss, mossy-lianas, eagle-lands), 18 hurts (mossy-lianas 7), left at eagle-lands after 284 s; live roll: 117 s and 5 hurts at red-green, 1 life, left |
| 1-8 | Normal | 1 (P36) | 0 | **1 (quit)** | - | 2 lives to pits + 13 hurts, all at w1-18-at-pace; quit at 158 s |
| 1-9 | Normal | 1 (P36, live roll) | 1 | 0 | 205 | 5 hurts, 0 lives |
Sum: 24 runs = report.py's 4 (1-1) + 20 (STAGES). No World 2 run; no stuckHelp; no restart from the menu.

**Survey chips (14 surveys; chips only):** fun 5 on 12, fun 4 on 2 (P27: 1-2 #70, 1-3); long "About right" 14 of 14; knew Always 5,
Mostly 8, **"I got lost" 1 (P36 on 1-4)**; next Yes 6; hard: Nothing 3, "The falling pods" (1-4), "The big swing over the gorge" (1-6),
"The hollow by the roots" (1-2 Easy), "Punching the snakes" (1-3 Easy). No survey after the 8 runs that did not finish, nor after P27's
1-2 Normal or 1-4 #28 finishes: the three stages P36 could not finish (1-7 twice, 1-8) have no player rating at all.

## 2. Bots vs players on the same layouts (gap list, biggest first)
castBots (kid, adult, child, middle, expert; both settings; 126 runs) on every listed layout a player got: 1-1 #88 #10, 1-2 #41 #13 #82
#70, 1-3 #9 #18 #32, 1-5 #19, 1-6 #4 #22, 1-7 #47, 1-8 #46, run on release-0.10.1 4a8c1decd (the build's own commit 2a87f4cd is not in
this clone; every list hash equals the run's logged `list`: 96d6857e, 07470274, d1375548, 957ac56d, e98480ba, 89b45774, d9089477; t-data-1124's
base has since changed 1-6's and 1-7's lists, so these two layouts cannot be rebuilt there). Not rebuildable: P36's 1-1 rolls 10316872 and
64633360 (not on the 1-1 list), 1-4 roll 30117, 1-7 roll 52315, 1-9 roll 215955, P27's 1-4 roll 99738. The 0.10.2 layouts are DATA-1124's.
Bot rows: tools/playtesters/profiles/window-1124b.json.
1. **1-7 #47 Normal: the middle player loses 3 lives and leaves; the middle bot finishes with none.** P36: 3 lives, 18 hurts (7 on the
   mossy lianas), left at eagle-lands after 284 s. Middle bot: PASS 283 s, 4 hits, 0 lives (all eagle). Even the child bot finishes
   (490 s, 4 hits). The bots meet only the eagle; the player was hurt in 6 sections. P36's other 1-7 (a roll) also ended in a leave.
2. **1-8 #46 Normal: the player dies in the pits at w1-18-at-pace and quits; bots are hit but never fall in.** P36: 2 pit deaths + 13
   hurts in at-pace, quit at 158 s. Middle bot PASS 207 s, 8 hits, 1 life (hitBy 'other' 9, no pit); expert 165 s, 4 hits. No bot
   ever dies to a pit there: the bots' pacing over at-pace's gaps is better than this player's.
3. **1-4 Easy (DATA-1124's gap 1, unchanged):** the child bot's 20 s rescue ends what P27 paid 30+ minutes for in the y 5000-5999 band.
4. **1-3 #32 Easy: the child player takes twice the child bot's time and 8 hurts to its 0.** P27 660 s; child bot 328 s, 0 hits (the
   middle bot 209 s). P27's chip: "Punching the snakes" was the hard part. Bots step over or past what the child had to punch.
5. **1-6 #4 Normal: 2 pit deaths at the chain where every bot takes 0 hits.** P36 324 s, 65 s at w1-16-chain with 4 put-backs, 5 hurts,
   then a pit at rest-hump; middle bot 291 s, 0 hits. Chip: "The big swing over the gorge". The bots never miss the swing.
6. **1-5 #19 Normal: the middle player is 34% slower (254 vs 190 s), 3 put-backs vs 1 hit.** With P24's hit at the same big sign on
   #63 (DATA-1124 gap 4), w1-15-big-sign hurts 2 of 2 players who ran 1-5; the expert bot sails through it on #63.
7. **1-2 #82 Easy: every bot stalls where the child walked through.** kid, adult, child and middle all FAIL with a rescue at x 18651
   (w1-12-root-dip, "a 71 px waist-high step ahead, a drop of 53 px ahead"); the same layout on Normal passes. P27 spent 4 s within
   300 px of it. A bot defect on Easy's version of that step, not a player problem.
8. **The expert bot is slow for the expert player on every stage:** P24 / expert bot on the same layout: 1-1 144/170, 1-2 115/145,
   1-3 186/191, 1-5 145/171 (player 3-21% faster; 4 runs, one player).
9. **1-2 #70 Easy: the child player is 43% slower** (332 vs child bot 232 s), no hurts; chip "The hollow by the roots"; on #13 Normal
   P27 spent 84 s at w1-12-hollow-log yet beat the child bot overall (266 vs 316 s).
Matches (the bots are right): 1-1 #10 P36 194 / middle 205; 1-3 #9 P24 186 / expert 191; 1-2 #41 P36 174 / middle 157.
Where the player beats the tier bot: 1-3 #18 P36 188 / middle 228; 1-2 #13 P27 266 / child 316.

## 3. Opportunities (ranked by players affected, then severity; every count with its players)
1. **1-4's middle of the climb (y 5000-5999): 2 of 2 players who climbed.** P27 (Easy): 582 s / 18 falls and 828 s / 24 falls there,
   then left on #90. P36 (Normal, a roll): 54 s and 3 falls there, the slowest band of the run; P36's only "I got lost" chip and
   "The falling pods" as the hard part. A design/readability item for the Designer (where to go next on the climb, the pods' tell).
2. **w1-15-big-sign on 1-5: 2 of 2 players hit there** (P24 #63, P36 #19; 1 put-back each). Small, but the only single place every
   1-5 player paid at. Check the tendril trap / snake tell.
3. **1-7 and 1-8 for a middle player: 3 runs, 0 finishes, 6 lives, 36 hurts, 2 leaves and a quit (1 player, the only one there).**
   The heaviest cost in the window and no survey to say why. 1-7's hurts spread over 6 sections (mossy lianas 7); 1-8's pit deaths
   all at at-pace. Then the same player finished 1-9 (a roll) in 205 s with fun 5: the drop is 1-7/1-8, not World 1's end.
4. **1-1's tall steps on a first contact: P36's first two runs ever both left there within 46 s** (2 put-backs each; the double-jump
   line was never shown before the double-jump section on those first runs: report.py TEACHING "line shown before it 0, never shown
   2"). One player, but it is the first minute of the game. Both were live rolls (not on the 1-1 list), so no bot can replay them.
5. **Child hazards: 1-3 snakes (8 hurts, 660 s, chip "Punching the snakes") and 1-2's hollow (84 s, chip "The hollow by the roots")**:
   P27 only, 3 runs.
6. **1-6's gorge swing: 2 pit deaths, 65 s at the chain, chip "The big swing over the gorge"** (P36 only).
- **Loved:** fun 5 on 12 of 14 surveys and never under 4; length "About right" 14 of 14 (all three players, seven stages: 1-1, 1-2,
  1-3, 1-4, 1-5, 1-6, 1-9). The stages players finished, they liked.
- **Skips and help:** none (no skipOffer taken, no stuckHelp, no restarts). P27 opened 1-6 Easy and left before playing (0 s).

## 4. Does DATA-1124's 1-4 Easy finding hold for more players?
**Not yet for children; the place, yes.** No other player ran 1-4 on Easy, so the half-hour of falls still rests on P27 alone (3 runs,
2 layouts + a roll). The only other 1-4 run (P36, Normal, a live roll castBots cannot rebuild) finished in 326 s, but its slowest band
is the same y 5000-5999 (54 s, 3 falls), and it carries the window's only
"I got lost" chip. So the mid-climb band is now 2 of 2 players; the child-specific cost is 1 of 1. Still needed: Easy 1-4 runs from a
second child (or any Easy player).

## 5. Profile numbers that moved, and tierBots' 1-1 match
- **middle (P36, new, 12 runs):** on 1-1 (its finished run) jump hold p50 118 ms (tier normal 118, laterRuns 125), press-to-lip 55 px
  (58-59), second press 434 ms (416), late-press share 0.16 (0.12), ground press from standstill 0.61 (0.52); finish 194 s against the
  middle bot's 205 s on the same layout. **The middle tier's 1-1 match holds with a new player who was not in its calibration.**
  Moved off 1-1: gap between touches p50 454 ms (tier 313), drag p75 1629 ms (1246) across the later stages (slower, longer steering).
- **expert (P24, 1 more 1-1 run, #88):** finish 144 s against the expert bot's 170 s; jump hold p50 129 ms (tier 180), press-to-lip
  43 px (61), standstill press 0.15 (0.21). The same direction as DATA-1124's 1-2/1-5 read (shorter holds, faster pace), now on 1-1
  too, but one run: do not retune; it supports DATA-1124's "3+ expert runs a stage, then fit the expert's pace".
- **child (P27):** no 1-1 run, so nothing that tierBots reads moved. Off 1-1 the window's numbers are dominated by 94 min of climbing
  (see DATA-1124 section 3).
- **tierBots.test.ts: 7 pass / 0 fail** on t-data-1124 HEAD (11:16 AM ET). No recalibration proposed.

## Checks (DATA-1124b)
PASS: report.py --self-test; tierBots.test.ts 7/0; knowncheck. Report-only change (a markdown section, a JSON addendum, the turnover
note): no game code, so suite, build and perf gates not run (CI runs them). roadmapcheck: not run (shallow clone; no verdict possible).
Privacy: grep of the diff for the 6-letter code shape and the persona names before commit.

## Suggestions (ready packets)
- DESIGNER: 1-7 and 1-8 for a middle player (opportunity 3): read #47's mossy lianas and 1-8's at-pace pits against STAGE-RULES'
  difficulty curve; ask testers for 1-7/1-8 runs with a survey (the quit path sends none: consider asking the chips on leave too).
- ENG (castBots): the Easy-only stall at 1-2 #82 x 18651 (gap 7); pit pacing for the middle bot at 1-8 at-pace (gap 2).
- DESIGNER/CONTENT: 1-1's double-jump line is not shown before the tall steps on a first run (opportunity 4): check tipMemory order.

---

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
