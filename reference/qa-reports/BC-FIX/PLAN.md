# BC-FIX plan (R-165.163): 1-1's stage build, profiled before any code (2026-11-12 10:06 PM ET, base t-int-2@f01c76f7)

## Finding (Chromium CPU x4 CDP profile, 20 builds of buildtime.ts, 1-1 proven seeds, Normal + Easy: 360 ms a build)
1. 73% of a build (263 ms of 360) is the landing judge, src/game/gen2/landings.ts deadZones:226 -> Landings.cleanWay:167 -> windows:151
   (212 ms) and walk:137 (61 ms) -> events:70 (188 ms SELF: every piece x every frame of every flight) and windowsOf:191 (54 ms: each
   cut re-scans all ~80 events, only ~15 of them can touch the take-off window).
2. Y2 (7fcf330e): pipeline.ts:3070 checkAndRepair -> repairLandings:285 = 138 ms a build (purposelessBounces:291 + deadZones:296, + a third Landings at :298 when a petal moves).
3. P11 (f6776d2d): pipeline.ts:3252 applyVerdicts -> judgeRoll -> promises11.ts:168 landing.dead-zone (134 ms) + :174 bounce.no-purpose (7 ms).
4. Counted (node, 10 seeds a setting): 4 `new Landings` a build on the SAME ~146 pieces (repair 2, verdict 2), none shares the others'
   flights: 1,411 events() and 959 windowsOf() calls a build, 80 events a windowsOf call, 15 of them inside its window.
5. The rest (validateStage 58 ms, maxRise 37, airStep 21, assemble 14) predates P11/Y2 (d0276817 measured 104/85 ms p95).

## Fix (identical results; the judge's rules, buildcheck's 150 ms and every list untouched)
- One Landings per piece set: a memo keyed on the same piece objects in the same order AND their fields unchanged (x, y, width,
  height, type, broken) and the setting, so repair and verdict fly each ledge's flights once (pure: LAND_FLIGHTS is a constant table).
- events(): a flight's first catch frame for a top is memoized per path (the same scan, done once per top value); the event list,
  its insertion order and its stable sort kept exactly, so first() picks the same event.
- windowsOf(): reads only the events whose (lo, hi) can meet (a, b) (a subsequence of the same sorted list: same cuts inside (a, b),
  same first event at every midpoint, same sums in the same order).
- Proof: an equivalence test (old judge vs new on every 1-1 proven seed, both settings: deadZones, purposelessBounces, repairLandings
  identical), lockall --check vs f01c76f7 unchanged, seedlist 1-1/1-3 --check, then buildcheck quiet, one run at a time.
- If that is not enough under 150 ms: the next costs by the same profile, never the budget.
