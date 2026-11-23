# BUILD-27 REPORT: 2-7 "The Mailman's Route" (t-build-27-wip; started 12:35 PM ET 11-23 by `date`; budget 2 h, report by 2:40 PM ET)
## EXACT NEXT STEP (handover to BUILD-27b; BUILD-27 stopped at 1:03 PM ET at about 372k context. Head: see the commit that adds this)
LAID on t-build-27-wip: w2Arc27.ts (kit w2-27, stageTable row, listed.ts), the hand build deleted, the keeper's words (minus win/lose),
w2Arc27.test 6/6, planted-faults.py 7 plants (6/6 CAUGHT on 32b01afee; the 7th, turn, was added after that run and is not yet run),
limits.json scenario 2-7.
1. **Inventory red, from MY merge (fix first, minutes):** reference/art/CATALOG-MASTER.csv holds 8 DUPLICATE ids after the merge:
   w2-next#weir/doorOpen/letter/letterB/reply/replyB/mailBoat/mailBoatB (t-eng-27's rows and t-ready-27-wip's both kept). Keep the row
   equal to `git show origin/t-ready-27-wip:reference/art/CATALOG-MASTER.csv` (READY updated kb/cost and added the weir), drop the other,
   then `python3 tools/art/catalog_master.py --emit`. Then `npx tsx --test src/game/art/inventory.test.ts` must be 10/10 (main, t-eng-27
   and t-ready-27-wip are each 10/10; this head is 8/10: 9573 vs 9581 rows, 218 vs 226 images).
2. **Wait for ENG-JETTY's two landings on t-eng-27** (merge each into t-build-27 the moment it lands):
   (a) the World 2 finish fix, w2.ts:372 (`&& !lows.some((l) => p.y >= l.y0 - 2 && p.y <= l.y1 + 2)`: a soft fall must not drop the run
   leg stacked under it). Without it the home leg's bounce-bend banks vanish in play and every bot is rescued (0/40).
   (b) the jetty hook for the keeper's `win`/`lose`; wire 2-7's line ids for those two (lines-2-7.md asks 4) and hold them in w2Arc27.test.
3. **Then the yield:** castBots --proven, seeds 1-40, both settings, on a chattr-frozen tree; send it to the lead. Measured on a SCRATCH
   tree (32b01afee + fix (a), NOT committed): 1/40 proven. Cause 1: the quick adult finished under the 120 s floor (35 runs). Cause 2:
   the adult walked off the last porch plank (Normal seed 19). Both are addressed in fafd18d05 (a second reach on 'with' and on the
   signature: model fast 148 -> 163 s; the porch walk lands level, then a walked step down). The re-measure (scratch: fafd18d05's
   w2Arc27.ts + fix (a)) was RUNNING when I stopped; the successor runs it again. Left to trace after it (rule 28): kid/child falls on
   the out leg's rivers flowing at him (at-him x~7200-7500, upstream x~11150-11700). The kid is not the bar (rule 4); the proven list wants
   every bot, so report the yield with and without the kid.
4. **Suite:** the full unit suite on 32b01afee had 5 reds when I stopped (it was still running): inventory x2 (step 1), and three for 2-7
   at the bend (easyMode "checkpoints out of order" on Easy, heart at the flag 10128, flower at (9225,1434)), which step 2(a) should clear.
   Re-run the whole suite after step 2.
5. Then the list (`seedlist.ts 2-7`, `--check`, castBots --proven on the list), the flight for `judged` (`FLIGHT_STAGE=2-7 npx tsx
   reference/specs/sims/flight.ts normal all`, its rows into flownArcs.ts n27, then judged: 'normal-2-7'), registrycheck, the stills
   (every beat both ways 2x both settings, after the bots go green: rule 29), THE race clip, the full gate set.
