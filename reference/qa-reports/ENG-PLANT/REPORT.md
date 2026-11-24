# ENG-PLANT-e (ENG-PLANT-c session 3, started 5:14 PM ET 11-24 by `date`; this section written 5:31 PM ET by `date`): hand-over (LANES 3b box)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Candidates on origin/release-0.10.3-wip-plant-c (NOT on
release-0.10.3, D117): **c5 0152354a9**, **c6 6234a03ff**, **c7 05aa7f3bd**, **c8 82e3c1b3a**, **c9 742886378**, **c10 4bcd12a19** (head). Main rows: data/c/main-*.jsonl (never re-run).
Known-flip rows (D132, the 10 rows: 2-1 child N 11; 2-2 adult N 4, 24; 2-4 adult N 6, 8, 24, 32, child E 11, 23, child N 39) per
candidate: data/e/flip-<stage>-<bot>-<setting>-c<n>.jsonl. No full table run on any of them (none cleared the flips).

## EXACT NEXT STEP (session 4)
1. Setup as session 2's step 1 (npm ci --legacy-peer-deps; freeze with tools/freeze.sh.txt, its `cd` set to your checkout). Work on
   origin/release-0.10.3-wip-plant-c at **c10 4bcd12a19** (the head). Known-flip rows of every candidate: data/e/.
