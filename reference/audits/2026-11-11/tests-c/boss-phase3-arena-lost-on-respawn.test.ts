/**
 * Audit C (boss slice): a guardian's third-phase arena change (the flood, the storm, the lava, the burning palisade) is a pair of
 * permanent 'strip' hazards pushed once by BossDef.onPhase. Losing a life must not take the phase's arena back to phase 1: the boss
 * stays in phase 3 (its hp is kept), the lair still paints the flood, and onPhase never fires again.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BossPlay } from '../../../../src/game/bossPlay.ts';

const strips = (f: BossPlay) => (f.e.hazards as Array<{ kind: string }>).filter((h) => h.kind === 'strip').length;

for (const id of ['2-10', '4-10', '9-10', '10-10']) {
  test(`${id}: the phase-3 arena hazard is still there after a lost life`, () => {
    const f = new BossPlay(id);
    f.skipEntrance();
    // into phase 3 (hp at 35% or under), as the game does it: the next boss tick sees the hp and changes phase
    f.boss.hp = Math.floor(f.boss.maxHp * 0.3);
    for (let i = 0; i < 90 && f.boss.phase < 3; i++) {
      f.p.invincibleTimer = 1;
      f.frame();
    }
    assert.equal(f.boss.phase, 3, 'the boss reached phase 3');
    assert.equal(strips(f), 2, 'phase 3 laid its two strips (one from each fence)');

    // one life lost (not the last), then the engine's own beat and respawn
    const lives = f.e.lives;
    f.p.invincibleTimer = 0;
    f.e.loseLife('hurt');
    for (let i = 0; i < 150 && (f.e.down || f.e.lives === lives); i++) f.frame();
    assert.equal(f.e.lives, lives - 1, 'one life was lost');
    assert.equal(f.e.down, null, 'the respawn happened');
    assert.equal(f.boss.phase, 3, 'the boss is still in phase 3');

    // (three more seconds of the fight: nothing lays them again either)
    for (let i = 0; i < 90; i++) {
      f.p.invincibleTimer = 1;
      f.frame();
    }
    assert.equal(f.boss.phase, 3);
    assert.equal(strips(f), 2, 'the phase-3 arena hazard survives the respawn');
  });
}
