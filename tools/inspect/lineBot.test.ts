/**
 * The bot's line skills (firsttimer.ts LINE_SKILL; 2-3.md "Bot skills"; level.md rule 21, toys first): the real first-timer bot (the
 * middle and adult thumbs) on a toy marsh in the real engine, each skill switched off to prove the bot needs it.
 *   - WAIT-FOR-THE-TAIL: two reed clumps (300 px) over 400 px of open mud under one heron; three little ones follow him. With the skill
 *     he crosses with nobody spooked; without it (he runs straight on) the look catches the line out on the mud.
 *   - FETCH-THE-SPOOKED: one little one is spooked back to the stretch's start before he sets off; with the skill he goes back for it
 *     and brings all three home (the door opens); without it the door stays sealed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT } from '../../src/game/realPlay.ts';
import { FirstTimerRun, FT_ADULT, FT_CHILD, FT_CHILD_EASY, FT_EXPERT, FT_MIDDLE, FT_MIDDLE_EASY, LINE_SKILL, ROAD_TRIPS, freshPhone, rng, type FirstTimer } from './firsttimer.ts';
import { SAME_GROUND, spook, type Follower } from '../../src/game/follow.ts';
import { W2_FLOOD, W2_FOLLOW } from '../../src/game/gen2/worlds/w2.ts';
import { FloodClock, floodTailOff, highRoad, type Flood } from '../../src/game/flood.ts';
import { FLOOD_HOP, FLOOD_STEP, floodWaterOf } from '../../src/game/gen2/floodLay.ts';
import { layRiver } from '../../src/game/gen2/riverLay.ts';
import type { RiverZone } from '../../src/game/river.ts';
import type { WatchZone } from '../../src/game/watcher.ts';
import type { Collectible, Platform } from '../../src/game/types.ts';

const Y = 800;
const START = 300;
const EXIT = 3000;

interface LineRun { end: string; spooks: number; home: number; t: number }

/** the bot plays the toy marsh: 3 cages by the start, then clumps A and B under a heron, then the exit (the goal: 3 home) */
function lineRun(who: FirstTimer, seed: number, preSpook = false): LineRun {
  freshPhone(who.setting);
  const mr = Math.random;
  Math.random = rng(seed * 104729 + 7);
  try {
    const route = Array.from({ length: Math.ceil((EXIT + 100 - START) / 24) + 1 }, (_, i) => ({ x: START + i * 24, y: Y }));
    const run = new FirstTimerRun('2-3', 1, who, { route, cap: 200 });
    const e = run.e as unknown as Record<string, any>;
    const floor: Platform = { id: 1, x: 0, y: Y, width: 6000, height: 200, type: 'solid' } as Platform;
    run.sim.bare([floor]);
    const cages = [420, 470, 520].map((x, i) => ({ id: 300 + i, x, y: Y - 26, type: 'cage', collected: true, critter: (['duck', 'otter', 'capy'] as const)[i] }) as Collectible);
    const exit = { id: 400, x: EXIT, y: Y - 40, type: 'exit_totem', collected: false } as Collectible;
    e.collectibles = [...cages, exit];
    const st = e.currentStage;
    st.exitTotemX = EXIT;
    st.exitTotemY = Y;
    st.config = { ...st.config, objectiveType: 'rescue', targetCount: 3, levelWidth: 6000 };
    e.walls = e.mode.bounds({ levelWidth: 6000, exit: { x: EXIT, y: Y }, spawn: { x: START, y: Y } });
    const A = { x: 1000, w: 300, y: Y, kind: 'wide' as const };
    const B = { x: 1700, w: 300, y: Y, kind: 'wide' as const };
    const zone: WatchZone = { x0: 900, x1: 2100, calm: [5, 5] };
    e.proto = { hints: [], covers: [], beats: [], movedPickups: [], bushes: [A, B], watch: [zone], follow: W2_FOLLOW };
    run.sim.stand(START, Y);
    e.startFollow();
    // (the three little ones already out of their cages, bunched behind him: the toy is the crossing, not the punch)
    for (const c of cages) e.follow.free(c.critter, { x: c.x - 300, y: Y }, { x: c.x - 300, y: Y });
    for (let i = 0; i < 30; i++) run.sim.frame({});
    run.prog.relocate(run.sim.p);
    let spooks = 0;
    const line = e.follow.line as Follower[];
    if (preSpook) {
      spook(line[1], 60);
      line[1].x = 60;
      line[1].back = true;
    }
    const step = e.follow.step.bind(e.follow);
    e.follow.step = (...a: unknown[]) => {
      const ev = step(...a);
      spooks += (ev.spooked as Follower[]).length;
      return ev;
    };
    run.play();
    return { end: run.end, spooks, home: e.follow.home(), t: +run.t.toFixed(1) };
  } finally {
    Math.random = mr;
  }
}

