import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BIRD_FRAMES } from './birdAtlasData.ts';
import { BIRD_SPECIES, PAINTED_FLOCKS, birdFrame } from './birdSprites.ts';

test('every bird species has all four wing frames in the atlas', () => {
  for (const sp of Object.keys(BIRD_SPECIES)) {
    for (let k = 0; k < 4; k++) assert.ok(BIRD_FRAMES[`${sp}_${k}`], `${sp}_${k} missing`);
  }
});

test('every flock only names species that exist', () => {
  for (const [w, flocks] of Object.entries(PAINTED_FLOCKS)) {
    for (const fl of flocks) {
      assert.ok(fl.pool.length > 0 && fl.flocks > 0 && fl.n > 0, `world ${w} flock is empty`);
      for (const sp of fl.pool) assert.ok(BIRD_SPECIES[sp], `world ${w}: unknown species ${sp}`);
      assert.ok(fl.y[0] < fl.y[1] && fl.period[0] <= fl.period[1]);
    }
  }
});

test('the flap loop visits all four poses and wraps', () => {
  const seen = new Set<number>();
  for (let i = 0; i < 60; i++) seen.add(birdFrame(i / 60));
  assert.deepEqual([...seen].sort(), [0, 1, 2, 3]);
  assert.equal(birdFrame(0), birdFrame(1));
  assert.equal(birdFrame(-0.5), birdFrame(0.5));
});
