/**
 * The chase (1-8's collapsing branch; the same collapse is reused in 7-6) and the ways back to a flag, played in the real engine
 * (realPlay.ts). Audit C's three tests (worlds-chase-gameover-loop, worlds-chase-other-death, things-chase-respawn-double), moved into
 * the suite by EN-F with audit A-07 (chaseRespawn.test.ts). Each file's own note follows.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';

/**
 * Audit C (worlds): the engine keeps stepping under the Game Over card (App.tsx never pauses it there: Continue needs it alive), and
 * every death path but one checks `isGameOver` first. 1-8's chaseCaught does not, and loseLife itself only checks `down`. Out of lives
 * on the long branch, the collapse catches the body again and again: lives go negative and onDefeat fires each time (App counts a fail,
 * the defeat sting plays).
 */
for (const how of ['caught by the front', 'fell off the branch'] as const) {
  test(`1-8: out of lives (${how}), the Game Over card up for 12 s: one defeat, lives never below 0`, () => {
    const rp = new RealPlay('1-8', 1);
    const e = rp.e;
    delete e.loseLife;
    rp.safe = false;
    let defeats = 0;
    const seen: number[] = [];
    e.callbacks.onDefeat = () => defeats++;
    e.callbacks.onLivesChange = (l: number) => seen.push(l);
    const plan = e.proto.chase as { start: number };
    const cps = [...e.currentStage.checkpoints].sort((a: { x: number }, b: { x: number }) => a.x - b.x);
    const cp = cps.find((c: { x: number }) => c.x > plan.start + 3000);
    rp.stand(cp.x, cp.y);
    for (let i = 0; i < 10; i++) rp.frame();
    const x = cp.x + 1500;
    const pl = e.platforms.filter((q: { chase?: boolean; x: number; width: number }) => q.chase && x >= q.x && x <= q.x + q.width).sort((a: { y: number }, b: { y: number }) => a.y - b.y)[0];
    if (how === 'caught by the front') rp.stand(x, pl.y);
    else rp.fly(x, pl.y + 320, 0, 200, 0); // past the branch's 300 px fall line
    rp.safe = false;
    e.player.invincibleTimer = 0;
    Object.assign(e.chase, { active: true, front: how === 'caught by the front' ? x - 10 : x - 400, hold: 0 });
    e.lives = 1;
    e.player.hp = 1;
    for (let i = 0; i < 30 * 12; i++) rp.frame();
    assert.ok(e.isGameOver, 'the run is over');
    assert.ok(Math.min(...seen) >= 0, `lives shown: ${seen.join(', ')}`);
    assert.equal(defeats, 1, 'onDefeat once');
    assert.equal(e.statLivesLost, 1, 'one life lost in the stats');
  });
}

/**
 * Audit C (worlds): 1-8's collapse is only started again by its own catch (engine.ts chaseCaught -> chase.ts restartAt). Every other way
 * back to a flag (a snake taking the last heart: there are five snakes on the branch; Continue after a Game Over) goes through
 * respawnAtCheckpoint, which restarts the tide (6-8) and the jar (8-4) but not the chase. The front stays where it was, ahead of the flag
 * he comes back to, so the frame after the respawn he is "caught" and pays a heart on top of the life, with a second respawn.
 */
