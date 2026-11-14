import test from 'node:test';
import assert from 'node:assert/strict';
import { hidden, newWatch, sees, shadowX, stepWatch, WATCH, zoneAt, type Bush, type WatchZone } from './watcher.ts';
import { buildProtoStage, G } from './protoStage.ts';
import type { LevelConfig } from './types.ts';

const zones: WatchZone[] = [{ x0: 1000, x1: 5000, calm: [6, 6] }];
const bushes: Bush[] = [{ x: 1500, w: 124, y: 580, kind: 'tall' }, { x: 3000, w: 104, y: 440, kind: 'tall', hanging: true }];
const open = { x: 2000, y: 580, ducking: false, grounded: true, hanging: false };

test('the eagle keeps a steady rhythm: calm, a warning, a sweep, then calm again, the sweep changing side each time', () => {
  const s = newWatch();
  s.dur = 6;
  const z = zoneAt(zones, 2000);
  const phases: string[] = [];
  let warned = 0;
  for (let i = 0; i < 30 * 30; i++) {
    const ev = stepWatch(s, 1 / 30, z, () => 0.5);
    if (ev.warned) warned++;
    if (phases[phases.length - 1] !== s.phase) phases.push(s.phase);
  }
  // 30 s at 6 + 2.0 + 2.6 = 10.6 s a cycle: warnings at 6, 16.6 and 27.2 s, two sweeps finished
  assert.equal(warned, 3);
  assert.equal(s.passes, 2);
  assert.deepEqual(phases.slice(0, 4), ['calm', 'warn', 'pass', 'calm']);
  // two sweeps, one each way: back to the side it started from
  assert.equal(s.dir, 1);
});

test('outside a watched stretch the eagle stays away', () => {
  const s = newWatch();
  for (let i = 0; i < 30 * 30; i++) assert.deepEqual(stepWatch(s, 1 / 30, zoneAt(zones, 200), () => 0.5), {});
  assert.equal(s.phase, 'calm');
});

test('the shadow crosses the whole view during a sweep', () => {
  const s = newWatch();
  s.phase = 'pass';
  s.dir = 1;
  s.t = 0;
  assert.ok(shadowX(s, 1000, 844) < 1000);
  s.t = WATCH.pass;
  assert.ok(shadowX(s, 1000, 844) > 1844);
});

test('crouching inside a bush or hanging inside a hanging bush hides him; standing in a bush or out in the open does not', () => {
  assert.equal(hidden(bushes, { ...open, x: 1560, ducking: true }), true);
  assert.equal(hidden(bushes, { ...open, x: 1560, ducking: false }), false);
  assert.equal(hidden(bushes, { ...open, ducking: true }), false);
  assert.equal(hidden(bushes, { x: 3050, y: 520, ducking: false, grounded: false, hanging: true }), true);
  assert.equal(hidden(bushes, { x: 3200, y: 520, ducking: false, grounded: false, hanging: true }), false);
});

test('the shadow sees him only during the sweep, only near it, and only once a sweep', () => {
  const s = newWatch();
  s.phase = 'pass';
  assert.equal(sees(s, 2000, bushes, open), true);
  assert.equal(sees(s, 2300, bushes, open), false);
  s.seen = true;
  assert.equal(sees(s, 2000, bushes, open), false);
  s.seen = false;
  s.phase = 'warn';
  assert.equal(sees(s, 2000, bushes, open), false);
});
