// R-159.1: World 1's combat triangle in play, on the real engine (a bare world, real moves pressed frame by frame): the wrong move fails
// and the right one works, and an animal without World 1's tag behaves exactly as before.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RealPlay } from './realPlay.ts';
import type { Enemy, Platform } from './types.ts';
import { TRICK } from './w1Tricks.ts';

const GROUND = 580;
const ground = (x: number, w: number, y = GROUND): Platform => ({ id: x, x, y, width: w, height: 90, type: 'solid' }) as Platform;

function animal(id: number, type: 'snake' | 'boa', x: number, o: Partial<Enemy> = {}): Enemy {
  const boa = type === 'boa';
  return {
    id, type, x, y: GROUND - (boa ? 16 : 14), vx: boa ? 0 : 28, vy: 0, width: boa ? 58 : 38, height: boa ? 26 : 22, hp: boa ? 3 : 1,
    maxHp: boa ? 3 : 1, facing: -1, patrolMinX: x - (boa ? 12 : 60), patrolMaxX: x + (boa ? 12 : 60), attackCooldown: 5, telegraphTimer: 0,
    isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, edgeMinX: 0, edgeMaxX: 2000, ...o,
  } as Enemy;
}

function world(enemies: Enemy[]) {
  const r = new RealPlay('1-3', 1);
  r.bare([ground(0, 2000)]);
  r.e.enemies = enemies;
  return r;
}

/** stand facing right at x and throw one move, then let it play out */
function strike(r: RealPlay, x: number, move: 'punch' | 'kick') {
  r.stand(x, GROUND);
  r.p.facing = 1;
  r.frame(move === 'punch' ? { punch: true } : { kick: 1 });
  for (let i = 0; i < 12; i++) r.frame();
}

test('without World 1\'s tag a snake still dies to one punch (other worlds unchanged)', () => {
  const s = animal(1, 'snake', 340);
  const r = world([s]);
  strike(r, 300, 'punch');
  assert.ok(s.defeated, 'one punch, as before');
});

test('the lunge snake: a punch dazes it 1.5 s (harmless), it wakes after; a second punch while dazed finishes it', () => {
  const s = animal(1, 'snake', 340, { trick: 'lunge' });
  const r = world([s]);
  strike(r, 300, 'punch');
  assert.equal(s.defeated, false, 'the punch did not kill it');
  assert.ok((s.stagger ?? 0) > 1.0, `dazed (${s.stagger})`);
  r.wait(TRICK.daze + 0.3);
  assert.ok((s.stagger ?? 0) <= 0 && !s.defeated, 'it woke up');

  const s2 = animal(2, 'snake', 340, { trick: 'lunge' });
  const r2 = world([s2]);
  strike(r2, 300, 'punch');
  r2.wait(0.3);
  strike(r2, 300, 'punch');
  assert.ok(s2.defeated, 'punched again while dazed: finished');
});

test('the lunge snake: a stomp always works on it', () => {
  const s = animal(1, 'snake', 340, { trick: 'lunge' });
  const r = world([s]);
  r.fly(340, GROUND - 90, 0, 300);
  for (let i = 0; i < 20 && !s.defeated; i++) r.frame();
  assert.ok(s.defeated);
});

test('the lunge snake rears for its 0.5 s tell before it strikes (an untagged one keeps 0.38 s)', () => {
  for (const [trick, want] of [['lunge', TRICK.tell], [undefined, 0.38]] as const) {
    const s = animal(1, 'snake', 400, { trick, attackCooldown: 0 });
    const r = world([s]);
    r.stand(330, GROUND);
    let rearT = -1;
    let strikeT = -1;
    for (let i = 0; i < 120 && strikeT < 0; i++) {
      r.frame();
      if (s.state === 'rear' && rearT < 0) rearT = r.t;
      if (s.state === 'strike' && strikeT < 0) strikeT = r.t;
    }
    assert.ok(rearT >= 0 && strikeT > rearT, `${trick}: it reared and struck`);
    assert.ok(Math.abs(strikeT - rearT - want) < 0.05, `${trick}: tell ${(strikeT - rearT).toFixed(2)} s, want ${want}`);
  }
});

test('the coiled boa: a punch is TOUGH (no harm, Dot says kick), a stomp bounces off, a kick rolls it into the snake beyond', () => {
  const b = animal(1, 'boa', 340, { trick: 'coil' });
  const s = animal(2, 'snake', 700, { trick: 'lunge' });
  const r = world([b, s]);
  strike(r, 300, 'punch');
  assert.equal(b.hp, 3, 'the punch did nothing');
  assert.equal(b.defeated, false);
  assert.ok(r.said.some((l) => /kick/i.test(l.text)), 'Dot says to kick it');

  r.fly(340, GROUND - 100, 0, 300);
  let bounced = false;
  for (let i = 0; i < 20 && !bounced; i++) {
    r.frame();
    if (r.p.vy < 0) bounced = true;
  }
  assert.ok(bounced, 'he bounced off the coil');
  assert.equal(b.hp, 3, 'the stomp did nothing');

  strike(r, 300, 'kick');
  assert.equal(b.state === 'roll' || b.defeated, true, `rolling (${b.state})`);
  r.wait(1.5);
  assert.ok(s.defeated, 'the rolling boa bowled over the snake in its way');
  r.wait(TRICK.rollMax);
  assert.ok(b.defeated, 'and rolled to the end of its ground, out of the fight');
});
