/**
 * The bot's line skills (firsttimer.ts LINE_SKILL; 2-3.md "Bot skills"; level.md rule 21, toys first): the real first-timer bot (the
 * middle and adult thumbs) on a toy marsh in the real engine, each skill switched off to prove the bot needs it.
 *   - WAIT-FOR-THE-TAIL: two reed clumps (300 px) over 400 px of open mud under one heron; three little ones follow him. With the skill
 *     he crosses with nobody spooked; without it (he runs straight on) the look catches the line out on the mud.
 *   - FETCH-THE-SPOOKED: one little one is spooked back to the stretch's start before he sets off; with the skill he goes back for it
 *     and brings all three home (the door opens); without it the door stays sealed.
 *   - HOP-BACK (ENG-CAGE), on 2-3's OWN gen2 row (D75): seed 5 Normal, beat 4's two clumps over open mud with World 2's 50 px boulder
 *     between them; the line spooked back to the stretch's start, he stands in the far clump. He walks back, stopped dead against the
 *     boulder's face he hops it, and fetches them with no rescue; without the hop he stood against it until rescued (castBots 2-3 child
 *     Normal seed 5 x 11590, the traced miss).
 *   - FETCH-CLOCK (ENG-CAGE-b), the same setup with the CHILD (his testers' slow steer rhythm): the fetch and the walk on take him longer
 *     than the 20 s stuck clock; with the clock held through the fetch he brings them back with no rescue; with it running (the old bot)
 *     he is rescued mid-fetch (castBots 2-3 child Normal seeds 5 and 8, x 11166-11968: a rescue put him past his line, the next look
 *     spooked it, and so on).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT } from '../../src/game/realPlay.ts';
import { FirstTimerRun, FT_ADULT, FT_CHILD, FT_MIDDLE, LINE_SKILL, freshPhone, rng, type FirstTimer } from './firsttimer.ts';
import { spook, type Follower } from '../../src/game/follow.ts';
import { W2_FOLLOW } from '../../src/game/gen2/worlds/w2.ts';
import type { WatchZone } from '../../src/game/watcher.ts';
import type { Collectible, Platform } from '../../src/game/types.ts';

const Y = 800;
const START = 300;
const EXIT = 3000;

interface LineRun { end: string; spooks: number; home: number; t: number; x: number }

/** the bot plays the toy marsh: 3 cages by the start, then clumps A and B under a heron, then the exit (the goal: 3 home) */
function lineRun(who: FirstTimer, seed: number, preSpook = false, noLine = false): LineRun {
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
    // (no line: clump A starts 60 px before the stretch, so he stops in its first 40 px off the stretch, where the heron's calm never runs)
    const A = { x: noLine ? 840 : 1000, w: 300, y: Y, kind: 'wide' as const };
    const B = { x: 1700, w: 300, y: Y, kind: 'wide' as const };
    const zone: WatchZone = { x0: 900, x1: 2100, calm: [5, 5] };
    e.proto = { hints: [], covers: [], beats: [], movedPickups: [], bushes: [A, B], watch: [zone], follow: W2_FOLLOW };
    run.sim.stand(START, Y);
    e.startFollow();
    // (the three little ones already out of their cages, bunched behind him: the toy is the crossing, not the punch)
    if (!noLine) for (const c of cages) e.follow.free(c.critter, { x: c.x - 300, y: Y }, { x: c.x - 300, y: Y });
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
    return { end: run.end, spooks, home: e.follow.home(), t: +run.t.toFixed(1), x: Math.round(run.sim.p.x) };
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

/** the bot on 2-3's gen2 row, stood in beat 4's far clump with the whole line spooked back to the stretch's start (the heron's zone x0) */
/** beat 4 (cage 3's stretch, the boulder set on its mud) or beat 7 (cage 5's: three clumps, the longest walk back on the lay; no boulder) */
function hopBackRun(who: FirstTimer, cap = 60, at: 'clumps' | 'everything' = 'clumps'): { end: string; got: number; rescues: number; fetched: boolean } {
  freshPhone(who.setting);
  const mr = Math.random;
  Math.random = rng(5 * 104729 + 1311);
  try {
    const run = new FirstTimerRun('2-3', 5, who, { cap, dotSetting: true });
    const e = run.e as unknown as Record<string, any>;
    const cages = (e.collectibles as Collectible[]).filter((c) => c.type === 'cage').sort((a, b) => a.x - b.x);
    // (beat 4: the watched stretch whose clumps hold cage 3; the boulder on the mud between its clumps. R-165.363 (BUILD-23d) took 2-3's
    // boulder OFF the watched mud (lineFaults: no face there), so the toy sets the same rock (World 2's 50 px moss_stone, 117 wide, as
    // rolled on 11-20) back on this run's mud: the skill is proved on 2-3's real row with the face it is for)
    const ci = at === 'clumps' ? 2 : 4;
    const zone = (e.proto.watch as WatchZone[]).find((z) => cages[ci].x > z.x0 && cages[ci].x < z.x1)!;
    const clumps = (e.proto.bushes as Array<{ x: number; w: number; y: number }>).filter((b) => b.x + b.w > zone.x0 && b.x < zone.x1).sort((a, b) => a.x - b.x);
    assert.ok(zone && clumps.length >= 2, 'seed 5: beat 4, two clumps over open mud');
    const mud = { x0: clumps[0].x + clumps[0].w, x1: clumps[1].x };
    const rock = { id: 99001, x: Math.round((mud.x0 + mud.x1) / 2 - 58), y: clumps[0].y - 50, width: 117, height: 50, type: 'solid', style: 'moss_stone', landing: true } as unknown as Platform;
    if (at === 'clumps') (run.sim.platforms as Platform[]).push(rock);
    const far = at === 'clumps' ? clumps[1] : clumps[clumps.length - 1];
    for (const c of cages.slice(0, ci + 1)) c.collected = true;
    run.sim.stand(far.x + far.w / 2, far.y);
    for (let i = 0; i < 20; i++) run.sim.frame({});
    run.prog.relocate(run.sim.p);
    // (freed beside him in the far clump, in the line, then the heron's look sends them all back to the stretch's start, as in play)
    for (const c of cages.slice(0, ci + 1)) e.follow.free((c as { critter: string }).critter, { x: far.x + 40, y: far.y }, { x: far.x + 40, y: far.y });
    for (let i = 0; i < 90; i++) run.sim.frame({});
    for (const f of e.follow.line as Follower[]) spook(f, zone.x0);
    let fetched = false;
    const step = e.follow.step.bind(e.follow);
    e.follow.step = (...a: unknown[]) => {
      const ev = step(...a);
      if ((e.follow.line as Follower[]).every((f) => f.state !== 'spooked')) fetched = true;
      return ev;
    };
    // (until he has them back, and the line has walked on to the far clump: the crossing itself is the clump toy's, not this one's)
    run.play();
    return { end: run.end, got: e.follow.home(), rescues: run.rescues, fetched };
  } finally {
    Math.random = mr;
  }
}

test('hop-back (2-3 gen2 row, seed 5): the line spooked back past the boulder, he hops it on his way back and fetches them, no rescue', () => {
  for (const [name, who] of [['middle', FT_MIDDLE], ['adult', FT_ADULT]] as Array<[string, FirstTimer]>) {
    const r = hopBackRun(who);
    assert.ok(r.fetched, `${name}: never fetched ${JSON.stringify(r)}`);
    assert.equal(r.rescues, 0, `${name}: ${JSON.stringify(r)}`);
  }
});

test('planted: with hop-back off he stands against the boulder until he is rescued past it', () => {
  LINE_SKILL.hopBack = false;
  try {
    for (const [name, who] of [['middle', FT_MIDDLE], ['adult', FT_ADULT]] as Array<[string, FirstTimer]>) {
      const r = hopBackRun(who);
      assert.ok(!r.fetched || r.rescues > 0, `planted ${name}: fetched with no hop and no rescue ${JSON.stringify(r)}`);
    }
  } finally {
    LINE_SKILL.hopBack = true;
  }
});

test('fetch-clock (2-3 gen2 row, seed 5, beat 7: three clumps, the longest walk back): the child, at his own slow pace, fetches the whole line back with no rescue: the way back is not stuck', () => {
  const r = hopBackRun(FT_CHILD, 90, 'everything');
  assert.ok(r.fetched, `child: never fetched ${JSON.stringify(r)}`);
  assert.equal(r.rescues, 0, `child: ${JSON.stringify(r)}`);
});

test('planted: with the fetch clock off the child is rescued while he is still walking back for them', () => {
  LINE_SKILL.fetchClock = false;
  try {
    const r = hopBackRun(FT_CHILD, 90, 'everything');
    assert.ok(r.rescues > 0, `planted child: no rescue with the clock running through the fetch ${JSON.stringify(r)}`);
  } finally {
    LINE_SKILL.fetchClock = true;
  }
});

test('no-line-go: nobody in his line (the cages left shut), he walks through the reeds that start before the stretch and on to the sealed door, no wait for a look', () => {
  for (const [name, who] of WHO) for (const seed of SEEDS) {
    const r = lineRun(who, seed, false, true);
    assert.equal(r.end, 'sealed door', `${name} seed ${seed}: ${JSON.stringify(r)}`);
    assert.ok(r.t < 120, `${name} seed ${seed}: ${JSON.stringify(r)}`);
  }
});

test('planted: with no-line-go off the middle stands in the clump before the stretch waiting for a look that never comes, until the clock runs out', () => {
  LINE_SKILL.noLineGo = false;
  try {
    // (the middle, as in 2-3's traced run: the adult's late thumb slides him onto the stretch, where the calm runs, so he never deadlocked)
    for (const seed of SEEDS) {
      const r = lineRun(FT_MIDDLE, seed, false, true);
      assert.equal(r.end, 'time', `planted middle seed ${seed}: ${JSON.stringify(r)}`);
      assert.ok(r.x >= 860 && r.x < 900, `planted middle seed ${seed}: stopped off the stretch's first 40 px ${JSON.stringify(r)}`);
    }
  } finally {
    LINE_SKILL.noLineGo = true;
  }
});

void DT;
