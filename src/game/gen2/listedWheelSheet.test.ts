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
import { listedStage } from './listed.ts';
import { STAGE_26 } from './worlds/w2Arc26.ts';

const on = { hand: true, paint: true };


test("a listed row that lays a water wheel preloads the painted noria (stageSheets 'w2-wheel')", () => {
  const cfg = generateAllLevels().find((c) => c.id === STAGE_26 && !c.secret)!;
  // (re-pointed at the LISTED 2-6, ENG-26k on the lead's ruling: the draft row is now the real stage, no hand-built 2-6 routed before it)
  assert.ok(!(STAGE_26 in (W2_STAGES as Record<string, unknown>)) && listedStage(STAGE_26), 'the listed row is what Play rolls');
  assert.ok(stageSheets(cfg, on).includes('w2-wheel'), `the listed row asks for the wheel sheet (${stageSheets(cfg, on).join(', ')})`);
  // (and a World 2 stage that lays no wheel never asks for it)
  const other = generateAllLevels().find((c) => c.id === '2-2' && !c.secret)!;
  assert.ok(!stageSheets(other, on).includes('w2-wheel'), '2-2 lays no wheel');
});
