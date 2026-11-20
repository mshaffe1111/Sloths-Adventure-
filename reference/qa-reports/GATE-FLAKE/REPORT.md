# GATE-FLAKE: clipcheck and stageQuality's speed test made load-proof (R-165.215, R-165.245, R-165.325)

Engine (tools) member, session_01FhBbYMwELLxM66X3iXAadC. Branch t-gate-flake from t-int-13 d36638be.

## EXACT NEXT STEP
(filled in at the stop)

## What each wait became, and why
(see reference/methods/gates.md "Pitfalls", the 2026-11-19 GATE-FLAKE entry: one line per changed wait)

## The plants
- stageQuality: `setBuildRepeatForTest(n)` in stageGenerator.ts builds every stage n times over (a doubled loop). A permanent test sizes
  n from the same run's p90 and must see the speed test fail, every run. By hand, built 6 times over: `not ok ... 'p90 517 ms'`
  (plant-red-x6.txt).
- clipcheck: every walk waits on `.cc-never-opens`, which nothing shows; it must fail as "the page went still without it", every run.

## 5-run tables
(filled in)

## Gate table
(filled in)

## Learned
(filled in)
