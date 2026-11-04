import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { LONG_FALL } from './engine.ts';
import { BEAT_STAGES } from '../audio/scenes.ts';

// Long falls hurt (Matt, 2026-11-04: "make long fall hurt"; engine.ts longFallLanding): on the stages rebuilt on the beat, landing after a
// free fall of more than LONG_FALL px from the fall's highest point costs a heart on Normal and is a stumble on Easy

/** walk off a ledge and fall `drop` px onto a floor, in a bare world on stage `id`: the hearts it cost, and whether it was a fall */
function fall(id: string, drop: number, opts: { easy?: boolean; glide?: boolean; zone?: boolean } = {}) {
  setDifficulty(opts.easy ? 'easy' : 'normal');
  const sim = new RealPlay(id, 1);
  setDifficulty('normal');
  sim.safe = false;
  const e = sim.e as unknown as { skills: Set<string>; currentStage: { fallZones?: unknown } };
  sim.bare([{ id: 1, x: 0, y: 1000, width: 400, height: 24, type: 'solid', style: 'branch' }, { id: 2, x: 0, y: 1000 + drop, width: 4000, height: 90, type: 'solid' }]);
  if (opts.glide) e.skills.add('glide');
  if (opts.zone) e.currentStage.fallZones = [{ x0: 390, x1: 2000, depth: 300 }];
  sim.stand(370, 1000);
  sim.wait(0.3);
  sim.p.invincibleTimer = 0;
  const hp0 = sim.p.hp;
  for (let f = 0; f < 120 && !sim.died; f++) sim.frame({ right: f < 20, jump: !!opts.glide && f > 24 });
  return { lost: hp0 - sim.p.hp, died: sim.died, landed: sim.p.grounded && Math.abs(sim.p.y - (1000 + drop)) < 3 };
}

test('a fall of more than 400 px costs a heart on Normal; 399 px does not', () => {
  assert.equal(LONG_FALL, 400);
  const over = fall('1-1', 401);
  assert.ok(over.landed);
  assert.equal(over.lost, 1, '401 px: a heart');
  const under = fall('1-1', 399);
  assert.ok(under.landed);
  assert.equal(under.lost, 0, '399 px: nothing');
});

test('on Easy a long fall is a stumble: no heart, ever', () => {
  for (const d of [401, 600, 900]) assert.equal(fall('1-1', d, { easy: true }).lost, 0, `${d} px`);
});

test('a glide never hurts, however far', () => {
  const g = fall('1-1', 700, { glide: true });
  assert.ok(g.landed);
  assert.equal(g.lost, 0);
});

test('a fall into a fallZone is the pit (a life), not a pit and a heart', () => {
  const z = fall('1-1', 900, { zone: true });
  assert.ok(z.died, 'the pit');
  assert.equal(z.lost, 0, 'no heart on top');
});

test('only the five rebuilt stages: elsewhere a long fall is as it always was', () => {
  assert.deepEqual([...BEAT_STAGES].sort(), ['1-1', '1-2', '1-3', '1-4', '1-5']);
  for (const id of BEAT_STAGES) assert.equal(fall(id, 450).lost, 1, id);
  for (const id of ['1-6', '1-7', '2-1', '3-5', '7-3', '9-2']) assert.equal(fall(id, 450).lost, 0, id);
});
