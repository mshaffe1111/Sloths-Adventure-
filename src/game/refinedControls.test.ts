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

test('refined controls: the game\'s controls (on unless ?refined=0)', () => {
  assert.equal(refinedControls(), true);
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

test('refined controls: holding a direction on a vine pumps a natural swing instead of pinning him near the top', async () => {
  const { steerPump, STEER_SWING } = await import('./refinedControls.ts');
  const v = { x: 0, topY: 0, bottomY: 420 };
  const old = { angle: 0, omega: 0, len: 380 };
  const neu = { angle: 0, omega: 0, len: 380 };
  let oldMax = 0, newMax = 0, newMin = 0;
  for (let f = 0; f < 30 * 8; f++) {
    swingStep(old, v, 1 / 30, 1, 0);
    swingStep(neu, v, 1 / 30, steerPump(neu.angle, neu.omega, neu.len, SWING.g, 1), 0);
    if (f > 30 * 4) { oldMax = Math.max(oldMax, old.angle); newMax = Math.max(newMax, neu.angle); newMin = Math.min(newMin, neu.angle); }
  }
  // the old rule ends up pinned high on the held side; the new one keeps swinging both ways at about STEER_SWING
  assert.ok(oldMax > 1.1, `old rule pins him near the top: ${oldMax.toFixed(2)} rad`);
  assert.ok(newMax < STEER_SWING * 1.15 && newMin < -STEER_SWING * 0.6, `a real swing: ${newMin.toFixed(2)} to ${newMax.toFixed(2)} rad`);
});

test('refined controls: on a vine, sliding straight up climbs (no jump), and only a diagonal slide jumps off', () => {
  const out: string[] = [];
  const g = new TouchGestures({
    move: (d) => out.push(`move:${d}`), duck: (on) => out.push(`duck:${on}`), jumpPress: () => out.push('jump'), jumpRelease: () => {},
    punch: () => out.push('punch'), kick: () => out.push('kick'), mega: () => {}, feedback: () => {}, climb: (d) => out.push(`climb:${d}`),
  }, () => 400, { assist: () => true, air: () => false, refined: () => true, kickNear: () => false, onVine: () => true });
  // an index finger on top of the character, sliding straight up quickly
  g.down(1, 220, 500, 0);
  for (let k = 1; k <= 6; k++) g.move(1, 221, 500 - k * 15, k * 16);
  assert.ok(out.includes('climb:-1') && !out.includes('jump'), out.join(' '));
  // straight down: climb down, never a duck
  for (let k = 1; k <= 8; k++) g.move(1, 221, 410 + k * 15, 100 + k * 16);
  assert.ok(out.includes('climb:1') && !out.some((o) => o.startsWith('duck:true')), out.join(' '));
  const before = out.length;
  g.up(1, 221, 530, 300);
  assert.ok(out.slice(before).includes('climb:0'), 'lifting the finger stops the climb: ' + out.slice(before).join(' '));
  // a diagonal flick up jumps off
  out.length = 0;
  g.down(2, 200, 500, 1000);
  for (let k = 1; k <= 5; k++) g.move(2, 200 + k * 14, 500 - k * 14, 1000 + k * 16);
  assert.ok(out.includes('jump'), out.join(' '));
});
