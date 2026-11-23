/**
 * DRESS-27 (R-165.415): a plank span over a river stands on posts down into the water (2-7's porch walk read as floating planks). Planted:
 * RED on the base (no porchPosts: nothing was drawn under the planks).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PORCH_POST, drawPorchPosts, porchPosts } from './porchPosts.ts';

const river = { x0: 1000, x1: 2000, surfaceY: 820 };
const plank = (x: number, extra: object = {}) => ({ x, y: 751, width: 170, type: 'solid' as const, style: 'canopy_bridge' as const, ...extra });

test('a plank span over a river gets a post at each end, from behind the plank to under the water', () => {
  assert.deepEqual(porchPosts([plank(1100)], [river]), [
    { x: 1100 + PORCH_POST.inset, top: 751 + PORCH_POST.top, foot: 820 + PORCH_POST.sink },
    { x: 1270 - PORCH_POST.inset, top: 751 + PORCH_POST.top, foot: 820 + PORCH_POST.sink },
  ]);
  // (an end over the bank, not the water: no post there; a plank over no river, a log, a moving plank or a river above it: none)
  assert.equal(porchPosts([plank(900)], [river]).length, 1);
  assert.equal(porchPosts([plank(3000)], [river]).length, 0);
  assert.equal(porchPosts([plank(1100, { style: 'log' })], [river]).length, 0);
  assert.equal(porchPosts([plank(1100, { type: 'moving' })], [river]).length, 0);
  assert.equal(porchPosts([plank(1100)], [{ ...river, surfaceY: 700 }]).length, 0);
});

test('each post in view is drawn once, from its foot up to its top, with no clip', () => {
  const posts = porchPosts([plank(1100)], [river]);
  const calls: number[][] = [];
  let clips = 0;
  const ctx = { save() {}, restore() {}, beginPath() {}, rect() {}, clip() { clips++; } } as unknown as CanvasRenderingContext2D;
  drawPorchPosts(ctx, posts, { x0: 900, x1: 1400, y0: 600, y1: 900 }, (_c, x, top, foot, w) => { calls.push([x, top, foot, w]); return true; });
  assert.equal(clips, 0, 'no clip: PERFORMANCE-RULES counts clips a frame (2-7 porches went to 28 with one a post)');
  assert.deepEqual(calls, posts.map((p) => [p.x, p.top, p.foot, PORCH_POST.w]));
  calls.length = 0;
  drawPorchPosts(ctx, posts, { x0: 5000, x1: 5400, y0: 600, y1: 900 }, () => { calls.push([]); return true; });
  assert.equal(calls.length, 0, 'off screen: not drawn');
});
