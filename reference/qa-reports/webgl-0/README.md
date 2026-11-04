# GPU plan stage 0 (R-3.1): the WebGL layer, set up, no look change

Branch warmup-5m (restarted from the lead branch, origin/ccr-0d59a91c-oy3imz at b8c4a7c5, by merge: 0e447e3c). Helper: warmup-5m.
The commit ids and gate lines are pasted at the bottom, from the commands' own output after the push.

## What was built

- **PixiJS pinned at exactly 8.22.0** (package.json; bun.lock updated with `bun install --lockfile-only`). The npm registry, pasted:
  `8.22.0 published 2026-10-01T21:58:04.868Z`. That is 34 days before 2026-11-04, and the newest v8 release then.
- **`src/game/gpuLayer.ts`**:
  - **one WebGL 2 canvas under the 2D canvas** (App.tsx), with one Pixi `WebGLRenderer` for the whole app, mounted when the first stage
    launches. Nothing waits on it: Pixi loads as its own chunk through `import()`;
  - **WebGL 2 only.** The layer makes the context itself with `getContext('webgl2')` and hands it to Pixi, so Pixi's own fallback to
    WebGL 1 can't happen. A phone without WebGL 2 keeps the 2D canvas alone, exactly as today;
  - **never WebGPU.** Only `WebGLRenderer` is used: no `autoDetectRenderer`, no WebGPU renderer. A unit test scans the source for this;
  - **the camera and the 30 fps loop drive both.** engine.ts calls `drawGpuFrame(gpuTx, gpuTy, zoom)` right after `render()`, with the
    2D canvas's own snapped camera translate (`gpuTx`, `gpuTy` are set where render() translates). `resizeCanvas` calls
    `resizeGpuLayer` with the same CSS size and pixel ratio;
  - **context loss.** Pixi's GlContextSystem calls preventDefault on loss and rebuilds on restore. The layer skips its frames while lost
    (`gpuStats.lostFrames`), and the 2D game never waits on it;
  - **free while empty.** It renders, shows its canvas and holds a full-size drawing buffer only while its `world` has something
    visible in it. Stage 0 puts nothing there, so it does no GPU frames, is never composited, and its buffer is 1x1 (a full one is about
    10 MB at q0). Its per-frame call costs 0.22 µs (20,000 calls timed in the dev build here).
- **Checks:**
  - `src/game/gpuLayer.test.ts` (4): the camera mapping equals the 2D canvas's; WebGL 2 or nothing; harmless with no layer; WebGL
    renderer only;
  - `tools/qa/gpuLayer.cjs`: the real layer in the browser;
  - `tools/qa/gpuLook.cjs`: same look, pixel by pixel.

## Proof

### The layer works (tools/qa/gpuLayer.cjs, dev build, 1-1), PASS upright 412x915 and sideways 915x412

- It mounts with a WebGL 2 context, under the game canvas.
- Empty, it is hidden and does no GPU frames, with a 1x1 drawing buffer. With something on it, the buffer matches the game canvas's
  size. Emptied again, it goes back to 1x1.
- The loop hands it every frame: 10 layer calls in 10 animation frames upright, 6 in 6 sideways (this container runs slowly).
- **The camera drives it.** A magenta probe box on the layer, at Pokey's world box, lands where the 2D canvas puts that box:
  - within 1 CSS px at the start;
  - again after walking moved the camera 363 world units upright and 45 sideways.

  Shown with the 2D canvas hidden: `probe-upright-walked.jpg`, `probe-sideways-walked.jpg`.
- **Context loss** (`WEBGL_lose_context.loseContext()`):
  - the layer stands down and skips its frames (40 skipped upright);
  - the 2D game keeps running, game time +1.9 s while the context was lost (`while-context-lost-upright.jpg`);
  - after `restoreContext()` it runs again and draws the probe in the right place;
  - no page errors.

### The same look

