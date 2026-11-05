import test from 'node:test';
import assert from 'node:assert/strict';
import { doubleAllowed } from './levelCheck.ts';

// (the lead's ruling, 2026-11-04: 1-1 teaches the second jump, so the level check counts it on 1-1 to 1-5, the stages rebuilt on the beat;
// every stage from 1-6 on was already checked with it, and stays as it was)
test('the level check counts the double jump on the rebuilt early stages (1-1, 1-4), and on every stage from 1-6 on as before', () => {
  for (const m of [1, 4]) assert.ok(doubleAllowed({ worldIndex: 1, miniIndex: m }), `1-${m}`);
  for (const m of [2, 3, 5]) assert.ok(!doubleAllowed({ worldIndex: 1, miniIndex: m }), `1-${m} joins with its own rebuild`);
  const before = (w: number, m: number) => (w - 1) * 10 + m >= 6;
  for (let w = 1; w <= 10; w++) for (let m = 1; m <= 10; m++) if (w > 1 || m >= 6) assert.equal(doubleAllowed({ worldIndex: w, miniIndex: m }), before(w, m), `${w}-${m}`);
});