const WHO: Array<[string, FirstTimer]> = [['middle', FT_MIDDLE], ['adult', FT_ADULT]];
const SEEDS = [1, 2, 3];
/** every tier (the marsh's swim, the lead's condition 2) */
const TIERS: Array<[string, FirstTimer]> = [['child-easy', FT_CHILD_EASY], ['child', FT_CHILD], ['middle-easy', FT_MIDDLE_EASY], ['middle', FT_MIDDLE], ['adult', FT_ADULT], ['expert', FT_EXPERT]];

test('wait-for-the-tail: the bot crosses clump to clump under the heron with nobody spooked and brings all three home', () => {
  for (const [name, who] of WHO) for (const seed of SEEDS) {
    const r = lineRun(who, seed);
    assert.equal(r.end, 'shrine', `${name} seed ${seed}: ${JSON.stringify(r)}`);
    assert.equal(r.spooks, 0, `${name} seed ${seed}: ${JSON.stringify(r)}`);
    assert.equal(r.home, 3);
  }
});

test('planted: with wait-for-the-tail off the heron catches the line out on the mud (a run the skill crossed clean spooks)', () => {
  const on = new Map<string, LineRun>();
  for (const [name, who] of WHO) for (const seed of SEEDS) on.set(`${name} ${seed}`, lineRun(who, seed));
  LINE_SKILL.waitTail = false;
  const off: string[] = [];
  let caught = 0;
  try {
    for (const [name, who] of WHO) for (const seed of SEEDS) {
      const r = lineRun(who, seed);
      off.push(`${name} ${seed}: ${JSON.stringify(r)}`);
      if (r.spooks > 0 && on.get(`${name} ${seed}`)!.spooks === 0) caught++;
    }
  } finally {
    LINE_SKILL.waitTail = true;
  }
  assert.ok(caught >= 1, `with wait-for-the-tail off no run was caught that the skill crossed clean: ${off.join('; ')}`);
});

test('fetch-the-spooked: one spooked back to the stretch start, the bot goes back for it and brings all three home', () => {
  for (const [name, who] of WHO) {
    const r = lineRun(who, 1, true);
    assert.equal(r.end, 'shrine', `${name}: ${JSON.stringify(r)}`);
    assert.equal(r.home, 3);
  }
});

test('planted: with fetch-the-spooked off the spooked one is left at its reed and the door stays sealed', () => {
  LINE_SKILL.fetch = false;
  try {
    for (const [name, who] of WHO) {
      const r = lineRun(who, 1, true);
      assert.notEqual(r.end, 'shrine', `planted ${name}: ${JSON.stringify(r)}`);
      assert.ok(r.home < 3);
    }
  } finally {
    LINE_SKILL.fetch = true;
  }
});

