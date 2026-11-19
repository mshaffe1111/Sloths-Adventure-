/**
 * BUILD-24d (the lead's quality item 2, 11-19): a safe river (the splash-back river: Easy's every river, Normal's teaching river) is
 * painted as ART-W2's shallow strip (riverArt.ts RIVER_LOOK.safe), and until that strip has loaded drawRiverWater draws the DEEP sheet:
 * a flat dark-teal slab to the screen's foot, the look of a river that costs a life (the lead's ruling 1, 11-15). The strip was asked for
 * only on the first draw of a safe river, so the first frame of every first safe river showed that slab (2-4 Easy sideways, x20900: frame
 * 1 deep, frame 2 the bed and its stones; reference/qa-reports/BUILD-24d/stills/item2-*). A stage that draws a river loads it with the
 * stage, as it loads the river sheet: stagePreload.ts 'w2-props'.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { start } from './stagePreload.ts';
import { RIVER_LOOK, W2_PROPS_URL } from './riverArt.ts';
import { stageSheets } from './stageSheets.ts';
import { generateAllLevels } from './worldsData.ts';

test('a stage with a river loads the safe river strip with the river sheet, before play', () => {
  const urls = start(['w2-props']);
  assert.ok(urls.includes(W2_PROPS_URL), 'the river sheet');
  assert.ok(urls.includes(RIVER_LOOK.safe.url), 'the shallow safe-river strip is asked for with the stage, not on its first draw');
});

test('2-4 and 2-1 (rivers, safe on Easy and at the teach) ask for w2-props, so for the strip', () => {
  const levels = generateAllLevels();
  for (const id of ['2-1', '2-4']) assert.ok(stageSheets(levels.find((l) => l.id === id)!, { hand: true, paint: true }).includes('w2-props'), id);
});
