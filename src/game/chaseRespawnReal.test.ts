/**
 * A chase and the ways back to a flag, played in the real engine (realPlay.ts). Audit C's three tests (worlds-chase-gameover-loop,
 * worlds-chase-other-death, things-chase-respawn-double), moved into the suite by EN-F with audit A-07 (chaseRespawn.test.ts), and
 * re-pointed at a LAID chase by ENG-LOOK (1): the hand-built 1-8 and the engine's own collapse are deleted; the chase is the stage's
 * data (gen2 chaseLay) run by pieces/chasePiece.ts, and the rules hold on every stage that lays one (chaseTestKit.ts), no stage's ids or x.
 * Each rule's own note follows.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { chaseRunOf, forkFlag, laidChaseStages, sectionAt } from './chaseTestKit.ts';

/** a RealPlay on a chase stage with the engine's own life-lost path, his flag on the fork before a later stretch, `into` px into it */
function onStretch(id: string, into: number) {
  const r = new RealPlay(id, 1);
  const e = r.e as any;
  delete e.loseLife; // the engine's own (the harness swaps it for a note)
  const lay = r.stage.chase!;
  const run = chaseRunOf(e);
  const { i, flag } = forkFlag(lay, r.stage.checkpoints ?? [], into + 200);
  const st = lay.stretches[i];
  // he touches the flag on the fork
  r.stand(flag.x, flag.y);
  for (let k = 0; k < 10; k++) r.frame();
  assert.ok(Math.abs(e.checkpoint.x - flag.x) < 1, 'the flag is his');
  return { r, e, run, i, st, flag, at: sectionAt(r.platforms, st.start + into) };
}

/**
 * Audit C (worlds): the engine keeps stepping under the Game Over card (App.tsx never pauses it there: Continue needs it alive), and
 * every death path must check `isGameOver` first (the chase's catch did not, and loseLife itself only checks `down`). Out of lives on a
 * chase stretch, the collapse would catch the body again and again: lives going negative and onDefeat firing each time (App counts a
 * fail, the defeat sting plays).
 */
