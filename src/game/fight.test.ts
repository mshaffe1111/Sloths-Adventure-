import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyHit, bodyRect, canCancel, chooseMove, headRect, hitsToDefeat, hurtRect, isCommitted, koLaunch, moveBox, moveLength, MOVES,
  phaseAt, playerHurtRect, rectsOverlap, resolveMelee, stompTest, swingPose, sweptBox, TRAITS, type MoveId,
} from './fight.ts';
import { endStagger, staggerPredator } from './predatorAI.ts';
import type { Enemy, EnemyType } from './types.ts';

const enemy = (type: EnemyType, x: number, y: number, w: number, h: number, hp: number, over: Partial<Enemy> = {}): Enemy => ({
  id: 1, type, x, y, vx: 0, vy: 0, width: w, height: h, hp, maxHp: hp, facing: -1, patrolMinX: x - 60, patrolMaxX: x + 60,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...over,
});
const P = { x: 100, y: 200, facing: 1 as const };
const ids = Object.keys(MOVES) as MoveId[];

test('every move has a wind-up, a strike and a follow-through, in that order', () => {
  for (const id of ids) {
    const m = MOVES[id];
    assert.ok(m.startup > 0 && m.active > 0 && m.recovery > 0, id);
    assert.equal(phaseAt(m, 0), 'startup');
    assert.equal(phaseAt(m, m.startup + 0.001), 'active');
    assert.equal(phaseAt(m, m.startup + m.active + 0.001), 'recovery');
    assert.equal(phaseAt(m, moveLength(m) + 0.001), 'done');
    assert.ok(moveLength(m) < 0.6, `${id} is not a slow move`);
  }
});

test('nothing can be hit during the wind-up or follow-through, only during the strike', () => {
  for (const id of ids) {
    const m = MOVES[id];
    assert.equal(moveBox(m, m.startup * 0.5, P), null);
    assert.ok(moveBox(m, m.startup + m.active * 0.5, P));
    assert.equal(moveBox(m, m.startup + m.active + 0.02, P), null);
  }
});

test('the strike zone mirrors when he faces left', () => {
  const m = MOVES.jab;
  const t = m.startup + m.active * 0.9;
  const r = moveBox(m, t, { ...P, facing: 1 })!;
  const l = moveBox(m, t, { ...P, facing: -1 })!;
  assert.equal(r.w, l.w);
  assert.ok(Math.abs(r.x - P.x - (P.x - (l.x + l.w))) < 1e-9);
  assert.ok(r.x >= P.x);
  assert.ok(l.x + l.w <= P.x);
});

test('a slow frame rate can never skip over an enemy the claw passed through', () => {
  for (const fps of [15, 20, 30, 60]) {
    for (const id of ids) {
      const m = MOVES[id];
      const dt = 1 / fps;
      let any = false;
      for (let t = 0; t < moveLength(m); t += dt) {
        if (sweptBox(m, t, t + dt, P)) any = true;
      }
      assert.ok(any, `${id} at ${fps} fps connects somewhere`);
    }
  }
  // and an enemy sitting right at the end of the reach is covered by the sweep
  const m = MOVES.jab;
  const far = enemy('snake', 100 + 60, 186, 38, 22, 1);
  const hit = sweptBox(m, 0.02, 0.2, P)!;
  assert.ok(rectsOverlap(hit, hurtRect(far)));
});

test('strikes reach what is in front of him and nothing behind or far away', () => {
  const snakeFront = enemy('snake', 150, 186, 38, 22, 1);
  const snakeBack = enemy('snake', 40, 186, 38, 22, 1);
  const snakeFar = enemy('snake', 260, 186, 38, 22, 1);
  const box = sweptBox(MOVES.jab, 0, 0.3, P)!;
  assert.ok(rectsOverlap(box, hurtRect(snakeFront)));
  assert.ok(!rectsOverlap(box, hurtRect(snakeBack)));
  assert.ok(!rectsOverlap(box, hurtRect(snakeFar)));
  // the whirlwind mega punch gets both sides
  const mega = sweptBox(MOVES.mega, 0, 0.6, P)!;
  assert.ok(rectsOverlap(mega, hurtRect(snakeFront)));
  assert.ok(rectsOverlap(mega, hurtRect(snakeBack)));
  // a low caiman and a high eagle are reached by the right moves
  const caiman = enemy('caiman', 160, 185, 84, 24, 3);
  assert.ok(rectsOverlap(sweptBox(MOVES.kick, 0, 0.4, P)!, hurtRect(caiman)));
  const eagleHigh = enemy('eagle', 150, 90, 58, 42, 1);
  assert.ok(!rectsOverlap(sweptBox(MOVES.jab, 0, 0.3, P)!, hurtRect(eagleHigh)), 'a jab on the ground does not hit a high eagle');
  assert.ok(rectsOverlap(sweptBox(MOVES.jab, 0, 0.3, { ...P, y: 130 })!, hurtRect(eagleHigh)), 'but one thrown from a jump does');
});

