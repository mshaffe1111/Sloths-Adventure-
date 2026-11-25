# ENG-PLANT-CI: the 9 CI-tool-line reds on c27 (session 1, started 11:37 AM ET 11-25 by the hook's stamp; this file written 11:49 AM ET 11-25)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Branch **release-0.10.3-wip-plant-ci** (cut from d742d0469 = c27 +
raceSure deleted). ENG-PLANT-s merges this branch into its own; this branch never merges into release-0.10.3.
**Code head: CI-1 = 246d90533** (fixes reds 1-2 of 9, the two reAim toys; the child's skill only). Tools: /home/user/tl (not in git;
copies below). Base release-0.10.3 = dfe631913.

## The 9 on c27's head d742d0469, measured here (4 files, frozen tree fz-head): 60 tests, 51 pass, 9 fail, the same 9 as the REPORT
On the base dfe631913 (frozen fz-base; riverRide + lianaRide + hopJudged): hopJudged 4/4 GREEN, lianaRide GREEN (both plants), both
reAim toys GREEN; riverRide's base reds are :119 ride, :165 handed, :229 cross clean, :266 upstream, :282 bankUp (c27 fixed the first 3).

| # | red | first candidate red (bisected on the lean line dfe -> c2 80eb0784 -> c3 60bbf14c -> c3b a64f02ce -> 06b5316b -> c4 6b5f43da -> c19 9035c553 -> c20..c27) | cause (traced) | status |
|---|---|---|---|---|
| 1 | riverRide :344 reAim 'aims again' (GREEN half) | **c26 51ffe7ea** (also red at c20 d9681e40, fixed at c21) | (a) c26's front-stand walk (`return side(dir)`) came BEFORE the reAim expiry; the child's rhythm eats the walk (intend {right}, rhythm {}), so he stood 46 px from the front with the stale tap for 1.2 s and rode back (phase 0.5; base re-drew at +0.467 s and hopped). (b) phase 1.5: FRONT_STAND_PX let go at 31 px for every tier (2 frames late lift-off); the child lifts off up to 4 frames late (releaseMax [1,4]) and stood 9 px PAST the log's end, where no gate is reached (fell, a life) | **FIXED in CI-1**: reAim expiry before the walk; `frontStandPx(who)` = 12 px slide + releaseMax[1] frames at full run (adult family 31 unchanged; kid and child 50). Toy GREEN (all 6 phases hop), RED half still red with reAim off |
| 2 | riverRide :355 reAim 'honest aim' (re-draw inside stopReact) | **c2's merge 80eb0784** (0.200 s), 0.000 s from **c3b a64f02ce** | c2: padPause's refused flick drew an aim on log #13 (ft:3234 on c2), the upstream gate's new wait drew again 0.2 s later on the same log (f354 -> f360). c3b on: tablePick drew a whole hop for its thumb in the same frame as the refused aim (ft:1997 after ft:3413, f160 phase 0) | **FIXED in CI-1**: WaitAim keeps the last aim drawn on the same log inside the child's stopReact (no draw); tablePick waits until the aim was refused for his stopReact (then draws, a re-draw after his reaction). react = 0 for tiers without reAim: unchanged. Toy GREEN |
| 3 | hopJudged 2-7 home middle **Normal 2** ('padPause q#50 ... double \| came down #49 drift') | **c26 51ffe7ea** (GREEN through c25 6fb42bd1) | not yet traced. The judge (judge(), firsttimer.ts) records the FIRST q of `to` in list order whose flight lands, not the first in time; and `to` excludes the log he stands on. Check first: is #49 the log he took off from, or a log the flight crosses before #50? | OPEN |
| 4 | hopJudged 2-7 home middle **Easy 5** ('edgeWait q#-2 judged t 21.77 x 16688 ... came down #18 drift') | **c2's merge 80eb0784** (red on every candidate after; base GREEN) | not yet traced. q -2 = the flown draw (with its thumb) predicted to land on nothing; the engine caught him on log #18. A prediction-vs-engine gap in hopFlight for a drift log (DRIFT_CATCH side, Easy's wider catch?) | OPEN |
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
1. Read CI-1's four-file run (session 1 started it on fz-ci1: /home/user/tl/ci1-4.tap, if the container survived; else re-run:
   `cd /home/user/fz-ci1 && npx tsx --test --test-reporter=tap tools/inspect/riverRide.test.ts tools/inspect/lianaRide.test.ts
   tools/inspect/hopJudged.test.ts tools/inspect/firsttimer.test.ts`). Expect 7 fail (the 9 less the two reAim toys); the line
   'SKILLS.reAim is the CHILD bot's alone' must stay GREEN. Any other change: STOP and tell the lead.
2. hopJudged Normal 2 (red 3): run `npx tsx --test --test-name-pattern 'middle Normal seed 2' tools/inspect/hopJudged.test.ts` on
   fz-ci1 and print the padPause row's neighbours: which log he stood on at t 83.97 (HopRow.on is recorded in this.judged.on), and
   whether #49 is that log or a log under the flight before #50. If judge() picked #50 by list order while the flight comes down on
   #49 first: the RECORDER is wrong (fix judge() to take the q with the smallest airtime, hopFlight, a toy each way); if the flight
   model never saw #49 (excluded as `here`): the GATE is wrong (padPause's `to` excludes `here`: a hop that comes back down on his
   own log must be judged as such). Then red 4 (Easy 5, x 16688 t 21.77, edgeWait q -2 came down #18) the same way.
3. The plants (reds 5-9): for each, the same bar searched on the head per R-165.432 (every listed stage with the mechanic, every bot,
   both settings); re-plant at the same bar where a live case exists, else retire with the search as evidence (the skill's code stays).
   5 and 6 are toy plants (lianaRide's gap280 / catch toys): first try the toy's other rolls and variants at the same bar.
4. If CI-1 (or a fix for 3-4) moves bot behaviour: on that head, once, the 10 races + the 10 known flips vs c27 row for row (only the
   rows meant to change, each traced: CI-1 can move the CHILD and the KID only: frontStandPx (both) and the reAim floor (child)), and the
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
