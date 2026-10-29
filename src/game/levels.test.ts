import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { buildStage, generateStage, setLayoutVariant } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';
import { LEVEL_ATTEMPTS } from './levelSeeds.ts';
import { isGen2Stage } from './gen2/game.ts';
import type { GeneratedStage } from './stageGenerator.ts';

const levels = generateAllLevels();

test('every shipped level passes the reachability validator', () => {
  for (const l of levels) {
    const stage = generateStage(l);
    const res = validateStage(stage);
    assert.equal(res.ok, true, `${l.id} (${l.objectiveType}): ${res.errors.slice(0, 3).join('; ')}`);
  }
});

test('the seed table is complete and not stale', () => {
  // (the new generator's stages ship their own curated rolls, gen2/seeds.ts: the old table has no entry for them)
  for (const l of levels) {
    if (isGen2Stage(l)) assert.equal(LEVEL_ATTEMPTS[l.id], undefined, `${l.id} is built by gen2: no old seed`);
    else assert.notEqual(LEVEL_ATTEMPTS[l.id], undefined, `missing seed for ${l.id}`);
  }
});

test('generation is deterministic', () => {
  for (const l of levels.filter((_, i) => i % 7 === 0)) {
    const a = JSON.stringify(buildStage(l, 0));
    const b = JSON.stringify(buildStage(l, 0));
    assert.equal(a, b, l.id);
  }
});

test('stages are long and grow by world (about two and a quarter minutes in World 1 to about four in World 10)', () => {
  const ord = levels.filter((l) => l.objectiveType !== 'boss_lair' && l.objectiveType !== 'ascent');
  assert.ok(Math.min(...ord.map((l) => l.levelWidth)) >= 6000, 'no ordinary stage can be cranked through in half a minute');
  assert.ok(Math.max(...ord.map((l) => l.levelWidth)) <= 30000, 'and none outgrows the cap');
  const avg = (w: number) => { const xs = ord.filter((l) => l.worldIndex === w).map((l) => l.levelWidth); return xs.reduce((a, b) => a + b, 0) / xs.length; };
  for (let w = 2; w <= 10; w++) assert.ok(avg(w) > avg(w - 1) * 0.98, `world ${w} is not shorter than world ${w - 1}`);
  assert.ok(avg(10) > avg(1) * 1.4, 'World 10 stages are well over a third longer than World 1 stages');
  // timed stages give enough time to finish them at a steady run
  for (const l of ord) if (l.timeLimit) assert.ok(l.timeLimit >= 120, `${l.id} time limit is too tight`);
});

test('ascent stages get taller by world', () => {
  const h = (w: number) => levels.find((l) => l.worldIndex === w && l.objectiveType === 'ascent')!.levelHeight;
  assert.ok(h(10) > h(1));
});

test('every level has a flag every ~1500px (never more than 2300 apart) and a lives-safe spawn', () => {
  for (const l of levels) {
    if (l.objectiveType === 'boss_lair' || l.objectiveType === 'ascent') continue;
    const s = generateStage(l);
    const cps = s.checkpoints ?? [];
    let prev = 0;
    // (the old generator's spacing; a gen2 stage lays its flags by the clock, at its rests and every 35 s, as far apart as the
    // hand-built stages have them: gen2/game.test.ts)
    if (!isGen2Stage(l)) {
      for (const c of cps) { assert.ok(c.x - prev < 2300, `${l.id} flag gap ${c.x - prev}`); prev = c.x; }
      assert.ok(s.exitTotemX - prev < 2000, `${l.id} last flag too far from goal`);
    }
    // (a gen2 stage of a world whose pits are soft has no water but its sections' own creeks (World 6's water gaps): a fall lands in a
    // mossy pit with a step out, gen2/DESIGN.md B1 and B11)
    const g2 = (s as { gen2?: { budget: { pit: string }; falls?: Array<{ kind: string }> } }).gen2;
    const soft = isGen2Stage(l) && g2?.budget.pit === 'soft' && !(g2.falls ?? []).some((f) => f.kind === 'water');
    if (soft) assert.equal(s.waterY, undefined, `${l.id}: soft pits, no water`);
    else assert.ok(s.waterY !== undefined && s.waterY > s.spawnY, `${l.id} has water below the spawn`);
  }
});

// --- the validator must actually catch broken levels ---------------------------------------

function broken(id: string, mutate: (s: GeneratedStage) => void) {
  const l = levels.find((x) => x.id === id)!;
  const s = buildStage(l, LEVEL_ATTEMPTS[id] ?? 0);
  assert.equal(validateStage(s).ok, true, 'baseline must be valid');
  mutate(s);
  return validateStage(s);
}

