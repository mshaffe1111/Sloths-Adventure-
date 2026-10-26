/**
 * The vine follow-ups from the QA team (2026-10-26), after the vine fix (only a clear up-forward flick lets go) passed:
 *
 *  1. On 1-6, climbing down a liana lowered his feet past the corner of the raised ledge beside it, and the automatic landing set him
 *     down there in the middle of a pump: no jump press, but players read it as the vine letting go. It now lands only when he plausibly
 *     wants off (physics.ts swingLanding): steering toward the ledge, or hands off at the end of a stroke, never while pumping.
 *  2. A one-thumb diagonal flick ignored its own direction: after a pump to the right a flick up and LEFT leaped right, and a flick up
 *     and right while he faced left threw him backward. A flick that leans 20 degrees or more now leaps the way it leans.
 *  3. "A swinging vine!" came only after his first let-go: it was measured to the vine's middle, a gap card just before the vine took
 *     its place and the breather after it, and it would not open while he swung. It now comes before he first needs it, old look and new.
 *
 * Touch rules are checked with the phone upright and sideways (Matt's 498 x 1034 Android, both ways round); the engine runs the real
 * stages (realPlay.ts), the camera framed upright and sideways for the lessons.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, type Pad } from './realPlay.ts';
import { TouchGestures, TUNING, type GestureSink } from './touchGestures.ts';
import { inSweetSpot, SWING_LAND, swingLanding } from './physics.ts';
import { lessonDotLine, pickLesson, type LessonId, type LessonScene } from './lessons.ts';
import { landingAhead } from './cameraFollow.ts';
import type { Platform, Vine } from './types.ts';

// ───────────────────────────── 1. the automatic landing ─────────────────────────────

type Mode = 'pump' | 'pumpDown' | 'off' | 'offDown' | 'toward';

/** the first liana on a stage (1-6's first, over the soft moss) and the raised ledge left of it, where he came from */
function firstVine(r: RealPlay): { v: Vine; ledge: Platform } {
  const v = r.vines.find((q) => q.vineType !== 'tree_climb')!;
  const ledge = r.platforms.filter((p) => p.x + p.width < v.x && Math.abs(p.y - 580) < 1).sort((a, b) => b.x - a.x)[0];
  return { v, ledge };
}

/**
 * swing on `v` for `secs` seconds: pumping (a steer held the way the swing goes, as a thumb pumping it does), hands off, or steering
 * toward the ledge; `Down` modes also climb down the whole time (from `len`). Returns how it ended, and how often the old rule (feet
 * within 14 px of a platform top on the way down) would have set him down meanwhile.
 */
function swingFor(r: RealPlay, v: Vine, mode: Mode, len: number, secs: number, toward: -1 | 1 = -1) {
  r.swing(v, { angle: 0, omega: 2.5, len });
  let oldRule = 0;
  for (let i = 0; i < Math.round(secs * 30); i++) {
    const om = r.p.swingAngularVelocity ?? 0;
    const pad: Pad = {};
    if (mode === 'pump' || mode === 'pumpDown') pad[om >= 0 ? 'right' : 'left'] = true;
    if (mode === 'toward') pad[toward < 0 ? 'left' : 'right'] = true;
    if (mode === 'pumpDown' || mode === 'offDown') pad.down = true;
    r.frame(pad);
    const p = r.p;
    if (!p.isVineSwinging) return { swinging: false, t: i / 30, oldRule };
    if (r.platforms.some((q) => p.x >= q.x - 10 && p.x <= q.x + q.width + 10 && Math.abs(p.y - q.y) < 14 && p.vy >= 0)) oldRule++;
  }
  return { swinging: true, t: secs, oldRule };
}

test('1-6: pumping, hands off or climbing down a liana beside the raised ledge never sets him down on its corner', () => {
  let oldWould = 0;
  for (const seed of [1, 2, 3, 4]) {
    for (const mode of ['pump', 'pumpDown', 'off', 'offDown'] as Mode[]) {
      const r = new RealPlay('1-6', seed);
      const { v } = firstVine(r);
      // (at full length his feet pass within a few px of the ledge's corner; the Down modes climb down to it, as the QA bot did)
      const len = mode.endsWith('Down') ? 250 : v.bottomY - v.topY;
      const out = swingFor(r, v, mode, len, 12);
      oldWould += out.oldRule;
      assert.ok(out.swinging, `1-6 seed ${seed} ${mode}: let go of the liana after ${out.t.toFixed(2)} s at x${Math.round(r.p.x)} y${Math.round(r.p.y)}`);
      assert.equal(Math.round(r.p.swingLength ?? 0), Math.round(v.bottomY - v.topY), `seed ${seed} ${mode}: he is at the vine's full length`);
    }
  }
  assert.ok(oldWould > 0, 'the old landing rule would have set him down in these swings (the test covers the case QA found)');
});

