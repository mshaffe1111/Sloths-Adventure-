# ENG-THUMB: the kid-bot root fix (R-165.465) and release 5's rule-28 rows

## EXACT NEXT STEP (hand-over 3, box 3; written 2:13 PM ET 11/26 by `date`)
Branch t-eng-thumb-wip, head = the commit that adds this text. **Code = C6 39ee096b7 (C4a + step 2, the peek).** Tools: tools/*.txt as
before (copy out, strip `.txt`; ciline.sh's cmd = gates.yml:157's `- run:` line saved to a file and its path set in ciline.sh), plus
**tools/pp.py.txt** (on a PROBE copy: PADPROBE=1 prints a `PP` line for every pad hop padRead decides). Main's rows: box 1's (INT-R5's
d/rule28/rows-main/ on origin/release-0.10.3-wip-fixes). Rebuild frozen trees from the branch (D115).
**C6's five-bot rows vs main read so far (d/rows-c6all/, d/flips-main-vs-c6-fivebots.txt): 2-2 = 3 PASS -> FAIL, 2-1 = 1.** 2-4, 2-5,
1-4 were running at the hand-over: NOT read (re-run: rows.sh, bots kid,adult,child,middle,expert, about 2 min a stage). The CI line on
C6: NOT run.
1. **2-2's 3 PASS -> FAIL are tier bots, all PASS on C4a** (box 3 ran them on a C4a tree: child E 21 262.9 s 1 life, child E 37 280.6 s,
   middle N 7 202.4 s 2 lives), so step 2 moved them: **child E 21** (x 24,440 'set down here 8 times', 307.8 s), **child E 37** (x 27,943,
   set down 8), **middle N 7** (x 9,242, 'fell back down from here 8 times'). Child E 21 traced (d/frames-c6-2-2-childeasy21.txt,
   d/pp-c6-2-2-childeasy21.txt): **a reshuffle, not a pad hop**: C4a and C6 part at his FIRST pad hop (C6 decides at 25.83, toEdge 67, take-off
   2.4 px before #8's front; C4a hops at 26.63), and every draw after differs; at 257-264 s he is set down at (24,292, 575), runs right
   meaning right and walks off at about 24,420 (y 617) into the gap before #94 (24,459-24,879, NOT a pad: padRead returns null there, the
   plain edge's walk) with no jump, 8 times, then rescued. NEXT: tag.py on a probe copy, FT_FRAMES 257.3-258.1, the `why` line that
   walks him off that set-down floor with no press (the plain edge after a set-down: is the gap to #94 seen at all?), and the same for
   child E 37 (x 27,943) and middle N 7 (x 9,242): fix where each lives with a toy, or bring the lead the three why-lines (law 22: an
   honest life the old stream hid is a ruling, not a patch). The lead's stop stands: more than about 20 moved rows outside 2-2's pads
   -> the count and a sample to the lead first.
2. **2-1 = 1 PASS -> FAIL: middle N 17** (x 19,869 'an open drop ahead, water ahead': the SAME row and x as on C3 and C4, step 3's, not
   moved by step 2); fail -> pass 31. Step 3 (box 2's text below): fix with a toy, or STOP with the frames for the lead.
3. Then 2-4, 2-5, 1-4 five-bot rows vs main, the CI line on C6 (D141: on every candidate), and the final checks ONCE on the frozen
   head (box 1's list): rule 28 vs main (all five bots, 1-40, both settings, 5 stages, 0 PASS -> FAIL), 2-7 x40 (>= 29/40), pacerLay
   23/23, the 10 races, tierBots 9/9, tsc, the 4 bot test files.

## Step 2 (box 3: DONE on 2-2 for kid + adult, C6 39ee096b7; toy RED on C4a, GREEN on C6)
- **The fault (the lead's family, rule 28 'the hop judged is the hop flown'):** padRead judged a pad hop at FIXED lags 0.03 and 0.1 s
  at his speed then (`p.x + p.vx * lag`), while decide() then drew his own lag (gauss who.thumb; 0.167-0.267 s seen) and ran `go`
  through it; from a stand the judge flew a stood hop and the meanwhile ran him on (2-2 kid N 15 C5 probe, 42.43 on #40: stood at
  toEdge 11.2, judged from the stand, ran 30 px and off the front). The press on its way walked him off a pad's front.
- **Fix (firsttimer.ts):** `rng()` gains `fork()`, a copy of the stream from where it stands (its draws are the stream's next draws;
  drawing from it consumes NOTHING: the draw order is as ever, so a row moves only where the judge's answer changes). padRead peeks
  the lag decide() draws next (`gauss(this.r.fork(), who.thumb)`; the peek and decide's draw are on the same call, nothing drawn
  between: hopLandsOn and groundStep draw nothing) and flies the hop from where that lag takes him off: his run on through hopAim's
  frames as the engine runs it (`groundStep`, from a stand he speeds up; a thumb travel or slip already running steers nothing).
  **Where that run has him off the front before the press, the flight leaves the lip:** he stands while it comes (pending.still), the
  stand flown as flown (his late lift-off: the release thumbify draws next on that frame, peeked on the same fork; then the engine's
  brake), taken only when that stood hop lands or as the last frame he can still stop on the pad (`lead < 6 + one frame's run`, which
  replaces `toEdge < 6`); a run that overshoots otherwise waits a frame for the next peek.
- **Toy (hopJudged.test.ts, 'a pad hop is flown from the pad'):** 2-2 kid N 15 to t 170: no press padRead decided may come after he
  walked off that pad's front, and no set-down on the last pads (x 28,000-30,200). **C4a: RED, 15 presses** (101.20 off #75 ...
  158.53 off #116, the press due 158.597). **C6: GREEN.**
- **Narrowed by the rows (C5 -> C6):** C5 (b088c8ab4) stood at the lip at once for every run that overshot, whatever the stood hop:
  2-2 kid N 7, 27, 28 went PASS -> FAIL vs main (d/flips-main-vs-c5-2-2.txt). Traced (d/pp-c5-2-2-kidnormal-27-28-7.txt): kid N 27 at
  149.00 on #113 (x 28,382, vx 268, toEdge 66, lag 8 frames: the run 4 px past the front) stood and hopped from 28,399 short of #114
  (lands false), LIFE LOST; the same at 154.43 (#115), 157.70, 159.00, 162.30. C6 takes the stood hop only when it lands or at the
  last frame.
- **2-2, kid + adult, C6 vs main: 0 PASS -> FAIL, 30 fail -> pass** (d/flips-main-vs-c6-2-2.txt, d/rows-c6/2-2.jsonl). kid N 15 PASS
  (1 life, 0 rescues, 169.0 s; main 165.6), kid N 40 PASS (0 lives, 159.3 s), kid N 7 / 27 / 28 PASS. tsc GREEN on C6.
- **Same pattern, NOT changed (narrow, the lead's call):** the snap-stone branch of padRead (`flies1`, OFF-BEFORE-FOUR) judges its
  tap at a fixed 0.03 s, and the shiver clause flies from p.x with no lag; neither is in 2-2 kid N 15 / 40's family.

## Box 2's next step (hand-over 2, box 2; written 1:48 PM ET 11/26 by `date`; C4 rows filling in)
Branch t-eng-thumb-wip, head = the commit that adds this text. **Code = C4a d89050abb (C3 + step 1 only).** Step 2's candidate C4
(8a35b4238) FAILED rule 28 and is REVERTED (0d01b2ded). Tools: tools/*.txt as box 1 says (copy out, strip `.txt`; ciline.sh's cmd =
gates.yml:157's `- run:` line saved to a file and the path set in ciline.sh), plus **tools/tag.py.txt** (box 2's why-probe: on a PROBE
copy it tags every return in intend() with its line, and FT_FRAMES prints `why <line>` before `meant`). Main's rows: as box 1.
1. **C4a's rows (kid + adult) vs main, read so far: 2-2 = 2 PASS -> FAIL** (d/flips-main-vs-c4a-2-2.txt, d/rows-c4a/): kid N 15 (step 2,
   x 29,179) and **kid N 40 (NEW vs C3, x 28,807: he walks off pads #113 and #112's fronts meaning right, no press, into the water, 3
   times: 153.53, 158.30, 162.17; d/why-c4a-2-2-kidnormal40.txt): the step-2 family, met by a reshuffle (17 2-2 rows move vs C3).**
   2-1, 2-4, 2-5, 1-4 on C4a were still running in box 2's container at the hand-over: NOT read; re-run them (rows.sh, about 2.5 min a
   stage). 2-1 on C4 (step 1 + 2): 0 PASS -> FAIL vs main. The CI line is NOT yet run on C4a (C4's was stopped at 94 ok, 0 not ok).
2. **Step 2, 2-2 kid N 15 (pad #116), OPEN: the pad hop judge, where it lives.** C3 :3471 is `if (this.pending) return ...
   side(pending.dir)`: on #116 (x 29,009-29,139) no press point landed #111 (120 px on, 34 up), so at 158.43, 5.6 px from its front,
   padRead's last line pressed 'whatever' (`toEdge < 6`) with a drawn lag of 0.167 s, and the press on its way walked him off into the
   water 3 frames before it came, 3 times, rescued (d/why-c3-2-2-kidnormal15.txt). padRead judges the hop (`lands`) at FIXED lags 0.03
   and 0.1 s at a run from p.x + vx*lag, while decide() then draws his own lag (gauss who.thumb; 0.167-0.187 s seen): the hop judged is
   not the hop flown (rule 28's 11-21 amendment). **Tried and failed (C4): stand him at the lip when the press would come after he
   reached the front** (padLip, as at a snap stone's lip, ENG-25c): the stood hop comes down short (2-2 kid N 15 on C4: 2 lives, 151.03
   from #116 hold 0.15, 155.60 from #115 hold 0.18, d/k15-c4-lives.txt), and 2-2 kid Normal 3, 29, 30, 32, 40 went PASS -> FAIL vs
   main. Next: judge the hop with the lag decide() will draw (draw it once at the judge and hand it to decide, so no extra draw), and
   press where that flight leaves from the pad; toy RED on C4a / GREEN after; then 2-2's rows vs main FIRST (46-87 s): kid N 15 AND kid N 40 must PASS, the other 4 stages after.
3. **Step 3, 2-1 middle N 17 (unchanged on C4: life lost 111.47, 'an open drop ahead, water ahead' x 19,869, rescued).** Why-lines (C4's
   tag.py, FT_FRAMES 110.8-111.5, d/why-c4-2-1-middlenormal17.txt; C4 = C4a here, step 2 never ran on 2-1's ledges): on #85 (x 19,619,
   y 826) intend() C4 line 3516 (the landed-on-a-small-pad-or-ledge pause, `if (!this.padPause) return side(...)`) means right; the holdQ
   thumb shows {} 9 frames, then right at 111.17; he walks off #85 down onto log #90 (y 854) at 111.30, :3516 means right on the log at
   once and walks him off its front into the water at 111.47. The route's point is 19,724-19,771 y 854, along the log's line: find
   whether #90 had drifted on (the route assumes it there) and why a fresh landing on a drifting log is walked on with no ride read.
   Fix with a toy, or STOP with these frames for the lead (law 22).
4. Then the final checks ONCE on the frozen head (box 1's list): rule 28 vs main (all five bots, 1-40, both settings, 5 stages),
   2-7 x40 (>= 29/40), pacerLay 23/23, the 10 races, tierBots 9/9, tsc, the 4 bot test files, the CI line.

## Step 1 (box 2: DONE on C4a d89050abb; toy RED on C3, GREEN on C4a; tsc GREEN on C4, 13 s, C4a's code is C4's minus step 2)
- **2-1 kid E 25 (the vine retry loop): the way he keeps.** Traced on C3 with tag.py (d/why-c3-2-1-kideasy25.txt): the hop off the
  liana (19.50, x 4,017) flies at y 555-576 over the route's floor (y 814): step() follows him only within 160 px (y weighs 0.7), so the
  route's point stayed at 4,068 behind him; from 19.93 intend's dir was -1 and set `this.way = -1`, though the jump branch steered right
  (j.dir 1). Down on #13 at 20.27 (the way on 90 px right and 55 px down: 'below, close across, he keeps going the way he was', C3
  :2983) he kept that stale -1: meant LEFT (C3 :3504, :4057, :3341) and walked off #13's left end at 4,042 into the pit, 3 set-downs.
  **Fix (firsttimer.ts, the `way` line): in the air on a jump the way he keeps is the jump's own (j.dir).** Toy (hopJudged.test.ts, 'the
  way he keeps is the way he flew'): every air frame of a steered jump to t 40 has way = j.dir, and no stuck spot at x 3,600-4,500. C3:
  RED, '21 frames, t 19.93 x 4191: way -1, the jump's 1'. C4a: GREEN. Row: PASS 176.1 s, 0 rescues (C3 180, rescued).
- C4 (steps 1 + 2) on 2-1, kid + adult vs main: 0 PASS -> FAIL, 31 fail -> pass (vs C3: 6 rows moved, 0 PASS -> FAIL).

## Box 1's next step (hand-over 1, written 1:27 PM ET 11/26; step 1 DONE by box 2 above, step 2 OPEN)
Branch t-eng-thumb-wip, head = the commit that adds this file (code = C3 252f2facc). Evidence in d/, tools in tools/ (`.txt`: copy out,
strip the suffix). Base c73cb9766. Main's rows: INT-R5's `d/rule28/rows-main/` on origin/release-0.10.3-wip-fixes (main cdffdc627;
INT-R5L proved release 4's head rows identical to it, so they ARE main 4bf2cbaa's for these stages).
**C3's rule-28 read, kid and adult, all 5 stages vs main (d/flips-main-vs-c3.txt): 2 PASS -> FAIL**: 2-1 kid E 25 (x 4,277, 'set down
here 3 times') and 2-2 kid N 15 (x 29,179); 0 on 2-4, 2-5, 1-4; fail -> pass 203. Child/middle/expert rows are untouched by the fix
(holdQ bots already armed the lift-off once), so middle N 17 on 2-1 stays (its own cause). Pass counts main / c73 / C3: d/passcounts.txt
(2-5 kid E 0 / 4 / 33, kid N 0 / 0 / 17; 2-2 kid N 19 / 32 / 36; 2-1 kid N 19 / 39 / 40).
1. **2-1 kid E 25, the vine retry loop (2-1 x 3,800-4,300)**: a hop off the vine (y ~650-680) lands on #13 (y 735-752) on the way on,
   70 px under his take-off with no progress counted, so after() (firsttimer.ts, 'landings: did the jump get him on?', ok =
   `p.y < j.y - 6 || (prog.cur > j.cur + 2 && p.y < j.y + 60)`) calls it a MISS and he goes back LEFT to retry; on kid E 25 he walks
   off #13's left end (x 4,042) into the pit with no press, 3 set-downs (c73 20.23 / 27.00 / 29.67, d/jumps-c-2-1-kideasy25.txt); on
   C1 adult E 29 hopped back onto the vine and looped 6 times ('no way on', rescued). Trace C3's own run (`tools/trace.sh.txt
   /frozen-c3 2-1 25 kid easy out`), find which branch sends him left (meant {"left"} from 20.30), fix where it lives (a landing ON
   the route's way on is no miss, or the walk back presses the pit), toy each way on the row (RED on C3, GREEN after).
2. **2-2 kid N 15, pad #116 walk-off (x 29,152, 158.13-158.57)**: he lands on #116 and MEANS right every frame off its front into the
   water (no press), 3 times; C3's row equals c73's (175.4 s, 6 lives). R-165.465 (0)'s family (padRead near 2-2's end, pads
   #112-#116). Trace with `meant`, fix in padRead or the edge's own walk, toy each way.
3. **2-1 middle N 17** (traced below; holdQ, not thumbify): fix with a toy or STOP with the frames for the lead.
4. On each candidate: the CI tool line (`tools/ciline.sh.txt <frozen tree> <out>`, gates.yml:157; NOT yet run on C3), kid/adult
   rows on the 5 stages (tools/rows.sh.txt, about 5 min). On the final frozen head ONCE: rule 28 vs main (all five bots, seeds 1-40,
   both settings, 2-1 2-2 2-4 2-5 1-4), 2-7 x40 (>= 29/40; adult rows move with this fix), pacerLay 23/23 (src/game/gen2/pacerLay.test.ts),
   the 10 races (margins.mts on origin/release-0.10.3-wip-plant-c-report ENG-PLANT/tools), tierBots 9/9, tsc, the 4 bot test files.

## Step 1: the root fix (DONE on C3 252f2facc; toy RED on c73cb9766, GREEN on C3)
- **Fault (thumbify, firsttimer.ts):** the late lift-off re-armed every frame for a bot with no holdQ (the kid, releaseMax [1, 4], so
  he NEVER let go; the adult [0, 2], about 12 frames on average), so every stand he meant ran him on unless a stopMeant line marked
  it: eight lines (c11 ride read L3332, CI-13 handed ride, CI-15 pad pause, the ride stand, BUILD-26g's raised row, the run-up given up,
  the race front stand twice).
- **Fix:** `bare = grounded && no field of the pad set` joins `holdQ` in the arm-once test: a bare stand on a floor is a stop the thumb
  lets go once, with its late lift-off. All eight stopMeant lines and the field are DELETED (new replaces old).
- **Narrowed by the traces (C1 -> C3):** C1 (288b40d2a) let go of every bare {}, in the air too; 2-1 adult Easy 29 parted from c73 at
  4.60 s on a {} in the air (let go after 1 frame, c73 2), and 2-2 kid Normal 11's hop off pad #57 died after a {} in the air at 97.47
  cut his run (vx 285 -> 198 before landing short). In the air a {} is no stand; C3 keeps the old thumb there.
- **Redundancy proof:** C2 (71d478017, C1 minus the eight lines) = C1 row for row on 2-1 (160 kid/adult rows, times included;
  d/rows-c2 vs d/rows-c1). The deleted lines' toys (hopJudged CI-13, CI-15; padRide; riverRide) run in the CI line: NOT YET RUN on C3.
- **Toy** (hopJudged.test.ts, 'a bare stand is a stop the thumb lets go, its late lift-off kept: 2-1 kid Normal 40 to t 150'): (a) in a
  run of bare stand frames the steer is held at most releaseMax[1] frames; (b) a stand straight after a meant, held steer keeps the
  late lift-off (>= releaseMax[0] frames, 90%). c73cb9766 (copy of the test on a probe tree): RED, "t 38.400: 6 of 6 bare frames
  steered; t 68.500: 6 of 6; t 141.833: 5 of 5". C3: GREEN.

## C1's rule-28 read (kid and adult only, vs main; d/flips-main-vs-c1.txt; superseded by C3's above)
2-1: 1 PASS -> FAIL (adult E 29), 30 fail -> pass; 2-2: 5 (kid E 16, kid N 4, 11, 18, 29), 21 fail -> pass; 2-4 0 (74); 2-5 0 (52);
1-4 0 (22). Pass counts C1 (c73 / main): 2-1 kid N 40/40 (39 / 19), 2-2 kid N 27/40 (32 / 19), 2-5 kid E 26 N 26 (4, 0 / 0, 0).
**4 of the 5 release rows PASS on C1** (2-1 kid E 25, kid N 40; 2-2 kid N 15, kid N 40). On C3: 2-1 kid N 40 and 2-2 kid N 40 PASS;
2-1 kid E 25 and 2-2 kid N 15 FAIL (steps 1-2 above); the C1-only flips (adult E 29, 2-2 kid E 16, N 4, 11, 18, 29) all PASS on C3.

## The traces (rule 28: one line each; d/jumps-*.txt are the jump lines, FT_TRACE)
- 2-1 kid E 25 (c73): 20.23 hop off the vine lands on #13 (y 735) 70 px under his take-off = FELL BACK; he means LEFT (the retry), walks
  off #13's left end at x 4,042 at 21.50 into the pit, set down; again 27.00, 29.67: 'set down here 3 times' x 4,277. dfe631913: the
  same miss, but he hopped back and the retry from #13 landed. PASS on C1.
- 2-1 adult E 29 (C1): the same spot: off the vine (x ~3,980 y 670) onto #13 (y 752) = FELL BACK, back onto the vine, again, 6 times:
  'on a vine at 3819,649 with no way on', rescued. The vine/#13 retry loop is one fault with kid E 25's (the 'miss' rule, after():
  70 px under take-off with no progress counted is a miss, so a drop onto the way on is retried forever).
- 2-2 kid N 15 (c73): parts from dfe at 3.97 s (a stopMeant stand on #4: let go on c73, run on at dfe); dies at 158.60 walking (meant
  right) off #116's front at x 29,152, 3 times: rescued. PASS on C1.
- 2-2 kid N 11 (C1): lands on moving pad #58 (14,216-14,346 y 670) at 94.57, stands 8 frames (a pad stand), it goes under at 95.13; then
  98.13 off pad #57 (hop at vx 25, hold 0.10, after the air let-go above) and 100.50 off #56: 'set down here 3 times' x 14,326.
- 2-1 middle N 17 (c73; holdQ, NOT a thumbify row): parts from dfe at 48.00 (c73 presses from a stand on #45 at x 8,817, dfe a frame
  later on the run); 110.87 stands on #85 at x 19,619, 111.17 walks right (meant right) off #85 down onto a log at y 854 and on into the
  water at 111.47; then 114-136 s six hops between x 19,601 and 19,941: 'an open drop ahead, water ahead' x 19,869, rescued.
- 2-1 kid N 40: fails on dfe631913 too (x 19,848: 2-7's own change vs main, D132). PASS on C1.

## Polish check
No screen changed: bot code and tests only. ## Pushback
Box 1's read holds for step 1 (a stale way off a liana, fixed where it lives). Step 2 shows the opposite risk: a fix where the symptom
shows (the walk) instead of where the cause is (the judge) moved 10 2-2 rows the wrong way; the rows caught it in 87 s.
## Unresolved
Step 2 (the pad hop judge; padLip failed), step 3 (middle N 17), the CI line and the rows on C4a not filled in above, every final check.
## Method update
tools/tag.py.txt (box 2): tag every return in intend() on a probe copy and print `why <line>` per frame: which branch chose the steer
reads in one line. Both of box 2's faults were found with it in under 10 minutes each (the 'way' on 2-1 was NOT in the branch that
returned the pad: tag first, then print the state that branch reads: d1/back/way/cur/tgt). A toy that names a rule must test the rule
built, not a stronger one: box 2's first pad toy ('never walks off a pad to his loss') was RED on the fix too, on a different fault.
## Lessons applied
D115 (frozen C3/C4 trees for every verdict; probes on copies), D119 (no heredoc in a commit chain), D128 (stamps from `date`), D132 (vs
MAIN), D133 (the wide read caught padLip: 2-2 kid N 15 passed, 5 other rows failed), D134 (pushed and ls-remote before the hand-over),
D138 (the hand-over ends new work), D140 (notifications at each step boundary), D141 (the CI line on C4, this candidate).
