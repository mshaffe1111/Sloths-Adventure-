# GATE-FLAKE: clipcheck and stageQuality's speed test made load-proof (R-165.215, R-165.245, R-165.325)

Engine (tools) member, session_01FhBbYMwELLxM66X3iXAadC. Branch t-gate-flake from t-int-13 d36638be. Code head: see "Final head".

## EXACT NEXT STEP
None: done by GATE-FLAKE-b on 11-20 (section at the end): 5 of 5 loaded runs and 1 alone run agree (PASS); R-165.330 fixed; the
CLAUDE.md check list, every item, PASS on the code head 7f05a1c0. The lead closes the ROADMAP rows.

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
| L4 | 7ae0b8a6 (code = 3858372a) | PASS (83 known, 0 new, 0 stale; plant FAILED as it must on all 6 walks) | 770 s | pass 2/0, CPU p90 103 ms, max 215 |
| L5 | 7ae0b8a6 (code = 3858372a) | PASS (83 known, 0 new, 0 stale; plant FAILED as it must on all 6 walks) | 804 s | pass 2/0, CPU p90 97 ms, max 189 |
| L6 | 7ae0b8a6 (code = 3858372a) | PASS (83 known, 0 new, 0 stale; plant FAILED as it must on all 6 walks) | 831 s | pass 2/0, CPU p90 90 ms, max 209 |
| alone | 7ae0b8a6 (code = 3858372a) | PASS (83 known, 0 new, 0 stale; plant FAILED as it must on all 6 walks) | 372 s | pass 2/0, CPU p90 84 ms, max 200 |

On 3858372a's code: 5 of 5 loaded clipcheck runs and 5 of 5 loaded speed runs agree (PASS; L2-L6), and so does the run alone, against
2 of 2 loaded clipcheck FAILs and 1 speed FAIL on 11-19's heads. (L4-L6 and alone by GATE-FLAKE-b, 10:57-11:46 AM ET 11-20, load.sh +
proof.sh from this folder, load average 19-34 on 4 cores; the alone run started at load average 6.7 falling, nothing else running.)

