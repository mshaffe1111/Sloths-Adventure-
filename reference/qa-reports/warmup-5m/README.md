# warmup-5m, Nov 1 2026 (branch warmup-5m, from release-0.9.2)

Two fixes for the 6 PM ET release: the first-draw stutter at the start of a stage, and Meeca drawn half into room 5's far wall in 5-M.

## Fix 1: the first frame of play froze (first-draw stutter)

**What it was.** Profiled in headless Chromium (CPU profile of the first 2.5 s after the stage goes live). The first frame of play spent
its time in `restore`/`drawImage` under `drawPaintedLeaf` (the falling leaves) and `drawFitted` (the backdrop strips). Neither sheet was
still decoding: `atlasLoader` and `plainSheets` already `decode()` every sheet, and `stageReady` already draws each one once. The cost
was the **new canvases baked under the title card**: the sprite copies (`sheetBake.ts settleSheetBakes`), the backdrop strips fitted to
this screen (`warmScenery`) and the ground-plant pictures (`settleDecorBakes`). They were baked into canvases that were never drawn onto
the game's canvas, so the first draw of each, the browser's upload, landed on play's first frame. (`warmScenery` fits into a 1x1 scratch
canvas, which does not upload the fits to the game canvas.)

**The fix** (`src/game/stageReady.ts`): after the bakes settle, draw the first frame of play once more onto the game's canvas, still
under the title card, then wait two animation frames (at most 1.5 s) so the browser does the upload while the card shows. This runs past
the ready deadline too: on a phone too slow to make the deadline, the frame costs the same here as it would frozen at the start of play.
Memory doesn't change: no new sheets are loaded and nothing is kept longer. The copies are the ones `settleSheetBakes` already made for
this stage, and leaving a world still releases its sheets (`atlasLoader.ts enterWorld`).

### Frame times, first 10 s of play (before = release-0.9.2 + Fix 2, after = this branch)

Production build (`vite build` + `vite preview`), headless Chromium, 448x998 upright at dpr 2, walking right and hopping. Each run uses a
new browser profile with the files cached, so it measures decode/upload, not the network. Harness: `tools/perf/firstframes.cjs`.
"Worst" is the longest gap between two frames; "first 2 s worst" is the worst frame in the first 2 s; ">100" counts frames over
100 ms. ms per run.

**CPU throttle 1x.** This container's CPU with software GPU raster already runs the game at 23-34 ms a frame, the class of an old phone.

| Stage | Build | Worst frame | First 2 s worst | >100 ms frames | Avg frame | Load (open to stage live) |
|---|---|---|---|---|---|---|
| 1-1 (W1) | before | **1367, 1233, 1183** (the first frame) | 1367, 1233, 1183 | 3, 3, 4 | 30.5, 30.9, 29.4 | 5376, 4424, 4804 (median 4804) |
| 1-1 | after | 167, 117, 217, 167, 133, 267 | 83, 100, 100, 100, 117, 150 | 1, 2, 1, 1, 3, 3 | 25.9, 24.4, 26.8, 29.1, 27.1, 27.0 | 4316, 4966, 4745, 4454, 4470, 4787 (median 4608) |
| 5-M (W5) | before | 2183*, 150, 183 | -, 150, 133 | 5, 3, 6 | 32.9, 30.4, 28.3 | 5231, 4537, 4971 (median 4971) |
| 5-M | after | 133, 150, 167, 117, 167, 150 | 117, 150, 133, 117, 150, 133 | 3, 3, 2, 4, 3, 8 | 26.6, 27.7, 26.4, 28.0, 29.5, 34.4 | 5052, 5170, 5029, 5291, 5502, 5396 (median 5231) |
| 8-1 (W8) | before | **1567, 1383, 1417** (the first frame) | 1567, 1383, 1417 | 2, 1, 1 | 25.8, 25.1, 24.6 | 5737, 5441, 5774 (median 5737) |
| 8-1 | after | 133, 100, 167, 150, 183, 200 | 133, 67, 83, 100, 100, 83 | 4, 0, 1, 1, 1, 1 | 28.3, 24.0, 22.9, 23.2, 23.5, 23.4 | 5637, 6487, 6226, 6329, 6020, 6082 (median 6154) |

\* 5-M before, run 1: one 2.2 s gap 2.2 s in, as the opening card went. It didn't happen in the other two runs, and I didn't chase it.
5-M had no big first frame before: Meeca's stage already starts on its own in-game card.

