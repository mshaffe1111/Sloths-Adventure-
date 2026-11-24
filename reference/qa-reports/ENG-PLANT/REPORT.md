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
