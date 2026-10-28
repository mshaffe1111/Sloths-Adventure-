// npx tsx --test tools/inspect/pacing.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { beatRisk, columnFor, correlation, pacing, rhythmGroups, tensionCurve, SAWTOOTH, TARGETS } from './pacing.ts';
import type { Beat, Letter } from './beats.ts';

const beat = (t: number, letter: Letter = 'J', o: Partial<Beat> = {}): Beat => ({ t, base: t, dur: 0, act: 0, x: t * 100, y: 0, letter, count: 1, what: '', ...o });

test('rhythm groups: a new burst starts after 0.8 s of quiet; a move keeps the burst going while it lasts', () => {
  // 0, 0.5, 1.0 (a burst of 3); quiet from 1.0 to 3.0; 3.0 swing busy 2 s, 5.5 jump (0.5 s after the swing ends: same burst)
  const { groups, gaps } = rhythmGroups([beat(0), beat(0.5), beat(1), beat(3, 'V', { act: 2 }), beat(5.5)]);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.map((g) => [g.t0, g.t1, g.actions]), [[0, 1, 3], [3, 5.5, 2]]);
  assert.deepEqual(gaps, [{ t0: 1, t1: 3 }]);
});

test('beat risk: a jump counts more the more often the bot misses it; other beats keep their weight', () => {
  assert.equal(beatRisk(beat(0, 'J')), 1);
  assert.equal(beatRisk(beat(0, 'J'), () => 0.5), 2.5);
  assert.equal(beatRisk(beat(0, 'C'), () => 0.5), 2.2);
  assert.equal(beatRisk(beat(0, 'h', { count: 0.5 })), 0.25);
});

test('tension: risk a second in 9 parts, capped at 1', () => {
  // 90 s: 10 s a part; part 1 holds 5 jumps (0.5/s -> 0.25), part 8 holds 40 (4/s -> capped 1)
  const beats = [...Array.from({ length: 5 }, (_, i) => beat(i)), ...Array.from({ length: 40 }, (_, i) => beat(70 + i * 0.25))];
  const c = tensionCurve(beats, 90);
  assert.equal(c.length, 9);
  assert.equal(c[0], 0.25);
  assert.equal(c[7], 1);
  assert.equal(c[4], 0);
});

test('correlation: the sawtooth matches itself, a flat line matches nothing', () => {
  assert.equal(Math.round(correlation(SAWTOOTH, SAWTOOTH) * 100), 100);
  assert.equal(correlation(SAWTOOTH, new Array(9).fill(0.5)), 0);
});

test('a chase on Normal is held to the chase column; Easy keeps its own', () => {
  assert.equal(columnFor('normal', true), 'chase');
  assert.equal(columnFor('easy', true), 'easy');
  assert.equal(columnFor('normal', false), 'normal');
});

/** a Normal stage built to the table: 10.4 s bursts of 11 jumps 1 s apart, 1.1 s rests */
function onTarget(): Beat[] {
  const out: Beat[] = [];
  let t = 1;
  for (let g = 0; g < 10; g++) {
    for (let i = 0; i < 11; i++) out.push(beat(t + i, 'J', { act: 0.4 }));
    t += 10 + 0.4 + 1.1;
  }
  return out;
}

test('pacing: a stage built to the table has no density, rest or idle flags', () => {
  const beats = onTarget();
  const total = beats[beats.length - 1].t + 1;
  const p = pacing(beats, total, 'normal');
  assert.ok(p.density >= TARGETS.normal.density[0] && p.density <= TARGETS.normal.density[1], `density ${p.density}`);
  assert.equal(p.rests.median, 1.1);
  assert.equal(p.idle.longest, 1.1);
  assert.deepEqual(p.flags.filter((f) => f.kind === 'density' || f.kind === 'rest' || f.kind === 'idle'), []);
});

test('pacing: sparse beats and long walks are flagged with the rule they break, in plain words', () => {
  // a jump every 5 s for 2 minutes
  const beats = Array.from({ length: 24 }, (_, i) => beat(2 + i * 5));
  const p = pacing(beats, 122, 'normal');
  const kinds = p.flags.map((f) => f.kind);
  assert.ok(kinds.includes('density'));
  assert.ok(kinds.includes('idle'));
  assert.ok(kinds.includes('burst')); // (no bursts at all)
  const d = p.flags.find((f) => f.kind === 'density')!;
  assert.match(d.what, /Normal aims for 0\.75-1\.15/);
  assert.match(d.ref, /STAGE-RULES §2 Pacing; GEMINI-LEDGER E3/);
  assert.match(p.flags.find((f) => f.kind === 'idle')!.ref, /STAGE-RULES §2 Dead time/);
});

test('pacing: one long burst with no rest is flagged; Easy is held to its own table', () => {
  // 40 s of a jump every 0.5 s
  const beats = Array.from({ length: 80 }, (_, i) => beat(1 + i * 0.5));
  const n = pacing(beats, 42, 'normal');
  assert.ok(n.flags.some((f) => f.kind === 'burst' && /one burst runs 39\.5 s/.test(f.what)), JSON.stringify(n.flags));
  const e = pacing(beats, 42, 'easy');
  assert.ok(e.flags.some((f) => f.kind === 'density' && /Easy aims for 0\.35-0\.55/.test(f.what) && /too busy/.test(f.what)));
});

test('pacing: a front-loaded tension curve with no climax is flagged', () => {
  const beats = Array.from({ length: 30 }, (_, i) => beat(i * 0.6));
  const p = pacing(beats, 120, 'normal');
  assert.equal(p.tension.peakChunk, 0);
  assert.ok(p.flags.some((f) => f.kind === 'tension' && /first third/.test(f.what)));
  assert.ok(p.flags.some((f) => f.kind === 'tension' && /no climax/.test(f.what)));
});

test('pacing: each setting splits bursts at its own rest pad (1.0 s Normal, 2.0 s Easy); slack rests are flagged', () => {
  // pairs of jumps 0.5 s apart, 1.8 s of quiet between pairs, for a minute
  const beats: Beat[] = [];
  for (let t = 1; t < 60; t += 2.3) beats.push(beat(t), beat(t + 0.5));
  const n = pacing(beats, 62, 'normal');
  const e = pacing(beats, 62, 'easy');
  assert.equal(n.bursts.medianActions, 2); // a 1.8 s walk is a rest on Normal...
  assert.equal(e.bursts.n, 1); // ...and the run between two jumps on Easy
  assert.equal(e.bursts.medianActions, beats.length);
  assert.ok(n.flags.some((f) => f.kind === 'rest' && /slack; Normal aims for 1-1\.2 s/.test(f.what)), JSON.stringify(n.flags));
});