**Added load time:** medians, 1-1 -0.2 s (noise), 5-M +0.26 s, 8-1 +0.42 s. That is about the size of the freeze it removes, and it now
happens behind the title card instead of on the first frame. On 8-1 the stage opens about 0.4 s later and then runs smoothly, where
before it opened onto a 1.4-1.6 s frozen frame.

**CPU throttle 4x (and 6x).** On this container these swamp everything: 6x ran at about 500 ms a frame, and 4x at 220-310 ms a frame
in every build, so frame pacing means nothing there. The 4x runs still show the first-frame spike going:

| Stage | Build | First frame (ms) | Worst |
|---|---|---|---|
| 1-1 | before | 550, 633 | 550, 633 |
| 1-1 | after | 450, 200 | 533, 583 |
| 8-1 | before | 867, 1067 | 867, 1067 |
| 8-1 | after | 117, 117 | 1000, 650 |

(At 4x the whole stage start runs past the 6.5 s ready deadline. The first after-build skipped the warm frame there, so it now runs past
the deadline too; the table is from that build.)

### What the remaining 100-270 ms frames are (lead's check, 12:15 PM)

- **About 4 s in: the frame governor.** It starts judging at 4 s (`GOV_WARMUP_MS`), finds headless frames over 40 ms and steps the
  picture down, q0 to q1 (then q2). The step resizes the canvas and re-fits the backdrop strips (`stepQuality`, `resizeCanvas`,
  `drawFitted`: about 130 ms of the profile). The quality per frame was logged alongside the gaps: the hitch lands on the change from 0
  to 1.
- **The others (117-217 ms, in the first 2 s):** these are the container, not first draws. On the dev build, the same page played the
  same stage a second time, forced to q0 (everything already decoded, uploaded and baked):

| Stage | First play (cold), frames over 100 ms | Second play (warm, q0), frames over 100 ms |
|---|---|---|
| 1-1 | 133 at 1.6 s | 133 at 0.4 s |
| 8-1 | 433, 117, 117 in the first 0.9 s | 150, 133 at 2.6-2.8 s |
| 5-M | 217, 250, 200 in the first 0.7 s | 117 (x7), 217, 133 through the first 1.7 s |

  The warm play has frames over 100 ms too, so this container's software raster can't draw q0 under 100 ms every frame. That is the
  container, not the game. (8-1's 433 ms cold frame was on the dev build only; the production runs' worst on 8-1 was 100-200 ms.)

### The quality-step hitch, fixed (lead's check, 1:35 PM)

The governor's step down (q0 to q1, then q2) cost a 117-183 ms frame on a slow phone, once per step. Three causes, three fixes:
- **The resize, plus an extra full frame.** `stepQuality` resized the canvas after the frame was drawn and then drew again at once.
  Now it marks the resize, and the next frame resizes just before it draws (engine.ts `resizeDue`; the step back up works the same way).
- **The backdrop re-fit at the new scale.** Under the title card, `stageReady` now fits the strips for every lighter step the governor
  could still take (engine.ts `stepKs`), as well as for this one. A strip keeps three sizes (was two), and every fit is stamped once on
  the game canvas there (scenery.ts `stampSceneryFits`). Memory: backdrop fits are 49-70 MB a stage with all three sizes (1-1 48.8, 8-1
  52.9, 5-M 70.2), about 22-31 MB more than one size alone; that is inside PERFORMANCE-RULES §2.13's 300 MB stage budget. Only the
  stage's own strips, released as before.
- **Mipmaps.** At q0 Pokey's sheet copy is drawn near 1:1. At 3/4 with smoothing 'high', the browser built its mipmaps on the step's
  frame (about 140 ms in the profile). Each sheet drawn through sheetBake is now drawn shrunk once under the card (sheetBake.ts
  `warmSheetMips`).

Measured on production builds, the worst frame 3.4-6 s into play (where the governor steps here), 3 runs each, ms. "Previous" = this
branch before the step fix:

| Stage | Previous | Now | Ordinary frames 0.3-3.4 s, now |
|---|---|---|---|
| 1-1 | 167, 133, 167 | 83, 100, 83 | 100, 100, 117 |
| 8-1 | 117, 167, 183 | 83, 50, 67 | 83, 133, 67 |
| 5-M | 117, 117, 117 | 117, 100, 233* | 133, 117, 117 |

On 1-1 and 8-1 the step frame is now no worse than the container's ordinary frames, so the step no longer shows as a hitch here. The
under-50-ms bar can't be shown in this container (its ordinary q0 frames are 67-117 ms, software raster); the phone has to confirm it.
On the dev server, stepping by hand (`tools/perf/qstep.cjs`): before, 150 ms on 1-1 and 183 ms on 8-1; now 83-117 on 1-1 (ordinary
frames 67-83) and 50-67 on 8-1.

