import test from 'node:test';
import assert from 'node:assert/strict';
import { liftCycle, liftStop, liftY, type LiftInfo } from './lift.ts';

const L: LiftInfo = { top: 300, bottom: 560, speed: 100, wait: 1.5, phase: 0 };

test('the lift waits at the bottom, rides up, waits at the top, rides down, and comes round again', () => {
  assert.equal(liftY(L, 0), 560);
  assert.equal(liftStop(L, 1), -1);
  const mid = liftY(L, 1.5 + 1.3);
  assert.ok(mid > 300 && mid < 560, `${mid}`);
  assert.equal(liftY(L, 1.5 + 2.6 + 0.5), 300);
  assert.equal(liftStop(L, 1.5 + 2.6 + 0.5), 1);
  assert.equal(liftY(L, liftCycle(L)), 560);
  // never outside its two stops, and smooth (no jump bigger than its speed allows)
  let prev = liftY(L, 0);
  for (let t = 0; t < 30; t += 1 / 60) {
    const y = liftY(L, t);
    assert.ok(y >= 300 && y <= 560);
    assert.ok(Math.abs(y - prev) <= (L.speed * 1.6) / 60 + 1e-6, `t ${t.toFixed(2)}: ${prev} -> ${y}`);
    prev = y;
  }
});
