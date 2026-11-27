import test from 'node:test';
import assert from 'node:assert/strict';
import { goalLine, sealedLine, uncountedLateLines } from './stagePlan.ts';
import { engineGuideLine, swapLine } from './dotLines.ts';
import { countedText } from './dotGuide.ts';
import { generateAllLevels } from './worldsData.ts';
import { EXTRA_STAGES } from './extraStages.ts';
import { countedGoal } from './goals.ts';

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
          assert.ok(!/freed|found|defeated|collected|chased/i.test(line), `a past tense in a goal: ${line}`);
          // (chase: World 2's purge, 2-5, where nobody is hurt and the snappers are only chased off: the story keeper's words, KEEPER-25)
          const verbs = line.toLowerCase().match(/\b(free|find|defeat|collect|chase)\b/g) ?? [];
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
  assert.equal(goalLine('start', 2, 'purge', 1), 'Chase off 1 snapper to open the sanctuary');
  assert.equal(goalLine('late', 2, 'purge', 3), 'Still 3 snappers to chase off before the sanctuary opens');
  assert.equal(goalLine('sealed', 2, 'purge', 2), 'Sealed: chase off 2 more snappers to open it');
  assert.equal(goalLine('start', 3, 'purge', 2), 'Defeat 2 predators to open the sanctuary');
  assert.equal(goalLine('start', 3, 'relic_hunt', 4), 'Find 4 keepsakes to open the sanctuary');
  // a stage with no count to reach has no goal line
  assert.equal(goalLine('start', 1, 'sprint', 1), '');
});

// R-165.569: the goal's late line, "Still {n} ...", is counted by what it IS (goalLine's late words for the stage's world and goal), whoever
// owns its words: the switchboard's goal.late row or a world's own GOAL_LINES (2-9's keeper words). Marked by the row id alone, 2-9's line
// was laid as plain information with the count it was sent with, and Dot would say a stale number late in the stage (the 5-3 bug, again)
test("every listed stage's late goal line is counted when read, whoever owns its words: its goal as the engine counts it and as its data names it, any count, Dot there or away (R-165.569)", () => {
  const stages = [...generateAllLevels(), ...EXTRA_STAGES.map((e) => e.config())];
  const owners = { row: 0, world: 0 };
  let lines = 0;
  for (const c of stages) {
    // (the engine sends the goal it counts, goals.ts countedGoal: 1-9's purge counts petals; the stage's data names its objective)
    for (const type of new Set([countedGoal(c), c.objectiveType ?? ''])) {
      for (const n of [1, 2, 9, 37]) {
        const sent = goalLine('late', c.worldIndex, type, n);
        if (!sent) continue;
        if (swapLine(sent, c.id)?.line.id === 'goal.late') owners.row++;
        else owners.world++;
        for (const dot of [true, false]) {
          const g = engineGuideLine(sent, c.id, { dot });
          assert.ok(g, `${c.id} ${type} n=${n}: "${sent}" is not said`);
          lines++;
          const at = `${c.id} ${type} n=${n} ${dot ? 'Dot' : 'Dot away'}: "${g.text}"`;
          assert.equal(g.counted, true, `${at} is not counted`);
          // (the goal's line, as the switchboard's row says it: queued as the goal, one key whatever its number)
          assert.equal(g.kind, 'goal', `${at} is queued as ${g.kind}, not as the goal`);
          assert.equal(g.key, 'engine:goal.late', at);
          // (its number is the one put in live as it is read, dotGuide.ts countedText)
          const live = countedText(g.text, 4);
          assert.match(live, /\b4\b/, at);
          if (n !== 4) assert.ok(!new RegExp(`\\b${n}\\b`).test(live), `${at}: the sent count stays in "${live}"`);
        }
      }
    }
    // (the locked exit's line is not counted: it is said at once, over any line, and a counted line is dropped on a replay, DotGuide.tsx;
    // counted, a replay's sealed door would go unexplained. STAGE-RULES: Dot explains any locked exit)
    if (c.objectiveType) {
      const sealed = sealedLine(c.worldIndex, c.objectiveType) ?? goalLine('sealed', c.worldIndex, countedGoal(c), 3);
      if (sealed) assert.ok(!engineGuideLine(sealed, c.id, { dot: true, lock: true })?.counted, `${c.id}: the sealed line "${sealed}" is counted`);
    }
  }
  // (never passes on nothing: both owners of the words are walked, the switchboard's row and a world's own late line)
  assert.ok(owners.row > 0 && owners.world > 0, `owners walked: ${JSON.stringify(owners)}`);
  assert.ok(lines >= 200, `${lines} lines`);
});

test('a late goal line whose words carry no {n} cannot be counted: it is refused by name, never laid (R-165.569)', () => {
  assert.deepEqual(uncountedLateLines(), [], 'a late line with no count');
  // planted: a world's own late words with no count in them
  assert.deepEqual(uncountedLateLines({ '9:harvest': { start: 'Collect {n} petals to open the sanctuary', late: 'Keep collecting!' } }), ['9:harvest']);
  assert.deepEqual(uncountedLateLines({ '2:gauntlet': { start: 'Chase off {n} snappers to open the sanctuary', late: 'Still {n} snappers to chase off' } }), []);
});