test('1-6: steering toward the ledge while the swing carries him past it still puts him on it, and he stays there', () => {
  for (const seed of [1, 2, 3, 4]) {
    const r = new RealPlay('1-6', seed);
    const { v, ledge } = firstVine(r);
    const out = swingFor(r, v, 'toward', v.bottomY - v.topY, 6);
    assert.ok(!out.swinging && out.t < 2.5, `seed ${seed}: still swinging after ${out.t.toFixed(2)} s`);
    r.wait(1);
    const p = r.p;
    assert.ok(p.grounded && Math.abs(p.y - ledge.y) < 1 && p.x >= ledge.x && p.x <= ledge.x + ledge.width, `seed ${seed}: at x${Math.round(p.x)} y${Math.round(p.y)} grounded ${p.grounded}`);
    assert.ok(!r.died, `seed ${seed}: he fell`);
  }
});

test("the control test's swing stretch: pumping its lianas at full length never sets him down on a ledge beside them", async () => {
  const loc = (globalThis as unknown as { location: { hash: string; search: string } }).location;
  const was = { hash: loc.hash, search: loc.search };
  let checked = 0;
  try {
    loc.hash = '#ctest';
    for (let mix = 1; mix <= 60 && checked < 6; mix++) {
      loc.search = `?mix=${mix}`;
      const probe = new RealPlay('1-2', 1);
      const beats = ((probe.e.proto?.beats ?? []) as Array<[number, number, string]>).filter((b) => b[2] === 'Swing');
      if (!beats.length) continue;
      const [x0, x1] = beats[0];
      const lianas = probe.vines.filter((v) => v.vineType !== 'tree_climb' && v.x >= x0 && v.x <= x1).map((v) => v.id);
      for (const id of lianas) {
        for (const mode of ['pump', 'pumpDown'] as Mode[]) {
          const r = new RealPlay('1-2', 1);
          const v = r.vines.find((q) => q.id === id)!;
          const out = swingFor(r, v, mode, mode === 'pump' ? v.bottomY - v.topY : 250, 8);
          if (!out.swinging) {
            // the only landing allowed while pumping: a floor under the vine he climbed down onto
            const on = r.platforms.find((q) => Math.abs(r.p.y - q.y) < 1 && r.p.x >= q.x - 10 && r.p.x <= q.x + q.width + 10);
            assert.ok(on && v.x >= on.x - 10 && v.x <= on.x + on.width + 10, `mix ${mix} liana ${id} ${mode}: set down beside the vine at x${Math.round(r.p.x)} y${Math.round(r.p.y)}`);
          }
        }
        checked++;
      }
    }
  } finally {
    loc.hash = was.hash;
    loc.search = was.search;
  }
  assert.ok(checked >= 2, `found ${checked} control-test lianas`);
});

test('a floor under the vine is still landed on as he climbs down onto it, pumping or not', () => {
  for (const mode of ['pumpDown', 'offDown'] as Mode[]) {
    const r = new RealPlay('1-1', 1);
    const floor = { id: 9001, x: 850, y: 560, width: 300, height: 40, type: 'solid' } as Platform;
    const vine = { id: 9002, x: 1000, topY: 200, bottomY: 600, vineType: 'swing_liana' } as Vine;
    r.bare([floor], [vine]);
    const out = swingFor(r, vine, mode, 250, 6);
    assert.ok(!out.swinging && r.p.grounded && Math.abs(r.p.y - floor.y) < 1, `${mode}: ${JSON.stringify(out)} y${Math.round(r.p.y)}`);
  }
});

