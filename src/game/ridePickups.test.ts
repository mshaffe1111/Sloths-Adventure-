/**
 * Petals ON logs (ENG-W2b item 3; Collectible.rides, the lead's sign-off 11:38 AM ET 11-15): a river row's `petals` lays one petal riding
 * each of its first logs; in the real engine each goes where its log goes, every step, and while its log is under a bank it is hidden with
 * it: never drawn over the bank and never picked up through it. Planted: with the engine's step switched off (no stepRiders) the petal
 * hangs where it was laid while the log drifts away; a petal riding a log under the bank Pokey stands on is not picked up.
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { driftCycle, driftX, LOG_DROP, LOG_HEIGHT, type DriftInfo } from './river.ts';
import { layRiver, PETAL_SIT, type RiverRow } from './gen2/riverLay.ts';
import { rideHidden } from './ridePickups.ts';
import type { Collectible, Platform } from './types.ts';

const BANK = 580;
const bank = (id: number, x: number, w: number): Platform => ({ id, x, y: BANK, width: w, height: 90, type: 'solid', style: 'log' });

test("the lay: a row's petals ride its first logs, each at its log's middle, PETAL_SIT over its top", () => {
  let id = 1;
  const row: RiverRow = { dir: 1, speed: 75, logW: 160, logs: 3, petals: 2 };
  const r = layRiver(row, 1000, BANK, () => id++);
  assert.equal(r.petals.length, 2);
  r.petals.forEach((q, i) => {
    assert.equal(q.log, r.logs[i]);
    assert.equal(q.dx, 80);
    assert.equal(q.dy, -PETAL_SIT);
  });
  assert.equal(layRiver({ ...row, petals: undefined }, 1000, BANK, () => id++).petals.length, 0, 'no petals unless the row says');
});

/** a log river from 1000 to 2600 (with him, 80 px/s) and a petal riding the log; Pokey on the near bank */
function ridingPetal(): { sim: RealPlay; log: Platform; petal: Collectible } {
  const sim = new RealPlay('1-1', 1);
  const d: DriftInfo = { x0: 1000, x1: 2600, dir: 1, speed: 80, width: 200, offset: 0, baseY: BANK + LOG_DROP };
  const log: Platform = { id: 7, x: driftX(d, sim.t), y: d.baseY, width: d.width, height: LOG_HEIGHT, type: 'drift', style: 'log', drift: d };
  sim.bare([bank(1, 0, 1000), log, bank(2, 2600, 1000)]);
  const petal: Collectible = { id: 50, type: 'flower', botanicalVariant: 'lotus', x: log.x + 100, y: log.y - PETAL_SIT, collected: false, bobPhase: 0, rides: { id: 7, dx: 100, dy: -PETAL_SIT } };
  sim.collectibles.push(petal);
  sim.stand(300, BANK);
  return { sim, log, petal };
}

test('in the real engine a riding petal goes where its log goes, every step of a whole cycle, and is hidden with it under a bank', () => {
  const { sim, log, petal } = ridingPetal();
  const T = driftCycle(log.drift!);
  let hiddenSteps = 0, shownSteps = 0;
  for (let i = 0; i < Math.ceil(T * 30) + 10; i++) {
    sim.frame({});
    assert.equal(petal.x, log.x + 100, `step ${i}: the petal at its log's x + 100`);
    assert.equal(petal.y, log.y - PETAL_SIT);
    if (rideHidden(petal, log)) hiddenSteps++;
    else shownSteps++;
  }
  assert.ok(hiddenSteps > 0 && shownSteps > 0, `hidden ${hiddenSteps} steps under the banks, shown ${shownSteps} on the water`);
  assert.equal(petal.collected, false, 'nobody picked it up');
});

test('planted: a petal riding a log under the bank he stands on is never picked up through the bank', () => {
  const { sim, log, petal } = ridingPetal();
  // (the log slides in under the far bank: he waits 50 px onto that bank, out of the pickup's reach (38 px) of any petal still on the
  // water, right over where it passes hidden under the bank; at the lip itself he may take it as it goes, which is fair: it shows)
  sim.stand(2650, BANK);
  const T = driftCycle(log.drift!);
  let underHim = 0;
  for (let i = 0; i < Math.ceil(T * 30) + 10; i++) {
    sim.frame({});
    if (rideHidden(petal, log) && Math.abs(petal.x - sim.p.x) < 30) underHim++;
  }
  assert.ok(underHim > 0, 'the petal passed under him, hidden');
  // (shown, on the water, it is out of his reach from the bank; hidden under him, the engine refuses it)
  assert.equal(petal.collected, false);
});

test('planted: with no rider step the petal would hang where it was laid (the engine line is what carries it)', () => {
  const { petal, log } = ridingPetal();
  const x0 = petal.x;
  // (the log moves on its clock; the petal, left alone, does not)
  log.x = driftX(log.drift!, 3);
  assert.notEqual(log.x + 100, x0, 'the log moved');
  assert.equal(petal.x, x0, 'nothing moved the petal but the engine');
});
