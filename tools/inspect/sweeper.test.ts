/**
 * A kit sweeper (World 1's eagle laid over a watched stretch: gen2/stillLay.ts castWatches, isKitSweeper) is read by the beat inspector
 * as the watched stretch it was laid from (E: duck into cover), never as a fight (F, "eagle swoops", the letter of 1-2's snakes).
 * VAR-1, the lead's ruling 11-18 10:00 AM ET: 1-7's whole idea, hide from the eagle, read as nine fights, so the fun gate called it
 * "nothing new" and "like 1-2". Planted: without the fix in tools/inspect/beats.ts (the animals loop skips a kit sweeper; the watched
 * stretches loop adds stillLay.ts sweptZones) every test here is red. The stage is read from the stage table, the first stage whose
 * built layout holds a kit sweeper, so no stage id is named here.
 */
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../validate/core.ts';
import { isKitSweeper } from '../../src/game/gen2/stillLay.ts';
import { STAGE_TABLE } from '../../src/game/gen2/worlds/stageTable.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';

/** the first listed stage whose layout 1 (Normal) lays kit sweepers, with how many */
function sweptStage(): { id: string; n: number } {
  setDifficulty('normal');
  for (const id of Object.keys(STAGE_TABLE)) {
    const n = (new RealPlay(id, 1).stage.enemies as Parameters<typeof isKitSweeper>[0][]).filter((e) => isKitSweeper(e)).length;
    if (n) return { id, n };
  }
  throw new Error('no listed stage lays a kit sweeper: the test has nothing to read');
}
const S = sweptStage();

for (const setting of ['normal', 'easy'] as const) {
  test(`a kit sweeper reads as its watched stretch (E), never a fight (${setting})`, () => {
    const b = build(S.id, 1, setting);
    const sweeps = b.steps.filter((s) => s.m === 'E');
    const fights = b.steps.filter((s) => /eagle swoops/.test(s.what));
    assert.equal(fights.length, 0, `${S.id}: ${fights.length} kit sweepers read as a fight ("eagle swoops", F)`);
    assert.ok(sweeps.length >= 1, `${S.id}: no watched stretch (E) on the route though it lays ${S.n} kit sweepers`);
    assert.ok(sweeps.every((s) => /eagle sweep/.test(s.what)), `${S.id}: an E that is not a watched stretch`);
  });
}
