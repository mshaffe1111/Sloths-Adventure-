/**
 * Matt's swing-stage control test (2026-10-26, Android 498x1034 upright, one thumb, stage 1-6): on a liana the touch rules fired 90 jumps
 * he did not mean (65 in the Finish, 10 in the Twist, 8 in the Develop, 7 in the Learn), each one letting go of the vine. The thumb behind
 * them was steering the swing: a long slide left and right, sometimes drifting down, never a flick up. "Vines still feel unrefined. Jump
 * accidentally a lot when I'm trying to collect petals."
 *
 * These tests feed fingers shaped like his logged ones (finger travel from touch-down to the jump, and how long it had been down) through
 * the touch rules with Pokey on a liana, upright and sideways, and check that steering stays steering, while a real flick up and
 * forward (Steph's flicks: their length, speed and lean) still lets go at once.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchGestures, TUNING, type GestureSink } from './touchGestures.ts';

/** the two ways his phone is held: the screen width, and where his thumb rests */
const VIEWS = {
  upright: { w: 498, thumbs: [{ x: 330, y: 760 }, { x: 150, y: 760 }] },
  sideways: { w: 1034, thumbs: [{ x: 820, y: 330 }, { x: 220, y: 330 }] },
} as const;

type World = { vine?: boolean; swing?: boolean; rope?: boolean; air?: boolean };

function rig(w: number, world: World) {
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
  const g = new TouchGestures(sink, () => w, {
    assist: () => true,
    air: () => !!world.air,
    refined: () => true,
    kickNear: () => false,
    onVine: () => !!world.vine,
    onSwing: () => !!world.swing,
    onRope: () => !!world.rope,
  });
  return { g, log, jumps: () => log.filter((l) => l === 'jump').length };
}

/**
 * one finger, down at (x0, y0), following `path` (finger travel at u = 0..1 of `ms`), sampled every `step` ms (a phone reports a moving
 * finger 60 to 120 times a second), with the recogniser's clock ticking as TouchController's does; lifted at the end unless `keep`
 */
function play(t: ReturnType<typeof rig>, x0: number, y0: number, ms: number, path: (u: number) => [number, number], step = 11, keep = false, t0 = 1000) {
  t.g.down(1, x0, y0, t0);
  let jumpAt = -1;
  for (let e = step; e <= ms + 0.01; e += step) {
    const [dx, dy] = path(Math.min(1, e / ms));
    t.g.move(1, x0 + dx, y0 + dy, t0 + e);
    if (Math.floor(e / 100) !== Math.floor((e - step) / 100)) t.g.tick(t0 + e);
    if (jumpAt < 0 && t.jumps() > 0) jumpAt = e;
  }
  const [dx, dy] = path(1);
  if (!keep) t.g.up(1, x0 + dx, y0 + dy, t0 + ms + step);
  return jumpAt;
}

/** the logged fingers: travel from touch-down at the moment of the jump (px, + is down) and how long the finger had been down (ms) */
const LOGGED: [number, number, number][] = [
  [108, 0, 974],
  [120, -10, 1008],
  [94, 10, 532],
  [101, 49, 974],
  [113, 48, 908],
  [72, 145, 841],
];

/**
 * what a steering thumb does on the way there: it pumps the swing left and right (`strokes` half-strokes of `amp` px), and a thumb
 * sweeping across the glass arcs, dipping down or bowing up `arc` px at the ends of each stroke
 */
const pump = (dx: number, dy: number, strokes: number, amp: number, arc: number) => (u: number): [number, number] => {
  const k = Math.sin(u * Math.PI * strokes);
  return [dx * u + amp * k, dy * u + arc * Math.abs(k)];
};
const SHAPES: [string, (dx: number, dy: number) => (u: number) => [number, number]][] = [
  ['a straight slide', (dx, dy) => (u) => [dx * u, dy * u]],
  ['a slow pump that dips', (dx, dy) => pump(dx, dy, 3, 60, 18)],
  ['a quick pump that dips', (dx, dy) => pump(dx, dy, 5, 60, 25)],
  ['a quick pump that bows up', (dx, dy) => pump(dx, dy, 5, 60, -40)],
  ['a big quick pump that bows up', (dx, dy) => pump(dx, dy, 6, 90, -55)],
];

