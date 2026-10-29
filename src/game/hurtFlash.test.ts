import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { deviceBox, withHurtFlash } from './hurtFlash.ts';

test('the flash patch: a world box under the camera transform, in device pixels, clamped to the canvas', () => {
  // (camera: 2x, scrolled 100 px)
  const m = { a: 2, b: 0, c: 0, d: 2, e: -100, f: 0 };
  assert.deepEqual(deviceBox(m, 100, 50, 40, 30, 1000, 600), { x: 100, y: 100, w: 80, h: 60 });
  // mirrored (a creature facing left) still gives a positive box
  assert.deepEqual(deviceBox({ a: -1, b: 0, c: 0, d: 1, e: 500, f: 0 }, 0, 0, 100, 10, 1000, 600), { x: 400, y: 0, w: 100, h: 10 });
  // off the canvas: nothing to draw
  assert.equal(deviceBox(m, 2000, 0, 10, 10, 1000, 600).w, 0);
});

test('not hit: drawn straight onto the scene, no layer', () => {
  let got: unknown = null;
  const ctx = {} as CanvasRenderingContext2D;
  withHurtFlash(ctx, false, 0, 0, 10, 10, (c) => (got = c));
  assert.equal(got, ctx);
});

test('no canvas brightness filter left for the hurt flash (AN-6)', () => {
  const dir = path.resolve(import.meta.dirname);
  const bad = fs.readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== 'hurtFlash.ts').filter((f) => /(hitFlashTimer > 0|hit|flash)\)? ?ctx\.filter = 'brightness/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
  assert.deepEqual(bad, []);
});
