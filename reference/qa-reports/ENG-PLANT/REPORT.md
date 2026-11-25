# ENG-PLANT-o (ENG-PLANT-c session 13, started 9:58 AM ET 11-25 by the hook's stamp): expert N 29 confirmed (a second shape, same block); the ROOT under both: he stands mid-log where no hop lands; a front-stand experiment crosses E 11 and N 29 clean; hand-over (LANES 3b box)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. **Code head UNCHANGED: c25 = 6a64aa41e** (no code commit; the probe
line went into the UNFROZEN main checkout at c25 and `git checkout` restored it, 0 diffs). Data: data/o/. Tools: tools/proberide-o.diff.txt, ridedead-o.mts.txt, expfront-o.diff.txt.

## Confirm on expert N 29 (the ruling's "confirm on a second row first"): the SAME block, a SECOND shape
- Probe (data/o/probe-e29-c25.txt): c25 expert Normal 29 on log #37 t 57.67-63.17 (x 13,079 -> 12,682; log drift -1, his dir +1), 166 frames:
  bank false, reach false, raceLegal false, **next TRUE on 165 of 166** (false once, t 57.70). Then the hop off solid #33 (t 76.70, edgeWait
  double, hold 0.086) falls: rescue f2316 t 77.20 at 12,758; stuck [12712, 57.2, 'water ahead']; time 204.2.
- Both rows stand inside the upstream block (firsttimer.ts :3721, `SKILLS.upstream && here.drift.dir !== dir`), at two different lines:
  - **Shape 1, middle E 11 (session 12): the front log, bank false AND next false** -> the block's last line `return next || bank ? ... : {}`
    (:3780) stands him; the log carries him back to bank #16. He got there by c3b's padPause tablePick (:3411) off #20.
  - **Shape 2, expert N 29: next TRUE** (a log ahead that `lands` passes with who.hold[0]) but the HELD drawn aim is refused by gateSees on
    every frame (one river, one speed: refused once is refused all ride); the `floatSure && next` branch stands him holding it (:3741-3743).
    reAim (end the held aim after stopReact, :3741) is the CHILD's skill only, and this branch has NO tablePick (the bank branch :3771 and
    padPause :3411 have one) -> handed back to bank #33, 5 rounds, rescued.
- **How the landing (801cae9e8) crosses E 11's river** (data/o/frames-L-mE11.txt, frames per 0.1 s): bank #16 (t 26.1, x 8,990) -> log #19
  (26.7, 9,148) -> #21 (27.9, 9,304) -> #20 (28.9, 9,425; the FRONT log, nothing ahead) **stood 1.9 s, carried back 9,425 -> 9,360**, until
  **#19 came round to the front** (31.4, 9,519) -> bank #17 (32.6, 9,663). The river's three logs (#19-#21, about 70 px/s back at him) WRAP:
  the same id reappears ahead. So "no next log NOW" is momentary: the landing boarded a front log and waited for the next to come round
  in its ride. A dead end is a log whose RIDE (until it hands him back) brings no bank and no log into reach, not one with nothing ahead now.
  A filter on "now" would have refused the landing's own #21 -> #20 hop.

