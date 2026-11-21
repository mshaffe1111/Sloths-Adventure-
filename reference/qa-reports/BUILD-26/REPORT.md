# ENG-26j (on t-build-26 from e420a2794): the lead's ruling (a): a gate section catches its own running exit; the lay adds nothing by a sealed piece. Started 4:23 PM ET 11-21 (by `date`)
Commits: ecb86074e (revert of b73600b56 + 97bb2b73e, one commit), 8e21145f1 (the fix and its plants), this REPORT. Step 1 DONE and
measured (the lead accepted it); **the speed-ups PROVEN EXACT and on the branch** (d12ffcacf, the pick of 91e6c584e); the relist and after NOT started (the
28-minute box, D111). Saved: eng26j/ (gates.mts: each gate's step and run off both ends on a built roll, and whose wood catches it;
near.mts: what lies within a hop of each gate; onto.mts: the lead's question, can wood within a hop of a gate be reached from under it; sweep-1-400-8e21145f1.json).

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND on frozen worktrees (D113)
## ENG-26k: step 4 of ENG-26j's packet, on this head (steps 1-3 done: the fix accepted by the lead; (b) NOT needed: the section catches
## every running exit, the yield is 400/400)
1. **The speed-ups are DONE (ENG-26j)**: `git cherry-pick 91e6c584e` onto 8e21145f1, then `lockall.ts --layouts 16 --out` WITHOUT
   (8e21145f1) and WITH (the pick) on frozen worktrees in parallel (~8 min each): **3,264 builds of 102 stages, 66,457 part hashes, 0
   differ** (eng26j/lock-8e21145f1.json.gz, the WITHOUT record). Picked onto the branch as d12ffcacf (its src/tools identical to the tested
   tree; tsc clean). Nothing to do but use them: the relist and CI's check now run with them.
2. **1-4 relisted ONCE** (methods/seed-list.md): the old list is seeds 1-100 and **all 100 build clean on both settings on this head**
   (eng26j/sweep-1-400-8e21145f1.json), so the survivors in their old order are 1-100 and no new seed is needed: `seedlist.ts 1-4
   --merge <the four parts or the saved sweep> --in-order --count 100` (n 100) re-lays them and writes the list with the new plans (each
   gate's foot is 106-134 px longer at each end, so every 1-4 layout moves). `seedlist.ts 1-4 --check` FAILS on this head until then
   (measured on 8e21145f1: the verdicts refuse 0 of 100 listed seeds; 7 seeds' replays differ from their search on both settings,
   seeds 8, 18, 22, 31, 54, 59, 66: "rebuild the list"; the other 93 replay as they search). Then every test pinning a 1-4 roll (D29; `grep -rln "'1-4'" src tools --include=*.test.ts`:
   20 files) and the FULL suite, re-pinned once on the final list (rule 20).
3. **Then as the packet**: the phone's load speed of the listed 1-4 and 2-6 seeds (eng26h/tools/loadtime.mts base e420a2794 vs head;
   `BUILDCHECK_STAGE=1-4` / `2-6` buildcheck), CI's `seedlist.ts 1-4 --check` timed against its 45-minute limit (D99); stills of 1-4
   layout 1 before (e420a2794) and after at a gate, 2x, 390x844 and 844x390 (eng26h/tools/pin.mjs): judge the longer foot under the gate
   reads as the field's own ground, not a shelf; castBots 1-4 seeds 1-40 both settings base vs head (rule 28), tierBots 1-1, qaW123,
   generality, THE FULL SET (gates.md), lockall (only 1-4 and 2-6 may move), engine-core.md's tower lines (a sealed piece's own wood
   catches its full-speed run: gateRun). Then BUILD-26c runs 2-6's bots.

