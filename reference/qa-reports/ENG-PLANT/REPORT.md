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
full-run walk-off off a log's far end (E 20: #79 at x 16,730). E 19, E 12, E 13: see firstsplit.txt if filled. So: ONE new fault
(2-4 kid Easy 35, the run-up's own jump); every other traced fall is R-165.413's walk-off or untimed jump.
The run-up's judge (firsttimer.ts:2366-2391): runUpCatches / runPress judge a run along the log then a jump that CATCHES a liana/vine
(canGrabSwing, v) at all three lags; for the kid at E 35 the catch did not happen. Not yet traced: which liana it judged, the hold, and
why the kid's catch failed (the probe for session 11: log runPress's v, hold and lags at t 47.50, then the frames to f1445).

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
0. Setup: `npm ci --no-audit --no-fund --legacy-peer-deps`; worktrees (node_modules symlinked): fz-c24 2a2c44786, fz-c4 6b5f43da0,
   fz-main cdffdc627. Tools: tools/kidfall.mts.txt (6th arg: skills off, comma list), kidclass.py.txt, kidall.sh.txt, firstsplit.py.txt,
   trace.mts.txt, margins.mts.txt, row8*.mts.txt, rows-l.sh.txt. Code head still **c24 2a2c44786**.
1. Ruling 1: the lead has the 2-4 kid Easy 35 run-up trace (above). WAIT for the lead's ruling on it before any merge. Meanwhile finish
   data/l/firstsplit.txt (python3 tools/firstsplit.py.txt fz-c24 trace.mts out; about 4 min) for the other 10 rows that pass on c4:
   a skill whose split is followed by a fall within 2 s where the fall is the skill's own act (a jump from a stand, a turn, a stop on a
   sinker) = a NEW fault (send its trace); a split that only shifts when he boards and the fall is a full-run walk-off = R-165.413.
   So far: 2-1 N 19: runUp identical (no act); floatSure parts at f1123 (x 8,485, a jump off solid #37 he does not take with it off) and
   he walks off log #42's far end at x 8,817 (f1156) at vx 268; handed parts at f1182 and he walks off at 8,702 (f1211).
2. Ruling 2: re-plant pacerLay 22 (boardLog, home middle Easy 1: the lip-log run-off, needs a full RiverZone for floatAt, see
   af127d21e's note) and 23 (raceSure: a racing hop off a log toward a bank 28 px up within 80 px of the log's end; the press's own
   short hold came down 19 px short) as explicit toys in tools/inspect/firsttimer.test.ts the way af127d21e did fromTakeoff: RED with
   the skill off, GREEN on, the SAME bars; pacerLay's race halves keep their GREEN half; pacerLay 23/23.
3. Ruling 4: 2-7 (seeds 1-100: x40 = seeds 1-40 BAR seeds all-pass >= 29/40; the list = 1-100 >= 69/100) and 1-4 rows vs main
   (data/c/main-*.jsonl; tools/flips.py.txt reads <dir>/<st>.jsonl): if data/l/c24-2-7-w.jsonl / c24-1-4-w.jsonl are not here, run
   tools/rows-l.sh.txt with only 2-7:1-100 and 1-4:1-40 (about 30 min, par 2). Then hopJudged, the toys for c23's and c24's rules
   (RED/GREEN), riverRide + firsttimer tests, the CI tool line (gates.yml, find by content) at 0 fail, tierBots 9/9, timecheck +
   roadmapcheck, MERGE into release-0.10.3 (no force), ls-remote, hash + full table to the lead. REPORT BY 11:00 AM ET; HARD STOP 12:30 PM ET.

Lessons applied: D134 (pushed + ls-remote before the hand-over, hash in it), D128 (times from `date`), D115 (a frozen worktree per hash,
no edit under a live run), D135 (c4's own result per row named; nothing carried as 'inherited'), D119 (no heredoc in a commit chain),
rule 28 (every moved kid row traced, not two). Not run this session: the full unit suite (not in the lead's ruling 4 list; Integration's
FULL SET runs it on the merged head) — named so, not skipped silently.

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

