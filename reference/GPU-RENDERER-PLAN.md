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

## Risks and how they're handled

- **Layer order:** the scene interleaves ground, decor, enemies, Pokey and front leaves. During the move, each GPU stage owns whole layers (backdrop, then ground, then actors) so the order never splits mid-layer, and the 2D canvas carries only what's on top.
- **Look:** each stage is compared pixel by pixel; Matt sees the sheets before it ships.
- **Old phones without WebGL 2:** very rare in 2026; they keep the 2D path until the move is finished, then a minimal fallback.
- **Memory:** textures are budgeted per world (§2.13); a world's textures are released when play leaves it.

## Before stage 0

The 1 PM fixes are merged and measured, and the automatic performance check is in, so every stage is measured the same way.


## Addendum 2026-11-07 (from the lead's notes; Matt's 60-for-30 ruling)
### The GPU move (PixiJS on WebGL 2) and the 60 fps budget (Matt, 11-06 evening)
Matt: "we should build for 60 frames, even if we're only going to run at 30 frames. That way, we're always going to meet our goals,
regardless of the phone we test."
- The lead agrees, with this reasoning: the loop stays locked at 30 fps, but the frame work must fit a 60 fps frame (16.7 ms all in).
  So a phone half as fast still holds 30. The budget becomes our update plus draw at 8 ms or less on a mid-range phone at q0 (it was
  12 ms), and 30 fps held on Matt's 2020 OnePlus. That's a rule change in PERFORMANCE-RULES §1 and tools/perf/limits.json, with a
  planted test.
- Where it stands: stage 0 (PixiJS v8 plus one WebGL canvas) was finished on warmup-5m (65b6c33a, 11-04) but NEVER reached main (main has
  no pixi). Stages 1-6 haven't started. So the live game is still 100% Canvas 2D.
- Plan: next week, its own lane, alongside the 1-1 fixes. The GPU work touches the render layer, the 1-1 work touches the generator,
  so they don't share files.
  - First port stage 0 onto main, measured on the three phones.
  - Then the stages in order: skies, ground, creatures and Pokey, props and particles, measure the rest, then the APK at 60 Hz.
  - About 3-5 working days (GPU-RENDERER-PLAN.md).
- Baseline to beat (Matt's Pixel, 11-06): upright 29.9 fps (worst frame 58 ms, 2 dips), sideways 29.8 fps (worst 96 ms, 5 dips).
  Same pixel count both ways, so sideways hitches come from what's drawn, not from size.

- Canvas sizing audit (Matt's question, 11-06 ~10:45 PM; engine.ts renderDpr and resizeCanvas, lines 1024-1067):
  - The buffer IS sized from the live CSS box times a ratio on every resize, both ways, with no fixed 720/1080 height.
  - BUT the ratio is capped: q0 2.0, q1 1.5, q2 1.0 (renderDpr). Matt's Pixel (dpr 3.06) draws 878x1825, so the compositor stretches it
    1.5x. The OnePlus and adult tester A's iPhone sit at q2 = 1.0x much of the time, so the compositor stretches them about 3x (soft picture).
  - Raising the cap on Canvas 2D costs fill rate: 3x instead of 2x is 2.25x the pixels, so the frame rate gets worse. Not a free fix.
  - On WebGL the fill is cheap: after the port, raise q0 to native dpr (up to 3) on phones that hold 30. The GPU plan's stage 5 measures
    it. Matt's bar: no compositor stretch on phones that can take it.
