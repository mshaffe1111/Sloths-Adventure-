// The FLOOD CLOCK (flood.ts; reference/design/2-8.md NEW 1) and the little ones meeting it (follow.ts; 2-8.md NEW 2), planted on toys:
// floodFaults GREEN on the design's own flown leg and RED with the close 3 s early (2-8.md:59); the clock starts only on its start cage,
// never resets and turns only the low road deep; a little one paddling in the low road at the close is set on its near bank and rejoins
// (RED without the set-back: it is left in deep water), and none walks into deep water (RED with the wall off); a step down of 60 px that
// he walks off is a walk for the line, never a wait (2-8.md:59, Pushback 5).
import test from 'node:test';
import assert from 'node:assert/strict';
import { FloodClock, floodFaults, floodSurface, floodTailOff, highRoadFaults, type Flood, type FloodWater } from './flood.ts';
import { join, newTrail, record, rejoin, setOnBank, stepLine, wallCap, type Follower } from './follow.ts';
import { FollowPlay } from './followPlay.ts';
import type { Platform } from './types.ts';
import { W2_FLOOD, W2_FOLLOW } from './gen2/worlds/w2.ts';

const LIP = 500;
/** a toy low road: a dip 400 px wide between banks at LIP, its water starting 60 px down, paddling at 20 px under the lips */
const low = (close: number): FloodWater => ({ river: 1, x0: 1000, x1: 1400, y0: LIP + 60, y1: LIP + 20, seconds: close, lip: LIP, deep: { y: LIP - 30, near: { x: 990, y: LIP } } });
const dip: FloodWater = { river: 0, x0: 600, x1: 700, y0: LIP + 60, y1: LIP + 20, seconds: 26, lip: LIP };
const laid = (px: number, easy: boolean, close = easy ? W2_FLOOD.close.easy : W2_FLOOD.close.normal): Flood => ({
  start: { id: 7, x: 200, y: LIP }, close, waters: [dip, low(close)], px,
  tailOff: floodTailOff(W2_FLOOD, px, easy), spare: easy ? W2_FLOOD.spare.easy : W2_FLOOD.spare.normal,
});

test('floodFaults: GREEN on the flown leg (2,000 + 1,400 px) both settings; RED with T_CLOSE 3 s early, by name', () => {
  for (const easy of [false, true]) {
    assert.deepEqual(floodFaults(laid(W2_FLOOD.flown.px, easy)), [], `${easy ? 'Easy' : 'Normal'}: the design's own leg is fair`);
    const early = laid(W2_FLOOD.flown.px, easy, (easy ? W2_FLOOD.close.easy : W2_FLOOD.close.normal) - 3);
    const f = floodFaults(early);
    assert.equal(f.length, 1, `${easy ? 'Easy' : 'Normal'} 3 s early: ${f.join('; ')}`);
    assert.match(f[0], /no tier beats it \((2\.9|3) s short\)/);
  }
  // (a longer laid leg than the flights' is refused at the same close: the rule reads the laid route, not the design's table)
  assert.equal(floodFaults(laid(W2_FLOOD.flown.px + 400, false)).length, 1, 'Normal: 400 px more low road at 26 s is refused');
  // (one water turns deep, no other rises over its banks)
  const two = laid(W2_FLOOD.flown.px, false);
  assert.match(floodFaults({ ...two, waters: [{ ...dip, deep: low(26).deep }, low(26)] }).join(';'), /2 waters turn deep/);
  assert.match(floodFaults({ ...two, waters: [{ ...dip, y1: LIP - 10 }, low(26)] }).join(';'), /10 px over its banks/);
});

test('FloodClock: only the start cage starts it, once; the dip stops at paddling depth, the low road turns deep at the close; no reset', () => {
  const f = laid(W2_FLOOD.flown.px, false);
  const c = new FloodClock(f);
  assert.equal(c.freed(3, 10), false, 'another cage does not start it');
  assert.deepEqual(c.step(40).levels, [dip.y0, low(26).y0], 'nothing rises before the start');
  assert.equal(c.freed(7, 50), true);
  assert.equal(c.freed(7, 60), false, 'freed once');
  const mid = c.step(63);
  assert.ok(mid.levels[0] < dip.y0 && mid.levels[0] > dip.y1, 'rising');
  assert.deepEqual(mid.closed, []);
  const at = c.step(50 + 26);
  assert.equal(at.levels[0], dip.y1, 'the dip stops at paddling depth');
  assert.equal(at.levels[1], f.waters[1].deep!.y, 'the low road is deep at the close');
  assert.deepEqual(at.closed, [f.waters[1]], 'it turns once');
  assert.deepEqual(c.step(200).closed, [], 'and only once');
  assert.equal(c.step(1000).levels[0], dip.y1, 'nothing drains');
  assert.equal(floodSurface(f, f.waters[0], undefined), dip.y0);
});

