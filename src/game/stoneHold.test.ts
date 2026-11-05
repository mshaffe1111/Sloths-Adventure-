import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stoneHold, STONE_COLUMN_MAX } from './stoneHold.ts';
import type { Platform } from './types.ts';

let id = 1;
const P = (x: number, y: number, w: number, h: number, more: Partial<Platform> = {}): Platform => ({ id: id++, x, y, width: w, height: h, type: 'solid', ...more }) as Platform;

test('a slab over open air with ground near under it stands on a column down to that ground', () => {
  const ground = P(0, 600, 2000, 300);
  const slab = P(500, 500, 112, 26, { style: 'moss_stone' });
  const h = stoneHold(slab, [ground, slab]);
  assert.equal(h?.kind, 'column');
  if (h?.kind === 'column') {
    assert.equal(h.cols.length, 1);
    assert.equal(h.cols[0].bottom, 600);
    assert.ok(h.cols[0].x > slab.x && h.cols[0].x + h.cols[0].w < slab.x + slab.width);
  }
});
test('a long slab stands on two columns, each to its own ground', () => {
  const g1 = P(0, 600, 900, 300), g2 = P(900, 640, 900, 300);
  const slab = P(700, 500, 400, 26);
  const h = stoneHold(slab, [g1, g2, slab]);
  assert.equal(h?.kind, 'column');
  if (h?.kind === 'column') assert.deepEqual(h.cols.map((c) => c.bottom), [600, 640]);
});
test('over a deeper drop than the threshold, over no ground, or moving, it is drawn as its kin', () => {
  const ground = P(0, 526 + STONE_COLUMN_MAX + 20, 2000, 300);
  const slab = P(500, 500, 112, 26);
  assert.equal(stoneHold(slab, [ground, slab])?.kind, 'kin');
  const alone = P(500, 500, 112, 26);
  assert.equal(stoneHold(alone, [alone])?.kind, 'kin');
  const mover = P(500, 500, 112, 26, { type: 'moving' });
  assert.equal(stoneHold(mover, [P(0, 560, 2000, 300), mover])?.kind, 'kin');
});
test('held already: resting on a piece, spanning bank to bank, set into a bank face, or topping a climb trunk', () => {
  const ground = P(0, 600, 2000, 300);
  const under = P(480, 526, 160, 24);
  const rest = P(500, 500, 112, 26);
  assert.equal(stoneHold(rest, [ground, under, rest]), null);
  const left = P(0, 500, 400, 300), right = P(620, 500, 400, 300);
  const t1 = P(400, 500, 110, 40), t2 = P(510, 500, 110, 40);
  assert.equal(stoneHold(t1, [left, right, t1, t2]), null);
  const shelf = P(400, 500, 110, 26);
  assert.equal(stoneHold(shelf, [P(0, 400, 400, 500), shelf]), null);
  const perch = P(500, 300, 112, 26);
  assert.equal(stoneHold(perch, [ground, perch], [{ vineType: 'tree_climb', x: 520, topY: 300, bottomY: 600 }]), null);
});
test('a column never passes through a piece in the way: a thin floater under it makes it kin', () => {
  const ground = P(0, 700, 2000, 300);
  const mid = P(480, 600, 200, 24);
  const slab = P(500, 500, 112, 26);
  assert.equal(stoneHold(slab, [ground, mid, slab])?.kind, 'kin');
});
