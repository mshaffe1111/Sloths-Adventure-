/**
 * A flick to the left must do exactly what the same flick to the right does, mirrored (QA, 1-6 v192, 2026-10-26: on a liana, one thumb,
 * lift then flick, "flick up-right" let go at once and "flick up-left" registered no jump press at all; Jen sat on 1-10's middle vine
 * for 18 s). Every vine flick case here is played twice, the second time mirrored left for right, through the real touch rules, on a
 * liana, a trunk and a rope, with the refined and the old control rules, upright and sideways: the second must give the mirror of what
 * the first gave. The QA rig's own flick (80 px in 60 ms, three moves) is among them, and it is also played into the real engine on 1-6.
 *
 * (A press up to a third of a second before the sweet spot for its lean is held until he gets there, then leaps: physics.ts RELEASE.early.
 * So a flick a beat early, while he swings toward that side, stays on the vine until then. That is intended.)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchGestures, type GestureSink } from './touchGestures.ts';
import { RealPlay } from './realPlay.ts';

const VIEWS = { upright: { w: 412, h: 915 }, sideways: { w: 915, h: 412 } } as const;
type Hold = 'swing' | 'trunk' | 'rope';

function rig(w: number, hold: Hold, refined: boolean) {
  const log: string[] = [];
  const sink: GestureSink = {
    move: (d) => log.push(`move:${d}`),
    duck: (on) => log.push(`duck:${on}`),
    jumpPress: (lean) => log.push(`jump:${lean ?? 0}`),
    jumpRelease: () => log.push('jumpUp'),
    punch: () => log.push('punch'),
    kick: (d) => log.push(`kick:${d ?? 0}`),
    mega: () => log.push('mega'),
    climb: (d) => log.push(`climb:${d}`),
    feedback: () => {},
  };
  const g = new TouchGestures(sink, () => w, {
    assist: () => true, air: () => false, refined: () => refined, kickNear: () => false,
    onVine: () => hold !== 'rope', onSwing: () => hold === 'swing', onRope: () => hold === 'rope',
  });
  return { g, log };
}

/** the mirror of a log: left for right, and every lean and kick the other way */
const mirror = (log: string[]) =>
  log.map((l) => l.replace('move:left', 'move:L').replace('move:right', 'move:left').replace('move:L', 'move:right').replace(/^(jump|kick):(-?\d)$/, (_, k, n) => `${k}:${-Number(n) || 0}`));

interface Flick {
  /** px and ms, and how many moves the phone reports along the way */
  len: number;
  ms: number;
  steps: number;
  /** degrees off straight up, + to the right (90 = sideways right, 180 = straight down) */
  deg: number;
}

/**
 * one scene: maybe a steering thumb first (pumping one way and lifted, or still held down: two thumbs), then the flick finger on the
 * right half of the screen, its moves `f.steps` along the way, the recogniser's tick every 30 ms, and lifted. `side` mirrors all of it.
 */
function scene(view: { w: number; h: number }, hold: Hold, refined: boolean, pre: 'none' | 'lift' | 'held', f: Flick, side: 1 | -1) {
  const t = rig(view.w, hold, refined);
  let now = 1000;
  const run = (ms: number) => {
    const end = now + ms;
    while (now < end) {
      const d = Math.min(10, end - now);
      now += d;
      if (Math.floor(now / 30) !== Math.floor((now - d) / 30)) t.g.tick(now);
    }
  };
  if (pre !== 'none') {
    // the QA rig's steering thumb: down at 18% across and 72% down, slid 70 px over four moves, held 800 ms
    const sx = Math.round(view.w * 0.18);
    const sy = Math.round(view.h * 0.72);
    let x = sx;
    t.g.down(1, x, sy, now);
    run(33);
    for (let k = 1; k <= 4; k++) {
      x = Math.round(x + (sx + side * 70 - x) / (5 - k));
      t.g.move(1, x, sy, now);
      run(25);
    }
    run(800);
    if (pre === 'lift') {
      t.g.up(1, x, sy, now);
      run(33);
    }
  }
  const ux = side * Math.sin((f.deg * Math.PI) / 180);
  const uy = -Math.cos((f.deg * Math.PI) / 180);
  let ax = Math.round(view.w * 0.78);
  let ay = Math.round(view.h * 0.62);
  t.g.down(2, ax, ay, now);
  for (let k = 1; k <= f.steps; k++) {
    run(f.ms / f.steps);
    ax += (ux * f.len) / f.steps;
    ay += (uy * f.len) / f.steps;
    t.g.move(2, ax, ay, now);
  }
  run(20);
  t.g.up(2, ax, ay, now);
  return t.log;
}

const FLICKS: Flick[] = [];
// the QA rig's flick (80 px, 60 ms, three moves) at its two diagonals, sideways and straight up and down
for (const deg of [0, 35, 90, 180]) FLICKS.push({ len: 80, ms: 60, steps: 3, deg });
// real thumbs' flicks (Steph's: 110 to 300 px, 0.5 to 1.8 px/ms, leaning 20 to 48 degrees), sampled as a phone does (every 8 or 16 ms)
for (const len of [111, 203, 302]) {
  for (const speed of [0.53, 1.0, 1.83]) {
    for (const deg of [22, 27, 35, 41, 48, 60, 135]) {
      for (const every of [8, 16]) FLICKS.push({ len, ms: len / speed, steps: Math.max(3, Math.round(len / speed / every)), deg });
    }
  }
}

