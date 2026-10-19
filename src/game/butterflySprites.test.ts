import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUTTERFLY_FRAMES } from './butterflyAtlasData.ts';
import { BUTTERFLY_SPECIES, butterflySpecies } from './butterflySprites.ts';

test('every species has all five wing frames in the atlas', () => {
  for (const sp of Object.keys(BUTTERFLY_SPECIES)) {
    for (let k = 0; k < 5; k++) assert.ok(BUTTERFLY_FRAMES[`${sp}_${k}`], `${sp}_${k} missing`);
  }
});

test('each world picks species that exist, and neighbours differ', () => {
  for (const w of [1, 2, 5, 7, 10]) {
    for (let i = 0; i < 8; i++) assert.ok(BUTTERFLY_SPECIES[butterflySpecies(w, i)], `world ${w} butterfly ${i}`);
    assert.notEqual(butterflySpecies(w, 0), butterflySpecies(w, 1));
  }
});
