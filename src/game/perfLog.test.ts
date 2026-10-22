import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PerfLog, HITCH_MS, percentile } from './perfLog.ts';

const info = () => ({ what: 'air vy=-120', parts: 7 });

test('smooth frames log no freezes and report about 30 fps', () => {
  const p = new PerfLog();
  p.reset(0);
  for (let i = 0; i < 100; i++) p.record(33.3, 1, 8, i * 33, info);
  const s = p.stats();
  assert.equal(s.hitches, 0);
  assert.ok(s.fps >= 29 && s.fps <= 31);
});

test('a frame longer than the limit is logged with what the game was doing', () => {
  const p = new PerfLog();
  p.reset(0);
  p.record(33, 1, 8, 33, info);
  p.record(HITCH_MS + 120, 2, 9, 253, info);
  assert.equal(p.hitchCount, 1);
  assert.equal(p.hitches[0].what, 'air vy=-120');
  assert.equal(p.hitches[0].gap, HITCH_MS + 120);
});

test('the timeline gets a line every 10 s, so a slowdown that grows shows as a rising average', () => {
  const p = new PerfLog();
  p.reset(0);
  let now = 0;
  for (let sec = 0; sec < 40; sec++) for (let f = 0; f < 30; f++) {
    const gap = 33 + sec; // each second a little slower
    now += gap;
    p.record(gap, 1, 8, now, info);
  }
  assert.ok(p.samples.length >= 2);
  const avgs = p.samples.map((x) => x.avg);
  for (let i = 1; i < avgs.length; i++) assert.ok(avgs[i] > avgs[i - 1]);
});

test('the lists stay short and the report is readable text', () => {
  const p = new PerfLog();
  p.reset(0);
  for (let i = 0; i < 100; i++) p.record(500, 1, 1, i * 500, info);
  assert.ok(p.hitches.length <= 14);
  assert.equal(p.hitchCount, 100);
  p.note('stage 1-9 started', 0);
  const r = p.report('stage 1-9');
  assert.match(r, /stage 1-9/);
  assert.match(r, /freezes over 100 ms: 100/);
});

test('percentile of an empty list is 0 and of a sorted list picks the right rank', () => {
  assert.equal(percentile([], 0.5), 0);
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.95), 10);
});
