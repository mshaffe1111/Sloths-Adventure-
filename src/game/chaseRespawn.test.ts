/**
 * AUDIT A-07 (2026-11-11), re-pointed at a LAID chase by ENG-LOOK (1) (the hand-built 1-8 and the engine's own collapse are deleted):
 * a life lost any way but the chase's own catch (an animal takes his last heart) goes through loseLife -> respawnAtCheckpoint. If that
 * way back knew nothing about the chase, he would be set down at his flag with the front still where it was: the very next frame it
 * "catches" him, takes a heart and respawns him a second time.
 *
 * The rules (unchanged): every death in a chase is ONE respawn at full hearts with the collapse waiting behind the flag (A-07); and a
 * respawn at a flag BEFORE the chase starts leaves the chase as it was at the stage start, so it sets off the usual distance behind him
 * (A-07b, the Critic's EN-F). On every stage that lays a chase (chaseTestKit.ts laidChaseStages), no stage's ids or x.
 *
 * Run: npx tsx --test src/game/chaseRespawn.test.ts
 */
import { makeEngine, standOn, step } from './engineCoreHarness.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { caughtInRun, frontBehind, newChaseRun } from './chase.ts';
import { chaseRunOf, forkFlag, laidChaseStages, sectionAt } from './chaseTestKit.ts';

for (const id of laidChaseStages()) {
  test(`A-07 ${id}: a life lost to an animal during a laid chase is one respawn, at full hearts, with the collapse behind the flag`, () => {
    const { e } = makeEngine(id);
    const lay = e.currentStage.chase;
    const run = chaseRunOf(e);
    const { i, flag } = forkFlag(lay, e.currentStage.checkpoints);
    const st = lay.stretches[i];
    // he reached the flag on the fork and ran 600 px into the next stretch; its front is 200 px behind him, well past the flag
    e.checkpoint = { x: flag.x, y: flag.y };
    const at = sectionAt(e.platforms, st.start + 600);
    standOn(e, at.pl, at.x);
    Object.assign(run.fronts[i], { active: true, front: e.player.x - 200, hold: 0 });
    step(e, 2);
    assert.ok(run.fronts[i].front > flag.x, 'the front has passed his flag');
    const lives = e.lives;
    const hearts = e.statHeartsLost;
    const bite = e.player.hp;
    let respawns = 0;
    const respawn = e.respawnAtCheckpoint.bind(e);
    e.respawnAtCheckpoint = (...a: unknown[]) => {
      respawns++;
      return respawn(...a);
    };
    // an animal takes his last heart
    e.player.invincibleTimer = 0;
    e.stompGrace = 0;
    e.damagePlayer(e.player.hp, e.player.x + 30);
    step(e, 90);
    assert.equal(e.lives, lives - 1, 'one life lost');
    assert.ok(
      respawns === 1 && e.player.hp === e.player.maxHp,
      `one death to an animal in the chase: ${respawns} respawns, and he stands at the flag with ${e.player.hp} of ${e.player.maxHp} hearts`,
    );
    assert.equal(e.statHeartsLost - hearts, bite, 'the bite\'s hearts, and none taken by the collapse on top of the life');
    // (the collapse waits behind the flag: nothing catches him there, and no running front is past it)
    assert.ok(!caughtInRun(run, flag.x), 'not caught at his flag');
    const behind = frontBehind(run, e.player.x);
    assert.ok(behind === null || behind < flag.x, `the front nearest behind him is at ${behind}, his flag at ${flag.x}`);
    assert.ok(run.fronts.every((f, k) => !f.active || f.front >= lay.stretches[k].end || f.front < flag.x), 'every running front is behind his flag');
  });

  test(`A-07b ${id}: a respawn at a flag BEFORE the chase starts leaves the chase as it was at the stage start: it sets off the usual distance behind him`, () => {
    const { e } = makeEngine(id);
    const lay = e.currentStage.chase;
    const run = chaseRunOf(e);
    const first = lay.stretches[0];
    const before = e.currentStage.checkpoints.filter((c: { x: number }) => c.x < first.start).sort((a: { x: number }, b: { x: number }) => b.x - a.x)[0]
      ?? { x: e.currentStage.spawnX, y: e.currentStage.spawnY };
    e.checkpoint = { x: before.x, y: before.y };
    e.respawnAtCheckpoint('pit');
    const fresh = newChaseRun(lay, e.easy);
    assert.deepEqual(run.fronts.map((f) => ({ ...f })), fresh.fronts, 'the chase is the fresh one, every front waiting at its start');
    // he runs onto the first stretch: it sets off the usual distance behind him, with no extra wait
    const at = sectionAt(e.platforms, first.start + 20);
    standOn(e, at.pl, at.x);
    step(e, 2);
    assert.ok(run.fronts[0].active, 'the chase started');
    const gap = e.player.x - run.fronts[0].front;
    assert.ok(gap <= run.row.behind + 40 && run.fronts[0].hold === 0, `it set off ${Math.round(gap)} px behind him (the usual is ${run.row.behind}), hold ${run.fronts[0].hold}`);
  });
}
