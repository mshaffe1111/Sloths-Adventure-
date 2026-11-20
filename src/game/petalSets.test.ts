// ART-22P (11-18): the drifting-petal sets are data. Every world look that names a set names a real one; World 2's drifts are the
// river's (lavender hyacinth and white lily, what 2-2 gathers), not the mixed sheet's pinks; an unset or unknown set draws the mixed sheet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOOKS } from './scenery.ts';
import { PETAL_SETS, PETAL_SET_IDS, petalSet } from './petalSprites.ts';

test('every look that names a petal set names a real one, and World 2 drifts the river set', () => {
  for (const [w, look] of Object.entries(LOOKS)) if (look.petals !== undefined) assert.ok(PETAL_SET_IDS.includes(look.petals as never), `world ${w}: ${look.petals}`);
  assert.equal(LOOKS[2].weather, 'petals');
  assert.equal(petalSet(LOOKS[2].petals), 'river');
});

test('an unset or unknown set is the mixed sheet; every set has painted frames inside a 512 px sheet', () => {
  assert.equal(petalSet(undefined), 'mixed');
  assert.equal(petalSet('nope'), 'mixed');
  assert.equal(petalSet('toString'), 'mixed', 'an inherited name is not a set');
  for (const id of PETAL_SET_IDS) {
    const f = PETAL_SETS[id].frames;
    assert.ok(f.length >= 8, `${id}: ${f.length} frames`);
    for (const r of f) assert.ok(r.x >= 0 && r.y >= 0 && r.w > 8 && r.h > 8 && r.x + r.w <= 512 && Math.max(r.w, r.h) <= 64, `${id} ${JSON.stringify(r)}`);
  }
});
