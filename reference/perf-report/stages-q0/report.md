# Frame cost by build: v6 (192cd165), v7 (412f54f), merged (9a76f161 (the merge, 12:20 ET))

Measured 2026-10-30 by the perf harness (`tools/perf/`). Headless Chromium (SwiftShader), deviceScaleFactor 3, picture held at q0 (canvas at 2x CSS). Every number is per frame on the main canvas unless it says otherwise, averaged over every counted frame of every spot.

**Read the counts, areas and clip types as the evidence.** CPU ms is headless software raster on a 4-core container, a hint of relative weight only, not the phone.

## 1. Per-frame totals

| per frame | v6 | v7 | merged |
|---|---:|---:|---:|
| frames counted | 1072 | 1072 | 1072 |
| drawImage calls | 220 | 237 | 109 |
| drawImage visible area (screens) | 6.39 | 12.3 | 5.64 |
| fill/fillRect calls | 364 | 429 | 293 |
| fill area, bbox (screens) | 4.26 | 2.41 | 0.49 |
| area drawn with a non-source-over blend (screens) | 0.28 | 0.28 | 0.28 |
| clip() calls | 10.8 | 11.8 | 1.35 |
|   of them curved/polygon (not a plain rect) | 3.72 | 3.98 | 0.10 |
| gradients created | 17.9 | 16.3 | 0.58 |
| patterns created | 0.00 | 0.00 | 0.00 |
| save() | 154 | 173 | 80.8 |
| shadowBlur>0 sets | 0.00 | 0.00 | 0.00 |
| filter sets | 0.00 | 0.00 | 0.00 |
| globalCompositeOperation sets (not source-over) | 1.98 | 1.98 | 1.98 |
| getImageData/putImageData | 0.00 | 0.00 | 0.00 |
| canvases created | 0.00 | 0.00 | 0.02 |

## 2. Per run (scenario x orientation)

`img` = drawImage calls / visible screens; `clip` = all / curved-or-polygon; `ms` = render() CPU median (p90), `+flush` = render plus a 1-pixel read that waits for the raster, median.

