# ENG-W3a REPORT (World 3's kit on gen2 + a draft 3-1 that travels DOWN)
**EXACT NEXT STEP (box 2, from 11:55):** the bots on a way DOWN: expert seed 3 now 0 rescues (145.6 s), seeds 1/2/4 three each
(stalls: 'in a dip 287 px deep, the way on is ~120 px down' on a catch, and a jump onto a near-level catch at a step-off). Timebox
the bots to 12:10 ET; then addlevel's draft mode, w3.test.ts + the plant, stills, the suite on a frozen tree. If the bots are not at
40/40 by then, send the lead the cut (a down-bot packet) with the numbers.
Start 11:27 AM ET (by `date`). Box 1 ended 11:55. Hours used at box 1 end: 0.47 of 2.

## Done so far (t-eng-w3-wip-a, candidate)
- PUSHBACK.md (e6d3f1ef0): addlevel READY vs a draft row; stagePlan travel flips the live 3-1. Lead ruled A, general draft state.
- src/game/gen2/worlds/w3.ts: World 3's kit (W3_GROUND, W3_ART from the w3 inventory, W3_CAST ocelot/jaguar rows, a ledge / drops /
  shelf-walk pool for the way down), listed.ts KITS 'w3' with World 3's own (empty) finish, never World 1's.
- stageTable.ts DRAFT_TABLE + draftRow ('3-1': kit w3, travel down); listed.ts draftListed; tools/engine/draft.ts (GEN2_DRAFT=<id>:
  row installed, HAND_STAGES/W2_STAGES shadow lifted, plan travel set, tool process only); libstage + castBots import it first.
- gen2's DOWN flow, two engine defects found by the first down rows (no listed stage travels down, so no lock moves):
  1. tower.ts towerCatches rule 4 going down searched only 287-296 px under an open end (TOWER.clear+30 to TOWER.see-4): cramped there,
     blind drops of 350-560 px were left (9 of 12 toy rolls, 11 of 12 W3 rolls). Now the band, then up to HEAD under the piece.
  2. the floor walk to the shrine (past the last section) was never on the route measure (routeAt clamps to the last leg) and never a
     flag spot: 'the last 2045-2361 px of way from the exit' on 4 of 24. Now routeAt measures it (down only) and the floor is a spot.
  Result: W3 down kit, 24 of 24 seeds clean on both settings (gen2 verdicts + levelCheck), fast model 146-165 s.
- Bots on a down tower (tools/inspect/towerRoute.ts, firsttimer.ts; down-only, so no climb or run moves): a down tower's own route
  always (the tracer read it as a run); its drops walked off ledge ends, ledge by ledge (dropTo), a turn straight down its vine; the
  bot presses down onto a turn's vine top, steps off (not jumps) where the way on is under him, toward the first route point below.
  Expert seed 1: 17 rescues -> 3. World 3 drops are step-offs now (gapPx 8-20); a down catch keeps HEAD room (no squeezed shelf).
