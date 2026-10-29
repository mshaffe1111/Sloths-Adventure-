import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isHighLedge, stripAt } from './w7TempleArt.ts';
import type { Platform } from './types.ts';

test("World 7's temple wall strips: never the same strip side by side, the sloth face never within 8 columns of itself, wall-4 never on the grid", () => {
  let lastFace = -Infinity;
  let roots = 0;
  for (let n = -400; n < 400; n++) {
    const { s } = stripAt(n);
    assert.notEqual(s, stripAt(n + 1).s, `columns ${n} and ${n + 1}`);
    assert.notEqual(s, 3);
    if (s === 0) roots++;
    if (s === 2) {
      assert.ok(n - lastFace >= 8, `faces at ${lastFace} and ${n}`);
      lastFace = n;
    }
  }
  assert.ok(lastFace > -Infinity, 'the face shows somewhere');
  // (wall-1's root on under a fifth of the columns: the plain wall-5 takes most of its places)
  assert.ok(roots < 800 * 0.2, `wall-1 on ${roots} of 800 columns`);
});

test('a high ledge is a bank 90 px or more over the bank beside it', () => {
  const b = (x: number, y: number, width: number) => ({ x, y, width, height: 750 - y }) as Platform;
  const low = b(0, 600, 300), high = b(300, 480, 200), step = b(500, 440, 200), floor = b(700, 600, 300), far = b(1500, 300, 200), lone = b(2200, 500, 200);
  const banks = [low, high, step, floor, far, lone];
  assert.ok(isHighLedge(high, banks), 'over the floor to its left');
  assert.ok(isHighLedge(step, banks), 'a 40 px step on top of the same run is the same wall');
  assert.ok(!isHighLedge(low, banks));
  assert.ok(!isHighLedge(floor, banks));
  assert.ok(!isHighLedge(lone, banks), 'nothing within 400 px on either side');
});