test('every vine flick to the left gives the mirror of the same flick to the right: lianas, trunks and ropes, refined and old rules, upright and sideways', () => {
  const bad: string[] = [];
  let lets = 0;
  for (const [vn, view] of Object.entries(VIEWS)) {
    for (const hold of ['swing', 'trunk', 'rope'] as Hold[]) {
      for (const refined of [true, false]) {
        for (const pre of ['none', 'lift', 'held'] as const) {
          for (const f of FLICKS) {
            const right = scene(view, hold, refined, pre, f, 1);
            const left = scene(view, hold, refined, pre, f, -1);
            if (right.includes('jump:1') || right.includes('jump:0')) lets++;
            if (JSON.stringify(mirror(right)) !== JSON.stringify(left)) {
              bad.push(`${vn} ${hold} ${refined ? 'refined' : 'old'} ${pre} ${f.len}px/${Math.round(f.ms)}ms/${f.steps} ${f.deg}deg:\n  right ${right.join(' ')}\n  left  ${left.join(' ')}`);
            }
          }
        }
      }
    }
  }
  assert.deepEqual(bad, [], `${bad.length} flicks did not mirror:\n${bad.slice(0, 8).join('\n')}`);
  assert.ok(lets > 100, `the flicks let go (${lets})`);
});

test("the QA rig's lone flick up and to either side lets go at once on a liana, a trunk and a rope, refined and old, upright and sideways", () => {
  for (const [vn, view] of Object.entries(VIEWS)) {
    for (const hold of ['swing', 'trunk', 'rope'] as Hold[]) {
      for (const refined of [true, false]) {
        for (const pre of ['none', 'lift'] as const) {
          for (const side of [1, -1] as const) {
            const log = scene(view, hold, refined, pre, { len: 80, ms: 60, steps: 3, deg: 35 }, side);
            const jumps = log.filter((l) => l.startsWith('jump:'));
            assert.equal(jumps.length, 1, `${vn} ${hold} ${refined ? 'refined' : 'old'} ${pre} ${side > 0 ? 'up-right' : 'up-left'}: ${log.join(' ')}`);
            if (hold !== 'rope' && refined) assert.equal(jumps[0], `jump:${side}`, `${vn} ${hold}: it leans ${side}`);
          }
        }
      }
    }
  }
});

test("1-6 in the real engine: after a pump and a lift, the QA rig's flick up-left lets go exactly as its flick up-right does, at any moment of the swing, upright and sideways", () => {
  for (const [vn, view] of Object.entries(VIEWS)) {
    for (const side of [1, -1] as const) {
      for (let phase = 0; phase < 57; phase += 7) {
        const r = new RealPlay('1-6', 1);
        const v = r.vines.find((q) => q.vineType !== 'tree_climb')!;
        const ledge = r.platforms.filter((p) => p.x + p.width < v.x && Math.abs(p.y - 580) < 1).sort((a, b) => b.x - a.x)[0];
        for (let i = 0; i < 30 * 8 && !r.p.isVineSwinging; i++) r.frame({ right: true, press: r.p.grounded && r.p.x > ledge.x + ledge.width - 40, jump: !r.p.grounded });
        const held = { left: false, right: false, up: false, down: false };
        let press = false;
        let presses = 0;
        const sink: GestureSink = {
          move: (d) => { held.left = d === 'left'; held.right = d === 'right'; },
          duck: () => {},
          jumpPress: (lean) => { press = true; presses++; r.input.state.jumpLean = lean ?? 0; },
          jumpRelease: () => {}, punch: () => {}, kick: () => {}, mega: () => {},
          climb: (d) => { held.up = d < 0; held.down = d > 0; },
          feedback: () => {},
        };
        const g = new TouchGestures(sink, () => view.w, {
          assist: () => true, air: () => false, refined: () => true, kickNear: () => false,
          onVine: () => r.p.isVineSwinging || r.p.climbing, onSwing: () => !!r.p.isVineSwinging, onRope: () => false,
        });
        let now = 5000;
        let acc = 0;
        const run = (ms: number) => {
          const end = now + ms;
          while (now < end) {
            const d = Math.min(10, end - now);
            now += d;
            acc += d;
            if (Math.floor(now / 30) !== Math.floor((now - d) / 30)) g.tick(now);
            if (acc >= 33) {
              acc -= 33;
              r.frame({ ...held, press });
              press = false;
            }
          }
        };
        // a pump to the right (the rig's "steer right 800"), lifted
        const sx = Math.round(view.w * 0.18);
        const sy = Math.round(view.h * 0.72);
        let x = sx;
        g.down(1, x, sy, now);
        run(33);
        for (let k = 1; k <= 4; k++) {
          x = Math.round(x + (sx + 70 - x) / (5 - k));
          g.move(1, x, sy, now);
          run(25);
        }
        run(800);
        g.up(1, x, sy, now);
        run(33 + phase * 33);
        assert.ok(r.p.isVineSwinging, `${vn} phase ${phase}: on the liana before the flick`);
        let ax = Math.round(view.w * 0.78);
        let ay = Math.round(view.h * 0.62);
        g.down(2, ax, ay, now);
        for (let k = 1; k <= 3; k++) {
          run(20);
          ax += (side * 0.574 * 80) / 3;
          ay += (-0.819 * 80) / 3;
          g.move(2, ax, ay, now);
        }
        run(20);
        g.up(2, ax, ay, now);
        run(33 * 15);
        const what = `${vn} flick ${side > 0 ? 'up-right' : 'up-left'} phase ${phase}: ${presses} presses, swinging ${r.p.isVineSwinging}, vx ${Math.round(r.p.vx)}`;
        assert.equal(presses, 1, what);
        assert.ok(!r.p.isVineSwinging && r.p.facing === side, what);
      }
    }
  }
});
