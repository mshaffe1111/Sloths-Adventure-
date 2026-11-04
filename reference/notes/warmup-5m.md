# warmup-5m notes

Last updated: Wed Nov 04 10:52 AM ET

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

- Added since:
  - the 1x1 drawing buffer while empty (f334d63b);
  - gpuLayer.cjs PASS upright and sideways;
  - gpuLook 0 px in 22 of 22 (and 6 of 6 after the 1x1 change);
  - the side-by-side sheets;
  - firstframes before and after (noisy container, no consistent change);
  - bundle: main +2.3 KB, Pixi chunks 435 KB raw / 125 KB gzip, lazy;
  - report reference/qa-reports/webgl-0/README.md and methods/webgl.md.

## In flight: GPU stage 1 (R-3.2), skies and backdrops
- Stage 0: ACCEPTED and merged by the lead (65b6c33a), 11-04.
- Lead, 11-04, the design: "GPU underneath, copied in" (the see-through 2D canvas fails the look bar: lighter, screen and multiply
  effects). Conditions:
  - a GPU-to-GPU copy, or fall back;
  - render and copy in the same frame;
  - measure the net (here impossible: this container's 2D canvas is software);
  - write it into the plan;
  - engine.ts only a flag (it needed none).
- Lead, 11-04, option (a): finish to the full bar here, a phone readout in QA builds only, the card for Matt. Nothing merges to main
  until his phones show a saving.
- Done:
  - ac020edb, then cf2b4f65, 005866b5, 88c04b03, e3ff9f1c;
  - look 22 of 22 within 4 levels a pixel;
  - context loss PASS both ways;
  - fallback before play;
  - Pixi trimmed (434 KB fetched at the first stage);
  - card: reference/qa-reports/webgl-1/MATT-PHONE-CHECK.md;
  - report: reference/qa-reports/webgl-1/README.md.
- Gate green on e3ff9f1c; report 346256a0; lead ACCEPTED it to the bar here, 11-04.
- Phone check: its own artifact "GPU phone check" https://claude.ai/artifact/MaBaabWAKZXQGjx81NpstM (all 492 dist files,
  published in 4 batches; NOT Matt's main test link, which holds the 0.9.4 candidate). The card now has the link, is about 5 min a
  phone (one run each way) and asks Matt plainly about the start (same / a little longer / clearly longer). Waiting on his phones.
- Named: load +0.1 to +0.9 s here (1-1 +0.9 repeated); the average frame 0-2 ms higher here (noise or the idle context).

## In flight: the measured release (Matt approved ~12:05 PM ET), R-3.14 the OnePlus draw spikes
- The six runs Matt did on 11-04 reached the sheet, but all were live 0.9.4: build 68b31e66, no GPU code.
  - Pixel 0 stalls, Samsung 2.
  - OnePlus (Adreno 619, 4 GB) 33, about 25 of them the game's own draw, 150-460 ms.
  - R-3.14 (keeper): Day 1, A, owner warmup-5m, started 12:04 PM ET.
- Built:
  - eb7f90d0: gpuBackdropOn() = qaBuild() || ctestEnabled() (mountGpuLayer checks it first; readout and gpuback=0 follow it; never
    in the store app);
  - Pixi's 4 chunks out of the SW precache (FOUND: a lazy import still had every player downloading 434 KB);
  - drawWatch.ts: a slowdraw event for any single 2D call of 30 ms or more, testers only, not in engine.ts (lead approved);
  - card for the live testers' link;
  - plan "The measured release" with its fixed end.
- Proven: gpuDefaultOff.cjs PASS, 48/48, on a production build (4674d7f6). w8-rope2: no engine.ts clash.
- GREEN at 1:44 PM ET, 11-04 (32c57be7; report reference/qa-reports/webgl-1m/README.md):
  - full gate;
  - gpuDefaultOff 48/48;
  - drawWatch 0.1-0.2 ms a frame.
  ACCEPTED by the lead and merged into the lead branch; it ships tonight with W1 1-1..1-5.
- Tomorrow (lead): firstframes against main, and keep the main chunk's 242 KB headroom under 4 MiB in view.
- Next, after it's live: read Matt's #ctest and #ctest&gpuback=0 pairs per phone (the card). Above all the OnePlus: its slowdraw lines
  name the R-3.14 cause. Then the ship-or-pull decision, and delete the switch that day.
- Dropped: playerLook.cjs (cross-load pixel noise, lesson in webgl.md). Not run: firstframes (not in tonight's bar).

## Pitfalls (mine)
- Look comparisons:
  - judge only the canvases;
  - draw the frozen frame about 40 times first;
  - mask what moves by itself between two shots;
  - give each build its own temp files: a shared noise file once faked a "0 px".
- Never time anything while the look run or the gate runs.
- A layer or feature that does nothing yet must cost nothing: no start-up on a hot path (stage launch) until it is used.
- Never edit src while a dev-server browser check runs: the reload breaks the run.
- Freeze the engine only after any pending resize (resizeDue); otherwise the checks see a state play never draws.
- A plausible explanation for a difference ("GPU filtering") is not a cause: find the mechanism first. The dynamic-texture bug hid
  behind it. This container is slower than on 11-01 (frames 36-127 ms).