/**
 * LEAD-THE-LINE (ENG-28; 2-8.md "Bots"): a toy fork in the real engine. The low road: a walkway 60 px under the banks over 400 px of water
 * marked to close (deep at 26 s); the high road, flood.ts highRoad's chain: W, a block 60 px tall and FORK_W wide on the near bank (a wall-step he walks
 * into and climbs), P a thin piece level with W's top across a 60 px gap, B a block 60 px over P standing on its level (a wall-step out of
 * the low road's lane), C a thin piece level with P on to the far bank. Three little ones behind him; the clock started `late` s before he
 * sets off (the last cage freed that long ago: he dawdled). Counted: the little ones the close sets on the near bank (a split line) and
 * which road he took. The toy's spawn and flags stand on its own floor (a lost heart puts him and the line back there).
 */
/** the wall-step W's width: the fork's passing shape with the 60 px gap after it (the lead's ruling, ENG-28 session 7; flood.ts forkFaults:
 *  W at least the widest tier's landing + run-up, W2_FLOOD.climb 86 + 61). W 60 is refused by name: every tier lands past its lip */
const FORK_W = 150;
interface FloodRun {
  end: string;
  setBack: number;
  home: number;
  /** The road he took AT THE FORK: before the first close he stood grounded on a piece of the HIGH ROAD ONLY, read from the flood's own
   *  high-road chain (flood.ts highRoad, as floodFaults and the bot read it), never a height. The fork's shared ends do not count: its
   *  first piece, the wall-step W (both roads climb it; the low road walks off it 60 px down), and its last piece C (the low road climbs
   *  out of the walkway onto it: both roads end there), so a stand on either is no choice. Set only while no close has
   *  fired: after the close the high road is the only way on, so a stand there then says nothing about his choice (the lead's rulings,
   *  R-165.432, ENG-28f). */
  high: boolean;
  t: number;
  /** (a marsh toy) a little one stood on the marsh's floor, out over the water, not paddling */
  walked?: boolean;
  /** (a marsh toy) a little one paddled in one of its dips */
  paddled?: boolean;
  /** (a marsh toy) he hopped a dip from the floor and landed on the floor beyond it (at its take-off height, follow.ts SAME_GROUND): the
   *  hop the line swims (follow.ts swimY). A hop off the floor that lands higher (onto the fork's last piece) is his arc, and theirs */
  flat?: boolean;
  /** (a marsh toy) a little one was over a dip in the AIR (on his arc, not paddling and not on the floor) */
  dry?: boolean;
}
/** the low road laid by gen2's own piece (riverLay layRiver, RiverRow.marsh: the floor 60 px under the banks, as the hand walkway) instead
 *  of the hand walkway, `dips` gaps `dip` px wide in it; plants: `floorOff` lays the marsh's water with no floor, `closeOff` its flood
 *  with no close (it rises, never turns deep), `swimOff` the line's straight swim over a dip (follow.ts swimY) off: it hops the dip on his arc */
