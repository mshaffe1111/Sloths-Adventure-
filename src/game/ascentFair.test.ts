import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant, buildStage } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';
import type { GeneratedStage } from './stageGenerator.ts';

// The engine keeps the hero inside [20, W - 20]. An ascent used to grow sideways without looking at the world's edge: in a few layouts
// of the 7th world onwards a platform or the climbing tree stood beyond it and the only way up was cut off.

const ascents = generateAllLevels().filter((l) => l.objectiveType === 'ascent');

function insideStrip(s: GeneratedStage): string[] {
  const W = s.config.levelWidth;
  const bad: string[] = [];
  for (const p of s.platforms) {
    if (p.width >= W) continue; // the floor runs the whole width
    if (p.x < 20 || p.x + p.width > W - 20) bad.push(`platform ${p.id} spans ${Math.round(p.x)}..${Math.round(p.x + p.width)} of ${W}`);
  }
  for (const v of s.vines) if (v.x < 20 || v.x > W - 20) bad.push(`vine ${v.id} at ${Math.round(v.x)}`);
  for (const t of s.trees) if (t.x < 20 || t.x > W - 20) bad.push(`tree ${t.id} at ${Math.round(t.x)}`);
  for (const c of s.collectibles) if (c.x < 20 || c.x > W - 20) bad.push(`${c.type} ${c.id} at ${Math.round(c.x)}`);
  for (const e of s.enemies) if (e.patrolMinX < 20 || e.patrolMaxX > W - 20) bad.push(`enemy ${e.id} patrols ${Math.round(e.patrolMinX)}..${Math.round(e.patrolMaxX)}`);
  return bad;
}

test('every ascent layout the generator builds keeps all of it inside the strip the hero can walk', () => {
  const failures: string[] = [];
  for (const l of ascents) {
    for (let v = 1; v <= 60; v++) {
      const s = buildStage(l, 1000 + (v * 24593 + l.worldIndex) * 31);
      const out = insideStrip(s);
      if (out.length) failures.push(`${l.id} attempt ${v}: ${out.slice(0, 2).join('; ')}`);
    }
  }
  assert.deepEqual(failures, []);
});

test('the ascent a player is given (a random layout, checked) can be climbed', () => {
  const failures: string[] = [];
  for (const l of ascents) {
    for (let v = 1; v <= 6; v++) {
      setLayoutVariant(v * 24593 + l.worldIndex);
      const s = generateStage(l);
      const res = validateStage(s);
      if (!res.ok) failures.push(`${l.id} variant ${v * 24593 + l.worldIndex}: ${res.errors.slice(0, 2).join('; ')}`);
    }
  }
  setLayoutVariant(null);
  assert.deepEqual(failures, []);
});

test('the layouts that used to have no way up are fixed (same seeds as the audit: 7-4/787875, 8-4/633784, 9-4/206527, 10-4/652245, 10-4/737943)', () => {
  const known: Array<[string, number]> = [['7-4', 787875], ['8-4', 633784], ['9-4', 206527], ['10-4', 652245], ['10-4', 737943]];
  // (since the stages follow the story, 8-4 and 9-4 are no longer climbs: the seeds are checked on the ones that still are)
  const still = known.filter(([id]) => ascents.some((a) => a.id === id));
  assert.ok(still.length >= 3);
  for (const [id, v] of still) {
    const l = ascents.find((a) => a.id === id)!;
    setLayoutVariant(v);
    const s = generateStage(l);
    setLayoutVariant(null);
    assert.equal(validateStage(s).ok, true, `${id} variant ${v}`);
    assert.deepEqual(insideStrip(s), [], `${id} variant ${v}`);
  }
});

test('the validator knows the clamp: a platform beyond the world edge does not count, and a vine out there cannot be grabbed', () => {
  const l = ascents.find((a) => a.id === '7-4')!;
  const s = buildStage(l, 0);
  assert.equal(validateStage(s).ok, true);
  // push the climb's whole top half past the right edge: nothing is left to stand on
  const cut = s.exitTotemY + 900;
  for (const p of s.platforms) if (p.y < cut && p.width < s.config.levelWidth) p.x += s.config.levelWidth;
  for (const v of s.vines) if (v.topY < cut) v.x += s.config.levelWidth;
  assert.equal(validateStage(s).ok, false);
});
