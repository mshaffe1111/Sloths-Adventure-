// npx tsx --test tools/inspect/bands.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { bandChart, bandFlags, floorFlags, floorFor, parts, stageScore, worldBands, type BandInput, type Scored } from './bands.ts';

const input = (o: Partial<BandInput> = {}): BandInput => ({
  id: '1-1', world: 1, setting: 'normal', time: 120, deadShare: 0.5, jumpRates: [], livesPerMin: 0, peakStress: 0, minWindowMs: 500, survivalMin: null, ...o,
});
const sc = (id: string, score: number, setting: 'easy' | 'normal' = 'normal'): Scored => ({ id, world: Number(id.split('-')[0]), setting, score, parts: {} });

test('score: a gentle stage is 0, a brutal one 100, on fixed anchors', () => {
  assert.equal(stageScore(input()).score, 0);
  assert.equal(stageScore(input({ time: 360, deadShare: 0, jumpRates: [0.2, 0.3, 0.4], livesPerMin: 50, peakStress: 6, minWindowMs: 100 })).score, 100);
});

test('score: each part moves it the right way', () => {
  const base = stageScore(input({ livesPerMin: 0.4, jumpRates: [0.9], peakStress: 2, minWindowMs: 300, deadShare: 0.2, time: 180 })).score;
  for (const more of [{ livesPerMin: 1.2 }, { jumpRates: [0.6] }, { peakStress: 4 }, { minWindowMs: 170 }, { deadShare: 0.05 }, { time: 300 }]) {
    const s = stageScore(input({ livesPerMin: 0.4, jumpRates: [0.9], peakStress: 2, minWindowMs: 300, deadShare: 0.2, time: 180, ...more })).score;
    assert.ok(s > base, `${JSON.stringify(more)}: ${s} > ${base}`);
  }
});

test('score: the hardest jumps are the mean miss of the worst three', () => {
  assert.equal(Math.round(parts(input({ jumpRates: [1, 1, 0.7, 0.7, 0.7] })).jump! * 100), 50);
});

test('score: without the first-timer, only the inspector parts count (weights spread over them)', () => {
  const p = parts(input({ livesPerMin: null, peakStress: null, minWindowMs: null }));
  assert.deepEqual(Object.keys(p).sort(), ['busy', 'jump', 'length']);
  assert.equal(stageScore(input({ livesPerMin: null, peakStress: null, minWindowMs: null, deadShare: 0, time: 360, jumpRates: [0.4] })).score, 100);
});

test('bands: each world is the spread of its stages, the middle its median', () => {
  const b = worldBands([sc('1-1', 10), sc('1-2', 20), sc('1-3', 40), sc('2-1', 30)]);
  assert.deepEqual(b.map((x) => [x.world, x.min, x.max, x.mid]), [[1, 10, 40, 20], [2, 30, 30, 30]]);
});

test('flags: a world whose band sits below the one before', () => {
  const s = [sc('1-1', 30), sc('1-2', 40), sc('2-1', 25), sc('2-2', 32)];
  const f = bandFlags(s, worldBands(s));
  const w = f.filter((x) => x.kind === 'world-below');
  assert.equal(w.length, 1);
  assert.equal(w[0].world, 2);
  assert.match(w[0].what, /World 2's band \(middle 28\.5\) sits below World 1's \(middle 35\)/);
  assert.match(w[0].ref, /STAGE-RULES §1b/);
});

test("flags: World 2 stage 8 as hard as a World 4 stage is above World 3's middle; a stage below the world before's middle", () => {
  const s = [sc('1-1', 10), sc('1-2', 14), sc('2-1', 20), sc('2-2', 24), sc('2-8', 52), sc('3-1', 30), sc('3-2', 34), sc('3-3', 12), sc('4-1', 50), sc('4-2', 54)];
  const f = bandFlags(s, worldBands(s));
  const above = f.filter((x) => x.kind === 'above-next').map((x) => x.id);
  const below = f.filter((x) => x.kind === 'below-prev').map((x) => x.id);
  assert.ok(above.includes('2-8'), JSON.stringify(f));
  assert.ok(below.includes('3-3'));
  assert.ok(!above.includes('2-1') && !below.includes('2-1'));
  // a breather inside a world's band is fine
  assert.ok(!f.some((x) => x.id === '3-1' && x.kind !== 'ramp'));
});

test('flags: Easy and Normal bands are judged apart', () => {
  const s = [sc('1-1', 30, 'easy'), sc('2-1', 10, 'easy'), sc('1-1', 10), sc('2-1', 30)];
  const f = bandFlags(s, worldBands(s)).filter((x) => x.kind === 'world-below');
  assert.deepEqual(f.map((x) => x.setting), ['easy']);
});

test("Gemini's floors: Normal 70% in Worlds 1-5, 50% in 6-10; Easy 85% everywhere", () => {
  assert.equal(floorFor('normal', 5), 0.7);
  assert.equal(floorFor('normal', 6), 0.5);
  assert.equal(floorFor('easy', 9), 0.85);
  const f = floorFlags([
    input({ id: '2-3', world: 2, jumpRates: [0.95, 0.65, 0.6] }),
    input({ id: '7-1', world: 7, jumpRates: [0.6] }),
    input({ id: '1-4', world: 1, setting: 'easy', jumpRates: [0.9, 0.8] }),
    input({ id: '1-5', world: 1, jumpRates: [0.9], survivalMin: 0.5 }),
  ]);
  // (1-5: the first-timer's own edge survival is not a floor; it retries an edge until rescued past it)
  assert.deepEqual(f.map((x) => x.id).sort(), ['1-4', '2-3']);
  assert.match(f.find((x) => x.id === '2-3')!.what, /2 jumps the adult bot makes under 70%, the worst 60%/);
  assert.match(f.find((x) => x.id === '1-4')!.what, /kid bot makes under 85%/);
});

test('chart: one column per world, a dot per stage and setting, out-of-band stages named', () => {
  const s = [sc('1-1', 10), sc('1-2', 14), sc('2-1', 20), sc('2-8', 52), sc('3-1', 30), sc('3-2', 34), sc('1-1', 5, 'easy'), sc('2-1', 8, 'easy')];
  const bands = worldBands(s);
  const svg = bandChart({ firstTimer: false, inputs: [], scored: s, bands, flags: bandFlags(s, bands) });
  assert.equal((svg.match(/World \d<\/text>/g) ?? []).length, 3);
  assert.equal((svg.match(/<circle cx="[\d.]+" cy="[\d.]+" r="4/g) ?? []).length, 8);
  assert.match(svg, />2-8<\/text>/);
});
