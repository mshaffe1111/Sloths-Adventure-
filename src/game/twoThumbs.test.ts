/**
 * Two-thumb play and the vine, driven the way a phone player's thumbs move (2026-10-25 play-test round): a steering thumb held down
 * while the other thumb flicks, a flick up and forward off a vine, a sideways flick at the forward end of a swing, and the swing's
 * release rules that turn those presses into a leap.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchGestures, TUNING, type GestureEnv, type GestureSink } from './touchGestures.ts';
import { RELEASE, SWING, TIMED, inSweetSpot, knockDir, releaseCall, setTimedSwing, swingStep, timedLaunch, type SwingState } from './physics.ts';

/** a 400 x 720 upright phone with jump help on and refined controls, and a world the test can change (in the air, on a vine) */
function rig(world: { air?: boolean; vine?: boolean; swing?: boolean } = {}) {
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
  const env: GestureEnv = {
    assist: () => true,
    air: () => !!world.air,
    refined: () => true,
    kickNear: () => false,
    onVine: () => !!world.vine,
    onSwing: () => !!world.swing,
  };
  const g = new TouchGestures(sink, () => 400, env);
  let now = 1000;
  const t = {
    g,
    log,
    world,
    wait(ms: number) {
      for (let k = 0; k < ms; k += 30) {
        now += Math.min(30, ms - k);
        g.tick(now);
      }
    },
    down: (id: number, x: number, y: number) => g.down(id, x, y, now),
    up: (id: number, x: number, y: number) => g.up(id, x, y, now),
    drag(id: number, x0: number, y0: number, x1: number, y1: number, ms: number, steps = 4) {
      for (let i = 1; i <= steps; i++) {
        now += ms / steps;
        g.move(id, x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, now);
      }
    },
    /** a thumb flick: down, a quick sweep, off the glass */
    flick(id: number, x: number, y: number, dx: number, dy: number, ms = 60) {
      t.down(id, x, y);
      t.drag(id, x, y, x + dx, y + dy, ms, 3);
      t.up(id, x + dx, y + dy);
    },
    lastMove: () => log.filter((l) => l.startsWith('move:')).pop(),
    count: (s: string) => log.filter((l) => l === s).length,
  };
  return t;
}

test('two thumbs: steering held, a flick up, then a second flick in the air is the double jump, at any gap; the run never stops', () => {
  for (const gap of [80, 150, 250, 400]) {
    const t = rig();
    // the left thumb lands and slides right, and stays down
    t.down(1, 70, 520);
    t.drag(1, 70, 520, 142, 520, 120);
    assert.equal(t.lastMove(), 'move:right');
    // the right thumb flicks up: the jump, released when it lifts
    t.flick(2, 310, 450, 0, -81);
    t.world.air = true;
    t.wait(gap);
    t.flick(2, 310, 450, 0, -81);
    assert.equal(t.count('jump'), 2, `gap ${gap}: ${t.log.join(' ')}`);
    assert.ok(t.count('jumpUp') >= 2, `gap ${gap}: each flick lets go of its jump (${t.log.join(' ')})`);
    assert.equal(t.lastMove(), 'move:right', `gap ${gap}: the flicks must not stop the run (${t.log.join(' ')})`);
    assert.ok(!t.log.includes('punch') && !t.log.includes('kick'), `gap ${gap}: a flick is not a punch or a kick (${t.log.join(' ')})`);
    t.up(1, 142, 520);
    assert.equal(t.lastMove(), 'move:none');
  }
});

test('two thumbs: a flick held on the glass (the leaf), then another flick, is the double jump', () => {
  for (const hold of [100, 300, 600]) {
    const t = rig();
    t.down(1, 70, 520);
    t.drag(1, 70, 520, 142, 520, 200);
    // flick up and keep the thumb down
    t.down(2, 310, 450);
    t.drag(2, 310, 450, 310, 369, 60, 3);
    t.world.air = true;
    t.wait(hold);
    t.up(2, 310, 369);
    t.wait(60);
    t.flick(2, 310, 450, 0, -81);
    assert.equal(t.count('jump'), 2, `held ${hold}: ${t.log.join(' ')}`);
    assert.equal(t.lastMove(), 'move:right', `held ${hold}: ${t.log.join(' ')}`);
  }
});

