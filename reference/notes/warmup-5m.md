# warmup-5m notes

Last updated: Wed Nov 04 02:44 AM ET

## The job
- **R-3.1, GPU plan stage 0** (lead, 2026-11-04):
  - PixiJS v8 pinned, on one WebGL 2 canvas under the 2D canvas;
  - the camera and the 30 fps loop drive both;
  - context loss handled and tested;
  - WebGL 2 only, never WebGPU;
  - nothing moves to the GPU yet, so the look must be identical in every world, upright and sideways;
  - drawcheck and the frame budget no worse; the bundle size noted.
- Effort high. Branch: **warmup-5m** (this session may push only here; the lead OK'd restarting it from the lead branch, 11-04).
- Method: none existed for WebGL, so I write reference/methods/webgl.md. Numbers follow perf-measure.md; checks follow gates.md.
- The report needs: Method used, Lessons applied, Method update, Polish check, and ids pasted from output after the push.

## Decisions
- Lead, 11-04: option (a), restart warmup-5m from origin/ccr-0d59a91c-oy3imz and carry over 11143cf4.
  - A force push was blocked (auto mode), so I merged the lead branch into warmup-5m instead (0e447e3c).
- Lead, 11-04: retirement is immediate only for hiding, misreporting or releasing myself. The rest goes up the GAMEPLAN §3 ladder.
- pixi.js pinned at exactly **8.22.0** (published 2026-10-01; the newest v8 on 11-04; 34 days old). bun.lock updated with bun install v1.4.4 (38afee6c8)

Done! Checked 605 packages (no changes) [12.00ms].
- The layer renders, and shows its canvas, only while its world holds something visible. The loop still hands it the camera every frame.
  Stage 0 draws nothing, so it costs no GPU frames. An empty full-screen WebGL layer would still be cleared and composited.

## Done (with proof)
- `src/game/gpuLayer.ts`:
  - the context is made with getContext('webgl2') and handed to Pixi's WebGLRenderer (never auto-detect, never WebGPU);
  - Pixi loads as its own chunk through import().
- Wiring:
  - App.tsx: the canvas under the game canvas; mounted on the first launchEngine, not awaited;
  - engine.ts: drawGpuFrame after render(), with the same snapped camera translate (gpuTx/gpuTy) and zoom; resizeGpuLayer in resizeCanvas.
- `src/game/gpuLayer.test.ts`: 4 pass.
- `tools/qa/gpuLayer.cjs` on 1-1 upright: PASS. Its checks:
  - mounted as WebGL 2, hidden and idle when empty;
  - the probe box tracks the camera within 1 CSS px, before and after walking;
  - context loss: the 2D game keeps running; after restore the layer draws in the right place again;
  - no page errors.
- `tools/qa/gpuLook.cjs` on 1-1 upright: 0 px differ with the layer removed or forced visible. It leaves out 819 px that move by
  themselves between two shots (the pickup ring's real-clock animation).

## In flight
- The look across all 10 worlds plus 5-M, upright and sideways, before and after builds (background run, /tmp/claude-0/look).
- Still to do:
  - the sideways layer check;
  - production bundle sizes;
  - firstframes 1x on 3 stages, before and after;
  - the full gate (tsc, tests, build, artcheck, knowncheck, clipcheck, drawcheck);
  - methods/webgl.md;
  - the report.

## Pitfalls (mine)
- Look comparisons:
  - judge only the canvases (hide the DOM; Dot's bubble and the hints animate in JS);
  - draw the frozen frame about 40 times first (ground squares paint a few per frame);
  - mask what moves by itself between two shots of the same frame.
- Never time anything while the look run or the gate runs.