interface MarshToy { dips: number; dip: number; floorOff?: boolean; closeOff?: boolean; swimOff?: boolean }
function floodRun(who: FirstTimer, seed: number, late: number, marsh?: MarshToy): FloodRun {
  freshPhone(who.setting);
  const mr = Math.random;
  Math.random = rng(seed * 7919 + 3);
  try {
    const W0 = 1000;
    const W1 = 1400;
    const route = Array.from({ length: Math.ceil((EXIT + 100 - START) / 24) + 1 }, (_, i) => {
      const x = START + i * 24;
      return { x, y: x > W0 && x < W1 ? Y + 60 : Y };
    });
    const run = new FirstTimerRun('2-3', 1, who, { route, cap: 200 });
    const e = run.e as unknown as Record<string, any>;
    const solid = (id: number, x: number, width: number, y: number, height = 200) => ({ id, x, y, width, height, type: 'solid' }) as Platform;
    let nid = 50;
    const low = marsh ? layRiver({ dir: 1, speed: 0, logW: 0, logs: 0, safe: true, flood: 'close', marsh: { width: W1 - W0, floor: 60, dips: marsh.dips, dip: marsh.dip } }, W0, Y, () => nid++) : undefined;
    const dipsAt = low ? low.floor.slice(1).map((q, i) => [low.floor[i].x + low.floor[i].width, q.x] as const) : [];
    run.sim.bare([solid(1, 0, W0, Y), ...(low ? (marsh!.floorOff ? [] : low.floor) : [solid(2, W0, W1 - W0, Y + 60)]), solid(3, W1, 6000 - W1, Y), solid(4, W0 - 60 - FORK_W, FORK_W, Y - 60, 60), solid(5, W0, 100, Y - 60, 20), solid(6, W0 + 100, W1 - W0 - 160, Y - 120, 60), solid(7, W1 - 60, 220, Y - 60, 20)]);
    const cages = [420, 470, 520].map((x, i) => ({ id: 300 + i, x, y: Y - 26, type: 'cage', collected: true, critter: (['duck', 'otter', 'capy'] as const)[i] }) as Collectible);
    const exit = { id: 400, x: EXIT, y: Y - 40, type: 'exit_totem', collected: false } as Collectible;
    e.collectibles = [...cages, exit];
    const st = e.currentStage;
    st.exitTotemX = EXIT;
    st.exitTotemY = Y;
    st.config = { ...st.config, objectiveType: 'rescue', targetCount: 3, levelWidth: 6000 };
    e.walls = e.mode.bounds({ levelWidth: 6000, exit: { x: EXIT, y: Y }, spawn: { x: START, y: Y } });
    // (a lost heart puts him back on the toy's own floor, as every stage's spawn and flags stand on theirs: left at 2-3's spawn, 217 px
    //  over this floor, the line was regrouped in the air there and its trail held at the drop for good, a 'stranded' run, ENG-28e)
    st.spawnX = START;
    st.spawnY = Y;
    st.checkpoints = [];
    e.checkpoint = { x: START, y: Y };
    const river: RiverZone = low ? low.zone : { x0: W0, x1: W1, surfaceY: Y + 90, dir: 1, speed: 0, safe: { backX: W0 - 40, backY: Y }, floodMark: { kind: 'close', lip: Y } };
    st.rivers = [river];
    const easy = who.setting === 'easy';
    const px = W1 - cages[2].x;
    const flood: Flood = {
      start: { id: cages[2].id, x: cages[2].x, y: Y }, close: easy ? W2_FLOOD.close.easy : W2_FLOOD.close.normal, px,
      waters: [low ? { ...floodWaterOf(river, 0, 26), ...(marsh!.closeOff ? {} : { deep: { y: Y, near: { x: W0 - 40, y: Y } } }) } : { river: 0, x0: W0, x1: W1, y0: Y + 90, y1: Y + 70, seconds: 26, lip: Y, deep: { y: Y, near: { x: W0 - 40, y: Y } } }],
      tailOff: floodTailOff(W2_FLOOD, px, easy), spare: easy ? W2_FLOOD.spare.easy : W2_FLOOD.spare.normal,
    };
    st.flood = flood;
    e.floodClock = new FloodClock(flood);
    e.proto = { hints: [], covers: [], beats: [], movedPickups: [], bushes: [], watch: [], follow: W2_FOLLOW };
    run.sim.stand(START, Y);
    e.startFollow();
    // (planted: the line hops a dip on his arc again, the straight swim off)
    if (marsh?.swimOff) (e.follow as unknown as { swimAcross: unknown }).swimAcross = () => false;
    for (const c of cages) e.follow.free(c.critter, { x: c.x - 300, y: Y }, { x: c.x - 300, y: Y });
    for (let i = 0; i < 30; i++) run.sim.frame({});
    run.prog.relocate(run.sim.p);
    // (the last cage burst `late` s ago: the clock has run that long)
    e.floodClock.freed(flood.start.id, e.gameTime - late);
    let setBack = 0;
    let shut = false;
    const closed = e.follow.floodClosed.bind(e.follow);
    e.follow.floodClosed = (w: unknown) => {
      shut = true;
      const out = closed(w) as Follower[];
      setBack += out.length;
      return out;
    };
    let high = false;
    let walked = false, paddled = false, flat = false, dry = false;
    let off: { x: number; y: number } | null = null;
    let stood = { x: 0, y: 0 };
    const tops = run.sim.platforms.filter((q) => q.type === 'solid' && q.y < Y - 1).map((q) => ({ x: q.x, w: q.width, y: q.y, h: q.height, q }));
    const road = highRoad(tops, { x0: W0, x1: W1, from: { x: W0, y: Y }, to: { x: W1, y: Y } }, FLOOD_STEP, FLOOD_HOP);
    assert.deepEqual(road.faults, [], 'the toy lays a high road');
    assert.ok(road.chain.length >= 3, 'the high road: the wall-step, its own pieces and its last piece');
    // (the fork's shared ends left out: W, chain[0], and C, the chain's last piece; the lead's ruling A, ENG-28 session 8)
    const highOnly = new Set<Platform>(road.chain.slice(1, -1).map((t) => t.q));
    const on = run.sim.frame.bind(run.sim);
    run.sim.frame = (...a: unknown[]) => {
      const r = on(...(a as [never]));
      const p = run.sim.p;
      // (his take-off is the last ground he stood on)
      if (low && !p.grounded && !off) off = stood;
      if (low && p.grounded && off) {
        if (Math.abs(p.y - off.y) <= SAME_GROUND && Math.abs(off.y - (Y + 60)) < 2 && dipsAt.some(([a, b]) => Math.min(off!.x, p.x) < a && Math.max(off!.x, p.x) > b)) flat = true;
        off = null;
      }
      if (p.grounded) stood = { x: p.x, y: p.y };
      if (low) for (const f of e.follow.line as Follower[]) {
        if (f.x <= W0 || f.x >= W1) continue;
        if (f.paddle && dipsAt.some(([a, b]) => f.x > a && f.x < b)) paddled = true;
        if (f.state === 'follow' && !f.paddle && dipsAt.some(([a, b]) => f.x > a + 1 && f.x < b - 1)) dry = true;
        if (!f.paddle && Math.abs(f.y - (Y + 60)) < 2) walked = true;
      }
      if (!shut && p.grounded && [...highOnly].some((q) => Math.abs(q.y - p.y) < 2 && p.x + p.width / 2 > q.x && p.x - p.width / 2 < q.x + q.width)) high = true;
      return r;
    };
    run.play();
    return { end: run.end, setBack, home: e.follow.home(), high, t: +run.t.toFixed(1), ...(low ? { walked, paddled, flat, dry } : {}) };
  } finally {
    Math.random = mr;
  }
}

