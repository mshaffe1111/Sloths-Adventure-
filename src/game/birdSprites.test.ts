import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BIRD_FRAMES } from './birdAtlasData.ts';
import { BIRD_SPECIES, PAINTED_FLOCKS, birdFrame, flockSpecies } from './birdSprites.ts';

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

test('over a few stages every species in a pool takes its turn, and all twelve species fly somewhere', () => {
  const seen = new Set<string>(['hummer']); // the hummingbirds are the cloud forest's own (life.ts)
  for (const [w, flocks] of Object.entries(PAINTED_FLOCKS)) {
    let flockNo = 0;
    for (const fl of flocks) {
      const got = new Set<string>();
      for (let seed = 1; seed <= 200; seed++) got.add(flockSpecies(fl.pool, Number(w), flockNo, 0, seed));
      assert.deepEqual([...got].sort(), [...fl.pool].sort(), `world ${w}: some species never fly`);
      for (const sp of got) seen.add(sp);
      flockNo++;
    }
  }
  assert.deepEqual([...seen].sort(), Object.keys(BIRD_SPECIES).sort());
});

test('worlds 5 and 6 have a painted flock, and no flock flies in the hero lane', () => {
  assert.ok(PAINTED_FLOCKS[5]?.length && PAINTED_FLOCKS[6]?.length);
  for (const [w, flocks] of Object.entries(PAINTED_FLOCKS)) for (const fl of flocks) assert.ok(fl.y[1] <= 0.36, `world ${w} flock reaches ${fl.y[1]} of the view`);
});
