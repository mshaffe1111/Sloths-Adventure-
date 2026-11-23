# ENG-W3a REPORT (World 3's kit on gen2 + a draft 3-1 that travels DOWN)
**EXACT NEXT STEP (box 2):** make the bots go DOWN a drops section (castBots on GEN2_DRAFT=3-1 seed 1: every bot reaches the shrine only
by 11-19 rescues, each 'the way on is ~120 px down', tools/inspect/firsttimer.ts:2318-2342 keeps `this.way` when the way on is below
and close across; tools/inspect/towerRoute.ts within() draws a no-vine down leg as one diagonal). Then addlevel's draft mode, w3.test.ts
(+ the plant), stills, the frozen-tree runs.
Start 11:27 AM ET (by `date`). Box 1 ended 11:5x. Hours used: 0.3 of 2.

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
