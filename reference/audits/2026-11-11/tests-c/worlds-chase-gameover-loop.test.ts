/**
 * Audit C (worlds): the engine keeps stepping under the Game Over card (App.tsx never pauses it there: Continue needs it alive), and
 * every death path but one checks `isGameOver` first. 1-8's chaseCaught does not, and loseLife itself only checks `down`. Out of lives
 * on the long branch, the collapse catches the body again and again: lives go negative and onDefeat fires each time (App counts a fail,
 * the defeat sting plays).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';

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