test('highRoadFaults: steps of 60 px are walkable by the line; a 100 px step or a missing road is refused', () => {
  const span = { x0: 1000, x1: 1400, from: { x: 990, y: LIP }, to: { x: 1410, y: LIP } };
  const steps = [{ x: 990, w: 60, y: LIP - 60 }, { x: 1050, w: 300, y: LIP - 120 }, { x: 1350, w: 60, y: LIP - 60 }];
  assert.deepEqual(highRoadFaults(steps, span, 60, 120), []);
  assert.match(highRoadFaults([{ ...steps[0], y: LIP - 100 }, ...steps.slice(1)], span, 60, 120).join(";"), /no piece a step of at most 60 px/);
  assert.match(highRoadFaults([], span, 60, 120).join(';'), /no high road/);
});

test('followers meet the flood: one mid-dip at the close is set on the near bank and rejoins; none walks into deep water', () => {
  // (a little one paddling in the middle of the low road when it turns deep)
  const t = newTrail(900, LIP, W2_FOLLOW.step);
  const line: Follower[] = [];
  const f = join(line, 'otter', { x: 900, y: LIP }, { x: 900, y: LIP });
  const flood = laid(W2_FLOOD.flown.px, false);
  const w = flood.waters[1];
  for (let x = 900; x <= 1600; x += 4) record(t, { x, y: x > w.x0 && x < w.x1 ? LIP + 60 : LIP, grounded: true }, 'walk');
  // (it walks to the middle of the low road and paddles there)
  for (let i = 0; i < 300 && f.x < 1200; i++) stepLine(t, line, 60, W2_FOLLOW.gap, 1 / 30, (px) => (px > w.x0 && px < w.x1 ? w.y1 : null));
  assert.ok(f.paddle && f.x > w.x0 && f.x < w.x1, `it paddles in the low road at x ${Math.round(f.x)}`);
  // (RED without the set-back: at the close it is left where it paddles, in water that is now deep: lost)
  const clock = new FloodClock(flood);
  clock.freed(flood.start.id, 0);
  const deepY = clock.step(flood.close).levels[1];
  assert.ok(f.x > w.x0 && f.x < w.x1 && deepY < f.y + 1, 'RED without the set-back: it is in the deep water at the close');
  // (the close: set on the near bank, sitting)
  setOnBank(f, w.deep!.near);
  assert.equal(f.state, 'spooked');
  assert.ok(f.sat && f.x === w.deep!.near.x && f.y === w.deep!.near.y, 'on the near bank, sitting in the reeds');
  // (it waits: the line's step does not move it; he comes back within 60 px and it runs to the end of the line)
  stepLine(t, line, 60, W2_FOLLOW.gap, 1 / 30);
  assert.equal(f.x, w.deep!.near.x, 'it waits on the bank');
  assert.equal(rejoin(line, f, w.deep!.near.x + 200, W2_FOLLOW.rejoin), false, 'not from 200 px');
  assert.equal(rejoin(line, f, w.deep!.near.x + 50, W2_FOLLOW.rejoin), true, 'he came back within 60 px');
  assert.equal(f.sat, undefined);
  assert.equal(f.state, 'join', 'it runs to the end of the line');
});

test('the wall: a following one stops on the bank before deep water and goes on once it is not deep (RED with the wall off)', () => {
  const t = newTrail(0, LIP, W2_FOLLOW.step);
  for (let x = 0; x <= 1600; x += 4) record(t, { x, y: x > 1000 && x < 1400 ? LIP + 60 : LIP, grounded: true }, 'walk');
  const run = (wall: boolean) => {
    const line: Follower[] = [];
    const f = join(line, 'capy', { x: 0, y: LIP }, { x: 0, y: LIP });
    // (it follows from the trail's start: a joining one walks straight to the end of the line, which is beside him)
    f.state = 'follow';
    f.s = 0;
    let entered = false;
    for (let i = 0; i < 30 * 12; i++) {
      stepLine(t, line, W2_FOLLOW.pace.normal, W2_FOLLOW.gap, 1 / 30, undefined, 300, wall ? (px) => px > 1000 && px < 1400 : undefined);
      if (f.x > 1000 && f.x < 1400) entered = true;
    }
    return { f, entered };
  };
  const on = run(true);
  assert.equal(on.entered, false, 'GREEN: it never enters the deep water');
  assert.ok(on.f.x <= 1000 && on.f.x > 900, `it waits on the near bank (x ${Math.round(on.f.x)})`);
  assert.equal(run(false).entered, true, 'RED with the wall off: it walks into the deep water');
});

