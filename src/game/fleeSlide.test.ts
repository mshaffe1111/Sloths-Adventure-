/**
 * ENG-19c (1-9's promise, "Boa rearing up? Don't move, and it slides off!"; BUILD-19b's clips): an IMMOBILE animal (no speed, not a
 * sweeper: core.ts immobile) beaten into a flee is SEEN to go: it slides away from him along its ground and off its end (castPlay drops
 * and fades it there), and comes back the same way, home as its away time ends. Before, its flee walked it 'home' where it already lay:
 * it sat coiled on its post for the whole 4 s and he walked through it. A chased-off animal never leaves THROUGH him: the roost's boa bolted
 * from the nest straight at him. And an animal gone on its own plays no knock-out: no landing burst at its feet. Any world, by the data.
 * Planted: each assertion here is red with its fix off (the slide: x never moves; the leave: it goes left through him; the burst: one).
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay, type CastHero } from './castPlay.ts';
import type { CastData } from './castPlay.types.ts';
import { DT, makeEngine, step } from './engineCoreHarness.ts';
import { FLEE_OFF, beat, immobile, newPredator, stepPredator } from './predators/core.ts';
import { BOA, EAGLE } from './predators/world1.ts';
import { JAGUAR, OCELOT } from './predators/world3.ts';
import type { Enemy, Platform } from './types.ts';

const G = 400;
// (a bough 600-1600: the kit's range for a 58 px body on it, 24 px in from each end)
const bough = { id: 1, x: 600, y: G, width: 1000, height: 60, type: 'solid' } as Platform;
const MIN = 624, MAX = 1518;
const boaAt = (x: number, y = G - 16): Enemy => ({
  id: 700, type: 'boa', x, y, vx: 0, vy: 0, width: 58, height: 26, hp: 1, maxHp: 1, facing: -1, patrolMinX: MIN, patrolMaxX: MAX,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
} as Enemy);
const hero = (x: number, vx = 0): CastHero => ({ x, y: G, vx, vy: 0, facing: vx < 0 ? -1 : 1, grounded: true, holding: false });

/** he walks in on the boa at 1000 from `from` and stops 90 px short of it (inside its strike: the freeze); 8 s logged */
function freezeOn(from: number, easy: boolean) {
  const b = boaAt(1000);
  const c = new CastPlay({ kinds: ['boa'], traps: [] } as CastData, [b], [bough], 1);
  const dir = from < 1000 ? 1 : -1;
  const stopAt = dir > 0 ? 1000 - 90 : 1000 + 58 + 90;
  let x = from, struck = 0, beatenAt = -1, far = 1000, faded = 0;
  const xs: number[] = [];
  for (let i = 0, t = 0; i < 240; i++, t += DT) {
    const go = dir > 0 ? x < stopAt : x > stopAt;
    if (go) x += dir * 285 * DT;
    const r = c.step(hero(x, go ? dir * 285 : 0), DT, t, easy);
    // (it strikes nothing, and while it flees it holds no hurting box at all, wherever he stands)
    struck += r.struck.length + (c.members[0].s.phase === 'flee' ? r.hurts.length : 0);
    if (beatenAt < 0 && b.kit?.beatenBy === 'still') beatenAt = i;
    if (beatenAt >= 0) {
      xs.push(b.x);
      far = dir > 0 ? Math.max(far, b.x) : Math.min(far, b.x);
      faded = Math.max(faded, b.glide ?? 0);
    }
  }
  return { b, struck, beatenAt, far, faded, xs, end: c.members[0].s };
}

test('immobile: the boa (no speed of its own) is; the eagle (a sweeper) and the jaguar (it walks) are not', () => {
  assert.equal(immobile(BOA), true);
  assert.equal(immobile(EAGLE), false);
  assert.equal(immobile(JAGUAR), false);
});

