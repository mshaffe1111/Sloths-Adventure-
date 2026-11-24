// The FLOOD CLOCK (flood.ts; reference/design/2-8.md NEW 1) and the little ones meeting it (follow.ts; 2-8.md NEW 2), planted on toys:
// floodFaults GREEN on the design's own flown leg and RED with the close 3 s early (2-8.md:59); the clock starts only on its start cage,
// never resets and turns only the low road deep; a little one paddling in the low road at the close is set on its near bank and rejoins
// (RED without the set-back: it is left in deep water), and none walks into deep water (RED with the wall off); a step down of 60 px that
// he walks off is a walk for the line, never a wait (2-8.md:59, Pushback 5).
import test from 'node:test';
import assert from 'node:assert/strict';
import { FloodClock, floodFaults, floodSurface, floodTailOff, highRoadFaults, type Flood, type FloodWater } from './flood.ts';
import { join, newTrail, record, rejoin, setOnBank, stepLine, type Follower } from './follow.ts';
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
