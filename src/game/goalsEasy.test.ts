import test from 'node:test';
import assert from 'node:assert/strict';
import { goalHave, ownEasyGoal, withGoals } from './goals.ts';
import { easyStage } from './easyMode.ts';
import { generateStage } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';
import { GEN2_STAGES } from './gen2/game.ts';

test('LV-24: a stage\'s own Easy goal is raised to 65% of what it holds, never past it', () => {
  assert.equal(ownEasyGoal(5, 18), 12, "5-9's 5 of 18");
  assert.equal(ownEasyGoal(11, 19), 12);
  assert.equal(ownEasyGoal(14, 18), 14, 'a goal over the floor stays');
  assert.equal(ownEasyGoal(9, 6), 6, 'never more than the stage holds');
});

test('LV-24: every gen2 stage on Easy asks at least 65% of what it holds', () => {
  const levels = generateAllLevels().filter((l) => GEN2_STAGES[l.id]);
  assert.ok(levels.length >= 3, `gen2 stages: ${levels.map((l) => l.id)}`);
  for (const l of levels) {
    const st = easyStage(withGoals(generateStage({ ...l }, 'easy')));
    const have = goalHave(st as never);
    if (!have) continue;
    assert.ok(st.config.targetCount >= Math.round(have * 0.65), `${l.id}: Easy asks ${st.config.targetCount} of ${have}`);
    assert.ok(st.config.targetCount <= have, `${l.id}: never more than it holds`);
  }
});