test('lead-the-line, time enough (the clock started as he sets off): the bot leads the line through the low road, nobody set back', () => {
  for (const [name, who] of WHO) for (const seed of SEEDS) {
    const r = floodRun(who, seed, 0);
    assert.equal(r.end, 'shrine', `${name} seed ${seed}: ${JSON.stringify(r)}`);
    assert.equal(r.high, false, `${name} seed ${seed}: the short road: ${JSON.stringify(r)}`);
    assert.equal(r.setBack, 0, `${name} seed ${seed}: ${JSON.stringify(r)}`);
    assert.equal(r.home, 3);
  }
});

test('planted: with keep-the-road off the edge press hops the porch off the wall-step on the low road, and time enough goes high', () => {
  LINE_SKILL.keepRoad = false;
  const before = ROAD_TRIPS.n;
  try {
    const r = floodRun(FT_MIDDLE, 1, 0);
    assert.equal(r.high, true, `middle seed 1, keep-the-road off: ${JSON.stringify(r)}`);
    assert.equal(ROAD_TRIPS.n, before, 'switched off, the rule changed no jump');
  } finally {
    LINE_SKILL.keepRoad = true;
  }
  const on = ROAD_TRIPS.n;
  const r = floodRun(FT_MIDDLE, 1, 0);
  assert.equal(r.high, false, `middle seed 1, keep-the-road on: ${JSON.stringify(r)}`);
  assert.ok(ROAD_TRIPS.n > on, 'the rule tripped on the low road (the porch in reach, not taken)');
});

