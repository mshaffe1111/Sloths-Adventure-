// The painted rope's slicer (ropeArt.ts layRope) always finishes: a slice that ended a hair short of a tile's end made a step smaller
// than the float precision of the length laid so far, which then never moved on, and the frame hung (found 11-05 by engine-pieces: the
// slung log's ropes, 5.1 thick, froze the page as soon as they came on screen).
import test from 'node:test';
import assert from 'node:assert/strict';
import { layRope } from './ropeArt.ts';

function fakeCtx(limit: number) {
  let n = 0;
  let m = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  return {
    get draws() { return n; },
    canvas: { width: 4000, height: 4000 },
    getTransform: () => m,
    setTransform: (a: number | typeof m, b?: number, c?: number, d?: number, e?: number, f?: number) => { m = typeof a === 'number' ? { a, b: b!, c: c!, d: d!, e: e!, f: f! } : a; },
    drawImage: () => { if (++n > limit) throw new Error('the rope never finished laying'); },
  };
}

test('layRope finishes for every thickness and length (no slice under the float step)', () => {
  const im = {} as CanvasImageSource;
  let worst = 0;
  for (let thick = 3; thick <= 12; thick += 0.0731) {
    for (const [x0, y0, x1, y1] of [[100, 100, 100, 340], [9310.4, 214.3, 9283.9, 438.6], [5000.1, 200.7, 5233.3, 371.9], [12.5, 9.25, 300.125, 9.25]]) {
      const ctx = fakeCtx(5000);
      layRope(ctx as unknown as CanvasRenderingContext2D, im, [[x0, y0], [x1, y1], [x1 + thick, y1 - thick], [x1 + 2 * thick, y1 + thick]], thick);
      worst = Math.max(worst, ctx.draws);
    }
  }
  assert.ok(worst < 200, `at most ${worst} slices for a rope under 400 long`);
});
