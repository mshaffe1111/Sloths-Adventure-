import test from 'node:test';
import assert from 'node:assert/strict';
import { bossMotion, type MotionInput } from './bossMotion.ts';

const base: MotionInput = { state: 'idle', t: 0, tell: 0, act: 0, pose: null, phase: 1, time: 0, moving: false, hit: 0 };

test('an idle boss breathes about 1: never more than 3% off', () => {
  for (let t = 0; t < 10; t += 0.1) {
    const m = bossMotion({ ...base, time: t });
    assert.ok(Math.abs(m.sy - 1) <= 0.03 && Math.abs(m.sx - 1) <= 0.02, `t=${t}`);
  }
});

test('a wind-up crouches more the longer it runs, and trembles at the end', () => {
  const at = (t: number) => bossMotion({ ...base, state: 'tell', tell: 1, t, time: 0.37 });
  assert.ok(at(0.9).sy < at(0.3).sy && at(0.3).sy < 1);
  assert.ok(at(0.9).rot < 0 && at(0.9).sx > 1);
});

test('an attack starts stretched along its facing and settles back', () => {
  const at = (t: number) => bossMotion({ ...base, state: 'act', act: 1, pose: 'lunge', t });
  assert.ok(at(0).sx > 1.1 && at(0).sy < 1);
  assert.equal(at(0.8).sx, 1);
  const slam = bossMotion({ ...base, state: 'act', act: 1, pose: 'slam', t: 0 });
  assert.ok(slam.sy > 1.05);
});

test('a hit shoves the boss back for a moment only', () => {
  const calm = bossMotion(base);
  const hit = bossMotion({ ...base, hit: 0.15 });
  assert.ok(hit.dx < calm.dx - 3);
  assert.deepEqual(bossMotion({ ...base, hit: 0 }), calm);
});

test('a stunned boss wobbles, a dead one is still', () => {
  const swing = (st: MotionInput['state'], t: number) => Math.max(...Array.from({ length: 60 }, (_, k) => Math.abs(bossMotion({ ...base, state: st, t, time: k * 0.05 }).rot)));
  assert.ok(swing('stun', 1) > 0.04);
  assert.ok(Math.abs(bossMotion({ ...base, state: 'dying', t: 1, time: 5 }).rot) < 1e-9);
});

test('phase 2 breathes faster than phase 1', () => {
  const zero = (phase: number) => {
    let n = 0, prev = bossMotion({ ...base, phase, time: 0 }).sy - 1;
    for (let k = 1; k < 400; k++) { const v = bossMotion({ ...base, phase, time: k * 0.025 }).sy - 1; if (prev < 0 !== v < 0) n++; prev = v; }
    return n;
  };
  assert.ok(zero(2) > zero(1));
});
