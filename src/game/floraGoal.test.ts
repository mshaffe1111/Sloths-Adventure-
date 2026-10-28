/**
 * The out-of-lives card and the HUD's bar count a gather stage's flowers against the same total, the goal's (QA 2-2, 2026-10-28: the
 * bar said 107 and the card "1/122"). Real engine (realPlay.ts): the stage-end stats carry the goal the HUD is sent.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';

test('2-2: the stage-end stats give the flowers out of the goal the HUD shows', () => {
  const sim = new RealPlay('2-2', 1);
  const sent: Array<{ cur: number; target: number }> = [];
  sim.e.callbacks.onProgressUpdate = (cur: number, target: number) => sent.push({ cur, target });
  for (let i = 0; i < 90; i++) sim.frame({ right: true });
  const stats = sim.e.buildStats(false, 0);
  const hud = sent[sent.length - 1];
  assert.ok(hud, 'the HUD was sent the count');
  assert.ok(stats.floraTotal > hud.target, `the stage holds more flowers (${stats.floraTotal}) than the goal (${hud.target})`);
  assert.deepEqual(stats.floraGoal, hud);
});
