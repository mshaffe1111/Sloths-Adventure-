import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchGestures, type GestureSink } from './touchGestures.ts';
import { PHYS, airCarry, airTakeOff, newAirDrive, LEAN_SPEED } from './physics.ts';

/** a recording sink and scripted fingers (844 x 390 landscape phone), with the "in the air" and "jump help" switches the game would supply */
function rig(opts: { assist?: boolean; air?: boolean } = {}) {
  const env = { assist: opts.assist ?? true, air: opts.air ?? true };
  const log: string[] = [];
  const sink: GestureSink = {
    move: (d) => log.push(`move:${d}`),
    duck: (on) => log.push(`duck:${on}`),
    jumpPress: () => log.push('jump'),
    jumpRelease: () => log.push('jumpUp'),
    punch: () => log.push('punch'),
    kick: () => log.push('kick'),
    mega: () => log.push('mega'),
    feedback: () => {},
  };
  const g = new TouchGestures(sink, () => 844, { assist: () => env.assist, air: () => env.air });
  let now = 1000;
  return {
    env,
    log,
    wait(ms: number) {
      now += ms;
      g.tick(now);
    },
    down(id: number, x: number, y: number) {
      g.down(id, x, y, now);
    },
    drag(id: number, x0: number, y0: number, x1: number, y1: number, ms: number, steps = 8) {
      for (let i = 1; i <= steps; i++) {
        now += ms / steps;
        g.move(id, x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, now);
        g.tick(now);
      }
    },
    up(id: number, x: number, y: number) {
      g.up(id, x, y, now);
    },
    count: (s: string) => log.filter((l) => l === s).length,
    has: (s: string) => log.includes(s),
  };
}

test('in the air, a tap is a punch (the fight makes it a jump kick), never the second jump', () => {
  const t = rig();
  t.down(1, 640, 260);
  t.wait(80);
  t.up(1, 640, 260);
  assert.equal(t.count('punch'), 1);
  assert.equal(t.count('jump'), 0);
});

test('on the ground a tap still punches', () => {
  const t = rig({ air: false });
  t.down(1, 640, 260);
  t.wait(80);
  t.up(1, 640, 260);
  assert.equal(t.count('punch'), 1);
  assert.equal(t.count('jump'), 0);
});

test('with jump help off, a tap in the air still punches (the old feel, for comparing)', () => {
  const t = rig({ assist: false });
  t.down(1, 640, 260);
  t.wait(80);
  t.up(1, 640, 260);
  assert.equal(t.count('punch'), 1);
  assert.equal(t.count('jump'), 0);
});

test('in the air, the steering thumb put back down a moment after lifting is a re-plant: no jump and no punch', () => {
  const t = rig();
  t.down(1, 200, 260);
  t.drag(1, 200, 260, 300, 262, 300);
  t.up(1, 300, 262);
  t.wait(30);
  t.down(2, 220, 260); // back on the left half, bouncing straight back down
  t.wait(70);
  t.up(2, 220, 260);
  assert.equal(t.count('jump'), 0);
  assert.equal(t.count('punch'), 0);
});

test('in the air, a short slow slide up is the second jump', () => {
  const t = rig();
  t.down(1, 640, 280);
  t.drag(1, 640, 280, 645, 258, 260); // 22 px in 260 ms: not a flick
  t.up(1, 645, 258);
  assert.equal(t.count('jump'), 1);
});

test('on the ground, a slow slide up by the second thumb is a jump too (it used to do nothing at all)', () => {
  const t = rig({ air: false });
  t.down(1, 180, 270);
  t.drag(1, 180, 270, 300, 270, 400); // steering right
  t.down(2, 640, 300);
  t.drag(2, 640, 300, 645, 250, 420); // 50 px in 420 ms: slow
  t.up(2, 645, 250);
  assert.equal(t.count('jump'), 1);
  const old = rig({ air: false, assist: false });
  old.down(1, 180, 270);
  old.drag(1, 180, 270, 300, 270, 400);
  old.down(2, 640, 300);
  old.drag(2, 640, 300, 645, 250, 420);
  old.up(2, 645, 250);
  assert.equal(old.count('jump'), 0, 'the old rules ignored it');
});

