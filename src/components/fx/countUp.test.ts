import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNT_MS, COUNT_START_MS, STARS_START_MS, TICK_MAX, countProgress, countValue, medalsAtMs, starTimes, tickTimes } from './countUp.ts';

test('the count starts at nothing, eases out and lands exactly on the final number', () => {
  assert.equal(countValue(4210, countProgress(0)), 0);
  assert.equal(countValue(4210, countProgress(COUNT_START_MS)), 0);
  // ease-out: past half way by a quarter of the time
  assert.ok(countValue(4210, countProgress(COUNT_START_MS + COUNT_MS / 4)) > 2105);
  assert.equal(countValue(4210, countProgress(COUNT_START_MS + COUNT_MS)), 4210);
  assert.equal(countValue(4210, countProgress(99999)), 4210);
  // never overshoots, never goes back
  let last = -1;
  for (let ms = 0; ms <= COUNT_START_MS + COUNT_MS + 100; ms += 33) {
    const v = countValue(4210, countProgress(ms));
    assert.ok(v >= last && v <= 4210);
    last = v;
  }
});

test('ticks every 50 ms, sixteen at most, and none for a count of nothing', () => {
  const t = tickTimes(4210);
  assert.equal(t.length, TICK_MAX);
  assert.equal(t[1] - t[0], 50);
  assert.ok(t[t.length - 1] < COUNT_START_MS + COUNT_MS);
  assert.deepEqual(tickTimes(0), []);
});

test('the stars land after the counts, one by one, and the medals after the last star', () => {
  assert.ok(STARS_START_MS > COUNT_START_MS + COUNT_MS);
  const s = starTimes(3);
  assert.equal(s.length, 3);
  assert.ok(s[0] < s[1] && s[1] < s[2]);
  assert.ok(medalsAtMs(3) > s[2]);
  assert.deepEqual(starTimes(0), []);
});
