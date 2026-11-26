/**
 * engineProbe.ts (ENG-SIM step 1, R-165.470): the copy keeps what it must, the restore is in place, a probe on the real harness is
 * invisible (the graph prints the same after) and exact (its flight is the live flight, frame for frame), its hooks and its stream come
 * back, the declared share is frozen, and the module play stores and the phone's storage written in a probe are put back. The gate over
 * every world is tools/engine/probeEqual.test.ts.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deepFork, graphPrint, NEVER_CHANGES, probe, restore, SHARE_STATS, sharedPath, snapshot, stageWalk } from './engineProbe.ts';
import { RealPlay, type Pad } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { markTipHeard, tipHeard } from './tipMemory.ts';
import { guideShown, takeGuideShown } from './guideShown.ts';
import { grownSteps, helpLineOnScreen, setGrownSteps, takeHelpOnScreen } from './helpLadder.ts';
import { memStorage, withLocalStorage } from './saveFill.ts';
import { playStoreNames } from './playStores.ts';

/** a seeded stream (mulberry32), so the harness's own chances are the same in every twin */
const stream = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const PAD = (i: number): Pad => ({ right: i % 200 < 150, left: i % 200 >= 170, jump: i % 37 < 6, press: i % 37 === 0 });
const CAND: Pad[] = Array.from({ length: 45 }, (_, k) => ({ right: true, jump: k < 5, press: k === 0 }));
const body = (e: Record<string, any>) => [e.player.x, e.player.y, e.player.vx, e.player.vy].join(' ');
/** 2-4 seed 35 on Easy, 8 s into the spike's fixed pad, on its own seeded stream */
function harness(): RealPlay {
  setDifficulty('easy');
  const mr = Math.random;
  Math.random = stream(1);
  try {
    const sim = new RealPlay('2-4', 35);
    for (let i = 0; i < 240; i++) sim.frame(PAD(i));
    return sim;
  } finally {
    Math.random = mr;
  }
}

test('deepFork: prototypes and cycles kept, frozen objects shared, Maps, Sets and typed arrays copied', () => {
  class P { constructor(public n: number) {} twice() { return this.n * 2; } }
  const frozen = Object.freeze({ k: 1 });
  const a: Record<string, any> = { p: new P(3), frozen, m: new Map([['x', { y: 1 }]]), s: new Set([1]), b: new Float32Array([1, 2]) };
  a.self = a;
  const c = deepFork(a);
  assert.notEqual(c, a);
  assert.equal(c.self, c, 'the cycle is kept');
  assert.equal(c.p.twice(), 6, 'the prototype is kept');
  assert.equal(c.frozen, frozen, 'a frozen object is shared');
  assert.notEqual(c.m, a.m);
  assert.notEqual(c.m.get('x'), a.m.get('x'));
  assert.notEqual(c.b, a.b);
  assert.deepEqual([...c.b], [1, 2]);
});

test('restore: every saved object written back in place (its identity kept), a key added after the snapshot taken off', () => {
  const inner = { v: 1 };
  const list = [inner];
  const e: Record<string, any> = { gameTime: 5, inner, list, m: new Map([[1, inner]]) };
  const s = snapshot(e, e);
  inner.v = 9;
  list.push({ v: 2 });
  e.extra = true;
  e.m.delete(1);
  e.gameTime = 7;
  restore(e, s);
  assert.equal(e.inner, inner, 'the same object');
  assert.equal(inner.v, 1);
  assert.equal(e.list, list);
  assert.equal(list.length, 1);
  assert.equal(list[0], inner);
  assert.equal(e.m.get(1), inner);
  assert.equal('extra' in e, false);
  assert.equal(e.gameTime, 5);
});

test('a probe on the real harness: the graph prints the same after, and its flight is the live flight frame for frame (2-4 seed 35)', () => {
  const sim = harness();
  const g0 = graphPrint(sim);
  const r = probe(sim, CAND, (e) => body(e));
  assert.equal(graphPrint(sim), g0, 'the graph print changed');
  assert.equal(r.rows.length, CAND.length);
  assert.equal(r.died, null);
  const twin = harness();
  const live = CAND.map((p) => (twin.frame(p), body(twin.e)));
  assert.deepEqual(r.rows, live, "the probe's flight is not the live flight");
});

test('a probe: a life lost ends the flight and is noted, the harness hooks, its died flag and Math.random come back', () => {
  const sim = harness();
  const e = sim.e as Record<string, any>;
  const hooks = [e.loseLife, e.callbacks.onGuide];
  const mr = Math.random;
  const r = probe(sim, CAND, (en, i) => {
    if (i === 2) en.loseLife('water');
    return i;
  });
  assert.equal(r.died, 'water');
  assert.equal(r.frames, 3);
  assert.deepEqual(r.rows, [0, 1, 2]);
  assert.deepEqual([e.loseLife, e.callbacks.onGuide], hooks, 'a hook was not put back');
  assert.equal(sim.died, false);
  assert.equal(Math.random, mr);
});

