/**
 * The one carry rule (ENG-W2b item 3; the lead's ruling Q2, 11:36 AM ET 11-15): a jump off anything that carries him keeps its sideways speed
 * (ride.ts RIDE.keep), for every carrier and any rider. Before it, a drifting log moved him by position only (engine.ts drift loop) and a hop
 * off it dropped all of the log's speed: he hung in the air while the log slid on under him, and came down behind where he took off, which
 * feels wrong in the hand. In the real engine at 30 fps: a hop straight up off a log running with him (100 px/s) flies on with the log and
 * comes down on it; planted: with RIDE.keep at 0 the same hop lands short of where the log carried him (the old rule). Still ground keeps
 * nothing: the same hop off a bank lands where it took off.
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { RIDE } from './ride.ts';
import { driftCycle, driftX, LOG_DROP, LOG_HEIGHT, type DriftInfo } from './river.ts';
import type { Platform } from './types.ts';

const BANK = 580;
const bank = (id: number, x: number, w: number): Platform => ({ id, x, y: BANK, width: w, height: 90, type: 'solid', style: 'log' });

/** a hop straight up (no steering) from the middle of a log drifting with him at 100 px/s: how far he travelled, and the log */
function hopOffLog(keep: number): { travelled: number; logMoved: number; onLog: boolean } {
  const was = RIDE.keep.x;
  (RIDE.keep as { x: number }).x = keep;
  try {
    const sim = new RealPlay('1-1', 1);
    const d: DriftInfo = { x0: 1000, x1: 3400, dir: 1, speed: 100, width: 320, offset: 0, baseY: BANK + LOG_DROP };
    // (the log about a third of the way across at the start, wherever the stage's clock stands)
    const T = driftCycle(d);
    for (let k = 0; k < 400 && !(driftX(d, sim.t) > 1500 && driftX(d, sim.t) < 1600); k++) d.offset = (k * T) / 400;
    const log: Platform = { id: 7, x: driftX(d, sim.t), y: d.baseY, width: d.width, height: LOG_HEIGHT, type: 'drift', style: 'log', drift: d };
    sim.bare([bank(1, 0, 1000), log, bank(2, 3400, 1000)]);
    sim.stand(log.x + 160, log.y);
    for (let i = 0; i < 4; i++) sim.frame({});
    assert.equal(sim.standingOn, 7, 'he stands on the log');
    const x0 = sim.p.x, l0 = log.x;
    sim.frame({ press: true, jump: true });
    for (let i = 0; i < 4; i++) sim.frame({ jump: true });
    for (let i = 0; i < 60 && !sim.p.grounded; i++) sim.frame({});
    return { travelled: sim.p.x - x0, logMoved: log.x - l0, onLog: sim.standingOn === 7 };
  } finally {
    (RIDE.keep as { x: number }).x = was;
  }
}

test('a hop straight up off a log running with him flies on with the log and comes down on it (RIDE.keep, every carrier)', () => {
  const r = hopOffLog(1);
  assert.ok(r.onLog, 'he lands back on the log');
  assert.ok(Math.abs(r.travelled - r.logMoved) <= 12, `he flew ${r.travelled.toFixed(0)} px while the log moved ${r.logMoved.toFixed(0)} px`);
});

test('planted: with RIDE.keep at 0 (the old log rule) the same hop lands short, behind where the log carried him', () => {
  const r = hopOffLog(0);
  assert.ok(r.logMoved - r.travelled >= 40, `keep 0: he flew ${r.travelled.toFixed(0)} px, the log ${r.logMoved.toFixed(0)} px`);
});

test('still ground carries nothing: the same hop off a bank lands where it took off', () => {
  const sim = new RealPlay('1-1', 1);
  sim.bare([bank(1, 0, 2000)]);
  sim.stand(900, BANK);
  for (let i = 0; i < 4; i++) sim.frame({});
  const x0 = sim.p.x;
  sim.frame({ press: true, jump: true });
  for (let i = 0; i < 4; i++) sim.frame({ jump: true });
  for (let i = 0; i < 60 && !sim.p.grounded; i++) sim.frame({});
  assert.ok(Math.abs(sim.p.x - x0) <= 2, `moved ${(sim.p.x - x0).toFixed(1)} px`);
});