test('a step down of 60 px he walks off is a walk for the line, never a wait (2-8.md Pushback 5)', () => {
  const t = newTrail(0, LIP, W2_FOLLOW.step);
  for (let x = 0; x <= 200; x += 4) record(t, { x, y: LIP, grounded: true }, 'walk');
  // (he walks off the step's edge: in the air, falling 60 px, and lands)
  for (let k = 1; k <= 6; k++) record(t, { x: 200 + k * 6, y: LIP + k * 10, grounded: k === 6 }, 'walk');
  for (let x = 240; x <= 600; x += 4) record(t, { x, y: LIP + 60, grounded: true }, 'walk');
  assert.equal(t.held, false, 'no WAIT at the step');
  const line: Follower[] = [];
  const f = join(line, 'duck', { x: 0, y: LIP }, { x: 0, y: LIP });
  for (let i = 0; i < 30 * 6; i++) stepLine(t, line, W2_FOLLOW.pace.normal, W2_FOLLOW.gap, 1 / 30);
  assert.ok(f.x > 400 && f.y === LIP + 60, `it walked down the step with him (x ${Math.round(f.x)}, y ${Math.round(f.y)})`);
});

/**
 * The ENGINE's flood on a toy floor, stepped in the engine's order (engine.ts: the clock first, each water it closed handed to the line,
 * then the line's step; stage.deep = the clock's deepAt; the flood's water splash-back read LIVE as it rises): he frees five at the start
 * cage, which starts the clock, and walks through the low road to stand just past it; the line bunches behind him, the tail in the water.
 */
function engineFlood(setBack: boolean) {
  const flood = laid(W2_FLOOD.flown.px, false);
  // (deep is brim-full at its banks' lip, as the lay makes it: gen2/floodLay.ts)
  const w = (flood.waters[1] = { ...flood.waters[1], deep: { y: LIP, near: flood.waters[1].deep!.near } });
  const clock = new FloodClock(flood);
  let now = 0;
  let levels = flood.waters.map((q) => q.y0);
  const solid = (id: number, x: number, width: number, y: number) => ({ id, x, y, width, height: 200, type: 'solid' }) as Platform;
  const platforms = [solid(1, 0, w.x0, LIP), solid(2, w.x0, w.x1 - w.x0, LIP + 90), solid(3, w.x1, 3000, LIP)];
  const fp = new FollowPlay(W2_FOLLOW, false, {
    exitX: 9000, zones: [], covers: [], platforms,
    safeWater: [{ x0: w.x0, x1: w.x1, get y() { return levels[1]; } }],
    deep: (x, y) => clock.deepAt(x, y, now),
  }, { x: flood.start.x - 60, y: LIP });
  const kinds = ['duck', 'otter', 'capy', 'duck', 'otter'] as const;
  for (const k of kinds) fp.free(k, { x: flood.start.x, y: LIP - 40 }, { x: flood.start.x, y: LIP });
  assert.equal(clock.freed(flood.start.id, now), true, 'the start cage starts the clock');
  const stand = w.x1 + 60;
  let x = flood.start.x - 60;
  let midRise: { paddlers: number; off: number } | undefined;
  let setOn: Follower[] = [];
  for (let i = 1; i <= 30 * 32; i++) {
    now = i / 30;
    const st = clock.step(now);
    levels = st.levels;
    if (setBack) for (const q of st.closed) setOn = setOn.concat(fp.floodClosed(q));
    x = Math.min(stand, x + 150 / 30);
    const inWater = x > w.x0 && x < w.x1;
    fp.step(1 / 30, { x, y: inWater ? levels[1] : LIP, vy: 0, grounded: true }, undefined, () => 0.5);
    // (half way to the close the water is rising: every one paddling rides its LIVE surface)
    if (!midRise && now >= flood.close / 2) {
      const p = fp.line.filter((f) => f.paddle);
      midRise = { paddlers: p.length, off: Math.max(0, ...p.map((f) => Math.abs(f.y - levels[1]))) };
    }
  }
  const lost = fp.line.filter((f) => clock.deepAt(f.x, f.y, now));
  return { fp, w, lost, setOn, midRise: midRise!, levels, now };
}

