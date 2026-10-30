# Frame cost by build: v6 (192cd165), v7 (412f54f), today (913677f), ccrground (06cbcf12 (ccr + ground baked)), merged (9a76f161 (the merge, 12:20 ET))

Measured 2026-10-30 by the perf harness (`tools/perf/`). Headless Chromium (SwiftShader), deviceScaleFactor 3, picture held at q0 (canvas at 2x CSS). Every number is per frame on the main canvas unless it says otherwise, averaged over every counted frame of every spot.

**Read the counts, areas and clip types as the evidence.** CPU ms is headless software raster on a 4-core container, a hint of relative weight only, not the phone.

## 1. Per-frame totals

| per frame | v6 | v7 | today | ccrground | merged |
|---|---:|---:|---:|---:|---:|
| frames counted | 469 | 468 | 468 | 470 | 468 |
| drawImage calls | 102 | 112 | 112 | 101 | 96.3 |
| drawImage visible area (screens) | 6.12 | 10.9 | 10.9 | 5.63 | 5.64 |
| fill/fillRect calls | 102 | 139 | 138 | 76.6 | 73.2 |
| fill area, bbox (screens) | 4.11 | 2.58 | 2.58 | 2.14 | 0.08 |
| area drawn with a non-source-over blend (screens) | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| clip() calls | 9.17 | 10.1 | 10.1 | 1.60 | 1.09 |
|   of them curved/polygon (not a plain rect) | 4.61 | 4.28 | 4.26 | 0.03 | 0.03 |
| gradients created | 20.5 | 18.8 | 18.8 | 10.1 | 0.16 |
| patterns created | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| save() | 56.0 | 56.1 | 56.0 | 43.7 | 40.8 |
| shadowBlur>0 sets | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| filter sets | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| globalCompositeOperation sets (not source-over) | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| getImageData/putImageData | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| canvases created | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## 2. Per run (scenario x orientation)

`img` = drawImage calls / visible screens; `clip` = all / curved-or-polygon; `ms` = render() CPU median (p90), `+flush` = render plus a 1-pixel read that waits for the raster, median.

| run | v6 img | v6 clip | v6 grad | v6 ms | v6 +flush | v7 img | v7 clip | v7 grad | v7 ms | v7 +flush | today img | today clip | today grad | today ms | today +flush | ccrground img | ccrground clip | ccrground grad | ccrground ms | ccrground +flush | merged img | merged clip | merged grad | merged ms | merged +flush |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ctest-mix14 port | 73.4 / 5.97 | 6.82 / 3.29 | 14.4 | 79.0 (132) | 99.5 | 80.1 / 9.42 | 8.15 / 3.08 | 13.9 | 52.6 (92.2) | 63.2 | 80.1 / 9.36 | 8.08 / 3.04 | 13.8 | 65.4 (105) | 76.8 | 71.8 / 5.24 | 2.00 / 0.00 | 8.14 | 63.3 (112) | 81.6 | 67.4 / 5.23 | 1.00 / 0.00 | 0.07 | 47.3 (80.7) | 59.5 |
| ctest-mix14 land | 134 / 6.30 | 10.7 / 5.43 | 25.6 | 100 (163) | 128 | 145 / 12.3 | 11.7 / 5.44 | 21.3 | 71.7 (116) | 84.0 | 145 / 12.3 | 11.7 / 5.42 | 21.1 | 77.4 (123) | 92.0 | 133 / 6.07 | 1.14 / 0.14 | 10.5 | 80.2 (140) | 93.0 | 128 / 6.08 | 1.14 / 0.14 | 0.35 | 46.0 (76.8) | 61.5 |
| ctest-mix8 port | 72.9 / 5.98 | 7.42 / 3.71 | 15.7 | 124 (199) | 163 | 79.4 / 9.49 | 8.46 / 3.23 | 15.9 | 86.0 (142) | 103 | 79.4 / 9.50 | 8.46 / 3.23 | 15.9 | 87.5 (170) | 104 | 70.7 / 5.23 | 2.00 / 0.00 | 9.31 | 39.3 (61.8) | 50.6 | 66.3 / 5.24 | 1.00 / 0.00 | 0.00 | 45.3 (87.2) | 56.9 |
| ctest-mix8 land | 129 / 6.24 | 11.8 / 5.97 | 26.4 | 72.2 (127) | 96.4 | 144 / 12.4 | 12.1 / 5.39 | 24.4 | 97.5 (161) | 112 | 143 / 12.4 | 12.0 / 5.38 | 24.3 | 81.5 (156) | 95.5 | 129 / 6.00 | 1.27 / 0.00 | 12.5 | 54.8 (132) | 64.4 | 124 / 6.00 | 1.21 / 0.00 | 0.22 | 44.4 (81.6) | 58.0 |

## 3. By layer (the line of Engine.render each call came from)

