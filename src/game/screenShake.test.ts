import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shakeOffset } from './screenShake.ts';

test('no trauma, no shake; the setting off, no shake', () => {
  assert.deepEqual(shakeOffset(0, 1.234), { x: 0, y: 0 });
  assert.deepEqual(shakeOffset(1, 1.234, 16, 0), { x: 0, y: 0 });
});

test('the shake stays inside its size and grows with trauma squared', () => {
  let big = 0;
  let small = 0;
  for (let t = 0; t < 3; t += 1 / 30) {
    const a = shakeOffset(1, t, 16, 1);
    const b = shakeOffset(0.5, t, 16, 1);
    assert.ok(Math.abs(a.x) <= 8.001 && Math.abs(a.y) <= 8.001);
    big = Math.max(big, Math.abs(a.x));
    small = Math.max(small, Math.abs(b.x));
  }
  assert.ok(big > 5, 'a full shake is felt');
  assert.ok(Math.abs(small / big - 0.25) < 0.05, 'half the trauma, a quarter of the shake');
});

test('smooth at 30 fps: from one frame to the next it moves a little, never a jump across its whole size (AN-10: no jitter)', () => {
  let worst = 0;
  for (let t = 0; t < 5; t += 1 / 30) {
    const a = shakeOffset(1, t, 16, 1);
    const b = shakeOffset(1, t + 1 / 30, 16, 1);
    worst = Math.max(worst, Math.hypot(b.x - a.x, b.y - a.y));
  }
  // (random jitter jumped up to the whole 16 across every frame)
  assert.ok(worst < 9, `worst step ${worst.toFixed(1)}`);
});

test('gentle is about a third of full', () => {
  const f = shakeOffset(1, 0.4, 16, 1).x;
  const g = shakeOffset(1, 0.4, 16, 0.35).x;
  assert.ok(Math.abs(g / f - 0.35) < 1e-9);
});
