import { test } from 'node:test';
import assert from 'node:assert/strict';
import { starsPossible } from './mapStars.ts';
import { generateAllLevels } from '../game/worldsData.ts';

test("the map's star total is three a stage, counted from the stages (UI-11)", () => {
  assert.equal(starsPossible([{}, {}, { secret: true }]), 6);
  // (the two extra stages, 4-D and 5-M, join the list in a browser: extraStages.ts newStagesOn)
  const g = globalThis as { location?: unknown };
  g.location = { search: '', hash: '', href: 'http://localhost/' };
  try {
    const all = generateAllLevels();
    assert.equal(starsPossible(all), all.filter((l) => !l.secret).length * 3);
    assert.equal(starsPossible(all), 306, 'the hundred stages and the two extra ones');
  } finally {
    delete g.location;
  }
});
