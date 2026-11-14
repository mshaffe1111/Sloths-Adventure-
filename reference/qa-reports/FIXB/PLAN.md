# FIX-B plan (t-fixb, from origin/ccr-ea739a2f-dfcee4 + origin/t-fa@0f5b0550; written 12:04 PM ET, before any code)
1. R-165.122 hop rocks: hopLay is on main (pipeline.ts:183, hopRocks.test.ts). Prove it with one pasted run of the real 1-1 (every
   solid under 50 px on the floor walked at on the real engine) + the commit; mark it. No code unless the run shows a walk-through.
2. R-165.174 1-2 bounce chains: a cadence test (planted) on the teach chains vs the end chains, then the fix in 1-2's data; seed list
   rebuilt with the normal filter only if --check fails.
3. R-165.150 low W1 pieces: a test (planted) over every W1 piece under WALL_H; the data edit as reference/qa-reports/FIXB/w1.patch.
4. R-165.151 control course deleted: stageGenerator.ts CTEST_STAGE_ID + its build, stageSheets.ts ctestMixDraws/CTEST_FOES,
   stagePreload.ts mix code, protoStage.ts 'ctest' plan (ASK: not in the packet's list) and the tests that built it.
5. R-165.157 #ctest plays 1-3: App.tsx ctestLevel and its 1-1 literal; first-play coaching checked on the real page.
WRITE: src/game/stageGenerator.ts, stageSheets.ts, stagePreload.ts, protoStage.ts (ctest plan only, ASK), App.tsx (ctest only),
1-2's data (src/game/gen2/worlds/w1Arc12.ts; NOT w1.ts; 1-2 has no proven list today), their tests, reference/qa-reports/FIXB/.
