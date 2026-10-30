# Frame cost by build: v6 (192cd165), today (913677f), merged (9a76f161 (the merge, 12:20 ET))

Measured 2026-10-30 by the perf harness (`tools/perf/`). Headless Chromium (SwiftShader), deviceScaleFactor 3, picture held at q2 (canvas at 1x CSS). Every number is per frame on the main canvas unless it says otherwise, averaged over every counted frame of every spot.

**Read the counts, areas and clip types as the evidence.** CPU ms is headless software raster on a 4-core container, a hint of relative weight only, not the phone.

## 1. Per-frame totals

| per frame | v6 | today | merged |
|---|---:|---:|---:|
| frames counted | 466 | 471 | 467 |
| drawImage calls | 98.1 | 108 | 91.9 |
| drawImage visible area (screens) | 6.13 | 11.0 | 5.62 |
| fill/fillRect calls | 101 | 140 | 73.2 |
| fill area, bbox (screens) | 4.12 | 2.57 | 0.08 |
| area drawn with a non-source-over blend (screens) | 0.00 | 0.00 | 0.00 |
| clip() calls | 9.08 | 10.2 | 1.09 |
|   of them curved/polygon (not a plain rect) | 4.56 | 4.35 | 0.04 |
| gradients created | 20.0 | 19.0 | 0.20 |
| patterns created | 0.00 | 0.00 | 0.00 |
| save() | 51.8 | 52.5 | 36.7 |
| shadowBlur>0 sets | 0.00 | 0.00 | 0.00 |
| filter sets | 0.00 | 0.00 | 0.00 |
| globalCompositeOperation sets (not source-over) | 0.00 | 0.00 | 0.00 |
| getImageData/putImageData | 0.00 | 0.00 | 0.00 |
| canvases created | 0.00 | 0.00 | 0.00 |

## 2. Per run (scenario x orientation)

`img` = drawImage calls / visible screens; `clip` = all / curved-or-polygon; `ms` = render() CPU median (p90), `+flush` = render plus a 1-pixel read that waits for the raster, median.

| run | v6 img | v6 clip | v6 grad | v6 ms | v6 +flush | today img | today clip | today grad | today ms | today +flush | merged img | merged clip | merged grad | merged ms | merged +flush |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ctest-mix14 port | 69.0 / 5.96 | 6.82 / 3.30 | 13.9 | 39.3 (70.5) | 49.4 | 76.1 / 9.41 | 8.15 / 3.08 | 13.9 | 22.6 (39.0) | 26.4 | 63.1 / 5.22 | 1.00 / 0.00 | 0.07 | 17.1 (30.6) | 20.2 |
| ctest-mix14 land | 130 / 6.32 | 10.6 / 5.42 | 24.5 | 47.3 (86.5) | 58.4 | 142 / 12.5 | 12.1 / 5.60 | 21.6 | 30.7 (56.5) | 35.0 | 123 / 6.06 | 1.15 / 0.15 | 0.51 | 2.20 (16.2) | 18.7 |
| ctest-mix8 port | 68.5 / 5.98 | 7.33 / 3.66 | 15.8 | 39.2 (76.3) | 49.6 | 75.4 / 9.50 | 8.46 / 3.23 | 15.9 | 25.9 (47.9) | 29.7 | 62.3 / 5.22 | 1.00 / 0.00 | 0.00 | 16.6 (31.0) | 19.9 |
| ctest-mix8 land | 126 / 6.25 | 11.5 / 5.87 | 25.9 | 41.6 (83.9) | 54.3 | 140 / 12.5 | 12.3 / 5.47 | 24.5 | 28.3 (53.9) | 32.5 | 120 / 6.00 | 1.21 / 0.00 | 0.22 | 4.00 (20.8) | 21.6 |

## 3. By layer (the line of Engine.render each call came from)