test('one thumb: two quick flicks up give two jumps, however close together', () => {
  for (const gap of [0, 40, 80, 150]) {
    const t = rig();
    t.flick(2, 310, 450, 0, -81);
    t.world.air = true;
    t.wait(gap);
    t.flick(2, 310, 450, 0, -81);
    assert.equal(t.count('jump'), 2, `gap ${gap}: ${t.log.join(' ')}`);
  }
});

test('on a vine: straight up climbs; up and forward (27 degrees over, as the swing card says) leaps off', () => {
  const deg = (a: number) => (a * Math.PI) / 180;
  // near-vertical: a climb, never a jump
  for (const a of [0, 8, 14]) {
    const t = rig({ vine: true, swing: true });
    t.down(1, 120, 520);
    t.drag(1, 120, 520, 120 + Math.sin(deg(a)) * 80, 520 - Math.cos(deg(a)) * 80, 90, 4);
    assert.equal(t.count('jump'), 0, `${a} degrees: ${t.log.join(' ')}`);
    assert.ok(t.log.includes('climb:-1'), `${a} degrees climbs: ${t.log.join(' ')}`);
  }
  // clearly forward: the leap
  for (const a of [27, 40, 60]) {
    const t = rig({ vine: true, swing: true });
    t.down(1, 120, 520);
    t.drag(1, 120, 520, 120 + Math.sin(deg(a)) * 80, 520 - Math.cos(deg(a)) * 80, 90, 4);
    assert.equal(t.count('jump'), 1, `${a} degrees: ${t.log.join(' ')}`);
  }
  assert.ok(TUNING.vineLeapSlant < Math.tan(deg(27)) && TUNING.vineLeapSlant > Math.tan(deg(14)));
});

test('on a swinging vine: a quick sideways flick leaps that way (either thumb); a slow pumping slide does not', () => {
  // one thumb: the flick right
  let t = rig({ vine: true, swing: true });
  t.flick(1, 120, 520, 80, 0, 60);
  assert.equal(t.count('jump'), 1, t.log.join(' '));
  assert.ok(t.log.includes('move:right'), 'it leaps the way it flicked');
  // the steering thumb pumps slowly left and right: never a leap
  t = rig({ vine: true, swing: true });
  t.down(1, 120, 520);
  for (let k = 0; k < 4; k++) {
    t.drag(1, 120, 520, 190, 520, 400, 8);
    t.drag(1, 190, 520, 120, 520, 400, 8);
  }
  assert.equal(t.count('jump'), 0, t.log.join(' '));
  // the other thumb flicks sideways while the steering thumb holds right
  t.drag(1, 120, 520, 190, 520, 200, 4);
  t.flick(2, 310, 450, 80, 0, 60);
  assert.equal(t.count('jump'), 1, t.log.join(' '));
  // on a trunk (not swinging) a sideways flick is not a leap off
  t = rig({ vine: true, swing: false });
  t.flick(1, 120, 520, 80, 0, 60);
  assert.equal(t.count('jump'), 0, t.log.join(' '));
});

/** the swing, at 30 frames a second, and a press to let go toward +1 when `pressAt` says so: what the engine does with it */
function swingAndLetGo(pressAt: (s: SwingState, frame: number) => boolean) {
  setTimedSwing(false);
  const v = { x: 0, topY: 0, bottomY: 420 };
  const s: SwingState = { angle: 0, omega: 0, len: 320 };
  let snap: (SwingState & { at: number }) | null = null;
  let waiting = 0;
  for (let f = 0; f < 30 * 12; f++) {
    const t = f / 30;
    swingStep(s, v, 1 / 30, 1, 0);
    if (inSweetSpot(s, 1)) snap = { ...s, at: t };
    let press = f > 30 * 4 && pressAt(s, f);
    // a press a beat early waits for the sweet spot (engine.ts holdLeapForSweet)
    if (waiting > 0) {
      waiting -= 1 / 30;
      if (inSweetSpot(s, 1) || waiting <= 0) press = true;
    } else if (press && releaseCall(s, 1, Infinity) === 'early') {
      waiting = RELEASE.early;
      press = false;
    }
    if (!press) continue;
    const call = releaseCall(s, 1, snap ? t - snap.at : Infinity);
    return { call, launch: timedLaunch(call === 'late' && snap ? snap : s, 1), angle: s.angle };
  }
  return null;
}

