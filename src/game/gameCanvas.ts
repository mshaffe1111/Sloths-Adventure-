/**
 * The game canvas's 2D context settings, in ONE place (GL0, 2026-11-12). A canvas keeps the settings of the FIRST getContext call, and
 * three places can be first: the stage preload on a menu (stagePreload.ts), the title card's warm-up (stageReady.ts) and the engine.
 * The per-layer timings (gpuProf.ts on the testers' link, the layer stick on the dev server) read pixels back, and Chrome moves a
 * canvas that is read back a few times off the GPU for good unless `willReadFrequently: false` was said outright at that first call.
 * With the setting only in the engine, a preload that got there first left the timings measuring a canvas that was no longer on the GPU.
 */
import { gpuProfOn } from './gpuProf.ts';
import { stickAsked } from './layerClock.ts';

export function gameCtxOpts(): CanvasRenderingContext2DSettings {
  return gpuProfOn() || stickAsked() ? { alpha: false, willReadFrequently: false } : { alpha: false };
}
