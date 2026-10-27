// npx tsx --test tools/inspect/analyze.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { actionTokens, cosine, deadTime, editDistance, profile } from './analyze.ts';
import type { Beat, Letter, Sample } from './beats.ts';

const beat = (t: number, letter: Letter, dur = 0, act = 0): Beat => ({ t, base: t, dur, act, x: t * 100, y: 0, letter, count: 1, what: '' });
const samples: Sample[] = Array.from({ length: 101 }, (_, i) => ({ x: i * 100, y: 0, base: i, seg: { kind: 'walk', x0: 0, y0: 0, x1: 0, y1: 0, dt: 1 } }));

test('dead time: gaps over the threshold, the start and the walk to the shrine count', () => {
  const d = deadTime([beat(1, 'J'), beat(2, 'J'), beat(6, 'C', 2), beat(8.5, 'V', 0, 3)], 20, 2, samples);
  // 2 -> 6 (4 s), 11.5 -> 20 (8.5 s); 6 + 2 s fight ends at 8, then 0.5 s to the swing, which keeps him busy to 11.5
  assert.deepEqual(d.list.map((x) => +x.sec.toFixed(2)), [4, 8.5]);
  assert.equal(d.longest, 8.5);
  assert.equal(Math.round(d.list[0].x0), 200);
});

test('weighted edit distance: same is 0, a creature swapped for a jump costs the mean weight', () => {
  assert.equal(editDistance(['J', 'J', 'V'], ['J', 'J', 'V']), 0);
  assert.equal(editDistance(['J', 'C'], ['J', 'J']), (2.2 + 1) / 2);
  assert.equal(editDistance([], ['P']), 2.8);
});

test('profile cosine ignores walking', () => {
  const a = actionTokens([beat(0, 'J'), beat(1, 'V'), beat(2, 'C'), beat(9, 'J'), beat(10, 'V'), beat(11, 'C')], 12);
  const b = actionTokens([beat(0, 'J'), beat(1, 'V'), beat(2, 'C'), beat(3, 'J'), beat(4, 'V'), beat(5, 'C')], 6);
  assert.ok(a.some((x) => x.l === 'W'));
  assert.ok(!b.some((x) => x.l === 'W'));
  assert.ok(Math.abs(cosine(profile(a), profile(b)) - 1) < 1e-9);
  assert.equal(cosine(profile(b), profile(actionTokens([beat(0, 'Z'), beat(1, 'Z'), beat(2, 'Z')], 3))), 0);
});
