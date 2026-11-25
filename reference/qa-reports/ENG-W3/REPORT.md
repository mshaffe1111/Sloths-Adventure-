# ENG-DOWNBOT REPORT (lane 2: the down lay's head room, then the bots on a way down to the shrine) — box 6 (session 4, 11-25)
**EXACT NEXT STEP (box 6 hand-over):** code head **7d12c344b** (pushed; this REPORT + rows commit sits on it: its hash is in the hand-over message, check with `git ls-remote`). **Ruling 1 is DONE**
(measured below: 'a catch hands on to its storey' GREEN on 48/48, head room and 'a catch crosses a vine' GREEN, 0 errors on 48;
the planted toy is red on e7c203362, green on 7d12c344b). Next, in order: **(2) Ruling 2 on this FINAL lay: the three runs are DONE and committed; the TOYS are owed.** How they were run (to re-run one): two heavy runs at a time,
each on a frozen tree of 7d12c344b (`git worktree add --detach`, symlink node_modules, `chattr -R +i src tools`), `GEN2_DRAFT=3-1 npx
tsx tools/inspect/castBots.ts --stage 3-1 --bots kid,adult --seeds 1-20 --json`; rows come out bot, then setting, then seed, about
4 a minute each with two running. **Rows on 7d12c344b (committed, rows/castbots-7d12c344b-1-20.jsonl every bot; -Aoff- and -Boff-kidadult-1-20.jsonl):** BOTH fixes BITE, so both STAY; each owes its toy on a real row. **Fix A** (downEnd whenever the way on is below): 23 of 80 kid/adult rows differ; the head has 3 more clean rows and 3 fewer rescues (164 vs 167); its rows: **kid normal 13** (head R0 100.9 s; A off R1 129.9 s, 'in a dip 108 px deep' at x 713), adult normal 10 (R0 vs R1, 'the way on is 214 px down' at x 1180), adult normal 13 (R0 vs R1). **Fix B** (the run seeded from the wood under his feet): 6 of 80 differ; normal rescues 37 vs 42; its rows: **adult normal 13** (head R0 113.8 s; B off R2 155.2 s, 'in a dip 108 px deep' at x 713, then a drop of 108 px at x 729), adult normal 11 (R1 vs R3), kid normal 8 (R1 vs R2). Next: build each toy from its row's shape (seed 13 normal near x 713 serves both: read it with probes/tail.mts SEED=13 and the row's stuck spots), red with the fix off, green on the head (castBots.test 'a way down' arenas). **The head's every-bot 1-20 (first half of x40):** 180 rows; rescues kid N 20, kid E 53, adult N 17, adult E 74, child N 37, child E 42, middle N 38, middle E 78, expert N 51; clean-pass kid N 5/20, adult N 6/20; 4 rows never reach the shrine (child normal 2, middle normal 1, expert normal 1); top causes 'in a dip, the way on is N px down' 189, 'in a dip, a drop ahead, the way on down' 112, 'the way on is N px down' 81, 'in a dip' 75. Ruling 3 runs seeds 21-40 next and traces these. Fix A off = in tools/inspect/firsttimer.ts delete the two lines `const end = p.grounded
&& dy > 40 && !p.isVineSwinging ? this.downEnd(p) : 0;` / `if (end) dir = end;` and add `const end = p.grounded ? this.downEnd(p) : 0;
if (end) dir = end;` as the last lines inside the `dy > 40 && Math.abs(dx) < 120 && this.way !== 0` block (after the dropOff line);
fix B off = in downEnd `let lo = p.x, hi = p.x;`. `python3 probes/compare.py head.jsonl off.jsonl` lists every row that differs: a fix
that moves no row comes OUT; one that does gets a toy on that row. (3) x40: the head's 1-20 (every bot) + 21-40, tally with
`python3 probes/tally.py`; trace two per cause. (4) Stills (draftshoot.mjs on t-eng-w3: e262fca80, 1f37e4473): normal 6's turn
(vine x1088 9895->10068, its catch 996-1280 @10068, its storey 857-1108 @10246; the dip's own catch 701-881 @10138), upright and
sideways. (5) lockall (no listed stage moves: the change reads only climb vines going down; up towers pass no vines to it, so it is
inert there, still to be PROVEN by lockall), tierBots 9/9, suite + CI line, land on t-eng-w3 (merge, no force).
**For READY-31 (stands):** kid clean runs 101-125 s, at or under the 120 s floor: 3-1's build owes length (head row: kid normal
seed 2 clean at 101.4 s).
Start 10:49 AM ET 11-25; REPORT written 11:11 AM ET (by `date`).

### Box 5's hand-over (superseded by box 6)
**EXACT NEXT STEP (box 5 hand-over):** head **e7c203362** (pushed; code = this head; the REPORT commit sits on it). Ruling 1 (LAY finding 2) is HALF done: the verdict is right and
planted; the lay meets only its first landing. On this head the w3.test 'a catch hands on to its storey' is **RED BY DESIGN** (the
planted verdict: on this head it names **5 turns on 5 of 48 rolls: normal 5, 6, 7, 8, 23**, none wall to wall, down from 69 on 33). (1) **The lay for the chain case** (tower.ts towerCatches, going down): on 2abf6faf1 normal 1's catch
581-1280 @11711 (vine x1124) handed him off its left end onto 11825 (wood over the storey but beside it), then on to 12062, past its
storey 729-1144 @11889 (32bf092b0's lay clears that roll; the same shape is left on normal 5, 6, 7, 8, 23: read their names with
probes/errs.mts SEEDS=5,6,7,8,23). **All five share one shape:** the catch at the storey - 178, its first landing wood at the
storey - 64 (114 under the catch) beside the storey, then on past it (normal 6: 691-1280 @10068, vine x1088, onto 10182, storey
@10246). **Normal 6 read (probes/tail.mts SEED=6 Y=10250, e7c203362):** storey above 404-634 + 757-1062 @9895 with a dip
634-757 @9965; vine x1088 9895->10246, stopped on the catch run 691-996 + 996-1176 + 1176-1280 @10068; its storey is only 857-1108
@10246, all under the run. 996-1176 is the vine end's own bough, 1176-1280 its run-on to the wall, and **691-996 is the catch for the
DIP's right end (x 781), laid level with the vine's catch so it merged into it**; the first-landing guard let it pass because its left
end (x 667) first lands on 470-700 @10182 (over the storey, beside it). The storey itself is 76 px from x 781 and 281 px under the dip
(within TOWER.see): (b) below, a rule-2 bridge of the STOREY out under the dip's end, is the likely lay; find why rule 2 did not take
it (anchor order, overGap, fair) before changing anything. The first-landing guard (`passes`, 32bf092b0's, kept) cannot see past the first landing; guarding the WHOLE chain on every put (box 5's
v2, `handOn(...).state === 'past'` turned on by a put) left open ends: blind drops on 37 of 48 rolls, so it was taken out. Try next,
measuring each on 48 rolls (probes/handon2.mts for misses, probes/rollhash.mts vs scratch hash of 2abf6faf1 for touched + errors,
probes/errs.mts for the names): (a) rule 4 going down, for a bough that will cross a climb vine (the catch) or lie under a catch's
end, try its candidate (x, y) in an order that puts first those whose `handOn` (tower.ts, exported; most = TOWER.see) reads 'ok', then
'open', never 'past'; (b) rule 2 prefers the storey under a catch's end as the anchor (bridged out at the storey's height) over other
wood. Read normal 1 with probes/tail.mts SEED=1 Y=11800 first: which rule laid 11825 and why. GREEN = handon2 0 on 48, errors 0,
head room + 'a catch crosses a vine' GREEN; then count the rolls touched vs 2abf6faf1 (32bf092b0's lay touched 42 of 48).
(2) Ruling 2 on the FINAL lay: castBots `--seeds 1-20 --json` on three frozen trees (the head, fix A off, fix B off; the patches are
in the box 4 step below; probes/compare.py head.jsonl off.jsonl lists every row that differs). Two heavy runs at a time. A fix that
moves no row comes OUT; one that does gets a toy on that row. (3) x40 on the head (the head's 1-20 from (2) is its first half),
trace two per cause. (4) Stills (draftshoot.mjs pins by fractions only: add spots, e.g. an env of x:y pairs, to pin him on a turn's
vine top and on its catch). (5) lockall, tierBots 9/9, suite + CI line, land on t-eng-w3 (merge, no force).
**For READY-31 (stands):** kid clean runs 101-125 s, at or under the 120 s floor: 3-1's build owes length.
Start 10:29 AM ET 11-25; REPORT pushed 10:47 AM ET (by `date`).

### Box 4's hand-over (superseded by box 5)
**EXACT NEXT STEP (box 4 hand-over):** head **6b6874dfb** (pushed; code = this head). Rulings 1-4 from the lead's packet stand.
(1) **castBots x40, both settings, every bot, on 6b6874dfb**: frozen worktree (`git worktree add --detach`, symlink node_modules,
`chattr -R +i src tools`), two halves as two background tool calls (`GEN2_DRAFT=3-1 npx tsx tools/inspect/castBots.ts --stage 3-1
--seeds 1-20 --json > a.jsonl`, then 21-40; NO shell '&'), ~12 min; tally `python3 probes/tally.py rows...`; compare with
rows/castbots-0cee60a4d-partial.jsonl (kid N 17/40 clean) and the probe below (kid N seeds 1-6: 3 clean, R 0/0/3/0/1/1).
(2) **Owed toys for 3ba82c8b8 on a REAL row (ruling 2), still owed**: A = downEnd called whenever the way on is below (dy > 40), not
only close across; B = its wood run seeded from the wood under his feet. Method: two scratch trees from the head, one fix off each
(A: move the call back inside the `dy > 40 && |dx| < 120 && this.way` block as `p.grounded ? this.downEnd(p) : 0`; B: `let lo = p.x,
hi = p.x`), `probes/multi.mts` (TREE= BOTS=kid:normal,adult:normal SEEDS=1-10) on each and on the head; pick a row where the fix
removes a rescue at a named spot; the toy runs that real row (readyDraft('3-1'), firstTimer, as probes/multi.mts) and asserts no
rescue within 120 px of the spot; RED with the fix off, GREEN on. (On 34085ae19 alone fix A off read kid N seed 1 R9 vs R7 on:
not a bite worth a toy; the route was broken there, so re-measure on 6b6874dfb.) **Measured on 6b6874dfb (box 4's last minutes):
kid N seeds 1-6 with A off and with B off read IDENTICAL to the head, to the tenth of a second (1-6: R 0/0/3/0/1/1, 124.8/115.4/
167.4/135.5/124.0/129.9 s): on the stopped-vine lay neither fix bites on those rows.** Next: the same A-off / B-off / head compare on
kid + adult, both settings, seeds 1-20 (three runs: count them against the two-heavy-runs cap); a fix that bites on NO real row gets
no toy and comes OUT (ruling 2: no fix lands without its toy; level.md 21/23), named in the REPORT.
(3) **LAY finding 2 to the lead** (below): measure it first (per turn whose vine stops on a catch: does the catch's way off land on
the turn's own storey? count rolls, seeds 1-24 x both; `probes/tail.mts` SEED= Y= prints legs, turns, vines, corners, wood).
(4) **Stills of one turn, before (3ba82c8b8) and after (6b6874dfb), upright + sideways** (ruling 1; the lead judges): ENG-W3a's
harness draftshoot.mjs was never committed: a still harness for the draft is owed (vite + tools/engine/runs/stills-at.mjs need the
game to build the draft; find how ENG-W3a did it or ask the lead). Rule 29: shoot on the head going to the lead.
(5) Trace the stalls left after (1), two per cause: kid N seed 3 (389,5811) 'the way on is 136 px down' (the known one), seed 6
(491,5929) 'a 15 px waist-high step ahead, a drop of 123 px', seed 5 (1086,8407) 'in a dip 174 px deep'. Fix where the cause is,
a toy each way. (6) lockall vs c1008d8ed (102/102; no listed stage travels down: only the 3-1 draft has travel 'down'), tierBots
9/9, the suite + the CI tool line on the final head; LAND on t-eng-w3 (merge, no force).
**For READY-31:** kid N seed 2 clean at 115.4 s and seed 1 at 124.8 s (probe, 6b6874dfb): runs still at or under the 120 s floor:
3-1's build owes length (design, not the bots).
Start 10:10 AM ET 11-25; hand-over 10:26 AM ET (by `date`).

## Box 6 (session 4, 11-25), on t-eng-w3-wip-downbot from 7f2c60135 (code e7c203362)
- **Why rule 2 did not bridge normal 6's storey (traced, e7c203362):** the hand-over's guess (the storey's bridge refused, rule 2 to
  blame) was half right. The dip 634-757 @9965 has two open ends in the same pass. Its LEFT end (x 610) went first and bridged the
  shelf 290-470 @10182 out to 470-700 @10182. Its RIGHT end (x 781) then tried, nearest first: the storey 857-1108 @10246 as 691-857:
  **refused twice over**, overGap (the section's own hop at the storey's height: a bridge would close it) and no head room (9 px of it
  under the new shelf, 64 px over it); the shelf as 700-871 @10182: no head room (14 px over the storey's left end); then the
  **vine's own catch 996-1176 @10068 as 691-996: fair**, and `passes` let it through because its first landing (667 onto 470-700
  @10182) is over the storey. That is the merged catch: a rule-2 bridge ONTO a stopped vine's catch, not rule 4. Trimming the storey's
  bridge was tried first and is wrong (overGap still refuses it; trimmed bridges laid where full ones failed moved 24 rolls and named
  16 misses on 14): not kept.
- **The lay (7d12c344b): going down, rule 2 never takes a stopped vine's catch (wood across a climb vine between its top and foot) as
  its anchor.** A bridge to it IS that catch run on. The dip's end now falls to rule 4, a bough of its own: normal 6 lays 701-881
  @10138 under the dip's end (108 px over the storey, room kept), and the vine's catch 996-1280 @10068 drops him off its left end
  onto its storey 857-1108 @10246. Normal 1 (the lead's named row): the catch 1032-1280 @11711, off its left end onto the storey
  729-1144 @11889 (handon2: 0 on n1). Planted toy, tower.test "towerCatches going down never bridges a dip's end onto a stopped vine's
  catch" (normal 6's shape 9,000 px up): RED on e7c203362 (it lays 691-996 @1068, the real piece), GREEN on 7d12c344b.
- **Measured on 7d12c344b, drafted 3-1 seeds 1-24 x both (48 rolls):** probes/handon2.mts **0 misses (0 wall to wall)** (was 5 on
  e7c203362, 69 on 2abf6faf1); probes/rollhash.mts **errors 0 on 48** (e7c203362 had 1 each on normal AND easy 5, 6, 7, 8, 23: 10
  rolls, the hand-over's "5 of 48" counted only normal); probes/headroom.mts **0 squeezed pairs on 0/48, 0 refused**; 'a catch crosses
  a vine' is in the roll's errors (pipeline.ts towerVineCuts), so GREEN with them. w3.test **10/10 PASS** (its 'a catch hands on to
  its storey' was red by design; now green); tower.test **35/35 PASS**; tsc PASS. **Every one of the 48 rolls moves** (vs e7c203362
  and vs 2abf6faf1): a vine's catch was a bridge anchor on every roll. 3-1 is a draft (not listed); lockall to prove no listed stage
  moves is owed (5).
- **Ruling 2, started:** frozen trees of 7d12c344b (head, every bot) and fix A off (kid, adult), seeds 1-20. **Rows on 7d12c344b (committed, rows/castbots-7d12c344b-1-20.jsonl every bot; -Aoff- and -Boff-kidadult-1-20.jsonl):** BOTH fixes BITE, so both STAY; each owes its toy on a real row. **Fix A** (downEnd whenever the way on is below): 23 of 80 kid/adult rows differ; the head has 3 more clean rows and 3 fewer rescues (164 vs 167); its rows: **kid normal 13** (head R0 100.9 s; A off R1 129.9 s, 'in a dip 108 px deep' at x 713), adult normal 10 (R0 vs R1, 'the way on is 214 px down' at x 1180), adult normal 13 (R0 vs R1). **Fix B** (the run seeded from the wood under his feet): 6 of 80 differ; normal rescues 37 vs 42; its rows: **adult normal 13** (head R0 113.8 s; B off R2 155.2 s, 'in a dip 108 px deep' at x 713, then a drop of 108 px at x 729), adult normal 11 (R1 vs R3), kid normal 8 (R1 vs R2). Next: build each toy from its row's shape (seed 13 normal near x 713 serves both: read it with probes/tail.mts SEED=13 and the row's stuck spots), red with the fix off, green on the head (castBots.test 'a way down' arenas). **The head's every-bot 1-20 (first half of x40):** 180 rows; rescues kid N 20, kid E 53, adult N 17, adult E 74, child N 37, child E 42, middle N 38, middle E 78, expert N 51; clean-pass kid N 5/20, adult N 6/20; 4 rows never reach the shrine (child normal 2, middle normal 1, expert normal 1); top causes 'in a dip, the way on is N px down' 189, 'in a dip, a drop ahead, the way on down' 112, 'the way on is N px down' 81, 'in a dip' 75. Ruling 3 runs seeds 21-40 next and traces these.
- **Lessons applied:** session 3's (a new verdict's named row checked by name: normal 1 and normal 6 read with tail.mts); D134 (pushed
  and `git ls-remote` before the message); D115 (chattr-frozen trees); D128 (stamps from `date`); D137 (the box clock: handed over
  at the 28-minute clock with every row committed).
- **Known limit (named, not hidden):** `isCatch` reads the anchor piece itself (wood across the vine), not its whole level run; a bridge onto a catch's run-on piece is still guarded only by `passes` (first landing). handon2 reads 0 on 48, so no roll shows it today.
- **Probe added:** probes/errs2.mts (errs.mts with SET=easy|normal).

## Box 5 (session 3, 11-25), on t-eng-w3-wip-downbot from 2abf6faf1 (code 6b6874dfb)
- **Ruling 1, LAY finding 2: the verdict 'a catch hands on to its storey'** (tower.ts `towerHandOns` + `handOn`, joined to the tower
  verdicts on down columns in pipeline.ts): per going-down turn whose vine stops on a catch, stepping off the catch's run (wood level
  with it, end to end), and on off each run he lands on, he comes down at the storey's height before landing below it; named
  otherwise ('hands him past its storey', or 'it runs wall to wall: no way off'). Unit: tower.test 'towerHandOns' (kept as laid; run
  on past both ends of its storey named; onto wood over the storey then past it named, then onto it kept; wall to wall named; no
  catch, or a turn going up, not judged). **RED on today's rolls (2abf6faf1): 69 turns on 33 of 48 rolls (seeds 1-24 x both), 11 of
  them wall to wall** (a catch across the whole tower: no way off at all), the lead's named case (normal 1, 581-1280 @11711) among
  them (probes/handon2.mts with VTREE; probes/handon.mts reads the same 69).
- **My miss, caught and fixed in this box:** the first verdict (32bf092b0) counted ANY landing at or above the storey as handing on;
  the lead's named case lands at 11825 (over the storey, beside it) and goes on to 12062, so it passed. Caught by running the named
  case through it before reporting; the verdict now follows the drops (5bd918172). Standard: a verdict's planted case is the lead's
  named row, checked by name, not only a count.
- **The lay, first landing (32bf092b0, kept):** towerCatches going down never lays wood level with the wood across a climb vine, run
  on with it, that leaves that run with no end landing on the vine's storey or above (rules 1, 2 and 4: `passes`). On its own it
  cleared the first-landing reading (0 on 48), kept head room (no blind drop, 24 x both) and 'a catch crosses a vine' (12 x both)
  GREEN, 0 errors on 48 rolls, and touched **42 of 48 rolls** (probes/rollhash.mts, wood + vines per roll, vs 2abf6faf1). The
  narrower form the finding named ((b): rules 1-2 only) left 2 wall-to-wall catches and 4 rolls with errors, still touching 42: the
  catch's own bough (rule 4) chains into the run too; not kept.
- **The chain guard tried and taken out (box 5 v2):** refusing every put that turns a vine's catch to 'past' (the whole chain) left
  38 misses on 24 rolls and errors on 37 of 48 (normal 1: a 351 px blind drop off 581-1032 @11711): with no fair spot left, the end
  is left open. Not a fix; the next box lays the chain case (EXACT NEXT STEP (1)).
- **On this head (first-landing lay + chain verdict):** the verdict names 5 turns on 5 of 48 rolls (normal 5, 6, 7, 8, 23; none
  wall to wall): RED by design until the chain case is laid (EXACT NEXT STEP (1)). tsc PASS; tower.test full 34/34 PASS.
- **Heavy runs this box:** castBots 1-20 on 32bf092b0 and on fix A off were started and STOPPED unread when the chain miss was found
  (they measured a lay that was about to change); none of their rows are used.

## Box 4 (11-25), on t-eng-w3-wip-downbot from 2a8d89ec2 (code 3ba82c8b8)
- **Ruling 1 (b), the lay, 34085ae19:** tower.ts `vineCuts`/`stopVines`/`towerVineCuts`; pipeline: after clearClimbs, on a down
  tower (or a down leg's frame), each climb vine stops on the highest solid wood across it (6 px in from its ends, 10 px clear of the
  vine's top and foot); the verdict **'a catch crosses a vine'** joins towerMiss on down columns. **RED on today's rolls:** w3.test 'a
  catch crosses a vine' (12 rolls x both) failed on normal 1 with 7+ named cuts (e.g. 987-1167 @753 across the vine at 1079, 580-927);
  the probe on the parent read 113 cuts on 12 of 12 rolls (seeds 1-6 x both), every catch 173 px under the turn's top, 180 px wide.
  **GREEN after:** the same test (no cut, no blind drop, every climb vine over the floor ends ON wood); tower.test 'stopVines and
  towerVineCuts' (a planted shelf across a vine is named; wood it hangs from or ends on is not; a liana is not; the stop lands on the
  highest wood). tsc PASS. The catch's own ends hand on within TOWER.see by towerFalls (every end in a down column, unchanged).
- **The lay alone made the bots WORSE (34085ae19, partial x40, 66 rows, rows/castbots-34085ae19-partial.jsonl):** kid N 0/40 clean,
  295 rescues, 1 stranded; kid E 0/26, 234. Cause (traced, two seeds): the bots' way down (towerRoute.ts) ran on down the vine's old
  line through the catch; on the catch every bot turned, 'the way on is 84 px down'. Run stopped (no use measuring the rest).
- **Route fix 1, 54d493301:** a turn vine that stops over the storey on is followed to its foot, then dropTo toward the leg's exit.
  Toy castBots.test 'drops ledge by ledge' part (4): RED without ('the way never goes down the vine onto the catch'), GREEN with.
  Probe kid N seeds 1-6: 2 clean; seed 1 STRANDED on the last catch.
- **Route fix 2, 6b6874dfb:** (a) dropTo takes the other end when nothing lies under the near one (seed 1's last catch 615-1256
  @12062 ran on into the wall by the shrine: the near end had no landing, the way slanted through the catch; stranded). (b) seed 1 N
  then read 'the way on is 132 px up': the catch at 11711 (581-1280) lies over ALL of its storey (729-1144 @11889), so off its end he
  lands past that storey (11825, then 12062) and the way pointed back up to the storey's leg. The route now passes a leg whose storey
  lies over where the drop landed. Toy part (5): RED with the pass off ('the way climbs back to the storey he dropped past'), GREEN
  on. All 4 way-down toys GREEN. **Probe kid N seeds 1-6 (work tree = 6b6874dfb, not frozen): seeds 1, 2, 4 clean (124.8, 115.4,
  135.5 s); seed 3 R3, 5 R1, 6 R1.**
- **LAY finding 2 for the lead (not changed; measure first, step 3):** with the vine stopped, a turn's catch can lie over ALL of the
  storey the vine led to (seed 1 N above: the rule-4 bough plus its run-ons 581-1280), so the catch hands on within 300 but PAST its
  storey: that storey's leg (its beat) is skipped. Options: (a) the verdict 'a catch hands on to its storey' (the drop off a stopped
  vine's catch lands on the turn's storey) with the lay trying another catch spot first; (b) a stopped vine's catch is never run on
  over its storey (rules 1-2 skip it). Recommend (a)+(b): the verdict first (RED), then the lay.
- **Mistakes (this box):** (1) I launched the first x40 halves with a shell '&' inside one command, against the brief ('NEVER a shell
  &'); caught at once, both killed, relaunched as two background tool calls; nothing was read from the bad runs. Standard: launch
  every parallel run as its own background tool call (the brief's rule; no new rule needed, it was mine to keep). (2) The seeds 1-6
  probe on 6b6874dfb ran from the work tree while I took towerRoute.ts's pass out for the RED check (D115's pattern): the module had
  loaded before the edit, but its numbers are a probe only; (1) above re-measures on a frozen tree.

### Box 3's hand-over (superseded by box 4)
**EXACT NEXT STEP (box 3 hand-over):** head **3ba82c8b8** (pushed). (1) Toys OWED for 3ba82c8b8's two changes (firsttimer.ts
downEnd: applied whenever the way on is below him, not only close across; its wood run seeded from under his feet, not his middle):
each needs a downArena toy RED with that one change off. My lip arena (wood 600-1500 @500 to the wall, route under it then out past
the left end) PASSED with both off, so it proves nothing and was not committed; seed 6's real case: on 1056-1280 @3398 the progress
point stayed at (1110,3712) under his wood (he is 314 px over it, so Progress does not advance) — build the arena so cur stays under
his wood. (2) castBots x40 on 3ba82c8b8 (frozen tree, two halves, --json, background, ~12 min) vs 0cee60a4d's rows (partial, below)
and the baseline; tally: probes/tally.py. (3) Trace the next stalls, two seeds each, probes/stall.mts (`TREE= BOT= SET= SEED=
[FT_FRAMES=a,b] GEN2_DRAFT=3-1`): kid N seed 6 @(493,5929) 'a 15 px waist-high step ahead, a drop of 123 px ahead' (the known
'near-level catch at a step-off'), seed 3 @(372,5811) 'the way on is 136 px down'. (4) The LAY finding below to the lead. (5) lockall
vs c1008d8ed (102/102), tierBots 9/9, suite + CI tool line on the final head; land on t-eng-w3 (merge, no force).
**Stage length flag for 3-1's READY:** with the bots cleaner the kid's fastest clean run is 101 s (Normal), under the 120 s run floor
(castBots stageFloor: 3-1 reads as a run, 120 s; a way down is not a climb): 3-1's build owes length (design), not the bots.
Start 9:45 AM ET 11-25; hand-over 10:08 AM ET (by `date`).

## Box 3 (11-25), on t-eng-w3-wip-downbot (from t-eng-w3-wip-b 007bd2ca8, the paused box 2: the head-room lay + two toys)
- **Baseline, castBots x40 both settings on 007bd2ca8 (360 rows, rows/castbots-007bd2ca8.jsonl):** 360/360 reach the shrine, only 7/360
  clean (no rescue); 1,358 rescues. Stalls: 996 'in a dip N px deep, the way on is N px down', 354 'the way on is N px down'.
- **Cause 1 (route, towerRoute.ts):** going down, the route ran a slant from a leg's exit straight to the turn vine's foot when the lay
  had run that storey's wood on past the exit toward the vine: the way pointed under the wood he stood on (kid N seed 1 @7758:
  exit 737, wood on to 1210, vine 1236; seed 1 @10604 the same). Fix: walk the run of wood to its end by the vine first (runOf, shared
  with dropTo). Toy 'drops ledge by ledge' part (3): RED without (the slant 700->1030 under 700-1000), GREEN with. kid N seed 1: 2 -> 0
  rescues (7133509b).
- **Cause 2 (bot skill, firsttimer.ts downEnd):** on wood that lies OVER the way on (a catch under a turn's end, run on across the
  storey: seed 6 329-1026 @3284 over 397-622 @3462; seed 8 282-975 @3253 over 350-568 @3431) the first route point under him was
  straight under, downEnd gave 0 and he turned on the spot till rescued. Fix: step toward the first point of the way on that lies past
  his run of wood's ends. Toy 'on wood over the way on, he walks off its end where the way comes out' 7 bots x 3: RED 21/21 never left
  the wood without; GREEN 21/21 with (992908c1d). **That head made kid Normal WORSE** (c2, 26 rows: 79 rescues vs 20 on seeds 1-12's
  baseline): a turn vine whose top stands ON his wall-to-wall wood (seed 1 @11257, vine x 56 on 0-82) read as 'under his wood', so he
  went for the far end and turned: 'the way on is 93 px down'. Fix (0cee60a4d): a climb vine down from his wood's height is a way off
  it. Toy part 2 (the route on along the floor past the wood's far end): RED 21/21 on 992908c1d, GREEN on 0cee60a4d. c2's run stopped.
- **0cee60a4d, castBots x40 PARTIAL (166 of 360 rows, the run in this container; rows/castbots-0cee60a4d-partial.jsonl):** kid N
  17/40 clean, 36 rescues (baseline 5, 73); adult N 17/40, 34 (1, 100); kid E 9/40, 64 (0, 147); adult E 6/40, 78 (0, 161).
- **3ba82c8b8 (toys OWED):** seed 6 on 0cee60a4d went to and fro on the catch (downEnd only read close across; far across the route's
  x pulled him back) and then at the lip of 1056-1280 @3398 (his middle past the end: the run came out empty, the answer flipped).
  Both fixed: kid N seed 6 2 -> 1 rescues, seed 2 1 -> 0 (probe, work tree = 3ba82c8b8).
- **LAY finding for the lead (not changed):** going down, a turn's vine top stands at the end's fall line and its drop is 347-351 px
  (> TOWER.see 300), so towerCatches owes a catch under that end, and the catch (then run on by rules 1-2) lies ACROSS the vine:
  probes/vinecut.mts: 247 cuts on 24/24 rolls (seeds 1-12 x both). A vine through a shelf is a polish fault and the shelf covers the
  storey the vine leads to. Options: (a) down storeys <= 300 apart at a turn (no catch owed); (b) the vine stops at the catch, the
  catch hands on within 300; (c) the verdict counts a climb vine at the fall line as the catch (a rule change: the Designer's).
  Recommend (b) or (a); the bots now cope either way.

## Box 2 (11-23, paused by the lead; candidate t-eng-w3-wip-b 007bd2ca8)
- **STEP 0:** CI tool line (gates.yml rolled, 21 files) on FROZEN c1008d8ed: **228 tests, 227 pass, 0 fail, 1 todo** (the base's todo);
  ENG-W3a's '228, 0 fail' was measured on e8c21ef12, whose tools/engine draft files differ from c1008d8ed, so it was re-run.
- **Toys, castBots.test.ts (no stage's numbers), GREEN on the candidate, each RED in a fresh worktree with its skill off:**
  'a way down: the route turns straight down a turn vine, and drops ledge by ledge' (towerRoute.ts): turn skill off: RED 'a corner in
  the air at the vine level with the ledge'; dropTo off: RED 'the way drops through the ledge at y 900 from (100, 500) to (100, 1100)'.
  'he presses down onto it and climbs down to the storey on' (firsttimer.ts ~2828), 7 bots x 3 thumbs: GREEN 21/21; press off: RED,
  18 of 21 fell past the catch.

## Done so far (candidate on t-eng-w3-wip-b)
1. **Head room both ways going down (tower.ts towerCatches), general, every change gated on flow 'down':** (a) `cramped` keeps HEAD
   (84 px) over AND under a down bough or bridge (was: only its own 24 px body); (b) rule 4 slides a down bough along under the end
   (SLIDE: 60 px out past the fall line, 30 back) when the centred one is in the way at a height; (c) rule 2 tries each anchor in
   order going down (was: the nearest only); (d) rule 1 runs a down end on only into ITS OWN side's wall, head room kept (found here:
   a 60 px bridge's right end by the LEFT wall ran on to the RIGHT wall, a 1,196 px plank 70 px over a storey, easy 18).
   **Evidence (probe reference/qa-reports/ENG-W3/probes/headroom.mts, 24 seeds x both):** base c1008d8ed: 1,156 squeezed pairs on
   48/48 rolls, 0 refused; (a) alone: 1 pair, 7/48 refused for blind drops 301-382 px (ENG-W3a's finding reproduced); +(b): 1 pair,
   1 refused; +(c)(d): **0 pairs, 0 refused.**
2. **Planted tests, RED on base / GREEN here:** tower.test.ts 'towerCatches going down keeps his head room both ways' (3 plants, each
   RED alone on c1008d8ed: the bridge 70 px under a shelf, the band catch 60 px over the storey, the 84-1280 run-on); w3.test.ts 'head
   room on the way down' (24 raw rolls x both; RED on base: normal 1, 846-1099 @927 60 px under 987-1167 @867). tower.test 32/32,
   w3.test 8/8, tsc PASS.

# ENG-W3a REPORT (World 3's kit on gen2 + 3-1 drafted DOWN; WORLD-3-PLAN F1, lane 2)
**EXACT NEXT STEP (handed over at the context line, the lead's call):** (1) the lead rules the candidate on t-eng-w3-wip-a, then
land it on t-eng-w3 (not done here). (2) ENG-DOWNBOT (lane 2) starts from: `GEN2_DRAFT=3-1 npx tsx tools/inspect/castBots.ts --stage 3-1
--seeds 1-40 --par 3` (never run in full here); expert seeds 1-6: 3/2/2/3/3/1 rescues (17-21 before this job; seed 3 once 0 at 145.6 s);
stalls 'in a dip 287 px deep, the way on is ~120 px down' on a catch, a jump onto a near-level catch at a step-off. Its lay fix FIRST:
down needs HEAD room both ways (a rule-2 bridge 70 px under a shelf, seed 1 389-881 @6861 under @6791; a band catch ~60 px over the
storey laid after it, seed 2 238-418 @2314 under @2255); HEAD alone gives 7/48 blind drops of 301-313 px, so the catch search changes
with it. Start 11:27 AM ET (by `date`); ended ~12:45 PM ET, about 1.3 h of the 2 h budget.

## Done-items (lead's cut, 12:00 PM ET: bots-to-the-shrine becomes its own lane 2 job)
1. **w3.ts, World 3's kit on gen2:** W3_GROUND; W3_ART (bank, shelf, rock, glow, fern: World 3 inventory rows, in game, in scale);
   W3_CAST (predators/world3.ts ocelot + jaguar, Worlds 6-8 bodies); the way-down pool (ledge, step-off drops 110-150 px, shelf walk);
   listed.ts KITS 'w3' + World 3's own finish (never World 1's). generalitycheck PASS (26 known, none added).
2. **The general draft state (lead's ruling A):** stageTable.ts DRAFT_TABLE `'3-1': { kit: 'w3', travel: 'down' }`, no game path reads
   it; GEN2_DRAFT=<id> readies any draft in a tool (draft.ts/draftReady.ts), a page (draftBoot.ts), addlevel (DRAFT READY). The live
   3-1 (old section maker) and stagePlan.ts are untouched.
3. **Proof:** `GEN2_DRAFT=3-1 addlevel 3-1 --no-bots` (snap2): **DRAFT READY**: row resolves (travel down), rolls 24/24 Normal + 24/24
   Easy CLEAN (168-211 s), sheets met; OWED the bots; LISTING 5 (list, flown, routed, drawcheck, seeds) for 3-1's build. w3.test.ts 7/7 (the way down built by the game's own generateStage, raw rolls clean, last flag on 24 rolls,
   World 3's footing). **The plant:** travel back to 'right' turns 'the way DOWN' RED; planted-faults.py: 9/9 CAUGHT (incl. both
   down-flow fixes, the shadow lift, World 1's finish, art not in game, an animal socket).
4. **gen2's down flow, 2 defects the first down rows found (no listed stage travels down):** (a) tower.ts towerCatches going down: the
   catch band was a 10 px slot (287-296 px), blind drops 350-560 px on 11 of 12 rolls; now a head's room up to clear-HEAD, never
   squeezed. (b) the floor's walk to the shrine was off routeAt and never a flag spot: last flag 2045-2361 px out on 4 of 24; fixed.
5. **Bots (OWED, own job):** expert 17-21 rescues/run -> 1-3 (seed 3: 0, 145.6 s) via towerRoute.ts (a down tower's own route, drops
   ledge by ledge, turns straight down) and firsttimer.ts (step off toward the way down; press down onto a turn vine). Down-only.
6. **Gates:** main cdffdc627 base: suite 4042 (4039 pass, 0 fail, 3 todo), CI line 228 (227 pass, 0 fail, 1 todo). **Branch e8c21ef12 (src as
   landed): suite 4049 (4046 pass, 0 fail, 3 todo, the base's 3); CI line 228 (227 pass, 0 fail, 1 todo, the base's).** vite build,
   chunkcheck, artcheck PASS (1f37e4473).
   tsc PASS; generalitycheck PASS; knowncheck PASS; roadmapcheck FAILS on the container's shallow clone (fetch-depth), not the change.
   **lockall --layouts 16 --check vs main's lock: 102/102 stages unchanged (3,264 builds), exit 0: no listed stage moves.**

## Polish check (draftshoot.mjs, real game, 2x, seed 1 as the game BUILT it: travel down, flow down, 11,024 px top to floor)
- Upright reads as a way DOWN: the camera leads down, Pokey high in the frame, 3-4 shelves under him. Shelves are World 3's painted
  mossy slabs, 2.2-4 Pokeys wide, in scale. Sideways shows 2-3 storeys; the shelves read as stone, the backdrop is World 3's.
- ROUGH, named (not fixed here: the lay-fix job the lead split off): (1) many storeys run wall to wall (catches + run-ons), so WHERE to
  drop is not readable at a glance (3-1's glowworms are the design's answer, ENG-DARK); (2) a DOUBLE SHELF: going down, towerCatches'
  rule-2 bridge checks only its own body, so it runs 70 px under a shelf (seed 1: 389-881 @6861 under 389-767 @6791). HEAD room for
  down (the climb's rule) fixes it but leaves 7 of 48 rolls with blind drops of 301-313 px: the catch search must change with it.
- Stills: reference/qa-reports/ENG-W3/stills/ (3-1-{land,port}-{10,35,60,90}.webp, sheet-land/port.webp). Pokey stands on the
  shelves (the first shots pinned him 70 px over them: the harness, his y is his feet; fixed, reshot). The double shelf shows at
  land-60 / port-35 / port-60 (his head in the shelf over him). The shaft's sides show as the dark cave edge: no painted shaft wall
  yet (WORLD-3-PLAN §1 'MISSING: shaft walls, lit rims', W3-ART-1).

## Pushback
PUSHBACK.md (e6d3f1ef0): READY vs a draft row; stagePlan travel would flip the live 3-1. Ruled A (general draft state).

## Suggestions (ready packet): ENG-DOWNBOT (lane 2; serves 3-1, 4-7, 6-7, 8-6)
Objective: castBots on GEN2_DRAFT=3-1 seeds 1-40 both settings, every bot PASS with 0 rescues. Start: expert 1-3 rescues (seeds 1/2/4);
stalls 'in a dip 287 px deep, the way on is ~120 px down' (on a catch) and a jump onto a near-level catch at a step-off. Lay fix first:
a band catch can sit ~60 px over the storey laid after it (seed 2: 238-418 @2314 under the 2255 row), and a rule-2 bridge runs 70 px under
a shelf (seed 1 @6791/@6861): down needs HEAD room both ways (tried: 7/48 blind drops 301-313 px follow), storeyLimit must clear catches.
Files: tower.ts, pipeline.ts (lay), towerRoute.ts, firsttimer.ts. Done: the plant (a catch 60 px over a storey) red; castBots 40/40.

## Unresolved
Bots-to-shrine 40 seeds (owed, above). The kit's shelf is the painted branch until W3-ART-1's stone shelves load (named, not rough art).

## Method update
level.md / gates.md: a verdict test judges RAW rolls (buildGen2Stage): the game's build rerolls a failing roll and hides the fault.
## Turnover note
reference/handoffs/engine-core.md §0zr-W3a (this commit). Lessons applied: D40, D111, D113-D115, D117, D120, D122-D123, D126-D127.
