// npx tsx --test tools/inspect/lookalike.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { editDistance } from './analyze.ts';
import { WEIGHT, type Beat, type Letter } from './beats.ts';
import { closestLook, kindOf, LOOK, lookDistance, looksAlike, lookWindows, moveKind, swapCost, type LookWin } from './lookalike.ts';
import type { Seg } from './route.ts';
import type { Stage } from './stages.ts';

const here = path.dirname(fileURLToPath(import.meta.url));

/** the calibration pairs (reference/prop-sheets/qa-notes/lookalike/README.md): the two windows, as kinds, and the old letters */
interface Pair { a: string; b: string; roll: number; judged: 'alike' | 'different'; A: string[]; B: string[]; oldA: string; oldB: string }
const pairs: Pair[] = JSON.parse(fs.readFileSync(path.join(here, '..', '..', 'reference', 'prop-sheets', 'qa-notes', 'lookalike', 'pairs.json'), 'utf8'));

const win = (s: string[], t = 0): LookWin => ({ t, s, w: s.reduce((sum, k) => sum + WEIGHT[k[0] as Letter], 0) });
const oldDistance = (a: string, b: string) => {
  const A = [...a] as Letter[], B = [...b] as Letter[];
  const w = (s: Letter[]) => s.reduce((t, l) => t + WEIGHT[l], 0);
  return editDistance(A, B) / Math.max(w(A), w(B));
};

test('the calibration pairs: ten judged alike sit under the threshold, ten judged different over it', () => {
  assert.equal(pairs.filter((p) => p.judged === 'alike').length, 10);
  assert.equal(pairs.filter((p) => p.judged === 'different').length, 10);
  for (const p of pairs) {
    const d = lookDistance(win(p.A), win(p.B));
    if (p.judged === 'alike') assert.ok(d < LOOK.alike, `${p.a}/${p.b} roll ${p.roll}: judged alike, measured ${d.toFixed(3)}`);
    else assert.ok(d > LOOK.alike + 0.05, `${p.a}/${p.b} roll ${p.roll}: judged different, measured ${d.toFixed(3)}`);
  }
});

test('the pairs judged different were the old measure\'s false alarms (its letters alone matched them under 0.28)', () => {
  for (const p of pairs.filter((q) => q.judged === 'different')) {
    assert.ok(oldDistance(p.oldA, p.oldB) < 0.28, `${p.a}/${p.b}: old ${oldDistance(p.oldA, p.oldB).toFixed(3)}`);
  }
});

test('swapping kinds: never less than the weight difference (the search bound), never more than a delete and an insert', () => {
  const kinds = [...new Set(pairs.flatMap((p) => [...p.A, ...p.B]))];
  assert.ok(kinds.length > 30);
  for (const a of kinds) for (const b of kinds) {
    const c = swapCost(a, b), wa = WEIGHT[a[0] as Letter], wb = WEIGHT[b[0] as Letter];
    if (a === b) assert.equal(c, 0);
    else {
      assert.ok(c > 0, `${a} / ${b}`);
      assert.ok(c >= Math.abs(wa - wb) - 1e-9, `${a} / ${b}: ${c}`);
      assert.ok(c <= wa + wb + 1e-9, `${a} / ${b}: ${c}`);
    }
    assert.equal(c, swapCost(b, a));
  }
});

test('what a player feels costs more than what they do not', () => {
  // a jump over water against the same jump over a floor; a jump against a liana; a liana against a climb; two animals
  assert.ok(swapCost('J|jump|level|w', 'J|jump|level|s') > swapCost('J|jump|level|w', 'J|jump|up|w'));
  assert.ok(swapCost('J|jump|level|s', 'V|liana|level|s') > swapCost('J|jump|level|s', 'J|second|level|s'));
  assert.ok(swapCost('V|liana|level|w', 'V|climb') > swapCost('V|liana|level|w', 'V|liana|level|s'));
  assert.ok(swapCost('C|caiman', 'C|frog') > 0 && swapCost('C|caiman', 'C|frog') < WEIGHT.C);
  assert.ok(swapCost('Z|darkness', 'Z|tide zone') > swapCost('C|caiman', 'C|frog'));
});

