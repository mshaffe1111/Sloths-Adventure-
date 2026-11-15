/**
 * ART-18 (m), the lead's stair ruling (ENG-LOOK2 REPORT, EXACT NEXT STEP 1): on a bough stage each step of a stair is its OWN short branch
 * stub, rounded at both ends, the mist between the steps; a lower step never draws under the one standing on it, so stacked steps never
 * read as one merged slab. Proven on 1-8's real stair (layout 1, the dip at x 14000: floor 49 and steps 50/51/52 all starting at 14000,
 * read from the built stage 11-15) and on a plain bank, which keeps the full bough and its ends.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boughSpans, BOUGH_STUB_MAX } from './protoArt.ts';
import type { Platform } from './types.ts';

const P = (id: number, x: number, w: number, y: number, h: number, chase = false): Platform =>
  ({ id, x, y, width: w, height: h, type: 'solid', ...(chase ? { chase: true } : {}) }) as unknown as Platform;
// (1-8 L1's dip, as built: the chase section it falls from, the floor, the three steps; the chase's next section 240 px higher)
const sec53 = P(125, 13770, 230, 767, 360, true);
const floor = P(49, 14000, 549, 1007, 120);
const s50 = P(50, 14000, 300, 947, 60);
const s51 = P(51, 14000, 200, 887, 120);
const s52 = P(52, 14000, 100, 827, 180);
const sec46 = P(46, 14549, 259, 767, 24, true);
const joins = [sec53, floor, s50, s51, s52, sec46];

test('a stair\'s stacked steps each draw only their own top, as a stub rounded at both ends; the floor draws only past the stair', () => {
  assert.deepEqual(boughSpans(s52, joins), [{ x0: 14000, x1: 14100, stub: true, l: 'living', r: 'living' }]);
  assert.deepEqual(boughSpans(s51, joins), [{ x0: 14100, x1: 14200, stub: true, l: 'living', r: 'living' }]);
  assert.deepEqual(boughSpans(s50, joins), [{ x0: 14200, x1: 14300, stub: true, l: 'living', r: 'living' }]);
  const f = boughSpans(floor, joins);
  assert.equal(f.length, 1);
  assert.deepEqual([f[0].x0, f[0].x1, f[0].stub, f[0].l], [14300, 14549, false, 'under'], 'the floor: from the lowest step on, the bough, run on under it');
  // (no two drawn stretches of the stair overlap: the merged-slab look is gone by construction)
  const all = [s52, s51, s50, floor].flatMap((p) => boughSpans(p, joins)).sort((a, b) => a.x0 - b.x0);
  for (let i = 1; i < all.length; i++) assert.ok(all[i].x0 >= all[i - 1].x1, `stretches ${i - 1} and ${i} overlap`);
});

test('a plain bank keeps the full bough and its ends; a stretch two thicknesses wide or more is never a stub', () => {
  const a = P(1, 1000, 800, 767, 200), b = P(2, 1800, 600, 767, 200), c = P(3, 2500, 400, 767, 200);
  const js = [a, b, c];
  assert.deepEqual(boughSpans(a, js), [{ x0: 1000, x1: 1800, stub: false, l: 'torn', r: 'joined' }]);
  assert.deepEqual(boughSpans(c, js), [{ x0: 2500, x1: 2900, stub: false, l: 'torn', r: 'torn' }]);
  const narrow = P(4, 4000, BOUGH_STUB_MAX - 1, 767, 200), wide = P(5, 5000, BOUGH_STUB_MAX, 767, 200);
  assert.equal(boughSpans(narrow, [narrow])[0].stub, true);
  assert.equal(boughSpans(wide, [wide])[0].stub, false);
  // (a stub's free ends are rounded, never torn: a stair step is a branch's stub, not a broken edge)
  assert.deepEqual([boughSpans(narrow, [narrow])[0].l, boughSpans(narrow, [narrow])[0].r], ['living', 'living']);
});
