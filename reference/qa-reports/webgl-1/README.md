# GPU plan stage 1 (R-3.2): the backdrop on the GPU layer, copied in

Branch warmup-5m. Base: the lead branch at f24283dd (stage 0 merged), merged in before any work. Helper: warmup-5m. Commit ids are
pasted at the bottom, from the commands' own output.

**State: built, the look proven in every world both ways, context loss and the fallback proven. NOT ready for main until Matt's phones
show a saving** (lead, 11-04: option (a)). This container can't measure the saving: its 2D canvas is software, so the copy is a
readback by construction. The phone check is `MATT-PHONE-CHECK.md`.

## The design (changed from the plan, approved by the lead 11-04)

- **The plan's way fails the look bar.** It put the WebGL canvas under a see-through 2D canvas. Measured first (all 10 worlds plus 5-M,
  both ways), the world layer draws effects that blend with what's beneath them:
  - `lighter` glows: foxfire envKit.ts:349 (W8), glow dots envPlants.ts:53 (W3, W9), weather scenery.ts (W3, W6, W8, W9), Meeca
    meecaNightArt.ts:60 (5-M), fx particles (W9, W10);
  - `screen` and `lighter`: W5's light, w5Look.ts;
  - `multiply`: 5-M's full-screen night grade, meecaArt.ts:579.

  Over transparent pixels these would blend with nothing: glows would darken the sky under them, and the night grade would paint
  instead of multiplying.
