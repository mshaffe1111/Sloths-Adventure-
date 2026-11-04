# The measured release (GPU stage 1, testers only): report

Branch warmup-5m. The gate ran on source commit d1ce159c, which has the lead tip ccf5e09d and main 68b31e66 merged in. Matt approved the
testers-only switch at about 12:05 PM ET on 2026-11-04, and added budget for it.

## What it carries
- **GPU stages 0 and 1 (the backdrop), behind `gpuBackdropOn() = qaBuild() || ctestEnabled()`** (src/game/gpuLayer.ts).
  - On the live site it is on only with `#ctest` (the testers' link). In the store app it is never on.
  - `mountGpuLayer` checks it first.
  - The `backdrop` readout and `gpuback=0` follow it.
  - A player's stage gets ready exactly as before: the GPU wait is skipped (stageReady.ts).
- **Pixi kept out of the service worker's precache** (vite.config.ts `globIgnores`: gpuPixi, browserAll, webworkerAll, init).
  - FOUND: before this, the lazy import alone still had every player's PWA downloading 434 KB of Pixi in the background.
- **drawWatch** (src/game/drawWatch.ts), testers only. Any single 2D canvas call of 30 ms or more becomes a `slowdraw` event: the
  call, the picture or baked canvas and its size, and whether it drew on screen or off it. It is aimed at R-3.14, the OnePlus draw
  spikes.
- **The fixed end** is written into GPU-RENDERER-PLAN.md ("The measured release"): the switch is deleted the day the phone numbers
  decide.
- Matt's card: `MATT-PHONE-CHECK.md`, for the live testers' link, with the 0.9.4 baseline per phone.

## Proof
| Check | Result |
|---|---|
| tsc | EXIT 0 |
| tests | 2309: 2307 pass, 0 fail, 2 TODO (already there) |
| vite build | exit 0; 0 files over 4 MiB; precache 1007 entries, none of Pixi's |
| artcheck | PASS |
| drawcheck | PASS (692 s) |
| clipcheck | PASS (83 known, 187 s) |
| knowncheck | PASS |
| roadmapcheck | PASS |
| funcheck | PASS (152 known, 2072 stage-layout flags, 54 s) |
| gpuDefaultOff.cjs (production build) | PASS, 48/48 (gpuDefaultOff.txt) |
| drawWatchCost.cjs (dev, 412x915) | cost 0.10 ms (1-1), 0.10 ms (5-M), 0.20 ms (8-1) a frame; limit about 1 ms |

gpuDefaultOff.cjs covers:
- **A player**, at 1-1, 5-M and 8-1, upright and sideways: 0 WebGL contexts, 0 Pixi requests, the GPU canvas never shown, no page
  errors.
- **`#ctest`**: the layer starts and the recording carries `backdrop: 2D (copy 277-334 ms (a readback...)), ready ...`. This
  container's 2D canvas is software, so the copy is a readback here.
- **`#ctest&gpuback=0`**: the line reads `2D (gpuback=0)`.
- **The precache**: none of the chunks only testers fetch are in it.

Bundle: the main chunk is 3,951,584 bytes raw (1.28 MB gzip), 242 KB under the 4 MiB limit. gpuPixi is 369,348 bytes and testers
only.

## Not proven here, named
- **A pixel comparison of a player's frame against the lead tip.** The cross-load method was noise: the same build shot twice differed
  by up to 59,000 px. I deleted it, and the lesson is in webgl.md. The player path is proven by its code instead: with the switch off,
  `backdropBegin` and `backdropUpload` return at once and scenery makes main's exact `drawImage` calls. drawcheck passes too.
- **firstframes against main.** Not run: the lead's bar for tonight was default-off, the drawWatch cost and the full gate. A player
  runs none of the new code paths.
- **drawWatch's limit.** It times each call on the JavaScript side. Chrome records most 2D calls and draws them later, so it catches
  calls that do their work right away (an image decode, a canvas snapshot, a pixel read). A spike made of many small calls shows as
  a stall with a large `d` and no `slowdraw`, which itself narrows the cause.

## Planned vs actual
Started 12:04 PM ET (R-3.14 / the release) and green at 1:58 PM ET: about 1.9 h, against the 3 h estimate and the 3:00 PM ETA. The
lost time was the cross-load pixel check (about 35 min, dropped).
