// A rolled stage's flags (the lead's rulings, 11-06: no gap over 2300 px, the last within 2000 px of the exit, rolled stages only; the red
// tests levels.test 'a flag every ~1500px (never more than 2300 apart)' and stageQuality 'checkpoints stand 900 to 1900 px apart (the
// first at least 700 px from the start)'). Planted on the rolled 1-1 as it laid: gaps of 2400-4200 px (FLAG_SPAN.max 4500) and two flags
// 366 px apart (seed 2: x 20467 and 20833, the split pass kept 600 px from the flag before it and none from the one after).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, ROLLED_FLAGS } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

test('gen2 1-1: the first flag 700 px on, every gap 900-2300 px, the last within 2000 px of the exit (20 seeds, both settings)', () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  const bad: string[] = [];
  let judged = 0;
  for (let seed = 1; seed <= 20; seed++) for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty });
    if (st.gen2.errors?.some((e) => e.startsWith('flags:'))) continue; // a roll its flags cannot fit fails by name, never ships
    judged++;
    const xs = (st.checkpoints ?? []).map((q) => q.x).sort((p, q) => p - q);
    const at = `seed ${seed} ${difficulty}`;
    if (!xs.length) { bad.push(`${at}: no flag`); continue; }
    if (xs[0] - st.spawnX < ROLLED_FLAGS.first) bad.push(`${at}: the first flag ${Math.round(xs[0] - st.spawnX)} px from the start`);
    for (let k = 1; k < xs.length; k++) {
      const g = xs[k] - xs[k - 1];
      if (g < ROLLED_FLAGS.min || g > ROLLED_FLAGS.max) bad.push(`${at}: flags ${Math.round(g)} px apart at x ${Math.round(xs[k - 1])}`);
    }
    if (st.exitTotemX - xs[xs.length - 1] > ROLLED_FLAGS.last) bad.push(`${at}: the last flag ${Math.round(st.exitTotemX - xs[xs.length - 1])} px from the exit`);
  }
  assert.ok(judged >= 32, `only ${judged} of 40 builds laid their flags: the rule is failing rolls, not placing flags`);
  assert.deepEqual(bad.slice(0, 10), []);
  assert.deepEqual(ROLLED_FLAGS, { first: 700, min: 900, max: 2300, last: 2000 });
});
