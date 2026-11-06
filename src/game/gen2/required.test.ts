// A required section and its H node (NODES §7.1, the designer's de5a17ea2): H is structural, outside the content deal, and takes its
// section's own type. And the required section is judged in the corridor from the entry the join will give it (the join clamps every
// entry into the corridor), not from the last section's exit: on 1-1 seed 102948 a descent ended past the corridor's floor and the level
// seed perch was refused there, so the roll failed "the required section w1-seed-perch fits no node".
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

const c = generateAllLevels().find((l) => l.id === '1-1')!;

test('the H node is never dealt a type (8 seeds)', () => {
  for (const seed of Array.from({ length: 8 }, (_, i) => 1 + i * 7919)) {
    const st = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty: 'normal' });
    for (const n of st.gen2.graph.nodes.filter((q) => q.job === 'reward')) assert.equal(n.content, undefined, `seed ${seed}: H ${n.id} dealt ${n.content}`);
  }
});

test('1-1 seed 102948 lays the seed perch in its H, both settings (a descent before it ended past the corridor floor)', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: c, kit: w1World(), seed: 102948, difficulty });
    assert.ok(!(st.gen2.errors ?? []).some((e) => /required section w1-seed-perch fits no node/.test(e)), `${difficulty}: ${JSON.stringify(st.gen2.errors)}`);
    assert.ok(st.gen2.plan.some((p) => p.template === 'w1-seed-perch'), `${difficulty}: no seed perch laid`);
  }
});
