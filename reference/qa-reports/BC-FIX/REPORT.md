# BC-FIX REPORT (R-165.163): 1-1's stage build back under budget, every result identical (base t-int-2@f01c76f7, branch t-bc-fix)

**Cause** (PLAN.md, CDP profile at CPU x4): 73% of a build was landings.ts's judge. P11's verdict (promises11.ts:168, 134 ms) and Y2's
repair (pipeline.ts:3070 repairLandings, 138 ms) each built fresh Landings: 4 a build on the same ~146 pieces, re-flying every ledge;
events() re-scanned every frame per piece; windowsOf re-scanned ~80 events per cut. Older, same budget: protoCheck maxRise()
re-simulated 110 double jumps on every blockBetween of the level check (36 ms a build at x4).

**Fix** (cheaper work; 150 ms, verdicts, fairness rules and lists untouched):
- landingsOf: one Landings per piece set (same objects, same order, judged fields unchanged, same setting); cleanWay kept per landing.
- catchFrame / stopFrames: a flight's catch frame and a wall's stop frames kept per path and top (the same scans, once).
- windowsOf reads only the events meeting its span (after the unchanged sort); a landing flies only the flights whose own events on
  it meet the take-off span (windowOnto, mayWalkOnto: a piece's events never depend on the others).
- maxRise() flown once (it reads only PHYS, `as const`, assigned nowhere).

**Before / after** (buildcheck, quiet box, one run at a time; p95 Normal / Easy, CPU x4): INT-2 on 465023ef 446 / 430 FAIL; code
cc5d29a8: 105 / 57, 103 / 70, 126 / 81 (three runs) PASS. Node, 30 builds: p50 87 / 83 ms -> 16 / 13 ms.

**Identical results:** 257 listed 1-1 seeds x 2 settings, base vs head in one process: stageParts, verdicts, repairs, errors, drops; the
judge on 2,056 piece sets (each stage + 3 perturbed copies): deadZones, purposelessBounces, repairLandings, 317,314 cleanWay answers (92
differences found on a planted fault). 16 unlisted seeds x 2, full search (3 cap, 6 petal repairs): identical. lockall --check vs
f01c76f7 102/102 unchanged; 1-1/1-2/1-3 verdicts and drops (unhashed by the lock) identical, 96 builds. seedlist 1-1 PASS (257), 1-3
PASS (100). landingsMemo.test.ts: red without the field check, red with a wrong skip, green on the fix.

**Gates (cc5d29a8):** tsc; suite 3,122 tests 0 fail (2 old TODOs); BASE_PATH build; chunk, art, draw, clip (83 known, same), known,
generality, roadmap, kbd, build checks; seedlist; engine tool tests 33/33; tierBots 7/7: all PASS.
**Suggestions:** validateStage is now the biggest cost (~50 of ~100 ms at x4), then 112 full flight lists a build (~17 ms).
**Method used:** perf-measure.md; stage-fix lock day one. **Lessons applied:** profile and PLAN before code; test the measuring tool
(planted fault); the gate's own page profiled; times from date; D29 (every seed test after the change).
**Method update (proposed):** perf-measure.md "Stage build time": CDP Profiler over window.buildTimes on tools/perf/buildtime.html at
setCPUThrottlingRate 4. Trap: events()'s sort ties null with everything, so prune only AFTER the sort.
**Learned:** the cheapest fix was sharing work two features each did alone; a constant re-simulated per call hid in the level check.
