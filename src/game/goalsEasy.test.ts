import test from 'node:test';
import assert from 'node:assert/strict';
import { gen2EasyGoal, goalHave, kidMedian, withGoals } from './goals.ts';
import { easyStage } from './easyMode.ts';
import { generateStage } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';
import { GEN2_STAGES } from './gen2/game.ts';

test("LV-24: a gen2 stage's Easy goal is 65% of what it holds, capped at the kid bot's median", () => {
  assert.equal(gen2EasyGoal(19), 12, '65% of 19');
  assert.equal(kidMedian([5, 5, 9, 10, 10, 10]), 9);
  assert.equal(kidMedian([4, 7, 8]), 7);
  assert.equal(gen2EasyGoal(18, kidMedian([5, 6, 4, 6, 6, 5])), 5, "5-9: 5 of 18 (bot-fix 2026-11-01; 9 came from the hopping bot)");
  assert.equal(gen2EasyGoal(6, 9), 4, 'the floor when the kid reaches more');
  assert.equal(gen2EasyGoal(1), 1);
  // (5-9's own record: the fixed kid bot's six runs, and the goal they give; firstTimerBot.test.ts re-measures the runs)
  assert.deepEqual([...GEN2_STAGES['5-9'].kidRuns!], [5, 6, 4, 6, 6, 5]);
  assert.equal(GEN2_STAGES['5-9'].easyGoal, 5);
});

test('LV-24: every gen2 stage on Easy asks min(65% of what it holds, the kid bot\'s median)', () => {
  // (the gen2-built stages: World 5's 5-7 and 5-9, and the pipeline's stages in Worlds 6 and 7)
  const levels = generateAllLevels().filter((l) => l.worldIndex >= 5 && l.worldIndex <= 7 && l.objectiveType !== 'boss_lair');
  let seen = 0;
  for (const l of levels) {
    const st = easyStage(withGoals(generateStage({ ...l }, 'easy')));
    if (!st.gen2) continue;
    seen++;
    const have = goalHave(st as never);
    if (!have) continue;
    const kid = GEN2_STAGES[l.id].easyGoal;
    assert.equal(st.config.targetCount, Math.min(Math.round(have * 0.65), kid ?? Infinity), `${l.id}: Easy asks ${st.config.targetCount} of ${have}`);
  }
  assert.ok(seen >= 2, `gen2 stages checked: ${seen}`);
});
