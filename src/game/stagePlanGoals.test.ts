import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { withGoals } from './goals.ts';

// (the stages as the game builds them: the hand-built ones, protoStage.ts protoStageEnabled, are built where there is a page)
(globalThis as { location?: unknown }).location ??= { search: '', hash: '', href: 'http://localhost/' };

const QUOTA = new Set(['harvest', 'purge', 'gauntlet', 'rescue', 'relic_hunt']);

test("UI-22: a stage's map line names a count only where it is the engine's goal on every layout roll", () => {
  const levels = generateAllLevels().filter((l) => QUOTA.has(l.objectiveType));
  let named = 0;
  for (const l of levels) {
    const n = l.description.match(/\d+/)?.[0];
    if (!n) continue;
    named++;
    for (const roll of [null, 1, 2, 5]) {
      setLayoutVariant(roll);
      const got = withGoals(generateStage({ ...l }, 'normal')).config.targetCount;
      setLayoutVariant(null);
      assert.equal(Number(n), got, `${l.id} (roll ${roll}): the map says ${n}, the stage asks ${got}: "${l.description}"`);
    }
  }
  assert.ok(named >= 6, `stages naming a count: ${named}`);
  const free23 = levels.find((l) => l.id === '2-3')!;
  assert.match(free23.description, /^Free 5 little ones/);
});
