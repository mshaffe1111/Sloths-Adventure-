# ENG-PLANT-CI: the 9 CI-tool-line reds on c27 (session 9 hand-over written 2:53 PM ET 11-25 by `date`; sessions 8, 7, 6, 5, 4, 3, 2 and 1 below it)

## EXACT NEXT STEP (session 10). HEAD = 62cc029ae + session 9's evidence (NO code change; CI-11 = 4cccba33e). Step 1 (the moved rows) is RUN and every moved row TRACED to where it parts; ONE row, 2-4 kid Easy 19 (PASS on CI-10 -> FAIL r1 on CI-11), is narrowed to two causes: (A) to the line, (B) to `intend` only. **STOPPED for the lead's ruling on (A)** (it decides whether CI-11 stands as built).
0. ReadNotifications: the lead's ruling on (A). Frozen trees: fz-ci10 = 8134a9a56, fz-ci11 = 4cccba33e (`git worktree add --detach`, node_modules
   symlinked, `chattr -R +i src tools`, src/game/gen2/proven left writable, D115). Probes (run `npx tsx <probe> <tree> ...` from inside the
   tree): ci-tools/s9-rows.mts.txt (one castBots row, every frame and press, as JSON; reproduces every set1 row's time exactly), s9-diff.py
   (where two trees part, the presses there, what each came to, every CI-11 standing press), s9-win.py (presses and set-downs in a window),
   s9-vfl.mts (vineFromLog per frame: its return, the lianas in reach), s9-judge.mts (a standing press: the judge's own flights beside the
   engine's frames), s9-who.mts (which bot methods return a pad, per frame).
1. **(B) narrow it to its branch:** in an UNFROZEN copy of 4cccba33e, tag each `return` in `intend` (firsttimer.ts:2935-) after the
   vineFromLog call, run 2-4 kid Easy 19 from 77.2 to 77.4 s: which branch returns {right: true} while he stands on log #75 at x 16,438
   (the log spans 16,368-16,518; liana #6 hangs at x 16,572, 134 px ahead and 54 px past the log's front) and runs him off the front into
   the water (set down at 77.733). Then the same river on CI-10 (it crossed at 84.667: off log #72 x 16,464, hold 0.293, caught #6 at
   85.000): which gate pressed there, and is it the one CI-11's judge now refuses?
2. (A) as the lead rules (see "SESSION 9 END STATE" (A)), then re-run set1 on the new head if the code moves (2 heavy runs), cmp3 and s9-diff.
3. Then steps 2 (the re-plants) and 3 (the final checks ONCE) of session 8's list below, unchanged.

## SESSION 9 END STATE (no code change; data/ci/set1-ci10, set1-ci11, cmp-ci11.txt, s9/)
**set1 on frozen CI-10 (8134a9a56) and CI-11 (4cccba33e), cmp3:** CI-11 moves **12 of 23 rows vs CI-10, ALL on 2-4** (2-1 and 2-2: 0 rows
move, as expected: vineFromLog's standing press acts on 2-4's log-under-liana rivers). **vs c27: 0 BAR PASS -> FAIL** (6 rows = c27, 17 move;
data/ci/cmp-ci11.txt). One BAR PASS -> FAIL vs CI-10: **2-4 kid Easy 19** (c27 FAILs it too: FAIL 168.8 r1).
**The 12 moved rows (s9/moved-ci10-ci11.txt; each parts at a CI-11 standing vineFromLog press, held its judged 0.16 or 0.2, CI-11's own change):**
| row | CI-10 | CI-11 | parts at | CI-10's press there | CI-11's standing press | each came to |
|---|---|---|---|---|---|---|
| adult N 24 | PASS 163.4 l0 | PASS 163.3 l0 | 80.900 | 80.633 x16179 #76 h0.235 | 80.633 same x, h0.2 | both caught #5 at 80.900, 0.3 px apart |
| adult N 32 | PASS 171.9 l1 | PASS 163.3 l1 | 37.800 | 37.800 x8141.6 #37 | 37.767 x8130.2 #37 | both caught #3 at 38.067 |
| child E 11 | PASS 239.2 | PASS 239.7 | 81.967 | 82.033 x10723 #50 h0.109 | 81.933 x10716 #50 | both caught #4 (82.400 / 82.333) |
| child E 23 | PASS 256.4 | PASS 246.8 | 96.767 | 96.967 x10444 #47 double | 96.733 x10425 #47 | both caught #4 (97.233 / 97.000) |
| child N 8 | PASS 330.7 l2 | PASS 341.7 l4 | 120.000 | none (stood on) | 119.967 x10793 #46 | CI-11 caught #4 at 120.267 |
| child N 39 | PASS 350.8 l4 | PASS 345 l5 | 108.867 | none | 108.833 x10887 #47 | CI-11 caught #4 at 109.167 |
| kid E 2 | FAIL r1 | PASS | 69.900 | 69.867 x16133 #77 h0.228 | 69.900 x16146 #77 | both caught #5 at 70.200 |
| kid E 12 | PASS 181 | PASS 172.7 | 29.600 | 29.667 x7134 #35 h0.240 | 29.567 x7127 #35 | both caught #2 (30.100 / 30.133) |
| kid E 13 | FAIL r1 | PASS | 11.833 | 11.867 x3062 #13 h0.146 | 11.800 x3057 #13 | both caught #1 at 12.300 |
| **kid E 19** | PASS 178.8 | **FAIL 169 r1** | 11.900 | 11.933 x3054 #13 h0.121 | 11.867 x3049 #13 | both caught #1; rescue later, below |
| kid E 20 | FAIL r1 | FAIL r1 | 113.567 | 113.700 x21939 #106 h0.066 | 113.533 x21926 #106 | CI-10 down on #107; CI-11 caught #8 |
| kid E 35 | FAIL r1 | PASS | 47.100 | none | 47.067 x10502 #48 | CI-11 caught #4 (session 8's trace) |
**kid E 19's rescue (s9/win-ci11-kidE19-72-100.txt, win-ci10-kidE19-74-91.txt):** 'set down here 3 times' at x 16,822, the river under liana
#6 (x 16,572). CI-10 crossed it once (set down at 77.2, then 84.667 off #72 caught #6). CI-11 set down FOUR times: 77.733, 85.300, 91.067,
99.000. Two causes:
**(A) a standing press judged to catch, flown at a lag the judge never flies (1 of kid E 19's 4; 6 presses in 5 rows: kid E 2 126.000,
kid E 13 84.433, kid E 19 97.700, kid E 20 126.033, child N 39 181.867 — each judged to catch, each came down on the next log 17 frames
later or in the water).** s9/judge-ci11-*.txt: vineFromLog judges `catches` at the three lags [mid, mid - sd/2, mid + sd/2] = 0.090, 0.057,
0.122 s (thumb [0.09, 0.065]; firsttimer.ts:2462 `lags`), i.e. take-off offsets 0.067 / 0.100 / 0.133 s, and EVERY one catches (frame 8-12,
free 0, both vx). But decide (firsttimer.ts:4921) draws the lag from the full gauss: the five presses came at offset **0.000** (kid E 2, 13:
a draw <= DT/2, pressed on the deciding frame itself, inside the vineFromLog call) or **0.033** (kid E 19, 20, child N 39: a draw in
(0.017, 0.033]), one or two frames before the earliest judged lag. kid E 19 at 97.700, frame by frame (s9/judge-ci11-kideasy19.txt): the
engine is the model's flight shifted one frame early and 2.7 px back (the log's carry, 80 px/s; y and held frames equal to the model's on
every frame: held 1-5, 884.8 / 867.7 / 852.7 / 839.8 / 829.0); the probe's clockless canGrabSwing reads it in reach at 97.933-98.067 but
the engine never catches (the swinging liana is elsewhere on its clock then); the judged flights catch at frame 11-12; he came down on #74 at 98.267, ran on and off its front (set down 99.000). **Not CI-11's flight model (hold and free counts
match the engine to the frame); it is the judge's lag coverage:** the three lags cover about 56% of the kid/child's draws (z -0.88 to
+0.66); about 19% press earlier, 25% later, unjudged. kid E 35 (the toy's row) drew inside it. **The lead's ruling is needed:** (a) judge
the press at the lag decide will draw (draw it in vineFromLog, judge that lag, hand it to decide: the hop judged is the hop flown; risk: a
re-draw each frame is the bot choosing its own thumb); (b) widen the judged lags to the thumb's whole spread (as the full gauss is clipped:
fewer presses judged good, the kid waits more); or (c) the miss is the kid's honest fast thumb, and the toy's claim narrows to presses
drawn inside the judged lags (the CI-11 toy's 'every standing press ends on a liana' is then not a law of the design). My view: (b),
because (a) lets the bot pick its lag, and (c) keeps a judge that passes presses it never flew (law 22).
**(B) refused, then run off the front (3 of kid E 19's 4: 77.733, 85.300, 91.067).** s9/vfl-ci11-kidE19-76.txt: hop from the bank at 76.067
(x 16,105), down on log #75 at 76.900 x 16,384, stopped by 77.133 at x 16,438; vineFromLog returns null EVERY frame (no standing catch
judged, no run-up; liana #6 at 16,572 in reach); from 77.233 `intend` itself returns {right: true} (s9/who-ci11-k19-77.txt: no other bot
method returns a pad that frame) and he runs off #75's front at about x 16,597 into the water, set down at 77.733. **Not yet narrowed
past `intend`** (next step 1). CI-10 at the same river pressed (84.667 off #72 h0.293, caught #6): which gate, not yet traced.
**Not run (session 9):** steps 2 and 3. Time used: step 1 only.

## (session 8 hand-over)

## EXACT NEXT STEP (session 9). HEAD = 4cccba33e (CI-11 + its toy) + this file. Step 1's code and toy are DONE; left of step 1: the moved rows.
0. Frozen trees: `git worktree add --detach <dir> <hash>`, node_modules symlinked, `chattr -R +i <dir>/src <dir>/tools` (D115). CI-11 =
   4cccba33e (fz-ci11b this session); CI-10 = 8134a9a56. Probes: ci-tools/s8-press*.mts.txt (`npx tsx <probe> <tree>` from inside the tree).
1. **CI-11's moved rows (rule 28; the lead: every moved row traced; one that cannot be narrowed: STOP and send the table).** Run
   ci-tools/set1-m.sh on a frozen 4cccba33e (out data/ci/set1-ci11) AND on a frozen 8134a9a56 (data/ci/set1-ci10; no CI-9/10 set
   exists, set1-ci8 is the last) as the two heavy runs at once; cmp3.py ci10 vs ci11 (the rows CI-11 moves) and ci11 vs c27 (the known
   flips); every row that moves from CI-10 is CI-11's: trace each (the standing vineFromLog press: its t, x, log, liana, judged catch,
   engine frame of the catch or where he came down; s8-press2.mts is the base: set the window to the row's press). 2-4 is where it acts
   (vineFromLog: a drifting log under a liana); 2-1/2-2 rows should not move (say so if any does, traced). Only then step 2.
2. The re-plants (riverRide :344 / :355), unchanged from session 7's step 2 below, on CI-11's head.
3. The final checks ONCE on the final head, session 7's step 3 below (the 4 files incl. the new hopJudged CI-11 toy).

## SESSION 8 END STATE (4cccba33e = CI-10 8134a9a56 + CI-11 + the toy + s8 evidence)
**Root (s8-press on CI-10, data/ci/s8/press-ci10.txt, 2-4 kid Easy 35):** vineFromLog judged at 47.500 with the steer from frame 1 and
hold 0.16 in hopFrame's count (held while i * DT < 0.16: frames 1-4, cut at 5). The bot pressed at 47.600 (pad RJP -> out -J: the thumb
still travelling to travelUntil 47.647, set by the R -> L turn at 47.467) and flew startJump's OWN draw, hold 0.0967 (the standing press is
not a liana hop, so nothing raised it; off = true, upOnly 0). The engine: frames 1-2 vx 75 (the carry, unsteered), steer from frame 3,
held frames 1-3 (pads at age 0, 0.033, 0.067), cut at frame 4 (vy -166.7). **And the count:** the engine holds the press's own frame
(age 0): frame i held while (i - 1) * DT < hold, one frame more than hopFrame's i * DT < hold.
**CI-11 (tools/inspect/firsttimer.ts):** (1) the standing catch flies every free count he can play at the press (from the travel/slip
already running: max(press, travelUntil, driftUntil); and steerFrom's, the turn armed too), every lag, both speeds: `frees(lag)`, the
`every` kept; (2) its hold in the engine's count (hopCatches(..., hold + DT, ...)); (3) startJump flies it single, held EXACTLY the
judged hold (standHold, set before decide; taken only by that press: pressJudged or pending still+judged, inside 0.5 s; the draws kept,
so the stream is as ever); the run-up branch clears standHold (its own press keeps runUpHold's max). tsc clean.
**On CI-11 (s8/press-ci11a.txt, draft 7d87016c4; 4cccba33e adds only the run-up's standHold clear):** the judge catches at 46.900; pressed
47.067 from x 10502.2 on #48 (no travel: travelUntil 44.89), hold 0.16 pinned: engine held frames 1-5, cut at 6 (the judged count), steer
from frame 1, **caught swing #4 at 47.400 (frame 10)**; then down on #44 x 11095.4 (main's first crossing lands there too).
**Toy (hopJudged.test.ts, the row's own shape, the real stage and bot: every standing vineFromLog press must end on a liana):** RED on
CI-10 (8134a9a56 + the test file, unfrozen copy red-ci10: "the standing press at t 47.600 from x 10545.1 on #48 was judged to catch; the
engine: grounded on #-1 at x 10190.0 y 947.0, frame 14" = the set-down from the water), GREEN on 4cccba33e (s8/toy-*.txt).
**firsttimer.test.ts 2-4 kid Easy seed 35 (:288-303 here, the lead's :312): GREEN on 4cccba33e** (s8/ft312-ci11-4cccba33e.txt).
**Traced vs main (s7/water-main.txt vs s8/water-ci11a.txt):** main 7 jumps off logs, 0 in the water, reached x 23,901 at t 157; CI-11
7, 0, reached x 29,056 at t 159: equal on the bar, further on. Same state as CI-10 to 46.900 (CI-10 decided only at 47.500); the
divergence is CI-11's own press (47.067, caught #4 frame 10, traced above). Main's first jump differs (off #46 at 42.6) by CI-9/10's
earlier changes, not CI-11; both first crossings land on #44 x 11095.4.
**Not done:** the guard toy (a standing press both trees catch; optional: the lead's ruling names only RED/GREEN), CI-11's moved rows
(set1 + cmp3), steps 2 and 3.

## (session 7 hand-over)

## EXACT NEXT STEP (session 8). HEAD = 8134a9a56 (CI-10 0db82fb25 + the plant-tests merge 0f95b96ed) + this file. **The lead RULED (reply to session 7): (c) BUILD CI-11; (a)+(b) RE-PLANT as below, ACCEPTED. Order: CI-11, then the re-plants, then the final checks ONCE on the merged head.**
0. Read the lead's answer first (ReadNotifications). Frozen trees: `git worktree add --detach <dir> <hash>`, node_modules symlinked,
   `chattr -R +i <dir>/src <dir>/tools` (D115). Probes: ci-tools/s7-*.mts.txt (run `npx tsx <probe> <tree>` from inside the tree).
1. **(c) 2-4 kid Easy 35, firsttimer.test.ts:312 (STILL RED on 8134a9a56's code = CI-10). RULED: build CI-11 (law 22: narrowing CI-10 would
   put back a known 2.5 px error to hide the row):**
   vineFromLog's STANDING catch (firsttimer.ts `catches`, the `[p.vx, 0].every` at ~:2434, `hopCatches(..., vx + carry, 0, carry)`)
   flies the press as the engine plays it: the kid's thumb travel (no steer for the first 2 frames from a stand: the engine's vx stayed
   = the carry 75 on frames 1-2, own steer from frame 3) and the hold as pressed (the engine's cut shows at frame 4, the model's at 5).
   The run-up branch (~:2509) already passes `free`; find how it computes `free` and the hold and use the same for the standing press.
   Planted toy FIRST (hopJudged.test.ts, ledgeToy/carryToy pattern: a log his way under a liana, him standing, the catch judged vs
   RealPlay pressed at the same frame): RED on CI-10 (judged catch, engine misses), GREEN on CI-11; plus a guard where both catch.
   The lead: the toy is 2-4 kid Easy 35's OWN shape (him standing on a log his way at 75 px/s, a liana ahead): RED on CI-10 (judged
   'catches', the engine misses), GREEN on CI-11 (the judge refuses the press, or flies it as the engine does). Then :312 GREEN, and
   2-4 kid Easy 35 traced against main (7 jumps off logs, 0 in the water): equal or better, or the difference explained frame by
   frame. CI-11 moves rows: every moved row traced (rule 28); one that cannot be narrowed: STOP and send the table.
2. **(a)+(b) RE-PLANT riverRide :344 / :355 (the lead's ruling applies: the engine = CI-10, so re-plant, never weaken).** By PHASE at
   gap 80 (a gap change scrambles the phases, s7/sweep-ci10.txt): measure for every phase 0..3 step 0.25 the `next` margin on the first
   log (the largest hopLandsOn margin at which ft:3672's `lands` still reads a log in reach for who.hold[0], from where he stands, each
   frame of the ride; ride.mts is the base), keep the phases whose margin is real (say the number; phase 0.5's is under 24 on CI-10)
   and where reAim on = 'hop', off = 'back'; :344 keeps "every kept phase hops on, >= 4 of them back off" only if 6 such phases exist
   (else the count the lead approves). :355 on the same kept phases: the first upstream press must be the first on-log hop (assert it),
   so the t@x compare tests the decision, not an earlier hop's noise. Prove the RED halves on the new rows: :344 with reAim off; :355
   with its plant (gateAirtime keeping h.thumb) in an UNFROZEN copy. One commit, the evidence in this file.
3. Then the final checks ONCE on the final head (session 5's list, the lead's order): the 4 files ALL GREEN; the 10 races (cr
   margins.mts); the known flips (set1-m.sh + cmp3.py vs c27; 2-4 child E 11 and kid E 13 traced); the wide sample (wide-m.sh, seeds
   1-10, every bot, both settings, 2-1/2-2/2-4: 0 BAR PASS -> FAIL vs main); 2-7 x40 (>= 29/40); tierBots 9/9; tsc; the CI tool line.
   At most two heavy runs at a time. Then push, ls-remote, the hash to the lead. Do NOT merge into release-0.10.3.

## SESSION 7 END STATE (8134a9a56 = HEAD's code: CI-10 + plant-tests)
**Probe (s7-athim, RealPlay, a log at 75 px/s flowing AT him, pressed at a stand / 4-frame walk / 12 and 30-frame runs, 12 frames):**
CI-10's take-off = the engine **0.00 px** every case; the old (CI-9) model 6.19-13.83 px off; CI-10 without the ride step 2.50 px off.
The ride step and the carry order are right for logs both ways (carryToy proved his way).
**(a) riverRide :344 'aims again', phase 0.5 (s7/ride-ci9.txt, ride-ci10.txt):** boarded log 17 at t 2.000 on both; the planted tap at
2.600. CI-9: the upstream gate's `next` (ft:3672 `lands`, who.hold[0] single, margin 24, ft:3760) read log 16 in reach from 49 px
behind the front ONLY by the old over-reach; reAim re-drew at 3.067 and 3.533 (double 0.125), hop at 3.567 from x 1026.1, landed
on 16 (HOP_TRACE upstream q16 landed 16). CI-10: `next` false the whole ride, so the reAim branch (ft:3871-3886) is never reached; he
stands and is handed back to the bank at 3.967 (x 994.0): the designed out-of-reach case. **Outcome: RE-PLANT** (the row no longer
tests the claim). Gap sweep (s7/sweep-ci10.txt): gap 80 on = hop back hop hop hop hop, off = back back back back hop back; gap 70 on
has a 'back', off only 3 'back'; gap 60 the same: by phase, not gap.
**(b) riverRide :355 'honest aim', phase 0.5:** the same root. Riding back first, the first upstream press is at 6.833 in BOTH runs
(the decision is the same frame) after an earlier on-log hop (padPause q15 at 5.300) that the loud run flies with its noise after its
press, as designed: the 0.6 px (1288.3 vs 1288.9) is that hop's, not the press decision. **Outcome: RE-PLANT with (a).**
**(c) firsttimer :312, 2-4 kid Easy 35 (s7/water-*.txt):** main: 7 jumps off logs, 0 in the water. CI-9: 6, 0 (off log 48 at
48.767 by a run-up, landed on 49). CI-10: 9, 1: **vineFromLog's standing press** (decide at ft:2486 at 47.500, judged `catches` at all
3 lags; pressed 47.600 from x 10545.1, vx 0, on log 48 flowing his way at 75) for liana 4: the engine never comes in grab reach
(canGrabSwing false on every engine frame, clock -1/0/+1 frame; no cooldown, swungOff -1) and he is set down from the water at 48.067.
**Would the engine land it: NO.** Frame by frame (s7-vine): the engine's frames 1-2 (x +5.00, +2.50 at vx 75) are CI-10's ride + carry
to the pixel; the judge's error is vineFromLog's own flight: free = 0 (steers from frame 1; the engine's kid from frame 3: the model
with free 2 = the engine's x to the pixel on frames 1-6) and its hold 0.16 cut at frame 5 (the engine's at frame 4), so the judged
flight is higher and faster and catches at frame 8. Pre-existing on CI-9 (the same free 0); CI-9 refused the press only because its
take-off stood 2.5 px behind (the missing ride step). Narrowing CI-10 would put that 2.5 px error back to hide the row. **Outcome:
neither re-plant nor narrow: the root is a new fix (vineFromLog's standing catch flown as pressed); the lead ruled: build CI-11.**
**The lip hoist (the lead's ruling):** hopJudged's Easy 2 and Normal 2 rows ARE the hoist's planted RED/GREEN on real rows (RED on
CI-8, GREEN on CI-9); no separate hoist toy; ci-tools/hoist-toy.ts.txt removed.
**Step 2 DONE:** origin/release-0.10.3-wip-plant-tests (0f95b96ed) merged, no force, auto-merged clean (test files only:
pacerLay.test.ts, firsttimer.test.ts, lianaRide.test.ts, riverRide.test.ts) = 8134a9a56; **tsc clean on frozen fz-m1 (8134a9a56).**
**Not run:** the 4 files on 8134a9a56 (they go once on the final head), the races, the known flips, the wide sample, 2-7 x40,
tierBots, the CI tool line (STOPPED on (c)).
Lessons applied: D115 (every verdict on chattr-frozen fz-ci9 / fz-ci10 / fz-main / fz-m1), D119 (commit messages from a file, no
heredoc in the commit chain), D120 (the question sent, the independent merge + tsc done before the box), D128 (stamps from `date`),
D134 (pushed and confirmed before the hand-over message), D138 (the hand-over ends new work), rule 28 (each moved test traced on its
row by frame against the engine).

## (session 6 hand-over) EXACT NEXT STEP (session 7). HEAD = CI-10 0db82fb25 (CI-9 + the take-off carry) + this file. **STOPPED per the order: the carry fix moved 3 tests it has not yet narrowed (table below). The lead decides before any more is built.**
1. **Trace the 3 new reds on CI-10 (rule 28, by frame, the engine as the truth), one line each: is the judge now the engine (the toy's
   expectation was set on the old model: re-judged with the lead's word, never weakened) or is the change wrong (narrow it).**
   (a) riverRide.test.ts:344 reAim 'aims again' ("with the skill: he aims again and hops off the first log every phase (hop back hop hop
   hop hop)") and (b) :355 reAim 'honest aim' ("phase 0.5: the press was decided on the drawn noise (as drawn 6.833@1288.3, loud
   6.833@1288.9)"): BOTH GREEN on v-ci10a (CI-10 with the press frame's ride step `b.x += carry * dt` taken out of physics.ts
   takeOffStep), so the RIDE STEP moves them. The toy logs flow AT him: check on RealPlay that the press frame off a log flowing against
   him carries him back 2.67 px first (carryToy proves it only for a log flowing his way at a full run); a toy that way first.
   (c) firsttimer.test.ts:312 (2-4 kid Easy seed 35: "no jump off a log came down in the water (1 of 9)"): STILL RED on v-ci10a, so the
   steer-then-carry order moves it (alone or with the ride step: not split further). Find the water row (seed 35, the log hop judged
   'lands' that came down in the water) and fly it judged vs RealPlay frame by frame.
2. **The lip-hoist toy (item 2) is NOT done:** the draft (ci-tools/hoist-toy.ts.txt: a jump straight up beside a 300 px block, his body
   4 px into its left face, the floor 100 px under the take-off) is GREEN on CI-8 (v-ci8 = 3558ba80e) AND CI-10 at 10 and 20 px under
   the top, so something else in CI-8's judge catches him there (not traced: hfprobe it on v-ci8). Build the case ONLY the hoist catches
   (RED on CI-8, GREEN on CI-9/CI-10); (b) 30 px under (neither) is GREEN on both, the guard. A first build had the floor 260 px under
   the take-off, past hopFlight's 200 px cut-off: always null (my error, fixed in the draft).
3. Then item 3 (trace 2-4 child E 11 and kid E 13 on the final head) and item 4 (the final checks), as in session 5's step 3 below,
   **with the lead's change to step 4 (message to session 6): after steps 1-3 and BEFORE the final checks, merge
   origin/release-0.10.3-wip-plant-tests (0f95b96ed or later: test files only; reds 5, 6, 8 re-planted GREEN, reds 7, 9 retired per
   R-165.432; the lead's merge-tree with 0db82fb25: CLEAN) into release-0.10.3-wip-plant-ci (no force; named in the commit), tsc, then
   the final checks ONCE on that merged head: the 4 files ALL GREEN there (reds 1-9: none left). Do NOT merge into release-0.10.3.**

## SESSION 6 END STATE (CI-10 0db82fb25 = HEAD's code)
**CI-10 (item 1):** physics.ts takeOffStep(b, dt, dir, hold, carry): the press frame off a floor that carries him (a drifting log)
first rides it (`b.x += carry * dt`), then steers his own speed on the ground, then adds the carry once, then the air move, as the
engine does (engine.ts :2654 the ground steer, :7434 groundJump's carryVx; the logs move him before both, :1930-1940). hopFlight,
hopFlies, gateLands/gateAirtime, gateSees/gateAir, tablePick, hopLandsOn, hopCatches/hopCatchAt and judge() take `carry` (vx0 stays
the sum the callers already pass; b.vx starts at vx0 - carry); every gate that summed p.vx + carry (9 `const vx` sites, 12 gate
calls, 4 tablePick calls, the edgeWait `lands`, the two vine-from-log run-up hops) passes it. **Probe (s6/carryprobe.mts, a bare log
at 80 px/s, him at a full run on it):** at 285 px/s the old and new vx are the same (the bleed is a fixed step) but the judge stood
2.67 px behind every frame (the press frame's ride); at 268 px/s the old judge also left at 348 -> 330 vs the engine's 365.
**Toys (hopJudged.test.ts carryToy, the engine's landing 1.5 px inside / outside a target's margin, at a held run's two speeds):
4/4 RED on CI-9 (frozen fz-ci9), 4/4 GREEN on CI-10.**
**The 4 files on CI-10 (frozen fz-ci10): 68 tests, 60 pass, 8 fail = reds 5-9 (lianaRide :56 :93, firsttimer :185, riverRide :266
:282) + 3 NEW (riverRide :344, :355, firsttimer :312: step 1). hopJudged: every test GREEN (the 13 + ledgeToy 3 + carryToy 4).**
judgeFliesEngine.test.ts + pitClimb.test.ts on CI-10: 20/20. tsc clean on fz-ci10.
**Not run:** the races, the known flips, the wide sample, 2-7 x40, tierBots (STOPPED at step 1's reds); items 2-3.
Lessons applied: D115 (verdicts on chattr-frozen fz-ci9 / fz-ci10; the split on the unfrozen v-ci10a), D119 (commit messages from a
file), D128 (stamps from date), D134 (pushed and ls-remote'd before the message), D138 (re-fetched before the first commit), rule 28
(the take-off traced frame by frame before the fix; the 3 new reds split by half before calling them), law 22 (no test weakened; the
hoist draft kept OUT of the suite because it does not prove what it claims), law 0 (the toy I built wrong is named, not hidden).

## (session 5 hand-over)

## EXACT NEXT STEP (session 6). HEAD = CI-9 (CI-8 3558ba80e + the lip hoist) + this file. Red 4 NOT green yet: ONE row left, traced
1. **The last red-4 row (2-7 home middle Easy 5, race q#91 t 142.467 x 3034, double hold 0.135, came down on bank #88): the take-off
   off a drifting log.** data/ci/red4-hoist.txt "easy5": the judged flight (11 candidates printed; #7 = the double flown) matches the
   run's y FRAME FOR FRAME, x is 3.8 px short at i1 and 8 px at i12: the engine's take-off vx is -365, the judge's -330. **Cause
   (traced to the line):** the engine (engine.ts groundJump :7434) ground-steers his own speed first (-268 -> -285) and THEN adds the
   log's carry once (carryVx -80, RIDE.keep.x 1): -365. The race gate (firsttimer.ts ~3767 `vx = p.vx + carry`) hands hopFlight the
   sum (-348) and takeOffStep's groundSteer bleeds it above maxRun to -330. 8 px further left the engine's ledge forgiveness on #88
   (feet 25 px above, toward it) catches him; the judge has him land on #91. **Fix (the bot's model = the engine):** hopFlight takes the
   carry apart (a `carry` argument: takeOffStep steers vx0 without it, then b.vx += carry), every caller that sums p.vx + carry passes
   the two apart (grep `p.vx + (Math.abs(carry)`, judge()'s `carry`). Toy: one built take-off off a drifting log at full run, the
   judge's flight vs RealPlay's (judgeFliesEngine's pattern) frame for frame; RED on CI-9, GREEN on the fix. Then hopJudged all 4.
2. **The lip hoist (CI-9) needs its toy** (the brief: a toy each way, RED on CI-8 and GREEN on CI-9): a tall solid (h >= WALL_H) beside
   the flight, his body 1-13 px into its face, feet within forgive.mantle under its top: the engine hoists him (engine.ts :2782-2798),
   the judge must catch; and the same 30 px under (no hoist): neither. ledgeToy in hopJudged.test.ts is the pattern (give others
   h/mantle/stepHelp as flightOthers does).
3. Then the final checks, once on the final head (at most two heavy runs at a time): the 10 races (cr margins.mts), the known flips
   (set1-m.sh + cmp3.py vs c27), the 4 files, the wide sample (wide-m.sh, seeds 1-10, every bot, both settings, 2-1/2-2/2-4 vs main),
   2-7 x40 (>= 29/40), tierBots 9/9, tsc. **The known flips WILL be re-judged:** CI-8 moved two Easy rows (below); every moved row is
   bisected and traced (rule 28) or named, or STOP and send the table.

## SESSION 5 END STATE (CI-8 3558ba80e, CI-9 = HEAD)
**CI-8 (red 4 as briefed):** hopFlight's others loop takes the ledge forgiveness by the engine's three conditions (not a drift log on
Normal; prev feet < top - 2; miss <= landPx and toward it at >= 30 px/s, b.vx after the move). **Toys (hopJudged.test.ts, ledgeToy: the
same flight judged and pressed on RealPlay, a bare world, a 12 px ledge, Normal 1-1):** (a) feet 0.3 px above the top before the frame,
toward it: the engine sets him on the floor #18; RED on CI-7 (judge: caught), GREEN on CI-8. (b) from 5 px above, toward at 60 px/s: both
catch on the ledge, GREEN on both (the guard: it cannot be RED on CI-7, which catches everything inside the reach). (c) from 5 px above,
moving away: neither; RED on CI-7, GREEN on CI-8. tsc clean (frozen fz-ci8).
**CI-8's 4 files (frozen fz-ci8): 64 tests, 56 pass, 8 fail = reds 5-9 + hopJudged Normal 2, Easy 5, Easy 2.** The original red-4 row
(t 22.133) is gone; three new rows came down on a SOLID the judge did not catch: Easy 2 edgeWait q#80 t 121.40 -> bank #76; Normal 2
edgeWait q#91 t 156.40 -> bank #87; Easy 5 race q#91 t 142.47 -> bank #88.
**Traced (data/ci/red4-hoist.txt, hfprobe2 on game time):** Easy 2 and Normal 2 are the WALLS' lip hoist, not onFloor: falling past the
face of the bank he hopped from, steering away, body 1.5 / 4.3 px into its face, feet 13 / 17 px under its top: hoisted (stepHelp lipL)
to x 6094 = 6100 - 19 + 13 and x 3216 = 3222 - 19 + 13. CI-7's "taken either way he moves" stood in for that catch. **CI-9 (HEAD):**
hopFlight takes the engine's lip hoist too (blockBeside, from either face or the step help's LIP_IN, feet <= forgive.mantle under the top,
vy >= -120, lipHasRoom); FlightOthers carries h, mantle, stepHelp. **hopJudged on CI-9 (dev tree, not frozen): 13 tests, 12 pass;
Normal 2, Easy 2 GREEN; Easy 5 one row = item 1's take-off carry.** tsc clean on CI-9.
**CI-8's known flips (data/ci/set1-ci8, data/ci/cmp-ci8.txt, cols c27 / CI-7 / CI-8): 19 of 23 = c27, 4 moved = the 2 named child rows
+ 2-4 child Easy 11 (PASS 239.2 -> 239.7, r0 l0) + 2-4 kid Easy 13 (FAIL 149.2 -> 172.4, r1 l0); 0 BAR PASS -> FAIL.** Both new rows are
Easy (landPx 12), not yet bisected or traced; re-run on the final head first (CI-9 may move them back).
**Not run this session:** the races, the wide sample, 2-7 x40, tierBots (red 4 is not green: run them once on the final head).
Lessons applied: D115 (verdicts on chattr-frozen fz-ci7t / fz-ci8; the HF print only on the unfrozen /home/user/hfc), D119 (commit
messages from a file), D128 (stamps from date), D134 (pushed and ls-remote'd before the message), D138 (re-fetched before the first
commit), rule 28 (the three moved rows traced by frame before the hoist; the last traced to its line, not guessed), law 22 (no test
weakened; toy (b) named as the guard, not claimed RED).

## (session 4 hand-over)

## EXACT NEXT STEP (session 5; DONE in part: see session 5 above)
1. Red 4 (the lead's order item 2, word for word: "Red 4 (hopJudged Easy 5: edgeWait predicted a fall, but the engine's overSmall
   steered him back onto #18 at 23.6 px past its middle against a 22.5 px threshold): the per-frame hopFlight vs engine comparison. The
   BOT's model matches the ENGINE (judged = flown). A toy each way. Then the races + flips again.").
   **TRACED in session 4 (data/ci/red4-flight.txt; ci-tools/hfprobe.mts + hf-print.diff on an unfrozen CI-7 copy): the overSmall steer is
   NOT the part.** The trace's thumbed flight for #18 (judge(), firsttimer.ts:1977, hopFlight with this.thumbAt() and the drawn release
   1,1,1,1,1,1,0,2,1) matches the run FRAME FOR FRAME to t 22.133 (x 16752.6 past 23.6 at 22.000, steer back LEFT from there, the same
   x/y/vy each frame). It then STOPS at i12 (b.x 16757.8, b.y 738.1, prev 720.7): hopFlight's "anything else catches him first" (ft:1150-
   1167, `others`) says bank #14 (solid 16454..16734, y 721, the bank he hopped from) catches him by the ledge forgiveness (side 0.360 x
   w 44 + reach 12 = 27.8 px; his centre 23.8 px past its end), so no flight lands on #18 and the row reads q -2. The ENGINE (engine.ts
   onFloor, :2879-2887) takes that forgiveness only if `playerPrevFeet < plat.y - 2` (feet at least 2 px ABOVE the top before the frame:
   720.7 vs 719, NO) and the jump carries him TOWARD it at 30 px/s or more (`(missL > 0 ? p.vx : -p.vx) >= 30`), and never for a drift log
   on Normal; so the engine does not catch him on #14 and he lands on #18 at f666 t 22.200 x 16753. **Fix (the bot's model = the engine):
   in hopFlight's others loop, outside the side tolerance apply the engine's own three conditions (not a drift log on Normal, prev feet
   < o.y - 2, miss <= landPx and the velocity toward it >= 30; b.vx after the move) instead of "taken either way he moves" (ENG-27o's
   comment: re-check its Easy 5 x 12053 case against the engine with the same probe; if it was caught by the side tolerance, the comment
   is wrong, not the engine).** Toys each way (pure hopFlight vs the engine's onFloor on one built case each): (a) prev feet within 2 px
   of a bank's top, centre past its end inside side+landPx: the engine does not catch, the model must not; (b) from above, moving toward
   it at >= 30 px/s, inside landPx: both catch; (c) moving away: neither. Then hopJudged (all 4 runs; red 4 GREEN), the races + the flips.
2. Then on the final head, once each (at most two heavy runs at a time): the races (margins.mts, 10), the known flips (ci-tools/set1-m.sh
   + cmp3.py vs c27: 21 rows = c27, the 2 named child rows below may differ; 0 BAR PASS -> FAIL), the 4 files (only reds 5-9 red), the
   wide sample (wide-m.sh on the c-report branch, seeds 1-10, every bot, both settings, 2-1/2-2/2-4: 0 BAR PASS -> FAIL vs main), 2-7 x40
   (at or above 29/40), tierBots 9/9 and tsc. Push, ls-remote, send the lead the hash and one line per item.
Setup in a fresh container: `npm ci --no-audit --no-fund --legacy-peer-deps`, frozen trees as below (git worktree add --detach, symlink
node_modules, chattr -R +i src tools, chattr -i src/game/gen2/proven); tools from ci-tools/*.txt (use the repo's node_modules/.bin/tsx).

## SESSION 4 END STATE: HEAD = CI-7 b0f55fc13 (CI-6 + the kid's front stand narrowed) + this file. Order item 1 CONVERGED
**The bisect (data/ci/bisect-21.txt; frozen fz-base d742d0469 = c27's head, fz-ci1 246d90533, fz-ci2 82b7f4c8d, fz-ci3 fa132c831,
fz-ci6 cc4251ece; 6-11 s a row):** c27's head reproduces c27 exactly; **CI-1 moves all three rows**; CI-2 moves child N11 again (CI-1
369.0 s 2 lives -> 357.2 s 1 life); CI-3 = CI-4 = CI-6 on all three (their code is race-leg only: SKILLS.race, the pacer; 2-1 has none).
Inside CI-1, one toggle at a time on CI-6 (var.sh): kid N19 returns to c27 EXACTLY with ft:3847 (the refused-log front stand) at 31;
the two child rows part from c27 at WaitAim.fresh (CI-1's honest aim).
| row | c27 | CI-6 | the candidate and the line | first parting (data/ci/partings-21.txt) | judged |
|---|---|---|---|---|---|
| 2-1 kid Normal 19 | FAIL 156.4 s r2 l6 | FAIL 159.2 s r3 l8 | CI-1, frontStandPx(kid) 31 -> 50 at the refused-log front stand (CI-6 ft:3847) | f2981 t 99.37, log #86 (drift BACK at him), x 19565, 40 px behind its front: c27 walks to 31 and hops on to #85 (t 99.50, lands); CI-6: 40 <= 50, no walk, he stands still and is ridden back | **NOT INTENDED**: the 50 is a let-go at FULL run; standing still there is no run-on to cover, so he stands where no hop is judged landing. No kid case was traced for CI-1 (its case: the child's reAim toy phase 1.5). **Narrowed in CI-7: c26StandPx = frontStandPx for the child (SKILLS.reAim's tier), 31 for every other tier, at c26's three front stands (ft:3693, 3854, 3888); raceStandPx untouched** |
| 2-1 child Easy 2 | PASS 268.7 s r0 l0 | PASS 288.2 s r0 l0 | CI-1, the honest aim: tablePick's `if (this.aim.fresh(t)) return null` (ft:2035 on CI-7), from ft:3474 | f2172 t 72.37, log #43 (drift his way), x 8602: the wait's draw (CI-7 ft:3462) single 0.038 refused, tablePick IN THE SAME FRAME (0.000 s apart) refused by fresh; c27 re-picked padPause's double 0.219 onto #44 | **INTENDED, named**: the traced case's own shape (riverRide's honest-aim toy phase 0: "a re-draw 0.000 s apart"); +19.5 s, 0 lives, PASS |
| 2-1 child Normal 11 | PASS 376.1 s r0 l0 | PASS 357.2 s r0 l1 | the same (ft:2035), then CI-2 (the judged hop: CI-1 l2 -> CI-2 l1) | f4504 t 150.10, log #64 (his way), x 14292: the same shape (draw single 0.091, tablePick refused 0.000 s apart); c27 hopped on to #65 | **INTENDED, named**; the life is downstream, 52 s later on another draw path: t 202.67 the upstream hop off #86 at x 19689 judged q -2 (the aim judged landing, the drawn thumb noise falls: the child's own fumble), in the water at x 19953 f6109 |
**CI-7 (frozen fz-ci7 b0f55fc13; data/ci/set1-ci7, cmp3.py): the 10 known-flip files, 23 rows: 21 = c27 ROW FOR ROW (kid N19 back to c27;
2-2/2-4 unchanged), the 2 moved = the two named child rows above; 0 BAR PASS -> FAIL.** riverRide on CI-7: 29 tests, 27 pass, 2 fail =
:266 (red 7) and :282 (red 9), the plants lane's; the reAim toys (reds 1-2) and the race-leg front-stand toy GREEN. tsc clean.
**The 4 files on CI-7 (frozen fz-ci7): 61 tests, 55 pass, 6 fail = reds 4-9 exactly** (hopJudged Easy 5 = red 4 unchanged: edgeWait q#-2
t 21.77 x 16688 came down #18; firsttimer :185; lianaRide DROP ON A LOG + A VINE FROM A LOG; riverRide :266, :282); reds 1-3 GREEN.
The races are not re-run on CI-7: the middle (the racer) is not the reAim tier and its stand stays 31, raceStandPx is unchanged, so CI-7
cannot move a race; they are re-run once on the final head (next step 2).
Lessons applied (session 4): D115 (verdicts on chattr-frozen trees; toggles only on /home/user/bis, one run at a time), D119 (commit
messages from a file), D128 (stamps from date), D133 (narrowed to the traced tier, no sweep), D134 (pushed and ls-remote'd before the
message), D138 (re-fetched before the first commit), rule 28 (every moved row bisected to its candidate and line and traced by frame
before the fix), law 22 (no test weakened).


## SESSION 3 END STATE: HEAD = CI-6 12cd548e4 (CI-5 NARROWED, the lead's ruling item 1) + this file. CI-5 36da03dd4 is SUPERSEDED
**CI-6 (firsttimer.ts, from CI-4's code):** `raceStandPx(who)` = frontStandPx(who) + one frame at maxRun (the decision frame; adult 41,
kid/child 60) at the two race-leg places only (CI-3's walk in the race branch, CI-4's landing ride stop), and stopMeant where the race
branch's walk ends (he stands within raceStandPx of a log's front on the race leg). DROPPED from CI-5: the `here` standingOnId fallback,
the general stopMeant (handed {}, c26's {}, the clockHeld stand), frontStandPx's own change (c26's stands keep 31 / 50).
**On frozen fz-ci6:** racefront every tier every phase 7-34 px behind the front, no water (CI-4: adult 3 waters, 7/8 past the front);
the riverRide test 'on the race leg, a log running his way...' GREEN (RED on CI-4); tsc clean.
**The 10 known flips (data/ci/set1-ci6 vs data/q/set1-c27 and data/ci/set1-ci4): 7 of 10 files = c27 ROW FOR ROW** (2-2 adult N, 2-2 kid
E, 2-2 kid N, 2-4 adult N, 2-4 child E, 2-4 child N, 2-4 kid E); **the three 2-1 files = CI-4's rows, NOT c27's** (child E2 288.2 s vs
268.7; child N11 1 life vs 0; kid N19 8 lives vs 6, N21 the same): moved by CI-1..CI-4, before this session, NOT yet traced. CI-5's
kid FAIL -> PASS rows are gone with the general stopMeant (none named as intended now). The 2-2 adult N4 fault leaves the rows as on
c27, so per ruling item 2 it is NOT fixed here: for R-165.424's list, the trace is in the SESSION 3 HAND-OVER below (f2986 t 99.53, #79).
**The 10 races (data/ci/margins-ci6.txt): 10/10 WON.** Margins (s; c27 / CI-4 / CI-6): home N1 7.21/8.41/7.81; N2 31.24/23.34/18.94;
N3 17.06/12.76/22.76; post N4 17.80/29.20/25.70; post N5 19.70/8.30/27.00 (2 race lives); home E1 19.77/23.67/25.87; E2 18.22/25.32/
25.32 (2 lives); E3 8.57/13.67/9.37; post E4 22.73/30.83/26.03; E5 29.70/32.60/24.80. Noise measured: rows move 5-19 s between candidates
(draw-path changes once a run parts), as ruling item 3 asks to name.
**Session 4 starts at ruling item 1's remainder:** trace the three 2-1 files' moves to CI-1..CI-4 (bisect fz-ci1 acf29a092 / fz-ci2
82b7f4c8d / fz-ci4 with set1-m.sh's 2-1 lines; CI-1's frontStandPx(child) is the first suspect, as :282's child N40 on CI-1), and either
make them c27's or name each as an intended move with its trace; then ruling items 2-4 (R-165.424 entry; REPORT with the noise; red 4;
the final checks). Not run on CI-6 yet: the 4 files, the wide sample, tierBots.

## SESSION 3 HAND-OVER (ENG-PLANT-CI-c; started 12:19 PM ET 11-25). HEAD = CI-5 36da03dd4 + its test 455d5f7e4 + this file. STOPPED: A NEW FAULT (brief)
**Item 1, the adult walk-off: TRACED and FIXED in the toy (CI-5 36da03dd4, firsttimer.ts).** racefront adult phase 0 on CI-4 (probe
ci-tools/racefront.mts.txt, `ONLY=adult DBG=1 DBGT=adult DBGP=0 F0=200 F1=100 PDBG=1`; it now prints stopMeant/releaseLeft/lastSteer):
(a) the walk let go 23 px from #10's front at 260 px/s: the walk is judged once a frame, so it lets go up to one frame's run (9.5 px)
INSIDE frontStandPx; (b) the stand it falls to (the handed stand's `return {}`, and c26's front stand `{}`) set no stopMeant, so the
adult's late lift-off (no holdQ: thumbify re-arms every frame, R-165.59) held {right} 3 frames (stopMeant false, releaseLeft 0 each frame,
lastSteer 1), 5 px past the front; (c) THE GATE THAT PRESSED IN THE AIR: ft:3922, the edge's generic blind press
(`if (!drops) return this.decide(dir, this.jumpFor(...))`, decide's stack in ci-tools/racefront-decide.mts.txt), reached because
`here = floorAt(p.x)` reads NOTHING once his middle passes the log's front while he still stands on it. CI-5: frontStandPx counts the
decision frame ((releaseMax[1] + 1) frames: adult 41, child/kid 60); stopMeant at every front stand (handed {}, c26's {}, the
clockHeld stand); `here` falls back to the engine's standingOnId when it is a drift/moving floor. racefront on CI-5: every tier, every
phase, 5-34 px behind the front, no water (adult 15-28; CI-4 adult 13 past to 5 behind, 3 waters). **Test** riverRide.test.ts 'on the race
leg, a log running his way...' (appended; reds 5-9's tests untouched): RED on CI-4 (adult 7/8 phases past the front), GREEN on CI-5.
Upstream (racefront-up.mts.txt, logs AT him): CI-4 -> CI-5 middle 0.5 and 1.5 hop -> handed (rides back to the bank; he stands 10 px
further back), expert 1 'hop 7 px past the front' -> handed, adult 0 log -> handed.
**The races on CI-5 (frozen fz-ci5; data/ci/margins-ci5.txt, CI-4's in margins-ci4.txt): 10/10 WON.** Margin (s; c27 / CI-4 / CI-5):
home N1 7.21/8.41/4.41; N2 31.24/23.34/21.94; N3 17.06/12.76/20.26; post N4 17.80/29.20/17.90; **post N5 19.70/8.30/3.60**;
home E1 19.77/23.67/19.57; E2 18.22/25.32/24.22; E3 8.57/13.67/30.27; post E4 22.73/30.83/26.03; E5 29.70/32.60/30.80.
Post N5 CI-4 vs CI-5 part at t 71.70 on #45 (CI-5 lets go of the front-stand walk a frame earlier); both at q#55 at t 89.63 within 2 px;
the 4.7 s goes after that (draw-path, not traced). Rows move +-5 to 17 s between candidates: **post N5's 3.6 s is inside that spread.**
**The 10 known flips (set1-m.sh, data/ci/set1-ci4 and set1-ci5, vs data/q/set1-c27 on the c-report branch):** CI-4 already differs from
c27 on the three 2-1 files (child E2 288.2 s, child N11 1 life, kid N19 8 lives: CI-1..4, NOT traced). CI-5 moves 8 of 10 files vs CI-4:
the KID rows FAIL -> PASS (2-4 kid Easy 2,12,13,19,20; 2-2 kid Normal 3,33; 2-1 kid Normal 19: the stand is a stop he means, the
intended move); **three rows LOSE A LIFE: 2-2 adult N4 (0 -> 1, +16.4 s), 2-4 adult N6 (0 -> 1, +8.6 s), 2-1 child N11 (1 -> 2).**
**THE NEW FAULT (2-2 adult N4, traced, ci-tools/rowprobe.mts.txt `ALL=1`):** the runs part at f2986 t 99.53 on log #79 (drift, his way):
he RAN at 268 px/s past its front (x 20265, front 20258: 7 px past; not a front stand: a run at the lip). CI-4: the blind press (ft:3922)
flew him off from there and he landed. CI-5 (`here` = the log by standingOnId): the log's judged gates hold him STANDING 13 px PAST the
front, vx 0, for 9+ s (t 99.6 -> 108.5+, carried his way), 6 s behind CI-4 from then; the life is a sinking pad (#116 x 29,664, t 143.5).
So the blind press hid a run past the log's front at full run; judged, he stands past the front where no hop is judged landing.

## EXACT NEXT STEP (session 4): THE LEAD'S RULING after the STOP, word for word
"LEAD RULING (D133: narrow, never sweep). Good STOP and a clean trace.
1. CI-5 is TOO WIDE: it moves 8 of 10 known-flip files, and 3 rows lose a life. The likely sweeper is `here` falling back to standingOnId on EVERY drift/moving floor, plus stopMeant at EVERY front stand. Session 4 NARROWS CI-5 to the traced cases only: the race-leg front stand (CI-3/CI-4's place), counting the decision frame there. The aim: the known flips match c27 row for row, except the intended kid FAIL -> PASS rows, each named.
2. The 2-2 adult N 4 fault (he runs past log #79's front, and the blind press was hiding it) exists on main's path too, just masked. If the narrowed CI-5 leaves 2-2/2-4/2-1's rows as on c27, it does NOT get fixed in this merge: it goes on R-165.424's list with your trace. Only if the narrowing cannot avoid moving those rows do you fix it, and then STOP and tell me first.
3. The race margins: the bar is every race WON. Margins are reported, not gated. 3.6 s WON is WON. Name the noise you measured (5-17 s between candidates) in the REPORT.
4. Then red 4 (bot model = engine), then the final checks as in your brief (the 4 files with only reds 5-9 left, the wide sample, tierBots, tsc).
Hand over on your box with this word for word in the EXACT NEXT STEP. If session 4's narrowing also fails to converge, STOP and send me the table: I will then decide the scope of this merge."
How (session 3's notes): trees fz-ci4 4da085f92, fz-ci5 36da03dd4 (chattr). Tools: ci-tools/*.txt -> /home/user/tl/*.mts; set1-m.sh +
margins.mts from release-0.10.3-wip-plant-c-report reference/qa-reports/ENG-PLANT/tools/; c27's flips: that branch's data/q/set1-c27/.
Compare each set1 jsonl (sorted by seed: pass, lives, time, rescues) vs c27 AND vs data/ci/set1-ci4. The narrowing: drop the `here`
standingOnId fallback; stopMeant and the decision frame only where the race-leg walk (SKILLS.race, the pacer on, the log his way) ends;
c26's frontStandPx untouched elsewhere; racefront + the new riverRide test must stay GREEN. The 2-2 adult N4 trace for R-165.424: above.

## SESSION 2 HAND-OVER (ENG-PLANT-CI-b; started 11:58 AM ET 11-25). HEAD = CI-4 4da085f92 = a CANDIDATE, NOT DONE: do not merge it yet
Branch release-0.10.3-wip-plant-ci: acf29a092 (session 1) -> 82b7f4c8d CI-2 RE-APPLIED (the lead's ruling: the judged hop is the hop
flown) -> fa132c831 CI-3 (the race front stand in the race branch) -> 4da085f92 CI-4 (the race front stand in the landing ride stop)
-> this file. Probes: reference/qa-reports/ENG-PLANT/ci-tools/race-probe.mts.txt and racefront.mts.txt (copy to /home/user/tl/*.mts).

**Post middle Normal 5's 3.20 s race loss on CI-2, TRACED (race-probe on frozen CI-1 acf29a092 vs CI-2 82b7f4c8d):** the runs part at
t 75.13 (the race double off #44 onto #43: CI-1's overSmall let go over #44 for 3 frames; CI-2 does not, as ruled) and land 2.4 px
apart; the drift-log timing then compounds. The LOSS: on #51 (a log running his way, the race leg) he came down at a run at 84.97 and
the LANDING RIDE STOP (landRide, ENG-PLANT-i, firsttimer.ts ~3950: a log running his way with no floor ahead is ridden, 'a stop he
means') stood him 143 px behind its front for 4.3 s. That stop sits OUTSIDE the race branch, so the race gate never looked; from the
front the double onto #52 lands (CI-1 took it from the front at 84.13). Ridden to bank #50, raced from #51 at 89.63: LOST by 3.20 s
(130.9 vs the boat 127.7). **A separate bot fault CI-2 exposes, not the race's margin**: c26 gave the FRONT STAND only to a log running
BACK at him. CI-3 adds it in the race branch, CI-4 in the landing stop, on the race leg only (SKILLS.race, the pacer off), and walks only
where the log is handed on to a floor or he can walk back from the front before it goes under (the handed stand's own check).

**Measured on CI-4 (frozen fz-ci4):** post middle Normal 5 WON 119.4 vs 127.7 (margin 8.3 s; CI-1 108.0, margin 19.7 s: MOVED, not yet
traced); home middle Normal 1 WON 107.5 vs 115.91 (margin 8.4 s; CI-1 not measured yet). The toy (racefront, the race leg's logs his
way, gap 150, 8 phases, 4 tiers): CI-2 the middle stands 46-184 px behind the front in phases 0-1.5 (the landing stop); CI-4 every
tier waits within 2-33 px of the front in every phase. CI-3's four files (fz-ci3): 60 tests, 6 fail = reds 4-9 exactly; reds 1-3 GREEN,
both race tests WON; :282's child Normal 40 the same as CI-1 (bankUp on 0 lives, off 1). CI-4's four files: see the line below.
**CI-4's four files (frozen fz-ci4): 60 tests, 54 pass, 6 fail = reds 4-9 exactly** (hopJudged 9/10: Easy 5 only; firsttimer :185, lianaRide
DROP ON A LOG + A VINE FROM A LOG, riverRide :266 adult N12 'still clean', :282 child N40 on 0 / off 1); reds 1-3 GREEN; both race tests WON.

## EXACT NEXT STEP (session 3)
0. Setup as session 1's step 0; frozen trees: fz-ci1 acf29a092, fz-ci2 82b7f4c8d, fz-ci4 4da085f92 (chattr; D115).
1. The toy each way, as TESTS (riverRide.test.ts, from racefront.mts.txt; read by what he does, never where): (a) race leg, a log his
   way: every tier waits within frontStandPx(who) + 12 px of the front, never mid-log: RED on CI-2 (middle 46-184 px back), GREEN on CI-4;
   (b) the same river with NO pacer (not a race): the landing stop stands him where he lands, as c27 (no row moved off the race leg);
   (c) a race-leg log whose run ends in the water with no floor (racefront's 4th arg `tail` > 0, short river): no walk to its front.
2. **CI-3/CI-4 DEFECT, TRACED (fix FIRST; the candidates are not mergeable until it is):** the front-stand walk runs the ADULT OFF the
   log's front. racefront adult phase 0 (`ONLY=adult DBG=1 DBGT=adult DBGP=0 F0=70 F1=106 FS=2` for frames; `PDBG=1` for intend vs pad
   per frame): stood 40 px behind #10's front (f70), 40 > frontStandPx 31, so the walk. intend {right} from x 1142; the PAD lags it 3
   frames (pad {} at 1142-1146, {right} from 1149); intend lets go at x 1174 (about 29 px from the front, ~1203) but the pad keeps {right}
   3 MORE frames (1174, 1186, 1198) at 260-268 px/s: no slowing at all; at x 1210 (past the front) `pending` is set and a press fires at
   x 1222 in the air (which gate set it: NOT traced; no gate should press past the front onto nothing), into the water, set back to bank
   #1 (x 850: the toy's 'handed#1'). Same in phases 2 and 3; phases 0.5/1.5/3.5 'hop' from 3-13 px past the front. So frontStandPx
   (12 px slide + releaseMax[1] = 2 frames for the adult) is short of the pad's measured release lag here (3 frames + the decision
   frame). Fix it general: the walk lets go where his stop from his CURRENT speed with the pad's real release lag ends before the front
   (read how rhythm/thumbify delays a let-go for each tier: firsttimer.ts rhythm() ~4825), and find the gate that pressed off the front.
   c26's upstream front stand uses the same number: check it with the toy flowing at him (racefront with dir -1) too.
3. The post margin move 19.7 -> 8.3 s (and home Normal 1 vs CI-1): race-probe CI-1 vs CI-4, the first frame they part and why (CI-2 parts
   from CI-1 at t 75.13; CI-3/4 part from CI-2 at t 69.63, the front-stand walk on #44, then a race double at 69.83).
4. The brief's CI line on CI-4: the 10 races (every race WON, margins vs c27) + the 10 known flips (ENG-PLANT's tools/margins.mts.txt,
   set1-m.sh.txt on release-0.10.3-wip-plant-c-report), each moved row traced to CI-2/3/4. Then red 4, reds 5-9, :282 as session 1's
   steps 2-3; then the final head's checks (tsc, CI tool line 0 fail, tierBots 9/9, wide sample 0 BAR PASS -> FAIL vs main).

## SESSION 1 (kept)
ENG-PLANT-CI: the 9 CI-tool-line reds on c27 (session 1, started 11:37 AM ET 11-25 by the hook's stamp; this file written 11:49 AM ET 11-25, updated 11:55 AM ET 11-25)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Branch **release-0.10.3-wip-plant-ci** (cut from d742d0469 = c27 +
raceSure deleted). ENG-PLANT-s merges this branch into its own; this branch never merges into release-0.10.3.
**Code head: af45a4de0 = CI-1 246d90533's code** (reds 1-2: the two reAim toys; can move the child and the kid only). **CI-2 0a9a49b91
(red 3) is REJECTED and reverted: a NEW FAULT, 2-7's race post middle Normal 5 LOST by 3.20 s (hopJudged #26, GREEN on c27 and on
CI-1); the lead is told (STOP, per the brief).** Tools: /home/user/tl (not in git; described below). Base release-0.10.3 = dfe631913.
**CI-1's four-file run (frozen fz-ci1, 60 tests): 53 pass, 7 fail = the 9 less the two reAim toys; 'SKILLS.reAim is the CHILD bot's
alone' GREEN. ONE MOVED ROW: riverRide :282's child Normal seed 40 on 2-1, with bankUp ON now 0 lives (c27: 1); off still 1 (so :282
reads '1 more' instead of '0 more'; still red, bar 5). A child row, CI-1 can move it (frontStandPx / the reAim floor): NOT YET TRACED.**
**CI-2's four-file run (frozen fz-ci2): 53 pass, 7 fail = reds 4-9 + the NEW race loss (#26 'the race LOST by 3.20 s'); red 3 GREEN.**

## The 9 on c27's head d742d0469, measured here (4 files, frozen tree fz-head): 60 tests, 51 pass, 9 fail, the same 9 as the REPORT
On the base dfe631913 (frozen fz-base; riverRide + lianaRide + hopJudged): hopJudged 4/4 GREEN, lianaRide GREEN (both plants), both
reAim toys GREEN; riverRide's base reds are :119 ride, :165 handed, :229 cross clean, :266 upstream, :282 bankUp (c27 fixed the first 3).

| # | red | first candidate red (bisected on the lean line dfe -> c2 80eb0784 -> c3 60bbf14c -> c3b a64f02ce -> 06b5316b -> c4 6b5f43da -> c19 9035c553 -> c20..c27) | cause (traced) | status |
|---|---|---|---|---|
| 1 | riverRide :344 reAim 'aims again' (GREEN half) | **c26 51ffe7ea** (also red at c20 d9681e40, fixed at c21) | (a) c26's front-stand walk (`return side(dir)`) came BEFORE the reAim expiry; the child's rhythm eats the walk (intend {right}, rhythm {}), so he stood 46 px from the front with the stale tap for 1.2 s and rode back (phase 0.5; base re-drew at +0.467 s and hopped). (b) phase 1.5: FRONT_STAND_PX let go at 31 px for every tier (2 frames late lift-off); the child lifts off up to 4 frames late (releaseMax [1,4]) and stood 9 px PAST the log's end, where no gate is reached (fell, a life) | **FIXED in CI-1**: reAim expiry before the walk; `frontStandPx(who)` = 12 px slide + releaseMax[1] frames at full run (adult family 31 unchanged; kid and child 50). Toy GREEN (all 6 phases hop), RED half still red with reAim off |
| 2 | riverRide :355 reAim 'honest aim' (re-draw inside stopReact) | **c2's merge 80eb0784** (0.200 s), 0.000 s from **c3b a64f02ce** | c2: padPause's refused flick drew an aim on log #13 (ft:3234 on c2), the upstream gate's new wait drew again 0.2 s later on the same log (f354 -> f360). c3b on: tablePick drew a whole hop for its thumb in the same frame as the refused aim (ft:1997 after ft:3413, f160 phase 0) | **FIXED in CI-1**: WaitAim keeps the last aim drawn on the same log inside the child's stopReact (no draw); tablePick waits until the aim was refused for his stopReact (then draws, a re-draw after his reaction). react = 0 for tiers without reAim: unchanged. Toy GREEN |
| 3 | hopJudged 2-7 home middle **Normal 2** ('padPause q#50 ... double \| came down #49 drift') | **c26 51ffe7ea** (GREEN through c25 6fb42bd1) | TRACED (CI-1, /home/user/tl/hj-probe.mts): the race hop at t 82.73 put him on #49; padPause judged a double off #49 onto #50 at t 83.97; at t 84.333 (falling, x 12517, #49 spans 12509..12659) overSmall read #49, the log he LEFT, past its middle and steered back (pad right), the second press at 84.400, down on #49's end. The judge (hopFlight) reads overSmall for the judged landing only | OPEN. CI-2 0a9a49b91 (a hop a gate judged off a drifting log sets jump.snapFrom = the log he leaves, so overSmall never steers back onto it) turned it GREEN (and Normal 5 / Easy 2) but moved the middle's home runs (judged hops 31/36/34/37 -> 34/33/36/31) and LOST race post middle Normal 5 by 3.20 s: REJECTED, reverted (af45a4de0). Waits on the lead (STOP) |
| 4 | hopJudged 2-7 home middle **Easy 5** ('edgeWait q#-2 judged t 21.77 x 16688 ... came down #18 drift') | **c2's merge 80eb0784** (red on every candidate after; base GREEN); unchanged on CI-2 | PART-TRACED (CI-1, hj-probe): off bank #14 (y 721) at x 16687.8, a 0.052 s single toward log #18 (y 749, 16670..16820 at the press); in the air pad right to t 21.933, {} at 21.967, then LEFT from 22.000 (overSmall: over #18 past its middle, steered back) and down on #18 at 22.200. The judge flew the drawn thumb and predicted no landing (q -2). Next: fly hopFlight for #18 with this row's thumb (thumbAt) beside the engine frame by frame and find the first frame they part (the thumb's travel on a turn, or the steer-back's frame) | OPEN |
| 5 | lianaRide DROP ON A LOG plant (RED half: off lives 0,1,0,0,0,0, bar >= 4) | **c19 9035c553** (c4 + the judged run-up, SKILLS.runUp); c4 GREEN | the judged run-up made the middle cross gap280 without dropOnLog (not traced which press) | OPEN: re-plant at the SAME bar or retire per R-165.432 (full search) |
| 6 | lianaRide A VINE FROM A LOG plant (RED half: easy off 0,0,0,0,1, bar: none) | **c22 52bcce62** (c21 f96df63e GREEN) | c22 (the landing keeps only the pull-back inside his run-out) put him where a catch off a log comes without vineFromLog (not traced) | OPEN: re-plant or retire per R-165.432 |
| 7 | firsttimer :185 boardHop plant | red on the base too (ENG-28's table) | (D135: fix or retire here, never carry) | OPEN |
| 8 | riverRide :266 upstream plant ('upstream off, still clean: adult normal seed 12') | red on the base too | | OPEN |
| 9 | riverRide :282 bankUp plant ('bankUp off, 0 more lives: child normal seed 40') | red on the base too | | OPEN |

## EXACT NEXT STEP (session 2)
0. Setup: `npm ci --no-audit --no-fund --legacy-peer-deps`; `git fetch --unshallow origin` (background); check out
   release-0.10.3-wip-plant-ci in the main checkout (head 246d90533 or later). Frozen trees (D115): `git worktree add --detach
   /home/user/fz-ci1 246d90533` and `/home/user/fz-head d742d0469`, symlink node_modules, `chattr -R +i src tools`, `chattr -i
   src/game/gen2/proven`. Bisect worktrees /home/user/bis, /home/user/bis2 (not frozen; one run at a time each). Recreate the tools
   below in /home/user/tl.
1. FIRST: the lead's word on CI-2 (STOP sent: it fixes red 3 and loses race post middle Normal 5 by 3.20 s). Until then nothing on red 3.
   When the lead rules: trace the lost race on fz-ci2 vs fz-ci1 (castBots/homeToys' race leg, middle Normal 5, the first frame they
   part and the hop whose air steer changed), and narrow the rule to the case traced (e.g. only a hop judged onto a log AHEAD of the
   take-off log), never loosening hopJudged.
   Also trace CI-1's moved row (riverRide :282's child Normal 40 on 2-1, bankUp on: 1 life -> 0): which life, at what x, and which of
   CI-1's three pieces (reAim before the walk, frontStandPx, the reaction floor) moved it (toggle each on unfrozen copies).
2. Red 4 (Easy 5) as its row says. Measured at the hand-over (/home/user/tl/hj-thumb.mts on fz-ci2; the same row on CI-1): the judge
   flew qs 17,18 (edgeWait), h single 0.052, thumb.release 1,1,1,1,1,1,0,2,..., thumbAt {last 1, driftPx 30, armed false, releaseLeft
   0, travel/slip done, speed 320, once true}. The engine: want {} at t 21.933 (overSmall let-go) with 1 late lift-off frame (release[5]
   = 1), {} at 21.967, LEFT from 22.000 with NO travel delay (lastSteer was 0), down on #18 at 22.200 (x 16753). The steer-back at
   22.000 came at 23.6 px past #18's middle against overSmall's 22.5 (0.15 w): a hair. Next: copy hopFlight into a probe with a
   per-frame print (its helpers imported) and fly it for #18 with this row's args beside the engine's x per frame; the first frame they
   part names the side that is wrong (the judge's thumb or steer model, or the engine's overSmall threshold reading p.x at a different
   frame). Fix it general, a toy each way.
3. The plants (reds 5-9): for each, the same bar searched on the head per R-165.432 (every listed stage with the mechanic, every bot,
   both settings); re-plant at the same bar where a live case exists, else retire with the search as evidence (the skill's code stays).
   5 and 6 are toy plants (lianaRide's gap280 / catch toys): first try the toy's other rolls and variants at the same bar.
4. If CI-1 (or a fix for 3-4) moves bot behaviour: on that head, once, the 10 races + the 10 known flips vs c27 row for row (only the
   rows meant to change, each traced: CI-1 can move the CHILD and the KID only: frontStandPx (both) and the reAim floor (child); a red-3 fix (CI-2 shape) can
   move EVERY tier that presses a gate-judged hop off a log (the middle's races included): each moved race row traced to it), and the
   wide sample (seeds 1-10, 2-1/2-2/2-4) 0 BAR PASS -> FAIL vs main. The scripts are ENG-PLANT's (REPORT, session 15's item 1:
   tools/margins.mts.txt, set1-m.sh.txt, wide-m.sh.txt on release-0.10.3-wip-plant-c-report). At most two heavy runs at a time.
5. DONE = the CI tool line at 0 fail, tsc, tierBots 9/9 on the head; push; ls-remote; send the lead the hash and one line per red.
   Lead's deadline for the 9: 1:30 PM ET; hard stop 3:30 PM ET.

## Tools (in /home/user/tl, not committed; recreate from here)
- bisect.sh: `W=<worktree> bisect.sh <out> <test file> <name pattern> <hash...>`: checks out each hash in W, runs the filtered test
  with the tap reporter, appends '== hash N ok M fail' and the not-ok/error lines.
- reaim-probe.mts `<tree> <phase> [all]`: riverRide's reAim toy river (the toy's own pieces), the first on-log draw stubbed to the
  0.033 s tap; prints every on-log drawHop with its frame and caller lines (stack), and with 'all' every 3rd frame (x, vx, log,
  distance to the front by sim.p.x 'fs', and the intend/rhythm pads, by wrapping run.intend and run.rhythm).

Lessons applied: D115 (verdict runs on chattr-frozen trees; probes only on trees not being edited), D119 (commit message from a file),
D128 (stamps from date), D134 (pushed and ls-remote'd before the hand-over), D135 (base reds named, not carried), D133 (one candidate,
not stacked), rule 28 (each red bisected to its first candidate and traced by frame before any fix), law 22 (no test weakened).
