// THE NOISE CHANNEL with no engine (ENG-NOISE; castPlay.ts noise/ring/soundAt, heroNoise.ts landingNoise): every noise reaches the
// cast on one channel in the order made; his punch is heard only from the world that teaches noise (roster.ts TAUGHT.noise), so no
// World 1 or World 2 stage hears a blow; quiet ground takes any fall without a sound; a sounding thing fired by the stage is heard as
// a struck one is. The played rows are gen2/noiseRow.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay, type CastHero } from './castPlay.ts';
import type { CastData, SoundPost } from './castPlay.types.ts';
import { LOUD, landingNoise, punchNoise } from './heroNoise.ts';
import { TAUGHT } from './predators/roster.ts';
import type { Enemy, Platform } from './types.ts';

const DT = 1 / 30;
const floor = { id: 1, x: 0, y: 400, width: 2400, height: 30, type: 'solid' } as Platform;
const ocelot = (over: Partial<Enemy> = {}): Enemy => ({
  id: 700, type: 'ocelot', x: 1000, y: 385, vx: 0, vy: 0, width: 52, height: 30, hp: 1, maxHp: 1, facing: -1, patrolMinX: 0, patrolMaxX: 2400,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...over,
} as Enemy);
const hero = (over: Partial<CastHero> = {}): CastHero => ({ x: 400, y: 400, vx: 0, vy: 0, facing: 1, grounded: true, holding: false, ...over });
const stone: SoundPost = { x: 600, y: 400, w: 60, h: 70, sound: 'bell' };
const cast = (world: number, e: Enemy[], sounds: SoundPost[] = []) => new CastPlay({ kinds: ['ocelot'], traps: [], sounds } as CastData, e, [floor], world);

test('quiet ground: no landing noise from any fall; other ground as before (heroNoise.landingNoise reads the ground)', () => {
  for (const fell of [LOUD.landing.soft + 1, 400, 2000]) {
    assert.equal(landingNoise(0, 0, 0, fell, { quiet: true }), null, `${fell} px onto quiet ground`);
    assert.deepEqual(landingNoise(0, 0, 0, fell, { quiet: false }), landingNoise(0, 0, 0, fell), `${fell} px onto other ground: unchanged`);
    assert.ok(landingNoise(0, 0, 0, fell, null)?.r, 'no ground named: as before');
  }
  assert.equal(landingNoise(0, 0, 0, 400)!.r, 360, 'a 400 px fall carries 360 px (180 + 200 x 0.9)');
});

test('his punch is heard only from the world that teaches noise: no World 1 or 2 cast hears a blow (nothing shipped moves)', () => {
  assert.equal(TAUGHT.noise, 3);
  // (World 1's snake: the one kind every world's cast may name, asleep 200 px off)
  for (const world of [1, 2, 3, 4]) {
    const e = ocelot({ type: 'snake', asleep: true });
    const c = new CastPlay({ kinds: ['snake'], traps: [] } as CastData, [e], [floor], world);
    assert.ok(e.kit?.asleep, `world ${world}: the kit runs it, asleep`);
    c.step(hero(), DT, 0, false);
    c.noise(punchNoise(1000 - 200, 400, DT));
    const r = c.step(hero(), DT, DT, false);
    const loud: boolean = world >= TAUGHT.noise;
    assert.deepEqual(r.heard.map((n) => n.from), loud ? ['punch'] : [], `world ${world}`);
    assert.equal(!e.kit!.asleep, loud, `world ${world}: the sleeper 200 px off ${loud ? 'wakes' : 'sleeps on'}`);
  }
});

test('one channel, in the order made: his landing first, then what was made since the last step; heard once, never again', () => {
  const e = ocelot({ asleep: true, x: 5000 });
  const c = cast(3, [e], [stone]);
  c.step(hero({ grounded: false, y: 0 }), DT, 0, false);
  c.noise(punchNoise(400, 400, DT));
  c.ring(0, DT);
  const r = c.step(hero({ grounded: true, y: 400 }), DT, DT, false);
  assert.deepEqual(r.heard.map((n) => n.from), ['landing', 'punch', 'bell']);
  assert.equal(r.landed?.from, 'landing');
  assert.deepEqual(c.step(hero(), DT, 2 * DT, false).heard, [], 'the next step hears nothing new');
});

test('a sounding thing the stage FIRES (ring) is heard as a struck one is: its bell at its place draws an awake ocelot to it', () => {
  const e = ocelot();
  const c = cast(3, [e], [stone]);
  c.step(hero({ x: 100 }), DT, 0, false);
  const n = c.ring(0, DT)!;
  assert.deepEqual({ x: n.x, y: n.y, r: n.r, from: n.from }, { x: stone.x, y: stone.y, r: LOUD.bell.r, from: 'bell' });
  c.step(hero({ x: 100 }), DT, DT, false);
  assert.ok(e.kit!.drawn && e.kit!.goalX === stone.x, 'drawn to the stone (core.ts hear)');
  assert.equal(c.ring(5, DT), null, 'no such thing: nothing made');
});

test('a blow\'s box finds the sounding thing it reaches (its box over the surface it stands on), and none it misses', () => {
  const c = cast(3, [], [stone]);
  assert.equal(c.soundAt({ x: 560, y: 350, w: 20, h: 20 }), 0, 'its left edge, chest high');
  assert.equal(c.soundAt({ x: 520, y: 350, w: 20, h: 20 }), -1, 'short of it');
  assert.equal(c.soundAt({ x: 590, y: 300, w: 20, h: 20 }), -1, 'over its top');
  assert.equal(c.soundAt({ x: 590, y: 402, w: 20, h: 20 }), -1, 'under the surface it stands on');
  assert.equal(cast(3, [], [{ ...stone, x: NaN }]).soundAt({ x: 560, y: 350, w: 20, h: 20 }), -1, 'a post with no place is never laid');
});

test('a flag clears what was made and not yet heard (castPlay.ts calm)', () => {
  const e = ocelot({ asleep: true });
  const c = cast(3, [e]);
  c.noise(punchNoise(900, 400, 0));
  c.calm(false);
  assert.deepEqual(c.step(hero(), DT, DT, false).heard, []);
  assert.ok(e.kit!.asleep);
});
