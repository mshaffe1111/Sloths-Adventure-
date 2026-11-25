/**
 * A LISTED stage whose sections lay a water wheel asks for World 2's painted noria with its stage (stageSheets 'w2-wheel'), as a gen2
 * stage does (ENG-26f): 2-6's draft row, listed the way rowWheels plants it, asked for no wheel sheet (laysWheel read GEN2_STAGES only,
 * which never holds a stageTable row; R-165.288 was the same miss for 2-4's rafts), so on the phone the noria would pop in once the sheet
 * loaded. RED on laysWheel reading GEN2_STAGES alone.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stageSheets } from '../stageSheets.ts';
import { generateAllLevels } from '../worldsData.ts';
import { W2_STAGES } from '../w2Stages.ts';
import { withTestStage } from './listed.ts';
import { kitLib26, STAGE_26 } from './worlds/w2Arc26.ts';
import { w2Finish } from './worlds/w2.ts';

const on = { hand: true, paint: true };

test("a listed row that lays a water wheel preloads the painted noria (stageSheets 'w2-wheel')", () => {
  const cfg = generateAllLevels().find((c) => c.id === STAGE_26 && !c.secret)!;
  const hands = W2_STAGES as Record<string, unknown>;
  const hand = hands[STAGE_26];
  // (the row as Play rolls it: listed, the hand-built stage of the same id put aside, as rowWheels.ts withPlantedRow does)
  delete hands[STAGE_26];
  try {
    withTestStage({ [STAGE_26]: { kit: kitLib26, world: w2Finish as never, seeds: [] } }, () => {
      assert.ok(stageSheets(cfg, on).includes('w2-wheel'), `the draft row asks for the wheel sheet (${stageSheets(cfg, on).join(', ')})`);
    });
  } finally {
    hands[STAGE_26] = hand;
  }
  // (and a World 2 stage that lays no wheel never asks for it)
  const other = generateAllLevels().find((c) => c.id === '2-2' && !c.secret)!;
  assert.ok(!stageSheets(other, on).includes('w2-wheel'), '2-2 lays no wheel');
});
