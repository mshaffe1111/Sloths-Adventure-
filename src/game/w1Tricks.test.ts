// R-159.1: World 1's combat triangle, the rules on their own (the engine tests prove them in play: w1TricksPlay.test.ts)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Enemy } from './types.ts';
import { dazeFor, isCoiled, starsShown, tellFor, TRICK, trickHit, trickStompBounces } from './w1Tricks.ts';

const foe = (o: Partial<Enemy>): Enemy =>
  ({ id: 1, type: 'snake', x: 0, y: 0, vx: 0, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: -1, patrolMinX: 0, patrolMaxX: 0,
    attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    ...o }) as Enemy;

test('an animal with no trick is untouched (every other world)', () => {
  for (const kind of ['punch', 'kick', 'mega'] as const) assert.equal(trickHit(foe({}), kind), null);
  assert.equal(trickHit(foe({ type: 'boa', state: 'coil' }), 'kick'), null);
  assert.equal(trickStompBounces(foe({ type: 'boa', state: 'coil' })), false);
});

test('the lunge snake: a punch or kick dazes it; while dazed every blow does nothing (only a stomp finishes it)', () => {
  const s = foe({ trick: 'lunge', state: 'rear' });
  assert.equal(trickHit(s, 'punch'), 'daze');
  assert.equal(trickHit(s, 'kick'), 'daze', 'a kick dazes it too: mash-kicking does not skip the stomp');
  for (const kind of ['punch', 'kick', 'mega'] as const) assert.equal(trickHit({ ...s, stagger: 1.2 }, kind), 'nothing', kind);
  assert.equal(trickStompBounces(s), false, 'a stomp always works on it');
});

test('the boa: no blow but a kick ever harms it, in any state', () => {
  for (const state of ['coil', 'recover', 'sleep', undefined]) {
    const b = foe({ type: 'boa', trick: 'coil', state, hp: 3, maxHp: 3 });
    assert.ok(isCoiled(b), String(state));
    assert.equal(trickHit(b, 'punch'), 'tough', `coiled (${state}): TOUGH`);
  }
  for (const state of ['rear', 'strike', 'bite']) {
    const b = foe({ type: 'boa', trick: 'coil', state, hp: 3, maxHp: 3 });
    assert.equal(trickHit(b, 'punch'), 'stagger', `mid-attack (${state}): knocked back into its coil, unhurt`);
  }
  for (const state of ['coil', 'rear', 'strike', 'bite', 'recover']) {
    const b = foe({ type: 'boa', trick: 'coil', state });
    assert.equal(trickHit(b, 'kick'), 'roll', `a kick rolls it (${state})`);
    assert.equal(trickHit(b, 'mega'), 'roll', `the mega breaks the coil too (${state})`);
    assert.ok(trickStompBounces(b), `a stomp bounces off (${state})`);
  }
  assert.equal(trickHit(foe({ type: 'boa', trick: 'coil', state: 'roll' }), 'kick'), 'tough', 'a rolling ball is not kicked again');
});

test('the vine snake: a punch stiffens it, once', () => {
  const v = foe({ trick: 'vine' });
  assert.equal(trickHit(v, 'punch'), 'stiffen');
  assert.equal(trickHit({ ...v, stagger: 1 }, 'punch'), 'nothing');
});

test('Easy: longer tells and stuns (Easy stays a cruise)', () => {
  assert.equal(tellFor(false), 0.5);
  assert.ok(tellFor(true) > tellFor(false));
  assert.equal(dazeFor('lunge', false), 1.5);
  assert.ok(dazeFor('lunge', true) > dazeFor('lunge', false));
  assert.equal(dazeFor('vine', false), TRICK.stiff);
});

test('the stars show the whole daze, then flicker in its last 0.3 s', () => {
  const s = foe({ trick: 'lunge', stagger: 1.0 });
  assert.equal(starsShown(s, 0), 5);
  assert.equal(starsShown({ ...s, stagger: 0 }, 0), 0);
  const end = { ...s, stagger: 0.2 };
  const seen = new Set<number>();
  for (let t = 0; t < 1; t += 1 / 30) seen.add(starsShown(end, t));
  assert.deepEqual([...seen].sort(), [0, 5], 'in the last 0.3 s they blink');
});
