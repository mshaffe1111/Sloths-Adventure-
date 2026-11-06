// RUNS #27: what the game's camera shows, in world px, at clipcheck's two phone sizes (tools/perf/clipcheck.mjs:54-55: 412 x 915 upright,
// 915 x 412 sideways), read off the real engine (tools/validate/play.ts cameraOn: the engine's own applyZoom, engine.ts:1095-1117), after
// the intro dolly. Insets are taken off the CSS size first (clipcheck's: upright top 48 bottom 24; sideways bottom 21, left/right 48).
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { GameEngine } from '../../../src/game/engine.ts';
for (const id of ['1-1', '1-5', '1-3']) for (const s of ['normal', 'easy'] as const) {
  setDifficulty(s);
  const sim = new RealPlay(id, 1); const e = sim.e as any;
  const out: string[] = [];
  for (const [name, vw, vh, iw, ih] of [['upright', 412, 915, 0, 72], ['sideways', 915, 412, 96, 21]] as const) {
    e.updateCamera = (GameEngine.prototype as any).updateCamera.bind(e);
    e.canvas.getBoundingClientRect = () => ({ width: vw, height: vh, left: 0, top: 0 });
    e.resizeCanvas(); e.introT = 99; e.applyZoom();
    out.push(`${name} ${vw}x${vh} css: zoom ${e.zoom.toFixed(3)}, world view ${Math.round(e.camera.viewportWidth)} x ${Math.round(e.camera.viewportHeight)} px, minus insets ${Math.round((vw - iw) / e.zoom)} x ${Math.round((vh - ih) / e.zoom)}`);
  }
  console.log(`${id} ${s}: ${out.join(' | ')}`);
}
