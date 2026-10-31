/**
 * circleTrace: Meeca's carving gesture (5-M: "Round and round."). A finger going round is a circle once it has turned about 120 degrees
 * one way, and from then on every bit of turning is carving; a straight slide, a flick, a zigzag or a wobble never is.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CircleTrace, TRACE } from './circleTrace.ts';

/** a finger traced through these points; the radians it carved */
function trace(points: Array<[number, number]>): { rad: number; circling: boolean } {
  const c = new CircleTrace();
  c.down(1, points[0][0], points[0][1]);
  let rad = 0;
  for (const [x, y] of points.slice(1)) rad += c.move(1, x, y);
  return { rad, circling: c.circling(1) };
}
const circle = (turns: number, r = 40, dir = 1, n = 36): Array<[number, number]> =>
  Array.from({ length: Math.round(n * turns) + 1 }, (_, i) => {
    const a = (dir * i * Math.PI * 2) / n;
    return [200 + Math.cos(a) * r, 300 + Math.sin(a) * r] as [number, number];
  });

test('two turns round, either way, carve about two turns less the first third (the part that makes it a circle)', () => {
  for (const dir of [1, -1]) {
    const t = trace(circle(2, 40, dir));
    assert.ok(t.circling);
    assert.ok(t.rad > Math.PI * 2 * 2 - TRACE.turnOn - 1 && t.rad < Math.PI * 4 + 0.5, `${t.rad.toFixed(2)}`);
  }
  // a small circle counts too, and a big one
  assert.ok(trace(circle(1.5, 22)).circling);
  assert.ok(trace(circle(1.5, 110, 1, 60)).circling);
  // QA 2026-10-31, a real phone: a tiny circle, a squashed and uneven one, either way round
  for (const dir of [1, -1]) {
    assert.ok(trace(circle(1.5, 9, dir)).circling, 'tiny');
    const wobbly = Array.from({ length: 60 }, (_, i) => {
      const a = (dir * i * Math.PI * 2) / 36;
      const r = 30 + 9 * Math.sin(i * 1.3);
      return [200 + Math.cos(a) * r * 1.6, 300 + Math.sin(a) * r * 0.6] as [number, number];
    });
    const w = trace(wobbly);
    assert.ok(w.circling && w.rad > Math.PI * 1.5, `squashed and wobbly: ${w.rad.toFixed(2)}`);
  }
});

test('a slide, a flick, a zigzag and a shaky held finger are never a circle', () => {
  const slide = Array.from({ length: 30 }, (_, i) => [100 + i * 8, 300 + Math.sin(i * 0.3) * 3] as [number, number]);
  assert.deepEqual(trace(slide), { rad: 0, circling: false });
  const flick: Array<[number, number]> = [[200, 300], [205, 270], [212, 230], [220, 180]];
  assert.deepEqual(trace(flick), { rad: 0, circling: false });
  const zig = Array.from({ length: 30 }, (_, i) => [100 + i * 10, 300 + (i % 2 ? 14 : -14)] as [number, number]);
  assert.deepEqual(trace(zig), { rad: 0, circling: false });
  const shake = Array.from({ length: 40 }, (_, i) => [200 + Math.sin(i * 2.1) * 3, 300 + Math.cos(i * 1.7) * 3] as [number, number]);
  assert.deepEqual(trace(shake), { rad: 0, circling: false });
  // a gentle curve (a slide bending round a quarter) is not one either
  assert.equal(trace(circle(0.25, 60)).circling, false);
});
