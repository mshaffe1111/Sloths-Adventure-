// V19 on an up stage (gen2 1-1, the lead's 12:24 ruling (A)): the node after a late descent ends higher than both where the descent began
// and where the bough window begins, 20 px clear; rising at all was weaker than stage.ts's V19 and V19b (Roll A failed both). A roll
// that cannot is loosened and fails by name (so it never reaches the proven list); every clean roll keeps the rule.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

test('gen2 1-1: every clean roll ends its late rise 20 px above the window and the late descent (16 seeds, both settings)', () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  let checked = 0;
  for (let seed = 1; seed <= 16; seed++) for (const difficulty of ['normal', 'easy'] as const) {
    const g = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty });
    if (g.gen2.errors?.length) continue;
    for (const r of g.gen2.rise ?? []) {
      checked++;
      assert.ok(r.exitY <= r.to - 20, `seed ${seed} ${difficulty}: node ${r.node} ended at y ${r.exitY}, not 20 px above ${r.to}`);
    }
  }
  assert.ok(checked >= 4, `${checked} late rises checked: the test would not see the rule`);
});
