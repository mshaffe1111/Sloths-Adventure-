# GATE-FLAKE: clipcheck and stageQuality's speed test made load-proof (R-165.215, R-165.245, R-165.325)

Engine (tools) member, session_01FhBbYMwELLxM66X3iXAadC. Branch t-gate-flake from t-int-13 d36638be. Code head: see "Final head".

## EXACT NEXT STEP
(filled in at the stop)

## What changed and why
Both gates answered by the wall clock, so a busy box changed the answer (D15: a gate gives the same answer on the same code).

**stageQuality 'generating a stage is quick'** (src/game/stageQuality.test.ts, R-165.325). Timed by `performance.now()`, it failed at
p90 657 ms with 4 jobs running and passed alone (ENG-SMALL3). A stage is built in one synchronous run on the test's thread, so the work
it costs is that thread's own CPU time: `process.threadCpuUsage()`. Measured here (24 stages, best of 2):

| | wall p90 / max | thread CPU p90 / max |
|---|---|---|
| alone | 101 / 219 ms | 103 / 218 ms |
| beside 8 busy processes on 4 cores | 284-327 / 592-626 ms | 105-109 / 232-249 ms |

The bar is unchanged (p90 500 ms, max 1500 ms). It still fails on a real slowdown, because a real slowdown is more work on that thread.

**clipcheck** (tools/perf/clipcheck.mjs, R-165.215 / R-165.245). It slept a fixed time after each tap (30 sleeps, 200-7000 ms), capped
the judge's wait for pictures and pop-in animations at 2.5 s, and gave each screen 5-30 s to open (`waitFor`/`waitForFunction`
timeouts). Beside heavy jobs a still-loading screen was judged (INT-13b: 4 'stale' known entries, 74 of 83 seen) and a slow screen ran
out its 30 s (ENG-PROWL: 'how to play', old/up). Every wait now ends on the page's own state, counted in the page's own animation frames
(a starved box draws fewer frames, so each wait stretches with the load by itself). One line per wait is in reference/methods/gates.md
(Pitfalls, 2026-11-19 GATE-FLAKE). In short:
- `settle(ms)` -> `settle()`: until the page is STILL for 12 frames in a row: no request in flight (the browser's own request events),
  every picture loaded, fonts in, no finite CSS animation or transition running, no one-shot timer of 3 s or less pending (the app's
  own delays, e.g. the Skip button armed after 1.2 s), the DOM unchanged. At most 300 frames for a page that never goes still (a live
  stage's HUD changes every frame); it never fails, the judge after it decides.
- the judge's own 2.5 s cap -> the same `settle()`.
- `waitFor({ timeout })` -> `opens(selector)`: until Playwright sees it; FAILS when the page went still for 240 frames in a row without
  it, or after 4,500 frames of a page that never went still. **How a screen that never opens is told apart from a slow one:** a slow
  screen is never still (its script or pictures are coming, its card animating, a timer pending); a screen that will never open sits on
  a still page, so nothing left could open it. Planted on every walk: `opens('.cc-never-opens')` must fail with "went still without it".
- `waitForFunction(..., timeout)` -> `until(what, fn)`: the game's own state, frame by frame.
- the 7 s "stage started" sleeps (Pause, the testers' link) and 2.5-4 s ones (help offer, Game Over) -> `running()`: `data-hud=vine`
  and no `data-hud-card`, 10 frames in a row. The 700 ms / 1.5 s sleeps between put-backs and kills -> `frames(42)` / `frames(90)`.
- The one wall clock left is HANG_MS, 10 minutes for a page that draws no frame at all: a hang guard, never the verdict.
- Dot's first tip (R-165.245) was already walked by game frames (TOOLS-1, 11-14); its 10 s wait for the armed Skip is now `opens()`.

Three things the first runs found, fixed before the proof:
1. Playwright gives a request of the page before a `goto` neither a finished nor a failed event, so the in-flight count only grew
   (34 to 96 in one walk) and settles met their cap. The count is cleared when the main frame navigates.
2. Pause on the fresh save: `?autostart=1&level=1-1` opens the prologue first; its Escape finishes the story AND leaves 1-1 paused
   (keyboard only, a game quirk reported to the lead, not chased). The step now Escapes the story, waits for the stage running or
   paused, and presses for Pause only when Pause is not up (a second press resumed the stage and the walk judged the bare stage).
3. The testers' "I'm done" asks "Tap again to finish" for 3 s only (ControlTestGate.tsx); a settle over a live stage outlasted it. That
   tap now follows at once, as a player's does.

## The plants
- stageQuality: `setBuildRepeatForTest(n)` (stageGenerator.ts) builds every stage n times over, as a doubled loop would. A permanent
  test sizes n from the same run's p90 (so the planted p90 is at least 1.25 x the bar) and must see the speed test fail, every run. By
  hand with every stage built 6 times over, the speed test itself: `not ok 1 ... 'p90 517 ms'` (plant-red-x6.txt).
- clipcheck: the never-opening screen above, every walk, every run; the existing planted 26 px buttons and too-tall card still run.

## Proof tables
(filled in)

## Gate table
(filled in)

## Learned
(filled in)
