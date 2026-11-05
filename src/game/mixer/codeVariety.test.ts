import test from 'node:test';
import assert from 'node:assert/strict';
import { distinctTokens, gramOverlap, overlapSummary } from './codeVariety.ts';

const r1 = 'A Tg1< Tg2< Tb> Pc1^> F[Pc2^+|Pb]< R Xf2> R Sf2> E'.split(' ');
const r2 = 'A Tg1> Tg2< Tb< Mg2> F[Pb2^+|Pc1^]< R Cb2< Uc^> Xf2> R Sf2< E'.split(' ');
test('code variety: distinct tokens, 3-gram overlap of identical rolls is 1, of NODES §8.5 rolls 1 and 2 is low', () => {
  assert.equal(distinctTokens(r1), 10);
  assert.equal(gramOverlap(r1, r1), 1);
  assert.ok(gramOverlap(r1, r2) < 0.2, String(gramOverlap(r1, r2)));
  const s = overlapSummary([r1, r2, r1]);
  assert.equal(s.pairs, 3); assert.equal(s.max, 1);
});
