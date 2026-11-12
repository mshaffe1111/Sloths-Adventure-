# Method: moving drawing to the GPU layer (PixiJS on WebGL 2)
Last proven: 2026-11-12, branch t-webgl-0, GPU plan stage 0 (R-3.1): the layer set up, nothing on it, no look change. First written
2026-11-04 on warmup-5m (never merged); this is that file, cut to what is in this tree. Owner of the last update: the GL0 helper.

## When to use it
Every GPU-RENDERER-PLAN stage (1 skies, 2 ground, 3 creatures and Pokey, 4 props and particles, 5 what's left) and any later WebGL
feature.

## What exists (stage 0)
- **`src/game/gpuLayer.ts`.** One Pixi `WebGLRenderer` for the whole app, on the canvas under the game's 2D canvas (App.tsx: the game
  canvas stays the FIRST canvas in the page, the layer's is after it with `data-gpu-layer`, stacked under it by z-index inside an
  `isolate` box).
  - App.tsx only hands over the canvas (`setGpuCanvas`). `mountGpuLayer()` starts the layer (the webgl2 context, Pixi) and is called
    only by whatever first puts something on it, under the title card. Starting it costs 400-650 ms of main thread here.
  - `gpuWorld()`: the container for layers SHOWN under the 2D canvas, in world units. `drawGpuFrame(tx, ty, zoom)` is called by
    engine.ts right after `render()` with the 2D canvas's own snapped camera translate (`gpuTx`, `gpuTy`); `resizeGpuLayer` from
    `resizeCanvas`.
  - For a COPY layer (rendered into the layer's hidden canvas, then copied into the 2D canvas with one drawImage): `gpuPixi()` (Sprite,
    Texture, Rectangle, Container and the renderer; null whenever the layer is not running, so ask every frame), `gpuCanvas()`,
    `gpuFitBuffer(w, h)` (device px, the game canvas's own size) and `gpuKeepBuffer(true/false)` while it is in use.
- **WebGL 2 only.** The context is made with `getContext('webgl2', GL_ATTRS)` and passed to Pixi as `context`, so Pixi never falls back
  to WebGL 1. Never `autoDetectRenderer` and never WebGPU (PowerVR, PERFORMANCE-RULES §4). The unit test scans the source for this.
- **The fallback.** `gpuFallback()` is '' or why the layer is off for the session: `no WebGL 2`, `Pixi failed`, `context lost and not
  restored` (4 s), `context lost again` (it comes back from one loss a session). Off means the 2D canvas draws everything, as before.
  `onGpuChange(cb)` tells a layer's owner `live`, `lost`, `restored`, `fallback`: drop textures at `lost`/`fallback`, upload again at
  `restored`. The rule is the pure `lossStep` (unit-tested, planted).
- **Pixi is pinned exactly** in package.json: 8.22.0 (published 2026-10-01). Only `src/game/gpuPixi.ts` imports it, and only
  `import('./gpuPixi.ts')` reaches that: Pixi is a late file of its own. `tools/perf/chunkcheck.mjs` fails a build where one of Pixi's
  files is a start file, is named by index.html, or is missing from the service worker's precache (offline play needs it).
- **It costs nothing while empty.** Not started until used; then it renders, shows its canvas and holds a full-size buffer only while
  `world` has a visible child (or `gpuKeepBuffer`). In a production build with nothing using it, Pixi is not even in the build.

## Steps for a stage that moves a layer
1. **Move whole layers, contiguous from the bottom** (the plan's layer-order rule), or copy in: render into the hidden WebGL canvas and
   have the 2D canvas (opaque, `alpha: false`, unchanged) copy it with one drawImage where it used to paint them. Never make the 2D
   canvas see-through: every `lighter`, `screen` and `multiply` effect after it would then blend with nothing (measured and rejected
   2026-11-04).
2. **Textures from the sheets we already load.** `Texture.from(<the HTMLImageElement or baked canvas>)`. One texture per sheet, frames
   as sub-rectangles, so sprites that share a sheet batch. Nothing over 4096 px (R-3.12). Release a world's textures when play leaves it.
3. **Upload before play.** Under the title card (stageReady.ts): `renderer.texture.initSource(texture.source)`, so nothing uploads on a
   play frame (lesson D11, PERFORMANCE-RULES §2.12).
4. **The camera.** Children of `world` are in world units; the layer applies `(p + t) * zoom` (`worldPlace`) in device pixels.
5. **Losing the context.** Anything the stage makes itself must be dropped and rebuilt through `onGpuChange`. Check it with
   `tools/qa/gpuLayer.cjs` (lose, restore, lose again, never restored).
6. **Measure both ways on the same stick** and keep the move only if it is faster AND looks identical.

## The bar
- **The same look.** Compare both ways inside ONE page on ONE frozen frame, every world, upright 412x915 and sideways 915x412, at q0,
  q1 and q2. 0 differing px, then side-by-side stills for Matt's eye.
- **The layer is proven live.** `node tools/qa/gpuLayer.cjs <dev url> <out> 1-1 412x915` and `... 915x412` print PASS (36 checks):
  not started until used; WebGL 2; under the game canvas; the probe on Pokey's box within 1 CSS px before and after walking; lose and
  restore; lost again; no WebGL 2; never restored; no page errors; the 2D game running throughout.
- **No slower.** The measuring stick's table before and after. drawcheck PASS.
- **Bundle noted.** The main script and Pixi's files, raw and gzipped (2026-11-12: gpuPixi 369,325 B / 106,135 gz, browserAll 43,449 /
  11,192, init 20,749 / 6,296, webworkerAll 57; main +3.3 KB once something mounts the layer).

## Checks before reporting
Every gate in gates.md, in order, plus gpuLayer.cjs both ways. On a PRODUCTION build open `dist/sw.js`: Pixi's files are in the precache
list (chunkcheck checks it), and start a stage offline.

## Pitfalls we already paid for
- 2026-11-12: **A production build drops Pixi entirely until something real calls `mountGpuLayer`** (the dev-only probe is dead code
  there). To see the real files, build once with a caller; chunkcheck prints `Pixi: not in this build` otherwise.
- 2026-11-12: **Tools pick the first canvas in the page** (frozen.mjs, clipcheck, rec.mjs). The layer's canvas goes AFTER the game's in
  the page and under it by z-index, never before it.
- 2026-11-12: **A probe check that reads the player after waiting is off by his drift.** Fix the probe's world box when it is put and
  work the expected screen box out from that box.
- 2026-11-04: **Starting the layer on every stage launch, with nothing on it, failed clipcheck 3 of 3** (its 400-650 ms start-up slowed
  the parallel walks). Start it only when something goes on it, and under the card.
- 2026-11-04: **Pixi rounds css x resolution; the game canvas floors it**, and Pixi's resolution handling didn't follow resizes
  reliably. Run the layer at resolution 1 with the buffer exactly the 2D canvas's device size (`gpuFitBuffer`), everything placed in
  device pixels.
- 2026-11-04: **A Pixi v8 Sprite follows a change to its texture's frame only if the texture is `dynamic: true`.** Pooled sprites with
  reused textures kept the size of the first stamp they drew.
- 2026-11-04: **Pixi's own WebGL setup falls back to WebGL 1** when webgl2 fails. Pass a context made by us so it can't.
- 2026-11-04: **The copy into the 2D canvas is a readback where the 2D canvas is on the CPU** (this container; old phones): time the
  copy and fall back when it is slow. Frame times here do not show what a phone's GPU does with it.
- 2026-11-04: **The look comparison was noisy three ways**: the DOM over the canvas animates on its own clock (hide it); the ground
  squares paint a few per frame (draw the frozen frame about 40 times first); a pickup's ring moves on the real clock (mask what differs
  between two shots of the same frame, and report how many).
- 2026-11-04: **`page.setViewportSize` failed after a tap** (the game asks for fullscreen). Stub `Element.prototype.requestFullscreen`.
- 2026-11-04: **Judge the look at every quality step (q0, q1, q2), not only q0.**

## Tried and didn't work
- 2026-11-04: **Pixel-comparing two builds across page loads.** The same build shot twice differed by 2,000-59,000 px. Compare both
  ways inside one page, on one frozen frame.
- 2026-11-04: Comparing whole-page screenshots: the DOM animations gave 21,000 to 178,000 "different" pixels.
- 2026-11-12: **Pixi's per-feature imports, to cut its 434 KB: not tried.** The package's `exports` only offers the whole index (which
  is marked as having side effects) and the browser/webworker bundles; reaching into `lib/` needs an alias and hand-registering the
  extensions the index registers. Not quick and not safe, so it was left; it is its own job with its own look proof.
