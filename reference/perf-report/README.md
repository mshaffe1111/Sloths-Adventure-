# Perf report: what each build asks the canvas to draw (2026-10-30)

Measured by the perf harness in `tools/perf/` (PERF-B, for the frame-rate regression after the v7 release). It compares the same spots across builds:

| build | commit | what it is |
|---|---|---|
| v6 | 192cd165 | `main` before 10/29 night, about 29.5-29.8 fps on the phones |
| v7 | 412f54f | the v7 release (10/29 23:21), about 27 fps, 10 stalls a minute |
| today | 913677f | `main` on 10/30 morning (same as v7 for drawing) |
| ccrground | 06cbcf12 | the work branch with "Ground painted once" |
| ccrnow | b83de6e6 | the work branch at 10:45 AM ET (ground, culls, 2-6 bank) |
| merged | 9a76f161 | every helper's work merged (skies, fx, sprites, preload, ground, culls), 12:20 PM ET |

## How it was measured

- Each build runs in its own `git worktree` on its own `npx vite` dev server.
- Headless Chromium: upright 400x880 and sideways 880x400, deviceScaleFactor 3, touch and mobile on; requests to script.google.com are blocked.
- What was played:
  - the control test `?ctest=1&mix=14` and `&mix=8`, at 14 spots along the course;
  - stages 1-1, 1-3, 2-1, 3-2, 4-1, 5-1, 6-1 and 7-1 at 8 spots each, through `window.__play`;
  - 1-4, 2-6, 3-4 and 7-3 for the lead's follow-up.
- At each spot, Pokey is pinned in place and the game runs on Playwright's fake clock, so every build draws the same moments.
- The picture is held at q0 (canvas 2x CSS, 800x1760 upright) or q2 (1x CSS). The frame governor is switched off during a measurement.
- Each spot runs three passes:
  1. Settle for 1.5 s.
  2. Time 20 frames of `render()` with nothing wrapped (CPU ms, and render plus a 1-pixel read that waits for the raster).
  3. Count 8 frames with every `CanvasRenderingContext2D` call wrapped (`tools/perf/instrument.js`).
