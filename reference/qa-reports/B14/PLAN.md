# B14 PLAN (1-4 Up the Kapok), t-b14, written 10:18 AM ET. Built on main 0.9.7 + t-lattice (merged c0342b3f) + FA piece 1 + B15 bough (when they land).
1. Pieces (general, any stage; planted tests): falling pods down a column (creak + fluff 1.0 s tell, knock to the catch bough, heart by data);
   the cluster gate (a cluster freed falls as a pod and as a drop-trap load; its bough lifts a notch per cluster, opens on the last).
2. Feel room v2 on the QA entry (crude shapes): lane 2 pods on one beat, lane 3 a two-cluster gate under pods. Path to the lead by ~2 PM.
3. The level (on FA's lay + B15's bough): Easy + Normal, story lines, score 4.5 +-1, bots 40 rolls, seed list, 1-4 in drawcheck + every stage gate.
WRITE (new): src/game/podfall.ts, podfall.test.ts, src/game/gen2/worlds/w1Arc14.ts (+ its tests), tools/engine/library14.ts (+ .test.ts),
   reference/design/1-4.md (copied from t-15-design@dee8c8c0), reference/qa-reports/B14/*.
WRITE (existing): src/game/vineField.ts(+test), vineFieldArt.ts, feelPairStage.ts, feelPair.ts, feelPairRoom.test.ts (LATTICE's, now mine);
   src/game/protoStage.ts (delete the hand-built 1-4 only); gen2/worlds/w1.ts (hook 1-4 only), stageTable.ts (a 1-4 row), stagePlan.ts (1-4 row).
ASK FIRST (shared): src/game/engine.ts (pod + gate wiring, in their own blocks: FA's camera and B15's bough may touch it too), src/game/types.ts
   (Stage.pods, Stage.gates), 1-4's seed list (a new file), tools/perf/drawcheck.mjs (add 1-4, D51). Not mine: pipeline.ts, gates.yml, limits.json.
