// The node code's long form (NODES.md §8.9, R-165.198): a node's dials, the formation mark and the pick node, read and written back
// by the one parser (nodeCode.ts), and refused by name where they mean nothing. The lay honours each or the roll fails by name
// (nodeAsks.ts); the pick is not laid yet and fails by name (pipeline.ts rolledGraph), never in silence.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { checkCode, formatToken, parseCode } from './nodeCode.ts';
import { legMarks } from './legs.ts';
import { buildGen2Stage } from './pipeline.ts';
import { legsKit } from './toyLegs.ts';
import { towerCfg } from './toyTower.ts';

test('node dials: every dial is read off the token and written back as it was', () => {
  const code = 'Xf2^+&&>:7:p5.5:t0.9:&snake*2!,spider,buzz*1z:#pods@beat:+seed:$8';
  const [t] = parseCode(code);
  assert.deepEqual(t.dials, {
    rating: 7, points: 5.5, beat: 0.9,
    threat: [{ kind: 'snake', count: 2, state: 'awake' }, { kind: 'spider', count: 1 }, { kind: 'buzz', count: 1, state: 'asleep' }],
    hazard: { kind: 'pods', clock: 'beat' }, reward: { find: 'seed', pickups: 8 },
  });
  assert.equal(t.formation, true);
  assert.equal(formatToken(t), code);
  // (a token with no long form is the token it always was: no dials, no new field)
  assert.deepEqual(parseCode('Xf2>')[0], { job: 'X', shape: '', content: 'f', move: '2', tempo: '>' });
});

test('node dials: the three example strings of the plan parse, leg marks and all', () => {
  for (const code of [
    'A Pg1< /D Dc_ Dr_ /R R Mg2&>:&spider*1! /U Uc^ Uv^ /R R F[Pf2^+:+seed|Pg1]< S E',
    'A Tg1< Pg1> /U Uc^ /L Mf2>:p6:t0.9 R /U Uc^ /R Xf2&&>:&snake*2!:#hurt R S E',
    'A T P R ?[Mk2+>:+seed|Pw1&<:&snake*1z:#water] R X R S E',
  ]) {
    const m = legMarks(code);
    const tokens = parseCode(m.code);
    assert.equal(tokens.length, m.travel.length);
    // (written back in the one canonical spelling (a count of 1 is left out), which reads as the same nodes)
    assert.deepEqual(parseCode(tokens.map(formatToken).join(' ')), tokens);
  }
  const pick = parseCode('?[Mk2>|Pw1<]')[0];
  assert.equal(pick.job, '?');
  assert.equal(pick.roads!.length, 2);
});

test('node dials (planted): a sign that is no dial, a number that means nothing and a name with no mark are each refused by name', () => {
  assert.throws(() => parseCode('Xf2:q4'), /":q4" is not a dial/);
  assert.throws(() => parseCode('Xf2:&Snake'), /is not a threat/);
  // (a bare z is a letter of the kind's name, never the asleep mark: asleep is written after the count)
  assert.deepEqual(parseCode('Xf2&:&buzz')[0].dials!.threat, [{ kind: 'buzz', count: 1 }]);
  assert.throws(() => parseCode('Xf2:p'), /needs a number/);
  const errs = (code: string, rules = {}) => checkCode(parseCode(code), rules).join('; ');
  assert.match(errs('A Pz R S E'), /V22 at token 2: "z" is no content letter/);
  assert.match(errs('A Pg:11 R S E'), /V22 at token 2: a rating is 1-10/);
  assert.match(errs('A Pg:&snake R S E', { creatures: true }), /names a threat with no creatures mark/);
  assert.match(errs('A Pg&:&snake R S E'), /V16 at token 2/);
  assert.match(errs('A Pg:+seed R S E'), /names a find with no find mark/);
  assert.match(errs('A R:#hurt S E'), /V1 at token 2: R is structural/);
  // (the pick: one a stage, after a rest, two stretches, no teach inside)
  assert.match(errs('A P ?[M|P] R S E'), /V23 at token 3: a pick follows a rest/);
  assert.match(errs('A R ?[T|P] R ?[M|P] R S E'), /V23 at token 5: 2 picks/);
  assert.match(errs('A R ?[T|P] R S E'), /V23 at token 3: a teach inside a pick/);
  assert.equal(errs('A P R ?[M|P] R S E'), '');
});

test('node dials: a graph that writes a dial is laid with it (or the roll fails by name, nodeAsks.ts); a pick fails by name', () => {
  const build = (code: string) => buildGen2Stage({ config: towerCfg('5-95', 'sprint'), kit: legsKit('5-95', code), seed: 1, difficulty: 'normal' });
  const st = build('A P:$8 M R S E');
  assert.deepEqual(st.gen2.graph.nodes[1].dials?.reward, { pickups: 8 });
  // (the toy's practise brick lays 3 petals a section: 8 is laid only by chance of the count, and a miss is named, never dropped)
  const laid = st.gen2.errors.filter((e) => e.startsWith('ask: '));
  assert.ok(laid.every((e) => /node n2 .*reward \$8: laid \d+ pickups/.test(e)), laid.join('; '));
  assert.throws(() => build('A P R ?[M|P] R S E'), /is a pick node, which is not laid yet/);
});
