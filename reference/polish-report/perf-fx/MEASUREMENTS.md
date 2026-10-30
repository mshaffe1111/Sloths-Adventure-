# perf-fx: small per-frame costs (2026-10-30)

Helper on branch `perf-fx`, from Duet's "other items" (STATUS.md), in files nobody else was editing (not engine.ts, protoArt.ts,
groundPaint.ts, scenery.ts). Every fix leaves the picture the same: proven old-code-vs-new-code in the same canvas where the drawing
can be called on its own, and by before/after game frames (`look-before-after.webp`).

## How it was measured

Headless Chromium, `npx vite --port 4306`, 844x390 and 390x844 at 2x.

- `node tools/perf/count.mjs 4306 out.json 7-2:2 ...`: plays each stage and counts canvas calls per drawn frame, by the source
  `file:line` (line numbers are Vite's transformed file, a few off the .ts).
  - `DEEP=4` adds the callers.
  - `RATIO=1` adds how much each drawImage shrinks or enlarges its source on screen, and the smoothing it ran under.
- `node tools/perf/frozen.mjs 4306 shot.png 7-2 "<js on engine e>"`: stops the loop, sets things up and renders 30 frames by hand.
  It gives exact per-frame counts, then a frozen screenshot.
- `node tools/perf/pxdiff.mjs page-script.js outDir`: runs a page script that draws old and new code side by side and diffs the
  pixels.

Desktop timings don't carry to the Pixel's GPU (PERFORMANCE-RULES §0), so these are counts, not milliseconds.

## Results, per frame

| Fix | Where | Before | After | Same look |
|---|---|---|---|---|
| 1 pit water baked at tile size | stageArt drawPitWater | 1024x256 sheet shrunk on 8 tiles a frame | ~0.9-1x baked tiles; nothing when below the view | mean diff 0.2-0.3/255, top edge only |
| 2 stone gradients | terrain stone | 4 (1-3) | 0 | kept by size, exact |
| 2 toadstool gradients | artKit drawMushroom | 4 (1-3) | 0 | mean 0.001-0.004/255 |
| 2 W2 water gradient | terrain drawWater | 1 (2-2) | 0 | ends rounded to the pixel |
| 2 glowworm and plant glows | envPlants glowDot | 12 (3-3, 3-5), 26 (9-2) | 0 | max 1/255 |
| 2 swamp pegs, pompom and foxfire glows | envPlants pegs, envKit | 21 (6-2), 22 (8-2) | 0 | max 1/255 |
| 3 eagle sparkle and '!' | eagleSprite | fillText 3 (hover), 1 (warning) | 0 (one drawImage each) | mean 0.1-1.7/255, the same under high and low smoothing |
| 5 ropes culled to the view | ropeArt | 224 drawImage + 224 save/rotate (1-3, no rope on screen) | 0; 72 with a rope in view (31 upright) | rope pixels identical |
| 5 checkpoints culled above or below the view | stageArt drawCheckpointArt | 120 pennant slices (7-2 start, none on screen) | 0; 24 by a checkpoint | flag identical |
| 5 bounce stalks tiled only in the view | bounceArt | 505 (7-2), 44 (9-2), 149 (10-2) | 59, 11, 14 | identical |
| 5 platform order without a sorted copy | terrain drawPlatforms | an array copy and sort of every platform | none | same order |

Item 2's "river gradients": riverArt.ts makes none per frame. The only river one outside engine.ts was drawWater's (the stand-in under
rivers while their sheet loads, and World 2's pit water), fixed above.

## Item 4: image smoothing

The draws that set `imageSmoothingQuality = 'high'` every frame all shrink their source a lot, so 'high' is what keeps them clean.
They were left alone:

- flowerSprites: 56% under 0.35x, the rest 0.35-0.7x;
- leafSprites: 98% under 0.35x;
- heroSprite: Pokey, 0.35-1.3x.

Every near-1:1 draw only inherits 'high' from the main canvas (`engine.ts resizeCanvas`, the lead's item (a)): readable.ts,
vectorArt 1020, groundPaint 163, w7TempleArt, creatureAnim, and now the pit water.

**For the lead's (a):** once the main canvas goes to 'low', these shrink a lot and set nothing themselves, so they need their own
'high' or a bake at their drawn size:

- bounceArt stalk tiles (93% under 0.35x);
- badWaterArt (92% under 0.35x);
- petalSprites (88% under 0.35x);
- paintedScenery 96/98 (40% under 0.35x);
- stageArt flags and gates (0.35-0.7x);
- life.ts 885 (0.35-0.7x).

The eagle stamps are already baked at the canvas's scale, so they don't care.

## Seen, not mine to fix

- A faint mirrored word is drawn across the eagle's body (visible in the eagle frames, before and after alike).
- World 5's light wash (w5Look drawW5Light) still makes 1-3 gradients a frame. Its file may be in the W5 rebuild's hands, so it
  was left alone.
- In lead-owned files: groundPaint 140 (up to 7 gradients a frame) and protoArt 765/798 (up to 6).