// Late 19, not 22 (a re-plant at the SAME bar, the lead's ruling B, ENG-28 session 8): on the fork's passing shape (W 150 + gap 60) the
// middle hops onto P at 6.93 s at every late (the read sends him round at once), so the late decides only whether he is on P before the
// close. Measured on the shape, seeds 1/2/3 identical, the middle's margin (the close minus his first stand on P): late 19 +1.10 s (the
// close at 8.03), late 20 +0.10 s (7.03), late 21 -0.90 s (6.03: on P after it), late 22 -1.90 s (5.03). The widest is late 19 (the adult
// on P at 4.57 s: +3.47 s). The read-removed plant below runs at the same late 19, so the read is the only difference between them.
test('lead-the-line, too late for the line (he dawdled 19 s): the bot reads the water and leads them round by the high road, nobody set back', () => {
  for (const [name, who] of WHO) for (const seed of SEEDS) {
    const r = floodRun(who, seed, 19);
    assert.equal(r.end, 'shrine', `${name} seed ${seed}: ${JSON.stringify(r)}`);
    assert.equal(r.high, true, `${name} seed ${seed}: the high road: ${JSON.stringify(r)}`);
    assert.equal(r.setBack, 0, `${name} seed ${seed}: ${JSON.stringify(r)}`);
    assert.equal(r.home, 3);
  }
});

// Late 19, the same late as 'too late' above (each a re-plant from 22 at the SAME bar: this one R-165.432, ENG-28f): with the read removed he keeps the way's own low road, and
// keep-the-road's step-off now stops him at W's lip first, so at late 22 the close (2.93 s left at the fork read) fell while he and the
// line were still on the near bank (middle seed 1: he at x 836, the three at 745/711/677) and cut nobody off. At late 19 about 5.9 s are
// left at the read against the 6.44 s the line needs to cross, so the read still sends him round, and without it the line is out on the
// low road when it closes.
test('planted: with the read removed the bot takes the low road late and the close splits the line (one or more set on the near bank)', () => {
  LINE_SKILL.leadLine = false;
  const off: string[] = [];
  let split = 0;
  try {
    for (const [name, who] of WHO) for (const seed of SEEDS) {
      const r = floodRun(who, seed, 19);
      off.push(`${name} ${seed}: ${JSON.stringify(r)}`);
      if (!r.high && r.setBack > 0) split++;
    }
  } finally {
    LINE_SKILL.leadLine = true;
  }
  assert.ok(split >= 1, `with the read removed no late run split the line: ${off.join('; ')}`);
});


// THE MARSH LOW ROAD (the lead's ruling 1c, R-165.430 (2); 2-8.md:9 "LOW 1,400 px of marsh path with four 100 px dips"): the toy's low
// road laid by gen2's own piece (riverLay layRiver, RiverRow.marsh) in place of the hand walkway: its floor 60 px under the banks, the
// water RIVER_LAY.marshWater under the floor, the flood raising it to paddling depth under the FLOOR (floodLay floodWaterOf), the close
// covering it. Each claim planted: the floor off (the line has nothing to walk), the close off (nothing turns deep).
test('the marsh low road: gen2\'s piece with no dips is the walkway the line was measured on (the same run, every tier and seed)', () => {
  for (const [name, who] of WHO) for (const seed of SEEDS) {
    const { walked, paddled: _p, flat: _f, dry: _d, ...r } = floodRun(who, seed, 0, { dips: 0, dip: 0 });
    assert.deepEqual(r, floodRun(who, seed, 0), `${name} seed ${seed}: the marsh against the hand walkway`);
    assert.equal(walked, true, `${name} seed ${seed}: the line walked the marsh's floor`);
  }
});

