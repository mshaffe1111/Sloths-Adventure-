import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trailStamps } from './mapTrail.ts';

test('the trail pieces lie evenly along the path, turned with it, each on its own stretch', () => {
  const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }];
  const s = trailStamps(pts, 20);
  assert.equal(s.length, 10);
  assert.ok(Math.abs(s[0].x - 10) < 0.5 && Math.abs(s[1].x - 30) < 0.5);
  for (const p of s) assert.ok(Math.abs(p.angle) < 0.01 && Math.abs(p.y) < 0.01);
  assert.deepEqual(s.map((p) => p.seg), [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
  for (const p of s) assert.ok(p.v >= 0 && p.v < 4);
});

test('a path going down turns the pieces down; a lone stage has no trail', () => {
  const s = trailStamps([{ x: 0, y: 0 }, { x: 0, y: 100 }], 25);
  assert.ok(s.every((p) => Math.abs(p.angle - 90) < 0.01));
  assert.equal(trailStamps([{ x: 5, y: 5 }], 10).length, 0);
});