| run | v6 img | v6 clip | v6 grad | v6 ms | v6 +flush | v7 img | v7 clip | v7 grad | v7 ms | v7 +flush | merged img | merged clip | merged grad | merged ms | merged +flush |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1-1 port | 61.4 / 6.00 | 7.01 / 3.00 | 16.5 | 63.6 (87.3) | 80.1 | 72.8 / 10.0 | 8.69 / 3.34 | 13.6 | 43.0 (61.0) | 50.8 | 56.7 / 5.25 | 1.00 / 0.00 | 0.25 | 46.6 (69.7) | 57.8 |
| 1-1 land | 107 / 6.30 | 13.6 / 6.06 | 28.7 | 61.2 (86.6) | 86.6 | 127 / 14.0 | 14.9 / 6.93 | 22.0 | 51.2 (77.0) | 59.8 | 101 / 5.98 | 1.00 / 0.00 | 0.24 | 38.7 (65.1) | 50.3 |
| 1-3 port | 293 / 6.02 | 8.33 / 4.22 | 16.7 | 64.5 (92.8) | 83.6 | 305 / 10.1 | 9.55 / 3.78 | 14.1 | 42.0 (57.2) | 50.2 | 67.3 / 5.35 | 1.00 / 0.00 | 0.36 | 50.4 (82.7) | 63.2 |
| 1-3 land | 337 / 6.28 | 14.2 / 7.28 | 28.4 | 53.7 (78.6) | 74.4 | 357 / 14.9 | 14.5 / 6.76 | 21.5 | 49.7 (71.0) | 58.5 | 112 / 6.00 | 0.88 / 0.00 | 0.36 | 46.1 (82.4) | 60.2 |
| 2-1 port | 55.3 / 6.33 | 9.27 / 2.85 | 9.70 | 45.2 (63.2) | 72.4 | 70.8 / 9.83 | 6.42 / 2.48 | 4.21 | 38.6 (53.2) | 47.5 | 56.1 / 5.11 | 1.52 / 0.00 | 0.76 | 40.9 (72.5) | 53.3 |
| 2-1 land | 93.6 / 6.21 | 15.8 / 4.12 | 13.7 | 46.6 (66.3) | 68.2 | 140 / 11.2 | 11.7 / 4.13 | 6.61 | 33.8 (46.1) | 40.5 | 121 / 5.79 | 3.52 / 0.00 | 1.76 | 43.1 (68.6) | 57.0 |
| 3-2 port | 79.9 / 6.69 | 10.3 / 3.58 | 18.0 | 54.4 (77.0) | 80.3 | 78.7 / 11.0 | 8.27 / 3.51 | 15.6 | 48.0 (63.7) | 56.7 | 73.8 / 6.89 | 3.28 / 1.01 | 2.48 | 38.9 (78.6) | 48.8 |
| 3-2 land | 120 / 6.71 | 16.1 / 5.31 | 29.0 | 57.9 (83.0) | 80.7 | 118 / 13.1 | 12.4 / 5.34 | 25.3 | 47.6 (66.9) | 56.3 | 110 / 6.16 | 1.22 / 0.00 | 1.31 | 41.4 (87.0) | 57.7 |
| 4-1 port | 711 / 6.58 | 7.36 / 1.00 | 2.18 | 52.0 (72.7) | 79.6 | 837 / 5.59 | 7.28 / 1.00 | 2.67 | 32.2 (43.7) | 41.3 | 231 / 5.30 | 1.61 / 0.19 | 0.31 | 41.9 (73.6) | 53.3 |
| 4-1 land | 896 / 6.60 | 11.6 / 1.00 | 4.37 | 50.9 (73.2) | 71.1 | 1038 / 5.99 | 11.7 / 1.00 | 3.76 | 34.4 (47.8) | 42.5 | 325 / 5.76 | 1.72 / 0.00 | 0.12 | 38.6 (70.3) | 56.2 |
| 5-1 port | 64.6 / 6.03 | 6.22 / 2.97 | 11.7 | 54.5 (76.6) | 87.9 | 84.4 / 8.60 | 5.10 / 2.61 | 11.1 | 42.1 (57.5) | 66.1 | 71.6 / 4.96 | 0.13 / 0.13 | 0.51 | 43.9 (75.9) | 81.7 |
| 5-1 land | 113 / 6.24 | 7.90 / 3.72 | 13.7 | 57.0 (79.1) | 92.3 | 124 / 10.0 | 6.42 / 3.33 | 12.5 | 45.7 (62.8) | 67.9 | 113 / 5.75 | 0.27 / 0.27 | 0.78 | 44.9 (85.7) | 82.6 |
| 6-1 port | 128 / 6.52 | 11.1 / 3.63 | 31.1 | 46.6 (63.2) | 73.8 | 73.2 / 10.1 | 8.57 / 3.15 | 28.0 | 41.9 (79.9) | 49.1 | 60.4 / 5.17 | 1.24 / 0.00 | 0.00 | 48.5 (76.3) | 57.2 |
| 6-1 land | 226 / 6.83 | 20.3 / 7.10 | 50.9 | 56.7 (81.6) | 80.7 | 129 / 14.4 | 13.9 / 6.33 | 44.0 | 51.8 (75.8) | 60.6 | 104 / 5.94 | 1.24 / 0.00 | 0.00 | 41.8 (70.3) | 55.6 |
| 7-1 port | 82.3 / 6.25 | 4.99 / 1.39 | 4.28 | 47.7 (69.0) | 77.0 | 81.8 / 19.8 | 17.5 / 3.01 | 14.1 | 39.5 (63.0) | 50.5 | 52.2 / 5.21 | 1.00 / 0.00 | 0.00 | 38.9 (60.3) | 50.3 |
| 7-1 land | 153 / 6.71 | 9.37 / 2.25 | 6.87 | 87.6 (147) | 128 | 151 / 28.6 | 32.1 / 6.91 | 22.2 | 56.4 (78.5) | 64.2 | 90.3 / 5.66 | 1.00 / 0.00 | 0.00 | 26.2 (40.8) | 41.2 |

## 3. By layer (the line of Engine.render each call came from)

