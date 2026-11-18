/**
 * The freeze moment (ENG-19a NEW 4, R-165.257; 1-9.md "Building blocks" 4): an animal of the cast beaten by his stillness in its rear,
 * with him inside its strike's reach, is reported by the cast's step (CastStep.froze), and the engine plays 0.6 s of its existing slow
 * motion for it, the view kept as it is (no push-in: sideways the rearing head sits under the HUD band). Never while a sweeper's eye is
 * out (the eagle's pass slowed would be a different pass), and cut short if one comes out. For any stage in any world: the cast's data
 * decides, no stage id. The kit half on CastPlay; the engine half in the REAL engine (engineCoreHarness.ts).
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay, type CastHero } from './castPlay.ts';
import type { CastData } from './castPlay.types.ts';
import { DT, makeEngine, standOn, step } from './engineCoreHarness.ts';
import { castOf } from './gen2/pipeline.ts';
import { eagleOver } from './gen2/worlds/w1Cast.ts';
import type { Enemy, Platform } from './types.ts';

const G = 400;
const bough = { id: 1, x: 0, y: G, width: 3000, height: 60, type: 'solid' } as Platform;
const boaAt = (x: number, y = G - 16): Enemy => ({
  id: 700, type: 'boa', x, y, vx: 0, vy: 0, width: 58, height: 26, hp: 1, maxHp: 1, facing: -1, patrolMinX: x, patrolMaxX: x,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
} as Enemy);

/** he runs in on a boa at 1000 at his run's 285 px/s (boaFreeze.test's flight) and stops `gap` px short of it (never stops: -Infinity), 3 s */
function walkIn(gap: number, data: Partial<CastData> = {}) {
  const b = boaAt(1000);
  const c = new CastPlay({ kinds: ['boa'], traps: [], ...data } as CastData, [b], [bough], 1);
  let x = 800, froze = 0, struck = 0, frozeAt = -1, toldAt = -1;
  for (let i = 0, t = 0; i < 90; i++, t += DT) {
    const go = x < 1000 - gap;
    if (go) x += 285 * DT;
    const h: CastHero = { x, y: G, vx: go ? 285 : 0, vy: 0, facing: 1, grounded: true, holding: false };
    const r = c.step(h, DT, t, false);
    if (r.told.length && toldAt < 0) toldAt = i;
    if (r.froze.length) { froze += r.froze.length; frozeAt = i; assert.equal(r.froze[0], b); }
    struck += r.struck.length;
  }
  return { froze, struck, frozeAt, toldAt, way: b.kit!.beatenBy };
}

test('the cast reports a freeze: beaten by his stillness in its rear, him inside its strike (128 px), once; frozen outside its reach, beaten but no moment; never stopping, struck', () => {
  const inside = walkIn(90);
  assert.equal(inside.way, 'still');
  assert.equal(inside.froze, 1, 'reported once, the step it was beaten');
  assert.ok(inside.frozeAt - inside.toldAt >= 29, 'at the end of its 1.0 s rear');
  // (stopped 148 px short: inside its 150 px engage, so it rears, and he is still, so it is beaten; but its strike's box ends 142 px out)
  const outside = walkIn(148);
  assert.equal(outside.way, 'still', 'the control: it was beaten by stillness');
  assert.equal(outside.froze, 0, 'outside its reach: no freeze moment');
  const ran = walkIn(-Infinity);
  assert.equal(ran.froze, 0);
  assert.ok(ran.struck > 0 || ran.way !== 'still');
});

test('a stage that teaches the freeze (CastData.teachStill, from its brief): its FIRST freeze is the moment wherever he stands; later ones only inside the reach (1-9 beat 2)', () => {
  // (148 px short: inside the 150 px engage, outside the strike's box. Untaught it is beaten but no moment: the test above)
  const taught = walkIn(148, { teachStill: true });
  assert.equal(taught.way, 'still');
  assert.equal(taught.froze, 1, "the stage's first freeze is the moment, outside the reach");
  // (two boas on one bough, 700 px apart: he freezes 148 px short of each; only the first is the moment)
  const b1 = boaAt(1000), b2 = { ...boaAt(1700), id: 701 } as Enemy;
  const c = new CastPlay({ kinds: ['boa'], traps: [], teachStill: true } as CastData, [b1, b2], [bough], 1);
  let x = 800, t = 0;
  const froze: Enemy[] = [];
  for (const stop of [1000 - 148, 1700 - 148]) {
    for (let i = 0; i < 150; i++, t += DT) {
      const go = x < stop;
      if (go) x = Math.min(stop, x + 285 * DT);
      const r = c.step({ x, y: G, vx: go ? 285 : 0, vy: 0, facing: 1, grounded: true, holding: false }, DT, t, false);
      froze.push(...r.froze);
    }
    // (the first boa flees 4 s and comes back to its post: he walks on past it while it is away)
  }
  assert.equal(b1.kit!.beatenBy, 'still');
  assert.equal(b2.kit!.beatenBy, 'still', 'the control: the second was beaten by his stillness too');
  assert.deepEqual(froze, [b1], 'only the first freeze, outside the reach');
});