test('swing: a press anywhere in the forward part of the swing leaps forward, every time', () => {
  const w = (2 * Math.PI) / TIMED.period;
  // pressed at every moment of a whole swing while he moves forward (or just turned at the forward end)
  let tried = 0;
  for (let phase = 0; phase < 64; phase++) {
    let n = 0;
    const r = swingAndLetGo((s) => {
      // forward part: moving forward anywhere past the back third, or the first beat after turning round at the front
      const forward = (s.omega > 0 && s.angle > -0.45) || (s.omega <= 0 && s.angle > 0.62);
      return forward && n++ === phase % 7;
    });
    if (!r) continue;
    tried++;
    assert.ok(r.call !== 'now', `phase ${phase}: angle ${r.angle.toFixed(2)} let go with a plain hop`);
    assert.ok(r.launch.sweet && r.launch.vx >= SWING.leapMin * 0.95, `phase ${phase}: a leap forward (${r.launch.vx.toFixed(0)})`);
  }
  assert.ok(tried > 20, `tried ${tried}`);
  void w;
});

test('swing: the forward end of the swing, the natural moment, is a leap (it used to drop him almost straight down)', () => {
  const r = swingAndLetGo((s) => s.angle > TIMED.sweetTo + 0.03 && s.omega > 0);
  assert.ok(r && r.call === 'late' && r.launch.sweet, JSON.stringify(r));
  // and just after turning back at the front
  const r2 = swingAndLetGo((s) => s.angle > 0.7 && s.omega < -0.2);
  assert.ok(r2 && r2.launch.sweet, JSON.stringify(r2));
  // the backswing is still not a leap forward
  const r3 = swingAndLetGo((s) => s.angle < -0.5 && s.omega < 0);
  assert.ok(r3 && r3.call === 'now' && !r3.launch.sweet, JSON.stringify(r3));
});

test('swing, driven by the real gestures: pump with slides, then flick at the forward end, with one thumb and with two', () => {
  for (const twoThumbs of [false, true]) {
    setTimedSwing(false);
    const v = { x: 0, topY: 0, bottomY: 420 };
    const s: SwingState = { angle: 0, omega: 0, len: 320 };
    const t = rig({ vine: true, swing: true });
    let snap: (SwingState & { at: number }) | null = null;
    let result: ReturnType<typeof timedLaunch> | null = null;
    let fx = 120;
    t.down(1, fx, 520);
    for (let f = 0; f < 30 * 10 && !result; f++) {
      const time = f / 30;
      swingStep(s, v, 1 / 30, 1, 0);
      if (inSweetSpot(s, 1)) snap = { ...s, at: time };
      const before = t.count('jump');
      if (f < 30 * 4) {
        // pumping: the thumb slides with the swing
        const nx = 120 + Math.round(s.angle * 60);
        t.drag(1, fx, 520, nx, 520, 33, 1);
        fx = nx;
      } else if (s.angle > TIMED.sweetTo && s.omega > 0) {
        // the forward end: flick toward the next vine
        if (twoThumbs) t.flick(2, 310, 450, 80, 0, 60);
        else {
          t.drag(1, fx, 520, fx + 90, 516, 60, 3);
          fx += 90;
        }
      } else t.wait(33);
      if (t.count('jump') > before) {
        const call = releaseCall(s, 1, snap ? time - snap.at : Infinity);
        result = timedLaunch(call === 'late' && snap ? snap : s, 1);
      }
    }
    assert.ok(result && result.sweet && result.vx >= SWING.leapMin * 0.95, `${twoThumbs ? 'two thumbs' : 'one thumb'}: ${JSON.stringify(result)} ${t.log.join(' ')}`);
  }
});

test('a hit knocks him away from what hit him, not away from where he faces', () => {
  // facing right, hit from behind (the foe on his left): pushed right, away from it
  assert.equal(knockDir(500, 1, 460), 1);
  // facing right, hit from the front: pushed back left
  assert.equal(knockDir(500, 1, 540), -1);
  assert.equal(knockDir(500, -1, 540), -1);
  assert.equal(knockDir(500, -1, 460), 1);
  // nothing known: back the way he faces, as before
  assert.equal(knockDir(500, 1), -1);
  assert.equal(knockDir(500, -1), 1);
});
