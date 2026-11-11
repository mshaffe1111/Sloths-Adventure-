/**
 * Audit C (things): Matt's rule (2026-11-02, CLAUDE.md "Stage rules", STAGE-RULES §1): a crumbling platform may be required anywhere, and
 * "a required one is whole again when he respawns". respawnAtCheckpoint makes every crumbled platform whole (engine.ts: "planks that
 * crumbled since the checkpoint come back, or a respawn could leave a gap nobody can cross"). The soft fall (Easy on every old-generator
 * stage, both modes on a softFalls stage like 1-1, World 8's heart falls, 8-4's jar) is the other way he is set back, and it leaves
 * the platform broken: it then grows back only after 30-35 s and only while it is off screen (regrow.ts), and he is standing beside it.
 *
 * Correct: after any set-back, the crumbling platform he broke on the way is whole again.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import type { Platform } from '../../../../src/game/types.ts';

const solid = (id: number, x: number, w: number): Platform => ({ id, x, y: 500, width: w, height: 40, type: 'solid' }) as Platform;

function world() {
  const r = new RealPlay('1-2', 1);
  const ledge = solid(1, 0, 400);
  const far = solid(3, 600, 400);
  const plank = { id: 2, x: 410, y: 500, width: 180, height: 30, type: 'fragile' } as Platform;
  r.bare([ledge, plank, far]);
  // a short drop under the pieces: the pit's floor is the stage's bottom edge
  r.stage.config = { ...r.stage.config, levelHeight: 700 };
  r.safe = false;
  return { r, ledge, plank };
}

/** stand on the ledge, walk onto the plank, stand there until it crumbles and he falls out of the stage */
function breakAndFall(r: RealPlay, plank: Platform) {
  r.stand(300, 500);
  r.frame();
  for (let i = 0; i < 90 && r.p.x < plank.x + 60; i++) r.frame({ right: true });
  for (let i = 0; i < 150 && !plank.broken; i++) r.frame();
  assert.equal(plank.broken, true, 'the plank crumbled under him');
}

test('a soft fall makes the crumbling platform he broke whole again, as a respawn does', () => {
  const { r, plank } = world();
  r.e.softOn = true; // (what Easy sets on every old-generator stage, and a softFalls stage on both modes: engine.ts softOn)
  let lives = 0;
  r.e.loseLife = () => { lives++; };
  let setBacks = 0;
  const softFall = r.e.softFall.bind(r.e);
  r.e.softFall = () => {
    const done = softFall();
    if (done) setBacks++;
    return done;
  };
  breakAndFall(r, plank);
  for (let i = 0; i < 300 && !setBacks; i++) r.frame();
  for (let i = 0; i < 60 && !r.p.grounded; i++) r.frame();
  assert.equal(setBacks, 1, 'he fell out of the stage and was set back');
  assert.equal(lives, 0, 'it was a soft fall: no life lost');
  assert.ok(r.p.grounded && r.p.x < plank.x, `he is back on the ledge before the plank (x ${Math.round(r.p.x)})`);
  assert.equal(plank.broken, false, 'the plank is whole again after the set-back');
});

test('(the contrast) a life lost and a respawn at the flag does make it whole', () => {
  const { r, plank } = world();
  delete r.e.loseLife;
  r.e.checkpoint = { x: 300, y: 500 };
  breakAndFall(r, plank);
  for (let i = 0; i < 300 && (plank.broken || r.e.down); i++) r.frame();
  assert.equal(plank.broken, false);
});