test('one finger: slide up to jump, then a short wiggle (down a little, up a little) is the second jump', () => {
  const t = rig({ air: false });
  t.down(1, 180, 270);
  t.drag(1, 180, 270, 300, 270, 300); // running right
  t.drag(1, 300, 270, 310, 222, 120); // slide up: the first jump
  assert.equal(t.count('jump'), 1);
  t.env.air = true; // the engine says: in the air, a second jump to spare
  t.wait(80);
  t.drag(1, 310, 222, 310, 242, 90); // down 20
  t.drag(1, 310, 242, 310, 214, 110); // up 28
  assert.equal(t.count('jump'), 2, 'the wiggle jumped again');
});

test('one finger: tiny jitter after a jump is not a second jump', () => {
  const t = rig({ air: false });
  t.down(1, 180, 270);
  t.drag(1, 180, 270, 300, 270, 300);
  t.drag(1, 300, 270, 310, 222, 120);
  t.env.air = true;
  t.wait(80);
  for (let i = 0; i < 6; i++) {
    t.drag(1, 310, 222, 312, 228, 40, 2);
    t.drag(1, 312, 228, 310, 222, 40, 2);
  }
  assert.equal(t.count('jump'), 1);
});

test('a flick sideways in the air is still a kick', () => {
  const t = rig();
  t.down(1, 180, 270);
  t.drag(1, 180, 270, 300, 270, 300);
  t.down(2, 600, 260);
  t.drag(2, 600, 260, 680, 250, 70);
  t.up(2, 680, 250);
  assert.equal(t.count('kick'), 1);
  assert.equal(t.count('jump'), 0);
});

test('a second jump just taken locks the next for a moment (two fingers landing together do not double up)', () => {
  const t = rig();
  // two thumbs slide up a short way, one just after the other: the first is the second jump, the second is held off
  t.down(1, 640, 280);
  t.down(2, 700, 280);
  t.drag(1, 640, 280, 642, 250, 120);
  t.drag(2, 700, 280, 702, 250, 60);
  t.up(1, 642, 250);
  t.up(2, 702, 250);
  assert.equal(t.count('jump'), 1);
});

test('a quick sideways drift while steering is not a jump in the air', () => {
  const t = rig();
  t.down(1, 180, 270);
  t.drag(1, 180, 270, 320, 266, 500);
  t.drag(1, 320, 266, 180, 274, 500);
  assert.equal(t.count('jump'), 0);
  assert.equal(t.count('punch'), 0);
});

// ───────────── what carries him through the air ─────────────

const steerDir = (s: number) => (s < 0 ? -1 : s > 0 ? 1 : 0) as -1 | 0 | 1;

/** fly one jump the way the engine does (same helpers, same air steps): the thumb steers, lifts at take-off, or pushes back later */
function fly(opts: { vx0: number; steer: number; liftAtTakeOff: boolean; second: boolean; lean: boolean; brakeAt?: number; secs?: number }) {
  const st = newAirDrive();
  airTakeOff(st, steerDir(opts.liftAtTakeOff ? 0 : opts.steer), opts.vx0 < 0 ? -1 : 1, opts.second, opts.lean);
  let x = 0;
  let vx = opts.vx0;
  const dt = 1 / 60;
  const secs = opts.secs ?? 0.6;
  for (let t = 0; t < secs; t += dt) {
    const push = opts.brakeAt !== undefined && t >= opts.brakeAt ? (-Math.sign(opts.vx0 || 1) as -1 | 1) : opts.liftAtTakeOff ? 0 : steerDir(opts.steer);
    const dir = airCarry(st, push, false);
    const cap = st.lean && push === 0 ? LEAN_SPEED : 1;
    const maxSpeed = PHYS.maxRun * cap;
    if (dir !== 0) {
      const reversing = Math.sign(vx) === -dir && Math.abs(vx) > 20;
      const acc = PHYS.airAcc + (reversing ? PHYS.airTurn : 0);
      if (dir * vx < maxSpeed) {
        vx += dir * acc * dt;
        if (dir * vx > maxSpeed) vx = dir * maxSpeed;
      } else {
        vx -= dir * PHYS.airDec * dt;
      }
    } else {
      const dec = PHYS.airStop * dt;
      vx = Math.abs(vx) <= dec ? 0 : vx - Math.sign(vx) * dec;
    }
    x += vx * dt;
  }
  return { x, vx, st };
}