Probes I used (scratch, not in the repo): the played-vs-built platform diff (firstTimer onFrame -> sim.stage.platforms vs libstage
buildStage) and the teleport trace (firstTimer onFrame: a jump of 150+ px in one frame is a respawn or a rescue).
## Ship verdict (step 1, D125)
| Head | castBots --proven 1-40, both settings, every bot | Cause |
|---|---|---|
| 7c040dfd4 | 0/40, discarded: the bots played the OLD hand build (w2Stages W2_STAGES['2-7'] wins first, stageGenerator.ts:2935) | Hand build still registered |
| 32b01afee | **0/40**: every bot, every seed, reaches the shrine with 1+ rescue (Easy: no lives lost, so one fixed spot) | World 2's finish (w2.ts:372) drops every solid under a SOFT fall at any depth. The out leg's porch-walk pits lie over the home leg's bounce bend, so its three banks are deleted in play (played-vs-built diff, Easy seed 2: 10078+340@1501, 9690+388@1325, 9390+300@1415). ENGINE-WORTHY, sent to the lead; ENG-JETTY is fixing it. |
| scratch: 32b01afee + fix (a), not committed | 1/40; without the kid 8/40. Under the 2:00 floor: adult Easy 23, adult Normal 12. Rescues: child Normal 5, adult Normal 5, child Easy 2, middle 1. Others PASS 35-40/40 | floor and porch walk-off, addressed in fafd18d05 |
## Done-items
1. Ship verdict: above (RED; cause traced, fix with engine). 2. Stage: w2Arc27.ts on its own row (kit `w2-27`): the arc, the boat
   (W2_RACE), the post (5 doors), the weir dress, the keeper's words (handover, race, turn, mission, journal page, find). The hand build is
   DELETED: W2_STAGES '2-7', its plan, flavours, the basket lift, mailman, doors, village end and drop builders, the frames and lift kinds,
   hint.2-7.basket/frames/open/porches (way.2-7 kept). liftRide.test and w2Stages.test re-pinned; stageSheets has no gold snake on 2-7.
   w2Arc27.test 5/5. planted-faults.py: 6/6 CAUGHT. 3-5: owed (blocked on the fix).
## Design changes (lead-accepted forks)
- The weir is laid `Dc_` (a column, which the weir's dress needs) for `Dg1_`. Its drops are walked step-downs: a jump gap in a column made
  World 2's finish throw on 2 of 12 rolls; now 40/40 build.
- `upstream` and `logs at him` are each laid as two in-sight reaches with a bank between. One 924 px reach flowing at him breaks riverLay's
  view rule, and one reach left the quick player under 2:00 (fast 130 s, floor 143). Now typical 175 s, fast 148 s, Easy fast 152 s.
- **5 doors, not 6.** Matt's rolled flags (8 on the out leg, 140 px clear each) leave room for 6 on about half the rolls; 5 doors: 22/24 clean.
## Gates (head 32b01afee)
| Gate | Verdict |
|---|---|
| tsc / generalitycheck / knowncheck / artcheck | PASS / PASS / PASS / PASS |
| registrycheck | FAIL, owed by me: no list yet; no drawcheck scenario; row not `judged` |
| roadmapcheck | FAIL: shallow clone, proofs cannot be checked (inherited; the same on main in this container) |
| unit suite (32b01afee) | 5 reds when I stopped: inventory x2 (my merge, step 1); 2-7 at the bend x3 (step 2a) |
## Polish check
None yet. Rule 29: no stills while the bots are red. The lead allowed stills of the beats the bend does not touch; they are next.
## Pushback
1. The design's 6 doors do not fit with Matt's rolled flags (above). 2. The design's 924 px `upstream` breaks the view rule (above).
## Unresolved
- win/lose at the jetty: no hook (ENG-JETTY). lift.ts is exists-unwired (no stage lays a basket lift; only its unit tests hold it).
- 2-7 has no `judged` flown scope (registrycheck): `FLIGHT_STAGE=2-7 npx tsx reference/specs/sims/flight.ts normal all` is owed.
## Learned (for the next builder)
- **Delete the hand build BEFORE the first bot run.** w2Stages' W2_STAGES wins over the stage table (stageGenerator.ts:2935), so the bots
  play the old stage while the build probes show the new one. Proposed rule: addlevel refuses a row whose id a hand-build table still holds.
- **Judge the PLAYED stage, not the built one** (rule 27 goes further than built-vs-data): libstage's buildStage keeps platforms that the
  played finish deletes. Diff the played stage's platforms (firstTimer onFrame, sim.stage) against buildStage's before tracing a bot.
- An out-and-back stage stacks one leg under the other. Every world finish rule that works by x span (drop, fill, reeds) must also check
  the y band. Proposed check: a planted stacked-leg toy through each world's finish.
