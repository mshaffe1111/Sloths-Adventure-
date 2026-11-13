# S1 INSPECT-ROUTE (R-165.176) report. Code head t-s1@3f862fe9 + calibration (base ccr-ea739a2f + t-diff-algo@1e5fe476).
## Done (each test planted: red on the old code, green now; tools/inspect/routeHumps.test.ts, run by gates.yml:93)
1. route.ts `stepBetween` (:244-262), on when asked (`findRoute(.., { steps: true })`): a jump never passes over a body block, a stair or a
   shallow dip he stands on instead (taken when no harder on the flown single, gen2/reach.ts lesserArcs). **The meter only** (score.ts:197),
   by the lead's 11:30 AM ruling. Test 1 (1-1..1-3, seeds 1-2, both settings) was red on 33 such jumps. Test 2: 1-2's hump read
   `[gap 231, rise -1, "fall"]`; now gap 0, rise 53, retry. score.ts's own hump/dip correction deleted.
2. stages.ts:63-85 builds as engine.ts:901 does, by the game's one predicate `builtOnGen2` (stageGenerator.ts:3106): 1-2/1-3 Easy no
   longer throw, 1-1 is the game's gen2 1-1 (it was the deleted hand-built one). Same predicate fixed in era.ts:336, findSweep.mts:18. Test 3.
3. Same class, found on the way: route.ts asked validateStage, not validateAsJudged (levelCheck.ts:385), so 1-1 Normal's 254 px double gap
   needed a presumed hop on every layout, the meter's anchor included. Every route user gets this. Test 4.
4. `inspect.ts --stages 1-1,1-2,1-3` runs; old crashed at 1-2 Easy. **Meter vs DIFFICULTY.md** (SCALE held 0.30654): Normal 1-1 4.0->4.1,
   1-2 2.0->1.0, 1-3 1.1->1.2; Easy 1-1 2.4->2.5, 1-2 0.9->0.3, 1-3 0.6->0.7 (world1-fixed-scale.txt). 1-2's 235 px "double" is a stair.
5. 1-1's seed list: the shipped one (no change in src/game/gen2 against the base). Tier-bot calibration re-run on the route with
   validateAsJudged and recommitted (BOTS.md:11-12): middle rescues 1->0 (Easy); child Normal put-backs 2.58->1.75 and expert Normal
   0.38->0.68 now miss their tolerance; child Normal rescues 8->13. The table did not pass before either (BOTS.md:13-15).
## Gates (3f862fe9)
tsc PASS; full suite PASS (3120 pass, 0 fail, 2 todo already on main); seedlist 1-1 --check PASS (257); tool tests incl. tierBots 7/7 and routeHumps 4/4 PASS;
score.ts --check PASS; knowncheck, generality, roadmapcheck PASS. Earlier head c3499746: build, chunkcheck, artcheck, buildcheck (alone)
PASS, and none of their inputs changed since. Not run (the lead stopped the task): drawcheck, clipcheck, kbdcheck.
## Findings for R-ids (the step route, when gates and bots move onto it; all pass on today's route)
- w5.test.ts:154 roll diversity 0.311 (<0.35); w6.test.ts:239 6-4 diversity 0.263; w7.test.ts:124 7-3: 9 of 16 raw rolls quiet;
  firstTimerBot.test.ts:176 KID_RUNS_59: the same runs {3,5,6,7} in a new order (5-9's Easy goal unchanged).
- 1-1 seeds 28729 and 43005 read 4.1 s and 4.4 s quiet on Normal (over 4 s); funcheck 1-3 "nothing bites" 0->11 of 16 (moved.md).
## Polish check: no screen, art, layout or player word changed; no stills (tools and recorded bot runs only).
## Pushback: "Never link over a dip", literally, climbs him out of 150 px pit floors; a dip is split only when the way through is no harder.
## Suggestion S1b: jumps.ts fly/maxRise (:114, :232) omit FORGIVE.mantle 26 px (physics.ts:45): rises read ~19% hard, stump hops "doubles".
## Method update (difficulty.md Traps): drop the 2 route traps; add "route.ts feeds listRules and world tests: run the full suite".
## Learned: grep who imports a tool before changing it; call the game's own predicate/check. Lessons: D19 D21 D23 D29 D40 D48 D52.