test('a plain jump is exactly what it always was: lift the thumb and he stops within a body width', () => {
  for (const lean of [false, true]) {
    const r = fly({ vx0: PHYS.maxRun, steer: 1, liftAtTakeOff: true, second: false, lean });
    assert.equal(r.st.drive, 0);
    assert.ok(r.x < 45, `${Math.round(r.x)} px with the thumb up`);
    assert.equal(r.vx, 0);
  }
});

test('a plain jump from a standstill goes straight up, even with the forward push on', () => {
  const r = fly({ vx0: 0, steer: 0, liftAtTakeOff: true, second: false, lean: true });
  assert.equal(Math.round(r.x), 0);
});

test('a second jump pushes forward only when asked for and nothing is steering him', () => {
  const none = fly({ vx0: 0, steer: 0, liftAtTakeOff: true, second: true, lean: false });
  assert.equal(Math.round(none.x), 0);
  const lean = fly({ vx0: 0, steer: 0, liftAtTakeOff: true, second: true, lean: true });
  assert.ok(lean.x > 60 && lean.x < PHYS.maxRun * 0.6, `a push of ${Math.round(lean.x)} px`);
  assert.ok(lean.vx <= PHYS.maxRun * LEAN_SPEED + 1, 'the push is gentler than a run');
  // a thumb that is steering already has the say: nothing is latched, so letting go stops him as before
  const steered = fly({ vx0: PHYS.maxRun, steer: 1, liftAtTakeOff: false, second: true, lean: true });
  assert.equal(steered.st.drive, 0);
});

test('the push ends when the thumb steers, pushes back or ducks', () => {
  const st = newAirDrive();
  airTakeOff(st, 0, 1, true, true);
  assert.equal(airCarry(st, 0, false), 1);
  assert.equal(airCarry(st, 0, false), 1);
  assert.equal(airCarry(st, -1, false), -1, 'pushing back brakes at once');
  assert.equal(airCarry(st, 0, false), 0, 'and the push is gone');
  airTakeOff(st, 0, 1, true, true);
  assert.equal(airCarry(st, 0, true), 0, 'ducking in the air cancels it');
  airTakeOff(st, 0, 1, true, true);
  assert.equal(airCarry(st, 1, false), 1, 'a thumb steering the same way takes over at full speed');
  assert.ok(!st.lean);
});

test('a second jump facing the other way pushes that way', () => {
  const st = newAirDrive();
  airTakeOff(st, 0, -1, true, true);
  assert.equal(st.drive, -1);
  assert.ok(st.lean);
});

// ───────────── starting the run from the right half ─────────────

/** when the first `move:right` reaches the game after a steady slide from x0 at `speed` px per ms */
function runStart(assist: boolean, x0: number, speed: number): number {
  const t = rig({ assist, air: false });
  let first = -1;
  let ms = 0;
  t.down(1, x0, 260);
  while (ms < 600 && first < 0) {
    t.drag(1, x0 + speed * ms, 260, x0 + speed * (ms + 8), 260, 8, 1);
    ms += 8;
    if (t.has('move:right')) first = ms;
  }
  return first;
}

test('a lone finger on the right half starts the run quickly (it used to wait 210 ms), with Jump help on or off (CT-8)', () => {
  for (const speed of [0.2, 0.3, 0.5]) {
    for (const assist of [true, false]) {
      const now = runStart(assist, 600, speed);
      assert.ok(now > 0 && now <= 110, `at ${speed} px/ms, Jump help ${assist ? 'on' : 'off'}: ${now} ms`);
    }
  }
});

