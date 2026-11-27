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

import { layMoon, moonFlowers } from './moon.ts';
const stair = (x: number, y: number) => [0, 1, 2].map((i) => ({ x: x + i * 120, y: y - (i + 1) * 100, width: 120, moonflower: undefined as true | undefined }));

test('two swing storeys on opposite walls are ONE beam: the same motion at every t', () => {
  const a = layMoon(stair(1000, 5000), 'swing', 600, 1);
  const b = layMoon(stair(1600, 4600), 'swing', 600, -1);
  for (const t of [0, 1.3, 3.7, 5.1, 6.6, 9.9, 11.4]) {
    for (const s of ['normal', 'easy'] as const) near(bandAt(a.moon.band[s], t).x, bandAt(b.moon.band[s], t).x);
  }
});

test("the teach's resting beam opens its flowers for good; the stage's flowers are read from their zone on each setting", () => {
  const steps = stair(1000, 5000);
  const z = layMoon(steps, 'rest', 0, 1);
  assert.ok(steps.every((p) => p.moonflower));
  const st = { platforms: steps.map((p, i) => ({ ...p, id: i })), zones: [{ kind: 'moon', ...z }] };
  const fl = moonFlowers(st, 'normal');
  assert.equal(fl.length, 3);
  assert.ok(fl.every((f) => flowerOpen(f.clocks, 0.5) && flowerOpen(f.clocks, 500)));
  assert.equal(moonFlowers({ platforms: st.platforms, zones: [] }, 'easy')[0].clocks.length, 0, 'a flower in no moon never opens');
});

test('the rising band opens the stair bottom to top and closes it the same way', () => {
  const steps = stair(1000, 5000);
  const z = layMoon(steps, 'rise', 0, 1);
  const st = { platforms: steps.map((p, i) => ({ ...p, id: i })), zones: [{ kind: 'moon', ...z }] };
  for (const s of ['normal', 'easy'] as const) {
    const fl = moonFlowers(st, s);
    // (each flower's first OPENING: closed, then open; the top one's droop runs over the band's restart, so it can be open at t 0)
    const opens = fl.map((f) => { for (let t = 0.05; t < 30; t += 0.05) if (flowerOpen(f.clocks, t) && !flowerOpen(f.clocks, t - 0.05)) return t; return Infinity; });
    assert.ok(opens[0] < opens[1] && opens[1] < opens[2], `${s}: ${opens.join(' ')}`);
  }
});

import { oneBeam } from './moon.ts';
test('oneBeam: every swing moon of a stage is the same band between its stairs; rest and rise keep their own (planted: left per storey, they differ)', () => {
  const zs = () => [layMoon(stair(1000, 5000), 'swing', 600, 1), layMoon(stair(1060, 4600), 'swing', 600, -1), layMoon(stair(1000, 4200), 'rise', 0, 1)].map((z) => ({ kind: 'moon', ...z }));
  const per = zs();
  assert.notDeepEqual(per[0].moon.band.normal, per[1].moon.band.normal, 'planted: per storey, two beams');
  const one = zs();
  const rise0 = JSON.stringify(one[2].moon.band);
  oneBeam(one);
  assert.deepEqual(one[0].moon.band, one[1].moon.band);
  assert.equal(JSON.stringify(one[2].moon.band), rise0);
  // both stairs open on the one beam, on both settings
  for (const s of ['normal', 'easy'] as const) for (const [k, mid] of [[0, 1180], [1, 1240]] as const) assert.ok(flowerClocks(one[k].moon.band[s], mid, 4700, one[k].moon.droop[s]).length > 0, `${s} stair ${k}`);
});
