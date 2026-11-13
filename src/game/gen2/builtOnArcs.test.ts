// The flown arcs judge a stage gen2 BUILT, never a stage by its id alone (stream B's trap, the lead 11-11 8:30 PM): the old builder
// still lays stages under ids that will get a JUDGED row (the old 1-2, the testers' control course on its id), and the level check
// (validateAsJudged), the pickups' reach (finishReach) and the petal pass asked `judgedOnArcs(config.id)`. Planted: a JUDGED row
// for a stage the old builder lays; red before `builtOnArcs`.
//   npx tsx --test src/game/gen2/builtOnArcs.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { builtOnArcs, JUDGED, linkArcs } from './reach.ts';
import { validateAsJudged, validateStage } from '../levelCheck.ts';
import { finishReach } from '../stageGenerator.ts';
import { buildProtoStage } from '../protoStage.ts';
import { generateAllLevels } from '../worldsData.ts';
import { provenSeeds, buildPlayStage } from './seedList.ts';
import { w1World } from './worlds/w1.ts';

const level = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true });

test('a stage the old builder laid is judged by the closed form even when its id has a JUDGED row; a gen2-built stage by the arcs', () => {
  // (F12: 1-2 has its own JUDGED row. P12S: the game rolls 1-2 on gen2 now, so the case this test plants is the one the old builder still
  // lays under 1-2's id: the testers' old control course, stageGenerator.ts CTEST_STAGE_ID, buildProtoStage's 'ctest' plan (R-165.151))
  const id = '1-2';
  assert.equal(JUDGED[id], 'normal-1-2', '1-2 is judged on its own flown rows');
  let told = 0;
  // (16 mixes: the closed form and the arcs disagree on mixes 8, 9, 12-15 of the first 16, so the case tells)
  for (let v = 1; v <= 16; v++) {
    const st = buildProtoStage(level(id), v, 'ctest');
    assert.equal(st.config.id, id, 'the fixture is laid under 1-2\'s id');
    assert.equal((st as { gen2?: unknown }).gen2, undefined, 'the fixture must be an old-builder stage');
    assert.equal(builtOnArcs(st), false);
    const closed = validateStage(st, { rooms: false }), flown = validateStage(st, { rooms: false, arcs: linkArcs('normal', id) });
    if (JSON.stringify(closed.reachableIds) !== JSON.stringify(flown.reachableIds)) told++;
    assert.deepEqual(finishReach(st, 'normal'), closed.reachableIds, `mix ${v}: the pickups' reach flew an old-builder stage`);
    assert.deepEqual(validateAsJudged(st, { rooms: false }).reachableIds, closed.reachableIds, `mix ${v}: the level check flew an old-builder stage`);
  }
  assert.ok(told > 0, 'the arcs and the closed form agree on all 16 mixes: the planted case tells nothing (take more mixes)');
});

test('1-1 as Play builds it is still judged on its arcs (nothing moves)', () => {
  const st = buildPlayStage(level('1-1'), w1World(), provenSeeds('1-1')[0], 'normal');
  assert.equal(builtOnArcs(st), true);
  assert.deepEqual(validateAsJudged(st).reachableIds, validateStage(st, { arcs: linkArcs('normal', '1-1') }).reachableIds);
});