\* 5-M, followed up (lead's check, 12:32 PM).
- **Is the backdrop re-fitted in play there?** No. With a temporary log in `makeFit`, 5-M makes its three fits per strip under the card
  (k 0.916, 1.375, 1.833) and none at the step: the pre-fit works there as on 1-1.
- **The step frame, logged with the quality per frame** (dev, the governor's own step, 3 runs, `tools/perf/warmreplay.cjs`): the frames
  around q0 to q1 are 33-83 ms, against ordinary frames whose worst in 0.3-3.4 s is 100-117. The step is no worse than an ordinary
  frame, 3 of 3.
- **Stepped by hand** (`qstep.cjs`, 4 runs): 67, 67, 83, 67 ms after the step, against 100, 83, 83, 67 in the second before.
- **Production** (6 runs, no quality log possible there): the worst frame 3.4-6 s in was 83, 83, 200, 83, 67, 117, against ordinary
  frames 0.3-3.4 s of 133, 433, 133, 133, 150, 117. Five of six are no worse than ordinary. One run had a 200 ms and a 183 ms frame at
  4.0-4.2 s, which I can't attribute without the quality log. It didn't recur in the 3 dev runs or the 3 later production runs. Named,
  not hidden.
- Still re-baked by scale (small, and not seen as a cost in the 5-M profile): the pit water and checkpoint flags (`stageArt.ts`, single
  slot) and the ground chunks.

**Load time, cumulative:** the step fix adds about 0.1-0.4 s more behind the card (medians: 1-1 4643 to 4754, 8-1 5937 to 6419, 5-M
4978 to 5141). Against release-0.9.2, 8-1 now opens about 0.6-0.7 s later behind its title card, with no frozen first frame and no
step hitch. If that is too long, the cheapest cut is fitting only the next step (q1), not q2: about half the extra time and memory.

### Left over, named plainly

- **A 100-270 ms hitch about 4 s into every stage here.** The profile shows `stepQuality` (engine.ts 981), `resizeCanvas` and a
  backdrop re-fit (`drawFitted`). That is the frame governor stepping the picture down from q0 because headless frames are slow. It isn't
  a first draw. A phone that holds q0 never does it, but an old phone that steps down gets the same hitch each time it steps. Suggested
  follow-up for the lead (engine.ts/scenery.ts are lead-owned, PERFORMANCE-RULES §8.3): pre-fit the strips for the next quality step
  under the title card, or re-fit over several frames.
- Headless Chromium draws through software (SwiftShader), not a phone GPU. The fix is about uploads, so the real proof is the in-game
  frame check on Matt's old OnePlus: the first frame of 1-1 or 8-1 should no longer freeze.

## Fix 2: 5-M room 5, Meeca drawn half into the bank face

**What it was.** Her body is 38 px wide (engine.ts walls: half width 19). Her painted frames reach further: standing, her front arm is
35.6 px ahead of her middle (idle frame), so flush against room 5's far wall her arm and side were drawn 16.6 px into the dirt, over the
wooden post at the foot of the face.

**The fix** (`src/game/meecaFaceDraw.ts`, used from `engine.ts`): only her drawing moves, never her body, so no collision changes. Each
frame, the reach of the pose she is drawn in (from the frame's rectangle, so the idle frames she blinks through share one reach and she
doesn't drift as she blinks) is checked against the solid faces beside her (the same blocks she bumps into). Where it would reach into
one, she is drawn that much away from it, eased. She isn't shifted while climbing. The reach table is worked out once per frame name and
kept, so the frame loop makes no new objects. It holds for every wall in the stage, not only room 5's.

**Test:** `src/game/meecaFace.test.ts`, room 5 on Normal and Easy, upright 448x998 and sideways 844x390, four rolls. She walks into the
far wall, and the picture's edge must be on her side of the face and within 4 px of it; backing off, the shift must go to zero. Before:
all four fail, "her picture reaches 16.6 px into the face (reach 35.6, shift 0.0)". After: all pass.

**The other rooms and the ending:** all 13 `meeca*.test.ts` files pass (68 tests, including the full playthroughs upright and sideways,
Easy and Normal). `tools/qa/meecaVisible.cjs` (final build) gave 0 misses in every run:

| Run | Samples | Misses | Worst |
|---|---|---|---|
| Upright 448x998 dpr 3 | 102 | 0 | 38% |
| Sideways 844x390 dpr 3 | 105 | 0 | 23% |
| Upright, forced q0 | 63 | 0 | 36% |

### Stills

- `room5-upright-zoom.jpg`: before and after, upright 448x998 at dpr 3.
- `room5-sideways-zoom.jpg`: before and after, sideways 844x390 at dpr 3 (2x zoom).
- `room5-jump-against-face-after.jpg`: jumping into the face from the pit (upright, after): her raised hand touches the face's edge and goes no further. Before, the jump frame reached 40 px past her body, into the dirt.
- `room5-upright-before-after.jpg`, `room5-sideways-before-after.jpg`: the whole screens.

## Polish check

- **She stands against the face, not in it** (`room5-upright-zoom.jpg`, `room5-sideways-zoom.jpg`). Before, her right arm and side
  covered the post and went into the dirt. After, her hand rests on the post at the foot of the face. Pass.
- **Not inside the dirt in the air either** (`room5-jump-against-face-after.jpg`): jumping up the face, her hand meets its edge. Pass.
- **She doesn't drift or wobble while standing at the wall.** The idle frames share one reach, and the test checks that the shift settles
  and goes back to zero when she leaves. Pass.
- **She doesn't look pushed off the wall.** The shift is only as much as her picture overlapped; the test allows at most 4 px of gap, and
  the still shows her touching the post. Pass.
- **The pale sliver beside her, fixed** (lead's check, 12:15 PM). What it was: World 5's kit tree trunk (`kits/w5.webp` 'wall'),
  which `protoArt.ts` draws behind every bank face that rises from a floor more than 150 below (`isWall`), starting 14 units left of the
  face. The bank's soil covers all of the trunk except those 14 units, so only a thin pale strip of its root flare showed, glued to her
  side once she stood clear of the face. In World 5 the trunk piece is now cut to the face (one rectangle clip), so the face is clean
  soil (`room5-upright-zoom.jpg`, `room5-sideways-zoom.jpg`). The same sliver logic exists in the other worlds' kits; I didn't change
  those.
- **First frames:** the table above. No frozen first frame on 1-1 or 8-1. The start can be up to 0.4 s later, behind the title card.

## Method update

New method file: `reference/methods/perf-measure.md` (it didn't exist). Proposed as written. In short:
- **What worked:**
  - production builds side by side at CPU throttle 1x with `tools/perf/firstframes.cjs`;
  - profiling the bad frame on the dev server with a live-moment marker (`frameprof.cjs` and `frameprof.py`);
  - the drawImage-at-a-point trace to name a thing on screen;
  - a warm replay forced to q0 (`warmreplay.cjs`) to tell the game from the container;
  - per-frame quality logging, to tell a governor step from a late sheet;
  - `qstep.cjs` to step the quality on demand.
- **What failed:**
  - CPU throttle 4x/6x: it swamps this container (220-500 ms every frame) and pushes the stage start past its ready deadline;
  - a warm replay without forcing q0 (it starts at the learned q2);
  - a deadline guard on the warm-up frame;
  - judging a 50 ms bar on the dev server;
  - timing while the gate runs.

## Gate (efa3f4ef: the last code commit; the commits after it are docs and tools only)

- `npx tsc --noEmit -p .`: clean.
- The full test globs, sharded 3 ways: 680 + 794 + 681 pass, 0 fail (two TODOs that were already there).
- `npx vite build`: no asset over 4 MiB.
- `node tools/perf/artcheck.mjs`: PASS.
- `node tools/perf/drawcheck.mjs`: PASS (650 s).

**Shared drawing files touched** (PERFORMANCE-RULES §8.3, the lead reviews them):
- `engine.ts`: the Meeca draw offset; `resizeDue`; `stepKs`.
- `scenery.ts`: 3 fit sizes; `stampSceneryFits`.
- `protoArt.ts`: the World 5 trunk clip.
- `sheetBake.ts`: `warmSheetMips`.
- `stageReady.ts`.

## Pause, rotate, resume (lead's check, 1:45 PM)

Rotating the phone never went through the deferred path: `handleResize` (engine.ts 981) still calls `resizeCanvas()` at once. The two
deferred sites are the governor's step down and its step back up, and both run only inside the loop while it isn't paused. Checked
anyway on the dev build:
- **Upright to sideways** (`pause-rotate-upright-to-sideways.jpg`): paused, the canvas is 896x1996. Rotated while paused, it is
  1996x896 at once, and the game behind the menu is drawn, not stretched or blank. Resumed, it plays sideways, and a later step to q1
  resized cleanly to 1497x672.
- **Sideways to upright** (`pause-rotate-sideways-to-upright.jpg`): 1497x672 paused, 672x1497 rotated while paused, plays upright on
  resume.

No change needed.
