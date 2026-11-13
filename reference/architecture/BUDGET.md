# The budget sheet (R-165.61 done-item 4, 2026-11-10)

## Frame: 8 ms of our own work per frame (the previous lead's budget from Matt's "build for 60", 11-06; GPU-RENDERER-PLAN.md:52-59)
- The game runs at 30 fps (33 ms a frame); our update plus draw must fit **8 ms on a mid-range phone at q0**, so the same code holds
  at 60. PERFORMANCE-RULES §1 still reads 12 ms and "no frame over 50 ms" until R-165.65 changes it; every new design is held to 8.
- Split, as a design target (not yet measured): update 2 ms, draw 5 ms, slack 1 ms. Today's real split is unknown: the gate below
  measures it first. Nobody optimizes before that number exists.
- **Bundle:** no asset over 4 MiB; the main chunk had 31 KB of room on 11-07. Pixi (E3) ships as its own lazy chunks (435 KB measured
  on warmup-5m), never in the main chunk. ADR-001's reach data and verdicts: a few KB, named in E0's report.

## E4, Engine: the frame-time gate with its planted slow frame (R-165.65), ready as a packet
**Allowed files:** NEW tools/perf/framecheck.mjs; tools/perf/limits.json (a `frameMs` block); tools/perf/run.mjs (an option to
record frame times, no change to what drawcheck records); .github/workflows/gates.yml (one step); reference/methods/gates.md (its
entry); reference/PERFORMANCE-RULES.md §1 (12 -> 8, in the same PR, R-165.65). Shares nothing with E0-E3, C1, C2. No game code.
1. **What it measures:** our work per frame = the duration of the game's requestAnimationFrame callback (update + draw), taken by
   wrapping `window.requestAnimationFrame` in a Playwright init script. Nothing is added to the shipped game.
2. **Where:** drawcheck's scenarios (limits.json `scenarios`), upright and sideways, q0, Chromium with CPU throttling x4 (CDP
   `Emulation.setCPUThrottlingRate`), the stand-in for a mid-range phone. The throttle rate is a value in `frameMs` with its evidence;
   when the Engine can time the same scenario on the Pixel, the Samsung and the OnePlus, the rate is calibrated to them and the
   evidence updated. Until then the report says plainly the gate is a CI stand-in, not a phone.
3. **Pass/fail:** per scenario and orientation, p95 of the callback times <= `frameMs.budget` (8); no frame over `frameMs.max`
   (50, as §1 reads) except the first second of a stage and the second after a sheet loads (<= 120). A breach prints the scenario,
   the worst frames' times and the 5 heaviest call sites from a CPU profile of that second.
4. **The planted slow frame (proves the gate can fail):** two plants, each on one scenario, each run on its own.
   `--plant p95` adds a busy-wait of max(4 ms, 8 - that scenario's measured p95 + 4 ms, `today` - p95 + 4 ms) inside EVERY wrapped
   callback, so p95 lands over 8 and over any `today` (a plant on every 30th frame is 3.3% of frames, under p95's 5%: it could
   never fail). `--plant max` adds one 60 ms frame 5 s into the scenario, outside the stage-start and sheet-load windows, so it trips
   the 50 ms max. CI requires exit 1 naming that scenario and that rule from EACH plant, then the real run, which must pass. A gate whose plant passes is broken.
5. **Today's number first:** the first run measures main. If main is over 8 ms anywhere, the PR records each scenario's measured p95 as
   `today` beside `budget: 8` (limits.json's "lower to" pattern), the gate fails only on a rise above `today`, and the PM gets the
   list and rules. `today` only shrinks (knowncheck's rule).
6. **Time:** about 3 minutes on CI (half of drawcheck's scenarios suffice: the PM picks which, by draw count).
