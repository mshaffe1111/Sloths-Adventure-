import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLANT_FRAMES } from './plantAtlasData.ts';
import { WORLD_PLANTS, stagePlants, plantFor } from './plantSprites.ts';

test('every plant in every world pool is in the atlas, and a pool has no repeats', () => {
  for (const [w, pool] of Object.entries(WORLD_PLANTS)) {
    assert.equal(pool.length, 12, `world ${w}`);
    assert.equal(new Set(pool).size, 12, `world ${w} repeats a plant`);
    for (const n of pool) assert.ok(PLANT_FRAMES['p' + n], `world ${w}: p${n} missing`);
  }
});

test('a stage carries four different plants and neighbouring stages differ', () => {
  for (let w = 1; w <= 10; w++) {
    for (let m = 1; m <= 10; m++) {
      const set = stagePlants(w, m);
      assert.equal(new Set(set).size, 4, `${w}-${m}`);
      if (m > 1) assert.notDeepEqual(set, stagePlants(w, m - 1), `${w}-${m} same as the stage before`);
    }
  }
});

test('a pickup id picks one of its stage plants, and neighbours differ', () => {
  const set = stagePlants(3, 4);
  for (let id = 0; id < 12; id++) assert.ok(set.includes(plantFor(3, 4, id)));
  assert.notEqual(plantFor(3, 4, 0), plantFor(3, 4, 1));
});
