// The FLOOD CLOCK (flood.ts; reference/design/2-8.md NEW 1) and the little ones meeting it (follow.ts; 2-8.md NEW 2), planted on toys:
// floodFaults GREEN on the design's own flown leg and RED with the close 3 s early (2-8.md:59); the clock starts only on its start cage,
// never resets and turns only the low road deep; a little one paddling in the low road at the close is set on its near bank and rejoins
// (RED without the set-back: it is left in deep water), and none walks into deep water (RED with the wall off); a step down of 60 px that
// he walks off is a walk for the line, never a wait (2-8.md:59, Pushback 5).
import test from 'node:test';
import assert from 'node:assert/strict';
import { FloodClock, floodFaults, floodSurface, floodTailOff, forkFaults, highRoad, highRoadFaults, type Flood, type FloodWater } from './flood.ts';
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
  const steps = [{ x: 990, w: 60, y: LIP - 60, h: 60 }, { x: 1050, w: 300, y: LIP - 120, h: 60 }, { x: 1350, w: 60, y: LIP - 60, h: 20 }];
  assert.deepEqual(highRoadFaults(steps, span, 60, 120), []);
  assert.match(highRoadFaults([{ ...steps[0], y: LIP - 100 }, ...steps.slice(1)], span, 60, 120).join(";"), /no piece a step of at most 60 px/);
  assert.match(highRoadFaults([], span, 60, 120).join(';'), /no high road/);
});

test('highRoadFaults: the first piece is a WALL-STEP on the near bank he walks into and climbs; a bare edge hop up is refused by name', () => {
  const span = { x0: 1000, x1: 1400, from: { x: 1000, y: LIP }, to: { x: 1410, y: LIP } };
  const rest = [{ x: 1050, w: 300, y: LIP - 120, h: 60 }, { x: 1350, w: 60, y: LIP - 60, h: 20 }];
  // GREEN: a block standing on the bank, its face at or before the edge and down to the bank's top (he meets it as a wall)
  assert.deepEqual(highRoadFaults([{ x: 990, w: 60, y: LIP - 60, h: 60 }, ...rest], span, 60, 120), []);
  assert.deepEqual(highRoadFaults([{ x: 1000, w: 50, y: LIP - 60, h: 200 }, ...rest], span, 60, 120), [], 'its face right at the edge');
  // RED: a thin piece at the edge with room under it (he walks under it: the hop up off the edge is bare)
  assert.match(highRoadFaults([{ x: 990, w: 60, y: LIP - 60, h: 20 }, ...rest], span, 60, 120).join(';'), /starts with a bare edge hop at x 990/);
  // RED: a full block, but out over the water past the edge (the hop off the edge up onto it is bare)
  assert.match(highRoadFaults([{ x: 1010, w: 40, y: LIP - 60, h: 200 }, ...rest], span, 60, 120).join(';'), /starts with a bare edge hop at x 1010/);
  // RED: no height known is no wall
  assert.match(highRoadFaults([{ x: 990, w: 60, y: LIP - 60 }, ...rest], span, 60, 120).join(';'), /bare edge hop/);
  // GREEN: the wall-step stands back on the bank (a hop before the edge), a LEVEL gap hop onto a porch over the water, a block standing on
  // the porch for the next step up (out of the low road's lane), a step down, the far bank (the shape the toy fork and 2-8 lay)
  const back = [{ x: 880, w: 60, y: LIP - 60, h: 60 }, { x: 1000, w: 100, y: LIP - 60, h: 20 }, { x: 1100, w: 240, y: LIP - 120, h: 60 }, { x: 1340, w: 220, y: LIP - 60, h: 20 }];
  assert.deepEqual(highRoadFaults(back, span, 60, 60), []);
  // RED: every step UP is a wall-step: the block on the porch made a thin piece floating 60 px over it (a bare edge hop up, one piece in)
  assert.match(highRoadFaults([back[0], back[1], { ...back[2], h: 20 }, back[3]], span, 60, 60).join(';'), /climbs by a bare edge hop up at x 1100/);
});

test('highRoad: every piece IN HIS WAY on a porch is met in order (a rise standing ON the porch, never skipped by a jump to its far end)', () => {
  // (World 2's two-road section's shape, w2.ts W2_FORK: W on the bank's end, a 60 px gap, the porch P, a rise standing on P's far end, porch2
  //  level with P from P's end out over the far bank)
  const span = { x0: 1000, x1: 1798, from: { x: 1000, y: LIP }, to: { x: 1798, y: LIP } };
  const W = { x: 850, w: 150, y: LIP - 60, h: 60 }, P = { x: 1060, w: 500, y: LIP - 60, h: 24 }, rise = { x: 1160, w: 400, y: LIP - 120, h: 60 }, P2 = { x: 1560, w: 400, y: LIP - 60, h: 24 };
  const ok = highRoad([W, P, rise, P2], span, 60, 60);
  assert.deepEqual(ok.faults, []);
  assert.deepEqual(ok.chain, [W, P, rise, P2], 'GREEN: the rise standing on the porch is met and climbed (before the fix the chain was W, P, P2)');
  // RED: the rise lifted 10 px off the porch (room under it, under his head: a bare edge hop up; 70 px over P, so a 'within a step' filter misses it)
  assert.match(highRoadFaults([W, P, { ...rise, y: rise.y - 10 }, P2], span, 60, 60).join(';'), /climbs by a bare edge hop up at x 1160 \(70 px up off the piece at x 1060, 10 px of room under it\)/);
  // RED: a rise standing on the porch taller than a step
  assert.match(highRoadFaults([W, P, { ...rise, y: rise.y - 10, h: 70 }, P2], span, 60, 60).join(';'), /meets a wall 70 px tall at x 1160/);
  // GREEN: a thin piece high over the porch (over his head) is not in his way
  assert.deepEqual(highRoadFaults([W, P, { x: 1160, w: 200, y: LIP - 200, h: 24 }, P2], span, 60, 60), []);
});