test('punches chain jab, cross, hook; a swing that missed must be played out in full', () => {
  assert.equal(chooseMove('punch', false, null, false), 'jab');
  assert.equal(chooseMove('punch', false, 'jab', true), 'cross');
  assert.equal(chooseMove('punch', false, 'cross', true), 'hook');
  assert.equal(chooseMove('punch', false, 'hook', true), 'jab');
  assert.equal(chooseMove('punch', false, 'jab', false), 'jab');
  assert.equal(chooseMove('kick', false, 'jab', true), 'kick');
  assert.equal(chooseMove('kick', true, null, false), 'airKick');
  assert.equal(chooseMove('punch', true, null, false), 'airKick', 'a tap in the air is a jump kick');
  assert.equal(chooseMove('mega', true, null, false), 'mega');
  const m = MOVES.jab;
  const early = m.startup + m.active + m.recovery * 0.1;
  const later = m.startup + m.active + m.recovery * 0.5;
  assert.equal(canCancel(m, early, true), false);
  assert.equal(canCancel(m, later, true), true);
  assert.equal(canCancel(m, later, false), false);
  assert.equal(canCancel(m, moveLength(m), false), true);
  assert.equal(canCancel(m, m.startup + m.active + m.recovery * 0.7, false), true, 'a miss can be cut short near its end');
});

test('the pose pulls back, thrusts out and settles', () => {
  const m = MOVES.hook;
  const wind = swingPose(m, m.startup * 0.9);
  const hit = swingPose(m, m.startup + m.active * 0.8);
  const end = swingPose(m, moveLength(m) - 0.001);
  assert.ok(wind.cock > 0.8 && wind.reach === 0);
  assert.ok(hit.reach > 0.9 && hit.cock < 0.2);
  assert.ok(end.reach < 0.05);
});

test('big animals take two or three hits, small ones one or two', () => {
  assert.equal(hitsToDefeat(3, MOVES.jab.damage), 3);
  assert.equal(hitsToDefeat(3, MOVES.hook.damage), 2);
  assert.equal(hitsToDefeat(3, MOVES.kick.damage), 2);
  assert.equal(hitsToDefeat(3, MOVES.mega.damage), 1);
  assert.equal(hitsToDefeat(2, MOVES.jab.damage), 2);
  assert.equal(hitsToDefeat(1, MOVES.jab.damage), 1);
});

test('a leaping jaguar shrugs off a jab but a heavy hit stops it; killing blows always land', () => {
  const jag = enemy('jaguar', 150, 176, 64, 38, 3, { state: 'leap', stateT: 0.2 });
  assert.ok(isCommitted(jag));
  const jab = resolveMelee(jag, MOVES.jab, 1);
  assert.equal(jab.armored, true);
  assert.equal(jab.stagger, 0);
  assert.ok(Math.abs(jab.knock) < 40);
  const hook = resolveMelee(jag, MOVES.hook, 1);
  assert.equal(hook.armored, false);
  assert.ok(hook.stagger > 0.3);
  assert.ok(hook.knock > 100, 'pushed away to the right');
  const weak = enemy('jaguar', 150, 176, 64, 38, 1, { state: 'leap' });
  assert.equal(resolveMelee(weak, MOVES.jab, 1).killed, true);
  assert.equal(resolveMelee(weak, MOVES.jab, 1).armored, false);
  // standing around or recovering, even a jab staggers it
  const idle = enemy('jaguar', 150, 176, 64, 38, 3, { state: 'recover' });
  assert.equal(resolveMelee(idle, MOVES.jab, 1).armored, false);
  assert.ok(resolveMelee(idle, MOVES.jab, 1).stagger > 0);
  // small animals are always interrupted
  const oc = enemy('ocelot', 150, 182, 48, 28, 2, { state: 'leap' });
  assert.equal(resolveMelee(oc, MOVES.jab, 1).armored, false);
  // knock follows the direction of the hit
  assert.ok(resolveMelee(oc, MOVES.kick, -1).knock < 0);
});