test("Matt's logged swing fingers: pumping a liana sideways (or drifting down) steers it and never lets go, upright and sideways", () => {
  const fired: string[] = [];
  let steered = 0;
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const th of v.thumbs) {
      for (const [dx, dy, ms] of LOGGED) {
        for (const [name, shape] of SHAPES) {
          for (const step of [8, 16]) {
            for (const mirror of [1, -1]) {
              const t = rig(v.w, { vine: true, swing: true });
              play(t, th.x, th.y, ms, (u) => { const [a, b] = shape(dx, dy)(u); return [a * mirror, b]; }, step);
              if (t.jumps() > 0 || t.log.includes('duck:true')) fired.push(`${view} thumb x${th.x} (${dx * mirror},${dy},${ms}) ${name} @${step}ms: ${t.log.filter((l) => l === 'jump' || l === 'duck:true').join(' ')}`);
              if (t.log.some((l) => l === 'move:left' || l === 'move:right')) steered++;
            }
          }
        }
      }
    }
  }
  assert.deepEqual(fired, [], `${fired.length} steering fingers let go of the vine:\n${fired.slice(0, 12).join('\n')}`);
  assert.ok(steered > 0, 'the slides steer the swing');
});

test('pumping a liana left and right for a long while steers it the whole time and never lets go', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const per of [300, 450, 700]) {
      const t = rig(v.w, { vine: true, swing: true });
      // eight seconds of pumping with the swing, the thumb bowing up 30 px at each end of its stroke
      play(t, v.thumbs[0].x, v.thumbs[0].y, 8000, (u) => {
        const ph = (u * 8000 * Math.PI) / per;
        return [110 * Math.sin(ph), -30 * Math.abs(Math.sin(ph))];
      }, 11);
      assert.equal(t.jumps(), 0, `${view} pumping every ${per} ms: ${t.log.filter((l) => l === 'jump').length} jumps`);
      assert.ok(t.log.includes('move:left') && t.log.includes('move:right'), `${view}: it steers both ways`);
    }
  }
});

test("a clear flick up and forward (Steph's flicks: 110 to 300 px, 0.5 to 1.8 px/ms, 20 to 48 degrees over) lets go at once", () => {
  const deg = (a: number) => (a * Math.PI) / 180;
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const th of v.thumbs) {
      for (const len of [111, 203, 302]) {
        for (const speed of [0.53, 1.0, 1.83]) {
          for (const lean of [22, 27, 35, 41, 48]) {
            for (const side of [1, -1]) {
              const ms = len / speed;
              const t = rig(v.w, { vine: true, swing: true });
              const at = play(t, th.x, th.y, ms, (u) => [side * Math.sin(deg(lean)) * len * u, -Math.cos(deg(lean)) * len * u], 11);
              assert.equal(t.jumps(), 1, `${view} x${th.x} ${len}px ${speed}px/ms ${lean} degrees: ${t.log.join(' ')}`);
              // at once: as soon as the thumb has risen a flick's worth (a slow flick of 0.53 px/ms needs about 110 ms for that)
              assert.ok(at >= 0 && at <= 140, `${view} ${len}px ${speed}px/ms ${lean} degrees: let go after ${at} ms`);
            }
          }
        }
      }
    }
  }
});

test('Matt-style slides: a deliberate slide up and forward lets go; a slow creep up the liana and straight up still climb', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    const th = v.thumbs[0];
    // a slide up and forward at 0.45 px/ms, 35 degrees over: a release
    let t = rig(v.w, { vine: true, swing: true });
    play(t, th.x, th.y, 240, (u) => [62 * u, -88 * u], 11);
    assert.equal(t.jumps(), 1, `${view}: ${t.log.join(' ')}`);
    // straight up, even quickly: climbs the liana (straight up or down on a vine always climbs)
    for (const ms of [90, 400]) {
      t = rig(v.w, { vine: true, swing: true });
      play(t, th.x, th.y, ms, (u) => [6 * u, -90 * u], 11, true);
      assert.equal(t.jumps(), 0, `${view} straight up in ${ms} ms: ${t.log.join(' ')}`);
      assert.ok(t.log.includes('climb:-1'), `${view}: it climbs`);
    }
    // a slow creep up and over (0.1 px/ms): climbing, not a leap
    t = rig(v.w, { vine: true, swing: true });
    play(t, th.x, th.y, 1000, (u) => [50 * u, -100 * u], 11, true);
    assert.equal(t.jumps(), 0, `${view} creep: ${t.log.join(' ')}`);
  }
});

