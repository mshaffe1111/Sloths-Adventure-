# BC-FIX REPORT (R-165.163): 1-1's stage build back under budget, every result identical (base t-int-2@f01c76f7, branch t-bc-fix)

**Cause** (PLAN.md, CDP profile at CPU x4): 73% of a build was the landing judge, landings.ts. P11's verdict (promises11.ts:168, 134 ms)
and Y2's repair (pipeline.ts:3070 repairLandings, 138 ms) each built fresh Landings: 4 a build on the same ~146 pieces, re-flying every
ledge's flights; events() re-scanned every frame for every piece; windowsOf re-scanned ~80 events per cut. Older, but in the same budget:
protoCheck maxRise() re-simulated 110 double jumps on every blockBetween of the level check (36 ms a build at x4).

**Fix** (cheaper work, nothing loosened; 150 ms, verdicts, fairness rules and lists untouched):
- landingsOf: one Landings per piece set (same objects, same order, judged fields unchanged, same setting); cleanWay kept per landing.
- catchFrame / stopFrames: a flight's catch frame and a wall's stop frames kept per path and top (the same scans, once).
- windowsOf reads only the events meeting its span (after the unchanged sort); a landing flies only the flights whose own events on
  it meet the take-off span (windowOnto, mayWalkOnto: a piece's events never depend on the others).
- maxRise() flown once (it reads only PHYS, `as const`, assigned nowhere).

**Before / after** (buildcheck, quiet box, one run at a time; p95 Normal / Easy at CPU x4, budget 150):
INT-2 on 465023ef: 446 / 430 FAIL. This head: <FILL>. Node, 30 builds: p50 87 / 83 ms -> 16 / 13 ms.

**Proof of identical results:** all 257 listed 1-1 seeds x 2 settings, base vs head in one process: stageParts, verdicts, repairs,
errors, drops identical; the judge on 2,056 piece sets (each stage + 3 perturbed copies): deadZones, purposelessBounces, repairLandings
and 317,314 cleanWay answers identical (the harness found 92 differences on a planted fault). 16 unlisted seeds x 2 (full search, 3 cap
and 6 petal repairs among them): identical. seedlist 1-1 PASS (257), 1-3 PASS (100); lockall --check vs f01c76f7: <FILL>.
New test landingsMemo.test.ts: red without the field check, red with a wrong skip, green on the fix.

**Gates (CLAUDE.md Checks on <FILL>):** <FILL>

**Method used:** perf-measure.md (profile ranks causes, CPU x4 only as the gate's own setting); stage-fix lock day one.
**Lessons applied:** prove a change needed with the fixed tool (profile first, PLAN pushed first); test the measuring tool (planted
fault in the harness); a gate calls the same code (buildcheck's own page profiled); times from date; D29 (seed tests after the change).
**Method update (proposed):** perf-measure.md gets "Stage build time": `Profiler.start` over window.buildTimes on
tools/perf/buildtime.html with `Emulation.setCPUThrottlingRate 4` (vite's lines run a little past the source's); and the trap: a
sort comparator that ties null with everything makes pruning before a sort unsafe; filter after it.
**Learned:** the cheapest fix was sharing work two features each did alone; a constant re-simulated per call hid in the level check.
