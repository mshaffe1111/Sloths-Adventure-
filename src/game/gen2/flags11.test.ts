// gen2 1-1's flags (the porter, 11-06: proven seed 1 had 5914 px with no flag, from x 947 in the meadow to x 6861 at the end of the learn).
// The same line as game.test's for the curated gen2 stages, on 1-1's rolled graph: never more than FLAG_SPAN.max px without one, from the
// spawn through every flag to the exit, Normal and Easy, 20 seeds.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, FLAG_SPAN } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

test('gen2 1-1: never more than FLAG_SPAN.max px without a flag (20 seeds, both settings)', () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  for (let seed = 1; seed <= 20; seed++) for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty });
    const xs = [st.spawnX, ...(st.checkpoints ?? []).map((q) => q.x).sort((p, q) => p - q), st.exitTotemX];
    for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] <= FLAG_SPAN.max, `seed ${seed} ${difficulty}: ${Math.round(xs[k] - xs[k - 1])} px from x ${Math.round(xs[k - 1])} with no flag`);
  }
});
