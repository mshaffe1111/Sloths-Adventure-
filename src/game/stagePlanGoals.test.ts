import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { withGoals } from './goals.ts';
import { MISSION_23 } from './gen2/worlds/w2Arc23.ts';

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
    // (both settings: the map line is the same on Easy, so a count it names must be Easy's goal too)
    for (const setting of ['normal', 'easy'] as const) for (const roll of [null, 1, 2, 5]) {
      setLayoutVariant(roll);
      const got = withGoals(generateStage({ ...l }, setting)).config.targetCount;
      setLayoutVariant(null);
      assert.equal(Number(n), got, `${l.id} ${setting} (roll ${roll}): the map says ${n}, the stage asks ${got}: "${l.description}"`);
    }
  }
  // (3-6, 3-7, 7-3, 7-7, 9-8: the floor keeps the check from passing on stripped lines. 2-3 named "Free 5 little ones" until BUILD-23
  // took the story keeper's line 8 (reference/story/lines-2-3.md: its goal counts who gets HOME, not who is freed, so "Free {n}" reads
  // wrong; the HUD gives the count): it names none, held to the keeper's words, so it can never name a wrong one)
  assert.ok(named >= 5, `stages naming a count: ${named}`);
  const free23 = levels.find((l) => l.id === '2-3')!;
  assert.equal(free23.description, MISSION_23);
  assert.doesNotMatch(free23.description, /\d/);
});
