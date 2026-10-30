# Frame cost by build: merged (9a76f161 (the merge, 12:20 ET))

Measured 2026-10-30 by the perf harness (`tools/perf/`). Headless Chromium (SwiftShader), deviceScaleFactor 3, picture held at q2 (canvas at 1x CSS). Every number is per frame on the main canvas unless it says otherwise, averaged over every counted frame of every spot.

**Read the counts, areas and clip types as the evidence.** CPU ms is headless software raster on a 4-core container, a hint of relative weight only, not the phone.

## 1. Per-frame totals

| per frame | merged |
|---|---:|
| frames counted | 1072 |
| drawImage calls | 106 |
| drawImage visible area (screens) | 5.64 |
| fill/fillRect calls | 294 |
| fill area, bbox (screens) | 0.49 |
| area drawn with a non-source-over blend (screens) | 0.28 |
| clip() calls | 1.35 |
|   of them curved/polygon (not a plain rect) | 0.10 |
| gradients created | 0.58 |
| patterns created | 0.00 |
| save() | 78.5 |
| shadowBlur>0 sets | 0.00 |
| filter sets | 0.00 |
| globalCompositeOperation sets (not source-over) | 1.98 |
| getImageData/putImageData | 0.00 |
| canvases created | 0.02 |

## 2. Per run (scenario x orientation)

`img` = drawImage calls / visible screens; `clip` = all / curved-or-polygon; `ms` = render() CPU median (p90), `+flush` = render plus a 1-pixel read that waits for the raster, median.

| run | merged img | merged clip | merged grad | merged ms | merged +flush |
|---|---:|---:|---:|---:|---:|
| 1-1 port | 52.6 / 5.25 | 1.00 / 0.00 | 0.25 | 16.3 (25.8) | 18.5 |
| 1-1 land | 97.0 / 5.96 | 1.00 / 0.00 | 0.24 | 6.90 (20.4) | 17.5 |
| 1-3 port | 66.1 / 5.34 | 1.00 / 0.00 | 0.39 | 14.0 (34.8) | 18.1 |
| 1-3 land | 108 / 6.00 | 0.88 / 0.00 | 0.36 | 1.40 (7.50) | 20.1 |
| 2-1 port | 52.4 / 5.11 | 1.46 / 0.00 | 0.73 | 15.1 (30.2) | 20.0 |
| 2-1 land | 119 / 5.80 | 3.52 / 0.00 | 1.76 | 17.4 (35.0) | 20.8 |
| 3-2 port | 68.8 / 6.88 | 3.28 / 1.01 | 2.48 | 15.4 (39.7) | 21.4 |
| 3-2 land | 104 / 6.16 | 1.24 / 0.00 | 1.34 | 11.1 (27.0) | 22.9 |
| 4-1 port | 246 / 5.33 | 1.61 / 0.19 | 0.31 | 16.1 (30.7) | 19.9 |
| 4-1 land | 314 / 5.74 | 1.75 / 0.00 | 0.12 | 11.7 (24.6) | 19.5 |
| 5-1 port | 68.6 / 4.97 | 0.13 / 0.13 | 0.51 | 14.9 (29.3) | 27.7 |
| 5-1 land | 110 / 5.74 | 0.24 / 0.24 | 0.87 | 17.1 (30.0) | 26.5 |
| 6-1 port | 55.9 / 5.17 | 1.24 / 0.00 | 0.00 | 12.8 (26.1) | 18.2 |
| 6-1 land | 100 / 5.94 | 1.27 / 0.00 | 0.00 | 2.00 (5.60) | 16.1 |
| 7-1 port | 48.3 / 5.21 | 1.00 / 0.00 | 0.00 | 1.40 (3.90) | 12.6 |
| 7-1 land | 86.3 / 5.66 | 1.00 / 0.00 | 0.00 | 2.10 (3.30) | 11.2 |

## 3. By layer (the line of Engine.render each call came from)

