// The stage card's goal line for every PURGE stage is the story keeper's (the lead, 11-12): "This stage: send {count} {creatures} on their
// way to open the shrine." ({creatures} plural; for 1 the singular with "its": "send 1 boa on its way"). The creature comes from the
// stage's own data (engine.ts goalCreature: its cast's kind, else its most common animal); "beat" and "predators" never appear on a card.
import '../../game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creatureNoun, goalInfo } from './goalInfo.ts';
import { generateAllLevels } from '../../game/worldsData.ts';
import { makeEngine } from '../../game/engineCoreHarness.ts';

const cfg = (o: Partial<{ id: string; worldIndex: number; miniIndex: number; objectiveType: string; targetCount: number }>) =>
  ({ id: '9-9', worldIndex: 1, miniIndex: 3, objectiveType: 'purge', targetCount: 13, ...o });

test('count N: "This stage: send 13 snakes on their way" / "to open the shrine."', () => {
  const g = goalInfo(cfg({}), false, 'snake');
  assert.equal(g.line, 'This stage: send 13 snakes on their way');
  assert.equal(g.sub, 'to open the shrine.');
  assert.equal(g.noun, 'snakes');
});

test('count 1: the singular, with "its": "This stage: send 1 boa on its way"', () => {
  const g = goalInfo(cfg({ targetCount: 1 }), false, 'boa');
  assert.equal(g.line, 'This stage: send 1 boa on its way');
  assert.equal(g.noun, 'boa');
});

test('plurals by the word: harpy -> harpies, ocelot -> ocelots; an id with underscores reads as words', () => {
  assert.deepEqual([creatureNoun('harpy', 2), creatureNoun('ocelot', 3), creatureNoun('snake', 1), creatureNoun('river_snapper', 2)], ['harpies', 'ocelots', 'snake', 'river snappers']);
});

test('"beat" and "predators" never appear on any purge stage\'s card, with its creature or before the stage has said it', () => {
  for (const l of generateAllLevels().filter((q) => q.objectiveType === 'purge')) {
    for (const c of ['snake', undefined]) {
      const g = goalInfo(l, false, c);
      const text = `${g.line} ${g.sub} ${g.noun}`;
      assert.doesNotMatch(text, /\bbeat\b|predator/i, `${l.id}: ${text}`);
      assert.match(g.line, /^This stage: send \d+ \w[\w ]* on (their|its) way$/, `${l.id}: ${g.line}`);
    }
  }
});

test('the engine names the stage\'s creature from its data: 1-3, its cast\'s snake', () => {
  const { e } = makeEngine('1-3', 'normal');
  assert.equal(e.goalCreature(), 'snake');
});