- **In-build, pixel by pixel** (`gpuLook.cjs`):
  - Method: the same frozen frame (seeded random, engine stopped, intro over, fixed game time, drawn 40 times so the ground squares have
    all painted) is shot three times: as played, with the GPU canvas taken out of the page, and with it forced visible.
  - Result: **0 px differ in all 22 runs**: Worlds 1-10 (stage X-1) plus 5-M, upright and sideways. Re-run on 1-1, 8-1 and 5-M after
    the 1x1-buffer change: 0 px in 6 of 6.
  - Left out of the comparison: only the pixels that also change between two shots of the very same frame (a pickup's ring on the real
    clock), counted per run, 0 to 14,661 px.
  - The DOM over the canvas is hidden for these shots: Dot's bubble and the hints animate on their own clock.
- **Against the build before** (b8c4a7c5, the lead branch): `look-upright.jpg`, `look-sideways.jpg` show every world side by side.
  - These frames come after 3 s of real-time play in two separate runs, so creatures and the camera can sit a little differently.
    They're for the eye; the pixel proof is the in-build one above.
- **Layout:** the game canvas's place and size are the same in both builds: 412x915 → [0, 0, 412, 915], 824x1830 px; 915x412 →
  [0, 0, 915, 412], 1830x824 px.

### No slower

`tools/perf/firstframes.cjs`, production builds, CPU 1x, 448x998, 3 runs each, ms. Before is the lead branch; after is this branch at
60ded234, the code before the 1x1-buffer change, which only lowers the cost further.

| Stage | Build | Worst frame | First 2 s worst | Frames over 100 | Avg frame | Load |
|---|---|---|---|---|---|---|
| 1-1 | before | 233, 200, 217 | 200, 200, 183 | 23, 31, 27 | 61.8, 64.6, 62.2 | 7675, 7348, 7263 |
| 1-1 | after | 200, 200, 283 | 200, 183, 283 | 27, 25, 24 | 53.7, 60.0, 50.5 | 7403, 7363, 7920 |
| 5-M | before | 350, 367, 333 | 183, 200, 250 | 50, 30, 51 | 107.9, 80.0, 127.2 | 8651, 8238, 7568 |
| 5-M | after | 217, 550, 233 | 217, 183, 233 | 43, 40, 41 | 108.9, 115.1, 86.5 | 8135, 7808, 8498 |
| 8-1 | before | 217, 150, 317 | 217, 133, 133 | 14, 8, 10 | 45.9, 35.8, 38.2 | 8737, 8129, 9150 |
| 8-1 | after | 167, 167, 200 | 150, 133, 133 | 14, 16, 14 | 38.8, 40.8, 38.8 | 9075, 8123, 8488 |

Plainly:
- This container is much slower than on Nov 1: ordinary frames average 36-127 ms here, against 23-34 then, so run-to-run noise is
  large.
- There is no consistent change in either direction. Load medians: 1-1 7348 → 7403, 5-M 8238 → 8135, 8-1 8737 → 8488.
- One 5-M after-run had a 550 ms frame.
- 8-1's frames over 100 read 14-16 after against 8-14 before.
- I can't separate either from the noise here. What I can measure is that the layer's own per-frame cost is 0.22 µs with no GPU work.
  The phones' control test will settle the absolute numbers.

### Bundle

| | Raw | Gzip |
|---|---|---|
| Main chunk, before | 3,897,359 | 1,229,997 |
| Main chunk, after | 3,899,654 (+2,295) | 1,231,951 (+1,954) |
| Pixi chunks (lib 232,618, Geometry 137,875, browserAll 43,560, init 20,851, small ones), loaded with the first stage | 435,311 | 125,001 |

## Method used
- New file `reference/methods/webgl.md`: there was no WebGL method. It holds the stage-0 set-up, the steps for every later stage, the
  bar and the pitfalls.
- `perf-measure.md` for the numbers: firstframes at 1x on production builds, before vs after.
- `gates.md` for the gate.

## Lessons applied
- **D6 (survive a lost canvas, and test it):** lose and restore were done in the real layer. It skips frames while lost, then draws
  again in the right place, and the 2D game keeps running.
