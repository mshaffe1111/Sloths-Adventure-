import test from 'node:test';
import assert from 'node:assert/strict';
import { ASSIST, JUMP_RISE, PHYS, easeAssist } from './physics.ts';
import { MIN_TOUCH_JUMP_HOLD_MS } from './inputEngine.ts';

/** rise of a jump whose press is let go after `hold` seconds (the engine cuts the climb to cutV when the press ends) */
function rise(hold: number): number {
  let vy = -PHYS.jumpV;
  let y = 0;
  let t = 0;
  let top = 0;
  const dt = 1 / 60;
  while (t < 2) {
    if (t >= hold && vy < -PHYS.cutV) vy = -PHYS.cutV;
    vy += (vy < 0 ? PHYS.gravUp : PHYS.gravDown) * dt;
    y += vy * dt;
    t += dt;
    top = Math.min(top, y);
    if (y > 0 && vy > 0) break;
  }
  return -top;
}

test('a flick on a touch screen gives a full jump, the one the level builder plans for', () => {
  assert.ok(rise(MIN_TOUCH_JUMP_HOLD_MS / 1000) >= JUMP_RISE * 0.95, 'a quick flick reaches (nearly) the full height');
  assert.ok(rise(0.13) < JUMP_RISE * 0.8, 'the old 130 ms press was a three-quarter jump');
});

test('the early-stage help is full on stage 1-1, gone by stage 25, and eases in between', () => {
  assert.equal(easeAssist(1), 1);
  assert.equal(easeAssist(25), 0);
  assert.equal(easeAssist(100), 0);
  let last = 2;
  for (let m = 1; m <= 30; m++) {
    const a = easeAssist(m);
    assert.ok(a <= last && a >= 0 && a <= 1, 'never rises as the game goes on');
    last = a;
  }
  assert.ok(easeAssist(13) > 0.3 && easeAssist(13) < 0.7);
  assert.ok(ASSIST.gaps > 0 && ASSIST.gaps < 0.5, 'gaps get shorter, but never absurdly so');
});
