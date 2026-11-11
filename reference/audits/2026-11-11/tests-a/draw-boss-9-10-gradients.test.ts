/**
 * AUDIT 2026-11-11 (area A, draw slice) — proof test. FAILS today.
 *
 * What it proves: in 9-10 (the Ember Drake's lair) the engine hands the stage's trees to terrain.ts's old code-drawn tree painter
 * every frame (engine.ts render: `this.paintKit && protoArtReady() ? [] : this.currentStage.trees`; a boss lair never has the painted
 * kit, engine.ts `paintKit = ... && config.objectiveType !== 'boss_lair'`, and 'drake' is the one lair that does not own its scene,
 * lairArt.ts lairOwnsScene). The tree at the arena's left end is a palm, and a palm builds one gradient per leaflet per frame
 * (terrain.ts drawGameTree 'palm' -> artKit.ts drawFrond): about 235 createLinearGradient calls a frame, against the draw check's
 * limit of 2 (tools/perf/limits.json, PERFORMANCE-RULES §2.3). The draw check never plays a boss stage or World 9, so it cannot see it.
 *
 * Fixed looks like: the trees of a stage are baked once (or painted art), so a steady frame of 9-10 makes no more gradients than
 * limits.json allows.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { renderWorldObjects } from '../../../../src/game/terrain.ts';
import { lairOwnsScene } from '../../../../src/game/lairArt.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const limits = JSON.parse(fs.readFileSync(path.join(here, '..', '..', '..', '..', 'tools', 'perf', 'limits.json'), 'utf8'));

/** a canvas context stand-in that counts the gradients made on it */
function countingCtx() {
  let gradients = 0;
  const state: Record<string, unknown> = { globalAlpha: 1 };
  const grad = { addColorStop() {} };
  const ctx = new Proxy({}, {
    get(_t, k: string) {
      if (k in state) return state[k];
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => { gradients++; return grad; };
      if (k === 'getTransform') return () => ({ a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 });
      if (k === 'measureText') return () => ({ width: 10 });
      return () => undefined;
    },
    set(_t, k: string, v) { state[k] = v; return true; },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, count: () => gradients };
}

test('9-10: a steady frame of the fight makes no more gradients than the draw check allows', () => {
  const e = new RealPlay('9-10', 1).e;
  // the branch engine.ts render takes on this stage: no painted kit, and the lair does not paint the scene itself
  assert.equal(e.paintKit, false, 'a boss lair has no painted kit');
  const lair = e.bossDef?.lair;
  assert.ok(lair && !lairOwnsScene(lair), `the lair (${lair}) leaves the trees to terrain.ts`);
  // the camera the fight opens on (the engine's own), and the trees the engine passes: currentStage.trees
  const cam = e.camera;
  const trees = e.currentStage.trees;
  // (the first frame may make gradients that are then kept: judge the second)
  renderWorldObjects(countingCtx().ctx, 9, [], [], trees, cam, 1.0);
  const c = countingCtx();
  renderWorldObjects(c.ctx, 9, [], [], trees, cam, 1.0 + 1 / 30);
  assert.ok(c.count() <= limits.limits.gradients.max, `the trees alone made ${c.count()} gradients in one frame (limit ${limits.limits.gradients.max})`);
});
