/**
 * AUDIT 2026-11-11, slice input-lifecycle. PROOF TEST: fails today.
 *
 * What it proves: a press made while the engine is not reading the controls is kept, whole, and played late.
 * InputEngine latches a press (jumpPressed + jumpBufferTimer, punchPressed + punchBufferTimer ...) and only InputEngine.update(dt)
 * runs the latch down. engine.update() returns BEFORE it calls input.update() during the life-lost beat (`if (this.down) { stepDown;
 * return }`, 0.75 s), and nothing clears the latch at the respawn. So a flick up (or a tap) made while Pokey is going down fires as he
 * comes back at the flag: he spends his second jump in mid-air at the checkpoint (or throws a punch), up to 0.75 s after the finger did it.
 * The same latch is kept through a stage entrance (stepEntrance), 1-1's help offer (helpAsking) and any pause (isPaused).
 *
 * Fixed looks like: a press made while the world is held (the life-lost beat, the pause) is gone by the time play is handed back,
 * or the respawn clears the press latches the way it already zeroes steering (inputGrace).
 *
 * Run: npx tsx --test reference/audits/2026-11-11/tests-a/input-ghost-press.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { headlessCanvas } from '../../../../src/game/headlessDom.ts';

const { GameEngine } = await import('../../../../src/game/engine.ts');
const { InputEngine } = await import('../../../../src/game/inputEngine.ts');
const { levelConfig } = await import('../../../../src/game/realPlay.ts');

const DT = 1 / 30;
const noop = () => {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

function stage() {
  const input = new InputEngine();
  const e = new GameEngine(headlessCanvas(), levelConfig('1-2'), input as never, {
    onProgressUpdate: noop, onVictory: noop, onDefeat: noop, onGameOver: noop,
  } as never) as Any;
  // let the entrance and the intro finish, standing where the stage puts him
  for (let i = 0; i < 150; i++) e.update(DT);
  return { e, input };
}

test('control: with no press during the beat, he comes back at the flag with both jumps and throws nothing', () => {
  const { e } = stage();
  e.loseLife('pit');
  let frames = 0;
  while (e.down && frames++ < 60) e.update(DT);
  assert.equal(e.down, null, 'the beat ended');
  let jumped = false;
  for (let i = 0; i < 12; i++) {
    e.update(DT);
    if (e.player.isDoubleJumping || e.player.jumpsLeft < 2 && !e.player.grounded && e.player.vy < -100) jumped = true;
  }
  assert.equal(jumped, false);
});

test('a flick up made while he is going down (the 0.75 s life-lost beat) must not jump him at the flag', () => {
  const { e, input } = stage();
  e.loseLife('pit');
  for (let i = 0; i < 4; i++) e.update(DT);
  assert.ok(e.down, 'still in the beat');
  // the panic flick: pressed and lifted at once, as TouchController's sink does (jumpPress then jumpRelease)
  input.triggerTouchUp();
  input.releaseTouchUp();
  let frames = 0;
  while (e.down && frames++ < 60) e.update(DT);
  assert.equal(e.down, null, 'the beat ended');
  const held = frames * DT;
  let ghost = '';
  for (let i = 0; i < 12 && !ghost; i++) {
    e.update(DT);
    const p = e.player;
    if (p.isDoubleJumping) ghost = `a double jump ${i + 1} frame(s) after the respawn (jumpsLeft ${p.jumpsLeft}, vy ${Math.round(p.vy)})`;
    else if (p.vy < -100) ghost = `a jump ${i + 1} frame(s) after the respawn (vy ${Math.round(p.vy)})`;
  }
  assert.equal(ghost, '', `the press was ${held.toFixed(2)} s old when play came back, and it still fired: ${ghost}`);
});

test('a tap (punch) made during the beat must not swing at the flag', () => {
  const { e, input } = stage();
  e.loseLife('pit');
  for (let i = 0; i < 4; i++) e.update(DT);
  input.triggerTouchPunch();
  let frames = 0;
  while (e.down && frames++ < 60) e.update(DT);
  let swung = false;
  for (let i = 0; i < 12; i++) {
    e.update(DT);
    if (e.player.punching || e.atk) swung = true;
  }
  assert.equal(swung, false, 'a punch thrown at nothing as he respawned, from a tap made while he was down');
});
