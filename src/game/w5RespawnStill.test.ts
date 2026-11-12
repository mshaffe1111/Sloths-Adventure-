/**
 * Audit C (worlds): World 5's "don't sit" state is never reset at a flag. w5Play.ts has the reset (`calm()`: "everything about him back
 * to fresh (a respawn, ...)") and its `moved` flag is documented "since the stage started (or since a respawn)", but the engine's
 * respawnAtCheckpoint never calls it (only the test harness does, realPlay.ts settle). So at the stage start a player reading Dot's
 * line is never wrapped, and at a flag after a lost life the same player is wrapped (a heart) every ~6 s without touching the screen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, DT } from './realPlay.ts';

test('5-2: back at a flag after a lost life, standing untouched costs no heart (as at the stage start)', () => {
  const rp = new RealPlay('5-2', 1);
  const e = rp.e;
  delete e.loseLife;
  rp.safe = false;
  // the stage start: 25 s untouched, nothing happens
  for (let i = 0; i < 30 * 25; i++) rp.frame();
  assert.equal(e.player.hp, e.player.maxHp, 'the start never wraps him');
  // he reaches the first flag, walks on, and stops on his last heart: wrapped, a life
  const cp = [...e.currentStage.checkpoints].sort((a: { x: number }, b: { x: number }) => a.x - b.x)[0];
  rp.stand(cp.x, cp.y);
  rp.safe = false;
  for (let i = 0; i < 6; i++) rp.frame();
  assert.equal(e.checkpoint.x, cp.x);
  for (let i = 0; i < 20; i++) rp.frame({ right: true });
  e.player.hp = 1;
  const lives = e.lives;
  for (let t = 0; e.lives === lives && t < 60; t += DT) {
    e.player.invincibleTimer = 0;
    rp.frame();
  }
  assert.equal(e.lives, lives - 1, 'the silk took his last heart');
  for (let i = 0; i < 40; i++) rp.frame(); // the beat and the respawn
  assert.equal(Math.round(e.player.x), cp.x, 'back at the flag');
  assert.equal(e.player.hp, e.player.maxHp);
  // 25 s at the flag, never touching the screen (reading, or the phone put down)
  for (let i = 0; i < 30 * 25; i++) rp.frame();
  assert.equal(e.player.hp, e.player.maxHp, 'no heart lost at the flag before he has moved');
});