## Step 1: the gate section catches its own running exit (ruling (a))
- **Cause, measured** (landFlights' walk, the flight towerFalls / walkOff fly, frame by frame): a run off a gate's end at full speed is
  **164 px out at the frame he lands 360 px down, 173 px at 400, 191 px at 440** (the same on Normal and Easy; 8e21145f1's commit
  message says 164-183: 183 is the frame BEFORE he reaches 440, the code takes the landing frame). A gate field's foot ran
  out `GATE_RUN = GAP` = 80 px past its gate. So every gate's run came down past its own foot: where other wood was under the arc it was
  caught by that (most gates), where there was none (the foot's tip at the tower's wall, the turn's vine hanging from it) it fell 641-721
  px and the roll was refused. Not the lay: the section's own wood was simply too short for the run.
- **Fix** (w1Arc14.ts `gateRun(H)`, replacing `GATE_RUN`): the foot runs out, at each end, the flown run at the frame he lands H px down
  (the larger of the two settings) plus half his body (22 px), never under one vine spacing: **H 360 -> 186 px, 400 -> 195, 440 -> 214** (computed by gateRun on 8e21145f1).
  So both feet land on the foot, never its lip. The foot is still walked onto, never landed on (`landing: false`: Easy's widening rules
  unchanged, so Easy never pulls its vines out of two hands' reach); its vines stay 80 apart under the gate.
- **The lay adds nothing by a sealed piece** (ecb86074e reverts the lay's gate-run catch, 97bb2b73e, and its proof, b73600b56, together).
  tower.test.ts' 'towerCatches leaves a gate alone' (kept) and the new toy plant both check it.
- **Found on the way and fixed (rule 22's "every place the pattern lives")**: `w1-14-drop-one` hand-sized its foot (520 px) for a
  run-out of 0, and scaled field()'s vines to fit. Since GATE_RUN = 80 that put its four vines **55 px apart** (the design's 70-90) and
  left its gate's run-out at 80 / 80 by coincidence. Rebuilt on field()'s own layout (vines 80 apart, gateRun at both ends), the snake
  150 px past the figs' vine as before (within TRAP.scare 170), the foot run on further only if the snake's spot needs it (it does not).
- **Planted** (w1Arc14.test.ts, three tests): (1) the toy (1-4 seed 2's first refused gate: 646-1086 @1000, the foot 400 px down, a vine
  hanging from its tip to the storey under, out to the wall): the lay lays nothing by the gate with either foot; with the old 80 px foot
  the run is named by towerFalls and comes down past it; with gateRun(400) towerFalls is clean and both runs land on the gate's own foot,
  both feet on it; (2) every gate field's foot runs gateRun(H) past its gate at each end, and gateRun covers the flown run on both
  settings; (3) **1-4 seed 2 builds on both settings, errors []**, and each gate's run, flown against the gate and its foot ALONE, lands on
  its foot (the section's own wood catches it), and on the stage as laid within TOWER.fall. **RED**: with gateRun = GAP the three fail
  (9/12); on e420a2794 seed 2 is refused (4 running walk-offs Normal, 8 Easy; eng26j/gates.mts). **GREEN**: 12/12; seed 2 Normal builds
  in 0.7 s against 3.9 s on e420a2794 (no rerolls).
- **Every tower (rule 22)**: the only other sealed piece in any world is toyTower.ts' gateKit (tests only, not shipped); its built-tower
  test ('a sealed piece (a gate bough) in a built tower') runs its runs through towerFalls in the build (errors [] on every seed; 32/32 on 8e21145f1).
- **Measured harmless (the lead asked: can it be reached without the gate's finish?)**: on seed 2 (head) wood lies within a hop under
  three gates' level: a 180 px bough of the storey above **39 px under one end and 28 px beside it** (gates at y 2300 and 3342) and a row
  99 px under the gate at 7214 (11 pieces Normal, 9 Easy). From each, a hop onto the gate is possible. But **nothing reaches any of them
  from under** (eng26j/onto.mts: no lower wood within tower.ts `leaps`, generous: a double, a fall included, rise to 220 px; no vine top
  within a hop), and each gate's own foot is 360-440 px under it. The only way onto that wood is a drop from the storey above, which is
  past the gate. So no way ON to judge, and towerGates is not changed (the lead: harmless if only from past the gate).

## Measures
| what | result | where |
|---|---|---|
| 1-4 yield, seeds 1-400 | **400 kept of 400 (100%)**, each worker 100 of 100 in 137-139 s (the reverted cure: 400 in ~500 s under load; e420a2794's judge on 95cafaabc: 49, 12%). The old list (seeds 1-100): all 100 kept | eng26j/sweep-1-400-8e21145f1.json |
| 2-6's list | **PASS** (100 seeds, each clean on both settings) | seedlist.ts 2-6 --check on 8e21145f1 |
| tower.test.ts on 8e21145f1 | **32/32** (33 with the cure, less its plant, reverted with it); fieldGate.test.ts + vineFeel.test.ts 26/26 | |
| w1Arc14.test.ts | RED 9/12 (gateRun = GAP), GREEN 12/12 | |
| tsc | clean | |
| generality | PASS (26 literals, 26 known) | |
| knowncheck | PASS | |
| the speed-ups' lock (91e6c584e) | WITH vs WITHOUT: 3,264 builds, 66,457 part hashes, **0 differ**; tsc clean on d12ffcacf | eng26j/lock-8e21145f1.json.gz |
| seedlist 1-4 --check on 8e21145f1 | FAIL as expected: verdicts refuse 0 of 100; seeds 8, 18, 22, 31, 54, 59, 66 replay differently from their search (rebuild the list) | |
| roadmapcheck | FAIL on this shallow clone only ("proofs cannot be checked (fetch-depth 0)"): ROADMAP not touched | |

## Lessons applied
D111 (the box from `date`, handed over with the EXACT NEXT STEP), D113 (no foreground waits: the sweep and suites in the background, the
REPORT written meanwhile), D102 (read lean), D40 (the lay's catch reverted before the fix, nothing patched that is replaced), D57/D87
(ReadNotifications at every step and push), D109 (no clock times to the lead), D112 (the invariant, a sealed piece's ends caught by its
own section's wood, named and tested: plant 3 flies each gate's run against its own wood alone).

## Learned (for level.md, the lead decides)
- A section that owns its own catches must size them from the FLOWN exit at full speed, not a spacing: proposed rule, "a sealed piece's
  own wood under it runs out at least the flown full-speed run off its ends plus half his body", checked by plant 3's flight against the
  section's own wood alone (a check, not a number in a comment).
- A piece that rewrites field()'s output by hand must be rebuilt when field() grows (drop-one sat on GATE_RUN for days with vines 55 px
  apart): world code should extend a builder's numbers, never re-derive them.

# ENG-26i (on t-build-26 from deaaf3a7c): the walk-off judge REPAIRS a gate's run instead of refusing it; the lead's gate proof added. Started 3:55 PM ET 11-21 (by `date`)
Commits: 97bb2b73e (the cure and its plant), b73600b56 (the lead's proof: towerGateCatches), this REPORT. Steps 2-4 NOT started
(the 28-minute box, D111). Saved: eng26i/ (the cure's sweep; why2.mts prints each catch rule's verdict per end, with the
`__tcWhy` lines of 97bb2b73e's debug, re-added by hand; plant.mts lays the plant). **The head refuses 1-4 seed 2 again** (the proof); the lead has the numbers and three options.

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the background on frozen worktrees.
## ENG-26j: THE LEAD'S RULING IS (a) (it reached ENG-26i's queue during a foreground wait and was read about 5 min late: D87 repeated)
0. **(a), not (c)**: a catch the gate's own foot can jump to is a stepping stone from the foot to the gate that skips the vine climb the
   gate section exists for; a gate must be a gate. types.ts already promises it for a sealed piece: "its open ends are caught by its own
   section's wood under them, or the roll is refused by name". The running walk-off judge showed that the section's own wood does not
   catch a FULL-SPEED exit. So:
   - **The lay adds nothing by a sealed piece again**: revert the lay-catch path for gates with its proof (`git revert --no-edit
     b73600b56 97bb2b73e`, keeping 97bb2b73e's plant re-cast as a test that the lay lays nothing by a sealed piece, its run's fall named).
   - **The fix goes in the gate section** (w1Arc14's field with a gate): GATE_RUN or the foot's reach sized from the flown full-speed
     run-off, or the foot run on to the wall so the 10-46 px gap past the vine is gone, whichever the flights show (seed 2's four gates:
     the foot 400-440 px under the gate, the vine hanging from the foot's tip at the wall side, the run coming down at x 1259 / x 20).
     General (rule 22), planted (RED on this head: seed 2 refused; GREEN: its four gates' runs land on the gate's own wood).
   - **Measure** 1-4's yield on seeds 1-400 with it (before 49, the reverted cure 400) and keep 2-6's list at 100/100.
   - **Only if the section cannot catch a running exit** (no room before the wall): try (b), ways ON judged by real flown jumps from wood
     UNDER the gate only (a drop from the storey above is already past the gate, not a bypass), and send the lead the numbers before any
     relist.
1. **Then** the yield and the 2-6 list on the ruled head, as in step 0.
2. **The three exact speed-ups**: `git cherry-pick 91e6c584e` onto the ruled head; lockall --layouts 16 --out on a frozen copy WITH them and
   one WITHOUT (the ruled head): every part hash of every build identical; any difference, drop the piece that made it.
3. **1-4 relisted ONCE** (methods/seed-list.md: old survivors in their order, then new seeds lowest first, --merge --in-order, n 100),
   every test pinning a 1-4 seed (D29), the full suite; then on a quiet machine: loadtime.mts base vs head for 1-4 and 2-6,
   `BUILDCHECK_STAGE=1-4` / `2-6` buildcheck, CI's `seedlist.ts 1-4 --check` timed against its 45-minute limit, and the lock's time.
4. **Stills** at 2x, upright 390x844 and sideways 844x390 (eng26h/tools/pin.mjs): 1-4 layout 1 before (4ea253b8c, seed 2:
   `storey1:1006:10984,walkoff:1070:8120,walkoff2:220:4208`) and after, pinned at a catch the cure laid (on seed 2, about 100 to 140 px
   under each gate's end, at the wall). Judge each: the catch must read as a bough he was meant to land on, not a shelf stuck to the
   wall. Then castBots 1-4 seeds 1-40 both settings base vs head, tierBots 1-1, qaW123, generality, the CI tool line (gates.md
   "THE FULL SET"), lockall (only 1-4 and 2-6 may move), engine-core.md's tower lines. Then BUILD-26c runs 2-6's bots.

## The cure (step 1)
- **Cause, measured** (a dump of towerCatches' inputs for 1-4 seed 2 Normal, every rule's verdict per end): all four refused ends
  (646-1086 @8120, 194-714 @4208, 670-1030 @3342, 196-716 @2300) are **shut gates** (sealed). The step off each lands on the storey
  400-440 px under it; the RUN off it comes down at the tower's wall (x 1259 / x 20), past that storey's tip. A vine hangs DOWN from
  that tip (its top at the storey's height, bottom 281 px under), so rule 2's bridge must start a hop past the vine, which is past the
  wall (spans 1256-1266, 14-24, 1210-1256, 16-24: under the 60 px floor). Rules 3 and 4 were barred for every sealed piece, so
  nothing was laid and the roll was refused. Not the arc, not the flights: one rule (`if (sealed(e.p)) continue`) shut both fallbacks.
- **Cure** (tower.ts towerCatches, every tower, rule 22): a sealed piece's RUNNING walk-off (its step already caught) may take rule 4,
  a 180 px bough of its own under where the arc comes down. It must pass every rule of a fair lay: not cramped, no storey climbed,
  out of `byGate` and any kept-out box. `towerGates` judges after. The step off a gate is still its own section's; a gate is still
  never run on (rule 3 skips sealed pieces). On seed 2 each gate gets a bough about 100 to 140 px under its end, at the wall; seed 2
  Normal builds with errors [].
- **Plant** (tower.test.ts, 'a gate's RUNNING walk-off that lands by the wall past a vine-topped bough gets a catch under the arc'):
  seed 2's first gate in a toy tower (gate 646-1086 @1000, storey 566-1166 @1400 with a vine hanging from its tip, the vine's storey
  700-1280 @1681). **RED on deaaf3a7c (fail 1), GREEN on 97bb2b73e**; it also checks nothing lies by the gate or over the vine's top,
  towerGates is clean, and a lone gate still gets no catch (its two step falls named, as before). tower.test.ts **33/33**.

- **The lead's proof** (b73600b56, tower.ts `gateCatchReached` / `towerGateCatches`, pipeline `gen2.tower.gateCatches`: each catch with
  its gate's id, so the verdict needs no guess). Planted in the same test: the plant's own catch passes; a toy catch 150 px over the
  storey under the gate is refused by name ('reached by the piece at x 566-1166, y 1400, not only by a fall off the gate').

## Findings (numbers)
| item | result | evidence |
|---|---|---|
| 1-4 seed 2 | before: 4 running walk-offs off gates refused (641-721 px). After: **errors [] on Normal and Easy** (Easy's own build 1,245 ms, under load) | scratch why-dump (debug hook, not committed); eng26h/tools/why.mts |
| generality | **PASS** on 97bb2b73e and b73600b56 (26 literals, 26 known) | |
| plant | RED on deaaf3a7c, GREEN on 97bb2b73e and b73600b56 (with the proof's two checks); tower.test.ts 33/33 | |
| tsc | **PASS** on 97bb2b73e and b73600b56 (after `npm ci --legacy-peer-deps`; this container had no node_modules) | |
| 1-4 yield, seeds 1-400 | before 49 kept (12%, eng26h/sweep-1-400.json). **The cure alone (97bb2b73e): 400 kept (100%)**, none of the 49 lost; each worker 100 of 100. **With the proof (b73600b56): NOT MEASURED**: its sweep was still running when the box closed (slower: refused rolls make every search re-roll); re-run it, step 1 | scratch sweep, `--worker i/4`, under load |
| 1-4 seed 2 with the proof | **refused again, both settings, all four gates** (every fair height reached: the storey under from 180 px under the gate down, a drop from the storey above from 160 px up); the variant counting only wood under the gate's level: still 4 of 4 | why.mts; a scratch log in the lay (not committed) |
| 2-6 list | `seedlist.ts 2-6 --check` on 97bb2b73e: **PASS** (100 seeds, both settings), 43 s. Not re-run on b73600b56 | |

## Lessons applied
D40 (cure the judge before relisting: no relist was started), D57/D87/D105 (ReadNotifications at each step and push; long runs in the
background so the queue is read), D96 (step 4 names the full CI set, gates.md), D102 (read lean: the packet, the REPORT's top, rules
19/20/22/28, the code by line range), D107/D111 (handed over at the 28-minute box with the exact next step), D109 (no clock times in
messages to the lead; this REPORT's start time is from `date`), D30 (times from `date`), law 3 (checked the fact: tsc was not counted
as a pass until it ran with its dependencies), law 22 (the gate rule kept by its own reading, the stricter reading put to the lead
instead of chosen quietly).

# ENG-26h (on t-build-26 from 95cafaabc): the walk-off judge's price. HANDED OVER by D111 (40 min), written 3:52 PM ET 11-21
Commits: 93246fa93 (buildcheck takes BUILDCHECK_STAGE), 91e6c584e (three EXACT speed-ups, proof NOT run) REVERTED off the head by
the lead's ruling (cherry-pick it in step 2), this REPORT. The branch's src is 95cafaabc's, proven.
Saved for the next member: reference/qa-reports/BUILD-26/eng26h/ (both locks gzipped, the 1-400 sweep, the scratch tools in tools/).

## EXACT NEXT STEP (ENG-26i; the lead's ruling by D40: the 401-1000 sweep and the relist STOPPED, never relist against a judge that throws
## 88% of rolls away and then again after the cure). Long runs in the background on frozen worktrees (4 cores). In this order:
1. **towerCatches lays a catch where a refused RUNNING walk-off lands**, so rolls pass instead of being thrown away: general (every tower,
   rule 22), planted first (a toy tower whose run-off end drops past TOWER.fall with a fair catch in reach: RED on 95cafaabc, GREEN after).
   The refused ends to start from, 1-4 seed 2 Normal on 95cafaabc (eng26h/tools/why.mts prints a build's errors; ends.mts judges named
   pieces with the head's walkOff): 646-1086 @8120 (runs off both ends land y 8761, 641 px: left at x 400, right at x 1260), 194-714
   @4208 (left run to x 20 y 4909, 701 px; right to x 979 y 4909), 670-1030 @3342 (right run to x 1260 y 3983, 641 px), 196-716 @2300
   (left run to x 20 y 3021, 721 px). Read why towerCatches' run branch (tower.ts `runs`/`takes`/`exAt`, the bridge, run-on and own-bough
   rules) lays none there: the arc comes down at the tower's side (x 20 / x 1260) or past the lower storey's wood. **Measure 1-4's yield
   before and after** on the same seeds: before, seeds 1-400 kept 49 (12%; eng26h/sweep-1-400.json, `seedlist.ts 1-4 --count 100000
   --from 1 --to 401 --worker i/4 --part p<i>.json`, ~500 s a worker under load); and rerolls per search build (repairs.mts prints
   gen2.rerolls: seed 5 was 0 on base, 7 on the head). 2-6 rides the same judge: its list passed 100/100 on the head; re-check it after.
2. **The three exact speed-ups**: `git cherry-pick 91e6c584e` (fly's piece box; roofedDrop's run once a piece a walk; physics reach
   tables indexed) onto step 1's head; prove them: lockall --layouts 16 --out on a frozen copy WITH them vs one WITHOUT them (step 1's
   head), every part hash of all 3264 builds identical. (Against 95cafaabc's lock only if step 1 is not in yet:
   eng26h/lock-head-95cafaabc.json.gz.) Any difference: drop the piece that made it.
3. **Then relist 1-4 ONCE** (methods/seed-list.md; the survivors of the old list in their old order first, then new seeds lowest
   first, --merge --in-order, n 100), every test that pins a 1-4 roll or seed (D29), then on a QUIET machine: the phone's load
   (eng26h/tools/loadtime.mts <worktree> 1-4 3 and 2-6: every listed seed's replay as stageGenerator builds it, both settings, any seed
   that fell to the search), base 4ea253b8c vs head; buildcheck alone (BUILDCHECK_STAGE=1-4 / 2-6 node tools/perf/buildcheck.mjs, base
   first: 1-4 may be over 150 ms already); CI's seedlist 1-4 job timed (D99, the 45-minute limit: `seedlist.ts 1-4 --check` base vs
   head on one machine) and the lock's time (486 s base vs 1431 s head here, side by side).
4. **Stills** of 1-4 layout 1 before and after (eng26h/tools/pin.mjs <root> <out> 1-4 1 normal <port> name:x:y,...; dsf 2, sideways and
   upright; prints the seed it built): before on 4ea253b8c (listed seed 2): `storey1:1006:10984,walkoff:1070:8120,walkoff2:220:4208`;
   after on the relisted head (layout 1 = the new list's seeds[1]: say which), its spots from its own platforms. Then castBots 1-4 seeds
   1-40 both settings base vs head in one chain (no tier's pass count may drop), tierBots 1-1 9/9, qaW123 (19/19 at 95cafaabc), the
   full suite, tsc, generality, the CI tool line (methods/gates.md "THE FULL SET"), engine-core.md's tower lines (ENG-26g's list plus
   this REPORT's cost findings). Then BUILD-26c runs 2-6's bots.

- **The lead's proof** (b73600b56, tower.ts `gateCatchReached` / `towerGateCatches`, pipeline `gen2.tower.gateCatches`: each catch with
  its gate's id, so the verdict needs no guess). Planted in the same test: the plant's own catch passes; a toy catch 150 px over the
  storey under the gate is refused by name ('reached by the piece at x 566-1166, y 1400, not only by a fall off the gate').

## Findings (numbers)
| item | result | evidence |
|---|---|---|
| step 1: the full lock | lockall --layouts 16, 95cafaabc vs 4ea253b8c, both frozen: **100/102 unchanged; movers 1-4 and 2-6 only (both intended)**. 1-4: 32/32 builds moved; **layout 12 (seed 13) FAILS to build on both settings** ("no seed of 24 from 13 builds cleanly", first: flags none before the hard node n6). 2-6: 32/32 moved (platforms, collectibles, proto.decor). Lock time 486 s base vs 1431 s head (side by side) | eng26h/lock-*.json.gz; sent to the lead, accepted |
| 2-6's list | `seedlist.ts 2-6 --check` on 95cafaabc: **PASS (100 seeds, each clean on both settings)**, 43 s | |
| 1-4's list | seed 2 refused on the head: 4 running walk-offs drop 641-721 px (limit 450). Sweep 1-400 on 95cafaabc: **49 kept (12%)**; old list 1-100: **14 survive, 86 refused** | eng26h/sweep-1-400.json |
| why 1-4 is slow | NOT mainly the flights. The judge refuses most ROLLS: seed 5's search build has rerolls 0 (base) vs **7** (head); each refused roll is a full lay + Normal and Easy checks: the stage check runs 4x a build on base, **32-56x** on head. Warm head search build ~10x base (seed 1 2678 vs 160 ms; seed 5 1535 vs 96 ms; under load). Pieces 97-105 -> 127-142 (the catches). This is paid by every SEARCH: relists, the lock, CI's seedlist job (it re-runs each listed seed's full search), the no-list fallback. The phone replays one plan: not measured yet (step 3) | eng26h/tools/repairs.mts, hot.sh |
| profile of a head build (before 91e6c584e) | physics reachTable's linear scan ~27%, levelCheck roofedDrop ~20% (P^3 in a tower: every pair, each a pass over every piece), tower.ts fly ~13% (every piece every frame) | hot.sh |
| 91e6c584e (exact by construction, PROOF NOT RUN; reverted off the head) | fly reads only pieces in its path's box (x: the way out, a stop steps back <= 2 px a frame; y: its depths); roofedDrop's run and closed ends found once a piece a walk (cleared each walk); reach tables in Map<v0, Map<vx, list>>. Head build ~1.8x faster (seed 1 2678 -> 1469 ms, seed 5 1535 -> 932 ms, warm, under load); fly 1180 -> 114 samples. tsc PASS | lock proof: step 1 |
| buildcheck | takes BUILDCHECK_STAGE=<listed stage> (its own kit, gen2/listed.ts); 1-1 unchanged by default. Not yet run for 1-4/2-6 | 93246fa93 |

## Pushback
- The packet's remedy (cache the flown arcs) aims at the wrong cost: the flights were ~13% of a head build; the price is the refused
  rolls (7 of 8 for seed 5) and the check over the extra wood. Suggest (an engine packet, rule 22, every tower): towerCatches lays a
  catch a refused run's arc lands on (seed 2's four ends, 'drops 641-721 px'), so rolls pass instead of being thrown away: that cures
  the 12% yield, the search cost and the CI time together. A search that refuses a roll before its checks is NOT exact (the checks
  repair the stage first: repairLandings takes caps up, and caps bounce a walk-off), so it is not a free speed-up.
- Note for whoever reads the lock: its 1-4 builds ARE the game's path with the list in (layout 12 asked seed 13, the list's seeds[12];
  with no list it would ask 12); a listed seed whose plan no longer replays falls to the search, as a phone would.

## Lessons applied
D57/D87/D105 (ReadNotifications at every step and push: the lead's D111 hand-over read at the push), D94 (base = 4ea253b8c, the
integration base ENG-26g's lock used), D96 (the full CI set named in step 5), D102 (read lean: code by grep and line ranges; profiled
instead of reading), D107/D109 (no clock times in messages), rule 22 (the cost fix goes in engine code every stage reads, not in 1-4).
Owned miss: I did not time-box the investigation against D111's 28 minutes; the relist and the quiet measures are not done.

# ENG-26g (on t-build-26 from 44dcbb41a): the tower's walk-off judge. HANDED OVER at the context line, STOPPED on step 3 (1-4 moves)
Commits: de009b9f5 (the judge), ac2fd73b6 (water by his middle, a cap bounces him on), this REPORT.

## EXACT NEXT STEP (the next engine member, in this order)
1. **WAIT for the lead's ruling on 1-4** (packet step 3: a shipped stage's lay changes only on the lead's ruling). 1-4 MOVES: Normal
   layout 1 was seed 2 at 44dcbb41a, is seed 7921 at ac2fd73b6 (seed 2 refused by the walk-off judge, so another tower is drawn). The
   lead asked for: which towers move (the full lock), before/after stills of the moved spots (upright and sideways, 2x), 1-4's seed list
   --check. None of the three is finished: they were started in the background on a frozen ac2fd73b6 in MY container and die with it,
   so RE-RUN them on a fresh frozen worktree of ac2fd73b6:
   - `npx tsx tools/engine/lockall.ts --layouts 16 --intended 2-6 --check lock-base.json` where lock-base.json is
     `git worktree add <dir> 4ea253b8c` + `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` there (7.5 min each).
     Note: on de009b9f5 the lock sat on 1-4 for over 10 min (one 1-4 build is 1.4 s at the head, 5.5 s on ac2fd73b6; the list's
     seeds now fail and a build searches on): expect 1-4 to be slow; time it, it is a perf finding for the judge (towerCatches calls
     walkOff per end per pass and per candidate catch).
   - `npx tsx tools/engine/seedlist.ts 1-4 --check` and `2-6 --check` (how many listed seeds the judge now refuses, by name).
   - stills: which spots moved come from a platform diff of the same build before/after (a script that dumps `generateStage` platforms
     for a stage/layout/setting the lockall way, then a set diff); pin Pokey there with a dsf-2 copy of tools/art/kitaudit/shoot.mjs
     (pin at {x, y}, `localStorage sloth_difficulty` for Easy), upright 390x844 and sideways 844x390, on both worktrees.
   Send the lead: the lock's movers, the seed-list counts, the stills. Then do as ruled (relist 1-4 under the judge, or not).
2. **qaW123 '2-6: a plain walk to a street's dead end'** (TOWER.fall, the lead's ruling): on de009b9f5 it fell from every Normal end
   and 5-6 Easy ends (406-761 px) to 2 ends a Normal roll and 1 an Easy roll, all walking LEFT, ~505 px, at the same two spots on rolls
   1/2/3/7/12: (a) the left end x 114 by the turn vine's top (x 88): the run is held by the wall at x 20 and fell past the wheel pond,
   which starts at x 30 (water takes him by his middle, river.ts riverAt; the judge had given it a foot's 11 px): FIXED in ac2fd73b6;
   (b) the end at x 827, y 1556: the run comes down on a mushroom cap (706-776, y 1704) the judge read as a landing; the engine bounces
   him on (roll 1 lands 150 px down, others 505-510): FIXED in ac2fd73b6 (walkOff flies the flown 'bounce' off a cap). qaW123 on
   ac2fd73b6: **GREEN** (with towerFoot, towerCatchWater, wheel*.test.ts: 19/19 pass, 0 fail, on a frozen ac2fd73b6). Done unless
   the lead's 1-4 ruling changes the judge.
3. Gates (packet step 4), on the head after 1-2: tsc (PASS at ac2fd73b6), generality, the FULL suite and the CI tool line
   (reference/methods/gates.md "THE FULL SET, named"), lockall again.
4. engine-core.md's tower lines: NOT rewritten (no context left). Write: tower.ts walkOff (the flown run; wall faces flown straight down
   and on again, the deeper judged; water by his middle; caps bounce along the flown bounce, BOUNCES 3), openEnds judges step + run,
   towerCatches lays a run's catch where the arc comes down (runX) and only if the flown run lands on it (`takes`), a contiguous bridge
   needs no 60 px; BUILD-26b's clearFoot (TOWER.foot) in pipeline.ts towerJoin.
5. Then BUILD-26c runs the bots (the cause table, the 2-minute beat table) on the ruled head.

## Done
| item | result | evidence |
|---|---|---|
| step 1: turn's-foot piece re-checked | lockall --layouts 16 --intended 2-6, 44dcbb41a vs 4ea253b8c: **102/102 unchanged** (2-6's 32 builds too: clearFoot moves none of them); generality PASS (26 literals, 26 known) | /tmp/claude-0/-home-user-Sloths-Adventure-/65bc8b33-3d54-5e90-8b15-8de7c46842d6/scratchpad/lock-head.log (my container) |
| step 2: the walk-off judge | tower.ts `walkOff` flies the engine's own full-speed walk-off (landFlights.data.ts 'walk', proven the engine's by landFlights.test.ts; the same path both settings, asserted), held at the tower's sides [20, W-20] and at a wall's face; `openEnds` judges the step AND the run; `towerFalls` names "a running walk-off"; `towerCatches` lays each run's catch where the arc comes down to its height (`runX`), only if the flown run lands on it; a bridge that runs its own wood on needs no 60 px (2 gate rolls had a 16 px slot by the wall) | de009b9f5 |
| planted RED/GREEN (toy tower) | new test "a running walk-off off any end of a built tower..." judged by landings.ts `Landings.walk` (an independent flier): **old code 24/24 rolls, 420/4376 ends past 450 px; judge 0/24, 0/5307**; none of the 24 refused (BUILD-26b's draft: 13/24 left open). Unit plants: 200-wide step catches named as runs, 300-wide close them; wall clamp, wall face (down / hoist), pond from x 30 (falls) vs x 10 (caught), cap with nothing past (floor) / wood past (lands there), a cap end named | tower.test.ts 32/32 at ac2fd73b6 |
| #16 filter | 'every piece of a storey, its hops' catch boughs included...' took every seam piece in a y band; a run's catch (a lower-storey bough by `fair`, judged by towerSkips) was filed in the upper section's seam ("hangs under") and read as a storey piece 41 px over the ledge. The filter now takes its hops' catch boughs lip to lip (its own words); the assertion is unchanged | ac2fd73b6 |
| step 3 | **STOPPED: 1-4 moves** (seed 2 -> 7921 on Normal layout 1). Full lock, seed lists, stills: UNFINISHED (see EXACT NEXT STEP 1) | |

## Pushback
- A walk-off at less than full speed (a kid starting to walk near an end) lands between the step and the run; the judge flies only
  those two (the packet's), so a gap between the step's wood and the run's catch could still drop a slow walker. Suggest: judge a
  second flown walk-off from a short run-up (flyLandFlights could fly it) if the bots show it.
- After a wall stops him the engine's air drive (how fast he goes on) is not flown; the judge flies both bounds and takes the deeper.

## Unresolved
1-4's ruling, the full lock, seed-list checks, stills, the full suite and CI line, engine-core.md (all above).

## Learned
- The running walk-off already had an engine-true model in the repo (landings.ts, landFlights 'walk'): reuse a flown path, never a
  second closed form; and an independent flier makes the planted test honest.
- Water, caps and walls are where a walk-off model goes wrong: trace the real engine on every end a model says is caught.

## Lessons applied
D57/D87/D105 (inbox at each step and push), D102 (lean reads: line ranges and greps), D107/D109 (no clock times to the lead), D96
(gates named from gates.md, not run: named UNRUN), rule 26 (engine gap fixed in the engine, every tower), rule 28 (each 2-6 miss traced
in the real engine before its fix), LAWS 3 (the BUILD-26b draft's model checked against the flown table before reuse).

# BUILD-26b (on t-build-26 from 4ea253b8c): HANDED OVER at the context line
Commits: c29b8332d (step 1 deletion), 60234ead0 (6 pins re-pointed), 1be132415 (step 2 ENGINE: turn's foot clear), this REPORT
(+ walkoff-wip.patch, + qaW123 dead-end test on TOWER.fall).

## EXACT NEXT STEP (BUILD-26c, in this order)
1. **The walk-off ENGINE PIECE (lead's ruling; rule 26), NOT LANDED.** Ruling: the tower judges a walk-off where a RUNNING walk-off lands
   (STAGE-RULES :418), one general place, planted RED/GREEN, generality PASS; **if lockall moves a shipped tower (1-4, 2-6, any), STOP and
   send the lead which.** My draft: `git apply reference/qa-reports/BUILD-26/walkoff-wip.patch` (tower.ts: `walkOffLand` arc at
   PHYS.maxRun/gravDown/maxFall inside the walls; openEnds judges the step AND the run; towerCatches lays its catch where the arc crosses
   its height; towerFalls names "a running walk-off"). It is RED: tower.test.ts 5 fail (#2, #5, #10, #16, #28), the toy tower `up`
   13/24 rolls keep an uncaught running walk-off (e.g. normal 1: the piece x 708-888 y 4475 drops 604 px): towerCatches finds no FAIR
   catch on the arc (the arc lands 90-200 px out, by the next turn's vine / under the storey above, where `fair` refuses). #10's planted
   catches (200 wide at x 380/640) are the old model's and must widen to cover the arc (it lands ~182 px out at 400 px down). The 1-4
   seed list check against the draft: UNRUN (stopped). Expect it to move 1-4: ask the lead before landing.
2. **qaW123 '2-6: a plain walk to a street's dead end'** now reads TOWER.fall (lead's ruling) and stays RED until step 1 lands
   (Normal ~505/617 px ends every roll; Easy 5-6 ends, 406-761 px; walked in the real engine).
3. **Step 2 (turn's foot)** landed at 1be132415: clearFoot in pipeline.ts towerJoin slides a block off a turn's foot (TOWER.foot 70 +
   CLIMB_CLEAR) clear of every climb on its ledge, else the roll fails by name. towerFoot.test.ts: RED 530 misses without, GREEN with
   (37/48 toy rolls; 11 Easy refused by towerSkips: a slid boulder can be a step under the next storey; named, never laid). generality
   and lockall --intended 2-6 vs 4ea253b8c: see "Gates" (LOCKALL_RESULT). If lockall shows any other stage moved, STOP and tell the lead.
4. Then the packet's steps 3-5 as written (cause table to the lead BEFORE fixing a bot/engine cause; the expert's beat-by-beat seconds
   on the MIN seed; stills only on a green head). Run castBots 1-40 both settings on the head after steps 1-3 first: the turn's foot
   and the walk-off both change what the kid/adult dither 87-90 px short of a turn's vine may be (not traced: no time).

## Done
| item | result | evidence |
|---|---|---|
| base gates, frozen 8b2438c74 | tsc PASS; shards 1/2 PASS, 3: 1 fail `listed.test.ts` 'nothing in the game calls withTestStage' (w2Arc26.ts header comment, ENG-26f's): GONE on this head (BUILD-26 rewrote the header); CI tools/generality/coverage/knowncheck/roadmap/timecheck/tipwalk/registrycheck/seedlist 1-1: G0_TAIL | scratchpad g0out/ (this container) |
| deletion | buildKapok `village` param and every branch (first post + log, windows, porch dressing, knots' floor/doubt walk-off, doubt-knot judging, bankWall, decor); stageSheets '2-6' goldsnake; levelSeeds '2-6': 0 READ, KEPT (registrycheck needs LEVEL_ATTEMPTS per row stage; 2-5 the same); 2-6.md :47-48 hearts ruling, :59 deletion | c29b8332d |
| pins | qaW123: the first climb (only climb from the bank, tops on the first wheel's jetty, a hopping walk rests by it) + Dot's ride line on the bank before the climb (both settings/views/taught): PASS; dotBox 2-6 'Ride a bucket up!' at 200 (where the boulder stops a plain walk) and the ground pick honours the hint's band (it took the tower's TOP storey): 9/9; towerBots climb framing (4-1 for the old climb, 2-6 held as a tower): PASS; w2Arc26 hearts (nothing costs one on Normal, 0 laid): 5/5; edgeFooting, w1NewArt, wheel.test read: still true | 60234ead0 |

## Pushback
- lines-2-6.md "Why" 5 says the new 2-6 has no post before the first wheel; the BUILT stage has one (the tower's first turn, x 1562
  Normal / 1610 Easy, from the bank to the jetty): so dotBox stands him where the line goes up, not at 'lip' (rule 27).

## Owned miss
Started step 2 before the lead's walk-off ruling was read (it sat 8 min in the queue while I wrote the turn's-foot test). Nothing built
on a stop; the order cost the walk-off piece its box. Countermeasure: ReadNotifications before starting each new piece, not only at pushes.

## Learned
- A turned storey's vine stands TOWER.vineIn (44) in from the ledge end, exactly where an end boulder sits: moving the vine can't keep the
  storey's room, moving the block can (toy: 48/48 refused vs 37/48 built).
- The running walk-off is the tower's real fall: a catch under the end does not catch him at a run.

## Lessons applied
D57/D105 (inbox at each step), D59 (the stopped 1-4 check named UNRUN), D102 (lean reads), D109 (no clock times), D40, rule 27 (built
numbers: spawn 140, jetty 1296-1536 y 6161, vine 1562), rule 26 (engine gaps reported, fixed in the engine).

## Turnover note
engine-core.md NOT rewritten (no context left): BUILD-26c writes clearFoot + walkOffLand there.

# BUILD-26 REPORT: 2-6 "Up the Bank Houses: The Water Wheels", laid by its design on a real row (HANDED OVER at the context line)
Branch t-build-26 from 8b2438c74. Commits: 0c906c4ff (step 0 probe), fab3a8a20 (the lay, the row, the seed list, the hand build's route
deleted), 8f3bcb3b6 (rule 28: the rest lays no boulder), 4a9e38e67 (the words), this REPORT.

## EXACT NEXT STEP (for the next member; in this order)
1. **Finish the deletion (new replaces old)**: protoStage.ts buildKapok's `village` parameter and its branches (grep `village` in
   protoStage.ts: 21 hits; the hint at :4859, the first post :4858/:4867, windows :4900, the dressing block :5317-5345, villageKnots :5551,
   bankWall :5676) and the `village` doc at :4615. KEEP ProtoExtras.ladders/bankWall and drawLadder/drawEarthWall: finish26 USES them
   (w2Arc26.ts finish26), so the lead's condition for keeping them holds. stageSheets.ts:89 `'2-6': ['foe:goldsnake']` (the hand build's
   cast; 2-6 has none) and levelSeeds.ts:22 `'2-6': 0` are UNCHECKED: read what each is for, then delete/move. Update design 2-6.md:59.
2. **Re-point the pinning tests, each assertion kept** (all RED on 4a9e38e67 against the new 2-6, run in this session):
   - qaW123.test.ts :123 (first ladder on screen from the start), :141 (Dot's climb line by the first ladder), :203 (a porch's dead end:
     no fall >= 400 px). The first two were the hand build's posts; KEEPER-26 re-pointed the moment to the ride (lines-2-6.md "Why" 5).
     Suggested: :123/:141 -> the first wheel's jetty is the first thing to use and Dot's `ride` goes up before it; :203 run as written
     on the new streets and READ its failures (they may be real: a plain walk off a street end).
   - dotBox.test.ts:199 -> `{ stage: '2-6', layout: 0, hint: 'Ride a bucket up!', at: 'lip' }` (the keeper's line AND spot; if the
     ground under the hint is the millpond bank and not the jetty, `at: <px to the jetty's end>`; lines-2-6.md "Why" 5).
   - the test "the climb framing is a tower's alone: a shipped climb of the old generator ... keep the framing" (#22 in the pins run;
     towerBots.test.ts:150 lists ['2-6', 'up']): 2-6 is a tower now; re-point.
   - edgeFooting.test.ts:17, w1NewArt.test.ts:92, gen2/wheel.test.ts:57 use RealPlay('2-6'): they PASSED on the new 2-6 in the pins run
     (only the 6 above failed); read each once to check its comment still says true things.
   - w2Arc26.test.ts 'the climb up the bank village' (moved from w2Stages.test.ts): RED on its hearts assertion only, kept as written.
     **For the lead:** the PLAYED 2-6 lays 0 hearts on Normal (2-4: 6, 2-5: 7; 2-6 Easy 8; tools/inspect/b26/played-hearts.ts). The
     design asks a heart after beat 10. Is 0 the live rule (nothing on Normal 2-6 costs a heart: every wheel's pond and the millrace are
     soft), or a gap? Do not loosen the assertion; get the ruling.
3. **Bots (rule 28), RED, traced so far** (castBots 1-40 both settings; rows in rows/):
   | head | kid N/E | adult N/E | child N/E | middle N/E | expert N | expert min |
   |---|---|---|---|---|---|---|
   | fab3a8a20 | 32/40, 0/40 | 35/40, 0/40 | 13/40, 6/40 | 4/40, 9/40 | 11/40 | 123.1 s |
   | 8f3bcb3b6 | 0/40, 0/40 | 0/40, 0/40 | 28/40, 27/40 | 38/40, 33/40 | 39/40 | **112.3 s** |
   Every miss is a rescue (hits 0, lives 0). Traces (tools/inspect/b26/trace.ts, frames.ts, dump.ts, route.ts):
   - FIXED at 8f3bcb3b6: kid N 11 (x 1490 y 4192), middle N 1 (x 1509 y 4192, x 1635 y 4242): the rest street's boulder stood 36 px from
     the tower turn's vine; the bot stood on it under the climb. **ENGINE-WORTHY:** the tower lay keeps no turn's foot clear of a block
     (pipeline tower turn, wheelLay/tower.ts): any stage's brick with a block near its storey end can hit it.
   - OPEN, kid/adult (0/40 after the fix; adult was 35/40 before it): they stop ~87-90 px short of a tower turn's vine and dither for
     20 s: adult E 2 at x 1525 y 4465 (vine x 1612, pad alternates right/left around x 1514-1538, standingOn #39; the route is right:
     route.ts shows the next points ON the vine), adult N 20 at x 1074 y 2825 on the top wheel's street (vine x 1161, a flag at x 1099).
     Not yet found: why the bot will not walk the last 90 px. Next: FT_FRAMES=83.4,85 with the bot's chosen step printed in
     firsttimer.ts, or compare with 1-4's turns. The kid is not the bar (level.md rule 4; 2-5's report); adult passed 40/40 on 2-5.
   - OPEN, child E 2: rides the edge wheel round and falls back 8 times (x 748 y 4435, "fell back down from here").
   - The 2-minute rule: the expert's MIN is 112.3 s (the lead's bar: 125 s over 80 runs). Bring the lead beat-by-beat seconds before
     changing anything (the lead's ruling: no slowing the wheels, no filler).
4. Then step 3 (the FIRST LOOK: upright + sideways at 2x, beats 1, 5, 8, 12 at the top of each ride; the four upright to the lead), only
   on a head whose bots are green (rule 29). Then the full set and the beat-1 clip.
5. engine-core.md: write ENG-26f's 'For engine-core.md' lines (ENG-26f REPORT :28-43), not done here.

## The plan as ruled (STEP 0, the lead's GO with rulings)
Node string verbatim (2-6.md:43). G3: the 1700 px tower. G4: the live flag rule wins, never a flag on a jetty; the millrace near bank
>= 260 px built (laid 300); flagMiss re-read on every roll (empty on every probe). 2-minute: expert MIN >= 125 s over 80 runs. Deletion as
listed; ladders/drawLadder/bankWall/drawEarthWall stay only if finish26 uses them (it does). Clue: a World 2 sign TAKE YOUR TIME on the
top house (laid: SIGN_26). Art: the bucket trough is painted from the w2-wheel sheet (wheelDraw.ts:8-11): not missing. Words: approved.

## Done
| step | result | evidence |
|---|---|---|
| 0 gates (base 8b2438c74) | tsc PASS; ENG-26f's planted tests 27/27 PASS; seedlist 1-1 --check PASS (161). The unit suite, CI tool line, generality, coverage, knowncheck, roadmap, timecheck: RE-RUN on a frozen worktree of 8b2438c74 (my first run read the live tree I was editing: owned miss below); results in the scratchpad g0b/, NOT read before hand-over | this session |
| 1 lay | w2Arc26.ts real bricks (millpond 560+380 with a boulder and Dot's `ride` 800+ px before the jetty; the teach wheel; the first street: step up, boulder, hop; through a house: foot, ladder, roof; the millrace near 300 / far 240; the edge wheel; the hanging porches, 4 spans, Dot's `jump`; the top wheel; wheel to bounce; the great wheel with Pokey's `view`; rest streets; the crest), stageTable '2-6' { kit 'w2-26' }, listed.ts KITS/WORLD/FINISH, finish26 (bank wall, ladders, doors/lanterns/windows/washing clear of every wheel's sweep, the crest's rooftop, bell, Gruntlewick, the sign) | fab3a8a20, 4a9e38e67 |
| 1 addlevel | 24/24 clean both settings, one beat order; seconds (modelled) 172.5-172.9 N, 189.5-189.9 E; seed list 100 of 101; registry: nothing missing; MISSING: bots, and its row is not `judged` (fly: `FLIGHT_STAGE=2-6 npx tsx reference/specs/sims/flight.ts normal all`) | rows/addlevel.txt |
| 1 deletion (part) | w2Stages.ts '2-6' route, clearFlags, its note; W2Plan '2-6' and its Exclude/flavour lines (w2Sections.ts); riverLay.test's '2-6' skip | fab3a8a20 |
| 2 words | LINES_26 ride/jump/view, MISSION_26 (stagePlan), CLUE_26 (stageClue), JOURNAL_26 (pokeyJournal), NORIA_PAGE_26 (held; no journal page surface exists in code, as 2-2's lily page), SIGN_26; hint.2-6.climb deleted, way.2-6 kept; w2Arc26.test.ts holds each equal to lines-2-6.md | 4a9e38e67 |

## Polish check
No stills shot (rule 29: the bots are red). Nothing judged on screen yet.

## Pushback
- The packet's step 0 gates: I ran the long ones against the live working tree, then edited it: owned below.

## Unresolved (named plainly)
buildKapok's village branch not deleted; 6 pinning tests red; hearts on Normal 0 (lead's ruling); bots red (kid/adult turn-vine stall,
child E edge wheel, expert min 112.3 s); no judged row (flight not run); no stills; engine-core.md not written; the frozen-base gates not read.

## Owned miss
Step 0's unit suite ran in the live working tree while I edited it after the GO, so its result would not have been the base head's.
Caught before reading it; killed; re-run on a frozen worktree (git worktree add --detach). Countermeasure (level.md step 7 already says
it for step 7): every background gate runs on a frozen worktree, step 0 included.

## Learned (proposed level.md rules, for the lead)
- A tower storey's last brick decides where the turn's vine stands: no block (boulder) in a brick that can end a storey, until the tower
  lay keeps the turn's foot clear (ENGINE-WORTHY above).
- Run castBots 1-40 the moment the row lists (it took ~3 minutes at --par 3): the draft's 2-seed table hid what 40 seeds showed.

## Lessons applied
D57/D87/D105 (inbox at every step and push), D75/D101 (laid on the real row), D102 (grep and line ranges after the lead's context read),
D109 (no clock times in messages), D40 (nothing patched that is being replaced).

## Turnover note
reference/handoffs/engine-core.md: NOT rewritten (step 5 above).