### v6

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5631` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.9 | 3.44 | 4.63 | 2.97 | 0.00 (0.00) | 1.88 | 0.13 | 0.00 |
| `src/game/engine.ts:6031` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 10.3 | 2.08 | 1.75 | 0.00 | 0.00 (0.00) | 0.00 | 7.35 | 2.65 |
| `src/game/engine.ts:5677` `else renderWorldObjects(` | 9.10 | 0.03 | 349 | 0.84 | 3.72 (3.72) | 15.0 | 35.9 | 1.46 |
| `src/game/engine.ts:5703` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 43.6 | 0.50 | 0.00 | 0.00 | 6.18 (0.00) | 0.00 | 7.61 | 0.00 |
| `src/game/engine.ts:6033` `this.w5?.drawLight(ctx, this.camera.viewportWidth, this.camera.viewpor` | 0.00 | 0.00 | 0.63 | 0.40 | 0.00 (0.00) | 0.63 | 0.13 | 0.50 |
| `src/game/engine.ts:5653` `this.drawWaterAndFlags(ctx, world);` | 22.8 | 0.14 | 2.56 | 0.04 | 0.63 (0.00) | 0.14 | 1.35 | 0.00 |
| `src/game/engine.ts:5783` `this.collectibles.forEach((item) => {` | 22.2 | 0.12 | 0.74 | 0.00 | 0.00 (0.00) | 0.03 | 11.6 | 0.00 |
| `src/game/engine.ts:6066` `drawDarkness(ctx, this.camera.viewportWidth, this.camera.viewportHeigh` | 0.03 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:5949` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.06 | 0.00 | 0.00 (0.00) | 0.00 | 1.06 | 0.00 |
| `src/game/engine.ts:5656` `this.drawRivers(ctx, world, false);` | 0.26 | 0.01 | 0.15 | 0.00 | 0.15 (0.00) | 0.00 | 0.15 | 0.00 |
| `src/game/engine.ts:5730` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 0.24 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.23 | 0.00 |
| `src/game/engine.ts:5702` `this.drawRivers(ctx, world, true);` | 0.00 | 0.00 | 0.15 | 0.01 | 0.15 (0.00) | 0.15 | 0.15 | 0.00 |
| `src/game/engine.ts:5753` `this.w4?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.ca` | 17.7 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 18.5 | 0.00 |
| `src/game/engine.ts:5672` `if (this.proto?.kitDecor) drawKitDecor(ctx, this.proto.kitDecor, { x0:` | 0.11 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.11 | 0.00 |
| `src/game/engine.ts:5840` `this.enemies.forEach((enemy) => {` | 0.62 | 0.00 | 0.18 | 0.00 | 0.00 (0.00) | 0.00 | 0.44 | 0.00 |
| `src/game/engine.ts:5689` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.33 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.18 | 0.00 |
| `src/game/engine.ts:5754` `this.w5?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.ca` | 0.27 | 0.00 | 0.04 | 0.00 | 0.00 (0.00) | 0.00 | 0.28 | 0.00 |
| `src/game/engine.ts:5731` `if (this.proto?.w3decor) drawW3Decor(ctx, this.proto.w3decor, this.cam` | 0.08 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.05 | 0.00 |
| `src/game/engine.ts:5667` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.20 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5955` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 0.15 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.25 | 0.00 |
| `src/game/engine.ts:5779` `drawRopes(ctx, this.ropes, this.gameTime, { load: this.ropeLoad.amt > ` | 79.3 | 0.00 | 1.75 | 0.00 | 0.00 (0.00) | 0.00 | 63.3 | 0.00 |
| `src/game/engine.ts:5756` `this.kit?.drawBack(ctx, { x0: this.camera.x, x1: this.camera.x + this.` | 0.75 | 0.00 | 0.12 | 0.00 | 0.00 (0.00) | 0.00 | 1.04 | 0.00 |

### v7

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5811` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 39.4 | 7.55 | 47.0 | 0.39 | 10.6 (3.95) | 7.40 | 14.8 | 0.00 |
| `src/game/engine.ts:5736` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 11.5 | 3.26 | 2.00 | 1.54 | 0.25 (0.00) | 0.50 | 0.38 | 0.00 |
| `src/game/engine.ts:6145` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 11.9 | 1.17 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 7.37 | 2.65 |
| `src/game/engine.ts:6147` `this.w5?.drawLight(ctx, this.camera.viewportWidth, this.camera.viewpor` | 0.00 | 0.00 | 0.63 | 0.40 | 0.00 (0.00) | 0.63 | 0.13 | 0.50 |
| `src/game/engine.ts:5758` `this.drawWaterAndFlags(ctx, world);` | 21.3 | 0.13 | 2.57 | 0.04 | 0.63 (0.00) | 0.14 | 1.29 | 0.00 |
| `src/game/engine.ts:5895` `this.collectibles.forEach((item) => {` | 21.7 | 0.11 | 0.75 | 0.00 | 0.00 (0.00) | 0.03 | 11.3 | 0.00 |
| `src/game/engine.ts:5782` `else renderWorldObjects(` | 8.60 | 0.01 | 373 | 0.04 | 0.02 (0.02) | 7.43 | 30.2 | 1.46 |
| `src/game/engine.ts:6180` `drawDarkness(ctx, this.camera.viewportWidth, this.camera.viewportHeigh` | 0.03 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:6063` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.06 | 0.00 | 0.00 (0.00) | 0.00 | 1.05 | 0.00 |
| `src/game/engine.ts:5761` `this.drawRivers(ctx, world, false);` | 1.77 | 0.01 | 0.15 | 0.00 | 0.15 (0.00) | 0.00 | 1.66 | 0.00 |
| `src/game/engine.ts:5807` `this.drawRivers(ctx, world, true);` | 1.02 | 0.00 | 0.15 | 0.01 | 0.15 (0.00) | 0.15 | 1.17 | 0.00 |
| `src/game/engine.ts:5840` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 0.24 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.23 | 0.00 |
| `src/game/engine.ts:5865` `this.w4?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.ca` | 21.0 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 21.6 | 0.00 |
| `src/game/engine.ts:5777` `if (this.proto?.kitDecor) drawKitDecor(ctx, this.proto.kitDecor, { x0:` | 0.11 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.11 | 0.00 |
| `src/game/engine.ts:5794` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.33 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.18 | 0.00 |
| `src/game/engine.ts:5845` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.42 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.42 | 0.00 |
| `src/game/engine.ts:5952` `this.enemies.forEach((enemy) => {` | 0.60 | 0.00 | 0.20 | 0.00 | 0.00 (0.00) | 0.00 | 0.40 | 0.00 |
| `src/game/engine.ts:5866` `this.w5?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.ca` | 0.34 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.34 | 0.00 |
| `src/game/engine.ts:5841` `if (this.proto?.w3decor) drawW3Decor(ctx, this.proto.w3decor, this.cam` | 0.08 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.05 | 0.00 |
| `src/game/engine.ts:5772` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.20 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6069` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 0.15 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.25 | 0.00 |
| `src/game/engine.ts:5891` `drawRopes(ctx, this.ropes, this.gameTime, { load: this.ropeLoad.amt > ` | 92.3 | 0.00 | 2.00 | 0.00 | 0.00 (0.00) | 0.00 | 73.8 | 0.00 |

### merged

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5755` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 11.2 | 3.25 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.13 | 0.00 |
| `src/game/engine.ts:6171` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 11.9 | 1.17 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 7.37 | 2.58 |
| `src/game/engine.ts:5832` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 14.3 | 0.87 | 1.76 | 0.01 | 0.43 (0.08) | 0.12 | 0.50 | 0.00 |
| `src/game/engine.ts:6173` `this.w5?.drawLight(ctx, this.camera.viewportWidth, this.camera.viewpor` | 0.00 | 0.00 | 0.63 | 0.40 | 0.00 (0.00) | 0.00 | 0.13 | 0.50 |
| `src/game/engine.ts:5778` `this.drawWaterAndFlags(ctx, world);` | 13.4 | 0.13 | 2.54 | 0.04 | 0.59 (0.00) | 0.01 | 1.25 | 0.00 |
| `src/game/engine.ts:5917` `this.collectibles.forEach((item) => {` | 15.6 | 0.11 | 0.74 | 0.00 | 0.00 (0.00) | 0.03 | 8.19 | 0.00 |
| `src/game/engine.ts:5802` `else renderWorldObjects(` | 9.26 | 0.02 | 287 | 0.03 | 0.03 (0.03) | 0.21 | 29.7 | 1.46 |
| `src/game/engine.ts:6206` `drawDarkness(ctx, this.camera.viewportWidth, this.camera.viewportHeigh` | 0.03 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:6087` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.06 | 0.00 | 0.00 (0.00) | 0.00 | 1.05 | 0.00 |
| `src/game/engine.ts:5781` `this.drawRivers(ctx, world, false);` | 1.81 | 0.01 | 0.16 | 0.00 | 0.16 (0.00) | 0.00 | 1.70 | 0.00 |
| `src/game/engine.ts:5827` `this.drawRivers(ctx, world, true);` | 1.05 | 0.00 | 0.16 | 0.01 | 0.16 (0.00) | 0.16 | 1.21 | 0.00 |
| `src/game/engine.ts:5862` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 0.23 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.23 | 0.00 |
| `src/game/engine.ts:5797` `if (this.proto?.kitDecor) drawKitDecor(ctx, this.proto.kitDecor, { x0:` | 0.11 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.11 | 0.00 |
| `src/game/engine.ts:5887` `this.w4?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.ca` | 20.4 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 20.9 | 0.00 |
| `src/game/engine.ts:5814` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.35 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.19 | 0.00 |
| `src/game/engine.ts:5867` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.42 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.42 | 0.00 |
| `src/game/engine.ts:5975` `this.enemies.forEach((enemy) => {` | 0.61 | 0.00 | 0.20 | 0.00 | 0.00 (0.00) | 0.00 | 0.40 | 0.00 |
| `src/game/engine.ts:5888` `this.w5?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.ca` | 0.32 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.32 | 0.00 |
| `src/game/engine.ts:5863` `if (this.proto?.w3decor) drawW3Decor(ctx, this.proto.w3decor, this.cam` | 0.08 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.05 | 0.00 |
| `src/game/engine.ts:5792` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.20 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6094` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 0.16 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.26 | 0.00 |
| `src/game/engine.ts:5913` `drawRopes(ctx, this.ropes, this.gameTime, { load: this.ropeLoad.amt > ` | 4.04 | 0.00 | 0.12 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |

## 4. By call site, top 25 per build (ranked by device megapixels touched per frame, clip/blend work weighted up)

### v6

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/scenery.ts:1673` (drawStrip) | main | 4.63 | 3.85 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1760x868 |
| `src/game/scenery.ts:1713` (renderSky) | main | 0.00 | 0.00 | 1.88 | 2.64 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1639` (drawTile) | main | 1.32 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/scenery.ts:1823` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1879` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 82x179 |
| `src/game/groundArt.ts:110` (drawGroundBody) | main | 0.00 | 0.00 | 0.00 | 0.00 | 3.69 (3.69) | 0.00 |  |
| `src/game/scenery.ts:1495` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/groundArt.ts:112` (drawGroundBody) | main | 0.00 | 0.00 | 3.69 | 0.43 | 0.00 (0.00) | 0.00 |  |
| `src/game/groundArt.ts:84` (fillFace) | main | 0.00 | 0.00 | 3.96 | 0.42 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1679` (drawStrip) | main | 4.63 | 0.38 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1760x868 |
| `src/game/w5Look.ts:1462` (drawW5Light) | main | 0.00 | 0.00 | 0.25 | 0.35 | 0.00 (0.00) | 0.00 | special 0.13 (fillRect@screen 0.13) |
| `src/game/protoArt.ts:623` (drawGroundFill) | main | 9.71 | 0.33 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1363 |
| `src/game/protoArt.ts:578` (drawBankArt) | main | 8.42 | 0.27 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/w5Look.ts:1491` (drawW5Light) | main | 0.00 | 0.00 | 0.38 | 0.21 | 0.00 (0.00) | 0.00 | special 0.38 (fill@lighter 0.38) |
| `src/game/scenery.ts:2036` (renderWeather) | main | 2.65 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 2.65 (drawImage@lighter 2.65); src 64x64 |
| `src/game/scenery.ts:1740` (renderSky) | main | 0.00 | 0.00 | 1.75 | 0.13 | 0.00 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:566` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 3.38 (0.00) | 0.00 |  |
| `src/game/groundArt.ts:91` (fillCap) | main | 0.00 | 0.00 | 3.96 | 0.12 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1484` (mistDrift) | main | 0.63 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/stageArt.ts:311` (row) | main | 2.31 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x516 |
| `src/game/protoArt.ts:619` (drawGroundFill) | main | 0.00 | 0.00 | 0.00 | 0.00 | 1.90 (0.00) | 0.00 |  |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.22 | 0.10 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/envPlants.ts:46` (glowDot) | main | 0.00 | 0.00 | 1.46 | 0.00 | 0.00 (0.00) | 0.00 | special 1.46 (fillRect@lighter 1.46) |
| `src/game/envPlants.ts:158` (pegs) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.46 |  |
| `src/game/readable.ts:85` (drawAura) | main | 6.47 | 0.07 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |

### v7

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/groundPaint.ts:126` (drawSoil) | main | 5.31 | 6.28 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/groundPaint.ts:120` (drawSoil) | main | 10.9 | 3.30 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/scenery.ts:1780` (drawStrip) | main | 4.81 | 3.29 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3520x1736 |
| `src/game/protoArt.ts:568` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 7.78 (3.89) | 0.00 |  |
| `src/game/scenery.ts:1952` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:2011` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 82x179 |
| `src/game/scenery.ts:1826` (renderSky) | main | 0.00 | 0.00 | 0.50 | 0.70 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1792` (drawStrip) | main | 4.73 | 0.64 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3520x1736 |
| `src/game/groundPaint.ts:157` (drawLip) | main | 5.74 | 0.56 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/groundPaint.ts:139` (drawSoil) | main | 0.00 | 0.00 | 4.99 | 0.46 | 0.00 (0.00) | 0.00 |  |
| `src/game/w5Look.ts:1428` (drawW5Light) | main | 0.00 | 0.00 | 0.25 | 0.35 | 0.00 (0.00) | 0.00 | special 0.13 (fillRect@screen 0.13) |
| `src/game/groundPaint.ts:234` (drawEnd) | main | 2.31 | 0.24 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 384x576 |
| `src/game/w5Look.ts:1457` (drawW5Light) | main | 0.00 | 0.00 | 0.38 | 0.21 | 0.00 (0.00) | 0.00 | special 0.38 (fill@lighter 0.38) |
| `src/game/scenery.ts:2150` (renderWeather) | main | 2.65 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 2.65 (drawImage@lighter 2.65); src 64x64 |
| `src/game/scenery.ts:1491` (mistDrift) | main | 0.63 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/scenery.ts:1684` (drawTile) | main | 1.16 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/stageArt.ts:311` (row) | main | 2.32 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x516 |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.24 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/groundPaint.ts:133` (drawSoil) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 4.99 |  |
| `src/game/w7TempleArt.ts:150` (drawW7TempleWall) | main | 0.14 | 0.09 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/groundPaint.ts:235` (drawEnd) | main | 0.97 | 0.09 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/envPlants.ts:46` (glowDot) | main | 0.00 | 0.00 | 1.46 | 0.00 | 0.00 (0.00) | 0.00 | special 1.46 (fillRect@lighter 1.46) |
| `src/game/envPlants.ts:158` (pegs) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.46 |  |
| `src/game/readable.ts:85` (drawAura) | main | 6.29 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |

### merged

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/scenery.ts:1967` (drawFitted) | main | 4.80 | 3.33 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3441x1805 |
| `src/game/scenery.ts:2274` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 82x179 |
| `src/game/protoArt.ts:1068` (drawGroundChunks) | main | 10.4 | 1.04 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 509x509 |
| `src/game/scenery.ts:1971` (drawFitted) | main | 4.73 | 0.64 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3441x1805 |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/w5Look.ts:1424` (drawW5Light) | main | 0.00 | 0.00 | 0.25 | 0.35 | 0.00 (0.00) | 0.00 | special 0.13 (fillRect@screen 0.13) |
| `src/game/w5Look.ts:1442` (drawW5Light) | main | 0.00 | 0.00 | 0.38 | 0.21 | 0.00 (0.00) | 0.00 | special 0.38 (fill@lighter 0.38) |
| `src/game/scenery.ts:2413` (renderWeather) | main | 2.58 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 2.58 (drawImage@lighter 2.58); src 64x64 |
| `src/game/scenery.ts:1491` (mistDrift) | main | 0.63 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/scenery.ts:1714` (drawTile) | main | 1.16 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 5868x1761 |
| `src/game/stageArt.ts:380` (pitRow) | main | 2.00 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 840x210 |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.24 | 0.10 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/envPlants.ts:69` (glowDot) | main | 1.46 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 1.46 (drawImage@lighter 1.46); src 128x128 |
| `src/game/groundPaint.ts:126` (drawSoil) | main | 0.08 | 0.07 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/groundPaint.ts:120` (drawSoil) | main | 0.18 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/readable.ts:85` (drawAura) | main | 4.75 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/readable.ts:87` (drawAura) | main | 4.75 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/badWaterArt.ts:113` (blit) | main | 3.51 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 600x310 |
| `src/game/stageArt.ts:401` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.34 (0.00) | 0.00 |  |
| `src/game/zoneArt.ts:776` (drawDarkness) | main | 0.03 | 0.04 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 323x711 |
| `src/game/stageArt.ts:403` (drawPitWater) | main | 0.00 | 0.00 | 0.34 | 0.04 | 0.00 (0.00) | 0.00 |  |
| `src/game/sheetBake.ts:118` (drawSheet) | main | 8.45 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1536x1831 |
| `src/game/vectorArt.ts:1009` (fillGlow) | main | 3.69 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/protoArt.ts:569` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.15 (0.08) | 0.00 |  |
| `src/game/protoArt.ts:569` (drawBankArt) | off | 0.00 | 0.00 | 0.00 | 0.00 | 0.18 (0.09) | 0.00 | into 509x509 |

## 5. TOP 15 call sites v7 added or made heavier than v6

Ranked by the growth in device megapixels touched per frame (drawImage + fill area), with curved clips (x0.25 each), clip area (x0.5), blended/filtered/shadowed draws and gradients weighted in. "Mpx" = millions of device pixels; one q0 upright screen is 800x1760 = 1.41 Mpx (q2: 400x880 = 0.35 Mpx).

| # | call site (v7) | v6→v7 | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/groundPaint.ts:126` (drawSoil) | **new** | 5.31 | 6.28 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (let bx = Math.floor(x0 / BLOB_PERIOD) * BLOB_PERIOD; bx < x1; bx += BLOB_PE`; src up to 128x128; scaled up to 45.8x |
| 2 | `src/game/groundPaint.ts:120` (drawSoil) | **new** | 10.9 | 3.30 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(img, f.x, f.y, f.w, f.h, cell.x, cell.y, SOIL_TILE + 0.6, SOIL_TIL`; src up to 2048x2048 |
| 3 | `src/game/protoArt.ts:568` (drawBankArt) | heavier | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 / 0.00→0.00 | 3.38→7.78 (3.89; 8.75) | 0.00→0.00 | 0.00 | `ctx.clip();`; clip: polygon-concave/polygon-convex/rect |
| 4 | `src/game/groundPaint.ts:157` (drawLip) | **new** | 5.74 | 0.56 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (let x = Math.floor(a / LIP_W) * LIP_W; x < b; x += LIP_W) ctx.drawImage(img`; src up to 2048x2048 |
| 5 | `src/game/groundPaint.ts:139` (drawSoil) | **new** | 0.00 | 0.00 | 4.99 / 0.46 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.fillRect(x0, a, x1 - x0, Math.min(bottom, viewBottom) - a);` |
| 6 | `src/game/scenery.ts:1792` (drawStrip) | heavier | 4.63→4.73 | 0.38→0.64 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `ctx.drawImage(img, 0, ih - rows, iw, rows, px, top + dh - 1 / k, pw, gap + 2);`; src up to 3520x1736; scaled up to 12.1x |
| 7 | `src/game/groundPaint.ts:234` (drawEnd) | **new** | 2.31 | 0.24 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (faded) ctx.drawImage(faded, -e.cx * ew, top, ew, END_H);`; src up to 384x576 |
| 8 | `src/game/scenery.ts:1684` (drawTile) | **new** | 1.16 | 0.12 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (const [r0, r1] of bands) ctx.drawImage(cv, 0, r0, layerWpx(cv), r1 - r0, px`; src up to 2880x864; scaled up to 2.0x |
| 9 | `src/game/groundPaint.ts:133` (drawSoil) | **new** | 0.00 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 4.99 | 0.00 | `const gr = bottom > y0 && typeof ctx.createLinearGradient === 'function' ? ctx.c` |
| 10 | `src/game/w7TempleArt.ts:150` (drawW7TempleWall) | **new** | 0.14 | 0.09 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (let ty = y0; ty < end; ty += RUN_H) ctx.drawImage(img, f.x, f.y, f.w, f.h, `; src up to 2048x2048; scaled up to 2.0x |
| 11 | `src/game/groundPaint.ts:235` (drawEnd) | **new** | 0.97 | 0.09 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `else ctx.drawImage(s.img, e.x, e.y, e.w, e.h, -e.cx * ew, top, ew, END_H);`; src up to 2048x2048 |
| 12 | `src/game/protoArt.ts:697` (pitShade) | **new** | 0.00 | 0.00 | 35.5 / 0.06 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.fillRect(u, o.top, Math.min(5, b - u), y1 - o.top);` |
| 13 | `src/game/scenery.ts:1783` (drawStrip) | **new** | 0.30 | 0.05 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(above, 0, 0, sw, skh, px, skyTop, pw, sh);`; src up to 2640x513 |
| 14 | `src/game/zoneArt.ts:774` (drawDarkness) | **new** | 0.03 | 0.04 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(darkCanvas, 0, 0, cw, ch, 0, 0, vw, vh);`; src up to 323x711; scaled up to 3.9x |
| 15 | `src/game/w7TempleArt.ts:144` (drawW7TempleWall) | **new** | 0.00 | 0.00 | 0.00 / 0.00 | 1.46 (0.06; 4.48) | 0.00 | 0.00 | `ctx.clip();`; clip: rect/polygon-concave |

## merged against v6

### Heavier in merged than v6 (top 10)

| # | call site (merged) | v6→merged | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/scenery.ts:1967` (drawFitted) | **new** | 4.80 | 3.33 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (sw > 0 && sh2 > 0) ctx.drawImage(cv, sx, sy, sw, sh2, (dx + sx * r) / k, (y0`; src up to 3441x1805 |
| 2 | `src/game/protoArt.ts:1068` (drawGroundChunks) | **new** | 10.4 | 1.04 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 509x509 |
| 3 | `src/game/scenery.ts:1971` (drawFitted) | **new** | 4.73 | 0.64 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (gap > 0) ctx.drawImage(cv, 0, f.oy + f.d - rows, bw, rows, px, top + dh - 1 `; src up to 3441x1805; scaled up to 16.0x |
| 4 | `src/game/scenery.ts:1714` (drawTile) | **new** | 1.16 | 0.12 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (const [a, b] of fb.rows) ctx.drawImage(fb.cv, 0, a, fb.cv.width, b - a, dx `; src up to 5868x1761 |
| 5 | `src/game/stageArt.ts:380` (pitRow) | **new** | 2.00 | 0.11 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `else ctx.drawImage(src, x, y, TILE, h);`; src up to 840x210 |
| 6 | `src/game/envPlants.ts:69` (glowDot) | **new** | 1.46 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 1.46 | `ctx.drawImage(pic, x - rad, y - rad, rad * 2, rad * 2);`; src up to 128x128 |
| 7 | `src/game/groundPaint.ts:126` (drawSoil) | **new** | 0.08 | 0.07 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (let bx = Math.floor(x0 / BLOB_PERIOD) * BLOB_PERIOD; bx < x1; bx += BLOB_PE`; src up to 128x128; scaled up to 45.8x |
| 8 | `src/game/groundPaint.ts:120` (drawSoil) | **new** | 0.18 | 0.06 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(img, f.x, f.y, f.w, f.h, cell.x, cell.y, SOIL_TILE + 0.6, SOIL_TIL`; src up to 2048x2048 |
| 9 | `src/game/badWaterArt.ts:113` (blit) | **new** | 3.51 | 0.05 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(c, x, y, w, h);`; src up to 600x310 |
| 10 | `src/game/zoneArt.ts:776` (drawDarkness) | **new** | 0.03 | 0.04 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(darkCanvas, 0, 0, cw, ch, 0, 0, vw, vh);`; src up to 323x711; scaled up to 3.9x |

### Lighter in merged than v6 (top 12)

| site (v6) | weight | drawImage | img Mpx | clips | gradients |
|---|---:|---:|---:|---:|---:|
| `src/game/scenery.ts:1673` (drawStrip) | 3.85→gone | 4.63→0 | 3.85→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1713` (renderSky) | 2.64→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1639` (drawTile) | 1.41→gone | 1.32→0 | 1.41→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1823` (renderScenery) | 1.41→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundArt.ts:110` (drawGroundBody) | 1.13→0.01 | 0.00→0.00 | 0.00→0.00 | 3.69→0.03 | 0.00→0.00 |
| `src/game/groundArt.ts:112` (drawGroundBody) | 0.43→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 |
| `src/game/groundArt.ts:84` (fillFace) | 0.42→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 |
| `src/game/scenery.ts:1679` (drawStrip) | 0.38→gone | 4.63→0 | 0.38→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:623` (drawGroundFill) | 0.33→gone | 9.71→0 | 0.33→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:578` (drawBankArt) | 0.27→gone | 8.42→0 | 0.27→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1740` (renderSky) | 0.13→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundArt.ts:91` (fillCap) | 0.12→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 | 0.00→0.00 |

