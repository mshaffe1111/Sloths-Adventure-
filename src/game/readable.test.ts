import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BACKDROP_L, poolDepth } from './readable.ts';

test('every world has a backdrop lightness, and the pool never vanishes or goes solid', () => {
  assert.equal(BACKDROP_L.length, 10);
  for (let w = 1; w <= 10; w++) {
    const d = poolDepth(w);
    assert.ok(d >= 0.2 && d <= 0.54, `world ${w}: ${d}`);
  }
});

test('lighter backdrops get a deeper pool than darker ones', () => {
  assert.ok(poolDepth(2) > poolDepth(3)); // pale Canopy vs the dim Hollow-like world
  assert.ok(poolDepth(1) > poolDepth(10));
});

test('out-of-range worlds are clamped, not crashed', () => {
  assert.equal(poolDepth(0), poolDepth(1));
  assert.equal(poolDepth(99), poolDepth(10));
});