test('a flick sideways from the right half is still a kick, and the run it began is stopped', () => {
  for (const [dist, ms, lag] of [[70, 60, 15], [60, 120, 20], [55, 150, 20], [80, 150, 0]] as const) {
    const t = rig({ air: false });
    t.down(1, 600, 260);
    t.drag(1, 600, 260, 600 + dist, 255, ms, Math.max(2, Math.round(ms / 8)));
    t.wait(lag);
    t.up(1, 600 + dist, 255);
    assert.equal(t.count('kick'), 1, `${dist}px in ${ms}ms`);
    assert.equal(t.log.filter((l) => l.startsWith('move:')).pop() ?? 'move:none', 'move:none', 'not left running');
  }
});

test('a flick left kicks to the left', () => {
  const t = rig({ air: false });
  t.down(1, 650, 260);
  t.drag(1, 650, 260, 580, 262, 110, 10);
  t.up(1, 580, 262);
  assert.equal(t.count('kick'), 1);
});

test('a long slide from the right half is a run, not a kick', () => {
  const t = rig({ air: false });
  t.down(1, 560, 260);
  t.drag(1, 560, 260, 800, 262, 900, 40);
  t.up(1, 800, 262);
  assert.ok(t.has('move:right'));
  assert.equal(t.count('kick'), 0);
});

test('a flick up from the right half is a jump and does not start a run', () => {
  const t = rig({ air: false });
  t.down(1, 600, 300);
  t.drag(1, 600, 300, 606, 240, 70, 8);
  t.up(1, 606, 240);
  assert.equal(t.count('jump'), 1);
  assert.ok(!t.has('move:right'));
});

test('a second thumb on the right never takes over the steering while the first is running', () => {
  const t = rig({ air: false });
  t.down(1, 180, 270);
  t.drag(1, 180, 270, 300, 270, 300);
  t.down(2, 620, 260);
  t.drag(2, 620, 260, 690, 262, 300, 20);
  assert.equal(t.log.filter((l) => l === 'move:right').length, 1);
  assert.equal(t.count('move:left'), 0);
});

test('CT-8: with jump help off the right half no longer waits the 210 ms', () => {
  assert.ok(runStart(false, 600, 0.5) <= 110);
});

/**
 * Matt's second jumps (control test 2026-10-26, Android sideways 1034 px, refined rules, one thumb on the LEFT half): a short flick up in
 * the air, 18 to 32 px in a tenth of a second, did nothing or punched. A finger on the right half jumps on 16 px there (airUpPx), but a
 * left-half finger steers from the moment it lands, and the steering thumb needed airJumpDy (28 px) with an upward speed, and had no last
 * look when it lifted. The touches as logged (ms since down, screen x, y; the last is the lift). (A third, 41 px left and 27 up, leans
57 degrees over: that is steering, on either half.)
 */
const MATT_SHORT_SECOND_FLICKS: [string, [number, number, number][]][] = [
  ['1140736', [[0, 248, 837], [66, 255, 829], [83, 261, 822], [100, 266, 817], [108, 266, 817]]],
  ['1140961', [[0, 248, 834], [108, 259, 816], [124, 259, 816]]],
];
/** he landed in the middle of this one (110 ms in): 32 px up, 2 short of a jump from the ground (jumpDy) */
const MATT_FLICK_AS_HE_LANDS: [number, number, number][] = [[0, 164, 764], [99, 162, 753], [116, 162, 736], [132, 163, 732], [141, 163, 732]];

