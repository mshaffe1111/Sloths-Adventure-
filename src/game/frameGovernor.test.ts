import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FrameGovernor, GOV_MAX_GAP_MS } from './frameGovernor.ts';

function run(g: FrameGovernor, gap: number, ms: number): number {
  let steps = 0;
  for (let t = 0; t < ms; t += gap) if (g.feed(gap)) steps++;
  return steps;
}

test('a steady 30 fps never steps down', () => {
  const g = new FrameGovernor();
  assert.equal(run(g, 33.4, 30_000), 0);
});

test('a screen stuck at ~20 fps steps down, and keeps stepping while it stays slow', () => {
  const g = new FrameGovernor();
  const steps = run(g, 50, 12_000);
  assert.ok(steps >= 3, `expected repeated steps, got ${steps}`);
});

test('the first second of a stage is not judged', () => {
  const g = new FrameGovernor();
  assert.equal(run(g, 100, 900), 0);
});

test('after a step it settles before judging again', () => {
  const g = new FrameGovernor();
  let first = -1;
  let t = 0;
  while (first < 0 && t < 10_000) {
    if (g.feed(60)) first = t;
    t += 60;
  }
  assert.ok(first > 0);
  let second = -1;
  let u = 0;
  while (second < 0 && u < 10_000) {
    if (g.feed(60)) second = u;
    u += 60;
  }
  assert.ok(second >= 1500 + 1000, `a second step came after only ${second} ms`);
});

test('one huge gap (the app was in the background) cannot trigger a step by itself', () => {
  const g = new FrameGovernor();
  run(g, 33.4, 3000);
  let stepped = false;
  if (g.feed(8000)) stepped = true;
  assert.equal(stepped, false);
  assert.ok(GOV_MAX_GAP_MS < 1200);
});

test('a hiccup in a healthy run does not step down', () => {
  const g = new FrameGovernor();
  run(g, 33.4, 2000);
  let steps = 0;
  for (let i = 0; i < 300; i++) if (g.feed(i % 60 === 0 ? 200 : 33.4)) steps++;
  assert.equal(steps, 0);
});