### v6

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5631` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.5 | 3.36 | 5.00 | 3.07 | 0.00 (0.00) | 2.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6031` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 8.64 | 2.08 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 6.17 | 0.00 |
| `src/game/engine.ts:5677` `else renderWorldObjects(` | 14.5 | 0.06 | 94.6 | 0.98 | 4.56 (4.56) | 18.0 | 25.2 | 0.00 |
| `src/game/engine.ts:5653` `this.drawWaterAndFlags(ctx, world);` | 30.2 | 0.30 | 1.00 | 0.07 | 1.00 (0.00) | 0.00 | 1.90 | 0.00 |
| `src/game/engine.ts:5703` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 15.9 | 0.25 | 0.03 | 0.00 | 3.45 (0.00) | 0.00 | 4.92 | 0.00 |
| `src/game/engine.ts:5783` `this.collectibles.forEach((item) => {` | 15.8 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 8.42 | 0.00 |
| `src/game/engine.ts:5949` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5840` `this.enemies.forEach((enemy) => {` | 1.31 | 0.01 | 0.43 | 0.00 | 0.00 (0.00) | 0.00 | 0.89 | 0.00 |
| `src/game/engine.ts:5954` `if (this.proto?.bushes) this.drawBushes(ctx);` | 0.07 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.07 | 0.00 |
| `src/game/engine.ts:5656` `this.drawRivers(ctx, world, false);` | 0.05 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:5702` `this.drawRivers(ctx, world, true);` | 0.00 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.03 | 0.03 | 0.00 |
| `src/game/engine.ts:5689` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.09 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:5907` `if (this.proto?.watch) this.drawWatchBack(ctx);` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.10 | 0.00 |
| `src/game/engine.ts:5667` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5604` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5608` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5648` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5993` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6016` `ctx.restore(); // end world transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6139` `ctx.restore(); // end DPR transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5665` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.02 | 0.00 |
| `src/game/engine.ts:5668` `ctx.restore();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |

### today

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5819` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 26.7 | 6.21 | 63.2 | 0.44 | 8.63 (4.31) | 8.89 | 12.7 | 0.00 |
| `src/game/engine.ts:5743` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.7 | 3.16 | 3.00 | 2.06 | 0.50 (0.00) | 1.00 | 0.50 | 0.00 |
| `src/game/engine.ts:6158` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 8.64 | 1.20 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 6.18 | 0.00 |
| `src/game/engine.ts:5766` `this.drawWaterAndFlags(ctx, world);` | 30.4 | 0.29 | 1.00 | 0.07 | 1.00 (0.00) | 0.00 | 1.91 | 0.00 |
| `src/game/engine.ts:5904` `this.collectibles.forEach((item) => {` | 15.7 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 8.40 | 0.00 |
| `src/game/engine.ts:5790` `else renderWorldObjects(` | 12.0 | 0.02 | 72.0 | 0.01 | 0.03 (0.03) | 9.03 | 16.1 | 0.00 |
| `src/game/engine.ts:6074` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5962` `this.enemies.forEach((enemy) => {` | 1.33 | 0.01 | 0.44 | 0.00 | 0.00 (0.00) | 0.00 | 0.90 | 0.00 |
| `src/game/engine.ts:5854` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.83 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.83 | 0.00 |
| `src/game/engine.ts:6080` `if (this.proto?.bushes) this.drawBushes(ctx);` | 0.07 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.07 | 0.00 |
| `src/game/engine.ts:5769` `this.drawRivers(ctx, world, false);` | 0.44 | 0.00 | 0.04 | 0.00 | 0.04 (0.00) | 0.00 | 0.42 | 0.00 |
| `src/game/engine.ts:5815` `this.drawRivers(ctx, world, true);` | 0.27 | 0.00 | 0.04 | 0.00 | 0.04 (0.00) | 0.04 | 0.31 | 0.00 |
| `src/game/engine.ts:5802` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.10 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.04 | 0.00 |
| `src/game/engine.ts:6032` `if (this.proto?.watch) this.drawWatchBack(ctx);` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.10 | 0.00 |
| `src/game/engine.ts:5780` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5712` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5716` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5761` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6119` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6143` `ctx.restore(); // end world transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6263` `ctx.restore(); // end DPR transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5822` `if (!(ownScene && lair)) drawBounceCaps(ctx, world.id, this.withoutPai` | 0.05 | 0.00 | 0.05 | 0.00 | 0.00 (0.00) | 0.00 | 0.05 | 0.00 |

### merged

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5755` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.7 | 3.16 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6171` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 8.64 | 1.19 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 6.17 | 0.00 |
| `src/game/engine.ts:5832` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 15.4 | 0.87 | 0.03 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:5778` `this.drawWaterAndFlags(ctx, world);` | 30.0 | 0.30 | 0.98 | 0.07 | 0.98 (0.00) | 0.00 | 1.88 | 0.00 |
| `src/game/engine.ts:5917` `this.collectibles.forEach((item) => {` | 11.1 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 5.97 | 0.00 |
| `src/game/engine.ts:5802` `else renderWorldObjects(` | 12.0 | 0.02 | 71.7 | 0.01 | 0.04 (0.04) | 0.16 | 16.0 | 0.00 |
| `src/game/engine.ts:6087` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5975` `this.enemies.forEach((enemy) => {` | 1.31 | 0.01 | 0.43 | 0.00 | 0.00 (0.00) | 0.00 | 0.89 | 0.00 |
| `src/game/engine.ts:5867` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.81 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.81 | 0.00 |
| `src/game/engine.ts:6093` `if (this.proto?.bushes) this.drawBushes(ctx);` | 0.07 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.07 | 0.00 |
| `src/game/engine.ts:5781` `this.drawRivers(ctx, world, false);` | 0.39 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.00 | 0.38 | 0.00 |
| `src/game/engine.ts:5827` `this.drawRivers(ctx, world, true);` | 0.24 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.03 | 0.27 | 0.00 |
| `src/game/engine.ts:5814` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.09 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:6045` `if (this.proto?.watch) this.drawWatchBack(ctx);` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.10 | 0.00 |
| `src/game/engine.ts:5792` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5724` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5728` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5773` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6132` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6156` `ctx.restore(); // end world transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6276` `ctx.restore(); // end DPR transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5835` `if (!(ownScene && lair)) drawBounceCaps(ctx, world.id, this.withoutPai` | 0.05 | 0.00 | 0.05 | 0.00 | 0.00 (0.00) | 0.00 | 0.05 | 0.00 |

## 4. By call site, top 25 per build (ranked by device megapixels touched per frame, clip/blend work weighted up)

### v6

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/groundArt.ts:110` (drawGroundBody) | main | 0.00 | 0.00 | 0.00 | 0.00 | 4.47 (4.47) | 0.00 |  |
| `src/game/scenery.ts:1673` (drawStrip) | main | 4.74 | 0.96 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1760x868 |
| `src/game/scenery.ts:1713` (renderSky) | main | 0.00 | 0.00 | 2.00 | 0.70 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1639` (drawTile) | main | 1.47 | 0.35 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/scenery.ts:1823` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 0.35 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1879` (drawVignette) | main | 1.00 | 0.35 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/groundArt.ts:84` (fillFace) | main | 0.00 | 0.00 | 4.80 | 0.13 | 0.00 (0.00) | 0.00 |  |
| `src/game/groundArt.ts:112` (drawGroundBody) | main | 0.00 | 0.00 | 4.47 | 0.13 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1495` (lanePool) | main | 1.00 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/scenery.ts:1679` (drawStrip) | main | 4.74 | 0.09 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1760x868 |
| `src/game/groundArt.ts:53` (maskedFill) | off | 0.00 | 0.00 | 0.81 | 0.05 | 0.00 (0.00) | 0.00 | special 0.81 (fillRect@destination-in 0.81); into 192x760 |
| `src/game/stageArt.ts:311` (row) | main | 5.95 | 0.09 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x516 |
| `src/game/protoArt.ts:578` (drawBankArt) | main | 9.89 | 0.07 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/groundArt.ts:135` (drawGroundBody) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.56 |  |
| `src/game/groundArt.ts:128` (drawGroundBody) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.54 |  |
| `src/game/terrain.ts:104` (stone) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.34 |  |
| `src/game/artKit.ts:305` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.69 |  |
| `src/game/artKit.ts:316` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.69 |  |
| `src/game/groundArt.ts:91` (fillCap) | main | 0.00 | 0.00 | 4.80 | 0.04 | 0.00 (0.00) | 0.00 |  |
| `src/game/groundArt.ts:84` (fillFace) | off | 0.00 | 0.00 | 0.41 | 0.04 | 0.00 (0.00) | 0.00 | into 192x760 |
| `src/game/protoArt.ts:566` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 3.45 (0.00) | 0.00 |  |
| `src/game/stageArt.ts:306` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 1.00 (0.00) | 0.00 |  |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.17 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/scenery.ts:1740` (renderSky) | main | 0.00 | 0.00 | 2.00 | 0.02 | 0.00 (0.00) | 0.00 |  |
| `src/game/stageArt.ts:308` (drawPitWater) | main | 0.00 | 0.00 | 1.00 | 0.02 | 0.00 (0.00) | 0.00 |  |

### today

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/groundPaint.ts:126` (drawSoil) | main | 4.46 | 1.24 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/protoArt.ts:568` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 8.63 (4.31) | 0.00 |  |
| `src/game/scenery.ts:1780` (drawStrip) | main | 4.86 | 0.83 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3214x1736 |
| `src/game/groundPaint.ts:120` (drawSoil) | main | 9.03 | 0.69 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/scenery.ts:1952` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 0.35 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:2011` (drawVignette) | main | 1.00 | 0.35 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/scenery.ts:1826` (renderSky) | main | 0.00 | 0.00 | 1.00 | 0.35 | 0.00 (0.00) | 0.00 |  |
| `src/game/groundPaint.ts:157` (drawLip) | main | 6.91 | 0.17 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/scenery.ts:1792` (drawStrip) | main | 4.86 | 0.16 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3214x1736 |
| `src/game/groundPaint.ts:139` (drawSoil) | main | 0.00 | 0.00 | 3.94 | 0.13 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/stageArt.ts:311` (row) | main | 5.95 | 0.09 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x516 |
| `src/game/groundPaint.ts:133` (drawSoil) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.94 |  |
| `src/game/terrain.ts:106` (stone) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.38 |  |
| `src/game/protoArt.ts:688` (pitShade) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.01 |  |
| `src/game/artKit.ts:305` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.77 |  |
| `src/game/artKit.ts:316` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.77 |  |
| `src/game/groundPaint.ts:234` (drawEnd) | main | 1.88 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 384x576 |
| `src/game/scenery.ts:1684` (drawTile) | main | 1.46 | 0.04 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/protoArt.ts:705` (pitShade) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 1.94 |  |
| `src/game/stageArt.ts:306` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 1.00 (0.00) | 0.00 |  |
| `src/game/groundPaint.ts:235` (drawEnd) | main | 1.19 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.18 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/stageArt.ts:308` (drawPitWater) | main | 0.00 | 0.00 | 1.00 | 0.02 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1853` (renderSky) | main | 0.00 | 0.00 | 1.00 | 0.02 | 0.00 (0.00) | 0.00 |  |

### merged

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/scenery.ts:1967` (drawFitted) | main | 4.84 | 0.83 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1506x742 |
| `src/game/scenery.ts:2274` (drawVignette) | main | 1.00 | 0.35 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/protoArt.ts:1068` (drawGroundChunks) | main | 12.1 | 0.30 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 255x255 |
| `src/game/scenery.ts:1971` (drawFitted) | main | 4.84 | 0.16 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1506x742 |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/stageArt.ts:380` (pitRow) | main | 5.81 | 0.09 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 420x105 |
| `src/game/scenery.ts:1714` (drawTile) | main | 1.47 | 0.04 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2935x881 |
| `src/game/stageArt.ts:401` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.98 (0.00) | 0.00 |  |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.17 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/stageArt.ts:403` (drawPitWater) | main | 0.00 | 0.00 | 0.98 | 0.02 | 0.00 (0.00) | 0.00 |  |
| `src/game/readable.ts:85` (drawAura) | main | 4.00 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/readable.ts:87` (drawAura) | main | 4.00 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/groundArt.ts:110` (drawGroundBody) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.04 (0.04) | 0.00 |  |
| `src/game/sheetBake.ts:118` (drawSheet) | main | 3.37 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1536x1831 |
| `src/game/protoArt.ts:491` (drawBranchArt) | main | 3.04 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/vectorArt.ts:1009` (fillGlow) | main | 2.35 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/sheetBake.ts:117` (drawSheet) | main | 4.79 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1152x1373 |
| `src/game/stageArt.ts:178` (drawCheckpointArt) | main | 21.6 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 88x136 |
| `src/game/paintedScenery.ts:102` (drawGroundFlora) | main | 5.66 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 125x102 |
| `src/game/stageArt.ts:120` (glow) | main | 0.55 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/paintedScenery.ts:104` (drawGroundFlora) | main | 6.08 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 125x102 |
| `src/game/protoArt.ts:231` (blit) | main | 0.22 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/artKit.ts:295` (drawGrass) | main | 0.00 | 0.00 | 43.1 | 0.00 | 0.00 (0.00) | 0.00 |  |
| `src/game/creatureAnim.ts:167` (draw) | main | 0.48 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x1289 |
| `src/game/columnArt.ts:462` (drawColumn) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.05 |  |

## merged against v6

### Heavier in merged than v6 (top 10)

| # | call site (merged) | v6→merged | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/scenery.ts:1967` (drawFitted) | **new** | 4.84 | 0.83 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (sw > 0 && sh2 > 0) ctx.drawImage(cv, sx, sy, sw, sh2, (dx + sx * r) / k, (y0`; src up to 1506x742 |
| 2 | `src/game/protoArt.ts:1068` (drawGroundChunks) | **new** | 12.1 | 0.30 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 255x255 |
| 3 | `src/game/scenery.ts:1971` (drawFitted) | **new** | 4.84 | 0.16 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (gap > 0) ctx.drawImage(cv, 0, f.oy + f.d - rows, bw, rows, px, top + dh - 1 `; src up to 1506x742; scaled up to 14.9x |
| 4 | `src/game/stageArt.ts:380` (pitRow) | **new** | 5.81 | 0.09 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `else ctx.drawImage(src, x, y, TILE, h);`; src up to 420x105 |
| 5 | `src/game/scenery.ts:1714` (drawTile) | **new** | 1.47 | 0.04 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (const [a, b] of fb.rows) ctx.drawImage(fb.cv, 0, a, fb.cv.width, b - a, dx `; src up to 2935x881 |
| 6 | `src/game/sheetBake.ts:118` (drawSheet) | **new** | 3.37 | 0.01 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `} else ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);`; src up to 1536x1831 |
| 7 | `src/game/sheetBake.ts:117` (drawSheet) | **new** | 4.79 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(b.cv, sx * r + ex, sy * r + ey, bw - 2 * ex, bh - 2 * ey, dx + ex `; src up to 1152x1373 |
| 8 | `src/game/stageArt.ts:178` (drawCheckpointArt) | **new** | 21.6 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(src, ox + sx * b, oy, sw * b, sh, left + sx * k, top + dy, sw * k,`; src up to 88x136 |
| 9 | `src/game/creatureAnim.ts:167` (draw) | **new** | 0.48 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(baked, f.x * r + e, f.y * r + e, f.w * r - 2 * e, f.h * r - 2 * e,`; src up to 1024x1289 |
| 10 | `src/game/stageArt.ts:168` (drawCheckpointArt) | **new** | 0.90 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(src, ox, oy, poleW * b, sh, left, top, poleW * k, f.h * k);`; src up to 88x136 |

### Lighter in merged than v6 (top 12)

| site (v6) | weight | drawImage | img Mpx | clips | gradients |
|---|---:|---:|---:|---:|---:|
| `src/game/groundArt.ts:110` (drawGroundBody) | 1.18→0.01 | 0.00→0.00 | 0.00→0.00 | 4.47→0.04 | 0.00→0.00 |
| `src/game/scenery.ts:1673` (drawStrip) | 0.96→gone | 4.74→0 | 0.96→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1713` (renderSky) | 0.70→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1639` (drawTile) | 0.35→gone | 1.47→0 | 0.35→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1823` (renderScenery) | 0.35→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundArt.ts:84` (fillFace) | 0.13→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 |
| `src/game/groundArt.ts:112` (drawGroundBody) | 0.13→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 |
| `src/game/scenery.ts:1679` (drawStrip) | 0.09→gone | 4.74→0 | 0.09→0 | 0.00→0 | 0.00→0 |
| `src/game/groundArt.ts:53` (maskedFill) | 0.09→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/stageArt.ts:311` (row) | 0.09→gone | 5.95→0 | 0.09→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:578` (drawBankArt) | 0.07→gone | 9.89→0 | 0.07→0 | 0.00→0 | 0.00→0 |
| `src/game/groundArt.ts:135` (drawGroundBody) | 0.07→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 | 3.56→0.04 |

## merged against today

### Heavier in merged than today (top 10)

| # | call site (merged) | today→merged | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/scenery.ts:1967` (drawFitted) | **new** | 4.84 | 0.83 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (sw > 0 && sh2 > 0) ctx.drawImage(cv, sx, sy, sw, sh2, (dx + sx * r) / k, (y0`; src up to 1506x742 |
| 2 | `src/game/protoArt.ts:1068` (drawGroundChunks) | **new** | 12.1 | 0.30 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 255x255 |
| 3 | `src/game/scenery.ts:1971` (drawFitted) | **new** | 4.84 | 0.16 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (gap > 0) ctx.drawImage(cv, 0, f.oy + f.d - rows, bw, rows, px, top + dh - 1 `; src up to 1506x742; scaled up to 14.9x |
| 4 | `src/game/stageArt.ts:380` (pitRow) | **new** | 5.81 | 0.09 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `else ctx.drawImage(src, x, y, TILE, h);`; src up to 420x105 |
| 5 | `src/game/scenery.ts:1714` (drawTile) | **new** | 1.47 | 0.04 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (const [a, b] of fb.rows) ctx.drawImage(fb.cv, 0, a, fb.cv.width, b - a, dx `; src up to 2935x881 |
| 6 | `src/game/sheetBake.ts:118` (drawSheet) | **new** | 3.37 | 0.01 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `} else ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);`; src up to 1536x1831 |
| 7 | `src/game/sheetBake.ts:117` (drawSheet) | **new** | 4.79 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(b.cv, sx * r + ex, sy * r + ey, bw - 2 * ex, bh - 2 * ey, dx + ex `; src up to 1152x1373 |
| 8 | `src/game/stageArt.ts:178` (drawCheckpointArt) | **new** | 21.6 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(src, ox + sx * b, oy, sw * b, sh, left + sx * k, top + dy, sw * k,`; src up to 88x136 |
| 9 | `src/game/stageArt.ts:168` (drawCheckpointArt) | **new** | 0.90 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(src, ox, oy, poleW * b, sh, left, top, poleW * k, f.h * k);`; src up to 88x136 |

### Lighter in merged than today (top 12)

| site (today) | weight | drawImage | img Mpx | clips | gradients |
|---|---:|---:|---:|---:|---:|
| `src/game/groundPaint.ts:126` (drawSoil) | 1.24→gone | 4.46→0 | 1.24→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:568` (drawBankArt) | 1.22→gone | 0.00→0 | 0.00→0 | 8.63→0 | 0.00→0 |
| `src/game/scenery.ts:1780` (drawStrip) | 0.83→gone | 4.86→0 | 0.83→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:120` (drawSoil) | 0.69→gone | 9.03→0 | 0.69→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1952` (renderScenery) | 0.35→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1826` (renderSky) | 0.35→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:157` (drawLip) | 0.17→gone | 6.91→0 | 0.17→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1792` (drawStrip) | 0.16→gone | 4.86→0 | 0.16→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:139` (drawSoil) | 0.13→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/stageArt.ts:311` (row) | 0.09→gone | 5.95→0 | 0.09→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:133` (drawSoil) | 0.08→gone | 0.00→0 | 0.00→0 | 0.00→0 | 3.94→0 |
| `src/game/terrain.ts:106` (stone) | 0.07→gone | 0.00→0 | 0.00→0 | 0.00→0 | 3.38→0 |

