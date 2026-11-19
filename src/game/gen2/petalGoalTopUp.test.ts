/**
 * A stage whose goal counts petals never tops up animals to an animal goal (BUILD-19, the lead's ruling 10:09 AM ET 11-18): a purge or a
 * gauntlet that gathers her petals (goals.ts goalCountsPetals; 1-9) lays its sockets' animals and no more. Before the rule, 1-9's
 * 'gauntlet' kind topped 12 designed boas up to targetCount + 2 = 16, onto any bank wide enough (pipeline.ts planBudget, topUpFoes).
 * Planted: drop the goalCountsPetals clause from planBudget -> lay 16 (red). The built-stage half (topUpFoes: 1-9 lays its 12 designed
 * boas, never 16) is held by w1Arc19.test.ts on the real stage.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planBudget } from './pipeline.ts';
import { listedStage } from './listed.ts';
import { generateAllLevels } from '../worldsData.ts';
import { goalCountsPetals } from '../goals.ts';

// (a toy on a real row: 1-6 gathers petals (stagePlan gathers: 'petals'); played as a gauntlet with an animal goal of 14, its kind is a
//  fight's but its goal still counts petals, so nothing may be topped up)
const cfg16 = generateAllLevels().find((c) => c.id === '1-6' && !c.secret)!;
const asGauntlet = { ...cfg16, objectiveType: 'gauntlet' as const, targetCount: 14 };

test('a gauntlet whose goal counts petals plans no animal top-up: its lay is its goal, never goal + 2 (and a plain gauntlet still is)', () => {
  assert.ok(goalCountsPetals(asGauntlet), 'the toy gathers petals');
  const row = listedStage('1-6')!;
  for (const d of ['normal', 'easy'] as const) {
    const b = planBudget(asGauntlet as never, row.kit().manifest, d);
    assert.equal(b.quota.lay, 14, `${d}: lay = the goal`);
  }
  // (the control: the same row as a gauntlet whose goal counts animals keeps its top-up, goal + 2 on Normal)
  const plain = { ...asGauntlet, worldIndex: 1, miniIndex: 3 };
  assert.ok(!goalCountsPetals(plain));
  assert.equal(planBudget(plain as never, row.kit().manifest, 'normal').quota.lay, 16, 'an animal goal: lay = goal + 2');
});