test('swingLanding: a ledge beside the vine only when he steers toward it or the swing is at the end of its stroke', () => {
  const left = { x: 500, width: 380 };
  const fast = { angle: -0.45, omega: 2.1 };
  const slow = { angle: -0.78, omega: 0.4 };
  assert.equal(swingLanding(fast, 1070, left, 1, 5), null, 'pumping away from it');
  assert.equal(swingLanding(fast, 1070, left, 0, 5), null, 'hands off, the swing sweeping past its corner');
  assert.equal(swingLanding(fast, 1070, left, -1, 5), 'land', 'steering toward it');
  assert.equal(swingLanding(fast, 1070, left, -1, -30), 'step', 'steering toward it, a little above it: steps off onto it');
  assert.equal(swingLanding(fast, 1070, left, -1, -SWING_LAND.reach - 1), null, 'too far above');
  assert.equal(swingLanding(slow, 1070, left, 0, 5), 'land', 'hands off at the end of the stroke');
  assert.equal(swingLanding(fast, 1070, { x: 900, width: 300 }, 1, 5), 'land', 'a floor under the vine, pumping');
});

// ───────────────────────────── 2. a flick leaps the way it leans ─────────────────────────────

const VIEWS = {
  upright: { w: 498, thumbs: [{ x: 150, y: 760 }, { x: 330, y: 760 }] },
  sideways: { w: 1034, thumbs: [{ x: 220, y: 330 }, { x: 820, y: 330 }] },
} as const;

function rig(w: number) {
  const log: string[] = [];
  const sink: GestureSink = {
    move: (d) => log.push(`move:${d}`),
    duck: (on) => log.push(`duck:${on}`),
    jumpPress: (lean) => log.push(`jump:${lean ?? 0}`),
    jumpRelease: () => log.push('jumpUp'),
    punch: () => log.push('punch'),
    kick: () => log.push('kick'),
    mega: () => log.push('mega'),
    climb: (d) => log.push(`climb:${d}`),
    feedback: () => {},
  };
  const g = new TouchGestures(sink, () => w, {
    assist: () => true, air: () => false, refined: () => true, kickNear: () => false, onVine: () => true, onSwing: () => true, onRope: () => false,
  });
  return { g, log, jumps: () => log.filter((l) => l.startsWith('jump:')) };
}
const rad = (d: number) => (d * Math.PI) / 180;

/** one thumb: down, pumps the swing toward `pump` (a long slide, there and part way back, then there again), then flicks up leaning `lean` degrees */
function pumpThenFlick(w: number, x: number, y: number, pump: -1 | 1, lean: number, len = 110, speed = 1) {
  const t = rig(w);
  let now = 1000;
  let fx = x;
  let fy = y;
  t.g.down(1, fx, fy, now);
  const to = (dx: number, dy: number, ms: number) => {
    const n = Math.max(1, Math.round(ms / 11));
    const [x0, y0] = [fx, fy];
    for (let k = 1; k <= n; k++) {
      now += ms / n;
      t.g.move(1, x0 + (dx * k) / n, y0 + (dy * k) / n, now);
      if (k % 9 === 0) t.g.tick(now);
    }
    fx = x0 + dx;
    fy = y0 + dy;
  };
  to(pump * 110, 0, 420);
  to(-pump * 60, 6, 300);
  to(pump * 70, -4, 320);
  now += 60;
  to(Math.sin(rad(lean)) * len, -Math.cos(rad(lean)) * len, len / speed);
  t.g.up(1, fx, fy, now + 11);
  return t;
}

test('one thumb: after a pump to the right a flick up and left leaps LEFT, after a pump to the left a flick up and right leaps RIGHT, upright and sideways', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const th of v.thumbs) {
      // (a 22 degree flick thrown the instant a stroke the other way ends reads as climbing: its sideways part is cancelled by the stroke)
      for (const lean of [25, 30, 35, 41, 48]) {
        for (const speed of [0.6, 1, 1.8]) {
          for (const pump of [1, -1] as const) {
            const against = -pump * lean;
            const t = pumpThenFlick(v.w, th.x, th.y, pump, against, 120, speed);
            assert.deepEqual(t.jumps(), [`jump:${-pump}`], `${view} x${th.x} pump ${pump}, flick ${against} deg at ${speed} px/ms: ${t.log.join(' ')}`);
            const along = pumpThenFlick(v.w, th.x, th.y, pump, pump * lean, 120, speed);
            assert.deepEqual(along.jumps(), [`jump:${pump}`], `${view} x${th.x} pump ${pump}, flick ${pump * lean} deg: ${along.log.join(' ')}`);
          }
        }
      }
    }
  }
});

