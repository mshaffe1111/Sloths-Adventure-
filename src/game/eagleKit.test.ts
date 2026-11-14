/**
 * 1-7's eagle on the creature kit (ENG-E1, 1-7.md NEW 3, 4, 7): the free first pass over a stretch (watcher.ts freeFirst's rule, moved
 * into the kit), the eagle's own cool per stretch, and the moss coming over him only in cover (CastPlay.calmNow). Planted: each fails on
 * the base (t-eng-s1@a1739b43), where the kit has no free pass, one cool for every eagle and no calm reading.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay, type CastHero } from './castPlay.ts';
import { coolOf, newPredator } from './predators/core.ts';
import { EAGLE } from './predators/world1.ts';
import type { Cover } from './stillness.ts';
import type { Enemy, Platform } from './types.ts';

const GROUND = 500;
const ground: Platform[] = [{ id: 1, x: -200, y: GROUND, width: 2000, height: 40, type: 'solid' } as Platform];
const eagle = (o: Partial<Enemy> = {}): Enemy =>
  ({ id: 7, type: 'eagle', x: 200, y: GROUND - 220, vx: 0, vy: 0, width: 58, height: 42, hp: 1, maxHp: 1, facing: 1, patrolMinX: 0, patrolMaxX: 800,
    attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...o }) as Enemy;
const hero = (x = 400): CastHero => ({ x, y: GROUND, vx: 0, vy: 0, facing: 1, grounded: true, holding: false });

/** run the cast with him standing still in the open; what each act did, in order: 'hurt' or 'spared' */
function acts(e: Enemy, easy: boolean, seconds: number, covers: Cover[] = []): string[] {
  const c = new CastPlay({ kinds: ['eagle'], traps: [] }, [e], ground, 1, covers);
  const out: string[] = [];
  const h = hero();
  const dt = 1 / 30;
  let hurting = false;
  for (let i = 0; i < seconds * 30; i++) {
    const r = c.step(h, dt, i * dt, easy);
    if (r.spared.length) out.push('spared');
    const now = r.hurts.length > 0;
    if (now && !hurting) out.push('hurt');
    hurting = now;
  }
  return out;
}

test('a free eagle: its first pass over him dives and pulls up short (no box hurts); the next one is real', () => {
  const got = acts(eagle({ kitFree: true }), false, 24);
  assert.ok(got.length >= 2, `two passes found him in 24 s: ${got.join(',')}`);
  assert.equal(got[0], 'spared', `the first act is spared: ${got.join(',')}`);
  assert.equal(got[1], 'hurt', `the second act hurts: ${got.join(',')}`);
});

test('an eagle laid plain: its first pass is real on Normal, free on Easy (every stretch, 1-7.md Easy)', () => {
  assert.equal(acts(eagle(), false, 12)[0], 'hurt');
  assert.equal(acts(eagle(), true, 14)[0], 'spared');
});

test("an eagle's own cool per stretch beats the kind's, and Easy still waits longer", () => {
  assert.equal(coolOf(EAGLE, false, 6.5), 6.5);
  assert.ok(coolOf(EAGLE, true, 6.5) > 6.5);
  assert.equal(coolOf(EAGLE, false), EAGLE.cool);
  const s = newPredator(EAGLE, { x: 0, y: 0, minX: 0, maxX: 800, cool: 6.5 });
  assert.equal(s.ownCool, 6.5);
  // in a run: the gap between the two acts is the stretch's own cool, not the kind's 5 s
  const gap = (cool?: number): number => {
    const c = new CastPlay({ kinds: ['eagle'], traps: [] }, [eagle({ kitCool: cool })], ground, 1, []);
    const h = hero();
    const at: number[] = [];
    for (let i = 0; i < 40 * 30 && at.length < 2; i++) if (c.step(h, 1 / 30, i / 30, false).struck.length) at.push(i / 30);
    return at[1] - at[0];
  };
  const plain = gap(), long = gap(9);
  assert.ok(Math.abs(long - plain - (9 - EAGLE.cool)) < 0.2, `acts ${plain.toFixed(2)} s apart plain, ${long.toFixed(2)} s with its own 9 s cool`);
});

test('the moss comes over him only in cover: none still in the open, all the way in after the calm-in, gone the step he moves', () => {
  const cover: Cover[] = [{ x: 350, w: 120, y: GROUND }];
  const c = new CastPlay({ kinds: [], traps: [] }, [], ground, 1, cover);
  const h = hero(200);
  for (let i = 0; i < 30; i++) c.step(h, 1 / 30, i / 30, false);
  assert.equal(c.calmNow(false), 0, 'still on bare bark: no moss');
  // (he walks in: the walk breaks the calm, then it comes in again where he stops)
  h.x = 410;
  h.vx = 120;
  c.step(h, 1 / 30, 1, false);
  assert.equal(c.calmNow(false), 0, 'walking in: none yet');
  h.vx = 0;
  c.step(h, 1 / 30, 1, false);
  assert.ok(c.calmNow(false) > 0 && c.calmNow(false) < 0.2, `it starts to come in: ${c.calmNow(false)}`);
  for (let i = 0; i < 15; i++) c.step(h, 1 / 30, 1 + i / 30, false);
  assert.equal(c.calmNow(false), 1, 'all the way in after 0.5 s');
  h.vx = 120;
  c.step(h, 1 / 30, 2, false);
  assert.equal(c.calmNow(false), 0, 'a step breaks it at once');
});

test('a mossy liana is cover while he holds it, wherever it swings; another vine is not; climbing it is moving', () => {
  const ropes: Cover[] = [{ x: 0, w: 0, y: 0, rope: 42 }];
  const c = new CastPlay({ kinds: [], traps: [] }, [], ground, 1, ropes);
  // (swung far from where any bush stands: the rope's cover goes with it)
  const h: CastHero = { x: 1300, y: 260, vx: 180, vy: 0, facing: 1, grounded: false, holding: true, rope: 42 };
  for (let i = 0; i < 16; i++) c.step(h, 1 / 30, i / 30, false);
  assert.equal(c.calmNow(false), 1, 'held still on the mossy liana as it swings: the moss is all the way in');
  h.rope = 7;
  c.step(h, 1 / 30, 1, false);
  assert.equal(c.calmNow(false), 0, 'a plain vine is no cover');
  h.rope = 42;
  h.vy = -60;
  c.step(h, 1 / 30, 1.1, false);
  assert.equal(c.calmNow(false), 0, 'climbing it is moving');
});
