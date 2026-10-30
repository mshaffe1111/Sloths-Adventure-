# Frame cost by build: today (913677f), ccrnow (b83de6e6 (ccr at 10:45 ET)), merged (9a76f161 (the merge, 12:20 ET))

Measured 2026-10-30 by the perf harness (`tools/perf/`). Headless Chromium (SwiftShader), deviceScaleFactor 3, picture held at q0 (canvas at 2x CSS). Every number is per frame on the main canvas unless it says otherwise, averaged over every counted frame of every spot.

**Read the counts, areas and clip types as the evidence.** CPU ms is headless software raster on a 4-core container, a hint of relative weight only, not the phone.

## 1. Per-frame totals

| per frame | today | ccrnow | merged |
|---|---:|---:|---:|
| frames counted | 536 | 536 | 536 |
| drawImage calls | 858 | 810 | 138 |
| drawImage visible area (screens) | 9.14 | 5.45 | 5.44 |
| fill/fillRect calls | 562 | 555 | 254 |
| fill area, bbox (screens) | 2.05 | 1.67 | 0.14 |
| area drawn with a non-source-over blend (screens) | 0.01 | 0.01 | 0.01 |
| clip() calls | 11.1 | 2.53 | 2.25 |
|   of them curved/polygon (not a plain rect) | 2.03 | 0.00 | 0.00 |
| gradients created | 8.64 | 5.27 | 0.67 |
| patterns created | 0.00 | 0.00 | 0.00 |
| save() | 602 | 592 | 49.0 |
| shadowBlur>0 sets | 0.00 | 0.00 | 0.00 |
| filter sets | 0.00 | 0.00 | 0.00 |
| globalCompositeOperation sets (not source-over) | 3.00 | 3.01 | 0.79 |
| getImageData/putImageData | 0.00 | 0.00 | 0.00 |
| canvases created | 0.00 | 0.00 | 0.00 |

## 2. Per run (scenario x orientation)

`img` = drawImage calls / visible screens; `clip` = all / curved-or-polygon; `ms` = render() CPU median (p90), `+flush` = render plus a 1-pixel read that waits for the raster, median.

| run | today img | today clip | today grad | today ms | today +flush | ccrnow img | ccrnow clip | ccrnow grad | ccrnow ms | ccrnow +flush | merged img | merged clip | merged grad | merged ms | merged +flush |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1-4 port | 912 / 5.57 | 7.12 / 1.00 | 4.25 | 318 (926) | 410 | 860 / 5.31 | 1.36 / 0.00 | 3.24 | 363 (920) | 443 | 109 / 5.34 | 1.37 / 0.00 | 0.12 | 41.7 (79.7) | 54.4 |
| 1-4 land | 1039 / 5.96 | 11.4 / 1.00 | 6.97 | 35.3 (48.0) | 42.8 | 941 / 5.82 | 1.51 / 0.00 | 6.01 | 36.1 (119) | 43.7 | 158 / 5.77 | 1.48 / 0.00 | 0.12 | 35.4 (74.9) | 53.5 |
| 2-6 port | 1193 / 7.35 | 5.87 / 1.25 | 2.39 | 47.4 (62.3) | 55.2 | 1165 / 5.68 | 3.36 / 0.00 | 1.13 | 39.0 (58.3) | 46.8 | 158 / 5.65 | 3.33 / 0.00 | 1.12 | 50.4 (105) | 60.7 |
| 2-6 land | 1289 / 7.64 | 5.75 / 1.25 | 2.39 | 49.2 (67.5) | 57.4 | 1239 / 6.04 | 3.24 / 0.00 | 1.13 | 36.1 (60.6) | 46.4 | 226 / 6.03 | 3.28 / 0.00 | 1.12 | 50.3 (97.5) | 67.8 |
| 3-4 port | 1055 / 5.04 | 7.00 / 1.00 | 11.2 | 25.8 (40.2) | 33.9 | 1015 / 4.53 | 2.49 / 0.00 | 10.2 | 28.9 (39.3) | 38.8 | 122 / 4.52 | 1.49 / 0.00 | 0.13 | 34.1 (55.8) | 46.8 |
| 3-4 land | 1159 / 5.54 | 8.85 / 1.00 | 15.1 | 31.4 (42.3) | 39.6 | 1090 / 5.06 | 1.24 / 0.00 | 14.1 | 30.6 (41.9) | 38.2 | 170 / 5.08 | 1.25 / 0.00 | 0.13 | 31.0 (61.1) | 47.7 |
| 7-3 port | 81.7 / 13.9 | 15.4 / 3.33 | 10.0 | 43.6 (58.5) | 50.5 | 70.9 / 5.32 | 4.01 / 0.00 | 3.67 | 30.4 (43.1) | 39.6 | 65.6 / 5.32 | 2.79 / 0.00 | 0.00 | 50.3 (72.0) | 64.0 |
| 7-3 land | 135 / 22.1 | 27.7 / 6.43 | 16.8 | 59.4 (83.1) | 66.6 | 98.7 / 5.81 | 3.01 / 0.00 | 2.61 | 25.9 (56.6) | 44.7 | 94.2 / 5.81 | 3.01 / 0.00 | 2.61 | 33.7 (53.2) | 56.7 |

