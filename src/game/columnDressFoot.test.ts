/**
 * DRESS-27 (R-165.415): a climb standing in a column dress (2-7's pole in the weir's pool, in front of the falls) gets the dress's own foam
 * drawn again over its foot, over the pole's width only, on layer 'world' (behind Pokey). Planted: RED on the base (no dressFeet, the piece
 * drew layer 'back' only, so the bare pole stood in the pool).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRESS_FOOT, dressFeet, type ColumnDress } from './columnDress.ts';
import { ColumnDressPiece } from './pieces/columnDressPiece.ts';

const weir: ColumnDress = { art: 'w2-next#weir', x: 1000, y: 500, w: 921, h: 346 };
const floor = weir.y + weir.h - 24;
const pole = { x: 1551, bottomY: floor, vineType: 'tree_climb' as const };

test('a climb whose foot stands on the dressed floor inside the box is a foot; a liana, a climb outside or hanging high is not', () => {
  assert.deepEqual(dressFeet([weir], [pole]), [{ d: 0, x0: pole.x - DRESS_FOOT.half, x1: pole.x + DRESS_FOOT.half, floor }]);
  assert.equal(dressFeet([weir], [{ ...pole, vineType: 'swing_liana' }]).length, 0);
  assert.equal(dressFeet([weir], [{ ...pole, x: weir.x - 5 }]).length, 0);
  assert.equal(dressFeet([weir], [{ ...pole, bottomY: floor - 200 }]).length, 0);
  // (at the dress's edge the band is cut to the dress: nothing drawn outside the picture)
  const edge = dressFeet([weir], [{ ...pole, x: weir.x + 10 }])[0];
  assert.equal(edge.x0, weir.x);
});

test('the piece draws the foam over the foot on layer world, the pole\'s width only, from rise over the floor to below under it', () => {
  const parts: Array<[number, number, number, number]> = [];
  const piece = new ColumnDressPiece([weir], () => true, dressFeet([weir], [pole]), (_c, _a, x, y, w, h, px, py, pw, ph) => {
    assert.deepEqual([x, y, w, h], [weir.x, weir.y, weir.w, weir.h]);
    parts.push([px, py, pw, ph]);
    return true;
  });
  assert.deepEqual(piece.layers, ['back', 'world']);
  const ctx = { globalAlpha: 1 } as unknown as CanvasRenderingContext2D;
  piece.draw(ctx, 'world', { view: { x: 900, y: 400, w: 1200, h: 600, zoom: 1 } });
  assert.ok(parts.length >= 2, 'the foot band is drawn');
  for (const [px, , pw] of parts) assert.ok(px >= pole.x - DRESS_FOOT.half && px + pw <= pole.x + DRESS_FOOT.half, 'over the pole only');
  const top = Math.min(...parts.map((p) => p[1])), foot = Math.max(...parts.map((p) => p[1] + p[3]));
  assert.ok(Math.abs(top - (floor - DRESS_FOOT.rise)) < 0.01 && Math.abs(foot - (floor + DRESS_FOOT.below)) < 0.01, `${top}..${foot}`);
  assert.equal(ctx.globalAlpha, 1, 'the alpha is put back');
  // (off screen: nothing; no climb in it: layer back only)
  parts.length = 0;
  piece.draw(ctx, 'world', { view: { x: 5000, y: 400, w: 1200, h: 600, zoom: 1 } });
  assert.equal(parts.length, 0);
  assert.deepEqual(new ColumnDressPiece([weir], () => true).layers, ['back']);
});