- Each call is filed under:
  - its call site (the first `/src/` stack frame, mapped back to the `.ts` line through Vite's source maps);
  - its layer (the line of `Engine.render` it came from);
  - its target (the main canvas, or an offscreen canvas baked during the frame).
- What is recorded per call site:
  - drawImage count, and visible device-pixel area clipped to the canvas, with source size and how far it is scaled;
  - fill and fillRect count and area;
  - clip() calls, classified as rect, convex or concave polygon, or curved, with point counts;
  - gradients and patterns created;
  - shadowBlur and filter sets;
  - globalCompositeOperation values, and draws made under them;
  - save, getImageData and putImageData;
  - canvases created.

**Headless CPU raster is not the phone GPU.** Use the counts, areas and clip types as the evidence; the CPU ms are a hint only. They are noisy, because up to four builds ran at once on 4 cores, and 1-4 upright in `four-stages-q0` for today and ccrnow ran while the container was out of memory.

## Sets (each folder: `report.md`, `summary.json`, `raw/*.json.gz`)

| folder | what | builds |
|---|---|---|
| [ctest-q0](ctest-q0/report.md) | control test, mix 14 and mix 8, both orientations, q0. Holds the **top 15 sites v7 added** (§5) | v6, v7, today, ccrground, merged |
| [ctest-q2](ctest-q2/report.md) | the same at q2 | v6, today, merged |
| [stages-q0](stages-q0/report.md) | 8 stages, both orientations, q0 | v6, v7, today, merged |
| [stages-q2](stages-q2/report.md) | 8 stages, both orientations, q2 | merged |
| [four-stages-q0](four-stages-q0/report.md) | 1-4, 2-6, 3-4, 7-3, q0 | today, ccrnow, merged |


## Findings

### 1. v7's regression was the painted ground

Control test at q0, per frame, v6 → v7:
- drawImage visible area: 6.1 → 10.9 screens;
- curved and concave clips: about 4.3 per frame. v6's were convex polygons; v7's were concave bank clips.

The sites v7 added, from `ctest-q0` §5:

| # | site | per frame in v7 |
|---:|---|---|
| 1 | `groundPaint.ts:126` drawSoil blob canvases | 4.9 Mpx, a 128x128 source scaled up to 46x |
| 2 | `groundPaint.ts:120` soil tiles | 2.7 Mpx |
| 3 | `protoArt.ts:568` bank clip | 3.5 → 8.5 clips, now concave or polygon |
| 4 | `groundPaint.ts:157` drawLip | 0.65 Mpx |
| 5 | `groundPaint.ts:139` gradient darkening | 0.53 Mpx |
| 7, 9 | drawEnd | |
| 11-14 | pitShade | 50 fillRects and 5 gradients per frame |

The ground alone came to about +8.9 Mpx a frame (6.3 upright screens), drawn inside concave clips. "today" draws exactly what v7 draws.

### 2. The merge (9a76f161) draws less than v6 everywhere measured

| per frame, q0 | v6 | v7 | merged |
|---|---:|---:|---:|
| control test: drawImage area (screens) | 6.12 | 10.9 | **5.64** |
| control test: clips (curved) | 9.2 (4.6) | 10.1 (4.3) | **1.1 (0.03)** |
| control test: gradients created | 20.5 | 18.8 | **0.16** |
| 8 stages: drawImage area (screens) | 6.39 | 12.3 | **5.64** |
| 8 stages: drawImage calls | 220 | 237 | **109** |
| 8 stages: clips (curved) | 10.8 (3.7) | 11.8 (4.0) | **1.35 (0.10)** |
| 8 stages: save() | 154 | 173 | **81** |

On 1-4, 2-6, 3-4 and 7-3, drawImage calls went 858 (today) → 138 (merged), after the rope cull. At q2 the merge draws 5.6 screens, against today's 11.0 and v6's 6.1.

### 3. What is left in the merge, by area (q0, per frame)

1. `scenery.ts:1967` drawFitted, the sky and backdrop strips: 3.3 Mpx (2.4 screens).
2. `scenery.ts:2274` drawVignette: a full screen (1.41 Mpx), stretched 15.7x from a tiny image. Baking it into the sky, or dropping it at q1 and q2, is the cheapest remaining win.
3. `protoArt.ts:1068` drawGroundChunks: 1.0-1.2 Mpx.
4. `scenery.ts:1971` drawFitted's bottom-row stretch: 0.64 Mpx.
5. `scenery.ts:1505` lanePool: 0.49 Mpx.
6. `w5Look.ts:1424` drawW5Light: a full-screen fillRect on 5-1.

### 4. What is left, by call count (the cost the area numbers do not show)

- **`flora.ts:696` fernFrond:**
  - 467 (upright) and 841 (sideways) path `fill()` calls per frame on 7-3, via `envPlants.ts:115`;
  - 135-162 on 2-6, 58-73 on 3-4, and 64-121 on 4-1.

  Bake each fern once.
- `w4Grit.ts:56` piece: 86-153 drawImage per frame on 4-1, plus `bossFx` drawFx 34.
- `stageArt.ts:178` drawCheckpointArt: about 15-22 drawImage per frame with almost no visible area. It looks unculled.
- `artKit.ts:295` drawGrass: 24-50 fills per frame on 1-3.

### 5. Texture sizes for the cheap phones (PERFORMANCE-RULES §2.7)

- `scenery.ts:1714` drawTile reads a **5868x1761** canvas, over 4096.
- `scenery.ts:1967` drawFitted reads up to **3441x1805**.

Both are about 25-41 MB of GPU memory each. Worth checking on the 2020 phone.

## Running it again

```
git worktree add --detach /home/user/perfwt/<name> <commit> && ln -s $PWD/node_modules /home/user/perfwt/<name>/node_modules
PERF_Q=0 node tools/perf/run.mjs <name> /home/user/perfwt/<name> <port> <out dir> [ctest-mix14,ctest-mix8,1-1,...] [port|land]
PERF_BUILDS=v6,merged PERF_DIFF=v6:merged node tools/perf/report.mjs <dir with <name>.json files> report.md summary.json
tools/perf/assemble.sh <dir with ctest-q0/ ctest-q2/ stages-q0/ stages-q2/ four-stages-q0/>
```

A run of one stage in both orientations takes about 1.5-2 minutes alone, and 3-10 minutes when four builds share the 4 cores. Keep it to four at once: more ran out of memory.
