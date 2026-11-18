# PERF-BUILD plan (R-165.207), 5:09 PM ET, branch t-perf-build from origin/t-int-5 (b126ae3e)
Found (D15, measured): 1-1's warm build is flat since 11-06 (node p50 13-15 ms at 11264, 0.9.6, 0.9.7, t-int-5). buildcheck's tail is the
COLD start: Normal (measured first) runs 76-136 ms for its first 9 builds, then 30-60; Easy 25-60 (Chromium x4, this container). Cause:
physics.ts reachAt fills its reach memo one height at a time, a double jump = 36 full flights each; builds 1-8 simulate 100k-680k air
steps (interpreted: 90-200 ms vs ~50 with the memo full). Second: landings.ts windowsOf is O(n^2) (113 flights x 92 events a build).
Fix: (1) physics.ts fills a whole reach table in one pass per flight (one path answers every height); a test proves every entry of all 8
tables equals the old per-height simulation (a frozen copy). (2) landings.ts windowsOf as a sweep, answers unchanged (test vs old).
WRITE: src/game/physics.ts (reach memo only), src/game/gen2/landings.ts, new src/game/reachFill.test.ts, new
src/game/gen2/landingsSweep.test.ts, reference/qa-reports/PERF-BUILD/*. Not touched: pipeline.ts, levelCheck.ts, seed lists, gates, limits.
Proof: lock 102/102 unchanged, seedlist 1-1 --check, buildcheck x5 alone, full Checks.