Quiet runs of the new waits on the way: f11bc2d4 quiet found two real step bugs (Pause on the fresh save; the testers' second tap),
fixed and step-checked (`CLIPCHECK_STEPS=pause`: 3 walks PASS, the Pause card judged, still checked by eye; `testers link, help offer,
Dot's first tip, stories`: 2 walks PASS).

## Gate table
| gate | head | result |
|---|---|---|
| `npx tsc --noEmit -p .` | 3858372a | PASS |
| stageQuality speed tests (2) | 3858372a | PASS (loaded, above) |
| the whole CLAUDE.md list | 7f05a1c0 | PASS, every line: GATE-FLAKE-b's gate table below |

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

## GATE-FLAKE-b (11-20, Engine tools, session_01FhBbYMA7DNVEhaSwSaWGKz)
Packet: reference/packets/2026-11-20/GATE-FLAKE-b.md. Base t-gate-flake 7ae0b8a6. Code head **7f05a1c0** (every gate below ran on it);
the final head adds only this report.

**1. The proof** (table above, L4-L6 and alone): 3 more loaded runs, all PASS; with L2-L3, 5 of 5 loaded runs on one code agree, and
the alone run agrees. Each clipcheck run: 83 known seen, 0 new, 0 stale, and the planted never-opening screen 'FAILED as it must' on
6 of 6 walks. Each speed run: 2 pass / 0 fail, thread CPU p90 84-103 ms (bar 500).

**2. R-165.330, paintcheck passed having checked nothing.** Root cause: `--part i/n` is 0-based (a stage is in part index mod n), but
nothing refused an index out of range, so `--part 3/3` (ENG-25d's "part 3 of 3") selected no stage, built 0 and printed PASS; a
`--stages` id that is no stage did the same. Fix (tools/engine/paintcheck.ts): a part out of range FAILS at once (`--part 3/3 is not a
part: parts are 0-based, 0/3 .. 2/3`); a run with 0 builds, any stage with 0 builds (`EMPTY: <id> had 0 builds`) or a `--stages` id
that is no stage FAILS (`paintcheck: FAIL, checked nothing`); every run prints the stage count of every part (`stages per part 0/3: 34,
1/3: 34, 2/3: 34`) and its own builds. The split itself was already even (index mod 3: 34/34/34), so no rebalance.
Planted: tools/engine/paintcheck.test.ts (3 cases: `--part 3/3`; `--stages no-such-stage`; an unlisted stage on `--layouts 0`): on the
old paintcheck **3 of 3 RED** (each PASSED on nothing, exit 0), on 7f05a1c0 **3 of 3 GREEN**. It is on gates.yml's tool test line (the
ciTests guard passes 4/0); gates.yml's paintcheck comment and gates.md row 8c say what changed. Real parts on 7f05a1c0: 0/3 1,714
builds, 1/3 2,028, 2/3 1,760, each PASS.

**3. Gate table, code head 7f05a1c0** (11:46 AM - 1:00 PM ET by `date`; one script, nothing else running):

| gate | result |
|---|---|
| `npx tsc --noEmit -p .` | PASS |
| suite, 6 shards (1-3 then 4-6, 3 at a time) | PASS: 3,936 tests / 3,934 pass / 0 fail / 2 todo (the two boulder-wall todos, as before) |
| `BASE_PATH=/Sloths-Adventure-/ npx vite build` | PASS |
| chunkcheck | PASS |
| artcheck | PASS |
| drawcheck | PASS (654 s) |
| clipcheck | PASS (83 known, 0 new, 0 stale; plant failed as it must 6/6) (403 s) |
| knowncheck | PASS |
| generalitycheck | PASS |
| roadmapcheck | PASS (the first try FAILED "shallow clone, proofs cannot be checked": this container's clone was shallow; after `git fetch --unshallow` it PASSES, same head) |
| kbdcheck | PASS |
| buildcheck | PASS |
| `seedlist.ts 1-1 --check` | PASS (161 seeds) |
| tool tests (gates.yml's whole tool line, incl. paintcheck.test.ts) | PASS: 308 tests / 307 pass / 0 fail / 1 todo |
| tierBots | PASS: 7 / 7 / 0 / 0 |
| paintcheck `--part 0/3`, `1/3`, `2/3` | PASS, PASS, PASS (1,714 / 2,028 / 1,760 builds) |

Not run here (CI-only, not on the CLAUDE.md list, untouched by this work): coveragecheck, timecheck, tipwalk, registrycheck, every
proven seed list by shard. kbdcheck rewrites its committed screenshots (reference/qa/tester-page-1106/keyboard/) when it runs; put back
with `git checkout`, not committed.

**Closes (when the lead agrees): R-165.215, R-165.245, R-165.325** (5 of 5 loaded + alone agree on one code, every gate PASS) and
**R-165.330** (planted RED 3/3 -> GREEN 3/3, real parts PASS with builds counted).

Learned
- A gate's own arguments are input: an index that selects nothing must be refused, not run. "Passed on nothing" is the same lie as a
  flaky pass; any gate that filters (parts, shards, `--stages`) should fail on an empty selection and print what it selected.
- The load script leaves orphans when stopped by its flag (each loop finishes its round; drawcheck's vite servers outlive it): kill
  the loops, chromium and `vite --port` before an alone run, and check with `ps` that nothing is left.
- roadmapcheck needs full history: in a fresh container `git fetch --unshallow` first, or its FAIL is the clone, not the roadmap.
- Lessons applied: D15 (a gate gives the same answer on the same code; a gate that checks nothing is not a pass: planted first), the
  shrink-only / never loosen rule (no bar moved: paintcheck only got stricter), D30 (every time here from `date`), D86/D93 (suite line
  with shards and counts; every gate PASS or FAIL), ReadNotifications at every push.
- Method update (proposed, gates.md "Adding a new check"): a gate that takes a part, shard or filter prints what it selected and FAILS
  on an empty selection (as registrycheck's `--lists --shard` already does), with a planted empty case on the tool line.