function mattRig(world: { air: boolean }) {
  const log: string[] = [];
  const sink: GestureSink = {
    move: (d) => log.push(`move:${d}`),
    duck: (on) => log.push(`duck:${on}`),
    jumpPress: () => log.push('jump'),
    jumpRelease: () => log.push('jumpUp'),
    punch: () => log.push('punch'),
    kick: () => log.push('kick'),
    mega: () => log.push('mega'),
    climb: (d) => log.push(`climb:${d}`),
    feedback: () => {},
  };
  const g = new TouchGestures(sink, () => 1034, { assist: () => true, air: () => world.air, refined: () => true, kickNear: () => false, onVine: () => false, onSwing: () => false, onRope: () => false });
  return { g, log, count: (s: string) => log.filter((l) => l === s).length };
}
function replayAt(g: TouchGestures, samples: [number, number, number][], t0: number, at?: (ms: number) => void) {
  g.down(1, samples[0][1], samples[0][2], t0);
  for (let i = 1; i < samples.length; i++) {
    const [ms, x, y] = samples[i];
    at?.(ms);
    if (i === samples.length - 1) g.up(1, x, y, t0 + ms);
    else g.move(1, x, y, t0 + ms);
  }
}

test("Matt's short second flicks on the steering half are the second jump, not nothing and not a punch", () => {
  for (const [name, samples] of MATT_SHORT_SECOND_FLICKS) {
    const t = mattRig({ air: true });
    replayAt(t.g, samples, 5000);
    assert.equal(t.count('jump'), 1, `${name}: ${t.log.join(' ')}`);
    assert.equal(t.count('punch') + t.count('kick'), 0, `${name}: ${t.log.join(' ')}`);
    assert.equal(t.count('jumpUp') >= 1, true, `${name}: released`);
  }
});

test('a flick begun in the air still jumps if he lands before it is through', () => {
  const world = { air: true };
  const t = mattRig(world);
  replayAt(t.g, MATT_FLICK_AS_HE_LANDS, 5000, (ms) => {
    if (ms >= 110) world.air = false;
  });
  assert.equal(t.count('jump'), 1, t.log.join(' '));
});

test('in the air the shorter rise is only for a fresh touch going up: a sideways steer, or a thumb that has steered a while, is not a jump', () => {
  // a thumb planted in the air that steers sideways, bowing up a little
  let t = mattRig({ air: true });
  replayAt(t.g, [[0, 200, 800], [40, 220, 796], [80, 245, 790], [120, 262, 788], [200, 270, 788]], 5000);
  assert.equal(t.count('jump'), 0, t.log.join(' '));
  // a thumb that has been steering for half a second drifts up 20 px
  t = mattRig({ air: true });
  replayAt(t.g, [[0, 200, 800], [100, 240, 800], [300, 280, 802], [500, 290, 800], [560, 292, 786], [620, 293, 780], [700, 293, 780]], 5000);
  assert.equal(t.count('jump'), 0, t.log.join(' '));
  // a tap in the air is still a punch
  t = mattRig({ air: true });
  replayAt(t.g, [[0, 200, 800], [60, 202, 797], [90, 202, 797]], 5000);
  assert.equal(t.count('punch'), 1, t.log.join(' '));
  assert.equal(t.count('jump'), 0, t.log.join(' '));
});

test('a right-half thumb that flicks up, stays on the glass, sinks a little and flicks again jumps twice', () => {
  const world = { air: false };
  const t = mattRig(world);
  const x = 760;
  let now = 5000;
  t.g.down(1, x, 300, now);
  for (let k = 1; k <= 6; k++) t.g.move(1, x + k, 300 - k * 12, (now += 12)); // a quick flick up: the jump
  assert.equal(t.count('jump'), 1, t.log.join(' '));
  world.air = true; // he is up, with the second jump to spare
  for (let k = 1; k <= 5; k++) t.g.move(1, x + 6, 228 + k * 6, (now += 20)); // sinks back 30 px
  for (let k = 1; k <= 4; k++) t.g.move(1, x + 8, 258 - k * 9, (now += 12)); // and flicks up again
  assert.equal(t.count('jump'), 2, t.log.join(' '));
  t.g.up(1, x + 8, 222, (now += 20));
  assert.equal(t.count('punch') + t.count('kick'), 0, t.log.join(' '));
});