### merged

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5755` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 11.2 | 3.25 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.13 | 0.00 |
| `src/game/engine.ts:6171` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 8.37 | 1.16 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 5.12 | 1.35 |
| `src/game/engine.ts:5832` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 14.3 | 0.87 | 1.76 | 0.01 | 0.43 (0.08) | 0.12 | 0.51 | 0.00 |
| `src/game/engine.ts:6173` `this.w5?.drawLight(ctx, this.camera.viewportWidth, this.camera.viewpor` | 0.00 | 0.00 | 0.63 | 0.40 | 0.00 (0.00) | 0.00 | 0.13 | 0.50 |
| `src/game/engine.ts:5778` `this.drawWaterAndFlags(ctx, world);` | 13.5 | 0.13 | 2.57 | 0.04 | 0.59 (0.00) | 0.02 | 1.25 | 0.00 |
| `src/game/engine.ts:5917` `this.collectibles.forEach((item) => {` | 15.6 | 0.11 | 0.74 | 0.00 | 0.00 (0.00) | 0.03 | 8.23 | 0.00 |
| `src/game/engine.ts:5802` `else renderWorldObjects(` | 9.26 | 0.02 | 287 | 0.03 | 0.02 (0.02) | 0.22 | 29.6 | 1.47 |
| `src/game/engine.ts:6206` `drawDarkness(ctx, this.camera.viewportWidth, this.camera.viewportHeigh` | 0.03 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.03 | 0.00 |
| `src/game/engine.ts:6087` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.02 | 0.06 | 0.00 | 0.00 (0.00) | 0.00 | 1.05 | 0.00 |
| `src/game/engine.ts:5781` `this.drawRivers(ctx, world, false);` | 1.80 | 0.01 | 0.16 | 0.00 | 0.16 (0.00) | 0.00 | 1.69 | 0.00 |
| `src/game/engine.ts:5827` `this.drawRivers(ctx, world, true);` | 1.04 | 0.00 | 0.16 | 0.01 | 0.16 (0.00) | 0.16 | 1.20 | 0.00 |
| `src/game/engine.ts:5862` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 0.24 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.23 | 0.00 |
| `src/game/engine.ts:5887` `this.w4?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.ca` | 20.4 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 21.0 | 0.00 |
| `src/game/engine.ts:5797` `if (this.proto?.kitDecor) drawKitDecor(ctx, this.proto.kitDecor, { x0:` | 0.11 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.11 | 0.00 |
| `src/game/engine.ts:5814` `for (const pl of this.platforms) if (pl.type === 'drift' && !pl.broken` | 0.34 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.19 | 0.00 |
| `src/game/engine.ts:5867` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.42 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.42 | 0.00 |
| `src/game/engine.ts:5975` `this.enemies.forEach((enemy) => {` | 0.60 | 0.00 | 0.20 | 0.00 | 0.00 (0.00) | 0.00 | 0.40 | 0.00 |
| `src/game/engine.ts:5888` `this.w5?.drawBack(ctx, this.gameTime, { x0: this.camera.x, x1: this.ca` | 0.34 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.34 | 0.00 |
| `src/game/engine.ts:5863` `if (this.proto?.w3decor) drawW3Decor(ctx, this.proto.w3decor, this.cam` | 0.08 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.05 | 0.00 |
| `src/game/engine.ts:5792` `drawAura(ctx, 'take', world.id, pl.width * 0.55, 30, this.gameTime, pl` | 0.20 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6094` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 0.15 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.25 | 0.00 |
| `src/game/engine.ts:5913` `drawRopes(ctx, this.ropes, this.gameTime, { load: this.ropeLoad.amt > ` | 4.23 | 0.00 | 0.12 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |

## 4. By call site, top 25 per build (ranked by device megapixels touched per frame, clip/blend work weighted up)

### merged

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/scenery.ts:1967` (drawFitted) | main | 4.81 | 0.83 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1721x903 |
| `src/game/scenery.ts:2274` (drawVignette) | main | 1.00 | 0.35 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 82x179 |
| `src/game/protoArt.ts:1068` (drawGroundChunks) | main | 10.4 | 0.26 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 255x255 |
| `src/game/scenery.ts:1971` (drawFitted) | main | 4.73 | 0.16 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1721x903 |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/w5Look.ts:1424` (drawW5Light) | main | 0.00 | 0.00 | 0.25 | 0.09 | 0.00 (0.00) | 0.00 | special 0.13 (fillRect@screen 0.13) |
| `src/game/envPlants.ts:69` (glowDot) | main | 1.47 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 1.47 (drawImage@lighter 1.47); src 128x128 |
| `src/game/w5Look.ts:1442` (drawW5Light) | main | 0.00 | 0.00 | 0.38 | 0.05 | 0.00 (0.00) | 0.00 | special 0.38 (fill@lighter 0.38) |
| `src/game/scenery.ts:2413` (renderWeather) | main | 1.35 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 1.35 (drawImage@lighter 1.35); src 64x64 |
| `src/game/scenery.ts:1491` (mistDrift) | main | 0.63 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/scenery.ts:1714` (drawTile) | main | 1.16 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2935x881 |
| `src/game/stageArt.ts:380` (pitRow) | main | 2.00 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 420x105 |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.24 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/protoArt.ts:569` (drawBankArt) | off | 0.00 | 0.00 | 0.00 | 0.00 | 0.18 (0.09) | 0.00 | into 255x255 |
| `src/game/protoArt.ts:569` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.15 (0.08) | 0.00 |  |
| `src/game/groundPaint.ts:126` (drawSoil) | main | 0.08 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/groundPaint.ts:120` (drawSoil) | main | 0.18 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/readable.ts:85` (drawAura) | main | 4.78 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/zoneArt.ts:762` (hole) | off | 0.00 | 0.00 | 0.26 | 0.00 | 0.00 (0.00) | 0.00 | special 0.26 (fill@destination-out 0.26); into 323x711 |
| `src/game/readable.ts:87` (drawAura) | main | 4.78 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/stageArt.ts:401` (drawPitWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.34 (0.00) | 0.00 |  |
| `src/game/badWaterArt.ts:113` (blit) | main | 3.49 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 300x155 |
| `src/game/zoneArt.ts:776` (drawDarkness) | main | 0.03 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 323x711 |
| `src/game/stageArt.ts:403` (drawPitWater) | main | 0.00 | 0.00 | 0.34 | 0.01 | 0.00 (0.00) | 0.00 |  |
| `src/game/vectorArt.ts:1009` (fillGlow) | main | 3.71 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |

