// The node code's parser and validity rules (NODES.md §8.1-8.3): the sprint graphs (§8.4) and the designer's three example 1-1 rolls
// (§8.5) read and pass; each rule, broken on its own, fails with its own number and the token; a string writes back as it was read.
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkCode, formatToken, parseCode, type CodeRules } from './nodeCode.ts';
import { SPRINT_CODES } from './graphs.ts';

const ONE_ONE: CodeRules = { teaches: 3, needsFork: true, windows: { f: [0.67, 1] }, mini: 1 };
const ROLLS = [
  'A Tg1< Tg2< Tb> Pc1^> F[Pc2^+|Pb]< R Xf2> R Sf2> E',
  'A Tg1> Tg2< Tb< Mg2> F[Pb2^+|Pc1^]< R Cb2< Uc^> Xf2> R Sf2< E',
  'A Tg1< Tg2> Tb> Pb2< R Uc^< F[Pc2^+|Pg1]> Xf2> R Sf2< E',
];

test('the sprint graphs and the three example 1-1 rolls read and pass V1-V17', () => {
  for (const [id, s] of Object.entries(SPRINT_CODES)) assert.deepEqual(checkCode(parseCode(s), { needsFork: true }), [], `${id}: ${s}`);
  for (const s of ROLLS) assert.deepEqual(checkCode(parseCode(s), ONE_ONE), [], s);
  // (the H find sits outside the mix: 1-1's seed perch, a bounce, never counts against the deal or the neighbour rule)
  assert.deepEqual(checkCode(parseCode('A Tg1< Tg2> Tb< Pc1^< F[P^+|Pb]> R Xc2< R Hb2< Sb2> E'), { ...ONE_ONE, deal: { g: 2, b: 1, c: 2, f: 0 } }), []);
});

test('a string writes back exactly as it was read', () => {
  for (const s of [...ROLLS, ...Object.values(SPRINT_CODES)]) assert.equal(parseCode(s).map(formatToken).join(' '), s);
});

test('each rule, broken on its own, fails with its own number and the token', () => {
  const cases: Array<[string, string, CodeRules?]> = [
    ['A Rg T P F R X R S E', 'V1 at token 2'],
    ['A T P F[T|P] R X R S E', 'V2 at token 4'],
    ['A Tg1 Pg2 F[Pc1+|Pg1] R Xf1 R Sf1 E', 'V3 at token 3'],
    ['A T P F W R X R S E', 'V4 at token 5'],
    ['A T P F R X S E', 'V5 at token 6'],
    ['A T S R P F R X R E', 'V6 at token 3'],
    ['A Tg1 Pc1 F[Pc1|Pg1] R Xg1 R Sf1 E', 'V7 at token 4'],
    ['A T P F R Ug R X R S E', 'V8 at token 6'],
    ['A T P F R D R X R S E', 'V9 at token 6'],
    ['A T P^^ F R X R S E', 'V10 at token 3'],
    ['A Tg1 Pc1 Pg1 Pg1 F[Pc1+|Pb1] R Xg1 R Sf1 E', 'V11 at token 5'],
    ['A Tg1 Pf1 F[Pc1+|Pg1] R Xc1 R Sf1 E', 'V12 at token 3', { windows: { f: [0.67, 1] } }],
    ['A T K P F R X R S E', 'V13 at token 3'],
    ['A Tg1 Pc1 F[Pc1+|Pg1] R Xc1 R Sf1 E', 'V14 at token 1', { deal: { g: 4 } }],
    ['A T P R X R S E', 'V17 at token 1', { needsFork: true }],
    ['A T P& F R X R S E', 'V16 at token 3'],
    ['A P F X R W R D_ S E', 'V19 at token 8', { trend: 'up' }],
  ];
  for (const [s, want, rules] of cases) {
    const errs = checkCode(parseCode(s), rules ?? {});
    assert.ok(errs.some((e) => e.startsWith(want)), `${s}: wanted ${want}, got ${JSON.stringify(errs)}`);
  }
});

test('a string that is not the code fails to read, naming the token', () => {
  assert.throws(() => parseCode('A T Q E'), /token 3 "Q"/);
  assert.throws(() => parseCode('A F[P E'), /unclosed/);
  assert.throws(() => parseCode('A F[P] E'), /two roads/);
});

test('V3 reads the earlier lessons (packet E12 item 5): a move an earlier stage taught is taught; without it the same code is refused', () => {
  // (planted: 1-2's shape, a double and a bounce with no teach of them in the stage; red before `known` existed, as every 1-2 roll was)
  const code = parseCode('A Tb Pg1 R Xc2 R Sb E');
  const v3 = (known?: string[]) => checkCode(code, known ? { known } : {}).filter((e) => e.startsWith('V3'));
  assert.equal(v3().length, 1, 'with no earlier lesson the double before its teach is refused');
  assert.match(v3()[0], /uses the double before its teach/);
  assert.deepEqual(v3(['double']), []);
  const bounce = parseCode('A Tg1 Pb R Xg1 R Sb E');
  const b3 = (known?: string[]) => checkCode(bounce, known ? { known } : {}).filter((e) => e.startsWith('V3'));
  assert.match(b3()[0], /bounces before the bounce is taught/);
  assert.deepEqual(b3(['bounce']), []);
  assert.equal(b3(['double']).length, b3().length, 'the double taught earlier does not teach the bounce');
  assert.equal(b3().length, 2, 'the practise and the signature both bounce');
});