## The root under BOTH shapes: he stands MID-LOG, where no hop lands (probe + a 2-line experiment, main checkout, restored)
- **E 11 is not a dead-end log** (tools/ridedead-o.mts.txt: each log's ride sampled 0.1 s by floatAt until it wraps; data/o/ridedead-*.txt):
  at the c3b tablePick (t 41.70) log #19 [9,391..9,541] has bank #17 within 80 px of its FRONT, and at t 44.0 log #21 has come round 80 px
  ahead of #19's front. But he landed 37 px from #19's REAR (x 9,379 on [9,342..9,492]) and the ride block stands him there: the gap branch
  (:3562) fires mid-log because the tier bot's look (his press distance, :3504) reaches past the lip; `lands` / gateSees judge from p.x, so
  from 113 px behind the front neither the bank nor #21 (when it comes round) is ever in a hop. N 29 the same: on #37 [12,995..13,155] at
  x 13,079, 76 px behind its front; the held aim refused from there all ride. The landing stood ~30 px from #20's front (t 30.7) and hopped
  when #19 came round.
- **Experiment EXP_FRONT** (tools/expfront-o.diff.txt, env-gated, 2 lines in the upstream block: refused with the next log in reach
  (:3749) or nothing in reach (:3781), he walks to 30 px from the log's front (side(dir)) instead of standing where he is):
  **c25 middle E 11: 0 rescues, time 171.3 (was rescued, f1870); c25 expert N 29: 0 rescues, 0 set-downs, time 154.0 (was 204.2, rescued).**
  (data/o/expfront-*.txt).
- **The 7 B+C seeds (7, 11, 18, 29, 32, 35, 38) x middle/child/expert, both settings, 35 rows, EXP_FRONT on c25** (data/o/expfront-bc.jsonl;
  baselines data/n/landing-801cae9e8-2-7-x40.jsonl and data/m/c24-2-7-x40.jsonl = c25 row for row):
  **6 of the 7 B+C losses PASS again**: middle E 7 (F208r1 -> P191r0), E 11 (F226r1 -> P171), N 32 (F222r1 -> P206), expert N 18
  (F189r1 -> P173), N 29 (F204r1 -> P154), N 35 (F198r1 -> P190). **child N 38 still FAILS** (F386r3 -> F391r3: session 12's other shape,
  the walk-off at vx 268 off bank #17 into the first river, not the stand). **ONE NEW LOSS: child E 11 P257r0 -> F285r1, TRACED: cluster A's
  shuffle, not the stand** (data/o/frames-{c25,expfront}-cE11.txt, trace-expfront-cE11.txt): first split t 40.50 on log #20 at x 9,315,
  the front-stand line (c25 stands, EXP walks to the front). c25 is handed back TWICE at that river (#20 -> bank #16 t 44.9; #19 -> #16
  t 47.8) and crosses at t 52.0; EXP goes #20 -> #19 (41.1) -> bank #17 (42.9), no hand-back, 9 s earlier. Then the lip family takes him
  at the solids: walk-offs at full run, 'hop none', off solid #25 [10,786..11,086] (t 116.97, vx 268) and #27 [11,437..11,655] (t 120.93,
  vx 285), 'set down here 8 times', rescue at 11,016: cluster A (R-165.398, ruled not fixed before the merge), moved by the earlier crossing. The other 27 rows hold their pass/fail; most times drop (expert N 29 204 -> 154, middle N 38 284 -> 185).
- So the narrowing that meets the ruling's invariant at its cause: on a log running back at him, the stand is AT THE FRONT; from there the
  judged gates (upstream `next` gateSees, the bank branch, tablePick) land the hop when the next log comes round or the bank is in reach,
  so he is not ridden back. The hand-back memory and a dead-end filter become a backstop only if rows still hand back after it.

## EXACT NEXT STEP (session 14)
0. Setup: `npm ci --no-audit --no-fund --legacy-peer-deps`; `git fetch --unshallow origin` (background). Worktrees in /home/user (this
   container had no /home/user/plant-work: freeze.sh.txt's `cd` needs that dir or edit it to the main checkout): fz-c25 6a64aa41e,
   fz-27e 801cae9e8 (landing), fz-c2m 80eb07842, fz-c3b a64f02ce5; node_modules symlinked. Rows: tools/wide.sh-n.txt (castBots --json).
1. **THE LEAD'S RULINGS (session 13's brief; they win):** (1) B+C is OURS: NARROW it in the bot. The invariant: a bot is never ridden into a
   rescue and never repeats an identical round: after one hand-back to the bank he boarded from he takes a way on that lands (a judged
   press, the run-up, or a log the gate judges), and tablePick never delivers him onto a log whose run carries him back with no bank or
   next log in reach. A toy each way (RED on c25 middle E 11 / expert N 29, GREEN on the fix). (2) A and D: NAMED as the lip family
   (R-165.398), pre-existing, moved by the earlier path split; on R-165.424's list; NOT fixed before the merge. (3) Re-measure on the fix:
   2-7 seeds 1-40 BAR rows vs the landing rows (every moved row traced), the 2-1/2-2/2-4 wide sample vs main (zero BAR PASS -> FAIL), the
   10 known flips, 1-4 and 2-5 vs main, the race margins (tell the lead if post Normal 5 flips). (4) Then the checklist: pacerLay 22/23
   re-planted at their same bars as laid toys (23/23); hopJudged; the toys for c23's, c24's and c25's rules; the packet's plants (same
   bars, or retire per R-165.432); riverRide + firsttimer; the CI tool line at 0 fail; tierBots 9/9; timecheck + roadmapcheck. MERGE into
   release-0.10.3 (no force) ONLY on the lead's word: send the table first. REPORT BY 12:00 PM ET; HARD STOP 2:00 PM ET; two heavy runs max.
2. **Candidate c26 (the lead rules between them; my recommendation is (A)):**
   (child E 11's new loss is traced: cluster A's shuffle, above.) Build the candidate the lead picks:
   **THE TOY IS WRITTEN (fix-agnostic, either candidate): tools/handBack-o.test.ts.txt** (a hand-back read by what he meets: a stand on a
   floor, logs only, a stand on that same floor again; no floor handed back to twice, no rescue; 2-7 middle Easy 11 and expert Normal 29,
   cap 120). **RED on c25** (data/o/toy-handBack-c25.txt: E 11 'a floor handed back to 5 times (6 hand-backs)', N 29 '5 times (5)'),
   **GREEN under EXP_FRONT** (data/o/toy-handBack-expfront.txt, 2/2). Land its two tests inside tools/inspect/riverRide.test.ts (already on
   gates.yml:157's CI tool line; a new file needs that line too, or src/game/ciTests.test.ts fails).
   (A) the front stand: tools/expfront-o.diff.txt WITHOUT the env gate (two lines in the upstream block; a comment naming E 11 x 9,379 /
       N 29 x 13,079, the gap branch's tier look, and the ruling). Toys (tools/inspect/*.test.ts, as riverRide's): RED on c25 middle E 11
       and expert N 29 (a hand-back round ending in a rescue), GREEN on c26; the c2m gains child N 5 and middle N 13 still cross.
   (B) as ruled word for word, if the lead keeps it: hand-back memory (boardedFrom; after one hand-back the upstream `next` branch takes
       tablePick on a refused held aim, the boarding gates skip a dead-end log, else he stands on the bank by choice) and tablePick drops a
       log whose RIDE brings no bank/log into reach FROM WHERE HE WILL STAND (tools/ridedead-o.mts.txt; it must pass the landing's #21 -> #20
       at t 28.8 and refuse c25 E 11's #20 -> #19 at t 41.73; by the log's front alone it does NOT refuse it: see above).
3. Re-measure (ruling 3), then the checklist (ruling 4). Push candidates to release-0.10.3-wip-plant-c only with their rows to the lead.

Lessons applied: D134 (pushed + ls-remote before the hand-over), D128 (stamps from `date` / the hook), D115 (the probe in the UNFROZEN
checkout, restored, never a frozen tree), D119 (commit message from a file), rule 28 (the cause traced on a second row before the fix).

# ENG-PLANT-n (ENG-PLANT-c session 12, started 9:38 AM ET 11-25 by `date`): 2-7's lost seeds clustered, traced and bisected; hand-over (LANES 3b box)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. **Code head UNCHANGED: c25 = 6a64aa41e** on
release-0.10.3-wip-plant-c (no code commit this session). Frozen trees: fz-27e (801cae9e8), fz-base (dfe631913), fz-c2m (80eb07842 = c1+c2
on the base), fz-c3b (a64f02ce5), fz-c4 (6b5f43da0), fz-c25 (6a64aa41e), fz-l0 (5a6847ffe, unused). Data: data/n/. Tools: tools/*-n, trace-n, frames.

## 2-7 x40 (seeds 1-40, the 4 BAR bots, both settings, 280 rows; castBots --json, lanes)
- **Landing t-build-27e 801cae9e8: 29/40 seeds with every BAR row passing: reproduced exactly** (data/n/landing-801cae9e8-2-7-x40.jsonl).
  (The landing report's 29/40 was taken on 5a6847ffe with other failing seeds; 801cae9e8 gives 29/40 too, on its own rows.)
- c25: 24/40. Landing -> c25: **17 BAR rows PASS -> FAIL (11 seeds lost), 11 fail -> pass (6 seeds gained), child N 36 fails on both.**
- **Bisect of all 28 moved rows** (data/n/bisect-L-base-c4-c25.txt, bis-*.jsonl): landing -> base dfe631913 moves 2 (child E 32, child N 19:
  fail -> pass, a merge effect in our favour); **every one of the 17 losses moves inside ENG-PLANT**: c1+c2 merged on the base (80eb07842)
  7 lost / 8 gained; **c3 + 3b (a64f02ce5) 10 lost / 1 gained**; c4 0; c4 -> c25 0 (c24 = c25 row for row, session 11).

## The clusters (by place and cause; two traces each; frames from trace-n / frames, data/n/divergences.txt, handback-loops.txt)
| cluster | place | lost (piece) | gained | cause |
|---|---|---|---|---|
| **B+C: the hand-back loop** | the two rivers whose logs drift back at him: 8,400-9,400 and 12,700-14,200 ('water ahead') | 7: middle E 7 (c2m), E 11 (c3b), N 32 (c2m); child N 38 (c3b); expert N 18, 29, 35 (c3b) | 5 at c2m (child N 5, 11, 18; middle N 7, 13: falls in the same rivers saved) | **ENG-PLANT's own**: on the last log no hop is pressed; the log carries him back to the bank he boarded from; he boards again; round after round until the stuck clock rescues him (4 traced; other shapes at the same place below) |
| **A: the solids' ends** | solids #26-#30 at 10,400-12,800 ('set down here 3-8 times') | 9: adult N 11, N 24, child E 30, N 20, N 40 (c2m); child E 24, N 9, N 10, middle N 15 (c3b) | 4 (child E 5, 28, 33 at c2m; child N 22 at c3b) | pre-existing: a walk-off at full run or an unjudged jump ('hop none') off a solid's end into the water, on the landing too; moved only because the run splits earlier (below) |
| **D** | home leg 2,500-3,700, y 1,607 | 1: child N 34 (c3b) | 0 | walk-off left off solid #106, then 'nothing in the way the bot can see', 4 rescues; ONE row (no second in 280) |
Traces (seed, x, frame, what took him):
- B, c25 middle E 11: on log #19 at 9,370 (t 42.3) no hop for 5.4 s, carried back to bank #16 at 9,004 (t 47.7); 3 rounds (edgeWait 48.4,
  55.2, 61.2); rescue f1870 at 9,171. c2m middle N 32: #19 at 8,831 (t 32.8) carried back to #16 at 8,487 (t 38.8); rounds; rescue f1584 at 8,634.
- C, c3b expert N 18: on log #39 at 13,291 (t 53.2) no hop for 7.5 s, carried back to bank #34 at 12,811 (t 60.7); 4 rounds (edgeWait 60.7,
  62.7, 66.6, 69.1); rescue f2198 at 12,997. c25 expert N 29: #37 at 13,074 (t 57.1), back to bank #33 at 12,674 (t 63.2); 5 rounds; rescue f2316.
- Same rivers, other shapes (c25): middle E 7: 20 s 'open drop, water ahead' at bank #17 (9,987), then an edgeWait hop at vx 87 off
  its end falls short, rescue f2104 (the loop not checked); child N 38: walk-off at vx 268 off bank #17 [8181..8481] into the first river
  (f2251), then three 20 s stands ('water ahead' / 'nothing in the way'), 3 rescues (f2855, f3455, f4055); expert N 35 (14,183) not traced.
- A, c25 child N 20: walk-off at vx 285 off solid #27 [10705..10875], then a jump at vx 87 off #28 [10981..11151], 'hop none', 8 set-downs,
  rescue f3874 at 11,244. c25 adult N 11: jump at vx 87 off #28 [11133..11303], 'hop none', rescue f1272 at 11,396; adult N 24: jump vx 87 off #29 [11541..11711], 'hop none', rescue f2202 at 11,798. **Same on base** (its pass/fail
  = the landing's here): child N 22 walk-off vx 285 off #30 [11397..11567], rescue f5343 at 11,892; child E 28 walk-off vx 268 off #26, rescue f2461.
- Why A moves: the first split, base -> c4, is at the FIRST river, 40-60 s before: child N 20 f2012 (x 8,567, log #19), middle E 11 f814
  (9,122), expert N 18 f703 (8,496): the new tree presses a judged padPause hop where the base walks on (c2's judged flick / c3b's tablePick);
  c2m -> c3b on expert N 18 splits at f869 (9,349, padPause tablePick vs the base's upstream hop a frame later). After that the run meets
  the same places at other times: the 4 gains and 9 losses in A are that shuffle, not a new way to fall.
- B+C's branch, first probe (tools/refuse.mts.txt: every gateSees call in a time window, its caller line, target, answer), c25 middle E 11:
  t 41.73 on log #20, :3400 (padPause flick, judged) REFUSED both targets (#19, #21 false); the tablePick hop put him on #19 (t 42.3). On #19
  (t 42.3-47.7, carried back to the bank) **no gateSees call and no tablePick call at all** (tools/refuse2.mts.txt: tablePick called once
  in t 41.5-47.8, at 41.73 on #20 with to=[#19,#21] -> single 0.135, the hop onto #19). So the padPause branch (:3390-3417) is NOT
  reached on the last log. Third probe (tools/branch.mts.txt: every FirstTimerRun method called in a window, by caller line; t 42.5-47.5,
  151 frames): 143 frames run edgePlan :3503 -> the gap branch `if (!ahead)` :3562 (floorAt :3568, :3571) and return with NO further
  bot method call (no gateAir, no tablePick, no startJump). **CONFIRMED (fourth probe: one log line after :3644 in the UNFROZEN main checkout
  at c25, run, then `git checkout` restored it, 0 diffs): every frame t 43.0-47.5 on #19 (x 9,337 -> 9,022, drift -1, his dir +1): bank false,
  next false, reach false, raceLegal false.** The ride block :3623 (on a drift log): `bank` = a solid
  within 80 px of the log's edge (false), `next` = a log that lands (false: the last log), raceLegal needs the log drifting HIS way
  (false: these logs run back at him), so he rides, waiting for the log to bring the bank near; on these rivers it carries him AWAY, to
  the bank he boarded from. The ride rule is old; what ENG-PLANT changed is where he boards: c3b's tablePick (:3411) put him on #19 at
  41.73 when the padPause flick off #20 was refused (:3400 false on #19 and #21). The c3b comment at :3406 names this very loop on 2-1
  (middle N 25) as what tablePick fixed.

## The lead's rulings (received): B+C ours, narrowed in the bot (a toy each way) and re-measured; A and D named as the lip family (R-165.398),
not fixed before the merge, on R-165.424's bot list. Word for word in the EXACT NEXT STEP, item 1. No merge.

## EXACT NEXT STEP (session 13)
0. Setup as session 12: `npm ci --no-audit --no-fund --legacy-peer-deps`; `git fetch --unshallow origin` (background); frozen trees with
   tools/freeze.sh.txt's lines (node_modules symlinked; about 1 min each): fz-c25 6a64aa41e, fz-c2m 80eb07842, fz-c3b a64f02ce5, fz-base dfe631913.
   Rows: tools/wide.sh-n.txt (castBots --json, one row per line; arg 5 = extra flags, e.g. "--bots adult,child,middle,expert"); a list of
   rows: tools/bis.sh-n.txt (groups file "bot setting seeds"); compare: tools/cmp.py-n.txt; first split: tools/frames.mts.txt + div.py-n.txt.
1. **THE LEAD'S RULINGS (received this session; word for word):** "B+C is OURS: NARROW it in the bot: a bot handed back to the bank it
   boarded from does not re-board into the same refusal loop; after one hand-back he takes a way on that lands (the judged press, the run-up,
   or the next log the gate judges), never a second identical round; instrument which gate refused first (c1's bank-hop refusal at
   firsttimer.ts:3529 or c3's 'else stand'), a toy each way (RED on c25 middle E 11 / expert N 29, GREEN on the fix). Re-measure: 2-7 seeds
   1-40 BAR rows AND the 2-1/2-2/2-4 wide sample (shared gate), plus the 10 known flips. A and D: NAMED as the lip family (R-165.398: a
   walk-off at full run or an unjudged hop off a solid's end into the water), pre-existing on the landing tree, moved by the earlier path
   split: NOT fixed before the merge; they go on R-165.424's bot list. The bar for the merge: every moved 2-7 row traced (done for A/D), B+C
   narrowed and re-measured, the list at 69/100 or better, zero BAR PASS -> FAIL on 2-1/2-2/2-4/2-5/1-4 vs main."
   (Session 12's probes, sent to the lead after this ruling was written: the gate asked first on the last log is NONE: no gateSees /
   tablePick / startJump; the stand is the old ride block :3623, bank/next/reach/raceLegal all false, confirmed on middle E 11; the refusal
   one log earlier is c2's padPause flick :3400, and c3b's tablePick :3411 hopped him onto the last log. Confirm on expert N 29 first.)
2. B+C (item 1's ruling): (a) confirm the ride block :3623 on expert N 29 (on #37 t 57.1-63.2): the temporary log line after
   `const raceLegal` (PROBE_RIDE window) in the UNFROZEN main checkout at c25, run tools/trace-n.mts.txt, then `git checkout` it (0 diffs);
   frozen trees are never edited. (b) The narrowing: after one hand-back to the bank he boarded from, he does not re-board into the same
   loop; he takes a way on that lands (the judged press, the run-up, or the next log the gate judges). (c) A toy each way: RED on c25 middle
   E 11 / expert N 29 (a hand-back round ending in a rescue), GREEN on the fix; and the c2m gains (child N 5, middle N 13) still cross.
   (d) Re-measure as ruled: 2-7 x40 BAR rows + the 2-1/2-2/2-4 wide sample + the 10 known flips; the merge bar: the list 69/100 or better,
   0 BAR PASS->FAIL on 2-1/2-2/2-4/2-5/1-4 vs main (any code commit reruns them, the brief's rule).
3. Then the brief's list in order: pacerLay 22/23 laid toys; hopJudged; the c23/c24 toys; the plants; riverRide + firsttimer; the CI tool
   line at 0 fail; tierBots 9/9; timecheck + roadmapcheck; MERGE only on the lead's word.

Lessons applied: D134 (pushed + ls-remote before the hand-over), D128 (times from `date`), D119 (commit message from a file), D115 (a frozen
tree per hash), rule 28 (every moved row bisected, two traces per cluster), D135 (no red carried unnamed: A and D named for the lead).

# ENG-PLANT-m (ENG-PLANT-c session 11, started 9:15 AM ET 11-25 by the session's first stamp): c25 built, pushed and proven on its rows; hand-over (LANES 3b box)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. **Code head: c25 = 6fb42bd1d (the fix) + 6a64aa41e (its toy, test
only) on release-0.10.3-wip-plant-c** (pushed, ls-remote confirmed). Frozen worktrees this session: fz-c25 (6a64aa41e), fz-c24 (2a2c44786).
Data: data/m/. Tools: tools/*-m.

## c25 (the lead's GO): the run-up's judge counts the thumb travel still to run
- `steerFrom(dir, t)` (firsttimer.ts, by runUpCatches) = the latest of now, `travelUntil` (a turn already made), the turn this want makes
  from `lastSteer` the other way (`t + (2 * 16 + driftPx) / thumbSpeed`, as thumbify arms it; not for a tap bot), and `driftUntil` (a slip
  already drawn).
- `runPress`: the ground frames before it brake (groundStep dir 0); the hop's first `free` frames fly unsteered (hopCatches / hopCatchAt /
  hopFrame take a new `free` argument, default 0: every other caller unchanged). `runUpCatches`: the run frames before it brake.
- 'Where no run-up catches for his own press, he does not start one': the start branch already needs runUpCatches true from a stand and
  on the run; with the travel counted, a run-up that cannot catch for his press is not started.

## Proof (fz-c25 6a64aa41e; c24 2a2c44786)
| check | c24 | c25 |
|---|---|---|
| toy, firsttimer.test 'on the run it was found on, 2-4 kid Easy seed 35' (no jump off a drifting log comes down in the water before he stands again) | **RED** (1 of 7) | **GREEN** (0 of 6) |
| 2-4 kid Easy 35 (castBots row) | FAIL, rescued 1 (10,860) | **PASS**, rescues 0 |
| the run-up's own rows: 2-4 adult N 6/8/24/32, child E 23, child N 39, child N 8 | PASS (lives 0/2/2/0, 0, 2, 2) | **PASS 7/7** (lives 0/1/1/0, 0, 2, 1) |
| the 10 known flips: + 2-1 child N 11, 2-2 adult N 4/24, 2-4 child E 11; and 2-1 child E 2 | PASS | **PASS 10/10 + E 2** |
| the 11 c4-pass kid rows | 11 FAIL | 10 FAIL at the SAME places (R-165.413, the lead's ruling 1), **E 35 PASS** |
| race margins (tools/margins.mts.txt, data/m/margins-c25.txt) | 10/10 WON, post N 5 -0.10 | **identical, 10/10 WON, post N 5 -0.10: no flip** |
Table: data/m/set1-c25-table.txt (c25 / c24 / main per row). Traces (tools/toyev-m.mts.txt, FT_TRACE): c24 E 35 off log #48 at t 47.60,
vx 75 (the carry alone), set down 48.17; c25 E 35 off #48 at t 48.77, x 10,633, vx 248 (the steer arrived), no set-down (data/m/c25-e35-trace.txt).
- The toy's first cut (any lift off a log, a set-down within 2.5 s) fired on c25 too: a log's bob read as a take-off (t 74.50), then a good
  hop (74.97, landed 16,864) and a walk-off at 17,067: R-165.413's 16,777-17,149 cluster, not a jump into water. Tightened to a take-off
  at a jump's launch speed (vy < -0.8 PHYS.jumpV) and a set-down before he stands again; RED/GREEN above on the tightened toy.
- 2-4 kid E 12 looked moved (castBots' first 'stuck' note: on a vine at 7,062): its whole stuck list is IDENTICAL on c24 and c25; the
  rescue on both is the set-down at 21,866 (R-165.413).

## 2-4 wide sample (seeds 1-40, 5 bots, both settings) on fz-c25
Rows: data/m/c25-2-4-w.jsonl (360, castBots --json row by row, tools/wide-m.sh.txt); flips: data/m/c25-flips-2-4-2-7.txt (tools/flips.py.txt).
| 2-4 | adult E/N | child E/N | middle E/N | expert N | kid E/N |
|---|---|---|---|---|---|
| main cdffdc627 (data/c) | 40/16 | 40/40 | 40/40 | 40 | 30/0 |
| c24 (data/j/c24-2-4-w) | 40/40 | 40/40 | 40/40 | 40 | 29/40 |
| **c25** | **40/40** | **40/40** | **40/40** | **40** | **31/39** |
- **BAR (adult/child/middle/expert) PASS->FAIL: 0 vs c24, 0 vs main.** vs c24: differ 85, fail->pass kid E 32, E 35; PASS->FAIL kid N 26
  (main fails it too: rescues 3). vs main: PASS->FAIL 7, all kid Easy (2, 12, 13, 18, 19, 20, 40), every one in the 31 traced to
  R-165.413 (the lead's ruling 1); fail->pass 71.
- **kid N 26 traced (one run; data/m/n26-*, the probe tools/n26probe-m.diff.txt):** both trees identical to t 84.37. On log #72 (x
  16,631) he is running LEFT (vx -268, lastSteer -1) with liana #? to the RIGHT (dir +1). c24 at t 84.40 starts a run-up right: the turn
  arms 0.188 s of thumb travel, his steer drops (pad {} 84.40-84.53), the judge presses at 84.57 'held from now' with the travel still
  running (right arrives 84.60): E 35's shape, and on THIS draw the hop still caught (84.93, swinging). c25 counts that travel (steerFrom
  t + 0.188; runUpCatches from a stand false at all three lags) and starts no run-up (the ruled 'if no run-up catches for his press, he
  does not start one'); he runs on left to 84.50, stops at 16,606, stands on #72 and is carried: 'no jump, ground 16,704 -> LIFE LOST'
  (85.67), then an untimed hop (96.30) and a stand (104.97) at the same place: the third set-down, the rescue. The place is main's
  (main: set down 3 times at 16,866) and the 31's 16,777-17,149 cluster. For the lead: c25 refuses a marginal run-up that c24's luckier
  draw made; what drowns him after is the stand on a carried log (not c25's piece). Rule 28 asks two runs per cause: no second row of it
  in the 360.

## 2-7 on c25 (seeds 1-100; the list as castBots rolls it; data/m/c25-2-7-1-100.jsonl)
| 2-7 c25 | adult E/N | child E/N | middle E/N | expert N | kid E/N | seeds with EVERY BAR row passing |
|---|---|---|---|---|---|---|
| x40 (seeds 1-40) | 40/38 | 38/33 | 38/38 | 37 | 24/8 | **24/40 (bar 29/40: BELOW)** |
| the list (1-100) | 100/97 | 90/89 | 98/95 | 96 | 49/21 | **69/100 (bar 69/100: AT the bar)** |
main's data/c/main-2-7 rows are an older 2-7 (adult E 11/40): not comparable for 2-7. The 18 failing BAR rows on 1-40: every one a
rescue (r 1-4), all reach the shrine: child N 9, 10, 20, 34, 36, 38, 40; child E 24, 30; adult N 11, 24; middle E 7, 11; middle N 15, 32;
expert N 18, 29, 35 (places 9,101-14,183 'water ahead' / 'set down here 8 times'; child N 34 at 2,528). 
**c24 2a2c44786 on the same 2-7 BAR rows (seeds 1-40, 280 of 280 rows run; data/m/c24-2-7-x40.jsonl): 24/40 seeds with every BAR row passing.** c24 -> c25 on the rows both ran: PASS->FAIL 0 []; fail->pass 0 [].

## 1-4 and 2-5 on c25 (seeds 1-40, 5 bots, both settings; data/m/c25-1-4.jsonl, c25-2-5.jsonl; flips: data/m/c25-flips-vs-main.txt)
| stage | rows | differ vs main | PASS->FAIL (BAR) | fail->pass | c25 pass counts |
|---|---|---|---|---|---|
| 1-4 | 360 | 225 | **0** (0) | 128 | every bot and setting 40/40 |
| 2-5 | 360 | 261 | **0** (0) | 3 (kid E 14, 28, 35: as c24) | BAR 40/40 everywhere; kid E 3/40, kid N 0/40 (main 0/0) |


## EXACT NEXT STEP (session 12)
0. Setup: `npm ci --no-audit --no-fund --legacy-peer-deps`; `git fetch --unshallow origin` (background); worktrees (node_modules symlinked):
   fz-c25 at the code head below, fz-main cdffdc627. Tools: tools/wide-m.sh.txt (castBots --json, ONE ROW PER LINE as each lands: it
   survives a hand-over; castBots --rows writes only at the end), set1-m.sh.txt, cmp1-m.py.txt, flips.py.txt, margins.mts.txt.
   Rows run four lanes (two heavy runs of two lanes), seeds split in quarters: about 1-2 s a row.
1. **The lead's call first (sent with the hand-over): 2-7 x40 on c25 is 24/40 seeds with every BAR row passing (bar 29/40); the list
   1-100 is 69/100 (at the bar).** c24 on the same rows: 24/40 (280 of 280 rows; c24 -> c25 BAR PASS->FAIL 0, fail->pass 0): the x40 shortfall is NOT c25's: c24 has the same 24/40, row for row. Do not merge c25 under the x40 bar without the lead's word.
2. Ruling 4's rows on c25's code head are DONE this session (2-4 wide, 2-7 1-100, 1-4, 2-5; tables above; c24's 2-7 BAR x40 for
   the comparison). Rerun only if a later commit touches code (item 4's test-only check).
3. Re-plant pacerLay 22 (:254 boardLog, home middle Easy 1) and 23 (:280 raceSure) RED halves as explicit laid toys in
   tools/inspect/firsttimer.test.ts (af127d21e's pattern; the fromTakeoff toy at firsttimer.test.ts:217; boardLog needs a full RiverZone
   for floatAt, ENG-27/boardlog-probe-27j.ts.txt); GREEN halves stay in pacerLay at the SAME bars; pacerLay 23/23 on the head.
4. hopJudged; toys for c23's and c24's rules (RED on c22 52bcce623 / c23 ccca3d305 trees, GREEN on the head); the plants; riverRide +
   firsttimer tests; the CI tool line (gates.yml, find by content) at 0 fail; tierBots 9/9; timecheck + roadmapcheck; MERGE into
   release-0.10.3 (no force), ls-remote, hash + full table to the lead. Every commit after 6a64aa41e must be test-only
   (`git diff --stat 6a64aa41e HEAD -- . ':!*.test.ts'` empty) or the rows above rerun on the new head.

Lessons applied: D134 (pushed + ls-remote before the hand-over, hash in it), D128 (times from `date`), D119 (the commit message from a
file, no heredoc in a commit chain), D115 (a frozen worktree per hash; the toy copied into fz-c24 for its RED and restored by checkout
before anything else ran there), rule 28 (E 35 traced on both trees; E 12's apparent move checked and found identical), D121 (the toy
end to end where the player feels it), D135 (no red carried unnamed: the 10 kid rows still failing are R-165.413's, ruled by the lead).
A rows run that could not finish in the session would have been lost (castBots --rows writes at the end): restarted row by row.

# ENG-PLANT-l (ENG-PLANT-c session 10, started 8:56 AM ET 11-25 by `date`): rulings 1 and 3 measured; 2-5 rows clean; hand-over (LANES 3b box)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Code head UNCHANGED: **c24 2a2c44786** (nothing pushed to
release-0.10.3-wip-plant-c this session). Frozen worktrees: fz-c24 (2a2c44786), fz-c4 (6b5f43da0), fz-base (dfe631913 = release-0.10.3),
fz-main (cdffdc627 = main; it reproduces data/c/main-2-1 kid Normal 2 exactly: rescues 0, lives 3). Data: data/l/. Tools: tools/*-l / new .txt below.

## Ruling 1: the kid's 31 PASS->FAIL (rule 28: clustered by place and cause, every one traced, not only two)
Tool: tools/kidfall.mts.txt (one line per set-down: the frame, where he fell, the platform he left, JUMP or walk-off, his vx, the hop's
judge from HOP_TRACE); tools/kidclass.py.txt picks each rescue's three set-downs. All 31 rows traced on c24 (data/l/kf24/) and on main
(data/l/kfmain/: rescues 0 on every one, as data/c says); on c4 6b5f43da0 (the tree BEFORE c5..c24's pieces, data/l/kfc4/) and the base.
Every one of the 31 is a rescue after 'set down here 3 times' at one river; every set-down is a fall into the water.
**WHAT TOOK HIM, every cluster: he ran off a log's (or a moving platform's) far end at his full run (vx 268-285, his held direction),
or (4 of ~100 set-downs) an untimed jump from near a stand (vx 75-87) into the gap. That is R-165.413's family exactly ('running and
jumping on a held direction: untimed jumps into the gaps between logs and walking off a log's far end').** No hop site is new in
c5..c24 (the judge sites in firsttimer.ts are identical on c4 and c24: bankUp 2, boardHop, edgeStand, edgeWait 2, padPause 2, race 4,
stepBack, upstream 4); no fall is a stand, a pull-back turn (vx < 0) or a run-up jump (those leave at vx 0, negative, or a judged run).
| cluster (stage, place) | rows | traced (seed: frame, x, what took him) |
|---|---|---|
| 2-1 R1 (x 8,800-9,040) | 2 (rescues on c4: N 19:0 N 27:3) | N 19: f1157, x 8817, walk-off off drift:1#42[8610..8780] at vx 268; N 27: f1196, x 8932, walk-off off drift:1#44[8727..8897] at vx 268 |
| 2-1 R2 (14,740-15,190) | 4 (rescues on c4: N 30:1 E 9:1 E 21:1 E 36:2) | N 30: f1942, x 15043, walk-off off drift:1#68[14838..14998] at vx 268; E 9: f2207, x 15193, walk-off off drift:1#67[14956..15146] at vx 285 |
| 2-1 R3 (19,590-20,330) | 4 (rescues on c4: N 11:2 N 24:2 N 19:0 E 36:2) | N 11: f2760, x 19703, walk-off off drift:-1#88[19511..19661] at vx 285; N 24: f3418, x 19780, walk-off off drift:-1#85[19583..19733] at vx 285 |
| 2-1 back river (24,750-26,265) | 13 (rescues on c4: N 2:1 E 22:1 N 8:1 N 12:1 N 24:2 N 34:2 E 4:1 E 30:2 E 32:1 N 3:2 N 19:0 N 21:0 N 35:1) | N 2: f3405, x 25817, walk-off off drift:-1#113[25459..25609] at vx 268; E 22: f3609, x 26269, walk-off off drift:-1#114[26064..26234] at vx 285 |
| 2-2 14,275 | 1 (rescues on c4: E 37:0) | E 37: f2360, x 14284, walk-off off moving#55[14088..14258] at vx 285 |
| 2-2 21,178 | 1 (rescues on c4: N 33:0) | N 33: f3288, x 21190, walk-off off drift:1#81[20946..21146] at vx 285 |
| 2-2 late (28,929-29,620) | 2 (rescues on c4: N 10:1 N 3:0) | N 10: f4472, x 28802, walk-off off moving#113[28630..28760] at vx 285; N 3: f4638, x 28674, walk-off off moving#113[28459..28639] at vx 285 |
| 2-4 10,860 | 1 (rescues on c4: E 35:0) | E 35: f1445, x 10650, JUMP off drift:1#48[10419..10579] at vx 75 |
| 2-4 16,777-17,149 | 4 (rescues on c4: E 18:1 E 20:0 E 2:0 E 19:0) | E 18: f2575, x 17142, walk-off off drift:1#76[16945..17095] at vx 285; E 20: f2651, x 16730, walk-off off drift:1#79[16533..16683] at vx 285 |
| 2-4 21,866 | 1 (rescues on c4: E 12:0) | E 12: f4154, x 21308, walk-off off drift:1#105[21117..21267] at vx 268 |
| 2-4 23,944 | 1 (rescues on c4: E 13:0) | E 13: f3343, x 23101, walk-off off drift:1#109[22896..23056] at vx 285 |
| 2-4 25,060 | 1 (rescues on c4: E 40:1) | E 40: f4836, x 25025, walk-off off drift:1#117[24824..24984] at vx 268 |
(The third column of the second: c4 6b5f43da0, BEFORE c5..c24. **20 of the 31 already fail on c4** (rescued at the same river): their move
from main is not c5..c24's. **11 pass on c4 and fail on c24**: 2-1 N 19, N 21; 2-2 E 37, N 3, N 33; 2-4 E 2, E 12, E 13, E 19, E 20, E 35.)

**A NEW FAULT, for the lead before the merge (2-4 kid Easy 35, c4 passes it):** on c24 he stands on log #48 (drift +1, 10,419-10,579),
at f1424 (t 47.50, x 10,537) he steps (vx 86.7), and at f1428 (t 47.60, x 10,548, 31 px from the log's front) JUMPS from the stand (vx 75,
the log's carry) with NO HOP_TRACE row (the run-up's judge is not traced), and comes down in the water at x 10,650 (f1445, t 48.17): the
first of the three set-downs. **With SKILLS.runUp off on the same tree the path is identical to f1423 and he keeps standing there**
(data/l/e35-on.txt / e35-off.txt): the run-up (c5..c24's piece, SKILLS.runUp, runPress) sent a jump that does not land. c24's own fix
(runUpHold: the jump held at least as judged) is in this tree, so this is not the short press of 2-4 child N 8; the judged landing itself
was wrong for the kid (FT_KID). The other 10 c4-pass rows: data/l/firstsplit.txt (each new skill off in turn, the first frame the path
parts and whether c24 falls within 2 s of it): see Result L1b below if filled.

### Result L1b: where c5..c24's run-up first moves the 11 c4-pass rows (data/l/firstsplit.txt; floatSure and handed off are wider than c5..c24: both predate c4)
SKILLS.runUp is the one c5..c24 piece with a switch. **runUp never acts (path identical, runUp off) on 2-1 N 19, N 21, 2-2 E 37, N 3, N 33.**
It acts on 2-4 E 35 (the fault above: its own jump lands in the water within 0.7 s), and on 2-4 E 20 (f2186, x 16,219, log #77) and E 2
(f2091, x 16,086, log #77): a run-up started on log #77 with no fall within 2 s; their rescues come 500-900 px and 15 s later, each a
full-run walk-off off a log's far end (E 20: #79 at x 16,730). E 19 (f3408, #103), E 12 (f3326, #76), E 13 (f3005, #105): a run-up start, no fall within 2 s (filled). So: ONE new fault
(2-4 kid Easy 35, the run-up's own jump); every other traced fall is R-165.413's walk-off or untimed jump.
The run-up's judge (firsttimer.ts:2366-2391): runUpCatches / runPress judge a run along the log then a jump that CATCHES a liana/vine
(canGrabSwing, v) at all three lags; for the kid at E 35 the catch did not happen. Not yet traced: which liana it judged, the hold, and
why the kid's catch failed (the probe for session 11: log runPress's v, hold and lags at t 47.50, then the frames to f1445).

**E 35 probed (tools/e35probe.mts.txt, data/l/e35probe.txt): the cause.** At t 47.567 the run-up judged, FROM A STAND (x0 10,542.6, vx0 0,
s0 0, carry 75), a jump catching swing #4 at x 10,690: runPress true at all three lags (0.1225, 0.09, 0.0575), hold 0.160. He jumped
at t 47.60 with vx 75, the log's carry ALONE, and stayed at 75 through t 47.733 (5 frames). Only then did his steer arrive (188 at 47.80,
245 at 47.87). He peaked at y 890 near x 10,585 and came down at x 10,650, in the water short of #4. His one step at t 47.50 (vx 86.7) had
been let go (vx 0 at 47.533-47.567). The judge assumes 'the steer held from now, no lag on a steer from a stand' (firsttimer.ts:2363);
the kid's steer had dropped and came back about 0.2 s after the take-off. Fix where the cause is: the judged run-up's jump keeps its
steer held from the judge's frame (as runUpHold keeps the jump's hold), or the judge reads the steer he actually has. RED/GREEN on this row.

**E 35, the thumb (tools/e35thumb.mts.txt, data/l/e35thumb.txt): THE CAUSE, exactly.** t 47.467: the run-up starts (wants right, runUp
#48). t 47.500: the run-up gives up and pulls the thumb back (wants LEFT: 'inside his run-out of the front he pulls the thumb back',
firsttimer.ts:2374-2377); the turn arms the thumb's travel (travelUntil 47.680). t 47.533: the run-up restarts (wants right, runUp #48);
the second turn pushes travelUntil to 47.711, so the steer is dropped (out {}). t 47.567: the run-up's judge (runPress: true at all 3 lags,
'the steer held from now') sends the jump. The thumb still travelling drops his steer to t 47.711, and he flies on the carry alone. A
run / pull-back / run flicker (the one the comment at :2363 names for candidate 15) whose two turns' thumb travel the judge never reads.
Fix where the cause is (for the lead's ruling): the run-up's judge counts the thumb's travel still to run (steer from max(t + lag,
travelUntil, driftUntil)), or presses no run-up jump while the thumb travels. No other row in the 31 shows this act.

## Ruling 3: row 8, and the careful middle's MARGIN on every race row (his time minus the boat's; below 0 he wins; data/l/margins-*.txt)
| race row | c24 2a2c44786 | base dfe631913 |
|---|---|---|
| home normal 1 | margin -15.61 ( race lives lost 0 ) WON | margin -29.61 ( race lives lost 1 ) WON  |
| home normal 2 | margin -19.54 ( race lives lost 0 ) WON | margin -28.34 ( race lives lost 0 ) WON  |
| home normal 3 | margin -6.86 ( race lives lost 1 ) WON | margin 0.04 ( race lives lost 3 ) LOST  |
| post normal 4 | margin -12.30 ( race lives lost 0 ) WON | margin -4.80 ( race lives lost 2 ) WON  |
| post normal 5 | margin -0.10 ( race lives lost 0 ) WON | margin -29.80 ( race lives lost 1 ) WON  |
| home easy 1 | margin -25.67 ( race lives lost 0 ) WON | margin -21.97 ( race lives lost 0 ) WON  |
| home easy 2 | margin -20.52 ( race lives lost 0 ) WON | margin -23.22 ( race lives lost 0 ) WON  |
| home easy 3 | margin -10.57 ( race lives lost 0 ) WON | margin -21.57 ( race lives lost 0 ) WON  |
| post easy 4 | margin -20.73 ( race lives lost 0 ) WON | margin -15.83 ( race lives lost 1 ) WON  |
| post easy 5 | margin -29.70 ( race lives lost 1 ) WON | margin -16.00 ( race lives lost 1 ) WON  |
**Why row 8 (home Normal 3) passes on c24, one line:** not one rule: his path first parts from the base's at f472 (t 15.77, x 14,579, on
log #13, data/l/row8-divergence.txt), where floatSure's judged pad-pause flick (HOP_TRACE 'padPause', q 12, hold 0.035) hops him to log
#12 while the base walks on; from there he reaches the race 24 s sooner and loses 1 race life (x 2,429) instead of 3 (x 3,174, 3,102,
1,709): 106.8 s vs the boat's 113.66 (base 113.7, lost by 0.04). With each new skill off singly c24 still wins (floatSure -21.26,
handed -14.46, runUp -6.86, vineOverTail -6.86; data/l/row8-skills.txt): the win rides on the path, not on a piece.
**Watch: post Normal 5 (pacerLay row 21) passes on c24 by 0.10 s** (127.6 vs 127.7; the base won it by 29.8). Neither the boat nor the
rule changed (the lead decides the calibration).

## Ruling 4 (part): the full rows vs main (data/l/c24-flips-2-5.txt; tools/flips.py.txt; BAR = adult/child/middle/expert)
| stage | rows | differ | PASS->FAIL (BAR) | fail->pass | note |
|---|---|---|---|---|---|
| 2-5 | 360 | 261 | **0** (0) | 3 (kid E 14, 28, 35) | clean |
| 2-7 (seeds 1-100: x40 = 1-40, the list = 1-100), 1-4 | running on fz-c24 (tools/rows-l.sh.txt, par 2) when this was written | | | | |

## EXACT NEXT STEP (session 11)
**THE LEAD'S RULINGS (word for word, received at the end of session 10):**
> (1) 2-4 kid Easy 35 is a REAL fault from c24's run-up, not R-165.413: FIX it at the cause: trace the run-up judge (which liana it
> aimed at, why the kid's catch fails), then make the run-up judge the kid's OWN press (his lag and spread on the run press and the jump
> press); if no run-up catches for his press, he does not start one. Toy RED on c24 (2-4 kid E 35), GREEN on the fix; re-run the 11
> c4-pass kid rows and the known flips + the BAR rows of the wide sample that the run-up touches. The other kid rows traced to
> R-165.413 are accepted as named. (2) The race margins: accepted as measured; pacerLay passes; I make NO calibration change before
> release 4 (2-7's race is what Matt has played). post Normal 5 at -0.10 s is a WATCH item I file for a 2-7 race review; tell me if any
> later change flips it. (3) Then as ruled: re-plant 22/23, 2-7 (x40 29/40 or better, the list 69/100 or better) and 1-4 rows vs main,
> hopJudged, the toys, the plants, riverRide + firsttimer, the CI line, tierBots, merge. No clock times.

> GO c25 as proposed: the run-up's judge counts the thumb travel still to run (the steer starts at the latest of the press lag, the
> travel and any slip), so the judged hop is the hop flown (rule 28's clause). Proof as you list: the toy RED/GREEN, E35 passing, the
> run-up's own rows, the 10 known flips, a 2-4 wide sample; then ruling 4 on c25's exact head and the merge. Write this GO into the
> EXACT NEXT STEP, push, ls-remote-confirm, send me the hash, and end: session 11 starts from it. No clock times.

0. Setup: `npm ci --no-audit --no-fund --legacy-peer-deps`; `git fetch --unshallow origin` (background); worktrees (node_modules
   symlinked): fz-c24 2a2c44786, fz-c4 6b5f43da0, fz-main cdffdc627. Tools: tools/kidfall.mts.txt (6th arg: skills off), kidclass.py.txt,
   firstsplit.py.txt, trace.mts.txt, e35probe.mts.txt, e35thumb.mts.txt, margins.mts.txt, row8*.mts.txt, rows-l.sh.txt; single rows:
   data/j/row.sh.txt. Code head: **c24 2a2c44786** (release-0.10.3-wip-plant-c).
1. **c25 (the GO): the run-up's judge counts the thumb travel still to run.** In runUpCatches / runPress (firsttimer.ts:2366-2441) the
   steer starts at max(t + lag, this.travelUntil, this.driftUntil), not at t + lag ('the steer held from now', :2363), on the run press
   and the jump press; the judged hop is the hop flown. Where no run-up catches for his own press, he does not start one (ruling 1).
   The cause it fixes (data/l/e35thumb.txt): 2-4 kid E 35, log #48, run / pull-back / run flicker, travelUntil 47.711, jump pressed at
   47.567, flown on the carry alone, short of swing #4 (x 10,690) in the water at 10,650. NOTE: data/l/c25-runUpTravel.diff.txt is a
   DIFFERENT variant I tried before the GO (no run-up press while the thumb travels; E 35 passes on it, rescues 0); its 13-row check was
   still running at the hand-over. It is NOT the ruled fix: build the ruled one (the judge counts the travel); use the variant only as
   a comparison if the ruled one fails a row.
2. Proof on c25's exact head (frozen worktree): a toy RED on c24 / GREEN on c25 (the travel still to run at the judge's frame: a stand
   on a log, a swing ahead, travelUntil past t + lag: the judge refuses or times the press so the flown hop catches); 2-4 kid E 35
   PASS; the 11 c4-pass kid rows (2-1 N 19, N 21; 2-2 E 37, N 3, N 33; 2-4 E 2, E 12, E 13, E 19, E 20, E 35); the run-up's own rows
   (2-4 adult N 6/8/24/32, child E 23, child N 39, child N 8) and the 10 known flips (+ 2-1 child E 2); a 2-4 wide sample (seeds 1-40,
   5 bots, both settings) vs data/j/c24-2-4-w.jsonl and data/c/main-2-4.jsonl: 0 BAR PASS->FAIL. post Normal 5's margin (-0.10 s on
   c24; tools/margins.mts.txt): tell the lead if c25 flips it.
3. Ruling 2: re-plant pacerLay 22 (boardLog, home middle Easy 1: the lip-log run-off; a full RiverZone for floatAt, af127d21e's note)
   and 23 (raceSure: a racing hop off a log toward a bank 28 px up within 80 px of its end, the press's own short hold 19 px short) as
   explicit toys in tools/inspect/firsttimer.test.ts the way af127d21e did fromTakeoff: RED with the skill off, GREEN on, the SAME
   bars; pacerLay 23/23.
4. Ruling 4 on c25's exact head: 2-5 (c24's was clean: data/l/c24-flips-2-5.txt), 2-7 (seeds 1-100: x40 = the BAR seeds 1-40 all
   passing >= 29/40; the list 1-100 >= 69/100) and 1-4 rows vs main (tools/rows-l.sh.txt; flips.py.txt reads <dir>/<st>.jsonl); hopJudged,
   the toys for c23's and c24's rules (RED/GREEN), riverRide + firsttimer tests, the CI tool line (gates.yml, find by content) at 0 fail,
   tierBots 9/9, timecheck + roadmapcheck; MERGE into release-0.10.3 (no force), ls-remote, hash + full table to the lead. REPORT BY
   11:00 AM ET; HARD STOP 12:30 PM ET. At most two heavy runs at a time, each once on the exact head.

Lessons applied: D134 (pushed + ls-remote before the hand-over, hash in it), D128 (times from `date`), D115 (a frozen worktree per hash,
no edit under a live run: c25's variant built in its own fz-c25), D135 (c4's own result per row named), D119 (no heredoc in a commit
chain), rule 28 (every moved kid row traced; the one new fault traced to its frame). Not run this session: the full unit suite (not in
the lead's ruling-4 list; Integration's FULL SET runs it), named so.

# ENG-PLANT-j (ENG-PLANT-c session 8, started 6:47 PM ET 11-24 by `date`; this section written 7:06 PM ET 11-24 by `date`): hand-over (LANES 3b box)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Ruling 1 done for both of c22's BAR flips: each isolated to one
piece, traced to its cause, narrowed, and the narrowing committed (c23, c24; pushed, ls-remote confirmed). One worktree per hash or
probe (scratchpad fz-*); single rows with data/j/row.sh.txt (castBots, --par 1). Rows and trace excerpts: data/j/.

## Result 1: isolation (one row per cell; c19 9035c553d, c22 52bcce623, c4 6b5f43da0)
| tree | 2-1 child Easy 2 | 2-4 child Normal 8 |
|---|---|---|
| main (data/c) | PASS | PASS |
| c4 | PASS (session 7) | **PASS** |
| c19 | PASS (session 7) | **FAIL** (10,097, same as c22) |
| vb = c19 + c22's pull-back only (c22 minus c11's line) | **FAIL** (26,069, same as c22) | FAIL |
| vc = c19 + c11's padRead stop only | PASS | FAIL |
| d1 = c19 with SKILLS.runUp off | | **PASS** |
| d2 = c19 with the sinker refusal off | | FAIL |
| d3 = c19 with rideCase returning false (ride off) | | **PASS** |

## Result 2: the causes (traces: data/j/tr-*.txt; probe: data/j/p-probe.diff.txt)
- **2-1 child Easy 2 = the pull-back.** He lands on small log #43 at x 8,565 (t 71.97) at a full run; c19 pauses there (the pad pause,
  width < 220, with its draw), then hops at t 72.40. On vb the pull-back fires on that landing (front inside runOut), its turn press
  holds through the 0.1 s landing window, the pad pause is never set (and its draw never taken), and his path splits at x 8,600; he
  drowns at the back river later (26,069). The pull-back was not needed there: he stops on #43 anyway.
- **2-4 child Normal 8 = the run-up's jump, pressed shorter than it was judged.** The run-up (d1 split: x 7,092, t 79.47) takes him a
  different way to log #46 (x 10,200, t 113.23); the rideCase stand holds him on it (d3 runs on and passes); at x 10,823 (t 120.70)
  the run-up judges a jump for liana #4 (x 10,977, foot y 859) with runPress at who.hold[0] = **0.160 s** (all three lags catch), and
  decide sends it; startJump's flickHold drew **0.093 s**: he peaked at y 895, under the liana's foot, and fell in at x 10,966 (t
  121.20), then stood on solid #42 at 10,097 'water ahead' to the rescue. HOP_TRACE has no row for it (the run-up's judge is not traced).

## Result 3: the narrowings (each on the 4 rows its piece is kept for + the BAR row)
| variant | 2-1 child E 2 | 2-1 child N 11 | 2-2 adult N 4 | 2-2 adult N 24 | 2-4 child E 11 |
|---|---|---|---|---|---|
| n1: pull back off rideCase only within his let-go at his speed NOW (data/j/n1.diff.txt) | PASS | PASS | PASS | PASS | PASS |
| **n2: pull back off rideCase only where he would walk on (no pad pause)** | PASS | PASS | PASS | PASS | PASS |
n2 chosen: it is the traced cause (n1 passes too, but its bound is the speed-now the runOut comment already rejected for c6).
| variant | 2-4 child N 8 | 2-4 adult N 6 | N 8 | N 24 | N 32 | child E 23 | child N 39 |
|---|---|---|---|---|---|---|---|
| **q: the run-up's jump held at least as judged** (data/j/q-runUpHold.diff.txt) | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

## The candidates (release-0.10.3-wip-plant-c, tools/inspect/firsttimer.ts only)
- **c23 = ccca3d305** = c22 + n2: off rideCase the landing pull-back comes only where he would walk on (`pullBack`, applied at
  `if (!this.padPause) return side(...)`); in rideCase unchanged. Exact head: known flips **10/10**, 2-1 child E 2 PASS, 2-4 child
  N 8 FAIL (its cause is c19's, above). data/j/c23-*.jsonl.
- **c24 = 2a2c44786** (HEAD) = c23 + q: `runUpHold` set where the judged run-up press is sent (beside pressJudged); startJump holds
  at least it (0.5 s window, reset on every startJump), as raceHop does for the race's hop. Exact head: known flips **10/10** (2-4 adult N 6/8/24/32, child E 23, child N 39, 2-1 child N 11, 2-2 adult N 4/24, 2-4 child E 11), 2-1 child
  E 2 PASS, **2-4 child N 8 PASS**. data/j/c24-*.jsonl. WIDE SAMPLE: started on c24's exact head (fz-c24), see Result 4 if filled.

## Result 4: WIDE SAMPLE on c24 2a2c44786 (exact head, fz-c24): **CLEAN: 0 BAR PASS->FAIL** (data/j/c24-<st>-w.jsonl)
Full width this time: seeds 1-40, all 5 bots, both settings = 360 rows per stage (session 7's c22 sample was 90 rows per stage).
Compare: tools/flips.py.txt vs data/c/main-<st>.jsonl; the whole table: data/j/c24-flips-vs-main.txt. BAR = adult/child/middle/expert.
| stage | differ | PASS->FAIL (BAR) | fail->pass (BAR) | kid PASS->FAIL | kid fail->pass |
|---|---|---|---|---|---|
| 2-1 | 176 | 19 (**0**) | 14 (**2**) | 19 | 12 |
| 2-2 | 311 | 4 (**0**) | 22 (**3**) | 4 | 19 |
| 2-4 | 296 | 8 (**0**) | 71 (**24**) | 8 | 47 |
Said plainly: the kid (out of the BAR, as the lead counted it from session 6) goes PASS->FAIL on 31 rows, mostly 'set down here 3
times' at 2-1's rivers (x 14,700-26,300), and fail->pass on 78; c22's 90-row sample had the same rate (2-1: 4 kid of 90). Not traced
row by row: the lead decides whether the kid's 31 need a trace before the merge.
c23 ccca3d305 on 2-1 (360 rows, data/j/c23-2-1-w.jsonl) is IDENTICAL to c24 (0 rows differ): c24's hold rule moves no 2-1 row;
every 2-1 move, the kid's 19 included, comes from c23 or earlier.

## Result 5: pacerLay on c24's exact head (data/j/pacerLay-c24.txt): 21/23; red **{22, 23}** only
22 (:254) RED half: 'without the skill the plant must lose (81.3 s against 108.37 s)'; 23 (:280) RED half: 'without the skill seed 2
falls short at x 10683'. Both are the stale plants of ruling 2 (stale since 24d6ba567 / a0ab91d33), not c24's. **Row 8 PASSES on c24**
(the base release-0.10.3 dfe631913 fails it by 0.04 s; c18 failed it too): ruling 3's margins still owed, and now also why it passes.

## EXACT NEXT STEP (session 9)
0. Setup: `npm ci --legacy-peer-deps`; one worktree per hash, node_modules symlinked; single rows: data/j/row.sh.txt. Base: **c24
   2a2c44786**. Main's rows: data/c/main-<st>.jsonl; compare with tools/flips.py.txt (BAR = adult/child/middle/expert, kid excluded).
1. DONE this session (Result 4: clean). Send the lead the kid's 31 PASS->FAIL for a ruling (trace them or not) with step 2's result.
2. DONE this session (Result 5): pacerLay on c24 red only {22, 23}; row 8 passes.
3. Ruling 2: RE-PLANT pacerLay 22 (:254, SKILLS.boardLog, home middle Easy 1; stale since 24d6ba567) and 23 (:280, SKILLS.raceSure,
   home N 2 + post N 5; stale since a0ab91d33) each at its SAME bar on its cause laid explicitly (as af127d21e re-planted fromTakeoff;
   R-165.432): RED with the skill off, GREEN on. Never loosen a bar (law 22).
4. Ruling 3: row 8 (PASSES on c24, Result 5; on the base the careful middle loses home Normal 3 by 0.04 s, 113.7 vs 113.66, under BUILD-26j's step-up rule, hunk 14 +
   stepUpAtLip, d6350d3e7 via b3195f31e; data/h/t8hunk.txt): trace where the 0.04 s goes and send the lead the careful middle's
   MARGIN (his time minus the boat's) on EVERY race row on c24. Change neither the boat nor the rule.
5. Only on a clean wide sample: hopJudged (`npx tsx --test tools/inspect/hopJudged.test.ts`), then the full rows (2-1, 2-2, 2-4, then
   2-5, 2-7 x40 29/40 and the list 69/100, 1-4; tools/rows.sh.txt), riverRide toys (a toy for each of c23's and c24's rules: the
   pull-back skipped on a small log he pauses on; the run-up's jump held as judged), the plants, the CI tool line, tierBots 9/9,
   merge into release-0.10.3 (no force). HARD STOP 9:30 PM ET; at most two heavy runs at a time, each once on the exact head.

Lessons applied: D134 (pushed + ls-remote before the hand-over, hashes here), D133 (one piece at a time, cheapest run first: 13 single
rows isolated both before any wide run), D115 (a worktree per hash and per probe, no edit under a live run), D119 (no heredoc in a
commit chain), D128 (times from `date`), D135 (c4's and c19's own results named per row, nothing carried as 'inherited'). No model name
in any commit (the first c23 commit carried one in its trailer; amended before the push).

