import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';
import {
  zoneState, idleTime, windPush, zoneEffect, sporeRecipes, windRecipes, zoneRecipes, pieceWidth, ZONE_RAMP, type Zone,
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
  for (const world of [3, 4]) {
    const first = zoneRecipes(world, 1);
    assert.equal(first.length, 1);
    assert.equal(first[0].shape, 'meadow', 'the first one has nothing to fall into');
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

test('every ordinary World 3 and 4 stage has its zones, and no other world has any', () => {
  for (const l of levels) {
    const s = generateStage(l);
    const want = (l.worldIndex === 3 || l.worldIndex === 4) && !['ascent', 'boss_lair'].includes(l.objectiveType) && !l.secret;
    if (want) {
      assert.ok((s.zones?.length ?? 0) >= zoneRecipes(l.worldIndex, l.miniIndex).length, `${l.id} is missing its zones`);
      const kind = l.worldIndex === 3 ? 'spore' : 'wind';
      assert.ok(s.zones!.every((z) => z.kind === kind), `${l.id}: wrong kind of zone for its world`);
    } else {
      assert.equal(s.zones?.length ?? 0, 0, `${l.id} should have no zones`);
    }
  }
});

test('every zone stage passes the validator (waitable, jumpable, nothing hostile inside)', () => {
  for (const l of levels) {
    if (l.worldIndex !== 3 && l.worldIndex !== 4) continue;
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
