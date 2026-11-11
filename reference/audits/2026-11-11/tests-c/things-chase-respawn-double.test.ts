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
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';

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
