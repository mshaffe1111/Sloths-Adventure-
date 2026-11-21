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
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT } from '../../src/game/realPlay.ts';
import { FirstTimerRun, FT_ADULT, FT_MIDDLE, LINE_SKILL, freshPhone, rng, type FirstTimer } from './firsttimer.ts';
import { spook, type Follower } from '../../src/game/follow.ts';
import { W2_FOLLOW } from '../../src/game/gen2/worlds/w2.ts';
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

/** the bot on 2-3's gen2 row, stood in beat 4's far clump with the whole line spooked back to the stretch's start (the heron's zone x0) */
function hopBackRun(who: FirstTimer): { end: string; got: number; rescues: number; fetched: boolean } {
  freshPhone(who.setting);
  const mr = Math.random;
  Math.random = rng(5 * 104729 + 1311);
  try {
    const run = new FirstTimerRun('2-3', 5, who, { cap: 60, dotSetting: true });
    const e = run.e as unknown as Record<string, any>;
    const cages = (e.collectibles as Collectible[]).filter((c) => c.type === 'cage').sort((a, b) => a.x - b.x);
    // (beat 4: the watched stretch whose clumps hold cage 3; the boulder on the mud between its clumps)
    const zone = (e.proto.watch as WatchZone[]).find((z) => cages[2].x > z.x0 && cages[2].x < z.x1)!;
    const rock = (run.sim.platforms as Platform[]).find((q) => (q as { style?: string }).style === 'moss_stone' && q.x > zone.x0 + 200 && q.x < cages[2].x)!;
    assert.ok(zone && rock, 'seed 5: beat 4 with its boulder between the clumps');
    const far = (e.proto.bushes as Array<{ x: number; w: number; y: number }>).find((b) => b.x > rock.x && b.x < zone.x1)!;
    for (const c of cages.slice(0, 3)) c.collected = true;
    run.sim.stand(far.x + far.w / 2, far.y);
    for (let i = 0; i < 20; i++) run.sim.frame({});
    run.prog.relocate(run.sim.p);
    // (freed beside him in the far clump, in the line, then the heron's look sends them all back to the stretch's start, as in play)
    for (const c of cages.slice(0, 3)) e.follow.free((c as { critter: string }).critter, { x: far.x + 40, y: far.y }, { x: far.x + 40, y: far.y });
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

void DT;
