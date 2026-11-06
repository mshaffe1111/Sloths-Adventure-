// The stage variety measure (stageVariety.ts): every line fails on a planted case before it may pass anything (Law 22). Planted: one
// section laid 4 times in a row (repeat), one node token 4 times back to back (code run), a roll that is one piece over and over (inner),
// 16 copies of one roll (distinct); and a varied stage of distinct rolls passes. The real-data proof (old 1-1 calibrated first, the
// floor-road trial and the planted 4x stage failing, gen2 1-1's clean rolls passing) is in stageVariety.ts's header and the planner's report.
import test from 'node:test';
import assert from 'node:assert/strict';
import { innerVariety, maxRepeat, pieceTokens, varietyBreaches, VARIETY_BARS } from './stageVariety.ts';
import type { Platform } from './types.ts';

let id = 1;
const P = (x: number, y: number, w: number, kind: 'bank' | 'stone' | 'log' | 'bough' | 'mush'): Platform => ({
  id: id++, x, y, width: w, height: kind === 'bank' ? 120 : kind === 'stone' ? 50 : 30,
  type: kind === 'mush' ? 'bouncy' : 'solid', style: kind === 'log' ? 'log' : kind === 'bough' ? 'branch' : 'moss_stone',
} as Platform);
/** a seeded varied run of pieces: kinds, rises and gaps drawn from the stream */
function varied(seed: number, n = 120): Platform[] {
  let s = seed;
  const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const kinds = ['bank', 'stone', 'log', 'bough', 'mush'] as const;
  const out: Platform[] = [];
  let x = 0, y = 600;
  for (let i = 0; i < n; i++) {
    y = Math.max(300, Math.min(700, y + Math.round((r() - 0.5) * 300)));
    x += Math.round(r() * 300) + 60;
    out.push(P(x, y, 100 + Math.round(r() * 200), kinds[Math.floor(r() * kinds.length)]));
    x += 200;
  }
  return out;
}

test('a varied stage of different rolls passes every line', () => {
  const rolls = Array.from({ length: 8 }, (_, i) => ({ id: `r${i}`, platforms: varied(11 + i * 97), code: ['A', 'Tg1<', 'Tg2>', 'Tb<', 'Pc1^>', `F${i}`, 'R', 'Xf2<', 'R', 'Sf2>', 'E'] }));
  assert.deepEqual(varietyBreaches(rolls), []);
});

test('one section laid 4 times in a row fails the repeat line (and its node token 4 times running fails the code run)', () => {
  const rolls = Array.from({ length: 8 }, (_, i) => {
    const base = varied(11 + i * 97, 40), sec = varied(5000 + i, 12).map((p) => ({ ...p, x: p.x - 0 }));
    const w = Math.max(...sec.map((p) => p.x + p.width)) + 200;
    const x0 = Math.max(...base.map((p) => p.x + p.width)) + 200;
    const tiles = [0, 1, 2, 3].flatMap((k) => sec.map((p) => ({ ...p, id: id++, x: x0 + k * w + p.x })));
    return { id: `p${i}`, platforms: [...base, ...tiles], code: ['A', 'Tg1<', 'Pg1>', 'Pg1>', 'Pg1>', 'Pg1>', 'R', 'S', 'E'] };
  });
  const b = varietyBreaches(rolls);
  assert.equal(b.filter((x) => x.startsWith('repeat:')).length, 8, b.join('\n'));
  assert.equal(b.filter((x) => x.startsWith('code run:')).length, 8);
  assert.ok(maxRepeat(pieceTokens(rolls[0].platforms), VARIETY_BARS.repeatLen) >= 3);
});

test('a roll that is one piece over and over fails the inner line; 16 copies of one roll fail the distinct line', () => {
  const flat = Array.from({ length: 80 }, (_, i) => P(i * 300, 600, 200, 'bank'));
  assert.ok(innerVariety(pieceTokens(flat)) < VARIETY_BARS.inner);
  assert.ok(varietyBreaches([{ id: 'flat', platforms: flat }, { id: 'v', platforms: varied(3) }]).some((x) => x.startsWith('inner: flat')));
  const one = varied(42);
  const b = varietyBreaches(Array.from({ length: 16 }, (_, i) => ({ id: `c${i}`, platforms: one })));
  assert.ok(b.some((x) => x.startsWith('distinct:')), b.join('\n'));
});

test('a stepping-stone rhythm inside one stretch is one occurrence, not a repeat; the same stretch again elsewhere counts', () => {
  const stones = Array.from({ length: 15 }, (_, i) => P(i * 260, i % 3 === 1 ? 560 : 600, 140, i % 3 === 1 ? 'stone' : 'bank'));
  assert.ok(maxRepeat(pieceTokens(stones), 9) <= 2);
});
