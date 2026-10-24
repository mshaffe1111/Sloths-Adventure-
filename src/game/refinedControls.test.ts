import test from 'node:test';
import assert from 'node:assert/strict';
import { TouchGestures } from './touchGestures.ts';
import { SWING, swingStep } from './physics.ts';
import { autoPump, AUTO_SWING, refinedControls } from './refinedControls.ts';

function pad(near: boolean, refined = true) {
  const out: string[] = [];
  const g = new TouchGestures({
    move: (d) => out.push(`move:${d}`), duck: () => {}, jumpPress: () => out.push('jump'), jumpRelease: () => {},
    punch: () => out.push('punch'), kick: () => out.push('kick'), mega: () => out.push('mega'), feedback: () => {},
  }, () => 400, { assist: () => true, air: () => false, refined: () => refined, kickNear: () => near });
  return { g, out };
}
/** a quick sideways swipe that stays on the glass, on the right half (the run-meant-as-a-kick from the recordings) */
function swipe(g: TouchGestures, lift: boolean) {
  g.down(1, 260, 600, 0);
  for (let k = 1; k <= 4; k++) g.move(1, 260 + k * 16, 601, k * 16);
  if (lift) g.up(1, 324, 601, 70);
}

test('refined controls: off unless asked for', () => {
  assert.equal(refinedControls(), false);
});

test('refined controls: a quick sideways swipe with nothing near runs instead of kicking', () => {
  const { g, out } = pad(false);
  swipe(g, false);
  assert.ok(!out.includes('kick'), out.join(' '));
  assert.ok(out.includes('move:right'), out.join(' '));
});

test('refined controls: the same swipe beside an animal is still a kick', () => {
  const { g, out } = pad(true);
  swipe(g, true);
  assert.ok(out.includes('kick'), out.join(' '));
});

test('refined controls: a steering thumb lifted quickly with nothing near does not kick', () => {
  const { g, out } = pad(false);
  g.down(1, 80, 600, 0);
  for (let k = 1; k <= 6; k++) g.move(1, 80 + k * 14, 600, k * 20);
  g.up(1, 164, 600, 130);
  assert.ok(!out.includes('kick'), out.join(' '));
});

test('refined controls: the old rules still kick on that swipe (nothing changes with the switch off)', () => {
  const { g, out } = pad(false, false);
  swipe(g, true);
  assert.ok(out.includes('kick'), out.join(' '));
});

test('refined controls: a vine swings itself up to a good size from a dead hang, and then stops pushing', () => {
  const v = { x: 0, topY: 0, bottomY: 400 };
  const s = { angle: 0, omega: 0, len: 380 };
  let maxA = 0;
  for (let f = 0; f < 30 * 6; f++) {
    swingStep(s, v, 1 / 30, autoPump(s.angle, s.omega, s.len, SWING.g, 1), 0);
    if (f > 30 * 3) maxA = Math.max(maxA, Math.abs(s.angle));
  }
  assert.ok(maxA > AUTO_SWING * 0.8 && maxA < AUTO_SWING * 1.25, `swing settles near ${AUTO_SWING} rad, got ${maxA.toFixed(2)}`);
});
