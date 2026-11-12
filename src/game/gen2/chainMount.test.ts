// R-165.138 (Matt, 11-12, on the 1-2 kit stills: "the bounce-chain mushrooms stand on TALL STEMS... getting onto the first cap needs a
// jump or even a double jump"): a bounce piece is stepped or hopped onto and the bounce does the work. `chain.mount` (promises11.ts
// mountVerdicts, every judged stage, both settings): a cap with no cap before it within a chain hop is a MOUNT, and its top stands no more
// than the single-rise band's top (bands.md §2: 80 px Normal, 63 Easy) over ground he can step from within MOUNT_REACH px; else refused.
//   npx tsx --test src/game/gen2/chainMount.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { MOUNT_REACH, PROMISES_11, mountVerdicts } from './promises11.ts';
import { ALL_VERDICTS } from './verdicts.ts';
import type { Platform } from '../types.ts';
import { buildGen2Stage } from './pipeline.ts';
import { config12, kitLib12 } from '../../../tools/engine/library.ts';

const G = 800;
const bank = (id: number, x: number, width: number, y = G): Platform => ({ id, x, y, width, height: 400, type: 'solid' }) as Platform;
const cap = (id: number, x: number, y: number): Platform => ({ id, x, y, width: 70, height: 30, type: 'bouncy' }) as Platform;
const names = (pl: Platform[], s: 'normal' | 'easy' = 'normal') => mountVerdicts(pl, s).map((v) => `${v.name}: ${v.line}`);

test('a floor mushroom stood on its bank (cap 30 px up) is a walk-on mount; caps after it in the chain are not mounts', () => {
  const pl = [bank(1, 0, 600), cap(2, 480, G - 30), bank(3, 700, 120), cap(4, 725, G - 30), bank(5, 900, 120), cap(6, 925, G - 60)];
  assert.deepEqual(names(pl), []);
  assert.deepEqual(names(pl, 'easy'), []);
});

test('planted: the first cap on a tall stem (180 px over its bank) is refused by name; at the band top it passes', () => {
  const tall = [bank(1, 0, 600), cap(2, 480, G - 180), bank(3, 700, 120), cap(4, 725, G - 180)];
  assert.deepEqual(names(tall), ['chain.mount: the bounce cap at x 480 stands 180 px over the ground he mounts it from (x 0..600), over a plain hop\'s 80 (single-rise band)']);
  assert.deepEqual(names([bank(1, 0, 600), cap(2, 480, G - 80)]), [], '80 px: the band top, a plain hop');
  // (Easy's band is lower: 70 px passes Normal and is refused on Easy)
  assert.deepEqual(names([bank(1, 0, 600), cap(2, 480, G - 70)]), []);
  assert.equal(names([bank(1, 0, 600), cap(2, 480, G - 70)], 'easy').length, 1);
});

test('planted: a first cap with no ground within reach (a pole sticking out of a pit) is refused', () => {
  const pole = [bank(1, 0, 300), cap(2, 300 + MOUNT_REACH + 60, G - 30)];
  assert.match(names(pole)[0], /^chain\.mount: the bounce cap at x \d+ has no ground within \d+ px to step or hop onto it from/);
});

test('chain.mount is a registered promise on every judged stage, both settings, and a listed name', () => {
  const p = PROMISES_11.find((q) => q.id === 'chain.mount');
  assert.ok(p && p.stages === 'all' && p.settings.includes('normal') && p.settings.includes('easy'));
  assert.ok(ALL_VERDICTS.includes('chain.mount'));
});

test("1-2's library chains are walk-on mounts on 12 rolls, both settings (none refused chain.mount)", () => {
  for (const difficulty of ['normal', 'easy'] as const) for (let seed = 1; seed <= 12; seed++) {
    const st = buildGen2Stage({ config: config12() as never, kit: kitLib12(), seed, difficulty }) as unknown as { gen2: { verdicts: Record<string, { notJudged: string[] }>; errors: string[] } };
    assert.ok(!st.gen2.verdicts[difficulty].notJudged.includes('chain.mount'), `${difficulty} seed ${seed}: judged`);
    assert.ok(!st.gen2.errors.some((e) => e.includes('chain.mount')), `${difficulty} seed ${seed}: ${st.gen2.errors.join(' | ')}`);
  }
});
