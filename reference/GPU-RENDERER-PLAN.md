# Moving the game's drawing to the GPU (PixiJS on WebGL)

Decided by Matt, 2026-10-30, ~10:00 AM ET: finish the 1 PM bake-once fixes, then move the drawing to a GPU renderer, the way today's best 2D game teams draw. This plan is for Matt to approve before anyone starts.

## Why

- **Today:** one Canvas 2D. Every frame repaints shapes, gradients, cut-outs and hundreds of separate pictures, one call at a time: 143 files, ~73,000 lines and ~7,000 hand-written draw calls. Each new feature makes phones slower, and a cheap phone (Matt's 2020 OnePlus, Adreno 619, 4 GB) can't keep up.
- **The modern way:** every picture is a texture on the graphics chip. Each frame the engine sends the whole scene in a few batched draw calls (sprites sharing a texture are drawn together), and effects are baked textures or small GPU shaders. PixiJS (v8, WebGL 2) is the standard engine for this on the web, and it's what Capacitor apps use.

## What changes and what doesn't

- **Changes:** the layer that puts pictures on the screen (`engine.ts` render, `scenery.ts`, the painters' per-frame drawing).
- **Doesn't change:**
  - game logic, physics, controls, levels, the generator, story, sound, saves;
  - the art files: every sheet is used as it is, as a texture;
  - the DOM screens (menus, Dot's bubble, cards).

## How: in stages, each proven on Matt's three phones

Every stage ends with:
- the same look, as side-by-side screenshots in every world, upright and sideways;
- the gate;
- the automatic performance check (PERFORMANCE-RULES §8);
- control-test numbers on the Pixel, the Samsung and the OnePlus.

Nothing half-done goes to `main` (new replaces old). The game ships only once a stage passes.

| Stage | What moves to the GPU | Builds on | Estimate |
|---|---|---|---|
| 0 | Set-up: PixiJS v8 (pinned), one WebGL canvas under the existing 2D canvas, the camera and the 30 fps loop driving both, context-loss handling, WebGL 2 only (never WebGPU on PowerVR) | | ½ day |
| 1 | Backdrops and skies: each parallax layer becomes a tiling sprite | PERF-A's baked skies | ½ day |
| 2 | The ground: today's baked squares become textures | the lead's ground squares | ½ day |
| 3 | Creatures and Pokey: the clip sheets, already shrunk to drawn size, become atlas textures, with the hurt flash as a tint shader | creatureAnim.ts bakes | 1 day |
| 4 | Props, plants, dress, petals and particles: one texture per sheet, batched | PERF-F's sprite work | 1 day |
| 5 | What's left on the 2D canvas (warnings, the HUD in the canvas, a few vector effects) is measured; anything costly moves or gets baked, the rest stays on the thin 2D layer above | | ½-1 day |
| 6 | The APK: WebView pinned to 60 Hz while playing, a 15-minute heat run on each phone | | ½ day |

**Total: about 3 to 5 working days with helpers working in parallel.** Stages 1, 2 and 4 can run side by side once stage 0 is in.

## Design change, 2026-11-04 (stage 1, measured): GPU underneath, copied in

The table above puts the WebGL canvas UNDER the 2D canvas and makes the 2D canvas see-through where layers moved. Measured before stage
1 was built, that fails the look bar. The world layer draws many effects that blend with what is beneath them:
- `lighter` glows: foxfire logs (W8), glow dots (W3, W9), weather (W3, W6, W8, W9), Meeca's glows (5-M), fx particles (W9, W10);
- `screen` and `lighter`: World 5's light;
- `multiply`: 5-M's full-screen night grade.

Over a see-through 2D canvas they blend with nothing, then get laid over the GPU sky: every glow darkens the sky under it, and 5-M's
night grade paints a dark layer instead of multiplying.

**So each stage renders its layers into the hidden WebGL canvas, and the 2D canvas, still opaque, copies it in with ONE drawImage**, at
the point in the frame where it used to paint those layers. Everything after the copy blends with real pixels, exactly as before. The
layers that move must stay contiguous from the bottom (backdrop, then ground, ...). At the end, when everything is on Pixi, the 2D
canvas and the copy go, and the glows become Pixi ADD/MULTIPLY blends inside one GPU scene.

**The copy is GPU-to-GPU only while the 2D canvas is on the GPU.** A software 2D canvas (old phones, a fallback, this headless
container: `2d_canvas: unavailable_software`) reads the GL pixels back on every copy, measured at 119-126 ms here. The copy is timed on
3 frames under the title card. A median over 2 ms sends the backdrop back to the 2D canvas for the session, before play.

**Owed before release: the phone check.** The saving can't be measured in this container. The Pixel, the Samsung and the OnePlus run
the control test with the test link, once as is and once with `?gpuback=0` (the 2D backdrop). The frame-time readout's notes say
`backdrop: GPU, copy X ms` or why it is 2D. Nothing merges to main until the GPU backdrop is no slower on all three.

## The measured release, 2026-11-04: testers only, with a fixed end

Matt approved it (~12:05 PM ET): "a testers-only switch". The test-link page can't send runs to the testers' sheet. Matt's six runs
that morning were all live 0.9.4 (build stamp 68b31e66), with no GPU code. So stages 0 and 1 go to the live site switched off for
players, and Matt's phones send real numbers both ways through the testers' link.

- **The switch:** `gpuBackdropOn()` in `src/game/gpuLayer.ts` is `qaBuild() || ctestEnabled()`.
  - On the live site it is on only with `#ctest` in the address (the testers' link).
  - In the Play Store app it is always off (`ctestEnabled` is false there).
  - `mountGpuLayer` checks it first.
- **Off for every player:**
  - no WebGL context;
  - no Pixi download: its four chunks are left out of the service worker's precache (vite.config.ts `globIgnores`);
  - no uploads;
  - the backdrop drawn on the 2D canvas exactly as 0.9.4 draws it.
- **On the testers' link:**
  - the backdrop readout goes to the sheet (the `backdrop` event: path, copy ms, ready ms);
  - `#ctest&gpuback=0` gives the 2D pair on the same build.
- **Proof:**
  - the full gate;
  - `gpuLayer.test.ts` (the switch);
  - `tools/qa/gpuDefaultOff.cjs` on a production build: a player gets no WebGL, no Pixi and no precache entry; the testers' link starts
    it and sends the line;
  - the 0 px look on the default path;
  - firstframes no worse than 0.9.4.
- **The fixed end. The switch is deleted the day the phone numbers decide.** Either:
  - the GPU backdrop goes to everyone: the switch, the `globIgnores` and the 2D strip route go; or
  - stages 0 and 1 come out of main.

  It never outlives that decision (CLAUDE.md: new replaces old, no on/off switches; this is the one exception Matt made).
- **The question that decides it:** on each phone, the `#ctest` runs against the `#ctest&gpuback=0` runs. That means stalls over 100 ms,
  the worst stretches, the `ready` time, and Matt's word on the start. The OnePlus (Adreno 619, 4 GB) matters most. On 0.9.4 it had 33
  stalls in two runs, about 25 of them the game's own draw (150-460 ms).

## Risks and how they're handled

- **Layer order:** the scene interleaves ground, decor, enemies, Pokey and front leaves. During the move, each GPU stage owns whole layers (backdrop, then ground, then actors) so the order never splits mid-layer, and the 2D canvas carries only what's on top.
- **Look:** each stage is compared pixel by pixel; Matt sees the sheets before it ships.
- **Old phones without WebGL 2:** very rare in 2026; they keep the 2D path until the move is finished, then a minimal fallback.
- **Memory:** textures are budgeted per world (§2.13); a world's textures are released when play leaves it.

## Before stage 0

The 1 PM fixes are merged and measured, and the automatic performance check is in, so every stage is measured the same way.
