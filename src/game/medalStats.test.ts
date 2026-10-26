/**
 * What the engine reports at a stage's end for the medals (badges.ts StageStats), played in the real engine (realPlay.ts): World 5's
 * cakes avoided and silk shaken off, and the stage's difficulty and Dot's help setting.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import { BUTLER, SIT, type W5Extras } from './w5Kit.ts';
import { SILK_SHED_FROM } from './w5Play.ts';
import type { StageStats } from './badges.ts';

const w5Of = (sim: RealPlay) => (sim.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
const stats = (sim: RealPlay, win = true) => (sim.e as unknown as { buildStats(win: boolean, stars: number): StageStats }).buildStats(win, 3);

test("5-2: a tray punched away counts as a cake avoided, and on a clear so does every cake left uneaten", () => {
  const sim = new RealPlay('5-2', 1);
  const cakes = w5Of(sim).cakes?.length ?? 0;
  assert.ok(cakes > 0);
  assert.equal(stats(sim, false).cakesAvoided, 0, 'nothing avoided yet on a stage lost at once');
  const b = w5Of(sim).butlers![0];
  sim.stand(b.x - 120, G);
  sim.p.facing = 1;
  for (let i = 0; i < Math.ceil(BUTLER.tell * 30) + 3; i++) sim.frame();
  sim.stand(b.x - 80, G);
  sim.p.facing = 1;
  const st = () => sim.e.w5.butlers[0] as { phase: string };
  for (let i = 0; i < 12 && st().phase === 'offer'; i++) sim.frame({ punch: i === 0 });
  assert.equal(st().phase, 'knocked');
  assert.equal(stats(sim, false).cakesAvoided, 1, 'the tray');
  assert.equal(stats(sim, true).cakesAvoided, 1 + cakes, 'the tray and every cake not eaten');
  const s = stats(sim);
  assert.ok((s.punches ?? 0) >= 0 && (s.kicks ?? 0) >= 0 && (s.swings ?? 0) >= 0 && (s.freed ?? 0) >= 0);
  assert.equal(s.difficulty, 'normal');
  assert.equal(typeof s.quiet, 'boolean');
});

test('5-2: silk that had crept a quarter of the way up him and is shaken off counts once', () => {
  const sim = new RealPlay('5-2', 1);
  sim.safe = false;
  sim.stand(600, G);
  for (let i = 0; i < 3; i++) sim.frame({ right: true });
  for (let i = 0; i < 6; i++) sim.frame();
  // stand still until the silk has a real hold (short of the wrap)
  for (let i = 0; i < 30 * (SIT.drowse + SIT.creep) && sim.e.w5.silk < SILK_SHED_FROM + 0.05; i++) sim.frame();
  assert.ok(sim.e.w5.silk >= SILK_SHED_FROM, `silk ${sim.e.w5.silk}`);
  assert.equal(stats(sim).silkShed, 0);
  for (let k = 0; k < 12 && sim.e.w5.silk > 0; k++) {
    for (let i = 0; i < 3; i++) sim.frame({ left: true });
    for (let i = 0; i < 3; i++) sim.frame({ right: true });
  }
  assert.equal(sim.e.w5.silk, 0, 'shaken off');
  assert.equal(stats(sim).silkShed, 1);
});
