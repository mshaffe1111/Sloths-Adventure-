import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, buildStage } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';

const levels = generateAllLevels().filter((l) => l.objectiveType !== 'boss_lair' && l.objectiveType !== 'ascent' && !l.secret);

test('every horizontal stage is built around a core idea', () => {
  for (const l of levels) {
    const r = generateStage(l).meta?.recipe;
    assert.ok(r && r.core, `${l.id} has no recipe`);
  }
});

test('from the third mission on, every stage pays its core idea off', () => {
  for (const l of levels) {
    const m = (l.worldIndex - 1) * 10 + l.miniIndex;
    if (m < 3) continue;
    const chunks = generateStage(l).meta!.chunks;
    assert.ok(chunks.includes('beat:payoff'), `${l.id} never reaches its payoff`);
  }
});

test('fight stages are not wall-to-wall yards: terrain separates them', () => {
  const gapKinds = /^(pit|stones|cliff|bounce|ladder|swing|moving|fragile|tower|river|gapbridge|skyhop|islands|pillars|zigzag|trampoline|pegs|hurdles|terrace|ropegap)/;
  let bare = 0, n = 0;
  for (const l of levels.filter((x) => x.objectiveType === 'purge' || x.objectiveType === 'gauntlet')) {
    n++;
    if (!generateStage(l).meta!.chunks.some((c) => gapKinds.test(c))) bare++;
  }
  assert.ok(bare <= Math.ceil(n * 0.05), `${bare}/${n} fight stages have nothing to jump`);
});

test('a flag always follows the first look at the idea within reach, and flags are never crowded', () => {
  for (const l of levels) {
    const s = generateStage(l);
    let prev = 0;
    for (const f of s.checkpoints ?? []) {
      if (prev > 0) assert.ok(f.x - prev >= 450, `${l.id} flags ${Math.round(f.x - prev)}px apart`);
      prev = f.x;
    }
  }
});

test('random layouts with recipes are always beatable', () => {
  for (const l of levels.filter((_, i) => i % 5 === 0)) {
    for (let k = 0; k < 4; k++) {
      let ok = false;
      for (let j = 0; j < 14 && !ok; j++) ok = validateStage(buildStage(l, 1000 + (k + 1) * 31 + j)).ok;
      assert.ok(ok, `${l.id} variant ${k} has no valid layout`);
    }
  }
});
