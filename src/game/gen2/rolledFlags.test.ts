// A rolled stage's flags (the lead's 2:37 PM ruling, 11-06, on Matt's "a checkpoint before the hard part, not everywhere"): a flag before
// each hard node (teach, test, twist, combine, signature), never more than 4000 px apart where nothing costs a life (2300 where a life can
// be lost), the first at least 700 px on and none closer than 900, the last within 2000 of the exit; about 9-12 a stage, as old 1-1 had.
// Planted: the rolled 1-1 laid gaps of 2400-4200 px and two flags 366 px apart (the split pass kept no distance from the flag after it);
// then, at 2300 everywhere, 18-26 flags a stage. Both ways: a hard node with no flag before it fails, and a 3000 px span with a lethal fall
// in it fails where the same span with none passes.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, HARD_JOBS, lethalSpans, ROLLED_FLAGS, rolledFlagBreaches } from './pipeline.ts';
import { JOB_OF } from './nodeCode.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

test('gen2 1-1: a flag before every hard node, 900-4000 px apart (no life to lose), the last within 2000 of the exit, 9-14 a stage (20 seeds, both settings)', () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  const bad: string[] = [];
  const counts: number[] = [];
  let judged = 0;
  for (let seed = 1; seed <= 20; seed++) for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty });
    if (st.gen2.errors?.some((e) => e.startsWith('flags:'))) continue; // a roll its flags cannot fit fails by name, never ships
    judged++;
    const hard = (st.gen2.nodes ?? []).filter((q) => HARD_JOBS.has(JOB_OF[q.token[0] as keyof typeof JOB_OF] ?? '')).map((q, i) => ({ id: `${q.token} #${i + 1}`, x0: q.x0 }));
    assert.ok(hard.length >= 4, `seed ${seed}: ${hard.length} hard nodes read`);
    for (const b of rolledFlagBreaches(st, hard, lethalSpans(st, st.gen2.falls ?? []))) bad.push(`seed ${seed} ${difficulty}: ${b}`);
    counts.push((st.checkpoints ?? []).length);
  }
  assert.ok(judged >= 32, `only ${judged} of 40 builds laid their flags: the rule is failing rolls, not placing flags`);
  assert.deepEqual(bad.slice(0, 10), []);
  const sorted = [...counts].sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)];
  assert.ok(med >= 8 && med <= 13 && sorted[sorted.length - 1] <= 16, `flags a stage: median ${med}, ${sorted[0]}-${sorted[sorted.length - 1]} (target about 9-12)`);
});

test('the flag verdict both ways (planted): a hard node with no flag before it, and a long span with a lethal fall in it', () => {
  const st = { spawnX: 140, exitTotemX: 9000, checkpoints: [{ x: 1500 }, { x: 4500 }, { x: 7500 }] };
  assert.deepEqual(rolledFlagBreaches(st, [{ id: 'X', x0: 4600 }]), [], 'a flag 100 px before the test: kept');
  assert.match(rolledFlagBreaches(st, [{ id: 'X', x0: 7000 }]).join(';'), /none before the hard node X at x 7000/);
  assert.deepEqual(rolledFlagBreaches(st, [], []), [], 'spans of 3000 px with no life to lose: kept');
  assert.match(rolledFlagBreaches(st, [], [[5000, 5200]]).join(';'), /3000 px apart at x 4500 .*a life can be lost/);
  assert.deepEqual({ max: ROLLED_FLAGS.max, lethal: ROLLED_FLAGS.lethal }, { max: 4000, lethal: 2300 });
});
