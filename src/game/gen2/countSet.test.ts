/**
 * A goal's count set by the stage's design (R-165.336: StageSpec.count -> LevelConfig.targetCount + countSet; BUILD-25, the lead's ruling (1)
 * 11-20 for 2-5: "7 laid / goal 6 as designed"): the stage lays its own sockets' animals and no top-up to the goal + 2, and its
 * goal is the designed count on both the level list and the built stage. Planted: without countSet the same toy tops up.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './../headlessDom.ts';
import { buildGen2Stage, fightsForGoal, planBudget } from './pipeline.ts';
import { cfg, kit } from './toyWorld.ts';
import { generateAllLevels } from '../worldsData.ts';
import { STAGE_PLAN } from '../stagePlan.ts';

const purge = (countSet: boolean, goal = 2) => ({ ...cfg('1-95', 'purge', goal), ...(countSet ? { countSet: true as const } : {}) });

test('a designed count: no top-up (planted: the same toy without it tops up to the goal + 2)', () => {
  assert.equal(fightsForGoal(planBudget(purge(true), kit.manifest, 'normal')), false);
  assert.equal(fightsForGoal(planBudget(purge(false), kit.manifest, 'normal')), true, 'the plant: a formula purge fights for its goal');
  const b = planBudget(purge(true), kit.manifest, 'normal');
  assert.deepEqual(b.quota, { goal: 2, check: 2, lay: 2 });
  assert.equal(planBudget(purge(true), kit.manifest, 'easy').quota.check, 1, 'Easy is held to easyMode\'s goal of the designed count');
  // (a goal over what the toy's sockets lay on most rolls: the formula tops up, `topup` fills; the designed count never does)
  const GOAL = 9;
  const topups = (countSet: boolean) => {
    let n = 0, built = 0;
    for (let seed = 1; seed <= 8; seed++) {
      try {
        const st = buildGen2Stage({ config: purge(countSet, GOAL), kit, seed, difficulty: 'normal' });
        if (st.gen2.errors?.length) continue;
        built++;
        n += st.gen2.fills.filter((f) => f.socket === 'topup').length;
      } catch { /* the next seed */ }
    }
    return { n, built };
  };
  const free = topups(false), set = topups(true);
  assert.ok(free.built > 0 && free.n > 0, `the plant: the formula purge tops up (${free.n} top-up animals over ${free.built} builds)`);
  assert.ok(set.built > 0 && set.n === 0, `a designed count lays no top-up animal (${set.n} over ${set.built} builds)`);
});

test('the level list carries a designed count as the goal, and only where a stage names one', () => {
  const levels = generateAllLevels();
  for (const l of levels) {
    const spec = STAGE_PLAN[l.worldIndex]?.[l.miniIndex - 1];
    if (spec?.count !== undefined) {
      assert.equal(l.targetCount, spec.count, `${l.id}: its goal is its designed count`);
      assert.equal(l.countSet, true, `${l.id}: countSet`);
    } else assert.equal(l.countSet, undefined, `${l.id}: no designed count, no countSet`);
  }
});