test('the closest pair: the bound and the early stop agree with a full search', () => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const pool = [...new Set(pairs.flatMap((p) => [...p.A, ...p.B]))];
  const make = () => Array.from({ length: 30 }, (_, i) => win(Array.from({ length: 6 + Math.floor(rnd() * 12) }, () => pool[Math.floor(rnd() * pool.length)]), i * 2));
  for (let k = 0; k < 5; k++) {
    const a = make(), b = make();
    let full = Infinity;
    for (const x of a) for (const y of b) full = Math.min(full, lookDistance(x, y));
    assert.ok(Math.abs(closestLook(a, b)!.d - full) < 1e-12);
    const stop = closestLook(a, b, full + 0.05)!;
    assert.ok(stop.d < full + 0.05);
    assert.equal(looksAlike(a, b, full + 1e-9), true);
    assert.equal(looksAlike(a, b, full), false);
  }
  assert.equal(closestLook([], [win(['J|jump|level|s'])]), null);
});

test("a beat's kind: a move's own, otherwise what it says without the repeats and numbers", () => {
  const b = (letter: Letter, what: string, k?: string) => ({ letter, what, k });
  assert.equal(kindOf(b('J', 'jump over a gap', 'J|second|up|w')), 'J|second|up|w');
  assert.equal(kindOf(b('C', 'snake (asleep)')), 'C|snake');
  assert.equal(kindOf(b('C', 'ring wave 2: snake')), 'C|snake');
  assert.equal(kindOf(b('Z', 'wind gust (again)')), 'Z|wind gust');
  assert.equal(kindOf(b('Z', 'darkness: wake the glowworms, find the way')), 'Z|darkness');
  assert.equal(kindOf(b('P', 'puzzle room (glowHigh-2)')), 'P|room glowHigh');
  assert.notEqual(kindOf(b('P', 'stand still: the fern unrolls')), kindOf(b('P', 'stand still: the mist settles')));
});

test("a move's kind: its size, its height and what is under it", () => {
  const plat = (id: number, x: number, y: number, width: number) => ({ id, x, y, width, height: 20, type: 'solid' }) as Stage['platforms'][number];
  const A = plat(1, 0, 500, 200), B = plat(2, 360, 500, 200), floor = plat(3, 150, 640, 250);
  const seg = (kind: Seg['kind'], x0: number, y0: number, x1: number, y1: number): Seg => ({ kind, x0, y0, x1, y1, dt: 0.6, from: A, plat: B });
  const dry = { platforms: [A, B] } as Stage, wet = { platforms: [A, B], waterY: 700 } as Stage, soft = { platforms: [A, B, floor] } as Stage;
  assert.equal(moveKind(wet, seg('jump', 200, 500, 360, 500), true), 'J|jump|level|w');
  assert.equal(moveKind(dry, seg('jump', 200, 500, 360, 500), true), 'J|jump|level|p');
  assert.equal(moveKind(soft, seg('jump', 200, 500, 360, 500), true), 'J|jump|level|s');
  assert.equal(moveKind(dry, seg('jump', 200, 500, 300, 380), true), 'J|second|up|p');
  assert.equal(moveKind(dry, seg('jump', 200, 500, 300, 500), true), 'J|short|level|p');
  assert.equal(moveKind(dry, seg('jump', 200, 500, 400, 500), true), 'J|second|level|p');
  assert.equal(moveKind(dry, seg('hop', 200, 500, 230, 450), true), 'h|hop|up|s');
  assert.equal(moveKind(wet, seg('swing', 200, 500, 400, 500), true), 'V|liana|level|w');
  assert.equal(moveKind(dry, seg('walk', 0, 500, 200, 500), true), null);
});

test('windows: 20 s every 2 s, walks as W, a mostly-walking window left out', () => {
  const beat = (t: number, letter: Letter, what = '', k?: string): Beat => ({ t, base: t, dur: 0, act: 0, x: 0, y: 0, letter, count: 1, what, k });
  const beats = [beat(0, 'C', 'frog'), beat(1, 'V', '', 'V|liana|level|w'), beat(2, 'V', '', 'V|liana|level|w'), beat(6, 'C', 'caiman')];
  const ws = lookWindows(beats, 40);
  // (from 2 s on the window holds a liana and the caiman alone: 4.2 of beats, mostly walking)
  assert.deepEqual(ws.map((w) => w.t), [0]);
  assert.deepEqual(ws[0].s.slice(0, 5), ['C|frog', 'V|liana|level|w', 'V|liana|level|w', 'W', 'W']);
  assert.ok(Math.abs(ws[0].w - (2.2 + 2 + 2 + 2.2 + 0.2 * ws[0].s.filter((k) => k === 'W').length)) < 1e-9);
});
