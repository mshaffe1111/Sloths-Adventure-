import { test } from 'node:test';
import assert from 'node:assert/strict';
import { devScale, snapDev, stripTop, STRIP_FIT } from './scenery.ts';

const ctxWith = (a: number) => ({ getTransform: () => ({ a, b: 0 }) }) as unknown as CanvasRenderingContext2D;

test('the backdrop layers are placed on whole device pixels (AN-4)', () => {
  assert.equal(devScale(ctxWith(3)), 3);
  assert.equal(devScale({} as CanvasRenderingContext2D), 1, 'a context without getTransform counts one pixel a unit');
  for (const v of [0.1, 12.34, -7.77, 1000.49]) {
    const k = 2.6;
    const x = snapDev(v, k);
    assert.ok(Math.abs(x * k - Math.round(x * k)) < 1e-9, `${v} lands on a device pixel`);
    assert.ok(Math.abs(x - v) <= 0.5 / k + 1e-9, `${v} moves at most half a device pixel`);
  }
});

test('the far layer moves every frame at a run, instead of standing still then jumping (AN-4)', () => {
  // 200 units/s at 30 fps, the far strip's parallax 0.05, a dpr 3 phone at zoom 1
  const k = 3, par = 0.05;
  let still = 0, worstJump = 0;
  let prev = snapDev(-(0 * par), k);
  for (let f = 1; f <= 60; f++) {
    const x = snapDev(-((f * 200) / 30) * par, k);
    const d = Math.abs(x - prev) * k;
    if (d === 0) still++;
    worstJump = Math.max(worstJump, d);
    prev = x;
  }
  assert.equal(still, 0, 'never still for a frame');
  assert.ok(worstJump <= 2, `the biggest step is ${worstJump} device pixels`);
});

test('upright, the painted strips are drawn at the size sideways uses, on the same ground line, with room above for their sky (Matt 2026-10-29)', () => {
  // a 390x844 phone upright: the engine passes the sideways height for the same width of world (WORLD_VIEW_H 540 over PORTRAIT_VIEW_W 440)
  const vh = 844, stripVh = (540 * 390) / 440;
  const H = 720; // scenery.ts design height
  const old = vh / H, now = stripVh / H;
  assert.ok(now / old < 0.6, 'no longer drawn about twice as close as sideways');
  for (const part of ['far', 'mid', 'near'] as const) {
    const a = stripTop(part, vh, old), b = stripTop(part, vh, now);
    // the strip's land (row a) stays at the same height on screen: the trees stand where they stood, on the floor Pokey runs on
    const f = STRIP_FIT[part];
    assert.ok(Math.abs(a.top + f.a * a.dh - (b.top + f.a * b.dh)) < 1e-6, `${part} keeps its ground line`);
  }
  // the far strip's top comes down into view: that is the room its painted sky fills
  assert.ok(stripTop('far', vh, now).top > 0);
  // sideways nothing changes: the strip height is the view height
  assert.deepEqual(stripTop('mid', 390, 390 / H), stripTop('mid', 390, Math.min(390, 390) / H));
});
