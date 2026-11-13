# S1 INSPECT-ROUTE plan (R-165.176), written 10:17 AM ET on t-s1 (= origin/ccr-ea739a2f-dfcee4 + origin/t-diff-algo@1e5fe476)
1. Read: route.ts findRoute/move, jumps.ts routeJumps/inspectJumps, stages.ts:92, score.ts:213-233 (the meter's hump/dip workaround).
2. Planted tests first (red now): a hand-built stage with a raised block between two banks, one with a dip; routeJumps must not link
   the banks over either; 1-2 seed 1 must read its hump as a hop of about 53 px. A planted test that 1-2 builds on Easy via stages.ts.
3. Fix in route.ts (split a bank-to-bank move over a hump into hop/walk/drop; over a dip into drop/walk/hop) so routeJumps sees real
   jumps; stages.ts builds a designed (gen2/arc) stage on Easy the way the game does (no easyStage on a Normal build).
4. New replaces old: delete score.ts's hump/dip correction once the route is right; re-score 1-1/1-2/1-3 both settings vs DIFFICULTY.md.
5. inspect.ts --worlds 1 --stages 1-1,1-2,1-3 runs. Fast gates: tsc, tools tests, knowncheck, generality, roadmapcheck. REPORT.md.
WRITE: tools/inspect/route.ts, tools/inspect/jumps.ts, tools/inspect/stages.ts, tools/inspect/routeHumps.test.ts (new),
tools/difficulty/score.ts, reference/qa-reports/S1/*; added during the work (same defect, its pairs): tools/inspect/era.ts,
tools/inspect/findSweep.mts, reference/qa-reports/R-165.59/calibration-main.jsonl (BOTS.md:11-12 recommit). ASK: gates.yml:93 gains tools/inspect/routeHumps.test.ts (ciTests rule).