for (const id of laidChaseStages()) {
  for (const how of ['caught by the front', 'fell off the branch'] as const) {
    test(`${id}: out of lives (${how}), the Game Over card up for 12 s: one defeat, lives never below 0`, () => {
      const { r, e, run, i, at } = onStretch(id, 1500);
      r.safe = false;
      let defeats = 0;
      const seen: number[] = [];
      e.callbacks.onDefeat = () => defeats++;
      e.callbacks.onLivesChange = (l: number) => seen.push(l);
      if (how === 'caught by the front') r.stand(at.x, at.pl.y);
      else r.fly(at.x, at.pl.y + 320, 0, 200, 0); // past the branch's 300 px fall line
      r.safe = false;
      e.player.invincibleTimer = 0;
      Object.assign(run.fronts[i], { active: true, front: how === 'caught by the front' ? at.x - 10 : at.x - 400, hold: 0 });
      e.lives = 1;
      e.player.hp = 1;
      for (let k = 0; k < 30 * 12; k++) r.frame();
      assert.ok(e.isGameOver, 'the run is over');
      assert.ok(Math.min(...seen) >= 0, `lives shown: ${seen.join(', ')}`);
      assert.equal(defeats, 1, 'onDefeat once');
      assert.equal(e.statLivesLost, 1, 'one life lost in the stats');
    });
  }

  /**
   * Audit C (worlds): every way back to a flag that is not the chase's own catch (an animal taking the last heart; Continue after a Game
   * Over) goes through respawnAtCheckpoint. If the front stayed where it was, ahead of the flag he comes back to, the frame after the
   * respawn he would be "caught" and pay a heart on top of the life, with a second respawn.
   */
  test(`${id}: a life lost to a snake mid-chase brings him back with every heart, the collapse waiting behind the flag`, () => {
    const { r, e, run, i, flag, at } = onStretch(id, 1500);
    // 1500 px on along the stretch, the collapse 400 px behind him (where a steady run keeps it)
    r.stand(at.x, at.pl.y);
    Object.assign(run.fronts[i], { active: true, front: at.x - 400, hold: 0 });
    r.frame();
    const lives = e.lives;
    const hearts = e.statHeartsLost;
    // a snake's bite on his last heart (engine.ts damagePlayer -> loseLife('hurt'))
    e.player.hp = 0;
    e.loseLife('hurt');
    for (let k = 0; k < 60; k++) r.frame(); // the 0.75 s beat, the respawn, a second on
    assert.equal(e.lives, lives - 1, 'one life');
    assert.equal(Math.round(e.player.x), Math.round(flag.x), 'back at his flag');
    assert.equal(e.statHeartsLost - hearts, 0, 'no heart taken by the collapse he was put back behind');
    assert.equal(e.player.hp, e.player.maxHp, 'every heart back, as after any life lost');
    // (the collapse waits behind the flag: the branch whole from it, the stretch's front not past it)
    assert.ok(r.platforms.filter((q) => q.chase && q.x >= flag.x).every((q) => !q.broken), 'the branch is whole from his flag');
    assert.ok(!run.fronts[i].active || run.fronts[i].front < flag.x, `the front waits behind his flag (at ${Math.round(run.fronts[i].front)}, the flag at ${flag.x})`);
  });

  /**
   * Audit C (things): two set-back paths that must know about each other. Caught by the collapse, or off the branch: a heart, the
   * branch put back from his flag and the front restarted behind it. A life lost any other way there: loseLife -> respawnAtCheckpoint.
   * With the front PAST his flag when he dies, a way back that left it there would stand him at a flag already fallen with the front
   * ahead of him: caught the next frame, a heart on top of the life, and a second respawn.
   *
   * Correct: the life, and he comes back at his flag with every heart, the branch whole from there.
   */
  test(`${id}: a life lost to a hit while the collapse is past his flag costs the life, and no heart on top`, () => {
    const { r, e, run, i, flag, at } = onStretch(id, 650);
    e.isRunning = true;
    r.safe = false;
    // he has run on into the stretch, its front 150 px into it behind him: past the flag on the fork
    r.stand(at.x, at.pl.y);
    Object.assign(run.fronts[i], { active: true, front: Math.min(at.x - 300, run.lay.stretches[i].start + 150), hold: 0 });
    assert.ok(run.fronts[i].front > flag.x, 'the collapse is past his flag');
    r.frame();
    r.frame();
    assert.equal(e.down, null, 'he is running, not caught');
    r.p.hp = r.p.maxHp;
    const hearts0 = e.statHeartsLost;
    const lives0 = e.lives;
    let respawns = 0;
    const respawn = e.respawnAtCheckpoint.bind(e);
    e.respawnAtCheckpoint = (...a: unknown[]) => {
      respawns++;
      return respawn(...a);
    };
    // a snake takes a life (damagePlayer -> loseLife('hurt') on his last heart)
    e.loseLife('hurt');
    // (2 s: the life-lost beat and the respawn; he then stands still, and a front left past the flag would catch him within it)
    for (let k = 0; k < 60; k++) r.frame();
    assert.equal(e.lives, lives0 - 1, 'one life lost');
    assert.equal(e.statHeartsLost - hearts0, 0, `no heart lost on top of the life (lost ${e.statHeartsLost - hearts0})`);
    assert.equal(respawns, 1, 'one respawn');
    assert.equal(r.p.hp, r.p.maxHp, 'back with every heart');
    // (the collapse waits behind the flag: the branch whole from it, the stretch's front not past it)
    assert.ok(r.platforms.filter((q) => q.chase && q.x >= flag.x).every((q) => !q.broken), 'the branch is whole from his flag');
    assert.ok(!run.fronts[i].active || run.fronts[i].front < flag.x, `the front waits behind his flag (at ${Math.round(run.fronts[i].front)}, the flag at ${flag.x})`);
  });
}
