# GATE-FLAKE: clipcheck and stageQuality's speed test made load-proof (R-165.215, R-165.245, R-165.325)

Engine (tools) member, session_01FhBbYMwELLxM66X3iXAadC. Branch t-gate-flake from t-int-13 d36638be. Code head: see "Final head".

## EXACT NEXT STEP (Friday 8:30 AM, a fresh member)
Stopped clean at the 11:15 PM ET box (11:06 PM by `date`) with the code done and pushed; the proof is 2 of 5 loaded runs (table below). On t-gate-flake at the final
head (the commit that adds this report section; ls-remote it):
1. `npm install --no-audit --no-fund --legacy-peer-deps` (this container had no node_modules), then `git checkout package-lock.json`.
2. The 5-run loaded proof on that one head: start the load (`drawcheck` + suite shards 1/6, 2/6, 3/6, each in a loop: the scripts are
   copied in this folder as `load.sh` and `proof.sh`), then `N=5 TAG=load proof.sh` (it runs clipcheck then the speed test, 5 times,
   and stops the load). Expect about 18 min a clipcheck run under this load (load average 20-34 on 4 cores). Then once alone:
   `node tools/perf/clipcheck.mjs` and `npx tsx --test --test-name-pattern="generating a stage|speed test" src/game/stageQuality.test.ts`.
   Pass: all 5 clipcheck runs PASS (83 known, 0 new, 0 stale, every 'planted never-opening screen ... FAILED as it must' line), all 5
   speed runs pass 2/0. Fill the "after" table.
3. Item 4 of the packet: the CLAUDE.md check list, every item, once, on that head (suite in 6 shards, run_in_background, timeout
   over 30 min), every line PASS or FAIL. Not started tonight.
4. Send the lead the hash; ROADMAP rows R-165.215, R-165.245 (done by these commits) and R-165.325 (on the lead's branch) are the
   lead's to close once 2-3 are green.

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
Before (the base, d36638be's tools):

| run | where | result | wall |
|---|---|---|---|
| clipcheck quiet (here, 9:31 PM) | d36638be | PASS (83 known) | 267 s |
| clipcheck beside 3 suite shards + paintcheck (INT-13b, 11-19) | 4529d5e6 tree | FAIL: 4 'stale' known, 74 of 83 seen | 900 s |
| clipcheck beside suite + seed lists + drawcheck (ENG-PROWL, 11-19) | ee28d135 | FAIL: 'how to play' (old/up) past its 30 s | 781 s |
| speed test beside 4 jobs (ENG-SMALL3, 11-19) | its head | FAIL: p90 657 ms (wall) | - |
| speed test, 24 stages, here | d36638be | wall p90 101 alone, 284-327 beside 8 busy processes | - |

After, beside drawcheck + suite shards 1/6, 2/6, 3/6 looped (load average 19-34 on 4 cores):

| run | head | clipcheck | wall | speed test (thread CPU) |
|---|---|---|---|---|
| L1 | f11bc2d4 | every real screen opened; 83 known seen, 0 new, 0 stale. FAIL only on the planted never-opening screen's own rule (it failed by the frame cap, not as "went still": the title keeps fetching under load), fixed in 3858372a | 1,066 s | pass 2/0 |
| L2 | 3858372a | PASS (83 known, 0 new, 0 stale; the planted never-opening screen FAILED as it must on all 6 walks, by the 600-frame cap: "the page never went still: a request") | 877 s | pass 2/0, CPU p90 87 ms, max 207 |
| L3 | 3858372a | PASS (83 known, 0 new, 0 stale; plant FAILED as it must on all 6 walks) | 806 s | pass 2/0, CPU p90 102 ms, max 241 |

So far on 3858372a: 2 of 2 loaded clipcheck runs and 2 of 2 loaded speed runs agree (PASS), against 2 of 2 loaded clipcheck FAILs and
1 speed FAIL on 11-19's heads. Owed (next step 2): 3 more loaded runs and 1 alone run on one head.

Quiet runs of the new waits on the way: f11bc2d4 quiet found two real step bugs (Pause on the fresh save; the testers' second tap),
fixed and step-checked (`CLIPCHECK_STEPS=pause`: 3 walks PASS, the Pause card judged, still checked by eye; `testers link, help offer,
Dot's first tip, stories`: 2 walks PASS).

## Gate table
| gate | head | result |
|---|---|---|
| `npx tsc --noEmit -p .` | 3858372a | PASS |
| stageQuality speed tests (2) | 3858372a | PASS (loaded, above) |
| the rest of the CLAUDE.md list | - | NOT RUN tonight (next step 3) |

## Learned
- A wait on "the page is still" must count the browser's requests itself, and a request of the page before a `goto` never ends in
  Playwright's events: clear the count on navigation, or every later wait looks busy.
- Under real load the title page keeps fetching for minutes, so "went still" is not the only honest failure of a never-opening screen;
  the frame cap on a never-still page is the other. Both are frames, not seconds.
- A test-only key path can hide a game quirk: on a fresh save, Escape on the prologue both finishes it and pauses 1-1 (keyboard only).
- Time the work, not the room: thread CPU time held at p90 103-109 ms with the box at 2x while the wall clock tripled.
- Lessons applied: D15 (test the measuring tool: each gate carries its own plant, run every time), "prove a change is needed with the
  fixed tool" (the before runs are the 11-19 failures plus a quiet base run), the D30 time rule (every time here from `date`).
- Method update (proposed, gates.md): "Adding a new check" gets a line: no fixed sleep or wall timeout as a verdict; wait on the page's
  or the code's own state, and plant the failure the wait must still catch.
