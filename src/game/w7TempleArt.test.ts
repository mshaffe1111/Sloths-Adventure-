import { test } from 'node:test';
import assert from 'node:assert/strict';
import { highLedge, isHighLedge } from './w7TempleArt.ts';
import type { Platform } from './types.ts';

test('a high ledge is a bank 90 px or more over the bank beside it', () => {
  const b = (x: number, y: number, width: number) => ({ x, y, width, height: 750 - y }) as Platform;
  const low = b(0, 600, 300), high = b(300, 480, 200), step = b(500, 440, 200), floor = b(700, 600, 300), far = b(1500, 300, 200), lone = b(2200, 500, 200);
  const banks = [low, high, step, floor, far, lone];
  assert.ok(isHighLedge(high, banks), 'over the floor to its left');
  assert.ok(isHighLedge(step, banks), 'a 40 px step on top of the same run is the same wall');
  assert.ok(!isHighLedge(low, banks));
  assert.ok(!isHighLedge(floor, banks));
  assert.ok(!isHighLedge(lone, banks), 'nothing within 400 px on either side');
  // (its wall hangs from the run's highest top, the same for every bank of the run, and ends at the floor beside it)
  assert.deepEqual(highLedge(step, banks), { foot: 600, runTop: 440 });
  assert.deepEqual(highLedge(high, banks), { foot: 600, runTop: 440 });
});