test('on a climbable vine or trunk: straight up and down climb, a diagonal flick up leaps off, a sideways or downward slide never does', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    const th = v.thumbs[1];
    let t = rig(v.w, { vine: true });
    play(t, th.x, th.y, 300, (u) => [4 * u, -120 * u], 11, true);
    assert.ok(t.log.includes('climb:-1') && t.jumps() === 0, `${view} up: ${t.log.join(' ')}`);
    t = rig(v.w, { vine: true });
    play(t, th.x, th.y, 300, (u) => [-4 * u, 120 * u], 11, true);
    assert.ok(t.log.includes('climb:1') && t.jumps() === 0 && !t.log.includes('duck:true'), `${view} down: ${t.log.join(' ')}`);
    t = rig(v.w, { vine: true });
    play(t, th.x, th.y, 90, (u) => [40 * u, -75 * u], 11);
    assert.equal(t.jumps(), 1, `${view} diagonal: ${t.log.join(' ')}`);
    for (const [dx, dy, ms] of LOGGED) {
      for (const [name, shape] of SHAPES) {
        t = rig(v.w, { vine: true });
        play(t, th.x, th.y, ms, shape(dx, dy), 11);
        assert.equal(t.jumps(), 0, `${view} trunk (${dx},${dy},${ms}) ${name}: ${t.log.join(' ')}`);
      }
    }
  }
});

test('hanging from a rope: a sideways slide creeps along and never hops off or drops; a flick up hops off, a slide down lets go', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    const th = v.thumbs[1];
    for (const [dx, dy, ms] of LOGGED) {
      // (the long slide down, 145 px, is the rope's own "slide down to let go": the other five are sideways)
      if (dy > dx) continue;
      for (const [name, shape] of SHAPES) {
        const t = rig(v.w, { rope: true });
        play(t, th.x, th.y, ms, shape(dx, dy), 11);
        assert.ok(t.jumps() === 0 && !t.log.includes('duck:true'), `${view} rope (${dx},${dy},${ms}) ${name}: ${t.log.join(' ')}`);
      }
    }
    let t = rig(v.w, { rope: true });
    play(t, th.x, th.y, 80, (u) => [20 * u, -90 * u], 11);
    assert.equal(t.jumps(), 1, `${view} rope flick up: ${t.log.join(' ')}`);
    t = rig(v.w, { rope: true });
    play(t, th.x, th.y, 300, (u) => [10 * u, 100 * u], 11, true);
    assert.ok(t.log.includes('duck:true'), `${view} rope slide down: ${t.log.join(' ')}`);
  }
});

test("the jump help's down-and-up wiggle: the second jump in the air, never a let-go once he holds a liana, a trunk or a rope", () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const hold of [{ vine: true, swing: true }, { vine: true }, { rope: true }, { air: true }] as World[]) {
      const world: World = {};
      const t = rig(v.w, world);
      const { x, y } = v.thumbs[1];
      const t0 = 1000;
      t.g.down(1, x, y, t0);
      let now = t0;
      const to = (dx: number, dy: number, ms: number) => {
        const n = Math.max(1, Math.round(ms / 11));
        const [x0, y0] = last;
        for (let k = 1; k <= n; k++) t.g.move(1, x0 + ((dx - x0) * k) / n, y0 + ((dy - y0) * k) / n, (now += ms / n));
        last = [dx, dy];
      };
      let last: [number, number] = [x, y];
      to(x + 120, y, 300); // running
      to(x + 130, y - 48, 120); // slide up: the jump that takes him up to it
      assert.equal(t.jumps(), 1, `${view}: ${t.log.join(' ')}`);
      Object.assign(world, hold); // he caught it (or, for the last, he is in the air with a second jump to spare)
      now += 80;
      // the steering thumb wiggles (down 20, up 28) while it keeps pumping sideways
      for (let k = 0; k < 4; k++) {
        to(last[0] + 50, last[1] + 20, 90);
        to(last[0] + 40, last[1] - 28, 110);
        to(last[0] - 90, last[1], 160);
      }
      if (hold.air) assert.ok(t.jumps() >= 2, `${view} in the air the wiggle jumps again: ${t.log.join(' ')}`);
      else assert.equal(t.jumps(), 1, `${view} ${JSON.stringify(hold)}: the wiggle let go (${t.log.join(' ')})`);
    }
  }
  assert.ok(TUNING.vineLeapMaxSlant <= Math.tan((50.5 * Math.PI) / 180), 'a leap off a vine leans no more than 50 degrees over');
});