for (const easy of [false, true]) {
  const set = easy ? 'Easy' : 'Normal';
  test(`${set}: a boa beaten by his stillness slides AWAY from him, off its bough's end and out of sight, then comes back home; never hurts`, () => {
    // (he comes from the left: it goes right)
    const r = freezeOn(700, easy);
    assert.ok(r.beatenAt >= 0, 'beaten by his stillness');
    assert.equal(r.struck, 0, 'nothing hurts him while it flees');
    assert.ok(r.far >= MAX + FLEE_OFF * 0.9, `it slid to x ${Math.round(r.far)}, past its bough's end (${MAX}) by ${Math.round(r.far - MAX)} px`);
    assert.ok(r.faded >= 0.9, `faded to ${r.faded.toFixed(2)} off the end`);
    // (out of sight within 2 s of the freeze, and moving away the whole way out)
    const outBy = r.xs.findIndex((x) => x >= MAX + FLEE_OFF * 0.9);
    assert.ok(outBy >= 0 && outBy * DT <= 2, `off the end ${(outBy * DT).toFixed(2)} s after the freeze`);
    for (let i = 1; i <= outBy; i++) assert.ok(r.xs[i] >= r.xs[i - 1], `step ${i}: it came back toward him on its way out`);
    // (home again as its away time ends, whole and drawn)
    assert.equal(r.end.phase, 'rest', `back at rest (${r.end.phase})`);
    assert.equal(r.b.x, 1000, 'home on its post');
    assert.equal(r.b.glide ?? 0, 0, 'drawn whole again');
  });
  test(`${set}: from the other side it slides the other way (away from him, whichever side he is on)`, () => {
    const r = freezeOn(1400, easy);
    assert.ok(r.beatenAt >= 0, 'beaten by his stillness');
    assert.equal(r.struck, 0);
    assert.ok(r.far <= MIN - FLEE_OFF * 0.9, `it slid to x ${Math.round(r.far)}, past its bough's left end (${MIN})`);
  });
}

test("a walking animal's flee is today's: it walks home (the ocelot beaten by stillness at home stays there), never the slide", () => {
  assert.equal(immobile(OCELOT), false);
  const s = newPredator(OCELOT, { x: 1000, y: G, minX: 600, maxX: 1500, facing: -1 });
  assert.ok(beat(OCELOT, s, 'still', 0));
  for (let i = 1; i <= 60; i++) stepPredator(OCELOT, s, { t: i * DT, dt: DT, hero: { x: 800, y: G, still: true } as never, easy: false });
  assert.equal(s.x, 1000);
});

/** a boa chased off by a lure from its right (the roost's nest at 1100), him standing at `heroX`: where it goes */
function chased(heroX: number) {
  const b = boaAt(1000);
  const c = new CastPlay({ kinds: ['boa'], traps: [] } as CastData, [b], [bough], 1);
  c.step(hero(heroX), DT, 0, false);
  assert.ok(c.beat(b, 'lure', DT, 1100), 'the lure beats it');
  // (followed until it is gone: the furthest it got from where it lay, either way)
  let cleared = false, x = b.x;
  for (let i = 2, t = 2 * DT; i < 90 && c.members[0].s.phase !== 'gone'; i++, t += DT) {
    const r = c.step(hero(heroX), DT, t, false);
    cleared ||= r.cleared.length > 0;
    if (Math.abs(b.x - 1000) > Math.abs(x - 1000)) x = b.x;
  }
  return { cleared, x };
}

test('a chased-off boa never leaves through him: with him close on the side away from what scared it, it leaves the other way', () => {
  const near = chased(900);
  assert.ok(near.cleared, 'it left');
  assert.ok(near.x > 1060, `with him 100 px off on its left it went right, to x ${Math.round(near.x)}, past the nest's side, never through him`);
  // (him far off: away from what scared it, as before)
  const far = chased(300);
  assert.ok(far.cleared);
  assert.ok(far.x < 940, `with him 700 px off it went left, away from the nest, to x ${Math.round(far.x)}`);
});

test('in the real engine an animal gone on its own plays no knock-out: no landing burst where it went (the roost boa\'s brown burst)', () => {
  const { e } = makeEngine('1-3', 'normal');
  const Y = 600;
  const ledge = { id: 9001, x: 200, y: Y, width: 1400, height: 40, type: 'solid' } as Platform;
  e.platforms.length = 0;
  e.platforms.push(ledge);
  const b = boaAt(1000, Y - 16);
  b.patrolMinX = 224;
  b.patrolMaxX = 1518;
  e.enemies.length = 0;
  e.enemies.push(b);
  e.vines.length = 0;
  e.collectibles.length = 0;
  e.proto ??= { hints: [], covers: [], beats: [] };
  e.proto.cast = { kinds: ['boa'], traps: [] };
  e.startCast();
  Object.assign(e.player, { x: 300, y: Y, vx: 0, vy: 0, grounded: true });
  const bursts: number[] = [];
  const spawn = e.spawnDebrisBurst.bind(e);
  e.spawnDebrisBurst = (x: number, y: number, c: string) => { bursts.push(x); spawn(x, y, c); };
  assert.ok(e.cast.beat(b, 'lure', e.gameTime, 1100), 'chased off');
  step(e, 120);
  assert.ok(b.defeated, 'gone');
  assert.deepEqual(bursts, [], 'no burst');
});
