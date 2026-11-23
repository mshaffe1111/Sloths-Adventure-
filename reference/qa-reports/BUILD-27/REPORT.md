# BUILD-27 REPORT: 2-7 "The Mailman's Route" (t-build-27-wip; started 12:35 PM ET 11-23 by `date`; budget 2 h, report by 2:40 PM ET)
## EXACT NEXT STEP
1. When ENG-JETTY lands the w2.ts:372 fix on t-eng-27 (the lead: about 2:10 PM ET), merge origin/t-eng-27 into t-build-27, then run
   castBots --proven, seeds 1-40, both settings, on a frozen tree. Send the lead the yield.
2. Then build the list: `npx tsx tools/engine/seedlist.ts 2-7`, then `--check`, then castBots --proven on the list. Run registrycheck
   (it wants the list, the drawcheck scenario in tools/perf/limits.json, and a `judged` scope: see Unresolved).
3. When ENG-JETTY's win/lose hook lands, wire the keeper's `win`/`lose` ids. Then the stills (every beat, both ways, 2x, both settings),
   the race clip, and the full gate set on the head that goes to Matt.
## Ship verdict (step 1, D125)
| Head | castBots --proven 1-40, both settings, every bot | Cause |
|---|---|---|
| 7c040dfd4 | 0/40, discarded: the bots played the OLD hand build (w2Stages W2_STAGES['2-7'] wins first, stageGenerator.ts:2935) | Hand build still registered |
| 32b01afee | **0/40**: every bot, every seed, reaches the shrine with 1+ rescue (Easy: no lives lost, so one fixed spot) | World 2's finish (w2.ts:372) drops every solid under a SOFT fall at any depth. The out leg's porch-walk pits lie over the home leg's bounce bend, so its three banks are deleted in play (played-vs-built diff, Easy seed 2: 10078+340@1501, 9690+388@1325, 9390+300@1415). ENGINE-WORTHY, sent to the lead; ENG-JETTY is fixing it. |
| scratch: 32b01afee + the proposed one-condition fix (not committed) | (measuring; see cast40d in the box notes) | |
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
| unit suite | RUNNING |
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
