import test from 'node:test';
import assert from 'node:assert/strict';
import { BlinkWatch, ErrSeen, errLine, errWhere, FlipFlopWatch, frameSpread, JitterWatch, RateLimiter } from './glitchWatch.ts';

const FRAME = 1000 / 30;

test('jitter: a camera shaking 3 px back and forth every frame is caught within a second', () => {
  const w = new JitterWatch(6, 12, 1000, 0.5);
  let hit = -1;
  for (let i = 0; i < 30 && hit < 0; i++) if (w.feed(100 + (i % 2 ? 3 : 0), i * FRAME)) hit = i;
  assert.ok(hit > 0 && hit < 12, `caught at frame ${hit}`);
  assert.ok(w.turns > 6);
  assert.ok(w.span <= 3);
});

test('jitter: following, a pan and a swing are not shaking', () => {
  const w = new JitterWatch(6, 12, 1000, 0.5);
  // easing towards a target (always the same way)
  let x = 0;
  for (let i = 0; i < 90; i++) assert.equal(w.feed((x += (500 - x) * 0.2), i * FRAME), false);
  // a wide swing: turns twice a second, 80 px across
  w.reset();
  for (let i = 0; i < 120; i++) assert.equal(w.feed(400 + 80 * Math.sin(i * 0.2), i * FRAME), false);
});

test('jitter: turning back and forth widely is not a jitter, nor is a few turns in a second', () => {
  const w = new JitterWatch(6, 12, 1000, 0.5);
  // 40 px back and forth every frame: big moves, not a shake in a few pixels
  for (let i = 0; i < 60; i++) assert.equal(w.feed(i % 2 ? 40 : 0, i * FRAME), false);
  w.reset();
  // small, but only one turn every 6 frames (5 a second)
  for (let i = 0; i < 120; i++) assert.equal(w.feed(Math.floor(i / 6) % 2 ? 4 : 0, i * FRAME), false);
});

test('jitter: moves under the still threshold (rounding) do not count', () => {
  const w = new JitterWatch(6, 12, 1000, 0.5);
  for (let i = 0; i < 60; i++) assert.equal(w.feed(200 + (i % 2 ? 0.2 : 0), i * FRAME), false);
});

test('flip-flop: standing and falling every other frame at one edge is caught; walking off a ledge is not', () => {
  const w = new FlipFlopWatch(6, 24, 1000);
  let hit = false;
  for (let i = 0; i < 30 && !hit; i++) hit = w.feed(i % 2 ? 'a' : 'g', 512 + (i % 3), i * FRAME);
  assert.ok(hit);
  assert.deepEqual([w.a, w.b].sort(), ['a', 'g']);
  assert.ok(w.changes > 6);

  const v = new FlipFlopWatch(6, 24, 1000);
  // ground, a jump, landing, a climb: a handful of changes
  const seq = ['g', 'g', 'a', 'a', 'a', 'g', 'g', 'c', 'c', 'a', 'g'];
  seq.forEach((s, i) => assert.equal(v.feed(s, 100 + i * 2, i * FRAME), false));
});

test('flip-flop: rapid changes while running far (hopping over bumps) are not one spot', () => {
  const w = new FlipFlopWatch(6, 24, 1000);
  for (let i = 0; i < 60; i++) assert.equal(w.feed(i % 2 ? 'a' : 'g', i * 8, i * FRAME), false);
});

test('rate limiter: once a second per kind, dropped ones counted, and a cap per session', () => {
  const r = new RateLimiter(1000, { stall: 3 }, 5);
  assert.equal(r.allow('stall', 0), 0);
  assert.equal(r.allow('stall', 200), -1);
  assert.equal(r.wait('stall', 200), 800);
  assert.equal(r.allow('stall', 900), -1);
  // a different kind is not held up by it
  assert.equal(r.allow('long', 300), 0);
  // a second later: kept, and it says two were dropped
  assert.equal(r.allow('stall', 1000), 2);
  assert.equal(r.capped, '');
  assert.equal(r.allow('stall', 2100), 0);
  // the third reached the cap: reported once
  assert.equal(r.capped, 'stall');
  r.capped = '';
  assert.equal(r.allow('stall', 9000), -1);
  assert.equal(r.full('stall'), true);
  assert.equal(r.full('long'), false);
  assert.equal(r.kept('stall'), 3);
  // a kind with no cap of its own uses the default
  for (let i = 0; i < 5; i++) assert.ok(r.allow('blink', 10000 + i * 1000) >= 0);
  assert.equal(r.allow('blink', 20000), -1);
});

test('errors: a short line with file:line, and the same message only three times', () => {
  const long = 'x'.repeat(400);
  const l = errLine(long, 'https://example.com/assets/index-abc123.js?v=2', 12, 345, 160);
  assert.ok(l.length <= 160, `${l.length}`);
  assert.ok(l.endsWith('@index-abc123.js:12:345'));
  assert.equal(errLine(new TypeError('a is undefined')), 'TypeError: a is undefined');
  const seen = new ErrSeen(3);
  assert.deepEqual([1, 2, 3, 4].map(() => seen.take('boom')), [true, true, true, false]);
  assert.equal(seen.take('other'), true);
  const e = new Error('x');
  e.stack = 'Error: x\n    at draw (https://site/assets/engine-9f.js:88:12)\n    at loop (https://site/assets/engine-9f.js:1:2)';
  assert.deepEqual(errWhere(e), { file: 'https://site/assets/engine-9f.js', line: 88, col: 12 });
  const s = new Error('y');
  s.stack = 'draw@https://site/assets/a.js:5:9\nloop@https://site/assets/a.js:1:1';
  assert.deepEqual(errWhere(s), { file: 'https://site/assets/a.js', line: 5, col: 9 });
  assert.deepEqual(errWhere('just a string'), {});
});

test('blink: shown more than 4 times in 2 s', () => {
  const b = new BlinkWatch(4, 2000);
  assert.deepEqual([0, 300, 600, 900].map((t) => b.shown('toast', t)), [false, false, false, false]);
  assert.equal(b.shown('toast', 1200), true);
  // spread out over time it is fine
  const c = new BlinkWatch(4, 2000);
  for (let i = 0; i < 20; i++) assert.equal(c.shown('way', i * 700), false);
});

test('frame spread: even pacing has a small spread, uneven a large one', () => {
  const even = frameSpread(Array.from({ length: 150 }, (_, i) => 33 + (i % 2 ? 0.5 : -0.5)));
  assert.ok(even.sd < 1 && even.over === 0);
  const uneven = frameSpread(Array.from({ length: 150 }, (_, i) => (i % 5 === 0 ? 67 : 25)));
  assert.ok(uneven.sd > 10);
  assert.equal(uneven.over, 30);
  assert.deepEqual(frameSpread([]), { mean: 0, sd: 0, over: 0 });
});
