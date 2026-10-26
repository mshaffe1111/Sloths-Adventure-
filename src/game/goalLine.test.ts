import test from 'node:test';
import assert from 'node:assert/strict';
import { goalLine } from './stagePlan.ts';

const TYPES = ['harvest', 'relic_hunt', 'purge', 'gauntlet', 'rescue'] as const;

test('Dot\'s goal lines read right for every goal, every world and any count (2-3 said "Free 3 animals freed")', () => {
  for (const type of TYPES) {
    for (let world = 1; world <= 10; world++) {
      for (const n of [1, 2, 3, 14]) {
        for (const kind of ['start', 'late', 'sealed'] as const) {
          const line = goalLine(kind, world, type, n);
          assert.ok(line.length > 0, `${kind} ${world} ${type} ${n}`);
          const words = line.toLowerCase().split(/[\s:]+/).filter(Boolean);
          // no word twice in a row
          for (let i = 1; i < words.length; i++) assert.notEqual(words[i], words[i - 1], line);
          // no doubled verb ("Free 3 animals freed", "Still 3 predators to find")
          assert.ok(!/freed|found|defeated|collected/i.test(line), `a past tense in a goal: ${line}`);
          const verbs = line.toLowerCase().match(/\b(free|find|defeat|collect)\b/g) ?? [];
          assert.equal(verbs.length, 1, `one verb: ${line}`);
          // one thing is singular, more are plural
          const counted = line.match(new RegExp(`\\b${n} (?:more )?([a-z]+(?: [a-z]+)?)`))?.[1] ?? '';
          const noun = counted.replace(/ to$/, '').split(' ').pop() ?? '';
          assert.ok(noun.length > 0, `a thing counted: ${line}`);
          assert.equal(noun.endsWith('s'), n > 1, `${n} ${noun}: ${line}`);
        }
      }
    }
  }
  assert.equal(goalLine('start', 2, 'rescue', 3), 'Free 3 animals to open the sanctuary');
  assert.equal(goalLine('start', 2, 'rescue', 1), 'Free 1 animal to open the sanctuary');
  assert.equal(goalLine('late', 1, 'harvest', 5), 'Still 5 petals to collect before the sanctuary opens');
  assert.equal(goalLine('sealed', 4, 'purge', 2), 'Sealed: defeat 2 more predators to open it');
  assert.equal(goalLine('start', 3, 'relic_hunt', 4), 'Find 4 keepsakes to open the sanctuary');
  // a stage with no count to reach has no goal line
  assert.equal(goalLine('start', 1, 'sprint', 1), '');
});
