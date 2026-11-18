# PERF-BUILD (R-165.207) @ 0666874e (t-perf-build, merged t-int-5 e8afc05c). Method: perf-measure.md + engine card day one.
1. **Measured (D15).** Warm 1-1 build flat since 11-06 (node p50 13-15 ms at 11-06, 0.9.6, 0.9.7, t-int-5). buildcheck's tail is the COLD
   start: Normal's first 9 builds 76-136 ms then 30-60. Air frames per build (a count): 11-06/0.9.6 ~1.7M EVERY build; bisect -> cc5d29a86
   (BC-FIX 11-13 3:25 AM, maxRise once) removed that, leaving physics.ts's reach memo filled one height at a time: 683k frames in the
   first build + 1.59M over the next 10 = the tail. P11 f6776d2dc / Y2 7fcf330e3 (11-12) added the landing judge (warm, offset by BC-FIX
   b1ff2aee7). Same container: 11-06 Normal p95 90/99; t-int-5 159/142/120. No per-commit ms bisect (buildcheck needs the CPU alone).
2. **Root fix, every stage (D43):** physics.ts fills a reach table whole, one pass a flight (1-1's 8 tables: 66,640 frames once vs
   15,431,176); maxDropReach reads the tables; landings.ts windowsOf = one sweep + typed sort. Lock 102/102 unchanged; seedlist 1-1 PASS.
3. **buildcheck alone x5: 5/5 PASS.** Normal p95 105/108/121/110/128 (worst margin 22 ms, median 40); Easy 66/59/71/71/71 (>= 79).
   **Not "well under" on Normal yet:** what is left is JIT warm-up (interpreter-only: early builds = repeat builds; 0 air frames a build).
**Tests (planted first):** reachFill.test.ts: every entry, 11 table kinds x 2 ticks = frozen old simulateReach (dense on 1-1's, sampled
to past the range); maxDropReach = frozen old, keys 0-121; frames ceiling 120k (old: 15.4M, red); planted 14->13 px slack: 2 fail. (The
400 px rule can't bind today: a double jump rises < 400 px; kept to mirror.) landingsSweep.test.ts: every window = frozen old scan on
1-1's stages (>1000 ledges) + 3 toys; planted off-by-one: both fail.
**Gates** (full on f97fb779; 0666874e adds only FIX-INT's test + docs): tsc, generality, known, roadmap, artcheck, build+chunkcheck,
seedlist, tool tests, tierBots, kbd, clip, draw (566 s) PASS; suite 3,270 tests, 1 fail = stageQuality.test.ts:64, identical on base
b126ae3e, green 22/22 after merging FIX-INT; on 0666874e: that file, tsc, roadmap, known PASS. One container restart (OOM) mid-suite.
**Polish check:** no screen changed (lock 102/102), no stills.
**Lessons applied:** D15, D43, D55, D57, D59, LAWS 22 (budget and N untouched).
**Learned:** buildcheck's p95 = the first builds: print the per-build sequence; profile cold with `--no-opt --no-maglev --no-sparkplug`;
count work (air frames) not time when the CPU is shared, and `git bisect run` on the count. A memo filled key by key bills a phone's
first stages. Never leave scratch bundles in src/ (artuse.mjs scans it: broke artUse.test). 3 shards + lockall OOM'd 15 GB: one at a time.
**Method update (perf-measure.md):** add "stage-start build": per-build sequence, interpreter-only profile, frame counts + bisect run.
**EXACT NEXT STEP:** 1. Lead: Critic, integrate t-perf-build (physics.ts, landings.ts, 2 tests); gates.md row 9 -> "11-13: 105-128 /
59-71". 2. For more Normal margin: PERF-BUILD-2 on levelCheck.ts's per-build walk (~29% interpreted; token NODES-TRAVEL) and landings.ts
events() allocation (18%), each proven equal the same way.