test('the engine meets the flood (FollowPlay + FloodClock on a toy floor): at the close the tail in the low road is set on its near bank, none left in deep water', () => {
  const g = engineFlood(true);
  assert.ok(g.midRise.paddlers >= 1, `half way to the close the tail paddles (${g.midRise.paddlers})`);
  assert.ok(g.midRise.off < 1, `and rides the rising surface live (off by ${g.midRise.off.toFixed(2)} px)`);
  assert.equal(g.levels[1], g.w.deep!.y, 'the low road is deep (brim-full) at the end');
  assert.ok(g.setOn.length >= 1, `the close set ${g.setOn.length} on the near bank`);
  for (const f of g.setOn) assert.ok(f.state === 'spooked' && f.sat && f.x === g.w.deep!.near.x && f.y === g.w.deep!.near.y, 'each sits on the near bank, waiting for him');
  assert.equal(g.lost.length, 0, `GREEN: none in deep water (${g.lost.map((f) => Math.round(f.x)).join(', ')})`);
  // (the ones past the low road at the close stay with him; the ones set back wait for him, not drowned and not over the wall)
  assert.equal(g.fp.line.filter((f) => f.state === 'follow').length + g.setOn.length, 5, 'every one is with him or on the near bank');
});

test('the engine meets the flood, planted: without floodClosed the tail is left paddling in the low road as it turns deep, so the toy goes RED', () => {
  const g = engineFlood(false);
  assert.ok(g.lost.length >= 1, `RED: ${g.lost.length} left in deep water`);
});

test('the close sets back only the ones IN the low road: one up on the high road over its water stays with him (RED: the span alone set it back)', () => {
  const flood = laid(W2_FLOOD.flown.px, false);
  const w = { ...flood.waters[1], deep: { y: LIP, near: flood.waters[1].deep!.near } };
  const fp = new FollowPlay(W2_FOLLOW, false, { exitX: 9000, zones: [], covers: [], platforms: [], safeWater: [] }, { x: 1300, y: LIP - 120 });
  const up = fp.free('duck', { x: 1200, y: LIP - 120 }, { x: 1200, y: LIP - 120 });
  const wet = fp.free('otter', { x: 1150, y: LIP + 20 }, { x: 1150, y: LIP + 20 });
  up.state = wet.state = 'follow';
  // (RED, the rule as first written: everyone over the span, the porch's one too)
  assert.equal([up, wet].filter((f) => f.x > w.x0 && f.x < w.x1).length, 2, 'RED: the span alone takes the porch one as well');
  const out = fp.floodClosed(w);
  assert.deepEqual(out, [wet], 'GREEN: only the one in the water');
  assert.equal(up.state, 'follow');
});

test('the wall is where he stood in deep water, never his hop over it: the line follows his hop up off the near bank (RED: air points as the wall)', () => {
  const t = newTrail(800, LIP, W2_FOLLOW.step);
  for (let x = 800; x <= 996; x += 4) record(t, { x, y: LIP, grounded: true }, 'walk');
  // (his hop up off the bank's edge onto the first high road piece 60 px up, over the water's span: the arc starts at the banks' top)
  [LIP - 1, LIP - 20, LIP - 40, LIP - 58, LIP - 72, LIP - 78, LIP - 70, LIP - 62].forEach((y, k) => record(t, { x: 1004 + k * 8, y, grounded: false }, 'walk'));
  for (let x = 1064; x <= 1300; x += 4) record(t, { x, y: LIP - 60, grounded: true }, 'walk');
  const deep = (x: number, y: number) => x > 1000 && x < 1400 && y > LIP - 2;
  assert.ok(t.pts.some((q) => q.air && deep(q.x, q.y)), 'the toy: an air point of the hop lies in the deep water test');
  const end = t.pts[t.pts.length - 1].s;
  assert.equal(wallCap(t, 0, end, deep), end, 'GREEN: the line goes on over the hop');
  const red = { ...t, pts: t.pts.map((q) => ({ ...q, air: undefined })) };
  assert.ok(wallCap(red, 0, end, deep) < end, 'RED: with the hop\'s points read as ground, the line waits on the bank');
});