test('highRoad: a stair up and back down (a top standing on the rise standing on the porch) is a road, never a loop: the rise is met again past the top', () => {
  // (session 1's first two-road shape, W2-LANE b's trace (BUILD-28): rise 300 on P's far end, the top 140 at its middle, 80 px treads. Before
  //  the fix the walk met W, P, the rise, the top, the rise again (its far tread), and refused it as 'the high road loops': the chain was
  //  longer than the pieces. RED on that guard; a loop is no ground gained)
  const span = { x0: 1000, x1: 1798, from: { x: 1000, y: LIP }, to: { x: 1798, y: LIP } };
  const W = { x: 850, w: 150, y: LIP - 60, h: 60 }, P = { x: 1060, w: 500, y: LIP - 60, h: 20 }, rise = { x: 1260, w: 300, y: LIP - 120, h: 60 }, top = { x: 1340, w: 140, y: LIP - 180, h: 60 }, P2 = { x: 1560, w: 400, y: LIP - 60, h: 20 };
  const r = highRoad([W, P, rise, top, P2], span, 60, 60);
  assert.deepEqual(r.faults, []);
  assert.deepEqual(r.chain, [W, P, rise, top, rise, P2], 'up W, P, the rise, the top; down the rise\'s far tread, porch2');
});

test('forkFaults: the fork at the wall-step, both halves by name: RED on the toy (W 60 + gap 60: every tier walks off, the adult as traced) and the brick (W 60 flush: no way down); GREEN on the shape it finds (W 150 + gap 60)', () => {
  const span = { x0: 1000, x1: 1400, from: { x: 1000, y: LIP }, to: { x: 1410, y: LIP } };
  // the toy fork's high road (tools/inspect/lineBot.test.ts): W, a 60 px gap over the bank strip, P level with W's top, B, C
  const fork = (wW: number, gap: number) => {
    const wx = 1000 - gap - wW;
    return [{ x: wx, w: wW, y: LIP - 60, h: 60 }, { x: 1000, w: 100, y: LIP - 60, h: 20 }, { x: 1100, w: 240, y: LIP - 120, h: 60 }, { x: 1340, w: 220, y: LIP - 60, h: 20 }];
  };
  const judge = (wW: number, gap: number) => {
    const road = highRoad(fork(wW, gap), span, 60, 60);
    assert.deepEqual(road.faults, [], `W ${wW} + gap ${gap}: a walkable high road (only the fork is judged)`);
    return forkFaults(road.chain, span, W2_FLOOD.climb).join(';');
  };
  // RED: the toy's current numbers. The adult lands 86 px past W's face, 26 px PAST a 60 px W's lip: no room to take off, he walks off
  const toy = judge(60, 60);
  for (const tier of ['child', 'middle', 'expert', 'adult']) assert.match(toy, new RegExp(`the ${tier} lands \\d+ px past its face .* walks off into the 60 px gap`), tier);
  assert.doesNotMatch(toy, /no way down/, 'the toy has its way down: the 60 px gap is the low road');
  // RED: the brick's shape (floodLay.test: W 60 at the water's edge, the porch flush against it): no way down onto the low road
  const brick = judge(60, 0);
  assert.match(brick, /no way down onto the low road: the gap after it is 0 px, under his 44 px width/);
  assert.doesNotMatch(brick, /walks off/, 'a flush porch: he walks on');
  // GREEN: the shape the verdict finds: W at least the widest tier's land + run-up (86 + 61 = 147), a 60 px gap (his width up to FLOOD_HOP)
  assert.equal(judge(150, 60), '');
  // the edge of it, planted: 146 px refuses the middle and the expert by name, 147 passes them
  assert.match(judge(146, 60), /the middle lands 86 px past its face and has 60 px to its lip, short of his 61 px run-up/);
  assert.equal(judge(147, 60), '');
  // a gap the jump cannot carry is refused by name (the reach from a stand start, the air pushing him on to a full run)
  // (past FLOOD_HOP, so no high road chains it: judged straight on W and the next piece)
  assert.match(forkFaults(fork(150, 120).slice(0, 2), span, W2_FLOOD.climb).join(';'), /reaches \d+ px, short of the 120 px gap/);
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

test('the high road over a flood is no paddle: his hop between two pieces above the banks stays his arc; at or under the banks the line paddles (RED: no lip, the arc is snapped to the water)', () => {
  // (the porch P 60 px over the banks and the block B on it 60 px higher, over the low road; the low road deep: its surface at the lip)
  const platforms = [{ id: 1, x: 1000, y: LIP - 60, width: 100, height: 20, type: 'solid' }, { id: 2, x: 1100, y: LIP - 120, width: 240, height: 60, type: 'solid' }] as unknown as Platform[];
  const mk = (lip?: number) => new FollowPlay(W2_FOLLOW, false, { exitX: 9000, zones: [], covers: [], platforms, safeWater: [{ x0: 1000, x1: 1400, y: LIP, ...(lip !== undefined ? { lip } : {}) }] }, { x: 1300, y: LIP - 120 });
  const g = mk(LIP);
  for (const y of [LIP - 64, LIP - 90, LIP - 110]) assert.equal(g.surf(1095, y), null, `GREEN: the arc at y ${y} over the porch's end is his hop, no paddle`);
  assert.equal(g.surf(1200, LIP + 20), LIP, 'GREEN: under the banks the line still paddles');
  const red = mk();
  assert.equal(red.surf(1095, LIP - 90), LIP, 'RED: with no lip the hop\'s arc is snapped down to the deep water');
});
