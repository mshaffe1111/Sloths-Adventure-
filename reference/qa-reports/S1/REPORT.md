# S1 INSPECT-ROUTE (R-165.176) report. Head t-s1@c3499746 (base ccr-ea739a2f + t-diff-algo@1e5fe476). NOT MERGEABLE: 4 suite fails (below).
## Done (each test planted: red on the old code, green now; tools/inspect/routeHumps.test.ts, run by gates.yml:93)
1. route.ts:101-116, :239-257 `stepBetween`: a jump never passes over a body block, a stair or a shallow dip he stands on instead (taken when
   no harder on the flown single, gen2/reach.ts lesserArcs). Test 1 (1-1..1-3, seeds 1-2, both settings) was red on 33 such jumps.
   Test 2: 1-2's hump read `[gap 231, rise -1, "fall"]`; now gap 0, rise 53, retry. score.ts's own hump/dip correction deleted (:210).
2. stages.ts:63-85 builds as engine.ts:901 does, by the game's one predicate `builtOnGen2` (stageGenerator.ts:3106): 1-2/1-3 Easy no
   longer throw, 1-1 is the game's gen2 1-1 (it was the deleted hand-built one). Same predicate fixed in era.ts:336, findSweep.mts:18. Test 3.
3. Same class, found on the way: route.ts:81 asked validateStage, not validateAsJudged (levelCheck.ts:385), so 1-1 Normal's 254 px double
   gap needed a presumed hop on every layout, the meter's anchor included. Test 4.
4. `inspect.ts --stages 1-1,1-2,1-3` runs; old crashed at 1-2 Easy. **Meter vs DIFFICULTY.md** (SCALE held 0.30654): Normal 1-1 4.0->4.1,
   1-2 2.0->1.0, 1-3 1.1->1.2; Easy 1-1 2.4->2.5, 1-2 0.9->0.3, 1-3 0.6->0.7. 1-2's 235 px "double" was a stair he walks down. Every moved
   number (meter, funcheck, tier bots, calibration, inspector): moved.md.
5. Lead's option A: 1-1 list re-laid in order (c3499746): seeds 28729, 43005 get new plans under the 4 s quiet line; 255 layouts unchanged.
   Tier-bot calibration recommitted (8cb42173, BOTS.md:11-12); variants 1-40 untouched by the list change.
## Gates (c3499746)
PASS: tsc; seedlist 1-1 --check (257); release.md item 6 roll/seed tests 31/31; tool tests 60/60; tierBots 7/7; score.ts --check; knowncheck;
generality; roadmapcheck; ciTests; build (BASE_PATH); chunkcheck; artcheck; buildcheck run alone (p95 115 ms; base 122; it read 175 ms
while the suite ran beside it). **FAIL: full suite 3116 pass / 4 fail**, all pass on the base and all pass with only stepBetween off:
w5.test:154 roll diversity 0.311 (<0.35); w6.test:239 6-4 diversity 0.263; w7.test:124 7-3 9 of 16 raw rolls quiet; firstTimerBot.test:176
KID_RUNS_59 the same runs {3,5,6,7} in a new order (goal unchanged). Not run (stopped by the lead): drawcheck, clipcheck, kbdcheck.
## Polish check: no screen, art or player word changed except 2 of 1-1's 257 layouts (74, 111); no stills taken of them.
## Pushback / open questions for the lead
- The step rule is right about the ground but the route feeds content rules (listRules' quiet line, worlds' quiet/diversity tests, recorded
  kid runs): over-hump "jumps" were counted as action. My pick: land S1 now WITHOUT stepBetween (revert it, the score.ts deletion and the
  1-1 list; keep 2, 3 and test 3/4; re-run the calibration), and give the step rule its own packet with Worlds 5-7's owners. Your call.
- ADD-LEVEL's 1-2 list, if built on t-s1, is judged on the step route.
- "Never link over a dip", taken literally, would climb him out of 150 px pit floors; a dip is split only when the way through is no harder.
## Suggestion: S1b JUMPS-HOIST: jumps.ts fly/maxRise (:114, :232) omit FORGIVE.mantle 26 px (physics.ts:45), so a rise reads ~19% harder than
flown; the meter calls 1-1's 79-82 px stump hops doubles. Done: a 110 px face reads single.
## Unresolved: the 4 fails; funcheck 1-3 "nothing bites" 0->11 of 16 (not in CI); routeWalls.test fails on base and head alike (not in CI).
## Method update (difficulty.md Traps): delete the two route traps; add "route.ts feeds listRules and world tests: run the full suite".
## Learned: grep who imports a tool before changing it (src/ tests, seed searches and recorded runs did); a tool calls the game's own
predicate and check (builtOnGen2, validateAsJudged). Lessons applied: D19, D21, D23, D29, D40, D48, D52. Turnover note: not rewritten.