test("the brief says it: a cast stage whose brief teaches 'still' carries teachStill; any other brief, none (so no stage moves)", () => {
  const proto = { hints: [], covers: [], beats: [] } as never;
  assert.equal(castOf({ cast: ['boa'], teaches: ['traps', 'still'] }, proto).cast?.teachStill, true);
  assert.equal(castOf({ cast: ['boa'], teaches: ['traps'] }, proto).cast?.teachStill, undefined);
  assert.equal('teachStill' in (castOf({ cast: ['eagle'], teaches: ['hide'] }, proto).cast ?? {}), false, '1-7 as it is: nothing written');
  assert.deepEqual(castOf({ teaches: ['still'] }, proto), {}, 'no cast, no record');
});

test("the cast says when a sweeper's eye is out: its pass, its dive and its climb back; never perched between passes", () => {
  const z = { x0: 3000, x1: 4400, calm: [6, 6.5] as [number, number] };
  const eg = eagleOver(z, G, 701);
  const c = new CastPlay({ kinds: ['eagle'], traps: [] } as CastData, [eg], [bough], 1);
  const m = c.members[0];
  for (const [phase, out] of [['rest', false], ['hunt', true], ['tell', true], ['act', true], ['recover', true], ['flee', false], ['gone', false]] as const) {
    m.s.phase = phase;
    assert.equal(c.eyeOut(), out, phase);
  }
  // (and a cast with no sweeper never has one out)
  assert.equal(new CastPlay({ kinds: ['boa'], traps: [] } as CastData, [boaAt(1000)], [bough], 1).eyeOut(), false);
});

const Y = 500;
/** the real engine on a World 1 stage, swapped for one long bough with a boa on it (and, `eagle`, an eagle over a far stretch) */
function arena(eagle = false) {
  const { e, input } = makeEngine('1-3', 'normal');
  const ledge = { id: 9001, x: 200, y: Y, width: 1400, height: 40, type: 'solid' } as Platform;
  e.platforms.length = 0;
  e.platforms.push(ledge);
  const b = boaAt(1000, Y - 16);
  e.enemies.length = 0;
  e.enemies.push(b);
  const eg = eagle ? eagleOver({ x0: 3000, x1: 4400, calm: [6, 6.5] }, Y, 9601) : null;
  if (eg) e.enemies.push(eg);
  e.vines.length = 0;
  e.collectibles.length = 0;
  e.proto ??= { hints: [], covers: [], beats: [] };
  e.proto.cast = { kinds: eagle ? ['boa', 'eagle'] : ['boa'], traps: [] };
  e.startCast();
  e.checkpoint = { x: 260, y: Y };
  standOn(e, ledge, 260);
  e.player.hp = e.player.maxHp;
  return { e, input, b, eagleM: eg ? e.cast.members.find((q: { e: Enemy }) => q.e === eg) : null };
}
/** run right until he is 100 px short of the boa (its rear starts at 150), lift the thumb, and watch 5 s: the slow motion's most, when it began, when it was cut */
function freezeIn(o: { eyeOutAt?: 'start' | 'slow' } = {}) {
  const { e, input, b, eagleM } = arena(!!o.eyeOutAt);
  const eyeOut = () => { eagleM.s.phase = 'hunt'; eagleM.s.t = 0; eagleM.s.eyeX = 3000; };
  if (o.eyeOutAt === 'start') eyeOut();
  let most = 0, began = -1, cut = -1;
  for (let i = 0; i < 160; i++) {
    input.state.right = e.player.x < 1000 - 100 && i < 120;
    step(e, 1);
    if (e.slowMoLeft > most) most = e.slowMoLeft;
    if (e.slowMoLeft > 0 && began < 0) {
      began = i;
      if (o.eyeOutAt === 'slow') eyeOut();
    } else if (began >= 0 && cut < 0 && e.slowMoLeft <= 0) cut = i;
  }
  input.state.right = false;
  return { most, began, cut, way: b.kit?.beatenBy, hp: e.player.hp, max: e.player.maxHp, zoom: e.slowMoZoom };
}

test('in the real engine: frozen in a boa\'s rear inside its reach, 0.6 s of slow motion, the view kept (no push-in); he is not hurt', () => {
  const r = freezeIn();
  assert.equal(r.way, 'still', 'the boa was beaten by his stillness');
  assert.ok(r.began >= 0, 'the slow motion played');
  assert.ok(Math.abs(r.most - 0.6) < 1e-9, `0.6 s of it (${r.most})`);
  assert.equal(r.zoom, 1, 'the view kept as it is');
  assert.equal(r.hp, r.max, 'not a scratch');
});

test("in the real engine: never while the eagle's eye is out, and cut short the step one comes out", () => {
  const out = freezeIn({ eyeOutAt: 'start' });
  assert.equal(out.way, 'still', 'the control: the boa was still beaten by his stillness');
  assert.equal(out.most, 0, 'no slow motion with its eye out');
  const mid = freezeIn({ eyeOutAt: 'slow' });
  assert.ok(mid.began >= 0, 'it began with the eye in');
  assert.equal(mid.cut, mid.began + 1, 'and stopped the next step, the eye out');
});