### v6

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5631` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.5 | 3.35 | 5.00 | 3.07 | 0.00 (0.00) | 2.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6031` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 12.6 | 2.08 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 10.2 | 0.00 |
| `src/game/engine.ts:5677` `else renderWorldObjects(` | 14.6 | 0.06 | 95.7 | 0.97 | 4.61 (4.61) | 18.5 | 25.3 | 0.00 |
| `src/game/engine.ts:5653` `this.drawWaterAndFlags(ctx, world);` | 30.3 | 0.29 | 1.00 | 0.07 | 1.00 (0.00) | 0.00 | 1.90 | 0.00 |
| `src/game/engine.ts:5703` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 15.9 | 0.25 | 0.04 | 0.00 | 3.49 (0.00) | 0.00 | 4.97 | 0.00 |
| `src/game/engine.ts:5783` `this.collectibles.forEach((item) => {` | 15.9 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 8.46 | 0.00 |
| `src/game/engine.ts:5949` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5840` `this.enemies.forEach((enemy) => {` | 1.30 | 0.01 | 0.43 | 0.00 | 0.00 (0.00) | 0.00 | 0.88 | 0.00 |
| `src/game/engine.ts:5954` `if (this.proto?.bushes) this.drawBushes(ctx);` | 0.07 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.07 | 0.00 |
| `src/game/engine.ts:5656` `this.drawRivers(ctx, world, false);` | 0.06 | 0.00 | 0.04 | 0.00 | 0.04 (0.00) | 0.00 | 0.04 | 0.00 |
| `src/game/engine.ts:5689` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.12 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.04 | 0.00 |
| `src/game/engine.ts:5702` `this.drawRivers(ctx, world, true);` | 0.00 | 0.00 | 0.04 | 0.00 | 0.04 (0.00) | 0.04 | 0.04 | 0.00 |
| `src/game/engine.ts:5907` `if (this.proto?.watch) this.drawWatchBack(ctx);` | 0.04 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.11 | 0.00 |
| `src/game/engine.ts:5667` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.04 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5604` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5608` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5648` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5993` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6016` `ctx.restore(); // end world transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6139` `ctx.restore(); // end DPR transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5665` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.02 | 0.00 |
| `src/game/engine.ts:5668` `ctx.restore();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |

### v7

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5811` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 26.4 | 6.13 | 62.3 | 0.44 | 8.48 (4.24) | 8.74 | 12.5 | 0.00 |
| `src/game/engine.ts:5736` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.7 | 3.15 | 3.01 | 2.06 | 0.50 (0.00) | 1.00 | 0.50 | 0.00 |
| `src/game/engine.ts:6145` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 12.6 | 1.20 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 10.2 | 0.00 |
| `src/game/engine.ts:5758` `this.drawWaterAndFlags(ctx, world);` | 30.4 | 0.30 | 1.00 | 0.07 | 1.00 (0.00) | 0.00 | 1.91 | 0.00 |
| `src/game/engine.ts:5895` `this.collectibles.forEach((item) => {` | 15.8 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 8.43 | 0.00 |
| `src/game/engine.ts:5782` `else renderWorldObjects(` | 12.0 | 0.02 | 71.8 | 0.01 | 0.04 (0.04) | 9.07 | 16.0 | 0.00 |
| `src/game/engine.ts:6063` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5952` `this.enemies.forEach((enemy) => {` | 1.29 | 0.01 | 0.43 | 0.00 | 0.00 (0.00) | 0.00 | 0.88 | 0.00 |
| `src/game/engine.ts:5845` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.80 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.80 | 0.00 |
| `src/game/engine.ts:6068` `if (this.proto?.bushes) this.drawBushes(ctx);` | 0.07 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.07 | 0.00 |
| `src/game/engine.ts:5807` `this.drawRivers(ctx, world, true);` | 0.24 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.03 | 0.27 | 0.00 |
| `src/game/engine.ts:5761` `this.drawRivers(ctx, world, false);` | 0.39 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.00 | 0.38 | 0.00 |
| `src/game/engine.ts:5794` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.11 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:6021` `if (this.proto?.watch) this.drawWatchBack(ctx);` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.10 | 0.00 |
| `src/game/engine.ts:5772` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.04 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5705` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5709` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5753` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6107` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6130` `ctx.restore(); // end world transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6250` `ctx.restore(); // end DPR transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5814` `if (!(ownScene && lair)) drawBounceCaps(ctx, world.id, this.withoutPai` | 0.06 | 0.00 | 0.06 | 0.00 | 0.00 (0.00) | 0.00 | 0.06 | 0.00 |

### today

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5819` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 26.3 | 6.12 | 62.0 | 0.44 | 8.46 (4.23) | 8.69 | 12.4 | 0.00 |
| `src/game/engine.ts:5743` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.7 | 3.15 | 3.01 | 2.06 | 0.50 (0.00) | 1.00 | 0.50 | 0.00 |
| `src/game/engine.ts:6158` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 12.6 | 1.21 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 10.2 | 0.00 |
| `src/game/engine.ts:5766` `this.drawWaterAndFlags(ctx, world);` | 30.2 | 0.30 | 1.00 | 0.07 | 1.00 (0.00) | 0.00 | 1.90 | 0.00 |
| `src/game/engine.ts:5904` `this.collectibles.forEach((item) => {` | 15.7 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 8.40 | 0.00 |
| `src/game/engine.ts:5790` `else renderWorldObjects(` | 12.0 | 0.02 | 71.6 | 0.01 | 0.04 (0.04) | 9.04 | 16.0 | 0.00 |
| `src/game/engine.ts:6074` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5962` `this.enemies.forEach((enemy) => {` | 1.33 | 0.01 | 0.44 | 0.00 | 0.00 (0.00) | 0.00 | 0.90 | 0.00 |
| `src/game/engine.ts:5854` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.81 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.81 | 0.00 |
| `src/game/engine.ts:6080` `if (this.proto?.bushes) this.drawBushes(ctx);` | 0.07 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.07 | 0.00 |
| `src/game/engine.ts:5769` `this.drawRivers(ctx, world, false);` | 0.39 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.00 | 0.38 | 0.00 |
| `src/game/engine.ts:5815` `this.drawRivers(ctx, world, true);` | 0.24 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.03 | 0.27 | 0.00 |
| `src/game/engine.ts:5802` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.09 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:6032` `if (this.proto?.watch) this.drawWatchBack(ctx);` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.10 | 0.00 |
| `src/game/engine.ts:5780` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5712` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5716` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5761` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6119` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6143` `ctx.restore(); // end world transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6263` `ctx.restore(); // end DPR transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5822` `if (!(ownScene && lair)) drawBounceCaps(ctx, world.id, this.withoutPai` | 0.05 | 0.00 | 0.05 | 0.00 | 0.00 (0.00) | 0.00 | 0.05 | 0.00 |

### ccrground

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5743` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.7 | 3.15 | 3.00 | 2.06 | 0.50 (0.00) | 1.00 | 0.50 | 0.00 |
| `src/game/engine.ts:6159` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 12.6 | 1.21 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 10.2 | 0.00 |
| `src/game/engine.ts:5820` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 15.4 | 0.87 | 0.03 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:5766` `this.drawWaterAndFlags(ctx, world);` | 30.3 | 0.30 | 1.00 | 0.07 | 1.00 (0.00) | 0.00 | 1.91 | 0.00 |
| `src/game/engine.ts:5905` `this.collectibles.forEach((item) => {` | 15.8 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 8.42 | 0.00 |
| `src/game/engine.ts:5790` `else renderWorldObjects(` | 12.0 | 0.02 | 72.0 | 0.01 | 0.03 (0.03) | 9.07 | 16.0 | 0.00 |
| `src/game/engine.ts:6075` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5963` `this.enemies.forEach((enemy) => {` | 1.31 | 0.01 | 0.43 | 0.00 | 0.00 (0.00) | 0.00 | 0.89 | 0.00 |
| `src/game/engine.ts:5855` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.81 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.81 | 0.00 |
| `src/game/engine.ts:6081` `if (this.proto?.bushes) this.drawBushes(ctx);` | 0.07 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.07 | 0.00 |
| `src/game/engine.ts:5769` `this.drawRivers(ctx, world, false);` | 0.39 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.00 | 0.37 | 0.00 |
| `src/game/engine.ts:5815` `this.drawRivers(ctx, world, true);` | 0.24 | 0.00 | 0.03 | 0.00 | 0.03 (0.00) | 0.03 | 0.27 | 0.00 |
| `src/game/engine.ts:5802` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.09 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:6033` `if (this.proto?.watch) this.drawWatchBack(ctx);` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.10 | 0.00 |
| `src/game/engine.ts:5780` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5712` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5716` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5761` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6120` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6144` `ctx.restore(); // end world transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6264` `ctx.restore(); // end DPR transform` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5823` `if (!(ownScene && lair)) drawBounceCaps(ctx, world.id, this.withoutPai` | 0.05 | 0.00 | 0.05 | 0.00 | 0.00 (0.00) | 0.00 | 0.05 | 0.00 |

### merged

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5755` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.7 | 3.16 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6171` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 12.6 | 1.21 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 10.2 | 0.00 |
| `src/game/engine.ts:5832` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 15.4 | 0.87 | 0.04 | 0.00 | 0.00 (0.00) | 0.00 | 0.04 | 0.00 |
| `src/game/engine.ts:5778` `this.drawWaterAndFlags(ctx, world);` | 30.4 | 0.30 | 0.98 | 0.07 | 0.98 (0.00) | 0.00 | 1.90 | 0.00 |
| `src/game/engine.ts:5917` `this.collectibles.forEach((item) => {` | 11.1 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 5.99 | 0.00 |
| `src/game/engine.ts:5802` `else renderWorldObjects(` | 12.0 | 0.02 | 71.7 | 0.01 | 0.03 (0.03) | 0.12 | 16.1 | 0.00 |
| `src/game/engine.ts:6087` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5975` `this.enemies.forEach((enemy) => {` | 1.29 | 0.01 | 0.43 | 0.00 | 0.00 (0.00) | 0.00 | 0.88 | 0.00 |
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
| `src/game/scenery.ts:1673` (drawStrip) | main | 4.75 | 3.86 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1760x868 |
| `src/game/scenery.ts:1713` (renderSky) | main | 0.00 | 0.00 | 2.00 | 2.82 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1639` (drawTile) | main | 1.46 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/scenery.ts:1823` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1879` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/groundArt.ts:110` (drawGroundBody) | main | 0.00 | 0.00 | 0.00 | 0.00 | 4.51 (4.51) | 0.00 |  |
| `src/game/groundArt.ts:84` (fillFace) | main | 0.00 | 0.00 | 4.88 | 0.51 | 0.00 (0.00) | 0.00 |  |
| `src/game/groundArt.ts:112` (drawGroundBody) | main | 0.00 | 0.00 | 4.51 | 0.51 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1495` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/scenery.ts:1679` (drawStrip) | main | 4.75 | 0.37 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1760x868 |
| `src/game/stageArt.ts:311` (row) | main | 6.00 | 0.35 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x516 |
| `src/game/protoArt.ts:578` (drawBankArt) | main | 9.93 | 0.29 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/groundArt.ts:91` (fillCap) | main | 0.00 | 0.00 | 4.88 | 0.17 | 0.00 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:566` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 3.49 (0.00) | 0.00 |  |
| `src/game/stageArt.ts:306` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 1.00 (0.00) | 0.00 |  |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.18 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/groundArt.ts:53` (maskedFill) | off | 0.00 | 0.00 | 0.87 | 0.06 | 0.00 (0.00) | 0.00 | special 0.87 (fillRect@destination-in 0.87); into 192x760 |
| `src/game/scenery.ts:1740` (renderSky) | main | 0.00 | 0.00 | 2.00 | 0.10 | 0.00 (0.00) | 0.00 |  |
| `src/game/stageArt.ts:308` (drawPitWater) | main | 0.00 | 0.00 | 1.00 | 0.09 | 0.00 (0.00) | 0.00 |  |
| `src/game/groundArt.ts:135` (drawGroundBody) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.61 |  |
| `src/game/groundArt.ts:128` (drawGroundBody) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.58 |  |
| `src/game/terrain.ts:104` (stone) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.31 |  |
| `src/game/groundArt.ts:139` (drawGroundBody) | main | 0.00 | 0.00 | 3.61 | 0.06 | 0.00 (0.00) | 0.00 |  |
| `src/game/artKit.ts:305` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.71 |  |
| `src/game/artKit.ts:316` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.71 |  |

### v7

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/groundPaint.ts:126` (drawSoil) | main | 4.38 | 4.90 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/scenery.ts:1780` (drawStrip) | main | 4.85 | 3.31 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3214x1736 |
| `src/game/groundPaint.ts:120` (drawSoil) | main | 8.91 | 2.74 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/protoArt.ts:568` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 8.48 (4.24) | 0.00 |  |
| `src/game/scenery.ts:1826` (renderSky) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1952` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:2011` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/groundPaint.ts:157` (drawLip) | main | 6.83 | 0.65 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/scenery.ts:1792` (drawStrip) | main | 4.85 | 0.63 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3214x1736 |
| `src/game/groundPaint.ts:139` (drawSoil) | main | 0.00 | 0.00 | 3.87 | 0.53 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/stageArt.ts:311` (row) | main | 5.96 | 0.36 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x516 |
| `src/game/groundPaint.ts:234` (drawEnd) | main | 1.82 | 0.20 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 384x576 |
| `src/game/scenery.ts:1684` (drawTile) | main | 1.46 | 0.17 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/stageArt.ts:306` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 1.00 (0.00) | 0.00 |  |
| `src/game/groundPaint.ts:235` (drawEnd) | main | 1.18 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.18 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/stageArt.ts:308` (drawPitWater) | main | 0.00 | 0.00 | 1.00 | 0.10 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1853` (renderSky) | main | 0.00 | 0.00 | 1.00 | 0.08 | 0.00 (0.00) | 0.00 |  |
| `src/game/groundPaint.ts:133` (drawSoil) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.87 |  |
| `src/game/terrain.ts:106` (stone) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.41 |  |
| `src/game/protoArt.ts:697` (pitShade) | main | 0.00 | 0.00 | 50.3 | 0.06 | 0.00 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:688` (pitShade) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.96 |  |
| `src/game/artKit.ts:305` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.74 |  |
| `src/game/artKit.ts:316` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.74 |  |

### today

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/groundPaint.ts:126` (drawSoil) | main | 4.36 | 4.89 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/scenery.ts:1780` (drawStrip) | main | 4.85 | 3.31 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3214x1736 |
| `src/game/groundPaint.ts:120` (drawSoil) | main | 8.90 | 2.74 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/protoArt.ts:568` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 8.46 (4.23) | 0.00 |  |
| `src/game/scenery.ts:1826` (renderSky) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1952` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:2011` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/groundPaint.ts:157` (drawLip) | main | 6.82 | 0.65 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/scenery.ts:1792` (drawStrip) | main | 4.85 | 0.63 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3214x1736 |
| `src/game/groundPaint.ts:139` (drawSoil) | main | 0.00 | 0.00 | 3.86 | 0.53 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/stageArt.ts:311` (row) | main | 5.96 | 0.36 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x516 |
| `src/game/groundPaint.ts:234` (drawEnd) | main | 1.82 | 0.20 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 384x576 |
| `src/game/scenery.ts:1684` (drawTile) | main | 1.46 | 0.18 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/stageArt.ts:306` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 1.00 (0.00) | 0.00 |  |
| `src/game/groundPaint.ts:235` (drawEnd) | main | 1.18 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.18 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/stageArt.ts:308` (drawPitWater) | main | 0.00 | 0.00 | 1.00 | 0.10 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1853` (renderSky) | main | 0.00 | 0.00 | 1.00 | 0.08 | 0.00 (0.00) | 0.00 |  |
| `src/game/groundPaint.ts:133` (drawSoil) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.86 |  |
| `src/game/terrain.ts:106` (stone) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.40 |  |
| `src/game/protoArt.ts:697` (pitShade) | main | 0.00 | 0.00 | 50.0 | 0.06 | 0.00 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:688` (pitShade) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.94 |  |
| `src/game/artKit.ts:305` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.75 |  |
| `src/game/artKit.ts:316` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.75 |  |

### ccrground

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/scenery.ts:1780` (drawStrip) | main | 4.86 | 3.32 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3214x1736 |
| `src/game/scenery.ts:1826` (renderSky) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1952` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:2011` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/protoArt.ts:937` (drawGroundChunks) | main | 12.2 | 1.19 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 509x509 |
| `src/game/scenery.ts:1792` (drawStrip) | main | 4.86 | 0.63 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3214x1736 |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/stageArt.ts:311` (row) | main | 5.97 | 0.35 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x516 |
| `src/game/scenery.ts:1684` (drawTile) | main | 1.47 | 0.18 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/stageArt.ts:306` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 1.00 (0.00) | 0.00 |  |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.18 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/stageArt.ts:308` (drawPitWater) | main | 0.00 | 0.00 | 1.00 | 0.10 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1853` (renderSky) | main | 0.00 | 0.00 | 1.00 | 0.08 | 0.00 (0.00) | 0.00 |  |
| `src/game/terrain.ts:106` (stone) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.40 |  |
| `src/game/artKit.ts:305` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.76 |  |
| `src/game/artKit.ts:316` (drawMushroom) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.76 |  |
| `src/game/readable.ts:85` (drawAura) | main | 5.18 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/readable.ts:87` (drawAura) | main | 5.18 | 0.04 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/protoArt.ts:490` (drawBranchArt) | main | 3.03 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/heroSprite.ts:446` (drawStandard) | main | 1.00 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1536x1831 |
| `src/game/vectorArt.ts:1009` (fillGlow) | main | 3.41 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/stageArt.ts:163` (drawCheckpointArt) | main | 21.8 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x1003 |
| `src/game/leafSprites.ts:86` (drawPaintedLeaf) | main | 8.00 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x269 |
| `src/game/scenery.ts:1820` (renderSky) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.50 |  |
| `src/game/scenery.ts:1844` (renderSky) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.50 |  |

### merged

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/scenery.ts:1967` (drawFitted) | main | 4.85 | 3.32 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3010x1484 |
| `src/game/scenery.ts:2274` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/protoArt.ts:1068` (drawGroundChunks) | main | 12.2 | 1.19 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 509x509 |
| `src/game/scenery.ts:1971` (drawFitted) | main | 4.85 | 0.63 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3010x1484 |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/stageArt.ts:380` (pitRow) | main | 5.82 | 0.36 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 840x210 |
| `src/game/scenery.ts:1714` (drawTile) | main | 1.46 | 0.18 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 5868x1761 |
| `src/game/stageArt.ts:401` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.98 (0.00) | 0.00 |  |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.18 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/stageArt.ts:403` (drawPitWater) | main | 0.00 | 0.00 | 0.98 | 0.10 | 0.00 (0.00) | 0.00 |  |
| `src/game/readable.ts:85` (drawAura) | main | 4.01 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/readable.ts:87` (drawAura) | main | 4.01 | 0.04 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/sheetBake.ts:118` (drawSheet) | main | 5.35 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1536x1831 |
| `src/game/protoArt.ts:491` (drawBranchArt) | main | 2.99 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/vectorArt.ts:1009` (fillGlow) | main | 2.35 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/sheetBake.ts:117` (drawSheet) | main | 6.81 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1152x1373 |
| `src/game/stageArt.ts:178` (drawCheckpointArt) | main | 21.9 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 175x272 |
| `src/game/paintedScenery.ts:102` (drawGroundFlora) | main | 5.70 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 125x102 |
| `src/game/stageArt.ts:120` (glow) | main | 0.56 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/paintedScenery.ts:104` (drawGroundFlora) | main | 6.09 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 125x102 |
| `src/game/groundArt.ts:110` (drawGroundBody) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.03 (0.03) | 0.00 |  |
| `src/game/protoArt.ts:231` (blit) | main | 0.22 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/artKit.ts:295` (drawGrass) | main | 0.00 | 0.00 | 43.2 | 0.00 | 0.00 (0.00) | 0.00 |  |
| `src/game/stageArt.ts:168` (drawCheckpointArt) | main | 0.91 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 175x272 |
| `src/game/creatureAnim.ts:167` (draw) | main | 0.47 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1792x2256 |

## 5. TOP 15 call sites v7 added or made heavier than v6

Ranked by the growth in device megapixels touched per frame (drawImage + fill area), with curved clips (x0.25 each), clip area (x0.5), blended/filtered/shadowed draws and gradients weighted in. "Mpx" = millions of device pixels; one q0 upright screen is 800x1760 = 1.41 Mpx (q2: 400x880 = 0.35 Mpx).

| # | call site (v7) | v6→v7 | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/groundPaint.ts:126` (drawSoil) | **new** | 4.38 | 4.90 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (let bx = Math.floor(x0 / BLOB_PERIOD) * BLOB_PERIOD; bx < x1; bx += BLOB_PE`; src up to 128x128; scaled up to 45.8x |
| 2 | `src/game/groundPaint.ts:120` (drawSoil) | **new** | 8.91 | 2.74 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(img, f.x, f.y, f.w, f.h, cell.x, cell.y, SOIL_TILE + 0.6, SOIL_TIL`; src up to 2048x2048 |
| 3 | `src/game/protoArt.ts:568` (drawBankArt) | heavier | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 / 0.00→0.00 | 3.49→8.48 (4.24; 9.21) | 0.00→0.00 | 0.00 | `ctx.clip();`; clip: polygon-concave/polygon-convex/rect |
| 4 | `src/game/groundPaint.ts:157` (drawLip) | **new** | 6.83 | 0.65 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (let x = Math.floor(a / LIP_W) * LIP_W; x < b; x += LIP_W) ctx.drawImage(img`; src up to 2048x2048 |
| 5 | `src/game/groundPaint.ts:139` (drawSoil) | **new** | 0.00 | 0.00 | 3.87 / 0.53 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.fillRect(x0, a, x1 - x0, Math.min(bottom, viewBottom) - a);` |
| 6 | `src/game/scenery.ts:1792` (drawStrip) | heavier | 4.75→4.85 | 0.37→0.63 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `ctx.drawImage(img, 0, ih - rows, iw, rows, px, top + dh - 1 / k, pw, gap + 2);`; src up to 3214x1736; scaled up to 11.3x |
| 7 | `src/game/groundPaint.ts:234` (drawEnd) | **new** | 1.82 | 0.20 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (faded) ctx.drawImage(faded, -e.cx * ew, top, ew, END_H);`; src up to 384x576 |
| 8 | `src/game/scenery.ts:1684` (drawTile) | **new** | 1.46 | 0.17 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (const [r0, r1] of bands) ctx.drawImage(cv, 0, r0, layerWpx(cv), r1 - r0, px`; src up to 2880x864; scaled up to 2.0x |
| 9 | `src/game/groundPaint.ts:235` (drawEnd) | **new** | 1.18 | 0.11 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `else ctx.drawImage(s.img, e.x, e.y, e.w, e.h, -e.cx * ew, top, ew, END_H);`; src up to 2048x2048 |
| 10 | `src/game/groundPaint.ts:133` (drawSoil) | **new** | 0.00 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 3.87 | 0.00 | `const gr = bottom > y0 && typeof ctx.createLinearGradient === 'function' ? ctx.c` |
| 11 | `src/game/protoArt.ts:697` (pitShade) | **new** | 0.00 | 0.00 | 50.3 / 0.06 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.fillRect(u, o.top, Math.min(5, b - u), y1 - o.top);` |
| 12 | `src/game/protoArt.ts:688` (pitShade) | **new** | 0.00 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 2.96 | 0.00 | `const g = ctx.createLinearGradient(0, o.top, 0, y1);` |
| 13 | `src/game/protoArt.ts:705` (pitShade) | **new** | 0.00 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 1.91 | 0.00 | `const h = ctx.createLinearGradient(a, 0, b, 0);` |
| 14 | `src/game/protoArt.ts:713` (pitShade) | **new** | 0.00 | 0.00 | 4.24 / 0.02 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.fillRect(Math.min(a, b), ya, Math.abs(b - a), yb - ya);` |
| 15 | `src/game/dressArt.ts:52` (drawDress) | **new** | 0.80 | 0.01 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(img!, f.x, f.y, f.w, f.h, -w / 2, 0, w, h);`; src up to 1024x1007 |

## 6. What today made heavier than v7 (top 10)

| # | call site (today) | v7→today | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/scenery.ts:1684` (drawTile) | heavier | 1.46→1.46 | 0.17→0.18 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `for (const [r0, r1] of bands) ctx.drawImage(cv, 0, r0, layerWpx(cv), r1 - r0, px`; src up to 2880x864; scaled up to 2.0x |
| 2 | `src/game/creatureAnim.ts:146` (draw) | **new** | 0.49 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(baked, f.x * r + e, f.y * r + e, f.w * r - 2 * e, f.h * r - 2 * e,`; src up to 1792x2256 |
| 3 | `src/game/groundPaint.ts:235` (drawEnd) | heavier | 1.18→1.18 | 0.11→0.11 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `else ctx.drawImage(s.img, e.x, e.y, e.w, e.h, -e.cx * ew, top, ew, END_H);`; src up to 2048x2048 |

## 7. What today made lighter than v7 (top 10)

| site (v7) | weight v7→today | drawImage v7→today | img Mpx v7→today | clips v7→today |
|---|---:|---:|---:|---:|
| `src/game/groundPaint.ts:126` (drawSoil) | 4.90→4.89 | 4.38→4.36 | 4.90→4.89 | 0.00→0.00 |
| `src/game/creatureAnim.ts:86` (draw) | 0.00→gone | 0.47→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:568` (drawBankArt) | 1.62→1.61 | 0.00→0.00 | 0.00→0.00 | 8.48→8.46 |
| `src/game/groundPaint.ts:120` (drawSoil) | 2.74→2.74 | 8.91→8.90 | 2.74→2.74 | 0.00→0.00 |
| `src/game/groundPaint.ts:234` (drawEnd) | 0.20→0.20 | 1.82→1.82 | 0.20→0.20 | 0.00→0.00 |

## 8. ccr+ground (the lead's "Ground painted once") against today

### Heavier in ccrground than today (top 10)

| # | call site (ccrground) | today→ccrground | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/protoArt.ts:937` (drawGroundChunks) | **new** | 12.2 | 1.19 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 509x509 |
| 2 | `src/game/scenery.ts:1684` (drawTile) | heavier | 1.46→1.47 | 0.18→0.18 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `for (const [r0, r1] of bands) ctx.drawImage(cv, 0, r0, layerWpx(cv), r1 - r0, px`; src up to 2880x864; scaled up to 2.0x |
| 3 | `src/game/scenery.ts:1780` (drawStrip) | heavier | 4.85→4.86 | 3.31→3.32 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `ctx.drawImage(img, 0, 0, iw, ih, px, top, pw, dh);`; src up to 3214x1736 |

### Lighter in ccrground than today (top 12)

| site (today) | weight | drawImage | img Mpx | clips | gradients |
|---|---:|---:|---:|---:|---:|
| `src/game/groundPaint.ts:126` (drawSoil) | 4.89→gone | 4.36→0 | 4.89→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:120` (drawSoil) | 2.74→gone | 8.90→0 | 2.74→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:568` (drawBankArt) | 1.61→gone | 0.00→0 | 0.00→0 | 8.46→0 | 0.00→0 |
| `src/game/groundPaint.ts:157` (drawLip) | 0.65→gone | 6.82→0 | 0.65→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:139` (drawSoil) | 0.53→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:234` (drawEnd) | 0.20→gone | 1.82→0 | 0.20→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:235` (drawEnd) | 0.11→gone | 1.18→0 | 0.11→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:133` (drawSoil) | 0.08→gone | 0.00→0 | 0.00→0 | 0.00→0 | 3.86→0 |
| `src/game/protoArt.ts:697` (pitShade) | 0.06→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:688` (pitShade) | 0.06→gone | 0.00→0 | 0.00→0 | 0.00→0 | 2.94→0 |
| `src/game/protoArt.ts:705` (pitShade) | 0.04→gone | 0.00→0 | 0.00→0 | 0.00→0 | 1.89→0 |
| `src/game/protoArt.ts:713` (pitShade) | 0.02→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |

## ccrground against today

### Heavier in ccrground than today (top 10)

| # | call site (ccrground) | today→ccrground | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/protoArt.ts:937` (drawGroundChunks) | **new** | 12.2 | 1.19 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 509x509 |
| 2 | `src/game/scenery.ts:1684` (drawTile) | heavier | 1.46→1.47 | 0.18→0.18 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `for (const [r0, r1] of bands) ctx.drawImage(cv, 0, r0, layerWpx(cv), r1 - r0, px`; src up to 2880x864; scaled up to 2.0x |
| 3 | `src/game/scenery.ts:1780` (drawStrip) | heavier | 4.85→4.86 | 3.31→3.32 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `ctx.drawImage(img, 0, 0, iw, ih, px, top, pw, dh);`; src up to 3214x1736 |

### Lighter in ccrground than today (top 12)

| site (today) | weight | drawImage | img Mpx | clips | gradients |
|---|---:|---:|---:|---:|---:|
| `src/game/groundPaint.ts:126` (drawSoil) | 4.89→gone | 4.36→0 | 4.89→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:120` (drawSoil) | 2.74→gone | 8.90→0 | 2.74→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:568` (drawBankArt) | 1.61→gone | 0.00→0 | 0.00→0 | 8.46→0 | 0.00→0 |
| `src/game/groundPaint.ts:157` (drawLip) | 0.65→gone | 6.82→0 | 0.65→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:139` (drawSoil) | 0.53→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:234` (drawEnd) | 0.20→gone | 1.82→0 | 0.20→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:235` (drawEnd) | 0.11→gone | 1.18→0 | 0.11→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:133` (drawSoil) | 0.08→gone | 0.00→0 | 0.00→0 | 0.00→0 | 3.86→0 |
| `src/game/protoArt.ts:697` (pitShade) | 0.06→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:688` (pitShade) | 0.06→gone | 0.00→0 | 0.00→0 | 0.00→0 | 2.94→0 |
| `src/game/protoArt.ts:705` (pitShade) | 0.04→gone | 0.00→0 | 0.00→0 | 0.00→0 | 1.89→0 |
| `src/game/protoArt.ts:713` (pitShade) | 0.02→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |

## merged against today

### Heavier in merged than today (top 10)

| # | call site (merged) | today→merged | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/scenery.ts:1967` (drawFitted) | **new** | 4.85 | 3.32 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (sw > 0 && sh2 > 0) ctx.drawImage(cv, sx, sy, sw, sh2, (dx + sx * r) / k, (y0`; src up to 3010x1484 |
| 2 | `src/game/protoArt.ts:1068` (drawGroundChunks) | **new** | 12.2 | 1.19 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 509x509 |
| 3 | `src/game/scenery.ts:1971` (drawFitted) | **new** | 4.85 | 0.63 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (gap > 0) ctx.drawImage(cv, 0, f.oy + f.d - rows, bw, rows, px, top + dh - 1 `; src up to 3010x1484; scaled up to 14.9x |
| 4 | `src/game/stageArt.ts:380` (pitRow) | **new** | 5.82 | 0.36 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `else ctx.drawImage(src, x, y, TILE, h);`; src up to 840x210 |
| 5 | `src/game/scenery.ts:1714` (drawTile) | **new** | 1.46 | 0.18 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (const [a, b] of fb.rows) ctx.drawImage(fb.cv, 0, a, fb.cv.width, b - a, dx `; src up to 5868x1761 |
| 6 | `src/game/sheetBake.ts:118` (drawSheet) | **new** | 5.35 | 0.03 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `} else ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);`; src up to 1536x1831 |
| 7 | `src/game/sheetBake.ts:117` (drawSheet) | **new** | 6.81 | 0.02 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(b.cv, sx * r + ex, sy * r + ey, bw - 2 * ex, bh - 2 * ey, dx + ex `; src up to 1152x1373 |
| 8 | `src/game/stageArt.ts:178` (drawCheckpointArt) | **new** | 21.9 | 0.01 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(src, ox + sx * b, oy, sw * b, sh, left + sx * k, top + dy, sw * k,`; src up to 175x272 |
| 9 | `src/game/stageArt.ts:168` (drawCheckpointArt) | **new** | 0.91 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(src, ox, oy, poleW * b, sh, left, top, poleW * k, f.h * k);`; src up to 175x272 |
| 10 | `src/game/scenery.ts:1505` (lanePool) | heavier | 1.00→1.00 | 0.49→0.49 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `ctx.drawImage(poolSprite(col, a), hs.x - rx, hs.y - 36 - ry, rx * 2, ry * 2);`; src up to 160x160; scaled up to 6.7x |

### Lighter in merged than today (top 12)

| site (today) | weight | drawImage | img Mpx | clips | gradients |
|---|---:|---:|---:|---:|---:|
| `src/game/groundPaint.ts:126` (drawSoil) | 4.89→gone | 4.36→0 | 4.89→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1780` (drawStrip) | 3.31→gone | 4.85→0 | 3.31→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:120` (drawSoil) | 2.74→gone | 8.90→0 | 2.74→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:568` (drawBankArt) | 1.61→gone | 0.00→0 | 0.00→0 | 8.46→0 | 0.00→0 |
| `src/game/scenery.ts:1826` (renderSky) | 1.41→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1952` (renderScenery) | 1.41→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:157` (drawLip) | 0.65→gone | 6.82→0 | 0.65→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1792` (drawStrip) | 0.63→gone | 4.85→0 | 0.63→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:139` (drawSoil) | 0.53→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/stageArt.ts:311` (row) | 0.36→gone | 5.96→0 | 0.36→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:234` (drawEnd) | 0.20→gone | 1.82→0 | 0.20→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1684` (drawTile) | 0.18→gone | 1.46→0 | 0.18→0 | 0.00→0 | 0.00→0 |

## merged against v6

### Heavier in merged than v6 (top 10)

| # | call site (merged) | v6→merged | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/scenery.ts:1967` (drawFitted) | **new** | 4.85 | 3.32 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (sw > 0 && sh2 > 0) ctx.drawImage(cv, sx, sy, sw, sh2, (dx + sx * r) / k, (y0`; src up to 3010x1484 |
| 2 | `src/game/protoArt.ts:1068` (drawGroundChunks) | **new** | 12.2 | 1.19 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 509x509 |
| 3 | `src/game/scenery.ts:1971` (drawFitted) | **new** | 4.85 | 0.63 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (gap > 0) ctx.drawImage(cv, 0, f.oy + f.d - rows, bw, rows, px, top + dh - 1 `; src up to 3010x1484; scaled up to 14.9x |
| 4 | `src/game/stageArt.ts:380` (pitRow) | **new** | 5.82 | 0.36 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `else ctx.drawImage(src, x, y, TILE, h);`; src up to 840x210 |
| 5 | `src/game/scenery.ts:1714` (drawTile) | **new** | 1.46 | 0.18 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (const [a, b] of fb.rows) ctx.drawImage(fb.cv, 0, a, fb.cv.width, b - a, dx `; src up to 5868x1761 |
| 6 | `src/game/sheetBake.ts:118` (drawSheet) | **new** | 5.35 | 0.03 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `} else ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);`; src up to 1536x1831 |
| 7 | `src/game/sheetBake.ts:117` (drawSheet) | **new** | 6.81 | 0.02 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(b.cv, sx * r + ex, sy * r + ey, bw - 2 * ex, bh - 2 * ey, dx + ex `; src up to 1152x1373 |
| 8 | `src/game/stageArt.ts:178` (drawCheckpointArt) | **new** | 21.9 | 0.01 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(src, ox + sx * b, oy, sw * b, sh, left + sx * k, top + dy, sw * k,`; src up to 175x272 |
| 9 | `src/game/stageArt.ts:168` (drawCheckpointArt) | **new** | 0.91 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(src, ox, oy, poleW * b, sh, left, top, poleW * k, f.h * k);`; src up to 175x272 |
| 10 | `src/game/creatureAnim.ts:167` (draw) | **new** | 0.47 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(baked, f.x * r + e, f.y * r + e, f.w * r - 2 * e, f.h * r - 2 * e,`; src up to 1792x2256 |

### Lighter in merged than v6 (top 12)

| site (v6) | weight | drawImage | img Mpx | clips | gradients |
|---|---:|---:|---:|---:|---:|
| `src/game/scenery.ts:1673` (drawStrip) | 3.86→gone | 4.75→0 | 3.86→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1713` (renderSky) | 2.82→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1639` (drawTile) | 1.41→gone | 1.46→0 | 1.41→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1823` (renderScenery) | 1.41→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundArt.ts:110` (drawGroundBody) | 1.37→0.01 | 0.00→0.00 | 0.00→0.00 | 4.51→0.03 | 0.00→0.00 |
| `src/game/groundArt.ts:84` (fillFace) | 0.51→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 |
| `src/game/groundArt.ts:112` (drawGroundBody) | 0.51→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 |
| `src/game/scenery.ts:1679` (drawStrip) | 0.37→gone | 4.75→0 | 0.37→0 | 0.00→0 | 0.00→0 |
| `src/game/stageArt.ts:311` (row) | 0.35→gone | 6.00→0 | 0.35→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:578` (drawBankArt) | 0.29→gone | 9.93→0 | 0.29→0 | 0.00→0 | 0.00→0 |
| `src/game/groundArt.ts:91` (fillCap) | 0.17→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 |
| `src/game/protoArt.ts:566` (drawBankArt) | 0.16→gone | 0.00→0 | 0.00→0 | 3.49→0 | 0.00→0 |

