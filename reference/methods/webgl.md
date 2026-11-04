# Method: moving drawing to the GPU layer (PixiJS on WebGL 2)
Last proven: 2026-11-04, branch warmup-5m, GPU plan stage 0 (R-3.1): the layer set up, no look change. Owner of the last update:
warmup-5m helper. The commit ids are in the stage 0 report (reference/qa-reports/webgl-0/README.md).

## When to use it
Every GPU-RENDERER-PLAN stage (1 skies, 2 ground, 3 creatures and Pokey, 4 props and particles, 5 what's left) and any later WebGL
feature (light bridges, lightning silhouettes, waving water).

## What exists (stage 0)
- **`src/game/gpuLayer.ts`.** One Pixi `WebGLRenderer` for the whole app, on the canvas under the game's 2D canvas (App.tsx).
  - App.tsx only hands over the canvas (`setGpuCanvas`). `mountGpuLayer()` starts the layer (the webgl2 context, Pixi) and is called
    only by whatever first puts something on it. From stage 1 that happens under the title card (stageReady.ts), awaited within its
    deadline. Starting it costs 400-650 ms of main thread here.
  - `gpuWorld()` is the container the stages put whole layers into.
  - `drawGpuFrame(tx, ty, zoom)` is called by engine.ts right after `render()`. tx and ty are the 2D canvas's own snapped camera
    translate (`gpuTx`, `gpuTy`).
  - `resizeGpuLayer` is called from `resizeCanvas`.
- **WebGL 2 only.** The context is made with `getContext('webgl2', GL_ATTRS)` and passed to Pixi as `context`, so Pixi never falls back
  to WebGL 1. No WebGL 2 means no layer, and the 2D canvas draws everything as before.
  - Never `autoDetectRenderer` and never WebGPU (PowerVR, PERFORMANCE-RULES §4). The unit test scans the source for this.
- **Pixi is pinned exactly** in package.json: 8.22.0, at least two weeks old when chosen. Update bun.lock with
  `bun install --lockfile-only`; CI runs `npm install` with no lockfile.
- **It costs nothing while empty.** It renders, and shows its canvas, only while `world` has a visible child. The loop still moves it
  every frame.
- **Context loss.** Pixi's GlContextSystem calls preventDefault and rebuilds its GPU objects on restore. The layer skips frames while
  lost (`gpuStats.lostFrames`), and the 2D game never waits on it.

## Stage 1 (the backdrop), what exists
- scenery.ts: in gameplay's fitted-strip mode, `gpuStrips` routes `drawFitted`'s stamps (the strip, the sky row, the gap rows) to
  `backdropPush` in device pixels. Then `backdropFlush` renders them and copies the layer into the 2D canvas with one drawImage. Only
  under a plain scale transform (`pureScale`); any other frame stamps on the 2D canvas, as before.
- gpuLayer.ts:
  - the pool of sprites, with **dynamic** textures (see Pitfalls);
  - one texture per fitted canvas, uploaded under the title card (`backdropUpload` from `stampSceneryFits`) and destroyed with its fit
    (`backdropForget`);
  - the layer always at resolution 1, in device pixels (`fitBuffer`);
  - the copy timed on 3 frames under the card (COPY_SLOW_MS 2 ms);
  - `backdropLine()` for the readout;
  - `?gpuback=0` to compare.
- Checks:
  - `tools/qa/gpuBackdrop.cjs`: GPU vs 2D backdrop, the same frozen frame, every world, both ways;
  - `tools/qa/gpuBackdropLoss.cjs`: lose and restore in play.

## The measured release (testers only), what exists
- `gpuBackdropOn()` (gpuLayer.ts) = `qaBuild() || ctestEnabled()`.
  - `mountGpuLayer` returns false without it, so a player never gets a WebGL context or Pixi.
  - The readout and `gpuback=0` follow it.
  - Never in the store app.
- vite.config.ts `globIgnores` keeps Pixi's four chunks (gpuPixi, browserAll, webworkerAll, init) out of the service worker's
  precache.
  - If Pixi's chunking changes, `tools/qa/gpuDefaultOff.cjs` names the chunk that leaked.
- Check: `node tools/qa/gpuDefaultOff.cjs <vite preview url>` on a PRODUCTION build.
  - It blocks the collector, so nothing lands in Matt's sheet, and blocks service workers in its pages.
- Fixed end: delete the switch the day the phone numbers decide (GPU-RENDERER-PLAN.md).

## Steps for a stage that moves a layer
1. **Move whole layers, contiguous from the bottom** (the plan's layer-order rule). They render into the hidden WebGL canvas, and the
   2D canvas (opaque, `alpha: false`, unchanged) copies it in with one drawImage where it used to paint them (the plan's design change,
   2026-11-04). Never make the 2D canvas see-through: every `lighter`, `screen` and `multiply` effect after the copy would then blend
   with nothing.
2. **Textures from the sheets we already load.** `Texture.from(<the HTMLImageElement or baked canvas>)`. One texture per sheet, frames
   as sub-rectangles, so sprites that share a sheet batch.
   - Release a world's textures when play leaves the world (atlasLoader `enterWorld`, PERFORMANCE-RULES §2.13).
3. **Upload before play.** Under the title card (stageReady.ts): `renderer.texture.initSource(texture.source)`, or one render of the
   layer, so nothing uploads on a play frame (lesson D11, PERFORMANCE-RULES §2.12).
4. **The camera.** Children of `world` are placed in world units. The layer applies `(p + t) * zoom` (`worldPlace`). Parallax layers
   get their own container moved by their own factor.
5. **Losing the context.** Anything the stage makes itself (render textures, its own buffers) must be rebuilt on
   `webglcontextrestored`. Check it with `tools/qa/gpuLayer.cjs`, which does lose and restore (lesson D6).

## The bar
- **The same look.** `node tools/qa/gpuLook.cjs <dev url> <out> after` must print 0 differing px for every stage in all 10 worlds plus
  5-M, upright 412x915 and sideways 915x412. Then a side-by-side sheet against the before build for Matt's eye.
- **The layer is proven live.** `node tools/qa/gpuLayer.cjs <dev url> <out> 1-1 412x915` and `... 915x412` print PASS:
  - it mounts as WebGL 2;
  - the probe box tracks the camera within 2 CSS px, before and after walking;
  - lose and restore leaves no page errors;
  - the 2D game keeps running while the context is lost.
- **No slower.** `tools/perf/firstframes.cjs` at 1x on a W1, a W5 (5-M) and a W8 stage: the worst frame, the frames over 100 ms and the
  load time no worse than the before build (perf-measure.md). drawcheck PASS.
- **Bundle noted.** The main chunk and the Pixi chunks, raw and gzipped.

## Checks before reporting
Every gate in gates.md, in order. Add the two GPU checks above. Stamp the base commit on every sheet (D23).

## Pitfalls we already paid for
- 2026-11-04: **The look comparison was noisy three ways.** Fix all three, then judge:
  1. the DOM over the canvas (Dot's bubble, the hints) animates on its own JS clock: hide everything but the canvases;
  2. the ground squares paint a few per frame: draw the frozen frame about 40 times first;
  3. a pickup's ring moves on the real clock: mask the pixels that differ between two shots of the same frame, and report how many.
- 2026-11-04: **`page.setViewportSize` failed after a tap** (the game asks for fullscreen). Stub
  `Element.prototype.requestFullscreen` in an init script for rotation checks.
- 2026-11-04: **Pixi's own WebGL setup falls back to WebGL 1** when webgl2 fails. Pass a context made by us so it can't.

- 2026-11-04: **Starting the layer on every stage launch, with nothing on it, failed clipcheck 3 of 3.** Its 400-650 ms start-up
  (100-240 ms long tasks, plus SwiftShader's threads) slowed the parallel walks until the fresh walk's World Map missed its 10 s wait.
  Bisected: with only the start-up switched off it passed 2 of 2. Start it only when something goes on it, and under the card.
- 2026-11-04: **Pixi rounds css x resolution; the game canvas floors it.** At q1 (1.5x) on an odd size the buffers differed by one
  px. Hand `renderer.resize` the floored device size divided by dpr. The gpuLayer.cjs buffer check catches it; run it at q1 too.

- 2026-11-04: **A Pixi v8 Sprite follows a change to its texture's frame only if the texture is `dynamic: true`.** Pooled sprites with
  reused textures kept the size of the first stamp they drew. The backdrop came out magnified after a quality step (19-30% of pixels off
  by more than 32), and slightly off on outlines even at q0. I first took that for GPU sampling: it wasn't.
- 2026-11-04: **Pixi's resolution handling didn't follow resizes reliably.** Run the layer at resolution 1 with the buffer exactly the 2D
  canvas's device size, and place everything in device pixels.
- 2026-11-04: **Judge the look at every quality step (q0, q1, q2), not only q0.** The look check pins each one in turn.
- 2026-11-04: **The see-through 2D canvas** (the plan's first design) fails the look bar: see the design change in GPU-RENDERER-PLAN.md.

- 2026-11-04: **The PWA precaches every chunk.** A lazy `import()` isn't enough to keep a download off players: the service worker
  fetched Pixi (434 KB) for everyone in the background. Keep anything testers-only out of `globPatterns` (`globIgnores`).
- 2026-11-04: **The test-link page can't send runs to the testers' sheet.** Phone numbers need the live testers' link; check each run's
  build stamp (Matt's first six "GPU" runs were live 0.9.4).

## Tried and didn't work
- Comparing whole-page screenshots: the DOM animations gave 21,000 to 178,000 "different" pixels with nothing changed on the canvas.

## To try
- Pixi's per-feature imports (only the WebGL renderer, Container, Sprite, Texture), to cut the 435 KB of Pixi chunks.
- A WebGL 2 capability line in the control test's GPU report (vendor, renderer, `MAX_TEXTURE_SIZE`) for QA's per-GPU sort.
