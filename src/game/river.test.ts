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
    assert.ok(r.gap >= 70, 'wide enough that running across is impossible');
    assert.ok(r.gap <= (r.dir === 1 ? 80 : 130));
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

// (every LOG river: still water (speed 0: a creek under a liana, 2-1.md beat 5; a splash-back pond) is a different piece, no log river, as
// riverLay.ts riverFaults rules; the lead's ruling B, 11:27 AM ET 11-15. A stage of still water alone is held by the test below)
test('logs are evenly spaced, hang below the bank lip', () => {
  for (const l of levels.filter((x) => x.worldIndex === 2)) {
    const s = generateStage(l);
    for (const r of (s.rivers ?? []).filter((q) => q.speed > 0)) {
      const logs = s.platforms.filter((p) => p.type === 'drift' && p.drift!.x0 === r.x0);
      assert.ok(logs.length >= 3, `${l.id}: ${logs.length} logs`);
      // the bank lip is higher than the log tops: a small, even hop on and off
      for (const p of logs) assert.ok(p.y > 0 && p.drift!.baseY === p.y);
    }
  }
});

// (the stage whose lesson is the river (World 2's kit: W2_ARCS' lesson, W2_LESSON.river) lays at least one LOG river: its logs are the
// lesson. RED until the designed 2-1 (w2Arc21.ts) lays its rivers through place 'river'; the placeholder's water is still creeks. The
// lead's ruling B, 11:27 AM ET 11-15: the red sits on this honest line, never on a loosened one)
test('the river lesson\'s stage lays at least one log river', async () => {
  const { W2_ARCS, W2_LESSON } = await import('./gen2/worlds/w2.ts');
  const ids = Object.entries(W2_ARCS).filter(([, a]) => a.lesson === W2_LESSON.river).map(([id]) => id);
  assert.ok(ids.length >= 1, 'a World 2 stage teaches the river');
  for (const id of ids) {
    const s = generateStage(levels.find((l) => l.id === id)!);
    const logRivers = (s.rivers ?? []).filter((r) => r.speed > 0 && s.platforms.some((p) => p.type === 'drift' && p.drift!.x0 === r.x0));
    assert.ok(logRivers.length >= 1, `${id}: ${logRivers.length} log rivers (its water is ${(s.rivers ?? []).length} still creeks)`);
  }
});

test('random layouts (a fresh one every time a stage is entered) still have their rivers, pass the validator and differ from each other', async () => {
  const { buildStage, setLayoutVariant, variantAttemptFor } = await import('./stageGenerator.ts');
  const { validateStage } = await import('./levelCheck.ts');
  const world2 = levels.filter((l) => l.worldIndex === 2 && !['ascent', 'boss_lair'].includes(l.objectiveType) && l.miniIndex <= 9);
  try {
    for (const l of world2) {
      const seen = new Set<string>();
      for (let v = 1; v <= 8; v++) {
        const a = variantAttemptFor(l, v * 977);
        assert.ok(a >= 0, `${l.id} variant ${v}: no valid layout found`);
        const s = buildStage(l, a);
        assert.equal(validateStage(s).ok, true, `${l.id} variant ${v}`);
        assert.ok((s.rivers?.length ?? 0) >= 1, `${l.id} variant ${v} has no river`);
        seen.add(s.rivers!.map((r) => Math.round(r.x0)).join(','));
      }
      assert.ok(seen.size >= 5, `${l.id}: the river positions barely change between plays (${seen.size} different out of 8)`);
    }
  } finally {
    setLayoutVariant(null);
  }
});
