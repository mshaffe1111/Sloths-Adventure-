# GL0: WebGL step one, measured (branch t-webgl-0, base d0276817). Stopped early at 12:03 PM ET on the lead's word (budget).

## Done
- **The measuring stick** (b0708846, ac80b584): `tools/perf/layerstick.mjs` + `src/game/layerClock.ts`, 17 tests. Per layer (sky, far, mid, ground, props, creatures, pokey, front, hud; span `squares`), CPU x1/x4/x6, upright and sideways, two readings (cpu = main thread; flush = with raster/GPU work), two pipelines (sw = software canvas; gpu = canvas on the GPU process as on a phone, SwiftShader). Every page proves itself (a planted 5 ms must land in its layer; the first reading re-read at the end).
- **Stage 0, R-3.1** (510002b4..fb0aca05, merged c2098158): Pixi 8.22.0 pinned (published 10-01), `gpuLayer.ts` (WebGL 2 only, one canvas under the 2D one, driven by the loop, loss -> restore once, else Canvas 2D for the session, no-WebGL-2 fallback), chunkcheck's Pixi rule (planted test), `tools/qa/gpuLayer.cjs` PASS both ways (36 checks each). With nothing on the layer Pixi is NOT in a production build.
- **R-165.142, the gameCanvas fix** (ac80b584): a preload asked for the game canvas's 2D context before the engine, so `willReadFrequently: false` was ignored and Chrome moves the canvas off the GPU after a few pixel reads. `gpuprof=1` on the testers' link had this hole: phone 'layers' lines before this fix may be of a demoted canvas. Now one shared setting (`gameCanvas.ts`, planted test).

## Where the frame goes today (frozen frames, q0, ms a frame; full tables in stick-before/ and ground-ab-gpu/)
| Pipeline, stage | CPU | far | mid | ground (squares) | props | hud | whole draw | main thread only |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| sw, 1-1 upright | x1 / x4 / x6 | 2.6 / 12.7 / 20.0 | 6.1 / 27.7 / 42.9 | 7.7 (6.2) / 34.1 / 52.8 | 0.9 / 3.6 / 5.9 | 6.8 / 31.3 / 46.6 | 25 / 116 / 174 | not separable |
| sw, 3-2 sideways | x1 / x4 / x6 | 2.1 / 11.2 / 18.2 | 6.0 / 29.0 / 48.3 | 12.9 (11.5) / 61.1 / 103.1 | 1.5 / 7.5 / 11.6 | 6.8 / 30.3 / 47.2 | 31 / 147 / 240 | not separable |
| sw, 8-1 sideways | x1 / x4 / x6 | 2.3 / 11.4 / 19.6 | 6.3 / 29.9 / 50.9 | 13.2 (9.0) / 62.6 / 99.0 | 1.5 / 7.0 / 11.6 | 7.5 / 35.9 / 51.0 | 33 / 161 / 256 | not separable |
| gpu, 1-1 upright | x1 / x4 | 15.3 / 21.9 | 30.1 / 43.9 | 22.8 (17.9) / 33.9 | 4.5 / 6.9 | 16.2 / 23.1 | 93 / 140 | **1.0 / 6.5** |
The finding: on the phone-like pipeline the draw costs the main thread about 1 ms a frame. The time is GPU fill: backdrop strips (far + mid) about half, then ground, then the HUD overlay. Creatures read 0 (none in view at these spots; the stick now adds a creature spot, not yet run).

## R-3.3 verdict: NOT kept (built whole in a8048494, taken out in a42c8f67)
| 1-1 upright, gpu pipeline | squares, GPU work x1 / x4 | squares, main thread x1 / x4 | whole draw x1 / x4 |
|---|---:|---:|---:|
| 2D stamps (today) | 17.9 / 24.7 | 0.10 / 0.27 | 93 / 140 |
| WebGL textures, copied in | 60.2 / 82.5 | 0.45 / 2.97 | 136 / 203 |
- Software canvas: the copy is a readback, 4 -> 41 ms (in-page check); the timed copy caught it and fell back. Look: 0.4% (gpu) to 1.8% (sw) of pixels differ, nearly all by 1-2 of 255, worst 9 of 255 at the squares' seams. Not identical.
- Why: a 2D canvas on the GPU already draws a baked canvas as a texture; a copy layer adds a full-screen blend and removes nothing. The same holds for the 11-04 backdrop copy design.

## Step 3 recommendation: which layers to SHOW on WebGL first
1. First re-take phone numbers with the fixed `gpuprof=1` (R-165.142): SwiftShader is fill-bound; a phone may not be.
2. The backdrop (far + mid, about half the GPU work), SHOWN under a see-through 2D canvas, the opaque far strip with blending off. Blocker to clear first: every `lighter`/`screen`/`multiply` effect drawn over it must move too or be re-baked (the 11-04 look failure). Start with an inventory of those effects by layer (instrument.js already counts blends).
3. Then the ground's squares as shown sprites (a8048494 has the texture code), then the HUD overlay as its own top canvas.

## Not done, honestly (the Opus builder's first steps, in order)
- Caveats on the numbers: the gpu rows come from one A/B page taken while the base stage lock ran at low priority; the sw table was taken while the stage 0 fork was building. Re-take on a quiet machine: `node tools/perf/layerstick.mjs reference/qa-reports/GL0/stick-gpu 1-1,3-2,8-1 --pipeline gpu --rates 1,4,6 --spots 3` (never edit src while it runs).
- Gates on a42c8f67's tree: tsc PASS; build + chunkcheck PASS; artcheck, knowncheck, generalitycheck PASS; stage lock `102/102 stages unchanged` against d0276817; full tests STOPPED at 1,701 ok, 0 failed, not finished (`npx tsx --test src/audio/*.test.ts src/game/*.test.ts ...`, about 30 min here). NOT RUN: drawcheck, clipcheck, buildcheck, kbdcheck, seedlist --check, tierBots, roadmapcheck, gpuLayer.cjs on the final tree, the offline start (no Pixi chunk exists to cache until a layer mounts).
- Stills: no valid before/after pair. `layerstick.mjs --stills-only/--diff` (base vs branch) differed on 15 of 15 stills though the draw code is unchanged (`git diff d0276817 -- src/game/protoArt.ts` is marks only): two page loads do not land on the same frame. The tool's mode is unproven; fix it or shoot inside one page.
- Roadmap rows to write: R-3.1 done pending gates; R-3.3 measured and dropped; R-165.142; the stick (R-150.4/R-150.1 as briefed).

## Method update
perf-measure.md step 8 and four pitfalls (a timing tool that demotes the canvas it times; a tool's module import can be a second copy; cpu readings on a software canvas; empty creature spots). webgl.md: stage 0, and R-3.3 under "Tried and didn't work".
