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

test('timed swing: whatever is held, the vine settles to the same height and rhythm', async () => {
  const { TIMED, setTimedSwing } = await import('./physics.ts');
  setTimedSwing(false);
  const v = { x: 0, topY: 0, bottomY: 420 };
  for (const hold of [1, -1] as const) {
    const s = { angle: 0, omega: 0, len: 380 };
    let maxA = 0, minA = 0, flips = 0, prev = 0;
    for (let f = 0; f < 60 * 10; f++) {
      swingStep(s, v, 1 / 60, hold, 0);
      if (f > 60 * 5) {
        maxA = Math.max(maxA, s.angle); minA = Math.min(minA, s.angle);
        if (prev && Math.sign(s.omega) !== prev) flips++;
      }
      prev = Math.sign(s.omega);
    }
    assert.ok(Math.abs(maxA - TIMED.amp) < 0.06 && Math.abs(-minA - TIMED.amp) < 0.06, `swings both ways to ${TIMED.amp}: ${minA.toFixed(2)}..${maxA.toFixed(2)}`);
    const period = (2 * 5) / flips; // 5 s watched, two turns per swing
    assert.ok(Math.abs(period - TIMED.period) < 0.15, `period ${period.toFixed(2)} s, wanted ${TIMED.period}`);
  }
});

test('timed swing: letting go in the sweet spot leaps; anywhere else he only flies off the vine', async () => {
  const { setTimedSwing, inSweetSpot, timedLaunch } = await import('./physics.ts');
  setTimedSwing(false);
  const v = { x: 0, topY: 0, bottomY: 420 };
  const s = { angle: 0, omega: 0, len: 380 };
  let sweet = 0, sour = 0;
  for (let f = 0; f < 60 * 10; f++) {
    swingStep(s, v, 1 / 60, 1, 0);
    if (f < 60 * 5) continue;
    const l = timedLaunch(s, 1);
    if (inSweetSpot(s, 1)) {
      assert.ok(l.sweet && l.vx >= SWING.leapMin * 0.95, `a leap: ${l.vx.toFixed(0)}`);
      sweet++;
    } else {
      // off the vine the way it was carrying him: never flung up the screen
      assert.ok(!l.sweet && l.vy >= -380 && Math.abs(l.vx) < SWING.leapMin, `no fling: ${l.vx.toFixed(0)}, ${l.vy.toFixed(0)}`);
      sour++;
    }
  }
  // the sweet spot is a real window, but not most of the swing
  assert.ok(sweet > 0 && sour > sweet, `sweet ${sweet} frames, the rest ${sour}`);
});

test('timed swing: Easy slows the swing and widens the sweet spot', async () => {
  const { TIMED, setTimedSwing } = await import('./physics.ts');
  setTimedSwing(false);
  const normal = { ...TIMED };
  setTimedSwing(true);
  assert.ok(TIMED.period > normal.period && TIMED.sweetTo - TIMED.sweetFrom > normal.sweetTo - normal.sweetFrom && TIMED.grabX > normal.grabX);
  setTimedSwing(false);
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

/** a pad on the ground; `near` says whether something is close enough to kick */
function tapPad(near: boolean, refined = true) {
  const out: string[] = [];
  const g = new TouchGestures({
    move: (d) => out.push(`move:${d}`), duck: () => {}, jumpPress: () => out.push('jump'), jumpRelease: () => out.push('jumpUp'),
    punch: () => out.push('punch'), kick: () => out.push('kick'), mega: () => out.push('mega'), feedback: () => {},
  }, () => 400, { assist: () => true, air: () => false, refined: () => refined, kickNear: () => near });
  return { g, out };
}
const tap = (g: TouchGestures, x: number, at = 0) => {
  g.down(1, x, 600, at);
  g.up(1, x, 600, at + 90);
};

test('a tap is always a punch, never a jump: on either half, with something in reach or nothing, refined rules or not', () => {
  for (const x of [80, 300]) {
    for (const near of [true, false]) {
      for (const refined of [true, false]) {
        const { g, out } = tapPad(near, refined);
        tap(g, x);
        assert.ok(out.includes('punch') && !out.includes('jump'), `x ${x} near ${near} refined ${refined}: ${out.join(' ')}`);
      }
    }
  }
});