- **D19 (a check calls the code the screen calls):** the probe and the look shots use the running game's own layer and engine render,
  not a copy.
- **D23 (shoot on the current base, stamp it):** the branch was merged from the lead branch first, and the sheets name both commits.
- **D11 (no heavy work on a play frame):** the layer does no GPU work and holds no full buffer while empty. Pixi loads in its own time,
  not on a play frame.
- **D15 (test the measuring tool):** my own look tool broke twice, and I caught it both times:
  - whole-page shots were full of DOM animation;
  - the two builds overwrote each other's noise file, which made a "0 px" cross-build result that I didn't report.

  Fixed both, and re-ran.
- **D20 (ids and times pasted from output):** they are pasted at the bottom.
- **Time and owner of claims:** the PixiJS date is from the registry, pasted above.

## Method update (proposed; webgl.md is new and written in full)
- **For perf-measure.md, "Pitfalls":**
  - (2026-11-04) The container varies between sessions. Today's ordinary frames were 36-127 ms against 23-34 ms on 11-01. Always run
    before and after in the same session, and say when the noise is bigger than the change.
  - (2026-11-04) Measure a per-frame function's own cost directly (time 20,000 calls in the page) when the frame times are too noisy to
    show it.
- **For perf-measure.md, "Tried and didn't work":** any check that writes per-run temp files must name them per build/tag. Two runs
  sharing a name produced a false "identical".

## Polish check
- **Looks the same to a player in every world, upright and sideways:** yes. 0 px in-build in 22 of 22, plus the side-by-side sheets
  (`look-upright.jpg`, `look-sideways.jpg`). The two 5-M before-shots first caught the opening card; I retook them, so the sheets
  compare play with play.
- **Nothing new on screen and no new flicker:** the layer stays hidden while empty, and it stayed hidden through context loss and
  restore (`while-context-lost-upright.jpg` shows the game unchanged).
- **Named, not hidden:**
  - the frame-time numbers can't show a difference either way in this container;
  - one 5-M run had a 550 ms frame;
  - 8-1's frames over 100 were slightly higher after (14-16 against 8-14).
- **Not done here (by the plan):** nothing moves to the GPU until stage 1. The 2D canvas is still `alpha: false`, opaque. Stage 1 must
  make it see-through where the backdrop moved, with its own look proof (webgl.md step 1).

## Gate (run on the code of f334d63b; the commits after it are docs only)

Pasted from each command's own output (last updated 04:36 AM ET); first lines as of 04:15 AM ET:

- `npx tsc --noEmit -p .`: `TSC: clean` (no errors).
- Tests:
  - shard 2/3: `# tests 708 # pass 707 # fail 0 # todo 1 `;
  - shard 3/3: `# tests 788 # pass 788 # fail 0 # todo 0 `;
  - shard 1/3: `# tests 797 # pass 796 # fail 0 # todo 1 `;
  - the whole suite: 2,291 pass, 0 fail, 2 TODO (already there).
- `npx vite build`: `BUILD EXIT 0`. `find dist -type f -size +4M | wc -l`: `0`.
- `node tools/perf/artcheck.mjs`: `PASS`.
- `node tools/perf/knowncheck.mjs`: `PASS`.
- `node tools/perf/drawcheck.mjs`: `PASS (859 s; raw results in /tmp/drawcheck-bcIupu)`. This is a container run; CI at merge is the binding one.
- `node tools/perf/clipcheck.mjs`, first run: `FAIL: some screens could not be opened (83 known) (842 s; contact sheet and breaches.json in /tmp/clipcheck-jeDCZV)`.
  - It ran beside the 3 test shards. Its one miss was "fresh up: world map: locator.waitFor: Timeout 10000ms exceeded" waiting for
    `.wm-head`, and its own screenshot shows the World Map open (it opened after the 10 s wait).
  - Rerun alone: `FAIL: some screens could not be opened (82 known) (371 s; contact sheet and breaches.json in /tmp/clipcheck-DFBGo9)`. Could not open: "fresh side: world map", the same `.wm-head` wait timeout.
  - Third run alone: `FAIL: 1 stale known entry (81 known) (399 s; contact sheet and breaches.json in /tmp/clipcheck-Q2tvwI)`. Could not open: "fresh up: world map" again; the stale entry follows from that missed walk.
  - **The lead branch (b8c4a7c5), same container, alone: `PASS (83 known) (412 s; contact sheet and breaches.json in /tmp/clipcheck-pdOada)`.**
  - **So clipcheck is FAILING on this branch** (3 of 3), on a World Map wait on a fresh save, and the base passes (1 of 1). I treat it
    as caused by this change until proved otherwise.
  - Suspects, unproven: the App.tsx canvas change (the GPU canvas added, and the game canvas made `relative`), or the gpuLayer import
    on the app's path.
  - Not investigated: it was found at 4:36 AM ET, against the 4:40 cut-off.

