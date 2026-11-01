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
Easy and Normal). `tools/qa/meecaVisible.cjs` results are below.

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
- **Named, not fixed:** with her no longer covering it, the pale wooden post at the foot of room 5's bank face shows its full height
  (`room5-upright-zoom.jpg`, right of her). It is the stage's existing art, and it reads as a post at the wall's foot, but it is lighter
  than the dirt around it. Matt may want to look at it.
- **First frames:** the table above. No frozen first frame on 1-1 or 8-1. The start can be up to 0.4 s later, behind the title card.
