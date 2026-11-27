import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BLOOM, bandAt, bandCovers, bandPeriod, flowerClocks, flowerDroop, flowerLeft, flowerOpen, litWindows, type MoonBand } from './moon.ts';

// 3-4.md's Normal swing: rest 3.6, slide 2.4 across 600 px (period 12.0); the band lights 60 px either side of its centre
const swing: MoonBand = { kind: 'swing', walls: [1000, 1600], rest: 3.6, slide: 2.4, half: 60, offset: 0 };
// 3-4.md's Normal rise: a 300 px band climbing 70 px/s up 700 px of wall
const rise: MoonBand = { kind: 'rise', x: 1300, half: 200, from: 2000, to: 1300, rise: 70, h: 300, rest: 0, offset: 0 };
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} vs ${b}`);

test('the swing band rests on each wall and slides between them on one clock', () => {
  near(bandPeriod(swing), 12);
  near(bandAt(swing, 1).x, 1000);
  near(bandAt(swing, 3.6 + 1.2).x, 1300);
  near(bandAt(swing, 7).x, 1600);
  near(bandAt(swing, 12 + 1).x, 1000);
  assert.ok(bandCovers(swing, 1050, -5000, 2) && !bandCovers(swing, 1200, 0, 2));
});

test("a wall flower is lit over the rest plus the slide's edge, as one window joined across the period's end", () => {
  const w = litWindows(swing, 1000, 500);
  assert.equal(w.length, 1);
  // 60 px at 250 px/s each side: 0.24 s before the rest (on the way back, wrapped) and 0.24 s after
  near(w[0].len, 3.6 + 0.48);
  near(w[0].from, 12 - 0.24);
  // a mid-shaft flower is lit twice a period (going and coming back)
  assert.equal(litWindows(swing, 1300, 500).length, 2);
});

test('a flower opens BLOOM s after the band reaches it and droops `droop` s after it leaves, then closes', () => {
  const cs = flowerClocks(swing, 1000, 500, 1.0);
  assert.equal(cs.length, 1);
  // the band reaches it at -0.24 (wrapped: 11.76); open from 0.16 to 3.84 + 1.0
  assert.ok(!flowerOpen(cs, 11.76 + BLOOM - 0.05), 'still closed inside the bloom');
  assert.ok(flowerOpen(cs, 11.76 + BLOOM + 0.05), 'open after the bloom');
  assert.ok(flowerOpen(cs, 2), 'open while lit');
  assert.ok(flowerOpen(cs, 3.84 + 0.9), 'drooping: still solid');
  assert.ok(!flowerOpen(cs, 3.84 + 1.05), 'closed after the droop');
  near(flowerLeft(cs, 3.84), 1.0);
  near(flowerDroop(cs, 3.84 + 0.5, 1.0), 0.5);
  assert.equal(flowerDroop(cs, 2, 1.0), 0, 'no droop while lit');
});

test('a touch shorter than the bloom opens nothing; a beam stopped away opens nothing', () => {
  const fast: MoonBand = { ...swing, slide: 0.1, half: 10 };
  assert.equal(flowerClocks(fast, 1300, 0, 1).length, 0);
  const stopped: MoonBand = { ...swing, walls: [3000, 3000] };
  assert.equal(flowerClocks(stopped, 1000, 0, 1).length, 0);
});

test("the rising band opens a flower as its top reaches it and closes it `droop` after its foot passes", () => {
  near(bandPeriod(rise), 10);
  // a flower 100 px up the wall (y 1900): the top reaches it at 100/70 s, the foot passes at 400/70 s
  const cs = flowerClocks(rise, 1300, 1900, 1.0);
  assert.equal(cs.length, 1);
  assert.ok(!flowerOpen(cs, 100 / 70 + 0.3));
  assert.ok(flowerOpen(cs, 100 / 70 + BLOOM + 0.01));
  assert.ok(flowerOpen(cs, 400 / 70 + 0.95));
  assert.ok(!flowerOpen(cs, 400 / 70 + 1.05));
  assert.equal(flowerClocks(rise, 1800, 1900, 1).length, 0, 'out of the band across');
});
