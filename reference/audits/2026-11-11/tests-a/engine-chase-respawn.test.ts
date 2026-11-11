/**
 * AUDIT A-07 (2026-11-11): 1-8's collapsing branch is put right after a fall only by chaseCaught() (engine.ts: the sections made
 * whole again and the collapse set back behind the flag with its 1.6 s hold). A life lost any other way during the chase (one of the
 * five snakes on the branch takes his last heart) goes through loseLife -> respawnAtCheckpoint, which knows nothing about the chase:
 * he is set down at his flag with the collapse still where it was, usually PAST the flag. The very next frame the chase "catches"
 * him, takes a heart and respawns him a second time.
 *
 * Proves: one death to an animal in the chase costs a life AND a heart, with two respawns back to back.
 * Fixed looks like: respawnAtCheckpoint (the one way back to a flag) restarts the stage's own run state (the chase, as it already
 * does the tide and the lantern), so every death in the chase is one respawn at full hearts with the collapse held behind the flag.
 *
 * Run: npx tsx --test reference/audits/2026-11-11/tests-a/engine-chase-respawn.test.ts
 */
import { makeEngine, standOn, step } from './_harness.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('A-07 a life lost to an animal during the 1-8 chase is one respawn, at full hearts, with the collapse behind the flag', () => {
  const { e } = makeEngine('1-8');
  const plan = e.proto.chase;
  const flag = e.currentStage.checkpoints.filter((c: any) => c.x > plan.start && c.x < plan.end)[1];
  // he reached this flag and ran on 600 px; the collapse is 200 px behind him, so it has passed the flag
  e.checkpoint = { x: flag.x, y: flag.y };
  const branch = e.platforms.filter((p: any) => p.chase).sort((a: any, b: any) => a.x - b.x);
  const under = branch.find((p: any) => p.x <= flag.x + 600 && p.x + p.width >= flag.x + 600) ?? branch.find((p: any) => p.x > flag.x + 500)!;
  standOn(e, under, Math.max(under.x + 10, Math.min(under.x + under.width - 10, flag.x + 600)));
  Object.assign(e.chase, { active: true, front: e.player.x - 200, hold: 0 });
  step(e, 2);
  const lives = e.lives;
  let respawns = 0;
  const respawn = e.respawnAtCheckpoint.bind(e);
  e.respawnAtCheckpoint = (...a: unknown[]) => {
    respawns++;
    return respawn(...a);
  };
  // a snake takes his last heart
  e.player.invincibleTimer = 0;
  e.stompGrace = 0;
  e.damagePlayer(e.player.hp, e.player.x + 30);
  step(e, 90);
  assert.equal(e.lives, lives - 1, 'one life lost');
  assert.ok(
    respawns === 1 && e.player.hp === e.player.maxHp,
    `one death to a snake in the chase: ${respawns} respawns, and he stands at the flag with ${e.player.hp} of ${e.player.maxHp} hearts`,
  );
});
