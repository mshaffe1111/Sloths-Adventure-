// c1judge.ts (R-165.72, C1 done-item 7): the refusal and each check, planted good and bad
import test from 'node:test';
import assert from 'node:assert/strict';
import { judgeRow, pieceTable, refusal, BOTS_FAILED, BOTS_PASSED, DOUBLE_TEST_PIECES, type JudgedRun } from './c1judge.ts';

const run = (o: Partial<JudgedRun>): JudgedRun => ({
  tier: 'expert', setting: 'normal', stage: '1-1', variant: 1, end: 'shrine', finishSeconds: 150, lives: 0, putbacks: 1, rescues: 0, secondPressMs: [],
  pieces: [{ id: 'w1-learn', lives: 0, putbacks: o.putbacks ?? 1, seconds: 20 }], stuck: [], causes: [], ...o,
});
const base = [run({ putbacks: 1 }), run({ putbacks: 2, variant: 2 })]; // (1.5 put-backs a run)
const fails = (r: ReturnType<typeof judgeRow>) => r.checks.filter((c) => !c.pass).map((c) => c.name);

test('refuses the failed bots and a checkout without the passed ones; runs on one that has them', () => {
  assert.match(refusal(`${BOTS_FAILED}aaaa`, false)!, /attempt 1/);
  assert.match(refusal(`${BOTS_FAILED}aaaa`, true)!, /attempt 1/);
  assert.match(refusal('abcdef12', false)!, new RegExp(BOTS_PASSED));
  assert.equal(refusal('abcdef12', true), null);
});

test('a good expert Normal row passes every check; each planted miss fails its own check by name', () => {
  assert.deepEqual(fails(judgeRow('expert', 'normal', [run({}), run({ variant: 2, finishSeconds: 121 })], [], base, false)), []);
  assert.deepEqual(fails(judgeRow('expert', 'normal', [run({ rescues: 1 })], [], base, false)), ['no rescues (middle, expert)']);
  assert.deepEqual(fails(judgeRow('expert', 'normal', [run({ putbacks: 2 })], [], base, false)), ['put-backs a run <= baseline']);
  const life = judgeRow('expert', 'normal', [run({ lives: 1, causes: ['pit'] })], [], base, false);
  assert.deepEqual(fails(life), ['lives 0 on Normal (real loseLife)']);
  assert.match(life.checks.find((c) => !c.pass)!.why, /pit 1/);
  assert.deepEqual(fails(judgeRow('expert', 'normal', [run({ finishSeconds: 119 })], [], base, false)), ['expert minimum finish >= 120 s']);
  assert.deepEqual(fails(judgeRow('expert', 'normal', [run({ finishSeconds: 105 })], [], base, true)), [], 'a climb counts 20 s short');
  assert.deepEqual(fails(judgeRow('expert', 'normal', [run({}), run({ finishSeconds: null, end: 'cap' })], [], base, false)), ['expert minimum finish >= 120 s'], 'an unfinished run fails the length');
  assert.deepEqual(fails(judgeRow('expert', 'normal', [run({})], ['v2: no seed builds'], base, false)), ['every run plays']);
  assert.deepEqual(fails(judgeRow('expert', 'normal', [run({})], [], [], false)), ['put-backs a run <= baseline'], 'no baseline row is no pass');
  assert.equal(fails(judgeRow('expert', 'normal', [], ['v1: x', 'v2: x'], base, false)).length, 5, 'no runs: nothing passes');
});

test('the child keeps its rescues printed, Easy has no lives check, and the piece table sets candidate against baseline', () => {
  const c = run({ tier: 'child', setting: 'easy', rescues: 3, lives: 1, causes: ['pit'] });
  assert.deepEqual(fails(judgeRow('child', 'easy', [c], [], [{ ...c, putbacks: 1 }], false)), []);
  const t = pieceTable([run({ putbacks: 2 })], base);
  assert.equal(t[2], '| w1-learn | 1 | 2 | 0 | 20 | 2 | 1.5 | 0 | 20 |');
});

test('put-backs are judged outside the double-test pieces (INT-1-1 item 6, PUSHBACK 2 upheld): the excess at the designed test is not counted, any other is', () => {
  const at = (id: string, n: number) => ({ id, lives: 0, putbacks: n, seconds: 20 });
  // (1 a run elsewhere, the baseline's 1.5 or less; 3 more at the double test: passes)
  const test = run({ putbacks: 4, pieces: [at('w1-learn', 1), at('w1-dip-double-teach', 3)] });
  assert.deepEqual(fails(judgeRow('expert', 'normal', [test], [], base, false)), []);
  // (planted: the same 3 at a piece that is not a double test fails)
  const other = run({ putbacks: 4, pieces: [at('w1-learn', 1), at('w1-log-chain', 3)] });
  assert.deepEqual(fails(judgeRow('expert', 'normal', [other], [], base, false)), ['put-backs a run <= baseline']);
  // (the baseline is read the same way: its put-backs at those pieces are left out too)
  const baseTest = [run({ putbacks: 5, pieces: [at('w1-learn', 0), at('w1-double-teach', 5)] })];
  assert.deepEqual(fails(judgeRow('expert', 'normal', [run({ putbacks: 1 })], [], baseTest, false)), ['put-backs a run <= baseline']);
  assert.ok(DOUBLE_TEST_PIECES.includes('w1-double-teach') && DOUBLE_TEST_PIECES.length === 5);
});
