import test from 'node:test';
import assert from 'node:assert/strict';
import { RIDE, carry, jumpOff, newPad, newRide, padNow, rideAt, sideToSide, standingOn, stepPad, stepRide, upDown, type Ride } from './ride.ts';
import { beatOf, checkClock, clockAt, stageClock } from './clock.ts';
import type { ClockDef } from './stageKit.types.ts';

const DT = 1 / 30;
/** a ride's beat: it waits 1 s, gives 0.5 s of warning, travels for 4 s, and waits 1.5 s at the far end; the next cycle brings it back */
const beat: ClockDef = { id: 'ride', phases: [{ name: 'off', seconds: 1 }, { name: 'warn', seconds: 0.5 }, { name: 'on', seconds: 4 }, { name: 'rest', seconds: 1.5 }], offset: 0, easyStretch: 1.25 };
const log: Ride = { clock: 'ride', w: 160, path: sideToSide(600, 700, 400) };
const lift: Ride = { clock: 'ride', w: 120, path: upDown(300, 500, 200), smooth: true };

test('a path from data, driven by the clock: it waits, warns, travels out, waits, and the next cycle travels back', () => {
  assert.deepEqual(checkClock(beat), []);
  assert.deepEqual(log.path, [{ x: 200, y: 700 }, { x: 1000, y: 700 }]);
  assert.deepEqual(lift.path, [{ x: 300, y: 700 }, { x: 300, y: 300 }], 'a lift starts at the bottom');
  const at = (r: Ride, t: number) => rideAt(r, clockAt(beat, t));
  assert.deepEqual(at(log, 0.5), { x: 200, y: 700 });
  assert.deepEqual(at(log, 1.25), { x: 200, y: 700 }, 'it does not move during its warning');
  assert.deepEqual(at(log, 3.5), { x: 600, y: 700 }, 'half way through the travel');
  assert.deepEqual(at(log, 6), { x: 1000, y: 700 });
  // the second cycle: waits at the far end, then comes back
  assert.deepEqual(at(log, 7.5), { x: 1000, y: 700 });
  assert.deepEqual(at(log, 7 + 3.5), { x: 600, y: 700 });
  assert.deepEqual(at(log, 7 + 6.5), { x: 200, y: 700 });
  // a lift eases away from each stop: a quarter of the time in, it has gone less than a quarter of the way
  assert.ok(700 - at(lift, 1.5 + 1).y < 100);
  assert.deepEqual(at(lift, 3.5), { x: 300, y: 500 });
  // point to point: three points, travelled by distance
  const tri: Ride = { clock: 'ride', w: 100, path: [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 100 }] };
  assert.deepEqual(at(tri, 1.5 + 3), { x: 300, y: 0 }, 'three quarters of the time: the corner, 300 of 400 px');
  assert.deepEqual(at(tri, 1.5 + 3.5), { x: 300, y: 50 });
});

test('Easy only slows a ride (the clock\'s stretch): the same stops, the same path', () => {
  const n = rideAt(log, clockAt(beat, 3.5, false));
  const e = rideAt(log, clockAt(beat, 3.5 * 1.25, true));
  assert.deepEqual(e, n);
  assert.equal(beatOf(beat, true).seconds[2], 5);
});

test('carrying the rider: he moves with it, feet on its top every frame, with no slip and no jitter at 30 fps', () => {
  for (const ride of [log, lift]) {
    const clock = stageClock([beat], false);
    const s = newRide(ride, clock.read('ride'));
    const p = { x: s.x + 40, y: s.y, vx: 0, vy: 0 };
    assert.equal(standingOn(s, ride, p), true);
    let worst = 0;
    let lastStep = 0;
    let moved = 0;
    for (let n = 0; n < 30 * 28; n++) {
      clock.step(DT);
      stepRide(s, ride, clock.read('ride'));
      assert.equal(standingOn(s, ride, p), true, `still on it before the carry (frame ${n})`);
      carry(p, s);
      assert.equal(p.y, s.y, 'feet exactly on its top');
      worst = Math.max(worst, Math.abs(p.x - s.x - 40));
      const step = Math.hypot(s.dx, s.dy);
      // no jitter: a frame's move never differs from the last frame's by more than the path's own gentlest change
      assert.ok(Math.abs(step - lastStep) <= (ride.smooth ? 0.75 : 800 / 4 * DT + 1e-9), `a jerk of ${Math.abs(step - lastStep)} px at frame ${n}`);
      lastStep = step;
      moved += step;
    }
    assert.ok(worst < 1e-9, `he slipped ${worst} px`);
    assert.ok(moved > 1500, 'two trips out and back');
  }
});

test('he is on it only with his feet on its top, inside its width, and not on the way up', () => {
  const s = newRide(log, clockAt(beat, 0));
  assert.equal(standingOn(s, log, { x: s.x + 80, y: s.y, vx: 0, vy: 0 }), true);
  assert.equal(standingOn(s, log, { x: s.x - 1, y: s.y, vx: 0, vy: 0 }), false, 'off its left end');
  assert.equal(standingOn(s, log, { x: s.x + 161, y: s.y, vx: 0, vy: 0 }), false);
  assert.equal(standingOn(s, log, { x: s.x + 80, y: s.y - 30, vx: 0, vy: 0 }), false, 'in the air above it');
  assert.equal(standingOn(s, log, { x: s.x + 80, y: s.y, vx: 0, vy: -200 }), false, 'jumping up off it');
});