test('a straight-up flick after a pump still climbs the vine and carries no lean', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const pump of [1, -1] as const) {
      const t = pumpThenFlick(v.w, v.thumbs[0].x, v.thumbs[0].y, pump, 3);
      assert.deepEqual(t.jumps(), [], `${view} pump ${pump}: ${t.log.join(' ')}`);
      assert.ok(t.log.includes('climb:-1'), `${view}: it climbs`);
    }
  }
});

test('the other thumb: a flick up that leans 20 degrees or more carries its lean, a nearly straight one does not', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const [lean, want] of [[35, 1], [-35, -1], [24, 1], [-24, -1], [8, 0], [-8, 0], [0, 0]] as const) {
      const t = rig(v.w);
      // the steering thumb holds right (a pump just ended there)
      t.g.down(1, v.thumbs[0].x, v.thumbs[0].y, 1000);
      for (let k = 1; k <= 10; k++) t.g.move(1, v.thumbs[0].x + k * 8, v.thumbs[0].y, 1000 + k * 12);
      const a = v.thumbs[1];
      t.g.down(2, a.x, a.y, 1200);
      for (let k = 1; k <= 6; k++) t.g.move(2, a.x + Math.sin(rad(lean)) * 15 * k, a.y - Math.cos(rad(lean)) * 15 * k, 1200 + k * 11);
      t.g.up(2, a.x + Math.sin(rad(lean)) * 90, a.y - Math.cos(rad(lean)) * 90, 1280);
      assert.deepEqual(t.jumps(), [`jump:${want}`], `${view} ${lean} degrees: ${t.log.join(' ')}`);
    }
    // a quick sideways flick of the other thumb on a swing leaps the way it was flicked
    for (const side of [1, -1]) {
      const t = rig(v.w);
      t.g.down(1, v.thumbs[0].x, v.thumbs[0].y, 1000);
      for (let k = 1; k <= 10; k++) t.g.move(1, v.thumbs[0].x - side * k * 8, v.thumbs[0].y, 1000 + k * 12);
      const a = v.thumbs[1];
      t.g.down(2, a.x, a.y, 1200);
      for (let k = 1; k <= 5; k++) t.g.move(2, a.x + side * 18 * k, a.y, 1200 + k * 11);
      t.g.up(2, a.x + side * 90, a.y, 1270);
      assert.deepEqual(t.jumps(), [`jump:${side}`], `${view} sideways ${side}: ${t.log.join(' ')}`);
    }
  }
  assert.ok(Math.abs(TUNING.leanSlant - Math.tan(rad(20))) < 0.01, 'the lean counts from 20 degrees');
});

/** on a liana in `bare` world, in a given swing state, facing `facing`, then one frame: steer held, and a press that leaned `lean` */
function letGo(s: { angle: number; omega: number }, facing: -1 | 1, steer: -1 | 0 | 1, lean: -1 | 0 | 1) {
  const r = new RealPlay('1-1', 1);
  const vine = { id: 9002, x: 1000, topY: 200, bottomY: 600, vineType: 'swing_liana' } as Vine;
  r.bare([{ id: 9001, x: 0, y: 2000, width: 3000, height: 40, type: 'solid' } as Platform], [vine]);
  r.swing(vine, { ...s, len: 300 });
  r.p.facing = facing;
  r.input.state.jumpLean = lean;
  const pad: Pad = { press: true };
  if (steer) pad[steer < 0 ? 'left' : 'right'] = true;
  r.frame(pad);
  // a press a beat early waits for the sweet spot: carry on, hands off, until he has let go
  for (let i = 0; i < 30 && r.p.isVineSwinging; i++) r.frame();
  return r;
}

