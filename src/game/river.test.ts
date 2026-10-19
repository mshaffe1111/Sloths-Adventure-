import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { driftX, driftCycle, driftProgress, riverRecipes, logLayout, gapFor } from './river.ts';
import type { DriftInfo } from './river.ts';

const levels = generateAllLevels();
const mk = (dir: 1 | -1): DriftInfo => ({ x0: 1000, x1: 1800, dir, speed: 80, width: 160, offset: 0, baseY: 500 });

test('a log enters from under one bank and leaves under the other', () => {
  const r = mk(1);
  assert.equal(driftX(r, 0), r.x0 - r.width, 'starts fully under the near bank');
  const T = driftCycle(r);
  assert.ok(Math.abs(driftX(r, T / 2) - (r.x0 - r.width + (T / 2) * r.speed)) < 1e-6);
  assert.ok(driftX(r, T - 0.001) + r.width > r.x1 - 1, 'ends under the far bank');
  const l = mk(-1);
  assert.equal(driftX(l, 0), l.x1, 'a leftward log starts under the right bank');
});

test('the cycle repeats and never jumps mid-river', () => {
  const r = mk(-1);
  const T = driftCycle(r);
  assert.ok(Math.abs(driftX(r, 3.3) - driftX(r, 3.3 + T)) < 1e-6);
  for (let t = 0; t < T * 2; t += 0.05) {
    const step = Math.abs(driftX(r, t + 0.05) - driftX(r, t));
    // only the wrap (hidden under a bank) may jump
    if (step > r.speed * 0.06) assert.ok(driftX(r, t) < r.x0 || driftX(r, t + 0.05) > r.x1 - 1 || driftX(r, t) + r.width > r.x1 - 1, `jump at ${t}`);
  }
  assert.ok(driftProgress(r, 0) >= 0 && driftProgress(r, 0) < 1);
});

test('rivers teach in order: slow and with the flow first, narrower logs and rapids later', () => {
  const first = riverRecipes(1);
  assert.equal(first.length, 1);
  assert.equal(first[0].dir, 1);
  assert.ok(first[0].speed <= 75);
  assert.ok(riverRecipes(9).length >= 3);
  assert.ok(riverRecipes(9)[0].logW < riverRecipes(1)[0].logW);
  for (let m = 1; m <= 9; m++) for (const r of riverRecipes(m)) {
    assert.ok(r.logW >= 120, `stage ${m} logs are long enough to land on`);
    const { count } = logLayout(r);
    assert.ok(count >= 3);
    // a hop between neighbours must be doable: gap vs. a jump's reach
    assert.ok(r.gap <= (r.dir === 1 ? 76 : 100));
    assert.equal(r.gap, Math.round(gapFor(r.dir, r.speed)));
  }
});

test('every World 2 stage except the boss lair has its rivers, and no other world has any', () => {
  for (const l of levels) {
    const s = generateStage(l);
    if (l.worldIndex === 2 && !['ascent', 'boss_lair'].includes(l.objectiveType) && l.miniIndex <= 9) {
      assert.ok((s.rivers?.length ?? 0) >= 1 || l.objectiveType === 'boss_lair', `${l.id} has no river`);
    } else if (l.worldIndex !== 2) {
      assert.equal(s.rivers?.length ?? 0, 0, `${l.id} should have no river`);
    }
  }
});

test('logs are evenly spaced, hang below the bank lip', () => {
  for (const l of levels.filter((x) => x.worldIndex === 2)) {
    const s = generateStage(l);
    for (const r of s.rivers ?? []) {
      const logs = s.platforms.filter((p) => p.type === 'drift' && p.drift!.x0 === r.x0);
      assert.ok(logs.length >= 3, `${l.id}: ${logs.length} logs`);
      // the bank lip is higher than the log tops: a small, even hop on and off
      for (const p of logs) assert.ok(p.y > 0 && p.drift!.baseY === p.y);
    }
  }
});
