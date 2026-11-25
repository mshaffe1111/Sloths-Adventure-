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

