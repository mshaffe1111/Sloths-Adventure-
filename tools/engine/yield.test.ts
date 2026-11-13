// The yield probe's counters count what their names say (tools/engine/yield.ts; R-165.120): planted lines, the real wording of
// pipeline.rollErrors. A wrong number here would steer the generator's fixes, so each column is proven on a case built to fool it.
//   npx tsx --test tools/engine/yield.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { alone, easyOnly, ruleOf, tally } from './yield.ts';

const V19B = 'V19b: the end log at y 865 is not above y 657, where the bough window begins (x 23126)';
const V19B2 = 'V19b: the end log at y 876 is not above y 607, where the bough window begins (x 24629)';
const RISE = 'pool short at slot 13 (n13 signature: the late rise ended at y -26, not 20 px above y -28 (V19))';
const CLIMB = 'pool short at slot 9 (n9 climb: no section for the job left)';
const UNMARKED = 'verdict floor.unmarked (normal): an unmarked floorless gap at x 25890..25933';
const UNMARKED_E = 'verdict floor.unmarked (easy): an unmarked floorless gap at x 27875..27918';
const V11 = "node code: V11 at token 9: 4 of 8 content nodes are 'g' (cap 3)";

test('ruleOf names the rule and drops the numbers: two rolls of one rule are one row', () => {
  assert.equal(ruleOf(V19B), ruleOf(V19B2));
  assert.equal(ruleOf(UNMARKED), 'verdict floor.unmarked');
  assert.equal(ruleOf(UNMARKED), ruleOf(UNMARKED_E), 'the setting in a verdict line is not part of the rule');
  assert.equal(ruleOf(V11), 'node code V11');
  assert.equal(ruleOf(RISE), 'pool short: signature, the late rise ends short (V19)');
  assert.equal(ruleOf(CLIMB), 'pool short: climb, no section for the job left');
  assert.notEqual(ruleOf(RISE), ruleOf(CLIMB), 'pool short keeps its reason: the two have different causes');
  assert.equal(ruleOf('pool short at slot 4 (n4 signature: no rising section (V19) left)'), 'pool short: signature, no rising section (V#) left');
  assert.equal(ruleOf("Easy's quick player under the floor (118.2 s, floor 120.0 s)"), "Easy's quick player under the floor");
  assert.equal(ruleOf('THREW: gen2 1-1: the pool is spent at slot 7'), 'threw: gen# #-#: the pool is spent at slot #');
});

test('tally: clean counts empty rolls only; stopped counts a roll once per rule; first counts the first line only', () => {
  const t = tally([[], [V19B, V19B2, UNMARKED], [UNMARKED, V19B], [], [CLIMB, V11]]);
  assert.equal(t.rolls, 5);
  assert.equal(t.clean, 2);
  const row = (r: string) => t.rows.find((q) => q.rule === r)!;
  assert.deepEqual(row(ruleOf(V19B)), { rule: ruleOf(V19B), stopped: 2, first: 1 }, 'two V19b lines in one roll are one stopped roll');
  assert.deepEqual(row('verdict floor.unmarked'), { rule: 'verdict floor.unmarked', stopped: 2, first: 1 });
  assert.deepEqual(row('node code V11'), { rule: 'node code V11', stopped: 1, first: 0 });
  assert.equal(t.rows.reduce((a, r) => a + r.first, 0), t.rolls - t.clean, 'every refused roll has exactly one first rule');
  assert.ok(t.rows.every((r, i) => i === 0 || t.rows[i - 1].stopped >= r.stopped), 'rows sorted by rolls stopped');
});

test('alone: a rule is counted only on rolls nothing else stops', () => {
  const a = alone([[V19B, V19B2], [V19B, UNMARKED], [UNMARKED], []]);
  assert.equal(a.get(ruleOf(V19B)), 1, 'two lines of the one rule are still alone');
  assert.equal(a.get('verdict floor.unmarked'), 1);
  assert.equal([...a.values()].reduce((x, y) => x + y, 0), 2);
});

test("easyOnly: the same rule at other numbers is not Easy's own; a rule only Easy breaks is", () => {
  assert.deepEqual(easyOnly([V19B, UNMARKED], [V19B, UNMARKED, V19B2, UNMARKED_E]), []);
  assert.deepEqual(easyOnly([UNMARKED], [UNMARKED, RISE, V19B2]), [RISE, V19B2]);
  assert.deepEqual(easyOnly([], []), []);
});
