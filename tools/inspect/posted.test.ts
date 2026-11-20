/**
 * A posted animal that stillness beats (its kit row never walks, predators/core.ts `immobile`, and lists beatenBy.still: World 1's boa)
 * is read by the beat inspector as the freeze (L: hold still in its strike), never as a fight (F, the letter of 1-2's snakes). An animal
 * that walks reads as before (World 1's snake: F or its own trick letter, never L).
 * VAR-19, the lead's ruling R1 11-19 1:55 PM ET: 1-9's whole idea, hold still while the boa rears, read as eleven fights, so the fun gate
 * called 1-9 "nothing new" on every layout. Planted: without the fix in tools/inspect/beats.ts (POSTED_STILL on a stillBeaten animal) and
 * tools/validate/core.ts (moveOf 'L') the stage tests here are red. The stages are read from the stage table (the first whose layout 1
 * lays a posted still-beaten animal, the first that lays a walking one), so no stage id is named here.
 * And the fun gate's "enemy by a landing" (tools/validate/mechanics.ts enemyJobs) measures a posted animal from its body, never a patrol
 * span it never walks, and a walking one from its patrol span (VAR-19, the lead's ruling R2 11-19 1:55 PM ET: every 1-9 boa read 24-89 px
 * from a landing off its span; LANDING_CLEAR is unchanged). Planted: with the span read for the boa, the far boa reads 10 px and is red.
 */
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, fromStage, moveOf } from '../validate/core.ts';
import { enemyJobs, LANDING_CLEAR } from '../validate/mechanics.ts';
import type { Platform } from '../../src/game/types.ts';
import type { Stage } from './stages.ts';
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

test('enemy by a landing: a posted boa is measured from its body, a walking snake from its patrol span', () => {
  const G = 580;
  const floor = (x0: number, x1: number, id: number): Platform => ({ id, x: x0, y: G, width: x1 - x0, height: 90, type: 'solid', style: 'log' } as Platform);
  const ps = [floor(100, 600, 1), floor(680, 2400, 2)];
  // (the same span for both, 200 px back from the body: the jump onto the far floor lands at about 680-700)
  const near = (type: string, x: number): number | null => {
    const r = new RealPlay('1-2', 1);
    r.bare(ps);
    Object.assign(r.stage as Stage & Record<string, unknown>, { platforms: ps, vines: [], ropes: [], zones: [], checkpoints: [], trees: [], spawnX: 150, spawnY: G, exitTotemX: 2300, exitTotemY: G, proto: undefined, kit: undefined,
      enemies: [{ id: 1, type, x, y: G - 26, width: 58, height: 26, patrolMinX: x - 200, patrolMaxX: x + 60, hp: 1, maxHp: 1, defeated: false }] });
    return enemyJobs(fromStage('fixture', 1, 'normal', r, r.stage as Stage)).jobs[0].nearLanding;
  };
  const far = near('boa', 900);
  assert.equal(far, null, `a boa whose body is ${LANDING_CLEAR}+ px past the landing is clear, though its span reaches back: ${far}`);
  assert.notEqual(near('boa', 760), null, 'a boa whose body is by the landing is still flagged');
  assert.notEqual(near('snake', 900), null, 'a snake whose patrol reaches the landing is still flagged');
});