**The gate is not green. Stage 0 is not ready to merge.** First step next session: time when `.wm-head` shows on a fresh save, before
vs after, then bisect the App.tsx change from the engine change.

## Fix for the clipcheck failure (11-04 morning)

- **The cause, bisected:**
  - Timed alone, the World Map on a fresh save opened in about 1 s on both builds (3 runs each, clipcheck's own steps).
  - clipcheck with only the two fresh walks passed on this branch (2 of 2). So the failure needed the six walks running in parallel.
  - The layer's start-up costs 400-650 ms of main thread with 100-240 ms long tasks here (3 timings). It ran on every stage launch, and
    each walk opens a stage for its pause screen, so the start-up competed with the fresh walk's World Map.
  - With only the start-up switched off (a temporary line, reverted), the full clipcheck passed 2 of 2. With it on, it had failed 3 of 3.
- **The fix (658ff7e1), at the cause, not the timeout:** the layer starts only when something is first put on it. App.tsx just hands
  over the canvas. In stage 0 nothing goes on it, so no start-up cost at all, on a phone either. From stage 1, the start-up runs under
  the title card (webgl.md).
- **Found on the way and fixed:** at q1 (1.5x) on an odd size, Pixi's buffer was one px bigger than the game canvas (1373 vs 1372), so
  it would have been resampled. It now gets the exact floored size. gpuLayer.cjs's buffer check found it, and it now runs at q1.
- **Re-checked after the fix:**
  - `tools/qa/gpuLayer.cjs` PASS upright and sideways. It now also checks that the layer is not started until something is put on it;
  - clipcheck alone, 2 runs: `PASS (83 known) (199 s; ...)` and `PASS (83 known) (206 s; ...)`.
  - The full gate on 658ff7e1 is below.

### Full gate on 658ff7e1 (the fix; later commits are docs and tools), pasted at 08:54 AM ET

- `npx tsc --noEmit -p .`: `EXIT 0` (no output).
- Tests:
  - shard 1/3: `# tests 797 # pass 796 # fail 0 # todo 1 `;
  - shard 2/3: `# tests 708 # pass 707 # fail 0 # todo 1 `;
  - shard 3/3: `# tests 788 # pass 788 # fail 0 # todo 0 `;
  - the whole suite: 2,291 pass, 0 fail, 2 TODO (already there).
- `npx vite build`: `BUILD EXIT 0`; `find dist -type f -size +4M | wc -l`: `0`.
- `node tools/perf/artcheck.mjs`: `PASS`.
- `node tools/perf/knowncheck.mjs`: `PASS`.
- `node tools/perf/drawcheck.mjs`: `PASS (438 s; raw results in /tmp/drawcheck-eSFTOS)`. A container run; CI at merge is binding.
- `node tools/perf/clipcheck.mjs`, alone, after the tests: `PASS (83 known) (199 s; contact sheet and breaches.json in /tmp/clipcheck-BBMzhH)`. Its third PASS in a
  row since the fix.

**The gate is green. Stage 0 is ready for the lead's merge.**
