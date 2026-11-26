# ENG-THUMB: the kid-bot root fix (R-165.465) and release 5's rule-28 rows

## EXACT NEXT STEP (hand-over 1, the 28-minute box; written 1:27 PM ET 11/26 by `date`)
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
No screen changed: bot code and a test only. ## Pushback
The 5 rows are a reshuffle, not 5 faults: each run parts from the base within the first 5-50 s (a stand let go or a press a frame
earlier) and meets an unrelated fault 100+ s later. Rule 28 vs main row for row will keep finding the bot's remaining faults (the 2-2
pad cluster, the vine retry loop) by chance; each is fixed where it lives. ## Unresolved
The 2 C3 flips and middle N 17 (steps 1-3), the CI line on C3, every final check. ## Method update
FT_FRAMES prints `meant` (intend's pad) beside the pad: a stand the thumb ran on reads in one line. ## Lessons applied
D115 (frozen trees for every verdict; probes on copies), D119, D128, D132 (vs MAIN), D133 (wide read, not the 5 rows), D134, D138, D140.