test('letting go of a liana leaps the way the flick leaned, even against the held steer and the way he faces', () => {
  // swinging LEFT through the sweet spot for a leap left, facing right with the steer still held right after a pump that way
  const goingLeft = { angle: -0.2, omega: -2.4 };
  assert.ok(inSweetSpot({ ...goingLeft, len: 300 }, -1));
  let r = letGo(goingLeft, 1, 1, -1);
  assert.ok(!r.p.isVineSwinging && r.p.vx < -250 && r.p.facing === -1 && r.e.launched, `lean left: vx ${Math.round(r.p.vx)} facing ${r.p.facing}`);
  // with no lean (a key, the pad, a straight-up flick) the held steer decides, as before
  // (toward the right while the swing goes left: he only lets go, carried the way the vine was going, no leap)
  r = letGo(goingLeft, 1, 1, 0);
  assert.ok(!r.p.isVineSwinging && r.p.facing === 1 && !r.e.launched, `no lean: vx ${Math.round(r.p.vx)} facing ${r.p.facing}`);
  // facing left, swinging right: a flick up and right leaps right (it used to throw him backward)
  const goingRight = { angle: 0.2, omega: 2.4 };
  r = letGo(goingRight, -1, 0, 1);
  assert.ok(!r.p.isVineSwinging && r.p.vx > 250 && r.p.facing === 1, `lean right: vx ${Math.round(r.p.vx)} facing ${r.p.facing}`);
  r = letGo(goingRight, -1, 0, 0);
  assert.ok(!r.p.isVineSwinging && r.p.facing === -1, `no lean, facing left: facing ${r.p.facing}`);
  // a press a beat before the sweet spot for its lean is held until he gets there, then leaps that way
  r = letGo({ angle: 0.5, omega: -1.8 }, 1, 1, -1);
  assert.ok(!r.p.isVineSwinging && r.p.vx < -250, `early press leaning left: vx ${Math.round(r.p.vx)}`);
});

test('leaping off a trunk follows the flick too', () => {
  for (const [facing, lean] of [[-1, 1], [1, -1]] as const) {
    const r = new RealPlay('1-1', 1);
    const trunk = { id: 9003, x: 1000, topY: 200, bottomY: 600, vineType: 'tree_climb' } as Vine;
    r.bare([{ id: 9001, x: 0, y: 600, width: 3000, height: 40, type: 'solid' } as Platform], [trunk]);
    r.climb(trunk, 400);
    r.p.facing = facing;
    r.frame();
    r.input.state.jumpLean = lean;
    r.frame({ press: true });
    assert.ok(!r.p.climbing && Math.sign(r.p.vx) === lean, `facing ${facing}, lean ${lean}: vx ${Math.round(r.p.vx)}`);
  }
});

// ───────────────────────────── 3. the swing lesson comes before he needs it ─────────────────────────────

const none: ReadonlySet<LessonId> = new Set();
const scene = (o: Partial<LessonScene> = {}): LessonScene => ({
  px: 1000, py: 580, view: { x0: 700, x1: 1400, y0: 100, y1: 900 }, enemies: [], collectibles: [], vines: [], platforms: [], checkpoints: [], rivers: [], ...o,
});

test("pickLesson: a liana is near by the part he can catch, not its middle, and comes before the gap it hangs over", () => {
  // a tall liana: its middle 250 px above him on the ground, its lower end at his height
  const tall = { x: 1250, topY: 80, bottomY: 580, vineType: 'swing_liana' };
  assert.equal(pickLesson(scene({ vines: [tall] }), none), 'swing');
  // as far ahead as it can be caught from (340 px plus a hand's reach)
  assert.equal(pickLesson(scene({ vines: [{ ...tall, x: 1395 }] }), none), 'swing');
  assert.equal(pickLesson(scene({ vines: [{ ...tall, x: 1460 }], view: { x0: 700, x1: 1600, y0: 100, y1: 900 } }), none), null, 'too far yet');
  // a liana high above a branch he cannot reach it from is not "here"
  assert.equal(pickLesson(scene({ vines: [{ x: 1200, topY: 0, bottomY: 300, vineType: 'swing_liana' }] }), none), null);
  // the ground breaks off ahead, and a liana hangs over the gap: the swing's lesson, not the gap's
  const ground = (x: number, w: number) => ({ x, y: 580, width: w, type: 'solid' });
  const gapScene = scene({ platforms: [ground(600, 500), ground(1300, 400)], vines: [{ x: 1200, topY: 200, bottomY: 610, vineType: 'swing_liana' }] });
  assert.equal(pickLesson(gapScene, none), 'swing');
  assert.equal(pickLesson(gapScene, new Set<LessonId>(['swing'])), null, 'the gap a vine hangs over is crossed on the vine');
  assert.equal(pickLesson(scene({ platforms: [ground(600, 500), ground(1300, 400)] }), none), 'gap', 'a bare gap still gets its lesson');
});