test('the declared share: frozen at the first probe, so a write to one THROWS; every entry says why', () => {
  const sim = harness();
  // (walked before the probe: the walk passes over frozen objects)
  const declared = [...stageWalk(sim.e as Record<string, any>)].filter(([o, p]) => NEVER_CHANGES.some((s) => sharedPath(p, s)) && !(o instanceof Map || o instanceof Set || ArrayBuffer.isView(o)));
  assert.ok(declared.length > 100, `declared objects on 2-4: ${declared.length}`);
  probe(sim, CAND.slice(0, 3), () => 0);
  assert.ok(SHARE_STATS.frozen > 0, 'nothing was frozen');
  assert.deepEqual(declared.filter(([o]) => !Object.isFrozen(o)).map(([, p]) => p), [], 'a declared object was not frozen');
  const cfg = (sim.e as Record<string, any>).currentStage.config;
  assert.ok(Object.isFrozen(cfg));
  assert.throws(() => { cfg.id = 'x'; }, TypeError);
  for (const s of NEVER_CHANGES) assert.ok(s.why.length > 20, `${s.path} says why`);
});

test('the module play stores and the phone storage written inside a probe are put back (tipMemory, guideShown, helpLadder)', () => {
  assert.deepEqual(playStoreNames().sort(), ['guideShown', 'helpLadder', 'tipMemory']);
  const sim = harness();
  const steps = grownSteps();
  const mem = memStorage({ keep: '1' });
  takeGuideShown();
  takeHelpOnScreen();
  withLocalStorage(mem, () => {
    probe(sim, CAND.slice(0, 2), (_e, i) => {
      if (i === 0) {
        markTipHeard('9-9', 'probe-tip');
        guideShown('a line said inside the probe');
        helpLineOnScreen('Ooh, look! A step. Up you go.');
        setGrownSteps([{ x: 1, y: 2, width: 3, height: 4 }]);
        localStorage.setItem('written', 'in the probe');
        localStorage.removeItem('keep');
      }
      return 0;
    });
  });
  assert.equal(tipHeard('9-9', 'probe-tip'), false, 'a tip sent in the probe stays sent');
  assert.deepEqual(takeGuideShown(), [], 'a line shown in the probe stays shown');
  assert.equal(takeHelpOnScreen(), null);
  assert.equal(grownSteps(), steps);
  assert.deepEqual([...mem.m], [['keep', '1']]);
});

test("the let-go cue memo: a flight's memo gains a table only where the engine builds one, never one an earlier probe built", () => {
  // (ENG-SIM box 5: the probe-equality gate's 2-4 seed 35 row. The probe lent the tables earlier flights built by putting them in the
  // live memo at a flight's start, so inside the bot's own flight the memo held the table one of the gate's probes had built where the
  // unprobed run's held the bot's: a probe that changed a later probe's world. A toy engine with the real memo's shape, engine.ts
  // letGoNow: look the key up; if absent, clear at 8, build through engine.cueTable, keep it.)
  class Toy {
    cueTables = new Map<string, { key: string }>();
    currentStage = {};
    gameTime = 0;
    key = '';
    builds = 0;
    cueTable(key: string): { key: string } {
      this.builds++;
      return { key };
    }
    step(): void {
      if (this.cueTables.has(this.key)) return;
      if (this.cueTables.size >= 8) this.cueTables.clear();
      this.cueTables.set(this.key, this.cueTable(this.key));
    }
  }
  const e = new Toy();
  const sim = { e, frame: (k: string) => { e.key = k; e.step(); } };
  sim.frame('live');
  probe(sim, ['gate'], () => 0);
  const seen: string[][] = [];
  probe(sim, ['bot'], (q) => { seen.push([...q.cueTables.keys()]); return 0; });
  assert.deepEqual(seen, [['live', 'bot']], "a table an earlier probe built sits in a later flight's memo");
  assert.deepEqual([...e.cueTables.keys()], ['live'], 'the memo is put back as found');
  assert.equal(Object.prototype.hasOwnProperty.call(e, 'cueTable'), false, "the flight's build is taken off");
  const n = e.builds;
  probe(sim, ['gate'], (q) => { seen.push([...q.cueTables.keys()]); return 0; });
  assert.equal(e.builds, n, 'a table a flight built is lent to the next flight that needs it, never built twice');
  assert.deepEqual(seen[1], ['live', 'gate']);
});
