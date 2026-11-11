/**
 * Audit C (boss slice): a press is buffered for a fraction of a second (inputEngine.ts: the jump buffer pressKeep(), the punch 0.12 s),
 * and the buffer only runs down inside InputEngine.update(dt). The engine does not call input.update while a guardian makes its
 * entrance (engine.ts update(): `if (this.stepEntrance(dt)) return;` sits above `this.input.update(dt)`), and nothing clears the pad
 * when the entrance ends. So a tap made seconds earlier, during the five-second entrance (a player trying to skip it), is still
 * "pressed" on the first frame of the fight and Pokey hops or jabs on his own.
 *
 * The harness's FakeInput keeps the real InputEngine's buffer rule (bossPlay.ts), so the same thing shows here.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BossPlay } from '../../../../src/game/bossPlay.ts';

/** play the entrance (one tap a second in, or none), then the first half second of the fight with the thumbs off: what did he do? */
function afterEntrance(id: string, tap: 'press' | 'punch' | null) {
  const f = new BossPlay(id);
  let n = 0;
  while (f.e.entrance || !f.e.entranceDone) {
    f.frame(tap && n === 30 ? { [tap]: true } : {});
    n++;
    if (n > 600) throw new Error('the entrance never ended');
  }
  let jumped = false;
  let swung = false;
  for (let i = 0; i < 15; i++) {
    f.frame();
    if (!f.p.grounded && f.p.vy < -50) jumped = true;
    if (f.e.atk) swung = true;
  }
  return { jumped, swung, entrance: n / 30 };
}

// (the tap cases first, each on its own boss: the long entrance plays once a session per stage, bossEntrance.ts takeEntranceLength)
test('a jump tap during the entrance is not played seconds later, when the fight starts', () => {
  const r = afterEntrance('2-10', 'press');
  assert.ok(r.entrance > 4, `the long entrance ran (${r.entrance.toFixed(1)} s)`);
  assert.equal(r.jumped, false, `he jumped on his own ${(r.entrance - 1).toFixed(1)} s after the tap`);
});

test('a punch tap during the entrance is not thrown seconds later, when the fight starts', () => {
  const r = afterEntrance('3-10', 'punch');
  assert.ok(r.entrance > 4, `the long entrance ran (${r.entrance.toFixed(1)} s)`);
  assert.equal(r.swung, false, `he threw a punch on his own ${(r.entrance - 1).toFixed(1)} s after the tap`);
});

// the same hold, the same leak: the life-lost beat (engine.ts update(): `if (this.down) { this.stepDown(dt); return; }`) also sits above
// input.update, so a tap made as he goes down is played when he stands up at the flag
test('a punch tap during the life-lost beat is not thrown when he respawns', () => {
  const f = new BossPlay('4-10');
  f.skipEntrance();
  for (let i = 0; i < 20; i++) f.frame();
  f.p.invincibleTimer = 0;
  f.e.loseLife('hurt');
  let n = 0;
  while (f.e.down) {
    f.frame(n === 3 ? { punch: true } : {});
    n++;
  }
  let swung = false;
  for (let i = 0; i < 20; i++) {
    f.frame();
    if (f.e.atk) swung = true;
  }
  assert.equal(swung, false, `he threw a punch on his own at the flag, ${((n - 3) / 30).toFixed(2)} s after the tap (the buffer is 0.12 s)`);
});

test('the control: with no tap he stands still when the fight starts', () => {
  const r = afterEntrance('2-10', null);
  assert.deepEqual({ jumped: r.jumped, swung: r.swung }, { jumped: false, swung: false });
});
