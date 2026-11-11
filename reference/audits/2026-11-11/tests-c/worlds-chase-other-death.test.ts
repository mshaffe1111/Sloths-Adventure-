/**
 * Audit C (worlds): 1-8's collapse is only started again by its own catch (engine.ts chaseCaught -> chase.ts restartAt). Every other way
 * back to a flag (a snake taking the last heart: there are five snakes on the branch; Continue after a Game Over) goes through
 * respawnAtCheckpoint, which restarts the tide (6-8) and the jar (8-4) but not the chase. The front stays where it was, ahead of the flag
 * he comes back to, so the frame after the respawn he is "caught" and pays a heart on top of the life, with a second respawn.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';

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
