import test from 'node:test';
import assert from 'node:assert/strict';
import { stageFlowers, WORLD_FLOWERS, flowerFor } from './flowerSprites.ts';
import { FLOWER_FRAMES } from './flowerAtlasData.ts';

test('every stage of a world carries its own mix of four different flowers', () => {
  for (let w = 1; w <= 10; w++) {
    const seen = new Set<string>();
    for (let m = 1; m <= 10; m++) {
      const f = stageFlowers(w, m);
      assert.equal(new Set(f).size, 4, `world ${w} stage ${m} repeats a flower`);
      const key = [...f].sort((a, b) => a - b).join(',');
      assert.ok(!seen.has(key), `world ${w} stage ${m} has the same mix as an earlier stage`);
      seen.add(key);
    }
  }
});

test('every painted flower is used somewhere in the game, and every number has a picture', () => {
  const used = new Set<number>();
  for (let w = 1; w <= 10; w++) for (let m = 1; m <= 10; m++) for (const n of stageFlowers(w, m)) used.add(n);
  for (let n = 65; n <= 96; n++) assert.ok(used.has(n), `flower ${n} is never used`);
  for (const pool of Object.values(WORLD_FLOWERS)) for (const n of pool) assert.ok(FLOWER_FRAMES['f' + n], `no picture for ${n}`);
});

test('neighbouring pickups in a row differ', () => {
  for (let id = 0; id < 12; id++) assert.notEqual(flowerFor(3, 2, id), flowerFor(3, 2, id + 1));
});
