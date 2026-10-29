import test from 'node:test';
import assert from 'node:assert/strict';
import { holdStep, thunderShake, type HoldPhase } from './storyHold.ts';
import { finalePanels } from '../game/storyFinale.ts';

/** play a run of thumb counts from the start of the picture; the phase after each */
const play = (counts: number[]): HoldPhase[] => {
  let p: HoldPhase = 'grip';
  return counts.map((n) => (p = holdStep(p, n).phase));
};

test('the let-go: both thumbs hold the wall, lifting one reaches out', () => {
  assert.deepEqual(play([1, 2]), ['grip', 'held'], 'one thumb is not a grip');
  assert.deepEqual(play([2, 1]), ['held', 'reach']);
  assert.equal(holdStep('lift', 1).phase, 'reach');
  assert.equal(holdStep('reach', 1).phase, 'reach', 'kept up, it stays reaching');
});

test('the let-go: a thumb back down only grabs the wall again, and the scene waits', () => {
  assert.equal(holdStep('reach', 2).phase, 'held', 'back on the wall, ready to try again');
  assert.equal(holdStep('reach', 0).phase, 'grip', 'both off: back to the start, no fail');
  assert.equal(holdStep('grip', 0).phase, 'grip');
  // and a second try works the same as the first
  assert.deepEqual(play([2, 1, 2, 1]), ['held', 'reach', 'held', 'reach']);
});

test('the thunder rolls a little, and breaks hard once a thumb is up', () => {
  const quiet = thunderShake(1500, null);
  assert.equal(quiet.dx, 0);
  const roll = thunderShake(100, null);
  assert.ok(Math.hypot(roll.dx, roll.dy) < 3, 'a roll is small');
  const boom = thunderShake(1700, 60);
  assert.ok(boom.flash > 0.3, 'the break flashes');
  assert.equal(thunderShake(1700, -200).flash, 0, 'not before it breaks');
});

test('the tower plays the let-go, and keeps the narrated version for a screen without touch', () => {
  const ps = finalePanels([]);
  const i = ps.findIndex((p) => p.hold);
  assert.ok(i > 0, 'the tower has a played picture');
  assert.equal(ps[i].hold!.kind, 'letgo');
  assert.ok(ps[i].hold!.reach.actors.some((a) => a.kind === 'cel' && a.cel === 'PN'), 'his hand comes off the wall');
  assert.ok(ps[i + 1].narratedOnly && ps[i + 2].narratedOnly, 'the two narrated pictures after it are only for a screen that cannot play it');
  assert.ok(ps[i + 3].text.includes('somebody began to sing'), 'played, it goes straight to the song');
});
