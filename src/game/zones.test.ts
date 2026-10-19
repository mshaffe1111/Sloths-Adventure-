import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';
import {
  zoneState, idleTime, windPush, zoneEffect, columnHit, isDamaging, sporeRecipes, windRecipes, zoneRecipes, pieceWidth, ZONE_RAMP, type Zone,
} from './zones.ts';

const levels = generateAllLevels();
const mk = (over: Partial<Zone> = {}): Zone => ({
  kind: 'wind', x0: 1000, x1: 1400, top: 300, bottom: 600, baseY: 560, dir: 1, period: 6, warn: 1, active: 2, offset: 0, force: 120, ...over,
});

test('a zone cycles idle, warn, active, then starts over', () => {
  const z = mk();
  assert.equal(idleTime(z), 3);
  assert.equal(zoneState(z, 0).phase, 'idle');
  assert.equal(zoneState(z, 2.99).phase, 'idle');
  assert.equal(zoneState(z, 3.2).phase, 'warn');
  assert.equal(zoneState(z, 4.5).phase, 'active');
  assert.equal(zoneState(z, 6.01).phase, 'idle');
  assert.equal(zoneState(z, 4.5 + 600).phase, 'active', 'the rhythm never drifts');
});

test('the effect ramps in and out so it never snaps on', () => {
  const z = mk();
  assert.equal(zoneState(z, 3.5).strength, 0, 'no effect during the warning');
  const s0 = zoneState(z, 4.0).strength;
  assert.ok(s0 < 0.05, 'starts at nothing');
  assert.ok(zoneState(z, 4.0 + ZONE_RAMP).strength > 0.99);
  assert.ok(zoneState(z, 4.0 + 2 - 0.01).strength < 0.05, 'fades before it ends');
  assert.equal(zoneState(z, 5.0).strength, 1);
});

test('the offset staggers neighbours', () => {
  const a = mk({ offset: 0 });
  const b = mk({ offset: 2.2 });
  assert.notEqual(zoneState(a, 1).phase, zoneState(b, 1).phase);
});

test('wind pushes by direction and force, less on the ground, and only inside the lane', () => {
  const r = mk({ dir: 1 });
  const l = mk({ dir: -1 });
  const t = 5.0; // fully active
  assert.equal(windPush([r], 1200, 400, t, false), 120);
  assert.equal(windPush([l], 1200, 400, t, false), -120);
  assert.ok(Math.abs(windPush([r], 1200, 400, t, true)) < 120 * 0.5);
  assert.equal(windPush([r], 900, 400, t, false), 0, 'outside the lane');
  assert.equal(windPush([r], 1200, 100, t, false), 0, 'above the lane');
  assert.equal(windPush([r], 1200, 400, 0.5, false), 0, 'idle');
  assert.equal(zoneEffect([r], 'spore', 1200, 400, t).strength, 0, 'wind is not a cloud');
});

test('stages teach in order: first a harmless zone on open ground, then gaps, then more of them', () => {
  for (const world of [3, 4, 9, 10]) {
    const first = zoneRecipes(world, 1);
    assert.equal(first.length, 1);
    assert.equal(first[0].shape, world >= 9 ? 'columns' : 'meadow', 'the first one has nothing to fall into');
    if (world >= 9) assert.equal(first[0].count, 1, 'a single vent or rod to watch first');
    if (world === 4) assert.equal(first[0].dir, 1, 'and the first gust helps');
    assert.ok(zoneRecipes(world, 9).length >= 3);
    for (let m = 1; m <= 9; m++) for (const p of zoneRecipes(world, m)) {
      assert.ok(p.period - p.warn - p.active >= 2, `world ${world} stage ${m}: quiet spell of at least 2s`);
      assert.ok(p.warn >= 0.9);
      assert.ok(pieceWidth(p) > 0);
    }
  }
  assert.ok(sporeRecipes(2).some((p) => p.shape === 'gap'));
  assert.ok(sporeRecipes(5).some((p) => p.shape === 'stones'));
  assert.ok(windRecipes(4).some((p) => p.dir === -1), 'headwinds arrive by stage 4');
});

test('every ordinary World 3, 4, 9 and 10 stage has its zones, and no other world has any', () => {
  for (const l of levels) {
    const s = generateStage(l);
    const want = [3, 4, 9, 10].includes(l.worldIndex) && !['ascent', 'boss_lair'].includes(l.objectiveType) && !l.secret;
    if (want) {
      assert.ok((s.zones?.length ?? 0) >= zoneRecipes(l.worldIndex, l.miniIndex).length, `${l.id} is missing its zones`);
      const kind = { 3: 'spore', 4: 'wind', 9: 'geyser', 10: 'bolt' }[l.worldIndex as 3 | 4 | 9 | 10];
      assert.ok(s.zones!.every((z) => z.kind === kind), `${l.id}: wrong kind of zone for its world`);
    } else {
      assert.equal(s.zones?.length ?? 0, 0, `${l.id} should have no zones`);
    }
  }
});

test('every zone stage passes the validator (waitable, jumpable, nothing hostile inside)', () => {
  for (const l of levels) {
    if (![3, 4, 9, 10].includes(l.worldIndex)) continue;
    const s = generateStage(l);
    const r = validateStage(s);
    assert.ok(r.ok, `${l.id}: ${r.errors.slice(0, 3).join('; ')}`);
  }
});

test('the validator rejects a zone that cannot be waited out', () => {
  const l = levels.find((x) => x.id === '4-5')!;
  const s = generateStage(l);
  s.zones![0] = { ...s.zones![0], period: s.zones![0].warn + s.zones![0].active + 1.0 };
  assert.ok(validateStage(s).errors.some((e) => /quiet between bursts/.test(e)));
});

test('a firing column burns what stands in it, and only while it is firing', () => {
  const z = mk({ kind: 'geyser', x0: 1000, x1: 1072, top: 300, bottom: 600, period: 5, warn: 1.2, active: 0.9 });
  assert.ok(isDamaging(z));
  assert.ok(!isDamaging(mk()), 'wind does not burn');
  const idle = idleTime(z);
  assert.equal(columnHit([z], 1020, 520, 28, 64, idle * 0.5), null, 'quiet');
  assert.equal(columnHit([z], 1020, 520, 28, 64, idle + 0.6), null, 'during the warning it is still safe');
  assert.equal(columnHit([z], 1020, 520, 28, 64, idle + z.warn + 0.45), z, 'firing');
  assert.equal(columnHit([z], 1200, 520, 28, 64, idle + z.warn + 0.45), null, 'a step to the side is safe');
  assert.equal(columnHit([z], 1020, 100, 28, 64, idle + z.warn + 0.45), null, 'above the column');
});

test('a bolt is quick but always has a long warning, and every column has a pocket beside it', () => {
  for (const l of levels) {
    if (l.worldIndex !== 9 && l.worldIndex !== 10) continue;
    const s = generateStage(l);
    const cols = (s.zones ?? []).filter(isDamaging).sort((a, b) => a.x0 - b.x0);
    for (const z of cols) {
      assert.ok(z.warn >= 1.1, `${l.id}: warning`);
      assert.ok(idleTime(z) >= 2, `${l.id}: quiet spell`);
    }
    for (let i = 1; i < cols.length; i++) {
      const gap = cols[i].x0 - cols[i - 1].x1;
      assert.ok(gap >= 110 || Math.abs(cols[i].baseY - cols[i - 1].baseY) > 40, `${l.id}: ${gap}px between columns`);
    }
  }
});
