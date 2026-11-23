/**
 * DRESS-27 (R-165.415): a climb standing in a column dress (2-7's pole in the weir's pool, in front of the falls) goes down behind the
 * dress's own foam: protoArt.ts draws it solid to footCut's `solid`, then fading out, and nothing under that. Planted: RED on the base (no
 * dressFeet / footCut: the bare pole was drawn down into the pool, 14 px under the floor).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRESS_FOOT, cachedBake, dressFeet, footCut, type ColumnDress } from './columnDress.ts';

const weir: ColumnDress = { art: 'w2-next#weir', x: 1000, y: 500, w: 921, h: 346 };
const floor = weir.y + weir.h - 24;
const pole = { x: 1551, bottomY: floor, vineType: 'tree_climb' as const };

test('a climb whose foot stands on the dressed floor inside the box is a foot; a liana, a climb outside or hanging high is not', () => {
  assert.deepEqual(dressFeet([weir], [pole]), [{ x: pole.x, floor }]);
  assert.equal(dressFeet([weir], [{ ...pole, vineType: 'swing_liana' }]).length, 0);
  assert.equal(dressFeet([weir], [{ ...pole, x: weir.x - 5 }]).length, 0);
  assert.equal(dressFeet([weir], [{ ...pole, bottomY: floor - 200 }]).length, 0);
  assert.equal(dressFeet([], [pole]).length, 0);
});

test('its foot: solid to rise over the floor, then strips fading out (each fainter) that end over the floor: nothing in the pool', () => {
  const c = footCut({ x: pole.x, floor });
  assert.equal(c.solid, floor - DRESS_FOOT.rise);
  assert.equal(c.strips.length, DRESS_FOOT.steps.length);
  let y = c.solid;
  let last = 1;
  for (const [top, h, a] of c.strips) {
    assert.equal(top, y, 'the strips run on from the cut with no gap');
    assert.ok(a < last && a > 0, 'each strip fainter');
    y = top + h;
    last = a;
  }
  assert.ok(last <= 0.15, 'the last strip all but gone');
  assert.ok(y < floor - 20, `the pole ends ${floor - y} px over the floor, behind the foam, not in the pool`);
});

test('the foot\'s bake is kept, and baked again when the phone took the copy back (LESSONS D6)', () => {
  let lost = false;
  const fake = () => ({ width: 168, height: 64, addEventListener() {}, getContext: () => ({ isContextLost: () => lost }) }) as unknown as HTMLCanvasElement;
  const cache = new Map<string, HTMLCanvasElement>();
  let bakes = 0;
  const bake = () => (bakes++, fake());
  const a = cachedBake(cache, 'k', bake);
  assert.ok(a && bakes === 1);
  assert.equal(cachedBake(cache, 'k', bake), a, 'kept: not baked again');
  assert.equal(bakes, 1);
  lost = true;
  const b = cachedBake(cache, 'k', bake);
  assert.equal(bakes, 2, 'lost: baked again');
  assert.notEqual(b, a);
  assert.equal(cachedBake(new Map(), 'k', () => null), null, 'no canvas to bake into: nothing');
});
