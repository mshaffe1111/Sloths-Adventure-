/**
 * The boa's rear leaves room to go still (ENG-19a NEW 1, R-165.257; the lead's ruling 7:47 PM ET 11-14: BOA.tell 0.8 -> 1.0 s for every
 * boa in every world). Flown as 1-9's design flew it (reference/specs/sims/boaFreeze.ts on t-pitch-b): Pokey is the REAL engine at 30 fps
 * (realPlay.ts: the pad's controls, his own stop), the boa is the REAL kit (castPlay.ts running predators/core.ts on BOA, world1.ts), fed
 * every frame as engine.ts stepCast feeds it. He runs in with the right thumb held; when its rear begins (the cast's `told`) he holds on
 * k more frames, then lifts. STILL: beaten by stillness. HIT: its strike's box touched him.
 * Today's measure (0.8 s): Normal lets the thumb lift 7 frames late (0.23 s), under a touch player's reaction; 1.0 s gives 13 (0.43 s).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, DT } from './realPlay.ts';
import { CastPlay } from './castPlay.ts';
import type { CastData } from './castPlay.types.ts';
import { touches } from './predators/core.ts';
import { BOA } from './predators/world1.ts';
import type { Enemy, Platform } from './types.ts';

const FLOOR = 400;
const BOA_X = 2400;

function fly(k: number, easy: boolean): 'HIT' | 'STILL' | 'STRUCK-MISS' | 'none' {
  const bough = { id: 1, x: 0, y: FLOOR, width: 8000, height: 200, type: 'solid' } as Platform;
  const r = new RealPlay('1-3', 1);
  r.bare([bough]);
  r.stand(600, FLOOR);
  for (let i = 0; i < 10; i++) r.frame();
  const e = {
    id: 900, type: 'boa', x: BOA_X, y: FLOOR - 14, vx: 0, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: -1, patrolMinX: BOA_X,
    patrolMaxX: BOA_X, attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0,
    behaviorTimer: 0,
  } as Enemy;
  const c = new CastPlay({ kinds: ['boa'], traps: [] } as unknown as CastData, [e], [bough], 1);
  const m = c.members[0];
  let t = 0, tellF = -1, liftF = -1, hit = false, struck = false, still = false;
  for (let f = 0; f < 380; f++) {
    r.frame(liftF < 0 ? { right: true } : {});
    const p = r.p;
    const h = { x: p.x, y: p.y, vx: p.vx, vy: p.vy, facing: p.facing, grounded: p.grounded, holding: !!(p.climbing || p.isVineSwinging || p.hanging) } as never;
    const o = c.step(h, DT, t, easy);
    if (o.told.length && tellF < 0) tellF = f;
    if (liftF < 0 && tellF >= 0 && f - tellF >= k) liftF = f;
    if (o.struck.length) struck = true;
    for (const z of o.hurts) if (touches(z.box, h)) hit = true;
    if (m.s.beatenBy === 'still') still = true;
    t += DT;
    if (tellF >= 0 && f - tellF > 150) break;
  }
  return hit ? 'HIT' : still ? 'STILL' : struck ? 'STRUCK-MISS' : 'none';
}

test('the boa rears for 1.0 s, its Easy row slower still (the lead 11-14: every boa, every world)', () => {
  assert.equal(BOA.tell, 1.0);
  assert.equal(BOA.easy.tell, 1.3, 'Easy keeps its own row multiplier (the lead 11-14)');
});

test('Normal: a thumb lifted up to 13 frames (0.43 s) after the rear begins is a branch to it (0.8 s gave 7: red at 8)', () => {
  for (let k = 0; k <= 13; k++) assert.equal(fly(k, false), 'STILL', `Normal: lifted ${k} frames after the rear began`);
});

test('Normal: lifted 14 frames late, inside its reach, he is struck (the freeze is a read, not a free pass)', () => {
  assert.equal(fly(14, false), 'HIT');
});

test('Easy: the window is wider than Normal\'s (its own row, x1.3): 26 frames (0.87 s) late is still a branch', () => {
  for (const k of [0, 14, 20, 26]) assert.equal(fly(k, true), 'STILL', `Easy: lifted ${k} frames after the rear began`);
});
