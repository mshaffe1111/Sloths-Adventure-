// A petal is drawn only as Meeca's petal (F12, 11-12): the petal picture loads on its first draw, and until it was in, drawCollectible
// fell through to a painted flower (a red passion flower in the 1-2 stills, inside the petal's gold rim), or to a vector hibiscus. Now a
// petal-stage flower draws nothing, rim included, until the petal is in. Under the test runner no picture ever loads, so this is that state.
//   npx tsx --test src/game/petalDraw.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { drawCollectible } from './vectorArt.ts';
import { pickupReady } from './pickupSprites.ts';
import type { Collectible } from './types.ts';

/** a canvas context that only counts what is drawn on it */
function counting() {
  let draws = 0;
  const ctx = new Proxy({}, {
    get(_t, k) {
      if (k === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
      if (k === 'canvas') return { width: 1000, height: 1000 };
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => ({ addColorStop() {} });
      if (typeof k === 'string' && /^(fill|stroke|drawImage|arc|ellipse|lineTo|bezierCurveTo|quadraticCurveTo|rect|fillRect)/.test(k)) return () => { draws++; };
      return () => {};
    },
    set() { return true; },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, draws: () => draws };
}
const flower = (id: number): Collectible => ({ id, type: 'flower', x: 300, y: 300, collected: false, bobPhase: 0 }) as Collectible;

test('a petal whose picture is not in draws nothing: no rim, no other flower in its place (1-2, World 1)', () => {
  assert.equal(pickupReady('petal'), false, 'no picture loads under the test runner');
  for (const [w, m] of [[1, 2], [1, 1], [3, 4]] as const) {
    const c = counting();
    drawCollectible(c.ctx, flower(2), 0, w, m);
    assert.equal(c.draws(), 0, `${w}-${m}: drew ${c.draws()} things for a petal with no picture`);
  }
});

test("World 8's harvest is not a petal stage: its night blooms still draw (as their stand-in until painted)", () => {
  const c = counting();
  drawCollectible(c.ctx, flower(2), 0, 8, 2);
  assert.ok(c.draws() > 0);
});