## 3. By layer (the line of Engine.render each call came from)

### today

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5743` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.4 | 3.37 | 2.00 | 1.53 | 0.25 (0.00) | 0.50 | 0.25 | 0.00 |
| `src/game/engine.ts:5819` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 66.2 | 3.82 | 7.05 | 0.15 | 9.81 (2.03) | 3.38 | 12.3 | 0.00 |
| `src/game/engine.ts:6158` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 12.9 | 1.17 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 8.51 | 2.59 |
| `src/game/engine.ts:5772` `drawEarthWall(ctx, this.proto.bankWall, { x0: this.camera.x, x1: this.` | 1.65 | 0.50 | 0.72 | 0.34 | 0.25 (0.00) | 0.25 | 0.25 | 0.00 |
| `src/game/engine.ts:5904` `this.collectibles.forEach((item) => {` | 37.3 | 0.16 | 2.54 | 0.00 | 0.00 (0.00) | 0.63 | 19.7 | 0.00 |
| `src/game/engine.ts:5766` `this.drawWaterAndFlags(ctx, world);` | 58.3 | 0.06 | 0.25 | 0.01 | 0.25 (0.00) | 0.00 | 2.28 | 0.00 |
| `src/game/engine.ts:5850` `if (this.proto?.w3decor) drawW3Decor(ctx, this.proto.w3decor, this.cam` | 5.53 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.31 | 0.00 |
| `src/game/engine.ts:6074` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5790` `else renderWorldObjects(` | 8.45 | 0.00 | 534 | 0.01 | 0.00 (0.00) | 3.88 | 33.1 | 2.75 |
| `src/game/engine.ts:5849` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 7.43 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.90 | 0.00 |
| `src/game/engine.ts:5843` `for (const v of this.vines) if (v.vineType === 'tree_climb' && this.on` | 1.53 | 0.01 | 0.00 | 0.00 | 0.57 (0.00) | 0.00 | 0.57 | 0.00 |
| `src/game/engine.ts:5900` `drawRopes(ctx, this.ropes, this.gameTime, { load: this.ropeLoad.amt > ` | 645 | 0.01 | 14.5 | 0.00 | 0.00 (0.00) | 0.00 | 515 | 0.00 |
| `src/game/engine.ts:5865` `drawThornVine(ctx, v, ph.phase, ph.u, l ? (this.gameTime - l.at) / (VI` | 0.27 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.54 | 0.00 |
| `src/game/engine.ts:5818` `if (w7chairs) drawW7Chairs(ctx, w7chairs, this.camera.x, this.camera.x` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5962` `this.enemies.forEach((enemy) => {` | 0.18 | 0.00 | 0.06 | 0.00 | 0.00 (0.00) | 0.00 | 0.12 | 0.00 |
| `src/game/engine.ts:5892` `if (this.onScreen(h.x, h.y, 260)) drawHollowArt(ctx, h.x, h.y, Math.hy` | 0.07 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5854` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.11 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.11 | 0.00 |
| `src/game/engine.ts:5877` `this.kit?.drawBack(ctx, { x0: this.camera.x, x1: this.camera.x + this.` | 2.06 | 0.00 | 0.34 | 0.00 | 0.00 (0.00) | 0.00 | 2.75 | 0.00 |
| `src/game/engine.ts:5712` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5716` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5761` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6119` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |

### ccrnow

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5745` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.4 | 3.37 | 2.00 | 1.53 | 0.25 (0.00) | 0.50 | 0.25 | 0.00 |
| `src/game/engine.ts:6161` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 12.9 | 1.17 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 8.52 | 2.60 |
| `src/game/engine.ts:5822` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 15.7 | 0.38 | 0.00 | 0.00 | 1.20 (0.00) | 0.00 | 1.61 | 0.00 |
| `src/game/engine.ts:5774` `drawEarthWall(ctx, this.proto.bankWall, { x0: this.camera.x, x1: this.` | 3.96 | 0.24 | 0.47 | 0.12 | 0.25 (0.00) | 0.25 | 0.25 | 0.00 |
| `src/game/engine.ts:5907` `this.collectibles.forEach((item) => {` | 37.3 | 0.16 | 2.51 | 0.00 | 0.00 (0.00) | 0.63 | 19.7 | 0.00 |
| `src/game/engine.ts:5768` `this.drawWaterAndFlags(ctx, world);` | 58.2 | 0.06 | 0.25 | 0.01 | 0.25 (0.00) | 0.00 | 2.28 | 0.00 |
| `src/game/engine.ts:5853` `if (this.proto?.w3decor) drawW3Decor(ctx, this.proto.w3decor, this.cam` | 5.56 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.33 | 0.00 |
| `src/game/engine.ts:6077` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5792` `else renderWorldObjects(` | 8.47 | 0.00 | 535 | 0.01 | 0.00 (0.00) | 3.89 | 33.1 | 2.76 |
| `src/game/engine.ts:5852` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 7.43 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.90 | 0.00 |
| `src/game/engine.ts:5846` `for (const v of this.vines) if (v.vineType === 'tree_climb' && this.on` | 1.53 | 0.01 | 0.00 | 0.00 | 0.57 (0.00) | 0.00 | 0.57 | 0.00 |
| `src/game/engine.ts:5903` `drawRopes(ctx, this.ropes, this.gameTime, { load: this.ropeLoad.amt > ` | 645 | 0.01 | 14.5 | 0.00 | 0.00 (0.00) | 0.00 | 515 | 0.00 |
| `src/game/engine.ts:5868` `drawThornVine(ctx, v, ph.phase, ph.u, l ? (this.gameTime - l.at) / (VI` | 0.28 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.56 | 0.00 |
| `src/game/engine.ts:5820` `if (w7chairs) drawW7Chairs(ctx, w7chairs, this.camera.x, this.camera.x` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5965` `this.enemies.forEach((enemy) => {` | 0.18 | 0.00 | 0.06 | 0.00 | 0.00 (0.00) | 0.00 | 0.12 | 0.00 |
| `src/game/engine.ts:5895` `if (this.onScreen(h.x, h.y, 260)) drawHollowArt(ctx, h.x, h.y, Math.hy` | 0.06 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5857` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.11 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.11 | 0.00 |
| `src/game/engine.ts:5880` `this.kit?.drawBack(ctx, { x0: this.camera.x, x1: this.camera.x + this.` | 2.07 | 0.00 | 0.35 | 0.00 | 0.00 (0.00) | 0.00 | 2.76 | 0.00 |
| `src/game/engine.ts:5714` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5718` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5763` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6122` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |

### merged

| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/game/engine.ts:5755` `if (!ownScene) renderScenery(ctx, world.id, this.camera.x - shakeX, th` | 10.2 | 3.36 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:6171` `else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportW` | 12.9 | 1.17 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 8.52 | 2.65 |
| `src/game/engine.ts:5832` `if (!(this.paintKit && drawProtoScene(ctx, this.platforms, this.curren` | 15.6 | 0.37 | 0.00 | 0.00 | 1.18 (0.00) | 0.00 | 1.56 | 0.00 |
| `src/game/engine.ts:5784` `drawEarthWall(ctx, this.proto.bankWall, { x0: this.camera.x, x1: this.` | 3.97 | 0.24 | 0.47 | 0.12 | 0.25 (0.00) | 0.25 | 0.25 | 0.00 |
| `src/game/engine.ts:5917` `this.collectibles.forEach((item) => {` | 24.3 | 0.15 | 1.88 | 0.00 | 0.00 (0.00) | 0.42 | 12.9 | 0.00 |
| `src/game/engine.ts:5778` `this.drawWaterAndFlags(ctx, world);` | 21.9 | 0.06 | 0.25 | 0.01 | 0.25 (0.00) | 0.00 | 2.24 | 0.00 |
| `src/game/engine.ts:5863` `if (this.proto?.w3decor) drawW3Decor(ctx, this.proto.w3decor, this.cam` | 5.53 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.31 | 0.00 |
| `src/game/engine.ts:6087` `} else if (!kitPose) drawHeroSloth(ctx, this.player, this.gameTime);` | 1.00 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5802` `else renderWorldObjects(` | 3.29 | 0.00 | 250 | 0.01 | 0.00 (0.00) | 0.00 | 12.2 | 0.54 |
| `src/game/engine.ts:5862` `if (this.proto?.decor) drawW2Decor(ctx, this.proto.decor, this.camera.` | 7.44 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.90 | 0.00 |
| `src/game/engine.ts:5856` `for (const v of this.vines) if (v.vineType === 'tree_climb' && this.on` | 1.53 | 0.01 | 0.00 | 0.00 | 0.58 (0.00) | 0.00 | 0.58 | 0.00 |
| `src/game/engine.ts:5913` `drawRopes(ctx, this.ropes, this.gameTime, { load: this.ropeLoad.amt > ` | 27.4 | 0.01 | 0.90 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5878` `drawThornVine(ctx, v, ph.phase, ph.u, l ? (this.gameTime - l.at) / (VI` | 0.27 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.54 | 0.00 |
| `src/game/engine.ts:5830` `if (w7chairs) drawW7Chairs(ctx, w7chairs, this.camera.x, this.camera.x` | 0.03 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5975` `this.enemies.forEach((enemy) => {` | 0.19 | 0.00 | 0.06 | 0.00 | 0.00 (0.00) | 0.00 | 0.13 | 0.00 |
| `src/game/engine.ts:5905` `if (this.onScreen(h.x, h.y, 260)) drawHollowArt(ctx, h.x, h.y, Math.hy` | 0.06 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5867` `if (this.proto?.dress) drawDress(ctx, this.proto.dress, { x0: this.cam` | 0.11 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.11 | 0.00 |
| `src/game/engine.ts:5890` `this.kit?.drawBack(ctx, { x0: this.camera.x, x1: this.camera.x + this.` | 2.06 | 0.00 | 0.34 | 0.00 | 0.00 (0.00) | 0.00 | 2.75 | 0.00 |
| `src/game/engine.ts:5724` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:5728` `ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHei` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 0.00 | 0.00 |
| `src/game/engine.ts:5773` `ctx.save();` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |
| `src/game/engine.ts:6132` `if (!(lair === 'prowler' && prowlerGlow() < 0.98) && !this.w5) this.dr` | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | 1.00 | 0.00 |

## 4. By call site, top 25 per build (ranked by device megapixels touched per frame, clip/blend work weighted up)

### today

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/groundPaint.ts:126` (drawSoil) | main | 3.93 | 3.82 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/scenery.ts:1780` (drawStrip) | main | 4.65 | 3.48 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3637x1736 |
| `src/game/groundPaint.ts:120` (drawSoil) | main | 8.53 | 1.71 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/scenery.ts:1952` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:2011` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/scenery.ts:1792` (drawStrip) | main | 4.52 | 0.71 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3637x1736 |
| `src/game/scenery.ts:1826` (renderSky) | main | 0.00 | 0.00 | 0.50 | 0.70 | 0.00 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:568` (drawBankArt) | main | 0.00 | 0.00 | 0.00 | 0.00 | 3.91 (1.96) | 0.00 |  |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/groundPaint.ts:139` (drawSoil) | main | 0.00 | 0.00 | 3.30 | 0.35 | 0.00 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:632` (drawEarthWall) | main | 0.00 | 0.00 | 0.25 | 0.32 | 0.00 (0.00) | 0.00 |  |
| `src/game/groundPaint.ts:157` (drawLip) | main | 4.41 | 0.19 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/protoArt.ts:628` (drawEarthWall) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.25 (0.00) | 0.00 |  |
| `src/game/envPlants.ts:46` (glowDot) | main | 0.00 | 0.00 | 2.75 | 0.00 | 0.00 (0.00) | 0.00 | special 2.75 (fillRect@lighter 2.75) |
| `src/game/scenery.ts:2150` (renderWeather) | main | 2.59 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 2.59 (drawImage@lighter 2.59); src 64x64 |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.26 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/scenery.ts:1684` (drawTile) | main | 1.02 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/w7TempleArt.ts:150` (drawW7TempleWall) | main | 0.11 | 0.09 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2048 |
| `src/game/groundPaint.ts:234` (drawEnd) | main | 0.83 | 0.09 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 384x576 |
| `src/game/readable.ts:85` (drawAura) | main | 11.1 | 0.08 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/protoArt.ts:490` (drawBranchArt) | main | 40.4 | 0.07 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/groundPaint.ts:133` (drawSoil) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 3.30 |  |
| `src/game/readable.ts:87` (drawAura) | main | 11.1 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/envPlants.ts:42` (glowDot) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.75 |  |
| `src/game/badWaterArt.ts:55` (blit) | main | 3.80 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x754 |

### ccrnow

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/scenery.ts:1780` (drawStrip) | main | 4.66 | 3.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3637x1736 |
| `src/game/scenery.ts:1952` (renderScenery) | main | 0.00 | 0.00 | 1.00 | 1.41 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:2011` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/scenery.ts:1792` (drawStrip) | main | 4.53 | 0.71 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3637x1736 |
| `src/game/scenery.ts:1826` (renderSky) | main | 0.00 | 0.00 | 0.50 | 0.70 | 0.00 (0.00) | 0.00 |  |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/protoArt.ts:1068` (drawGroundChunks) | main | 4.53 | 0.40 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 473x473 |
| `src/game/protoArt.ts:710` (drawWallChunks) | main | 3.89 | 0.34 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 473x473 |
| `src/game/protoArt.ts:722` (drawWallChunks) | main | 0.00 | 0.00 | 0.25 | 0.16 | 0.00 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:704` (drawWallChunks) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.25 (0.00) | 0.00 |  |
| `src/game/envPlants.ts:46` (glowDot) | main | 0.00 | 0.00 | 2.76 | 0.00 | 0.00 (0.00) | 0.00 | special 2.76 (fillRect@lighter 2.76) |
| `src/game/scenery.ts:2150` (renderWeather) | main | 2.60 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 2.60 (drawImage@lighter 2.60); src 64x64 |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.27 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/scenery.ts:1684` (drawTile) | main | 1.02 | 0.10 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2880x864 |
| `src/game/readable.ts:85` (drawAura) | main | 11.2 | 0.08 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/protoArt.ts:491` (drawBranchArt) | main | 8.92 | 0.07 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/readable.ts:87` (drawAura) | main | 11.2 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/envPlants.ts:42` (glowDot) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 2.76 |  |
| `src/game/badWaterArt.ts:55` (blit) | main | 3.79 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x754 |
| `src/game/protoArt.ts:231` (blit) | main | 1.72 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/scenery.ts:1783` (drawStrip) | main | 0.25 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2640x513 |
| `src/game/vectorArt.ts:1009` (fillGlow) | main | 8.90 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 120x120 |
| `src/game/scenery.ts:1853` (renderSky) | main | 0.00 | 0.00 | 0.50 | 0.04 | 0.00 (0.00) | 0.00 |  |
| `src/game/badWaterArt.ts:72` (drawBadWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.25 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:1129` (drawProtoScene) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.70 (0.00) | 0.00 |  |

### merged

| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `src/game/scenery.ts:1967` (drawFitted) | main | 4.65 | 3.53 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3441x1805 |
| `src/game/scenery.ts:2274` (drawVignette) | main | 1.00 | 1.41 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 149x68 |
| `src/game/scenery.ts:1971` (drawFitted) | main | 4.53 | 0.71 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 3441x1805 |
| `src/game/scenery.ts:1505` (lanePool) | main | 1.00 | 0.49 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 160x160 |
| `src/game/protoArt.ts:1068` (drawGroundChunks) | main | 4.53 | 0.40 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 473x473 |
| `src/game/protoArt.ts:710` (drawWallChunks) | main | 3.91 | 0.34 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 473x473 |
| `src/game/protoArt.ts:722` (drawWallChunks) | main | 0.00 | 0.00 | 0.25 | 0.16 | 0.00 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:704` (drawWallChunks) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.25 (0.00) | 0.00 |  |
| `src/game/scenery.ts:2413` (renderWeather) | main | 2.65 | 0.01 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 2.65 (drawImage@lighter 2.65); src 64x64 |
| `src/game/life.ts:808` (renderSwayLeaves) | main | 2.27 | 0.12 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 360x360 |
| `src/game/scenery.ts:1714` (drawTile) | main | 1.01 | 0.11 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 5868x1760 |
| `src/game/readable.ts:85` (drawAura) | main | 7.89 | 0.07 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/protoArt.ts:491` (drawBranchArt) | main | 8.88 | 0.07 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/readable.ts:87` (drawAura) | main | 7.89 | 0.06 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 96x96 |
| `src/game/badWaterArt.ts:113` (blit) | main | 3.79 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 600x310 |
| `src/game/protoArt.ts:231` (blit) | main | 1.71 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x1782 |
| `src/game/vectorArt.ts:1009` (fillGlow) | main | 5.73 | 0.05 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 120x120 |
| `src/game/badWaterArt.ts:137` (drawBadWater) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.25 (0.00) | 0.00 |  |
| `src/game/protoArt.ts:1129` (drawProtoScene) | main | 0.00 | 0.00 | 0.00 | 0.00 | 0.70 (0.00) | 0.00 |  |
| `src/game/sheetBake.ts:118` (drawSheet) | main | 10.2 | 0.03 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1536x1831 |
| `src/game/envPlants.ts:69` (glowDot) | main | 0.54 | 0.00 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | special 0.54 (drawImage@lighter 0.54); src 128x128 |
| `src/game/riverArt.ts:48` (blit) | main | 7.16 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 2048x2166 |
| `src/game/stageArt.ts:120` (glow) | main | 0.51 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 128x128 |
| `src/game/badWaterArt.ts:139` (drawBadWater) | main | 0.00 | 0.00 | 0.25 | 0.02 | 0.00 (0.00) | 0.00 |  |
| `src/game/stageArt.ts:96` (blitAt) | main | 0.33 | 0.02 | 0.00 | 0.00 | 0.00 (0.00) | 0.00 | src 1024x1003 |

## ccrnow against today

### Heavier in ccrnow than today (top 10)

| # | call site (ccrnow) | today→ccrnow | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/protoArt.ts:1068` (drawGroundChunks) | **new** | 4.53 | 0.40 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 473x473 |
| 2 | `src/game/protoArt.ts:710` (drawWallChunks) | **new** | 3.89 | 0.34 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 473x473 |
| 3 | `src/game/protoArt.ts:722` (drawWallChunks) | **new** | 0.00 | 0.00 | 0.25 / 0.16 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.fillRect(a, t, b - a, Math.min(bottom, view.y1) - t);` |
| 4 | `src/game/protoArt.ts:704` (drawWallChunks) | **new** | 0.00 | 0.00 | 0.00 / 0.00 | 0.25 (0.00; 4.00) | 0.00 | 0.00 | `ctx.clip();`; clip: rect |
| 5 | `src/game/scenery.ts:1780` (drawStrip) | heavier | 4.65→4.66 | 3.48→3.49 | 0.00→0.00 / 0.00→0.00 | 0.00→0.00 (0.00; 0.00) | 0.00→0.00 | 0.00 | `ctx.drawImage(img, 0, 0, iw, ih, px, top, pw, dh);`; src up to 3637x1736 |
| 6 | `src/game/protoArt.ts:717` (drawWallChunks) | **new** | 0.00 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.25 | 0.00 | `const gr = ctx.createLinearGradient(0, y0, 0, view.y1);` |

### Lighter in ccrnow than today (top 12)

| site (today) | weight | drawImage | img Mpx | clips | gradients |
|---|---:|---:|---:|---:|---:|
| `src/game/groundPaint.ts:126` (drawSoil) | 3.82→gone | 3.93→0 | 3.82→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:120` (drawSoil) | 1.71→gone | 8.53→0 | 1.71→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:568` (drawBankArt) | 0.67→gone | 0.00→0 | 0.00→0 | 3.91→0 | 0.00→0 |
| `src/game/groundPaint.ts:139` (drawSoil) | 0.35→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:632` (drawEarthWall) | 0.32→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:157` (drawLip) | 0.19→0.01 | 4.41→0.07 | 0.19→0.01 | 0.00→0.00 | 0.00→0.00 |
| `src/game/protoArt.ts:628` (drawEarthWall) | 0.16→gone | 0.00→0 | 0.00→0 | 0.25→0 | 0.00→0 |
| `src/game/w7TempleArt.ts:150` (drawW7TempleWall) | 0.09→gone | 0.11→0 | 0.09→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:234` (drawEnd) | 0.09→gone | 0.83→0 | 0.09→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:133` (drawSoil) | 0.07→gone | 0.00→0 | 0.00→0 | 0.00→0 | 3.30→0 |
| `src/game/w7FaceArt.ts:69` (drawW7Face) | 0.05→gone | 0.00→0 | 0.00→0 | 0.97→0 | 0.00→0 |
| `src/game/w7TempleArt.ts:144` (drawW7TempleWall) | 0.03→gone | 0.00→0 | 0.00→0 | 1.29→0 | 0.00→0 |

## merged against today

### Heavier in merged than today (top 10)

| # | call site (merged) | today→merged | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `src/game/scenery.ts:1967` (drawFitted) | **new** | 4.65 | 3.53 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (sw > 0 && sh2 > 0) ctx.drawImage(cv, sx, sy, sw, sh2, (dx + sx * r) / k, (y0`; src up to 3441x1805 |
| 2 | `src/game/scenery.ts:1971` (drawFitted) | **new** | 4.53 | 0.71 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (gap > 0) ctx.drawImage(cv, 0, f.oy + f.d - rows, bw, rows, px, top + dh - 1 `; src up to 3441x1805; scaled up to 16.0x |
| 3 | `src/game/protoArt.ts:1068` (drawGroundChunks) | **new** | 4.53 | 0.40 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 473x473 |
| 4 | `src/game/protoArt.ts:710` (drawWallChunks) | **new** | 3.91 | 0.34 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `if (cv) ctx.drawImage(cv, pad, pad, px, px, cx * CHUNK, cy * CHUNK, CHUNK, CHUNK`; src up to 473x473 |
| 5 | `src/game/protoArt.ts:722` (drawWallChunks) | **new** | 0.00 | 0.00 | 0.25 / 0.16 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.fillRect(a, t, b - a, Math.min(bottom, view.y1) - t);` |
| 6 | `src/game/protoArt.ts:704` (drawWallChunks) | **new** | 0.00 | 0.00 | 0.00 / 0.00 | 0.25 (0.00; 4.00) | 0.00 | 0.00 | `ctx.clip();`; clip: rect |
| 7 | `src/game/scenery.ts:1714` (drawTile) | **new** | 1.01 | 0.11 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `for (const [a, b] of fb.rows) ctx.drawImage(fb.cv, 0, a, fb.cv.width, b - a, dx `; src up to 5868x1760 |
| 8 | `src/game/badWaterArt.ts:113` (blit) | **new** | 3.79 | 0.05 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `ctx.drawImage(c, x, y, w, h);`; src up to 600x310 |
| 9 | `src/game/sheetBake.ts:118` (drawSheet) | **new** | 10.2 | 0.03 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.00 | `} else ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);`; src up to 1536x1831; scaled up to 1.7x |
| 10 | `src/game/envPlants.ts:69` (glowDot) | **new** | 0.54 | 0.00 | 0.00 / 0.00 | 0.00 (0.00; 0.00) | 0.00 | 0.54 | `ctx.drawImage(pic, x - rad, y - rad, rad * 2, rad * 2);`; src up to 128x128 |

### Lighter in merged than today (top 12)

| site (today) | weight | drawImage | img Mpx | clips | gradients |
|---|---:|---:|---:|---:|---:|
| `src/game/groundPaint.ts:126` (drawSoil) | 3.82→gone | 3.93→0 | 3.82→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1780` (drawStrip) | 3.48→gone | 4.65→0 | 3.48→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:120` (drawSoil) | 1.71→gone | 8.53→0 | 1.71→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1952` (renderScenery) | 1.41→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1792` (drawStrip) | 0.71→gone | 4.52→0 | 0.71→0 | 0.00→0 | 0.00→0 |
| `src/game/scenery.ts:1826` (renderSky) | 0.70→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:568` (drawBankArt) | 0.67→gone | 0.00→0 | 0.00→0 | 3.91→0 | 0.00→0 |
| `src/game/groundPaint.ts:139` (drawSoil) | 0.35→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/protoArt.ts:632` (drawEarthWall) | 0.32→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |
| `src/game/groundPaint.ts:157` (drawLip) | 0.19→0.01 | 4.41→0.06 | 0.19→0.01 | 0.00→0.00 | 0.00→0.00 |
| `src/game/protoArt.ts:628` (drawEarthWall) | 0.16→gone | 0.00→0 | 0.00→0 | 0.25→0 | 0.00→0 |
| `src/game/envPlants.ts:46` (glowDot) | 0.14→gone | 0.00→0 | 0.00→0 | 0.00→0 | 0.00→0 |

