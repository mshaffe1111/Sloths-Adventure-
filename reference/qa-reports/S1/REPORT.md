# S1 INSPECT-ROUTE (R-165.176) report. Head t-s1@9bb17015 (base ccr-ea739a2f + t-diff-algo@1e5fe476). BLOCKED: read PUSHBACK.md first.
## Done (each test planted: red on the old code, green now; tools/inspect/routeHumps.test.ts, run by gates.yml:93)
1. route.ts:101-116, :239-257 `stepBetween`: a jump never passes over a body block, a stair or a shallow dip he stands on instead (taken when
   no harder on the flown single, gen2/reach.ts lesserArcs). Test 1 (1-1..1-3, seeds 1-2, both settings) was red on 33 such jumps.
   Test 2: 1-2's hump read `[gap 231, rise -1, "fall"]`; now gap 0, rise 53, retry. score.ts's own hump/dip correction deleted (:210).
2. stages.ts:63-85 builds as engine.ts:901 does, by the game's one predicate `builtOnGen2` (stageGenerator.ts:3106): 1-2/1-3 Easy no
   longer throw, 1-1 is the game's gen2 1-1 (it was the deleted hand-built one), old-generator stages get the layout number. Test 3.
   Pairs fixed: era.ts:336 and findSweep.mts:18 used the same wrong predicate.
3. Found on the way, same class: route.ts:81 asked validateStage, not validateAsJudged (levelCheck.ts:385), so 1-1 Normal's 254 px double
   gap needed a presumed hop on every layout, the meter's anchor included. Test 4.
4. `inspect.ts --stages 1-1,1-2,1-3` (and `--firsttimer`) runs; old crashed at 1-2 Easy. Re-score vs DIFFICULTY.md (SCALE held at 0.30654):
   Normal 1-1 4.0->4.1, 1-2 2.0->1.0, 1-3 1.1->1.2; Easy 1-1 2.4->2.5, 1-2 0.9->0.3, 1-3 0.6->0.7. Every moved number (meter, funcheck,
   tier bots, calibration, inspector): moved.md. 1-2 now sits 1.0 under Matt's 2: its 235 px "double" was a stair he walks down.
## Gates (head 9bb17015 unless named)
tsc PASS; tool tests (gates.yml:93 set + routeHumps) 60/60; tierBots.test 7/7 after the BOTS.md:11-12 recommit; score.ts --check 14/14;
knowncheck PASS; generality PASS; roadmapcheck PASS (after the lead-approved methods/README row); ciTests PASS; pipeline.test +
w5Arena.test (import route.ts) PASS at f14e6733 (route.ts unchanged since). **seedlist.ts 1-1 --check FAIL** (2 seeds): PUSHBACK.md. routeWalls.test.ts fails on base and head alike
(not in CI, known list). Not run: build, perf gates (tools-only branch, LAWS 5).
## Polish check: no screen, art or player word changed; no stills (tools only).
## Pushback: (1) PUSHBACK.md, route.ts feeds the 1-1 seed list. (2) "Never link over a dip", taken literally, would climb him out of 150 px
pit floors; a dip is split only when the way through is no harder. (3) The defect lived in route.ts; routeJumps (jumps.ts) needed no change.
## Suggestions: S1b JUMPS-HOIST (Engine): jumps.ts fly/maxRise (:114, :232) omit FORGIVE.mantle 26 px (physics.ts:45), so a rise reads ~19%
harder than flown (123 px): the meter calls 1-1's 79-82 px stump hops doubles (4 of seed 1's 12 heaviest). Done: a 110 px face reads single.
## Unresolved: the seed list (PUSHBACK.md); funcheck 1-3 "nothing bites" 0->11 of 16 (Normal), its "pits" were humps (not in CI).
## Method update (difficulty.md Traps): delete the two route traps; add "route.ts feeds listRules' quiet line: re-run seedlist --check".
## Learned: a tool that builds or routes a stage calls the game's own predicate and check (builtOnGen2, validateAsJudged), never a near twin;
and before changing a tool, grep who imports it (src/ tests and seed searches did). Lessons applied: D19, D21, D23 (base stamped), D40, D48.
## Turnover: engine-core.md not rewritten (tools-only packet; the lead to say if wanted).
