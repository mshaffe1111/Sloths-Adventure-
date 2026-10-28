import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAIR_LOOP, PAIR_STEPS, pairPose } from './titleActors.ts';
import { STD_FRAMES } from '../../game/heroStandardData.ts';
import { MEECA_FRAMES } from '../../game/meecaStandardData.ts';

test('every pose on the title is a frame the two sheets really have', () => {
  for (const s of PAIR_STEPS) {
    assert.ok(STD_FRAMES[s.pokey], `Pokey ${s.pokey}`);
    assert.ok(MEECA_FRAMES[s.meeca], `Meeca ${s.meeca}`);
  }
});

test('mostly they stand: idle is most of the loop, and the loop is long enough not to feel like a loop', () => {
  const idle = PAIR_STEPS.filter((s) => s.pokey === 'idle').reduce((a, s) => a + s.d, 0);
  assert.ok(idle / PAIR_LOOP > 0.7);
  assert.ok(PAIR_LOOP > 14 && PAIR_LOOP < 25);
});

test('the pose follows the timeline and wraps round', () => {
  assert.equal(pairPose(0).pokey, 'idle');
  assert.equal(pairPose(2.45).pokey, 'blink');
  assert.deepEqual(pairPose(PAIR_LOOP + 2.45), pairPose(2.45));
  const hopAt = PAIR_STEPS.slice(0, PAIR_STEPS.findIndex((s) => s.hop)).reduce((a, s) => a + s.d, 0);
  const mid = pairPose(hopAt + 0.35);
  assert.ok(mid.meecaHop > 0.9 && mid.meecaHop < 1.1, 'halfway through the hop step, the first bounce is done');
  assert.equal(pairPose(hopAt - 0.01).meecaHop, 0);
});