test('the new look: the swing lesson said while he is already on the vine starts at letting go, not at grabbing it', () => {
  assert.equal(lessonDotLine('swing', 'screen')?.text, 'Flick up into the vine to grab it.');
  assert.equal(lessonDotLine('swing', 'screen', true)?.text, 'Flick up as you swing forward to leap.');
  assert.equal(lessonDotLine('swing', 'screen', true)?.move, 'leap');
  assert.equal(lessonDotLine('swing', 'pad', true)?.text, 'Press Jump as you swing forward.');
  assert.equal(lessonDotLine('swing', 'keys', true)?.text, 'Press Space as you swing forward.');
});

/**
 * 1-6 from the start, a fresh player (no lesson seen yet), the real camera upright or sideways: run to the first liana, jump for it,
 * swing, let go in the sweet spot. When did the swing lesson come, and when did he first let go?
 */
function firstSwing(seed: number, w: number, h: number, newLook: boolean) {
  const r = new RealPlay('1-6', seed);
  const e = r.e;
  // the camera and the lessons run here (realPlay.ts skips them as cosmetic)
  delete e.updateCamera;
  delete e.lessonTick;
  e.viewCssW = w;
  e.viewCssH = h;
  e.applyZoom();
  e.lessonSeen = new Set();
  e.newLook = newLook;
  r.safe = false;
  r.p.invincibleTimer = 0;
  const shown: Array<{ id: string; t: number }> = [];
  e.pause = () => {};
  e.callbacks.onLesson = (id: string) => {
    shown.push({ id, t: e.gameTime });
    // the old look's card is read and closed at once
    if (e.lessonOpen) e.lessonClosed();
  };
  const { ledge } = firstVine(r);
  let letGoAt = -1;
  let grabAt = -1;
  for (let i = 0; i < 30 * 12 && letGoAt < 0; i++) {
    const p = r.p;
    const sw = { angle: p.swingAngle ?? 0, omega: p.swingAngularVelocity ?? 0, len: p.swingLength ?? 100 };
    // (hold on for a swing or two first, the way a player gets the feel of it)
    const press = p.grounded ? p.x > ledge.x + ledge.width - 40 : p.isVineSwinging && e.gameTime - grabAt > 2 && inSweetSpot(sw, 1) && sw.angle > 0.3;
    const was = p.isVineSwinging;
    r.frame({ right: true, press, jump: !p.grounded && !p.isVineSwinging });
    if (!was && r.p.isVineSwinging && grabAt < 0) grabAt = e.gameTime;
    if (was && !r.p.isVineSwinging) letGoAt = e.gameTime;
  }
  return { swing: shown.find((s) => s.id === 'swing')?.t ?? Infinity, grabAt, letGoAt, shown };
}

test('1-6, a fresh player: "A swinging vine!" (old look) and its Dot lines (new look) come before his first let-go, upright and sideways', () => {
  for (const seed of [1, 2, 3, 4]) {
    for (const [view, w, h] of [['upright', 412, 915], ['sideways', 915, 412]] as const) {
      for (const newLook of [false, true]) {
        const o = firstSwing(seed, w, h, newLook);
        const what = `seed ${seed} ${view} ${newLook ? 'new look' : 'old look'}: ${o.shown.map((s) => `${s.id}@${s.t.toFixed(1)}`).join(' ')}, grab ${o.grabAt.toFixed(1)}, let go ${o.letGoAt.toFixed(1)}`;
        assert.ok(o.letGoAt > 0, `${what}: never let go`);
        assert.ok(o.swing < o.letGoAt, what);
        // (and within a second of the grab at the latest: pumping and letting go are needed from then on)
        assert.ok(o.swing <= o.grabAt + 1, what);
      }
    }
  }
});

// ───────────────────────────── 4. the camera shows the liana he jumps for ─────────────────────────────

test('the look across a gap shows the liana over it, not the floor of the drop under it', () => {
  const ledge = { x: 0, y: 580, width: 886 };
  const moss = { x: 826, y: 710, width: 542 };
  const far = { x: 1308, y: 580, width: 750 };
  const land = landingAhead(860, 1, ledge, [ledge, moss, far], [{ x: 1072, topY: 211, bottomY: 610 }])!;
  assert.ok(land.x0 <= 1072 && land.x1 >= 1072, `the box ${JSON.stringify(land)} is round the liana`);
  // with no liana, the far ledge or the floor is shown as before
  assert.ok(landingAhead(860, 1, ledge, [ledge, moss, far]));
});