test('validator rejects a pit that is too wide to jump', () => {
  const r = broken('1-1', (s) => {
    const banks = s.platforms.filter((p) => p.height >= 50).sort((a, b) => a.x - b.x);
    // shove everything after the first gap 400px to the right
    const gapAt = banks.findIndex((b, i) => i > 0 && b.x > banks[i - 1].x + banks[i - 1].width + 10);
    for (const p of s.platforms) if (p.x >= banks[gapAt].x) p.x += 400;
    s.exitTotemX += 400;
    for (const c of s.collectibles) if (c.x >= banks[gapAt].x) c.x += 400;
    for (const c of s.checkpoints ?? []) if (c.x >= banks[gapAt].x) c.x += 400;
    for (const e of s.enemies) if (e.x >= banks[gapAt].x) { e.x += 400; e.patrolMinX += 400; e.patrolMaxX += 400; }
  });
  assert.equal(r.ok, false);
});

test('validator rejects a cliff whose climbing vine is removed', () => {
  const cliffy = levels.find((l) => l.objectiveType !== 'ascent' && buildStage(l, LEVEL_ATTEMPTS[l.id] ?? 0).meta!.chunks.some((c) => /^cliff/.test(c)));
  assert.ok(cliffy, 'some level has a cliff');
  const r = broken(cliffy!.id, (s) => { s.vines = s.vines.filter((v) => v.vineType === 'swing_liana'); });
  assert.equal(r.ok, false);
});

test('validator rejects a wide swing gap with no liana', () => {
  // (before 4-7: from there the leaf glide may carry him over a gap a liana spans, see skills.ts)
  const wide = levels.find((l) => (l.worldIndex - 1) * 10 + l.miniIndex < 37 && buildStage(l, LEVEL_ATTEMPTS[l.id] ?? 0).meta!.chunks.some((c) => /^swing3[1-9]/.test(c)));
  assert.ok(wide, 'some level has a wide swing gap');
  const r = broken(wide!.id, (s) => { s.vines = s.vines.filter((v) => v.vineType !== 'swing_liana'); });
  assert.equal(r.ok, false);
});

test('validator rejects an exit hanging in mid air', () => {
  const r = broken('1-3', (s) => { s.exitTotemY -= 300; });
  assert.equal(r.ok, false);
});

test('random layout variants are always beatable, and the same variant gives the same layout', () => {
  setLayoutVariant(null);
  const sample = levels.filter((l) => l.objectiveType !== 'boss_lair' && !l.secret);
  for (const variant of [1, 2, 777, 424242]) {
    setLayoutVariant(variant);
    for (const l of sample.filter((_, i) => i % 3 === variant % 3)) {
      const a = JSON.stringify(generateStage(l).platforms);
      const stage = generateStage(l);
      assert.equal(JSON.stringify(stage.platforms), a, `${l.id} variant ${variant} not repeatable`);
      const res = validateStage(stage);
      assert.equal(res.ok, true, `${l.id} variant ${variant}: ${res.errors.slice(0, 3).join('; ')}`);
    }
  }
  setLayoutVariant(null);
});

test('different variants give different layouts, but boss lairs stay as designed', () => {
  const l = levels.find((x) => x.id === '2-2')!;
  setLayoutVariant(1);
  const a = JSON.stringify(generateStage(l).platforms);
  setLayoutVariant(2);
  const b = JSON.stringify(generateStage(l).platforms);
  assert.notEqual(a, b);
  const boss = levels.find((x) => x.objectiveType === 'boss_lair')!;
  setLayoutVariant(1);
  const b1 = JSON.stringify(generateStage(boss).platforms);
  setLayoutVariant(2);
  assert.equal(JSON.stringify(generateStage(boss).platforms), b1);
  setLayoutVariant(null);
});

test('random layouts are not stuck in "safe mode": vine-swing stages really have swing vines', () => {
  const vineLevels = levels.filter((l) => l.objectiveType === 'vine_runner' && l.worldIndex * 10 + l.miniIndex > 40);
  assert.ok(vineLevels.length > 5);
  let withSwing = 0;
  for (const l of vineLevels.slice(0, 12)) {
    setLayoutVariant(777);
    const stage = generateStage(l);
    // (the old generator's swing chunks, or a gen2 stage's lianas: World 6's swing stages)
    if ((stage.meta?.chunks ?? []).some((c) => c.startsWith('swing')) || (isGen2Stage(l) && stage.vines.some((v) => v.vineType === 'swing_liana'))) withSwing++;
  }
  setLayoutVariant(null);
  assert.equal(withSwing, Math.min(12, vineLevels.length), 'a Vine Swing stage came out without a single swing');
});
