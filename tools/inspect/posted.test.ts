/**
 * A posted animal that stillness beats (its kit row never walks, predators/core.ts `immobile`, and lists beatenBy.still: World 1's boa)
 * is read by the beat inspector as the freeze (L: hold still in its strike), never as a fight (F, the letter of 1-2's snakes). An animal
 * that walks reads as before (World 1's snake: F or its own trick letter, never L).
 * VAR-19, the lead's ruling R1 11-19 1:55 PM ET: 1-9's whole idea, hold still while the boa rears, read as eleven fights, so the fun gate
 * called 1-9 "nothing new" on every layout. Planted: without the fix in tools/inspect/beats.ts (POSTED_STILL on a stillBeaten animal) and
 * tools/validate/core.ts (moveOf 'L') the stage tests here are red. The stages are read from the stage table (the first whose layout 1
 * lays a posted still-beaten animal, the first that lays a walking one), so no stage id is named here.
 */
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, moveOf } from '../validate/core.ts';
import { stillBeaten } from './beats.ts';
import { STAGE_TABLE } from '../../src/game/gen2/worlds/stageTable.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { castDef } from '../../src/game/predators/registry.ts';
import { immobile } from '../../src/game/predators/core.ts';

type Animal = { type: string };
/** the first listed stage whose layout 1 (Normal) lays an animal `pick` accepts, with that animal's kind */
function stageWith(pick: (kind: string, world: number) => boolean): { id: string; kind: string } {
  setDifficulty('normal');
  for (const id of Object.keys(STAGE_TABLE)) {
    const p = new RealPlay(id, 1);
    const world = p.stage.config.worldIndex;
    const e = (p.stage.enemies as Animal[]).find((q) => q.type !== 'eagle' && pick(q.type, world));
    if (e) return { id, kind: e.type };
  }
  throw new Error('no listed stage lays such an animal: the test has nothing to read');
}
const POSTED = stageWith((k, w) => stillBeaten(k, w));
const WALKS = stageWith((k, w) => { const d = castDef(k, w); return !!d && !immobile(d); });

test('the reading follows the kit row: the boa is posted and still-beaten, the snake walks', () => {
  assert.equal(stillBeaten('boa', 1), true, "World 1's boa: immobile, beatenBy.still");
  assert.equal(stillBeaten('snake', 1), false, "World 1's snake walks its patrol");
  assert.equal(stillBeaten('eagle', 1), false, 'a sweeper is not posted');
  assert.equal(stillBeaten('no-such-kind', 1), false, 'a kind with no kit row reads as before');
});

for (const setting of ['normal', 'easy'] as const) {
  test(`a posted animal stillness beats reads as the freeze (L), never a fight (${setting})`, () => {
    const b = build(POSTED.id, 1, setting);
    const mine = b.steps.filter((s) => new RegExp(`^${POSTED.kind}\\b`).test(s.what));
    assert.ok(mine.length >= 1, `${POSTED.id}: no ${POSTED.kind} beat on the route`);
    const fights = mine.filter((s) => s.m !== 'L');
    assert.equal(fights.length, 0, `${POSTED.id}: ${fights.length} of ${mine.length} ${POSTED.kind} beats read as ${[...new Set(fights.map((s) => s.m))].join('')}, not the freeze`);
  });
  test(`a walking animal still reads as a fight or its trick, never the freeze (${setting})`, () => {
    const b = build(WALKS.id, 1, setting);
    const mine = b.steps.filter((s) => new RegExp(`^${WALKS.kind}\\b`).test(s.what));
    assert.ok(mine.length >= 1, `${WALKS.id}: no ${WALKS.kind} beat on the route`);
    assert.equal(mine.filter((s) => s.m === 'L').length, 0, `${WALKS.id}: a walking ${WALKS.kind} read as the freeze`);
    assert.ok(mine.some((s) => s.m === 'F'), `${WALKS.id}: no ${WALKS.kind} read as a fight`);
  });
}

test('the move letter: a posted animal stillness beats is L, a plain animal F', () => {
  assert.equal(moveOf({ letter: 'C', what: 'boa (posted: hold still in its strike)', count: 1 }), 'L');
  assert.equal(moveOf({ letter: 'C', what: 'snake', count: 1 }), 'F');
});
