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
import { FirstTimerRun, FT_ADULT, FT_MIDDLE, LINE_SKILL, freshPhone, rng, type FirstTimer } from './firsttimer.ts';
import { spook, type Follower } from '../../src/game/follow.ts';
import { W2_FLOOD, W2_FOLLOW } from '../../src/game/gen2/worlds/w2.ts';
import { FloodClock, floodTailOff, type Flood } from '../../src/game/flood.ts';
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
 * LEAD-THE-LINE (ENG-28; 2-8.md "Bots"): a toy fork in the real engine. The low road: a walkway 5 px under the banks over 400 px of water
 * marked to close (paddling depth 10 px under the banks, deep at 26 s); the high road: three thin pieces (60 px up, 120 px up over the water,
 * 60 px up) a step each, flood.ts highRoad's chain. Three little ones behind him; the clock started `late` s before he sets off (the last
 * cage freed that long ago: he dawdled). Counted: the little ones the close sets on the near bank (a split line) and which road he took.
 */
interface FloodRun { end: string; setBack: number; home: number; high: boolean; t: number }
function floodRun(who: FirstTimer, seed: number, late: number): FloodRun {
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
    run.sim.bare([solid(1, 0, W0, Y), solid(2, W0, W1 - W0, Y + 60), solid(3, W1, 6000 - W1, Y), solid(4, W0 - 120, 60, Y - 60, 60), solid(5, W0, 100, Y - 60, 20), solid(6, W0 + 100, W1 - W0 - 160, Y - 120, 60), solid(7, W1 - 60, 220, Y - 60, 20)]);
    const cages = [420, 470, 520].map((x, i) => ({ id: 300 + i, x, y: Y - 26, type: 'cage', collected: true, critter: (['duck', 'otter', 'capy'] as const)[i] }) as Collectible);
    const exit = { id: 400, x: EXIT, y: Y - 40, type: 'exit_totem', collected: false } as Collectible;
    e.collectibles = [...cages, exit];
    const st = e.currentStage;
    st.exitTotemX = EXIT;
    st.exitTotemY = Y;
    st.config = { ...st.config, objectiveType: 'rescue', targetCount: 3, levelWidth: 6000 };
    e.walls = e.mode.bounds({ levelWidth: 6000, exit: { x: EXIT, y: Y }, spawn: { x: START, y: Y } });
    const river: RiverZone = { x0: W0, x1: W1, surfaceY: Y + 90, dir: 1, speed: 0, safe: { backX: W0 - 40, backY: Y }, floodMark: { kind: 'close', lip: Y } };
    st.rivers = [river];
    const easy = who.setting === 'easy';
    const px = W1 - cages[2].x;
    const flood: Flood = {
      start: { id: cages[2].id, x: cages[2].x, y: Y }, close: easy ? W2_FLOOD.close.easy : W2_FLOOD.close.normal, px,
      waters: [{ river: 0, x0: W0, x1: W1, y0: Y + 90, y1: Y + 70, seconds: 26, lip: Y, deep: { y: Y, near: { x: W0 - 40, y: Y } } }],
      tailOff: floodTailOff(W2_FLOOD, px, easy), spare: easy ? W2_FLOOD.spare.easy : W2_FLOOD.spare.normal,
    };
    st.flood = flood;
    e.floodClock = new FloodClock(flood);
    e.proto = { hints: [], covers: [], beats: [], movedPickups: [], bushes: [], watch: [], follow: W2_FOLLOW };
    run.sim.stand(START, Y);
    e.startFollow();
    for (const c of cages) e.follow.free(c.critter, { x: c.x - 300, y: Y }, { x: c.x - 300, y: Y });
    for (let i = 0; i < 30; i++) run.sim.frame({});
    run.prog.relocate(run.sim.p);
    // (the last cage burst `late` s ago: the clock has run that long)
    e.floodClock.freed(flood.start.id, e.gameTime - late);
    let setBack = 0;
    const closed = e.follow.floodClosed.bind(e.follow);
    e.follow.floodClosed = (w: unknown) => {
      const out = closed(w) as Follower[];
      if (process.env.FLOODDBG) console.log("CLOSE", e.gameTime.toFixed(2), "he", Math.round(run.sim.p.x), Math.round(run.sim.p.y), "line", (e.follow.line as Follower[]).map((f) => `${f.state}@${Math.round(f.x)},${Math.round(f.y)}`).join(" "));
      setBack += out.length;
      return out;
    };
    let high = false;
    const on = run.sim.frame.bind(run.sim);
    run.sim.frame = (...a: unknown[]) => {
      const r = on(...(a as [never]));
      const p = run.sim.p;
      if (p.x > W0 + 40 && p.x < W1 - 40 && p.grounded && p.y < Y - 100) high = true;
      if (process.env.FLOODDBG && Math.round(e.gameTime * 30) % 15 === 0 && e.gameTime < 40) console.log("PATH", e.gameTime.toFixed(1), Math.round(p.x), Math.round(p.y), p.grounded ? "g" : "a", (e.follow.line as Follower[]).map((f) => `${f.state}@${Math.round(f.x)},${Math.round(f.y)}`).join(" "), "trail", e.follow.trail.pts.length, "s", Math.round(e.follow.trail.s));
      return r;
    };
    run.play();
    return { end: run.end, setBack, home: e.follow.home(), high, t: +run.t.toFixed(1) };
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

test('lead-the-line, too late for the line (he dawdled 22 s): the bot reads the water and leads them round by the high road, nobody set back', () => {
  for (const [name, who] of WHO) for (const seed of SEEDS) {
    const r = floodRun(who, seed, 22);
    assert.equal(r.end, 'shrine', `${name} seed ${seed}: ${JSON.stringify(r)}`);
    assert.equal(r.high, true, `${name} seed ${seed}: the high road: ${JSON.stringify(r)}`);
    assert.equal(r.setBack, 0, `${name} seed ${seed}: ${JSON.stringify(r)}`);
    assert.equal(r.home, 3);
  }
});

test('planted: with the read removed the bot takes the low road late and the close splits the line (one or more set on the near bank)', () => {
  LINE_SKILL.leadLine = false;
  const off: string[] = [];
  let split = 0;
  try {
    for (const [name, who] of WHO) for (const seed of SEEDS) {
      const r = floodRun(who, seed, 22);
      off.push(`${name} ${seed}: ${JSON.stringify(r)}`);
      if (!r.high && r.setBack > 0) split++;
    }
  } finally {
    LINE_SKILL.leadLine = true;
  }
  assert.ok(split >= 1, `with the read removed no late run split the line: ${off.join('; ')}`);
});

void DT;