2. **c10 known flips 7/10; three left** (data/e/*-c10.jsonl). (a) **2-2 adult N 24** (PASS c8, FAIL c7/c9/c10): he lands on
   `moving#117` (a LIFT, type 'moving', not a drift) at x 29,669 at a full run and runs off its front (t 140.13-140.30, again t 151.4),
   lives 3 -> 1, rescued (data/e/tr-c10-2-2-adult-N24.txt). Suspect the same root as ruling 2 on a lift: intend's just-landed walk-on
   (`return side(dir)` in the `t - this.lastLand < 0.1` block) and the adult's never-let-go thumb (R-165.59: a bare {} never lets go
   for KID/ADULT without stopMeant); c10's landing stop reads only `ridden.drift`. Confirm with tools/padsrc2.mts.txt (copy the frozen
   tree to a scratch dir, tag intend's returns with perl: see this session's commands), then make the landing stop general to any
   carrier (drift or moving) whose front is inside his run-out, with stopMeant; toy each way. (b) **2-4 adult N 6**: 'an open drop
   ahead, water ahead' at 10,699 (rescue 1) and 'on a vine with no way on' at 21,179 / 22,758. (c) **2-4 adult N 32**: vine 'no way on'
   at 21,393 / 22,966, set down at 23,620. For (b) and (c), print `UNJUDGED.n` at the end of the run and a stack at each refusal: a
   refusal at the stuck x is another judged press the one-gate check blocks (as vineFromLog's did on c5-c9); otherwise trace the vine
   let-go (session 2: 'a refused let-go is never hung into a rescue').
3. When the 10 known flips all PASS on one head: the full rule-28 rows vs main (castBots every bot, both settings, seeds 1-40, --par 2,
   frozen tree; tools/rows-d.sh.txt; at most TWO heavy runs at once) on 2-1, 2-2, 2-4 first (compare data/c/cmp3.py.txt `<st> main -
   <new>`), then 2-5, 2-7 (its own bar: x40 29/40 or better, the list 69/100 or better; hopJudged + pacerLay since the river gates are
   shared), 1-4. Bar: ZERO bar PASS -> FAIL vs main on every shipped stage. Send the lead each result as it lands.
4. Then the toys (each way, RED on c4 6b5f43da0 by the flip rows above, GREEN on the head): riverRide.test.ts' two new tests ('2-4,
   every hop off a log is judged' adult N 6; '2-1, he never runs off the front of the log he just landed on' child N 11) and the c4 toy
   (2-4 adult N 30) still green; then the packet's plants (same bars, or retire per R-165.432), riverRide + firsttimer tests, the CI tool
   line at 0 fail, tierBots 9/9, timecheck + roadmapcheck; merge into release-0.10.3 (no force); hash + table to the lead.
5. Polish to check on the head: session 2's item 5 (a forward step between the walk back and the hop back, 2-4 adult N 30 t 53.3 on c4;
   seen again on c6 #48 t 56.0-56.4): c7-c9 change that walk (run-out look, log ahead not floor, stopMeant); trace adult N 30 and look.
6. A suggestion for the lead (not done, outside this ruling): thumbify's R-165.59 re-arm ('for KID and ADULT the steer is never let go
   once held' unless stopMeant) is a trap for every stop the bots make with a bare {}; a check that every intend stop on a carrier sets
   stopMeant, or a stop helper, would close the class.

## UPDATE: candidate 10 = 4bcd12a19 (the head; written after the c9 hand-over above, same session)
- Found while writing step 2: SKILLS.vineFromLog's liana press off a log is judged by ITS OWN catch judge (hopCatches at three thumb
  lags x two speeds) and pressed through `decide` -> the queued press (firsttimer.ts c4 :2820), never setting `gateHop`. c5's one-gate
  check at startJump therefore REFUSED every judged liana hop off a log on c5-c9 (my miss: the choke point was written from the
  startJump sites with no `gateHop` and I did not check which of them carry a different judge). c10: vineFromLog marks its queued press
  `judged`; the check lets a judged press through (`pressJudged`). This is the tailed river's only way on, so it is the first suspect for
  c9's 2-4 adult N cycling. Known flips on c10: 7/10: PASS 2-1 child N 11; 2-2 adult N 4; 2-4 adult N 8, 24; child E 11, 23; child N 39. FAIL 2-2 adult N 24; 2-4 adult N 6, 32 (next step 2).
- The other queued presses that carry a judge of their own must be checked the same way before any landing (grep `this.decide(` callers
  that judged first: the bonk hop :3823 is off an animal, not a log; lianaWait is off a bank).

## What this session found (the lead's rulings 1 and 2)
- **Ruling 1, the unjudged hop (2-4 adult N 6 on c4)**: jumpsrc (tools/jumpsrc.mts.txt) at t 51.53: the hop came from the queued press
  (firsttimer.ts c4 :2820, `this.pending`), decided at t 51.47 by the edge code's plain `decide` (c4 :3683). Why the river gates never saw
  it: the step-back hop landed him on #45's very TIP (x 10,598 on #45 x 10,443-10,593); `floorAt(p.x, p.y, 6)` reads the point at his x,
  saw no floor, so `here` was null, the river block (`here.type === 'drift'`) was skipped and the generic edge code pressed a hop no gate
  judged. Fix (c5): the river block reads the log the ENGINE stands him on (`sim.standingOn`, as c4 :4113 already does), and
  `startJump` refuses any hop off a drifting log with no gate-judged hop (`gateHop` null), counted in `UNJUDGED.n`, one choke point.
- **Hop paths found outside the judge** (startJump call sites with no `this.gateHop =` before them, line numbers on c4): the queued press
  :2820 (decide's pending thumb); the late walk-off press :3053; intend's plan hop :3132; the bank-up hop with floatSure off :3414; the
  legacy race hop (raceSure, floatSure off) :3541; tierEdge 'run' :3673 and 'stand' on a sinking pad :3675; the mushroom double :4439; the
  snapper hop :4485; decide's immediate press (lag under half a frame) :4595. All now meet the choke point when he stands on a drift.
- **Ruling 2, 2-1 child N 11**: tagged probe (tools/padsrc2.mts.txt: every return in intend tagged with its line): the press after the
  judged landing on #137 is intend's "just landed" walk-on (c4 :3233, `if (!this.padPause) return side(dir)`: 0.1 s of run after EVERY
  landing; #137 is 240 px so no padPause), then the child's thumb let-go (thumbify releaseLeft, his calibrated releaseMax frames) carries
  the press 4-5 frames more: 40 px of log was not enough. Fix (c5): on landing on a log running his way he stops pressing; where the front
  is inside his run-out he pulls the thumb back (a turn drops the press at once in thumbify). **c5: 2-1 child N 11 PASS** (rescues 0).
- **Same root on 2-4 (c5 trace data/e/tr-c5-2-4-adult-N6.txt)**: after the step-back hop lands on #47, he is 67 px from its front,
  OUTSIDE the edge block's look (his press distance), so intend's default `return side(dir)` (the last line of intend) walks him on at
  full run; the river block's stand comes 39 px out and his let-go runs him off the front into the water. c6: on a log running his way
  the look is at least his run-out; c6's run-out used his speed NOW (about 0 when he starts the walk), so it never widened (c6 trace
  data/e/tr-c6-2-4-adult-N6.txt t 57.30-57.47: intend's last line, vx 0 -> 285). c7: run-out at a full run (PHYS.maxRun x (releaseMax[1]
  + 3) frames + 24 px).
- **c7 trace (data/e/tr-c7-2-4-adult-N6.txt, tagged probe)**: still intend's last line at 89 px from #47's front: the widened look
  reached past #47's front onto **#48, the next log**, and `ahead` read it as floor, so the river block never ran; at 57.30 the stand
  came 47 px out and the let-go ran him off. c8: standing on a log running his way, another log ahead is no floor to walk on (`logAhead`).
- **c8 trace (data/e/tr-c8-2-4-adult-N6.txt, tagged probe)**: now the river block's handed stand DOES return {} from t 63.20, 80 px
  from #45's front, but thumbify keeps pressing right 10 frames: the ADULT has no holdQ, so his let-go re-arms every frame (thumbify's
  own R-165.59 note: 'for KID and ADULT ... the steer is never let go once held') unless the stop is one he means (`stopMeant`, as the
  stop at intend's raised-row line sets). c9: the handed stand and the landing stop set `stopMeant`.
- Polish item 5 of session 2 (the forward step between the walk back and the hop back) is visible again on c6 (#48, t 56.0-56.4: back
  to -267, then forward to +285, then the hop back): the same default walk, outside the look; c7 should cover it (check the trace).

## Known flips per candidate (bar rows; main PASSES all 10)
| row | c4 | c5 0152354a9 | c6 6234a03ff | c7 05aa7f3bd | c8 82e3c1b3a | c9 742886378 | c10 4bcd12a19 |
|---|---|---|---|---|---|---|---|
| 2-1 child N 11 | FAIL | PASS | PASS | PASS | PASS | PASS | PASS |
| 2-2 adult N 4 / 24 | FAIL / FAIL | PASS / PASS | PASS / PASS | PASS / **FAIL** (new: set down 3x at 29,875) | PASS / PASS | PASS / **FAIL** (set down 3x at 29,708) | PASS / **FAIL** (lift run-off 29,669) |
| 2-4 child E 11 / 23 | FAIL / FAIL | PASS / PASS | PASS / PASS | PASS / PASS | PASS / PASS | PASS / PASS | PASS / PASS |
| 2-4 adult N 6 / 8 / 24 / 32 | FAIL x4 | FAIL x4 (rescues 4/2/2/3; set down 3x at 10,718-10,902 and 16,7xx) | FAIL x4 (3/3/2/2) | FAIL x4 (3/2/2/1; 10,742-10,878 and 16,7xx) | FAIL x4 (1/2/2/2; 10,693-10,878) | FAIL x4 (2/2/2/2: no water; stuck-rescued cycling step-backs, see next step 2) | FAIL / PASS / PASS / FAIL |
| 2-4 child N 39 | FAIL | FAIL (1) | FAIL (2) | PASS | PASS | PASS | PASS |

**Totals of the 10 known flips: c4 0/10, c5 5/10, c6 5/10, c7 6/10, c8 6/10, c9 5/10, c10 7/10.** None lands (bar: 10/10, then zero bar
PASS -> FAIL on the full tables). c10 is the head and the right base (c9 + the judged liana press let through): every fix in it is at a named root (the log he stands on, one
hop judge, no landing walk-on, the run-out look, a log ahead is no floor, a meant stop); what is left is the tailed river's way on (the
liana judge) and 2-2 adult N 24.

## Process notes (own them)
- D36: c5 was committed on a DETACHED head (the checkout sat on 6b5f43da0 detached; `git status -sb` said "HEAD (no branch)" in the
  commit chain and I did not stop on it). It was pushed as HEAD:release-0.10.3-wip-plant-c, a fast-forward, ls-remote equal; the local
  branch was then pointed at it and switched to before c6. Countermeasure for me: the commit chain checks `git symbolic-ref -q HEAD` first.
- Every run on chattr-frozen worktrees (/home/user/fz-c4..c7, proven writable, D115); every long run run_in_background; no heredoc in a
  commit chain (D119); time stamps from `date` (D128). Lessons applied: D115, D117, D119, D128, D132 (known flips first).

# ENG-PLANT-d (ENG-PLANT-c session 2, started 4:56 PM ET 11-24 by `date`; this section written 5:12 PM ET by `date`): hand-over (LANES 3b box)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Candidate 4 = **6b5f43da0** on origin/release-0.10.3-wip-plant-c
(3b 06b5316be + one change at SKILLS.handed + the toy). NOT on release-0.10.3 (D117). Main rows: data/c/main-*.jsonl (cdffdc627, not re-run).

## EXACT NEXT STEP (session 3)
1. `git fetch --unshallow origin` (background) and `npm ci --legacy-peer-deps` (plain npm ci fails ERESOLVE, as CI's install line says).
   `git fetch origin release-0.10.3-wip-plant-c release-0.10.3-wip-plant-c-report`; work on -wip-plant-c at **6b5f43da0** (candidate 4).
   Freeze with tools/freeze.sh.txt (its `cd` must point at your checkout; worktree + node_modules symlink + chattr, proven writable).
   Main's rows: data/c/main-*.jsonl; c4's rows: data/d/c4-*.jsonl; compare with data/c/cmp3.py.txt (`cmp3.py <st> main c3b c4`).
2. **2-1 child Normal 11 (the one 2-1 bar flip, unchanged by c4)**: at x 30,230 edgeWait (t 332.67) / edgeStand (t 335.93) judge a
   single onto a log running his way (#137/#136); it lands at x 30,394, and he keeps HOLDING RIGHT at full run for 6 frames (vx 285/268
   alternating, data/d/tr-c3b-2-1-child-N11-x30230.txt t 333.20-333.40) and runs off the log's front at 30,465; the safe river sets him
   back; 4+ times; rescue. Find what presses forward after the landing (a stack at the frame's returned pad, or HOP_TRACE + a pad log;
   suspects: the gateHop flight's steer kept past the landing, the ride block's walk-on, padPause/tablePick's walk). The invariant's way
   on: a judged hop onto a carrier ends in a stand on it (or the gate asks for room for his run-out at the landing vx). Toy each way:
   2-1 child N 11 crosses clean (RED c4, GREEN fix). Main walks down the 28 px step onto the log's back and stops (tr-main excerpt).
3. **2-4 on c4 (7 bar flips; 3 are c4's own: adult N 6, adult N 24, child N 39)**. adult N 6 traced (data/d/tr-c4-2-4-adult-N6.txt): the
   step-back works (HOP_TRACE 'stepBack' t 50.70 lands on #45), then 0.15 s after that landing an UNJUDGED forward hop (no HOP_TRACE row;
   t 51.57, vx 230-268) takes him back toward #46, the log he left, which goes under: water at x 10,767, x3, rescue x2. Fix at the cause:
   find the gate that pressed it (stack at the returned pad, t 51.53-51.57) and make every forward gate treat a log that goes under
   before it can hand him on (its run's end with no floor within 80 px, the c4 predicate `handedOn`) as no landing inside the time he
   would stand on it; an unjudged hop onto a log is also a hopJudged miss, so run hopJudged on it. Then re-run the toy each way.
4. Read the c4 2-4 / 2-2 tables below; for each bar flip left, trace one row and name the gate (same method: frames near the stuck x,
   tools/hoptrace.mts.txt for the gate, tools/drift.mts.txt for the river). Left from 3b on c4: 2-4 adult N 8 (vine 'no way on' 23,078,
   set down 3x 23,726), adult N 32 (set down 3x 16,714), child E 11 (set down 8x 28,028), child E 23 (vine 8,160, 'water ahead'
   20,918); c4's own: adult N 24 (vine 21,885, set down 3x 23,567), child N 39 (set down 8x 11,224). The 'on a vine with no way on'
   notes are a let-go the bot refuses while hanging: the same invariant (a refused let-go is never hung into a rescue).
5. Polish named on c4: at t 53.3 (2-4 adult N 30) one forward step (vx +60..+173) between the walk back and the hop back. A latch on the
   step-back (the log's id until its under point) was tried (3b1151499, not pushed) and did NOT remove it: the forward press comes from
   another path; find it with the same stack method as item 2, fix at its cause.
6. Then, per the lead's ruling: rule 28 vs main on 2-1, 2-2, 2-4, 2-5, 1-4 (zero bar PASS -> FAIL), 2-7 on its own bar (29/40 at least on
   x40; the list 69/100 unchanged or better), pacerLay + hopJudged (2-7) since handed/edge gates are shared; the packet's plants
   (re-plant at the SAME bars or retire with a full search, R-165.432), riverRide + firsttimer tests, gates.yml 'rolled' at 0 fail,
   tierBots 9/9, timecheck + roadmapcheck; merge into release-0.10.3 (no force); hash + table to the lead.
   Any stop: tell the lead with the rows; never loosen a bar (law 22).

## The trace (lead's ruling: trace 2-4 adult N 30 first, name the gate that stands)
- 3b, 2-4 adult Normal 30, river x 10,028-11,196 (`{"x0":10028,"x1":10766,"dir":1,"speed":80,"width":150,"tail":430}`): a TAILED river.
  The logs run 10,028-10,766 and go under; the last 430 px to the bank (#42 at 11,196) is crossed only by the swing liana at x 10,856.
- Three rides (t 49.4, 55.3, 61.9): he boards a log running his way (#45, #47, #48), stands on it vx 0 for 4-5 s, the log carries him
  under at x 10,767 / 10,768 / 10,760: set down 3 times at one spot -> Dot's rescue (row: rescues 1, lives 3, stuck 'set down here 3 times').
- **The gate that stands: SKILLS.handed** (firsttimer.ts, the ride block: 'a log running his way carries him onto the bank it slides
  under; he rides it in'), after **SKILLS.vineFromLog refuses** the liana each frame (its catch is judged at three thumb lags: mid and
  mid +/- half a spread). handed's premise is false on a tailed river: the log is never handed on, it goes under 430 px short.
- Probe (vprobe.mts: vineFromLog with the spread at 0, i.e. his OWN aim, the press without the judge): ride 1 no catch at all, ride 2 one
  catch at x 10,750.9 (t 59.30, 0.2 s before the drop), ride 3 none. **So 'take the press he would have made without the judge' cannot
  save this site; the trace says step back.**
- Main (cdffdc627) has the same stand (drops at 10,774 and 10,768 on the same logs) and passes only because its 4th ride catches the
  liana by the judged press at x 10,663 (t 75.0): luck of the swing phase. vineFromLog is byte-identical on main and 3b.
- 2-1 child Normal 11 (3b's one 2-1 flip): the rescue is at **x 30,230**, not 19,592 (19,592 is upstream's stand carried BACK to the bank
  #83, no life: the ruling's own 'carried back to the bank he came from', working). At 30,230 HOP_TRACE names **edgeWait** (t 332.67,
  log #137) and **edgeStand** (t 335.93, log #136): the judged hops DO land, but at full run (vx 267-285) 70 px from the log's front, and
  he runs straight off its front end 0.2 s later (no stand; the gate's 24 px landing margin ignores his run-out after landing); set down
  by the safe river 4+ times -> rescue. Main walks down the 28 px step onto the log's back and stops (lives 3, passes). Head passes it
  too, so 3b's timing exposed it; the gap (a gate landing with no run-out) is head's.

## Candidate 4 (6b5f43da0): the change (general, no stage id)
At SKILLS.handed, under SKILLS.floatSure: the log is handed on only where its run's end (x1, or x0 flowing left) has a floor within
80 px. Else (a tailed river) he waits while the hop stays open; once his feet would reach the under point (end - 10 px) within his
stopReact + the walk back to the log's rear end (/ PHYS.maxRun), he STEPS BACK: the hop onto the log behind him (same flow, within
600 px) when gateSees lands it (24 px, the aim he draws for it, HOP_TRACE site 'stepBack', flown as gateHop), else the walk toward
the log's rear end (stops 20 px from it, never off it). No new number by eye: stopReact, maxRun, the 80 px hand-off and the 24 px gate are
the existing ones.
- Toy (riverRide.test.ts, after 'a refused hop leaves a way on'): '2-4, a bot that refuses a hop is never ridden into a rescue: the adult
  on Normal (30) is never carried under on a log he stands on'. **RED on 3b** (`adult normal seed 30: shrine, rescues 1, lives 3, stuck
  [{"x":10766,"what":"set down here 3 times"}]`), **GREEN on candidate 4** (rescues 0).
- Frames on c4 (tr-c4-a30): t 52.9 he walks back on #45 (vx -87/-268), 53.4-54.2 hops back onto #48 (x 10,562), 54.4 the liana from #48
  (vineFromLog's judged press), 57.0 on the bank #43. One rough spot seen: at t 53.3 one forward step (vx +173) between the walk back and
  the hop back (the condition toggles as the walk lengthens `left`): polish to fix (latch the step-back until he leaves the log).

## Rows: rule 28 vs MAIN (D132), castBots CLI rows, every bot, both settings, seeds 1-40, frozen trees (main cdffdc627, c3b, c4 6b5f43da0)
| Stage | c4 vs main: bar PASS -> FAIL | which (main | 3b | c4 in data/d/cmp-c4-<st>.txt) | 3b vs main (bar) | passes main / 3b / c4 |
|---|---|---|---|---|
| 2-1 | **1** | child N 11 (3b too) | 1 | 329 / 323 / 323 |
| 2-4 | **7** | adult N 6 (c4 own); adult N 8 (3b too); adult N 24 (c4 own); adult N 32 (3b too); child E 11 (3b too); child E 23 (3b too); child N 39 (c4 own) | 8 | 286 / 291 / 301 |
| 2-2 | **2** | adult N 4 (3b too); adult N 24 (3b too) | 2 | 330 / 335 / 335 |

Not run on c4: 2-5, 2-7, 1-4 (rule 28 failed on the first three; usage). 2-1 on c4 is row-for-row 3b (no tailed river on 2-1).
**VERDICT: rule 28 vs main FAILS on c4 (2-1: 1, 2-4: 7, 2-2: 2). Nothing lands. Told the lead with the rows (law 22: no bar moved).**

## Lessons applied
D113 (no foreground wait: rows by completion notices), D115 (every run on a chattr-frozen tree: pc-main, pc-c3b, pc-c4), D117 (candidate
on -wip-plant-c), D119 (scripts to files, -m commits), D121 (a toy each way: RED 3b / GREEN c4), D128 (times from `date`), D132 (rule 28
vs main), law 22 (no bar touched), the lead's R-165.413 ruling (no reAim for the adult: none given).
## Learned (for the next builder)
A way on that moves him off a carrier is only half the invariant: every forward gate must then agree the carrier he left is no landing
(c4's adult N 6 stepped back cleanly and was hopped forward again, unjudged, 0.15 s later). Name both halves in one toy pair.
Note: LESSONS.md on this branch and on release-0.10.3 ends at D78; D111-D132 are not in it (read from the brief and session 1's REPORT).

# ENG-PLANT-c (session 1, started 4:20 PM ET 11-24 by `date`; this section written 4:51 PM ET by `date`): STOPPED on rule 28, hand-over

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Base: release-0.10.3 dfe631913 + candidate 2 (merge 80eb07842).
Candidate 3b is on **origin/release-0.10.3-wip-plant-c** (06b5316be; code a64f02ce5), NOT on release-0.10.3 (D117). Rows: data/c/.

## VERDICT: rule 28 vs MAIN (D132) FAILS on 2-2 and 2-4. Nothing lands. Told the lead.
castBots CLI rows, every bot, both settings, seeds 1-40, frozen trees (main cdffdc627, head dfe631913, c3 60bbf14cc, c3b a64f02ce5);
compare: data/c/cmp3.py.txt (main rows first; BAR = adult, child, middle, expert).
| Stage | head vs main (bar flips) | 3b vs main: bar PASS -> FAIL | 3b bar rows |
|---|---|---|---|
| 2-1 | 5 (adult N 12/24/37, child N 27, middle E 9) | 1: child N 11 (rescued x 19,592 'water ahead': not traced) | all 5 head flips cleared |
| 2-2 | (ENG-PLANT-b: adult N 24) | 2: adult N 4 (ENG-PLANT-b: walks off the last pad crossing that fails on main), adult N 24 | NOT cleared |
| 2-4 | (ENG-PLANT-b: 8) | 8: adult N 8/27/30/32/35/38, child E 11/23 = exactly ENG-PLANT-b's merge flips | NOT cleared |
| 2-5 | - | 0 | clean |
| 2-7 | not shipped on main (main 70/360 pass, a draft) | 3 (child E 24, expert N 29, middle N 32): not a shipped row; 3b passes 294/360 | informational |
| 1-4 | - | c3b 1-4 was still running at the stop: UNRUN (main's rows are in data/c) | |

## What 3b is (tools/inspect/firsttimer.ts, general, no stage id)
A refused hop leaves a WAY ON at candidate 2's three judged gates (padPause flick off a drift log, bankUp face, upstream bank): (1) the hop
of his OWN tier table the gate lands (new FirstTimerRun.tablePick: raceCandidates + racePick, the race's honest-middle pick; thumb noise
drawn at the press and flown via gateHop); (2) bankUp only: not at the face yet with log under him, walk on toward it; (3) else stand and
the log hands him back. Toys: blind press = riverRide :207 (adult N 12: rescued on head, clean on 3b); stand-until-rescued = new riverRide
test 'a refused hop leaves a way on' (child N 1: castRun rescued x 19,576 on candidate 2 after standing 6 s + 5 s at the face; clean on 3b).
c3 (without the padPause pick) left 4 new 2-1 bar flips (child E 31, middle E 31, middle N 24/25; middle N 25 traced: flick refused on a
150 px log at 2-1's back river, the ride gates refused the same held aim, stood 4.5 s carried back, x3, rescued); 3b clears all four.
Plants re-measured on 3b (toyfind) and re-planted at UNCHANGED bars (commit 06b5316be): ride on toy roll 4 (on: 0 lives every tier; off:
middle N 2, middle E 3, child N 3, child E 1: two tiers over RIDE_LIVES; note middle N alone is AT the bar, not over); handed on child N
long roll 12 (on 0 lives handed 1; off 4). Not run yet: riverRide/firsttimer tests on 3b, upstream/bankUp/boardHop searches, CI line.

## Why 2-2/2-4 still flip (read, not yet traced)
tablePick has no table for kid and ADULT (raceCandidates needs holdQ), and 3b touches only candidate 2's three gates. ENG-PLANT-b
(ATTRIBUTION.md) puts every bar flip on floatSure's refuse-and-stand on a log carrying him back. 2-4's adult rows end 'set down here 3
times' (x 10,766-10,902, 17,010, 25,164) and 'on a vine ... with no way on' (x 21,5xx-23,4xx): the stands are at the OLDER floatSure
sites (edgeWait refused stand ~:3420, upstream next-log refused stand ~:3580, edgeStand ~:3097), where no way on exists for any bot.

## EXACT NEXT STEP (session 2)
1. `git fetch origin release-0.10.3-wip-plant-c`; work on it (06b5316be). Freeze per dispatch-packet D115. Rows of main for all six
   stages are in data/c/main-*.jsonl (cdffdc627): do not re-run main.
2. Trace ONE 2-4 adult row (adult N 30, x 10,766: data/c tools trace.mts.txt + geo.mts.txt, `awk` the frames near x) and name the
   gate that stands (HOP_TRACE or a stack at the return {}). Expect an older floatSure stand with no table.
3. Generalise the way on to EVERY floatSure refuse-and-stand on a log or bank edge (edgeWait, upstream next-log, edgeStand, raceSure
   is the race's own): (1) tablePick; (2) for a bot with no table (kid, adult): a way on that passes the gate, e.g. the drawn aim
   re-drawn after stopReact (SKILLS.reAim is the child's only by the lead's ruling R-165.413: ASK the lead before giving it to the adult),
   or ride on / step back. Check pacerLay + hopJudged (2-7) on any change at a shared gate.
4. Rows on the new candidate: 2-1, 2-2, 2-4 first (tools/rows.sh.txt in data/c), then 2-5, 2-7, 1-4; cmp3 vs data/c/main-*. Zero bar
   PASS -> FAIL vs main or STOP and tell the lead. Also trace 2-1 child N 11 (3b's one 2-1 bar flip).
5. Then the packet's item 3 (plants: upstream re-search on 2-1 via search21, bankUp/boardHop full search for retirement), riverRide +
   firsttimer tests, the CI tool line (gates.yml rolled), tierBots 9/9; push by merge into release-0.10.3; hash + table to the lead.

## Lessons applied
D115 (every run on a chattr-frozen tree: pc-main, pc-head, pc-c2, pc-c3, pc-c3b), D117 (candidate on -wip-plant-c, not the shared
branch), D119 (scripts to files; -m commits), D113 (no foreground wait), D132 (baseline main), D59 (no run left behind: c3b 2-7/1-4 named),
law 22 (bars unchanged; the plants moved rolls at the same bars, per the lead's ruling).
## Method update
Proposed: a refused judged hop must name its way on in the same code block (a toy each way), and rule 28's first row run is the attribution's
flip list (ENG-PLANT-b's rows) before the full table: 3b's 2-4 miss was visible from that list before any run.
# ENG-PLANT REPORT: release 4's six non-throw CI reds (riverRide x5, firsttimer :184)

Session 1: started 3:04 PM ET 11-24 (by `date`), hand-over REPORT pushed 3:27 PM ET (commit 963aa5eb7's time); narrow continue on the
lead's word (the row verdict below). Engine (bots), Opus 5.5. Lead:
session_01FhBbYN2CVHnFXg7XzqKXpM. Base: release-0.10.3 bf2479dc2 (the INT-R5b red list); release head at hand-over 40a493b70 (ENG-W2FIN
landed at 150e6e161). Lead's ruling A (in a message): write the fix at the cause; hard stop moved to 5:30 PM ET.

## ROW VERDICT (narrow continue; written 3:41 PM ET by `date`): PASS -> FAIL on shipped rows: YES. STOPPED, told the lead.
castBots CLI rows (the CLI's own input, not castRun's 'fake'), every bot, both settings, seeds 1-40, frozen fix ea573b4e4 vs frozen
main cdffdc627 (tools/rows.sh.txt, tools/flips.py.txt; data/flips-main-vs-fix-partial.txt):
| Stage | Rows differ | PASS -> FAIL | fail -> pass | PASS -> FAIL by bot |
|---|---|---|---|---|
| 2-1 | 207 of 360 | 30 | 13 | kid N 10, kid E 8, child N 5, middle N 2, middle E 2, expert N 2, child E 1 |
| 2-2 | 282 of 360 | 11 | 16 | kid N 4, kid E 5, adult N 2 |
| 2-4 | 291 of 360 | 15 | 20 | kid E 7, adult N 6, child E 1+1 (child E 2) |
| 2-5, 2-7, 1-4 | not compared (runs unfinished at the stop) | | | |
**Cause: NOT attributed.** This compares the fix against main, so it carries the whole release merge (t-build-26 + t-build-27e: the
honest aim, boardLog, the step-up rule, the overSmall strip) as well as the fix; 200-290 rows differ per stage, far more than two judged
presses can move. The successor's first job: the SAME rows on a frozen bf2479dc2 (the unfixed head), then three-way: rows that flip
main -> head are the merge's (the lead's call, not this fix's); rows that flip head -> fix are the fix's, each traced (re-aim or
hand-back) or the fix narrowed. Then 2-5, 2-7, 1-4 on all three trees. Nothing lands until the lead rules on the table.

## EXACT NEXT STEP (session 2 starts here)
The fix candidate is on **origin/release-0.10.3-wip-plant** (two commits over bf2479dc2: b2f05731c, ea573b4e4; also as
data/candidate-2.patch.txt). It is NOT on release-0.10.3.
1. `git fetch origin release-0.10.3 release-0.10.3-wip-plant`; check out the wip branch, `git merge --no-ff origin/release-0.10.3 -m "..."`
   (brings ENG-W2FIN's w2.ts fix; no conflict expected: only tools/inspect/firsttimer.ts changes), `npx tsc --noEmit -p .`.
2. **Rule 28 rows (the lead: every listed stage with rivers, every bot, both settings; no shipped pass may flip to fail; every moved row
   explained):** on two FROZEN trees (tools/freeze.sh.txt: worktree --detach, node_modules link, chattr -R +i src tools, chattr -i
   src/game/gen2/proven), the fix and origin/main, run tools/rows.sh.txt (castBots --stage S --seeds 1-40 --bots kid,adult,child,middle,expert
   --setting both --par 2 --rows, for S in 2-1 2-2 2-4 2-5 2-7 1-4), each with run_in_background (NEVER a shell '&'), at most two at once.
   Session 1 STARTED both in its container at 3:25 PM ET (rows-fix2, rows-main); if session 1's container is gone, re-run them. Compare
   with reference/qa-reports/INT-R5/tools/castcmp.py (main rows first). Any shipped pass -> fail: STOP and tell the lead. A moved row that
   needs naming against the unfixed engine: run the same row on a frozen bf2479dc2 (tools/rows.mts from BUILD-26/b26t/rows.mts.txt).
3. **The plants must be searched ON THE FIX** (it changes log play: on the fix the upstream plant's head cases no longer bite, table
   below). Searches (tools/*.txt, each `npx tsx <tool> <frozen tree> ...`): search21 (2-1 on/upstream-off/bankUp-off; `ONLY_BU=1` skips
   upstream), toyfind (the riverRide toy: `deep ride` and `long handed`, seeds 1-60), boardhop (firsttimer :184's meet(), any stage once
   edited: today 2-2 only). Bars UNCHANGED (law 22): ride: at least one of the 4 tiers over RIDE_LIVES 2 with it off, all 4 within it on;
   handed: lives at the river > SKILL_LIVES 1 off, <= 1 and handed >= 1 on; upstream: 5+ more lives off (UPSTREAM_MORE), and the rescue
   case clean on / rescued off; bankUp: 5+ more lives off (BANKUP_MORE) and the both-ways far bank 2+ s later; boardHop: a life lost within
   3 s of a lip stand off, none on. Each new case: a premise trace (tools/trace.mts.txt or toytrace.mts.txt: first divergence on vs off,
   then where the lives go), sent to the lead BEFORE it is written.
4. **Lead rulings (in messages, session 1):** APPROVED, at the same bars, each premise traced in this REPORT and RE-MEASURED ON THE
   FIX before writing: the toy ride plant on seed 4 middle N (bar 2), handed on child N seed 12 (bar more than 1). boardHop and bankUp:
   if the FIXED bot shows NO live case anywhere (every listed stage with that mechanic, every bot, both settings), RETIRE that PLANT (the
   skill's code stays); this REPORT carries the full search and the line 'plant retired: no live case on the merged engine; re-plant when
   a stage needs it' (the lead files the roadmap row). If either still has a live case, plant it at the same bar. Upstream: re-search on
   the fix (child N 8/23/39 were the approved head cases; none bites on the fix). Stop on any shipped pass -> fail. Hard stop 5:30 PM ET.
5. Then riverRide.test + firsttimer.test on the frozen fix, the CI tool line (gates.yml rolled line, read live) on the frozen merge: 0 fail
   except the chaseBots todo; tierBots (1-1: the fix touches log play only, expect calibration unchanged; if a run moves, BOTS.md);
   push by merge into release-0.10.3 (never force); send the lead the hash and the table.

## What session 1 found

### riverRide :207 (adult N seed 12 rescued, skills ON): a real 2-1 regression, traced to its cause
- Green on main cdffdc627 and on 8d094787c (the release branch before the t-build-27e merge): riverRide.test 18/18 there
  (data/rr-head.txt is the head's run, 16 pass / 5 fail). INT-R5b's bisect agrees (green 8d094787c, red b3195f31e).
- 2-1 Normal search on head (child/middle/adult x seeds 1-40, data/s21.jsonl): with every skill ON, 4 rows are rescued that are clean on
  main and on 8d094787c: adult N 12 (main 0 lives 0 rescues -> head 3 lives, rescued, x 25,624), adult N 24 (0/0 -> 4, rescued, x 25,441),
  adult N 37 (2/0 -> 5, rescued, x 19,910), child N 27 (1/0 -> 5, rescued, x 30,435 'water ahead').
- Trace, adult N 12 (frame diff head vs 8d094787c, tools/trace.mts.txt): first divergence t 35.33 s, x 8,428: on head he stands 0.47 s at a
  bank's lip (SKILLS.boardLog, ENG-27g, t-eng-27: wait while a log his way is mostly under the lip). With boardLog off the head run is
  frame-identical to 8d094787c to t ~85 s and crosses clean. boardLog is right; it only moved his phase. The FALLS are the cause:
  a stack trace of every startJump and decide (tools/jumpsrc.mts.txt) puts all three lives on presses no gate judged:
  - t 114.47, the generic edge press (firsttimer.ts:3584 on the base) after he ran past an at-him log's front (x 25,434, log end 25,427),
    pressed in the air, down at x 25,607 short of the far bank;
  - t 117.27 and 119.10, the padPause flick (firsttimer.ts:3224 on the base: after landing on a log under 220 px he pauses 0.25-0.5 s, then
    decide(jumpFor) after his thumb's lag, no landing read) off logs running HIS way (x 24,631, 24,301): into the water; rescued.
  Main crossed only by the phase luck of when he reached that river.
- **The fix (ruling A, rule 28), two commits:** (1) b2f05731c: under floatSure the bank hop off a log running back at him (upstream's
  `bank`, bankUp's face) is pressed only when gateSees lands it on the bank with 24 px; refused, he stands and the log hands him back (as
  raceSure already does for the race's bank hop). Alone it left adult N 12/24/37 frame-identical (child N 27 went clean): my first
  read of the hop was wrong and I said so to the lead. (2) ea573b4e4: under floatSure the padPause flick off a DRIFT log is pressed only
  when gateSees lands it on a log (24 px) or the bank ahead; refused, no flick, the ride's own gates (edgeWait, upstream, handed) decide.
  tsc clean. On frozen ea573b4e4: adult N 12 shrine 1 life 0 rescues; adult N 24 0/0; adult N 37 1/0; child N 27 1/0. riverRide :207
  passes on it only if child N 4/23/40 and middle N 26 also cross clean (not yet run on the fix: step 5).
- Not fixed: the :3584 edge press past an at-him log's front is still a blind press; with (2) adult N 12 no longer reaches it. If the rows
  show it elsewhere, the same rule applies there.

### The plants, searched on HEAD bf2479dc2 (before the fix; they must be re-searched on the fix, step 3)
| Plant | Old case | On head | Live cases on head (same bar) |
|---|---|---|---|
| :107 ride (toy, deep, RIDE_LIVES 2) | seed 1 (fixtureSeed): off middle N 1, others 0 | no bite | seeds 1-22 (data/toy-ride.jsonl; stopped there): seed 4 middle N 0 -> 6 (also middle E 0->2, child N 0->2); seed 3 child N 0 -> 3; seed 6 middle N 0 -> 3; seed 8 middle N 1 -> 4. All 4 tiers within the bar ON on each. Trace seed 4 middle N: frame-identical to t 9.467 (x 1,921, on log #7 drifting his way); on he rides it; off he hops off at t 9.50, 6 lives at the river (x 1,859-2,346), 38.5 s vs 14 s |
| :145 handed (toy, long, SKILL_LIVES 1) | middle N seed 1: off 0 lives, handed 0 | no bite | middle N: no seed of 1-22 bites (data/toy-handed.jsonl). child N seed 12 0 -> 4, seed 2 0 -> 3 (both on: 0 lives, handed 1). Trace seed 12 child N: frame-identical to t 18.867 (x 1,915, on long log #8 running his way); on he rides it in and is handed; off he hops at the water at 18.90, a life at x 2,023 0.4 s later, 4 at the river |
| :213 upstream (2-1, UPSTREAM_MORE 5; rescue case) | adult N 12 rescued off; child N 4 (-1 now), 23, middle N 26 | 4 and 26 no bite; adult 12 rescued ON | child N 8 (0 -> 10), 23 (0 -> 8, rescued off), 39 (0 -> 6); child N 31 clean on / rescued off. Trace child N 8: frame-identical to t 205.30 (x 19,326, on log #84 running back at him); on he hops off the front end; off he stands, a life at x 19,384 0.7 s later, 5 at that river, 5 at the both-ways back river |
| :229 bankUp (2-1, BANKUP_MORE 5, +2 s) | child N 40 | 1 -> 2 | NONE: 2-1, every bot (kid, adult, child, middle, expert), both settings, seeds 1-40, 360 rows (data/s21.jsonl, s21-bu.jsonl): 0 rows 5+ lives or a rescue off; 32 rows move by time only |
| firsttimer :184 boardHop (2-2) | child N 36 (+ middle N 17 guard) | 0 of 1 stands off | NONE on 2-2: child and middle, both settings, seeds 1-40 (160 rows, data/bh.jsonl): on == off on every row |

**On the fix ea573b4e4 (data/up-fix2.jsonl), upstream off:** child N 8 0 -> 3, 23 1 -> 4, 31 1 -> 1, 39 1 -> 2, middle N 26 2 -> 3, adult N 12
1 -> 1, no rescue: **no head case bites at the bar on the fix.** The judged flick does much of what the skill did (a blind flick was the
way he died without it). The plants are re-searched on the fix (step 3); a skill with no live case anywhere goes to the lead for retirement,
never a lower bar.

## Messages to the lead (session 1)
1. STOP (packet step 2): :207 is a real 2-1 regression vs main (the 4 rows), the trace, the proposed fix, A/B/C. Lead: A.
2. Correction + candidate 2 result + the rows run + plant status; asked: toy ride seed 4, handed child N 12.

## Lessons applied
D115 (every run on a chattr-frozen worktree: fz-head, fz-26, fz-main, fz-fix1, fz-fix2), D119 (commit messages by -m; scripts written to
files first), D94 (inherited checked on the base: 8d094787c and main run, not trusted), law 22 (no bar lowered; a plant with no live case
goes to the lead), law 3 (my first hop read was checked by a run, found wrong and corrected to the lead the same box).
