/**
 * The kit eagle as drawn (sweepPose.ts, ENG-E1, 1-7.md NEW 2): far off and faint between passes over his stretch, nothing over a
 * stretch he is not in, in at the edge of the view for the screech while its eye waits off screen, over its eye with its shadow on the
 * ground for the pass, down to him in the dive, pulling up short on a free pass, and out of the view when stillness beats it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { newPredator, stepPredator } from './predators/core.ts';
import type { Prey, Scene } from './predators/types.ts';
import { EAGLE } from './predators/world1.ts';
import { SKY, sweepPose } from './sweepPose.ts';

const view = { x: 1000, y: 0, w: 412 };
const hero = { x: 1150, y: 500 };
const scene = (p: Prey, t: number): Scene => ({ t, dt: 1 / 30, hero: p, easy: false });
const prey = (o: Partial<Prey> = {}): Prey => ({ x: hero.x, y: hero.y, facing: 1, still: false, covered: false, ...o });

test('between passes it circles far off, small and faint, only over his stretch; it fades in from nothing', () => {
  const s = newPredator(EAGLE, { x: 0, y: 500, minX: 200, maxX: 1600 });
  s.cool = 3;
  s.t = 2;
  const p = sweepPose(EAGLE, s, { hero, view, easy: false, spared: false, time: 1 })!;
  assert.equal(p.scale, SKY.far.scale);
  assert.ok(p.alpha <= SKY.far.alpha && p.alpha > 0.4);
  assert.ok(p.x >= view.x && p.x <= view.x + view.w && p.snap);
  assert.equal(p.shadow, null, 'no shadow while it is far off');
  assert.equal(sweepPose(EAGLE, s, { hero: { x: 3000, y: 500 }, view, easy: false, spared: false, time: 1 }), null, 'he is not in its stretch: nothing');
});

test('the warn: its eye waits off screen, so it shows in at the edge it comes from, flaring, with no shadow yet; then the pass carries it over its eye', () => {
  const s = newPredator(EAGLE, { x: 0, y: 500, minX: 200, maxX: 1600 });
  const p = prey();
  stepPredator(EAGLE, s, scene(p, 0));
  assert.equal(s.phase, 'hunt');
  s.t = 1;
  const w = sweepPose(EAGLE, s, { hero, view, easy: false, spared: false, time: 1 })!;
  assert.equal(w.phase, 'patrol', "no flare: the sprite's telegraph is a code-drawn ring and a '!'");
  assert.ok(w.scale < 1, 'it grows nearer through the warn');
  assert.ok(Math.abs(w.x - (view.x + Math.min(SKY.inX, view.w * SKY.inShare))) < 1, `in at the left edge: ${w.x}`);
  assert.equal(w.shadow, null, 'its eye is off screen: no shadow on the ground there');
  // the pass: run it until its eye is in view
  for (let t = 0; t < 6 && s.eyeX < view.x + 200; t += 1 / 30) stepPredator(EAGLE, s, scene(prey({ x: 1500 }), t));
  const f = sweepPose(EAGLE, s, { hero: { x: 1500, y: 500 }, view, easy: false, spared: false, time: 2 })!;
  assert.equal(f.x, s.eyeX, 'it flies over its eye');
  assert.equal(f.shadow?.x, s.eyeX, 'its shadow is under its eye');
  assert.ok(f.y < hero.y - 300, 'high in the sky');
});

test('the dive comes down to him over its tell; a free pass pulls up short of him; it climbs out of view when stillness beats it', () => {
  const s = newPredator(EAGLE, { x: 0, y: 500, minX: 200, maxX: 1600 });
  s.phase = 'tell';
  s.eyeX = 1100;
  s.t = 0;
  const top = sweepPose(EAGLE, s, { hero, view, easy: false, spared: false, time: 0 })!;
  s.t = EAGLE.tell;
  const down = sweepPose(EAGLE, s, { hero, view, easy: false, spared: false, time: 0 })!;
  const short = sweepPose(EAGLE, s, { hero, view, easy: false, spared: true, time: 0 })!;
  assert.ok(top.y < down.y && Math.abs(down.x - hero.x) < 1 && Math.abs(down.y - (hero.y - SKY.over)) < 1, 'all the way down to him');
  assert.ok(down.attacking && !short.attacking, 'talons out only when it is real');
  assert.equal(short.y, hero.y - SKY.over - SKY.short, 'the free pass pulls up 70 px over him');
  s.phase = 'flee';
  s.t = 1.2;
  assert.ok(sweepPose(EAGLE, s, { hero, view, easy: false, spared: false, time: 0 })!.alpha < 0.01, 'gone from view');
});
