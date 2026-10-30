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