- **Built instead: GPU underneath, copied in.**
  - The fitted backdrop stamps (each strip, the sky's top row, the bottom rows) go to the WebGL layer as pooled sprites in device
    pixels.
  - One render, then one `drawImage` copies the layer into the game canvas, at the same point in the frame where the strips were
    stamped.
  - The game canvas stays opaque (`alpha: false`, unchanged; a unit test guards it), so everything after the copy blends with real
    pixels.
  - Written into GPU-RENDERER-PLAN.md ("Design change") and webgl.md.
- **engine.ts: no change.** The work is in scenery.ts (routing the stamps), gpuLayer.ts (the backdrop pool, textures, the copy) and
  stageReady.ts (the start-up and the probe).
- **The fallback.**
  - The layer starts under the title card, alongside the sheets' loads. The fits are uploaded there.
  - The copy is timed on frames drawn under the card. A copy over 20 ms decides at once; otherwise the median of 3, over 2 ms, means a
    readback.
  - A readback sends the backdrop back to the 2D canvas for the session, before play. So do a lost context and no WebGL 2.
  - Here: `copy 119-129 ms (a readback: the 2D canvas is not on the GPU)`, so it falls back. Chromium's own report for this container
    says `2d_canvas: unavailable_software`.
- **The phone check, QA builds only** (the dev server and the test link; never the live site or the app):
  - the frame-time readout and the control test's log get one line per stage:
    `backdrop: GPU, copy X ms (median of n), ready Y ms`, or `2D (reason), ready Y ms`;
  - `#ctest&gpuback=0` forces the 2D backdrop to compare against;
  - the event is in tools/playtesters/LOG_EVENTS.md.

## Proof

### The same look (tools/qa/gpuBackdrop.cjs)

- **Method:** the same frozen frame (seeded random, quality pinned, frozen, drawn 40 times), read from the game canvas twice with the
  GPU backdrop (stable: 0 px over 8 in every run) and once with it forced to the 2D canvas.
- **The run:** q0, all 10 worlds (stage X-1) plus 5-M, upright 412x915 and sideways 915x412: **22 of 22 pass**, max 1 to 4 levels a
  pixel, 0.00% of pixels over 8, none over 32.
  - 2-1 upright first showed "0 GPU copies": my own source edit reloaded the page mid-run, which dropped the check's setting. Rerun alone
    it passed (max 2).
- **At every quality step** (1-1, q0, q1, q2): max 1 level a pixel.
- Sheets for the eye: `look-upright.jpg` and `look-sideways.jpg`, every world, GPU | 2D.
- **The 0.9% edge difference, named with its cause** (lead's ask):
  - My first 1-1 run showed 0.87% of pixels over 8 and 0.08% over 32, along the near strip's outlines, and 19-30% at q1 and q2. I first
    put that down to GPU vs Skia filtering. **That was wrong.**
  - The cause: a Pixi v8 Sprite only follows a change to its texture's frame when the texture is `dynamic`, so each pooled sprite kept
    the size of the first stamp it drew.
  - The fix: dynamic pool textures, and the layer in device pixels at resolution 1. After it, the difference is the 1-4 levels above.
  - The check now fails on any pixel over 32.

### Context loss (tools/qa/gpuBackdropLoss.cjs; PASS upright 412x915 and sideways 915x412)

- In play the backdrop is copied from the GPU every frame.
- Lost: no GPU copies, the game keeps running, and the frame is the 2D backdrop's pixel for pixel (0 px differ). No page errors.
- Restored: the GPU copies resume, and the frozen GPU frame matches the 2D backdrop as before (0.000% over 32).

### The layer (tools/qa/gpuLayer.cjs)

- PASS 4 of 4 after a fix to the check itself, upright and sideways. Before that it failed 3 times (1 sideways early on, then 2 in a
  row): the stage-0 probe after the restore was missing or at 2/3 scale.
- The cause was in the check: the frame governor steps the quality down during the slow context loss, and the check froze the engine
  before that step's resize (engine.ts `resizeDue`), a state play never draws. The check now applies the resize first, and draws
  through the app's own dev handle (`__gpu.frame`), not a fresh module import a dev-server reload could make stale.

### Frames and the stage start (tools/perf/firstframes.cjs, production builds, CPU 1x, 448x998, 3 runs each)

- **Before** = the lead branch f24283dd. **After** = this branch, which here falls back to the 2D backdrop before play. So this
  measures the start-up and the probe, not the GPU drawing.

| Stage | Build | Worst frame (ms) | Frames over 100 | Avg frame (ms) | Load, open to stage live (ms) |
|---|---|---|---|---|---|
| 1-1 | before | 83, 117, 83 | 0, 1, 0 | 21.2, 21.3, 20.2 | 4156, 4731, 4465 |
| 1-1 | after | 83, 83, 67 | 0, 0, 0 | 21.9, 23.4, 22.1 | 4706, 5720, 5376 |
| 5-M | before | 100, 100, 233 | 0, 0, 4 | 24.8, 23.9, 27.7 | 5091, 4649, 5241 |
| 5-M | after | 133, 83, 100 | 2, 0, 1 | 25.5, 24.4, 27.9 | 5218, 5058, 5194 |
| 8-1 | before | 67, 83, 83 | 0, 0, 0 | 20.9, 20.6, 18.5 | 5465, 5573, 5587 |
| 8-1 | after | 100, 67, 133 | 0, 0, 2 | 22.8, 21.6, 20.8 | 5759, 5905, 5593 |

(The final build, 88c04b03's code with Pixi trimmed. Before = the lead branch f24283dd. Same session, nothing else running.)

- **Frames:** the average frame reads 0-2 ms higher after on 1-1 and 8-1. The drawing is the same 2D path here (the GPU backdrop fell
  back before play), so it's either noise or the idle WebGL context. I can't separate the two here. The worst frames are mixed.
- **Load: worse here.** Medians: 1-1 4465 → 5376 (+0.91 s), 5-M 5091 → 5194 (+0.10 s), 8-1 5573 → 5759 (+0.19 s). 1-1's +0.9 s
  repeated across three sessions, so I take it as real.
  - An earlier version cost +0.9 to +1.2 s. Starting the layer alongside the loads and deciding a clear readback on the first copy cut it
    to this.
  - What's left is mostly this container's software GL: Pixi's start-up, about 50 ms of JS plus its chunk loads, runs WebGL on the CPU
    here, and the one probe frame includes a 120 ms readback.
  - **It must be measured on the phones too: the `ready` time is in the phone check's log line, for both ways.** If a phone starts
    visibly later with the GPU backdrop, that's a stop, like a slower frame.

### Bundle (clean production builds into empty folders)

- **Stage 0 shipped no Pixi at all in production.** After the stage-0 fix, the layer only started from the dev-only probe, so the build
  dropped the import. The stage-0 report's 435 KB was measured at 60ded234, before that fix.
- **Stage 1 ships it.** Importing all of `pixi.js` made every first stage fetch 914 KB of Pixi script, with its WebGPU and canvas
  renderers' chunks built (never fetched).
- **Fixed:** `gpuPixi.ts` re-exports only the six classes the layer uses (WebGLRenderer, Container, Sprite, Texture, Rectangle,
  Graphics), and the layer imports that module on its own.

| | Before (lead branch) | After |
|---|---|---|
| All JS in the build | 3,992,519 | 4,431,565 |
| Main chunk | 3,897,653 | 3,903,103 |
| Fetched when the first stage starts (gpuPixi, browserAll, init) | none | 433,539 raw (123,211 gzip) |

  No WebGPU or canvas-renderer chunk exists in the build at all now.

## Gate (the code of e3ff9f1c; the commits after it are docs), pasted at 11:25 AM ET

- `npx tsc --noEmit -p .`: `EXIT 0` (no output).
- Tests:
  - shard 1/3: `# tests 799 # pass 798 # fail 0 # todo 1 `;
  - shard 2/3: `# tests 708 # pass 707 # fail 0 # todo 1 `;
  - shard 3/3: `# tests 788 # pass 788 # fail 0 # todo 0 `;
  - the whole suite: 2,293 pass, 0 fail, 2 TODO (already there).
- `npx vite build`: `BUILD EXIT 0`; `find dist -type f -size +4M | wc -l`: `0`.
- `node tools/perf/artcheck.mjs`: `PASS`.
- `node tools/perf/knowncheck.mjs`: `PASS`.
- `node tools/perf/drawcheck.mjs`: `PASS (965 s; raw results in /tmp/drawcheck-Ao0LQS)`. A container run, where the GPU backdrop falls back to the 2D canvas; CI at merge is
  binding.
- `node tools/perf/clipcheck.mjs`, alone after the tests: `PASS (83 known) (187 s; contact sheet and breaches.json in /tmp/clipcheck-VJ6mDg)`. Also run alone twice earlier with the layer starting under the
  card: PASS at 199 s and 202 s.

**The gate is green. Not for main until the phone check shows a saving** (lead, 11-04).

## Method used
- `reference/methods/webgl.md` (written at stage 0, updated here);
- `perf-measure.md` for the numbers;
- `gates.md` for the gate.

## Lessons applied
- **D6 (survive a lost canvas, test it):** lose and restore were done with the backdrop on the GPU. 2D while lost, pixel for pixel; GPU
  again after.
- **D11 (no heavy work on a play frame):**
  - the textures are uploaded under the card;
  - the readback probe runs under the card, so a slow phone never plays a slow frame;
  - the start-up overlaps the loads.
- **D15 (test the measuring tool):** the look check's numbers looked like plausible GPU filtering, and were a bug. The check now pins
  each quality step and fails on any pixel over 32.
- **D19 (a gate calls the code the screen calls):** the look and loss checks read the game canvas the real render loop draws, with the
  real scenery and layer code.
- **D23:** the base was merged first, and the sheets name the commit they were shot on.
- **Law 3 (check the fact):**
  - the 2D canvas's acceleration is from Chromium's own report;
  - the control test's length and its "I'm done" button were read in ControlTestGate.tsx before writing Matt's card;
  - the "not sending" badge's meaning was read in playRecorder.ts.

## Method update (proposed for webgl.md; my stage-1 lines are in already, for the lead to accept or cut)
- Pitfalls:
  - Pixi `dynamic` textures for pooled sprites;
  - resolution 1 and device pixels;
  - judge the look at every quality step;
  - the see-through 2D canvas fails the look bar.
- To add:
  - a source edit during a dev-server check reloads its pages: never edit `src` while a browser check runs;
  - this container's 2D canvas is software (`2d_canvas: unavailable_software`), so any WebGL-to-2D copy is a readback here, and the
    saving can only be measured on a phone.

## Polish check
- **The backdrop looks the same in every world, upright and sideways:** yes. 22 of 22 within 4 levels a pixel (`look-upright.jpg`,
  `look-sideways.jpg`). 5-M's night grade and the glows over the sky are unchanged: the 5-M pair and the W3, W8 and W9 pairs.
- **No flash or blank backdrop when the context is lost or restored:** the frame while lost is the 2D backdrop, pixel for pixel.
- **Named, not hidden:**
  - the stage start is 0.1-1.1 s later in this container;
  - the saving is unproven until the phones;
  - one flaky step in my own layer check (sideways, 1 of 3).
