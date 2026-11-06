// V19 on an up stage (gen2 1-1, the lead's 12:24 ruling (A)): the node after a late descent ends higher than both where the descent began
// and where the bough window begins, 20 px clear; rising at all was weaker than stage.ts's V19 and V19b (Roll A failed both). A roll
// that cannot is loosened and fails by name (so it never reaches the proven list); every clean roll keeps the rule.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, rollErrors } from './pipeline.ts';
import { endAboveWindow } from '../storyChecks.ts';
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

// (the lead 12:57 PM, 11-06: one window definition, the pipeline's and the gate's: the pipeline estimated the window from its slots (two
// thirds of the chunks, the route's height) and stage.ts judged it at 0.67 of spawn-to-exit (the highest top there), so a roll the pipeline
// called clean could fail stage.ts's V19b. A clean roll is one stage.ts's V19b passes)
test("gen2 1-1: every clean roll passes stage.ts's V19b (storyChecks endAboveWindow): one verdict (24 seeds, both settings)", () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  const miss: string[] = [];
  let clean = 0;
  for (let seed = 1; seed <= 24; seed++) for (const difficulty of ['normal', 'easy'] as const) {
    const g = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty });
    if (g.gen2.errors?.length) continue;
    clean++;
    const w = endAboveWindow(g as never);
    if (!w.pass) miss.push(`seed ${seed} ${difficulty}: end y ${w.endY}, window x ${w.windowX} y ${w.windowY}`);
  }
  assert.ok(clean >= 8, `${clean} clean rolls: the test would not see the rule`);
  assert.deepEqual(miss, [], 'clean rolls stage.ts fails on V19b');
});
test('V19b in the fold: a window miss is a roll error, by name (planted)', () => {
  const e = rollErrors({ errors: [], fills: [], windowMiss: 'V19b: the end log at y 420 is not above y 380, where the bough window begins (x 15000)' });
  assert.ok(e.some((x) => x.startsWith('V19b: the end log at y 420')), JSON.stringify(e));
});