test('1-8: a life lost to a snake mid-chase brings him back with every heart, the collapse waiting behind the flag', () => {
  const rp = new RealPlay('1-8', 1);
  const e = rp.e;
  delete e.loseLife; // the engine's own (the harness swaps it for a note)
  const plan = e.proto.chase as { start: number; end: number };
  const cps = [...e.currentStage.checkpoints].sort((a: { x: number }, b: { x: number }) => a.x - b.x);
  const cp = cps.find((c: { x: number }) => c.x > plan.start + 3000);
  // he touches a flag well into the chase
  rp.stand(cp.x, cp.y);
  for (let i = 0; i < 10; i++) rp.frame();
  assert.equal(e.checkpoint.x, cp.x, 'the flag is his');
  // 1500 px on along the branch, the collapse 400 px behind him (where a steady run keeps it: CHASE.behind 520, base 230 vs his 285)
  const x = cp.x + 1500;
  const pl = e.platforms.filter((q: { chase?: boolean; x: number; width: number }) => q.chase && x >= q.x && x <= q.x + q.width).sort((a: { y: number }, b: { y: number }) => a.y - b.y)[0];
  rp.stand(x, pl.y);
  Object.assign(e.chase, { active: true, front: x - 400, hold: 0 });
  rp.frame();
  const lives = e.lives;
  // a snake's bite on his last heart (engine.ts damagePlayer -> loseLife('hurt'))
  e.player.hp = 0;
  e.loseLife('hurt');
  for (let i = 0; i < 60; i++) rp.frame(); // the 0.75 s beat, the respawn, a second on
  assert.equal(e.lives, lives - 1, 'one life');
  assert.equal(Math.round(e.player.x), cp.x, 'back at his flag');
  assert.equal(e.statHeartsLost, 0, 'no heart taken by the collapse he was put back behind');
  assert.equal(e.player.hp, e.player.maxHp, 'every heart back, as after any life lost');
});

/**
 * Audit C (things): 1-8's long branch (the collapse chasing him) has two set-back paths that do not know about each other. Caught by the
 * collapse, or off the branch: chaseCaught() puts the branch back from his flag and restarts the collapse behind it (engine.ts). A life
 * lost any other way there (one of the branch's five snakes takes his last heart): loseLife -> respawnAtCheckpoint, which knows nothing
 * of the chase. The collapse is normally past his flag by then (it trails him by about 520 px, the flags are about 2,700 px apart), so
 * he is stood at a flag that has already fallen with the front ahead of him: the next frame he is "caught", loses a heart on top of the
 * life, and is respawned a second time.
 *
 * Correct: a life lost to a snake on the branch costs the life; he comes back at his flag with every heart, the branch whole from there.
 */

test('1-8: a life lost to a hit while the collapse is past his flag costs the life, and no heart on top', () => {
  const r = new RealPlay('1-8', 1);
  const e = r.e;
  delete e.loseLife; // (the real life-lost path: the harness swaps it for a note)
  e.isRunning = true;
  r.safe = false;
  const plan = e.proto.chase as { start: number; end: number };
  const flag = (r.stage.checkpoints ?? []).find((c) => c.x >= plan.start + 600 && c.x < plan.end - 3000)!;
  assert.ok(flag, 'a flag on the long branch');
  // he reaches the flag (the chase is on by now)
  r.stand(flag.x, flag.y);
  r.frame();
  assert.ok(Math.abs(e.checkpoint.x - flag.x) < 1 && e.chase.active, 'his flag is this one, and the collapse is coming');
  // he has run on 650 px past it, the collapse 150 px past it behind him (it trails him by about 520 px: chase.ts CHASE.behind)
  e.chase.front = flag.x + 150;
  const x = flag.x + 650;
  const under = r.platforms.find((p) => p.chase && x >= p.x + 10 && x <= p.x + p.width - 10)!;
  assert.ok(under, 'branch under him');
  r.stand(x, under.y);
  r.frame();
  r.frame();
  assert.equal(e.down, null, 'he is running, not caught');
  r.p.hp = r.p.maxHp;
  const hearts0 = e.statHeartsLost;
  const lives0 = e.lives;

  // a snake takes a life (damagePlayer -> loseLife('hurt') on his last heart)
  let respawns = 0;
  const respawn = e.respawnAtCheckpoint.bind(e);
  e.respawnAtCheckpoint = (...a: unknown[]) => {
    respawns++;
    return respawn(...a);
  };
  e.loseLife('hurt');
  // (2 s: the life-lost beat and the respawn; he then stands still, and the restarted collapse would reach a standing sloth at about 3.9 s)
  for (let i = 0; i < 60; i++) r.frame();

  assert.equal(e.lives, lives0 - 1, 'one life lost');
  assert.equal(e.statHeartsLost - hearts0, 0, `no heart lost on top of the life (lost ${e.statHeartsLost - hearts0})`);
  assert.equal(respawns, 1, 'one respawn');
  assert.equal(r.p.hp, r.p.maxHp, 'back with every heart');
});