test('a jump off it keeps the platform\'s speed (letting go onto a moving log), sideways only', () => {
  const clock = stageClock([beat], false);
  const s = newRide(log, clock.read('ride'));
  for (let n = 0; n < 30 * 3; n++) { clock.step(DT); stepRide(s, log, clock.read('ride')); }
  // mid-travel the log does 800 px in 4 s
  const p = { x: s.x + 40, y: s.y, vx: 60, vy: -520 };
  jumpOff(p, s, DT);
  assert.ok(Math.abs(p.vx - (60 + 200)) < 1e-6, `he leaves at ${p.vx} px/s`);
  assert.equal(p.vy, -520, 'a ride never adds to his jump');
  // from a lift going up, the same: his jump is his own
  const up = newRide(lift, clockAt(beat, 3.4));
  stepRide(up, lift, clockAt(beat, 3.4 + DT));
  const q = { x: up.x + 10, y: up.y, vx: 0, vy: -520 };
  jumpOff(q, up, DT);
  assert.deepEqual([q.vx, q.vy], [0, -520]);
  assert.deepEqual(RIDE.keep, { x: 1, y: 0 });
  // waiting at a stop, a jump off is a plain jump
  const still = newRide(log, clockAt(beat, 0.2));
  stepRide(still, log, clockAt(beat, 0.2 + DT));
  const r = { x: still.x, y: still.y, vx: 60, vy: -520 };
  jumpOff(r, still, DT);
  assert.equal(r.vx, 60);
});

test('a sinking pad (on beatBrick): it holds, warns, sinks while he stands past its time, and rises when he leaves', () => {
  const padClock: ClockDef = { id: 'pad', phases: [{ name: 'off', seconds: 1.2 }, { name: 'warn', seconds: 0.8 }, { name: 'on', seconds: 1 }], offset: 0, easyStretch: 1.5 };
  assert.deepEqual(checkClock(padClock), []);
  for (const easy of [false, true]) {
    const b = beatOf(padClock, easy);
    const k = easy ? 1.5 : 1;
    const pad = newPad();
    const stand = (seconds: number, on: boolean) => { for (let n = 0; n < Math.round(seconds / DT); n++) stepPad(pad, b, on, DT); return padNow(pad, b); };
    assert.deepEqual(padNow(pad, b), { solid: true, hurts: false, tell: 0 });
    assert.deepEqual(stand(1 * k, true), { solid: true, hurts: false, tell: 0 }, 'it holds');
    const w = stand(0.6 * k, true);
    assert.ok(w.solid && w.tell > 0.3 && w.tell < 0.7, `the warning is on (${w.tell})`);
    assert.equal(stand(0.6 * k, true).solid, false, 'past its time: it sinks');
    assert.equal(stand(30, true).solid, false, 'and stays down however long the count runs');
    // he is off it (it sank under him): it comes back up, and is whole again
    assert.equal(stand(RIDE.padRise * 1.2 * k + 0.2, false).solid, true, 'it rises when he leaves');
    assert.deepEqual(stand(5, false), { solid: true, hurts: false, tell: 0 });
    // stepping off during the warning saves it: the count runs back down
    stand(1.6 * k, true);
    assert.ok(padNow(pad, b).tell > 0);
    assert.deepEqual(stand(3 * k, false), { solid: true, hurts: false, tell: 0 });
  }
});

// ── the examples (test-side) ──
test('a drifting log carries him across the water: he steps on at one bank and steps off at the other', () => {
  const clock = stageClock([beat], false);
  const s = newRide(log, clock.read('ride'));
  const p = { x: 260, y: 700, vx: 0, vy: 0 };
  let warned = 0;
  let left = -1;
  for (let n = 0; n < 30 * 6.5; n++) {
    clock.step(DT);
    const read = clock.read('ride');
    stepRide(s, log, read);
    if (read.phase === 'warn') warned++;
    if (left < 0 && s.dx !== 0) { left = n; assert.ok(warned >= 14, `it left after ${warned} frames of warning`); }
    assert.equal(standingOn(s, log, p), true);
    carry(p, s);
  }
  assert.ok(Math.abs(p.x - 1060) < 1e-6, `he is at ${p.x}: carried the whole 800 px`);
  assert.equal(p.y, 700);
});

test('a lift takes him up, waits, and brings him down: he never leaves its floor', () => {
  const clock = stageClock([beat], false);
  const s = newRide(lift, clock.read('ride'));
  const p = { x: 340, y: 700, vx: 0, vy: 0 };
  let top = 700;
  let waitedAtTop = 0;
  for (let n = 0; n < 30 * 14; n++) {
    clock.step(DT);
    stepRide(s, lift, clock.read('ride'));
    carry(p, s);
    assert.equal(p.y, s.y);
    top = Math.min(top, p.y);
    if (p.y === 300) waitedAtTop++;
  }
  assert.equal(top, 300, 'all the way up');
  assert.ok(waitedAtTop >= 30 * 2, `it waited ${waitedAtTop} frames at the top (its rest, then the next cycle's wait and warning)`);
  assert.equal(p.y, 700, 'and back down');
  assert.equal(p.x, 340);
});