test('the marsh low road with a dip: he leads the line over its floor and it swims the dip, home, nobody set back; RED with the floor off, RED with the swim off', () => {
  let flats = 0;
  for (const [name, who] of WHO) for (const seed of SEEDS) {
    const r = floodRun(who, seed, 0, { dips: 1, dip: 100 });
    const at = `${name} seed ${seed}: ${JSON.stringify(r)}`;
    assert.equal(r.end, 'shrine', at);
    assert.equal(r.high, false, `${at}: the short road`);
    assert.equal(r.setBack, 0, at);
    assert.equal(r.home, 3, at);
    assert.equal(r.walked, true, `${at}: the line walked the floor`);
    // (his hop over the dip rises over the banks' top, where a flood's water never paddles (followPlay.ts surf): the line SWIMS the dip
    //  because follow.ts swimY holds a little one on a same-height hop over flood water at the straight line's height, the lead's ruling
    //  (b); planted below)
    // (a hop off the floor that lands higher, the middle tier's leap over the dip straight onto the fork's last piece, is his arc: the
    //  rule is narrow, the lead's condition 1)
    if (r.flat) flats++;
    if (r.flat) assert.equal(r.paddled && !r.dry, true, `${at}: he hopped the dip floor to floor and the line swam it, never in the air over it`);
  }
  assert.ok(flats >= 1, 'some tier hopped the dip floor to floor');
  const off = floodRun(FT_MIDDLE, 1, 0, { dips: 1, dip: 100, floorOff: true });
  assert.equal(off.walked, false, `planted, the floor off: ${JSON.stringify(off)}`);
  const hop = floodRun(FT_ADULT, 1, 0, { dips: 1, dip: 100, swimOff: true });
  assert.equal(hop.flat && hop.dry, true, `planted, the swim off (the line hops the dip on his arc): ${JSON.stringify(hop)}`);
});

// (the lead's condition 2 on the swim: pace. swimY changes only a little one's height on the hop, never where it is along the trail, so
//  every run must be the hop's: the same end, road, set-backs, home and time; measured on every tier, seeds 1-3, late 0, 15 and 19)
test('the marsh\'s dip swim is pace-neutral: every tier, seeds 1-3, late 0/15/19, the same run as the hop on his arc', () => {
  for (const [name, who] of TIERS) for (const seed of SEEDS) for (const late of [0, 15, 19]) {
    const { paddled, dry, ...swim } = floodRun(who, seed, late, { dips: 1, dip: 100 });
    const { paddled: _b, dry: _c, ...hop } = floodRun(who, seed, late, { dips: 1, dip: 100, swimOff: true });
    const at = `${name} seed ${seed} late ${late}: ${JSON.stringify({ paddled, dry, ...swim })}`;
    assert.deepEqual(swim, hop, `${at}: the swim against the hop`);
    if (swim.flat && !swim.high && swim.setBack === 0) assert.equal(paddled && !dry, true, `${at}: he hopped the dip floor to floor and the line swam it`);
  }
});

test('the marsh\'s close: with the read removed and late 19 the close turns the marsh deep and splits the line; RED with the close off', () => {
  const runs = (closeOff: boolean) => {
    LINE_SKILL.leadLine = false;
    try {
      return WHO.flatMap(([name, who]) => SEEDS.map((seed) => ({ name, seed, r: floodRun(who, seed, 19, { dips: 1, dip: 100, closeOff }) })));
    } finally {
      LINE_SKILL.leadLine = true;
    }
  };
  const on = runs(false);
  assert.ok(on.some((q) => !q.r.high && q.r.setBack > 0), `the close split no line: ${JSON.stringify(on)}`);
  const off = runs(true);
  assert.ok(off.every((q) => q.r.setBack === 0), `planted, the close off: ${JSON.stringify(off)}`);
});

void DT;