test('applying a hit changes hp, flinch, stagger and shove; a kill does not stagger', () => {
  const sn = enemy('snake', 150, 186, 38, 22, 2);
  applyHit(sn, resolveMelee(sn, MOVES.jab, 1));
  assert.equal(sn.hp, 1);
  assert.equal(sn.recoil, 1);
  assert.ok((sn.stagger ?? 0) > 0);
  assert.ok((sn.knockVx ?? 0) > 0);
  applyHit(sn, resolveMelee(sn, MOVES.jab, 1));
  assert.equal(sn.hp, 0);
});

test('stomps: from above only, never against the stomp-proof, and armor bounces', () => {
  const sn = enemy('snake', 150, 186, 38, 22, 1);
  const head = headRect(sn);
  const fall = (x: number, feet: number, vy: number) => ({ x, y: feet, vy });
  assert.deepEqual(stompTest(fall(150, head.y + 3, 400), head.y - 12, sn), { kind: 'stomp', damage: 1 });
  assert.deepEqual(stompTest(fall(150, head.y + 3, 400), head.y - 12, sn, true), { kind: 'stomp', damage: 2 });
  assert.equal(stompTest(fall(150, head.y + 3, -300), head.y + 6, sn), null, 'rising');
  assert.equal(stompTest(fall(220, head.y + 3, 400), head.y - 12, sn), null, 'not over it');
  assert.equal(stompTest(fall(150, bodyRect(sn).y + 20, 400), bodyRect(sn).y + 12, sn), null, 'walked into the side, feet below the head');
  const cai = enemy('caiman', 150, 185, 84, 24, 3);
  const ch = headRect(cai);
  assert.deepEqual(stompTest(fall(150, ch.y + 3, 400), ch.y - 12, cai), { kind: 'bounce' });
  const spider = enemy('spider', 150, 186, 38, 22, 1);
  const sh = headRect(spider);
  assert.equal(stompTest(fall(150, sh.y + 3, 400), sh.y - 12, spider), null);
});

test('every kind of enemy has traits, and the big ones are armored', () => {
  for (const t of ['snake', 'eagle', 'ocelot', 'jaguar', 'boa', 'caiman', 'tayra', 'frog', 'spider', 'ant_hazard', 'boss'] as EnemyType[]) assert.ok(TRAITS[t], t);
  for (const t of ['jaguar', 'boa', 'caiman'] as EnemyType[]) assert.equal(TRAITS[t].armor, true);
  for (const t of ['snake', 'tayra', 'ocelot'] as EnemyType[]) assert.equal(TRAITS[t].armor, false);
});

test('predator bodies sit on their feet and the player hurt box shrinks when ducking', () => {
  const jag = enemy('jaguar', 150, 176, 64, 38, 3);
  assert.equal(bodyRect(jag).y + bodyRect(jag).h, 176 + 24);
  const stand = playerHurtRect({ x: 100, y: 200 });
  const duck = playerHurtRect({ x: 100, y: 200, ducking: true });
  assert.ok(duck.h < stand.h && duck.y + duck.h === 200);
});

test('a stagger interrupts a leap, and the animal gets back to patrolling with a breather', () => {
  const jag = enemy('jaguar', 150, 130, 64, 38, 3, { state: 'leap', stateT: 0.3, groundY: 176, attackCooldown: 0 });
  staggerPredator(jag);
  assert.equal(jag.state, 'recover');
  assert.equal(jag.y, 176);
  endStagger(jag);
  assert.equal(jag.state, 'patrol');
  assert.ok(jag.attackCooldown >= 1);
  const boa = enemy('boa', 150, 184, 58, 26, 3, { state: 'strike', groundY: 184 });
  staggerPredator(boa);
  endStagger(boa);
  assert.equal(boa.state, 'coil');
});

test('defeated animals leave in their own way', () => {
  const small = koLaunch(enemy('snake', 0, 0, 38, 22, 1), 1);
  const flyer = koLaunch(enemy('eagle', 0, 0, 58, 42, 1), -1);
  const big = koLaunch(enemy('jaguar', 0, 0, 64, 38, 3), 1);
  assert.ok(small.vx > 150 && small.vy < -250);
  assert.ok(flyer.vx < 0);
  assert.ok(Math.abs(big.vx) < small.vx && big.life > small.life);
});
