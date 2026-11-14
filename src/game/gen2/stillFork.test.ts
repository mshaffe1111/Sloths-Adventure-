/**
 * 1-8 NEW 7, THE STILL FORK (ENG-B6, gen2/stillFork.ts): a living fork of a laid chase made the one place to stop. The kit's sweeper calls
 * ONE pass (Post.passes), the lay puts the cover and the perched watcher on any chase's fork by data and refuses a fork that cannot hold
 * them by name, and on the real engine: the collapse holds at the fork, the screech comes as he arrives, its warn shows before its eye
 * crosses TOWARD him, a runner who does not stop is dived on, one who stops in the moss and holds still is never touched, and when he
 * leaves a new crack sets off behind him. Easy's pass is harmless. PLANTED: the one-pass rule fails on the base kit (core.ts without
 * Post.passes calls a second pass); the "running on is caught" test fails with the eye crossing his way (facing 1).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { newPredator, stepPredator } from '../predators/core.ts';
import { EAGLE } from '../predators/world1.ts';
import type { Prey } from '../predators/types.ts';
import { RealPlay } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import type { ChaseLay } from '../chase.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { Platform } from '../types.ts';
import { layStillFork, stillForks, stillReach, STILL_FORK, type StillForkStage } from './stillFork.ts';
import { W1_STILL_FORK } from './worlds/w1Cast.ts';

const Y = 500;
const dt = 1 / 30;

test('the kit: a sweeper with one pass (Post.passes 1) calls it, then never another, however long he stays in its stretch', () => {
  const s = newPredator(EAGLE, { x: 600, y: Y - 120, minX: 0, maxX: 1200, perched: true, facing: -1, passes: 1 });
  const hero: Prey = { x: 300, y: Y, still: true, covered: true, facing: 1 } as Prey;
  let calls = 0;
  for (let i = 0; i < 40 * 30; i++) if (stepPredator(EAGLE, s, { dt, t: i * dt, hero, easy: false }).notice) calls++;
  assert.equal(calls, 1, `it called ${calls} passes in 40 s`);
  // (and it is not beaten, gone or leaving: nothing counts it cleared, castPlay.ts)
  assert.equal(s.phase, 'rest');
  assert.equal(s.leaving, false);
  // (the same sweeper with no budget keeps calling them, the 1-7 eagle's way)
  const free = newPredator(EAGLE, { x: 600, y: Y - 120, minX: 0, maxX: 1200, perched: true, facing: -1 });
  let more = 0;
  for (let i = 0; i < 40 * 30; i++) if (stepPredator(EAGLE, free, { dt, t: i * dt, hero, easy: false }).notice) more++;
  assert.ok(more >= 3, `with no budget it called ${more}`);
});

/** a planted chase: a run-up, stretch 0, a living fork, stretch 1, the far ground (the lay's ~222 px sections) */
function branch(fork = 1400, gapAt?: number): { plats: Platform[]; lay: ChaseLay } {
  const plats: Platform[] = [];
  let id = 7000;
  const ground = (x0: number, x1: number, chase: boolean) => {
    for (let x = x0; x < x1; x += 222) {
      const w = Math.min(222, x1 - x);
      if (gapAt !== undefined && gapAt >= x && gapAt < x + w) continue;
      plats.push({ id: id++, x, y: Y, width: w, height: 400, type: 'solid', ...(chase ? { chase: true } : {}) } as Platform);
    }
  };
  ground(0, 900, false);
  ground(900, 2900, true);
  ground(2900, 2900 + fork, false);
  ground(2900 + fork, 2900 + fork + 2000, true);
  ground(2900 + fork + 2000, 2900 + fork + 3600, false);
  return { plats, lay: { stretches: [{ start: 900, end: 2900 }, { start: 2900 + fork, end: 2900 + fork + 2000 }] } };
}

const stage = (b = branch()): StillForkStage => ({ platforms: b.plats, chase: b.lay, enemies: [], checkpoints: [{ x: 2900 + 1300 }], proto: {} });

test('the lay: on fork 0 the moss carpet lies on the fork just past where the collapse stops, one perched eagle past it, its one pass toward him', () => {
  const st = stage();
  assert.deepEqual(layStillFork(st, 0, W1_STILL_FORK, 1), []);
  const [f] = stillForks(st);
  assert.ok(f, 'read back from the data');
  assert.equal(f.cover.kind, 'moss');
  assert.equal(f.cover.x, 2900 + STILL_FORK.runIn);
  assert.equal(f.cover.y, Y);
  assert.equal(f.watcher.kitPerch, true);
  assert.equal(f.watcher.facing, -1, 'its eye crosses toward him');
  assert.equal(f.watcher.kitPasses, 1);
  assert.ok(f.watcher.x >= f.cover.x + f.cover.w + STILL_FORK.postPast && f.watcher.x < f.x1, `its post at ${f.watcher.x}, on the fork past the cover`);
  assert.ok(Math.abs(f.watcher.x - 4200) >= STILL_FORK.flagClear, 'clear of the fork\'s flag');
  assert.equal(f.watcher.patrolMinX, 2900);
  assert.equal(f.watcher.patrolMaxX, Math.round(2900 + stillReach('eagle', 1)));
  // (a runner who never stops is still in its stretch when its eye has crossed to him: its warn at Easy's longest, at his top run)
  assert.ok(stillReach('eagle', 1) >= EAGLE.warn! * EAGLE.easy.tell * 285 + EAGLE.sight.ahead, `reach ${stillReach('eagle', 1)}`);
  assert.deepEqual(st.proto?.cast?.kinds, ['eagle']);
});

test('the lay refuses by name, laying nothing: a short fork, ground that breaks, a rock in the cover, the last stretch, a stretch already watched', () => {
  const cases: Array<[string, StillForkStage, number, RegExp]> = [
    ['short', stage(branch(380)), 0, /px of fork, the cover and the post need/],
    ['gap', stage(branch(1400, 3200)), 0, /its ground breaks at/],
    ['last', stage(), 1, /no crack would set off/],
  ];
  const rock = stage();
  rock.platforms.push({ id: 1, x: 3100, y: Y - 40, width: 60, height: 40, type: 'solid' } as Platform);
  cases.push(['rock', rock, 0, /a rock at 3100 stands in the cover/]);
  const twice = stage();
  assert.deepEqual(layStillFork(twice, 0, W1_STILL_FORK, 1), []);
  cases.push(['twice', twice, 0, /a watcher already looks over/]);
  for (const [name, st, fork, want] of cases) {
    const n = st.enemies.length, b = st.proto?.bushes?.length ?? 0;
    const bad = layStillFork(st, fork, W1_STILL_FORK, 1);
    assert.ok(bad.some((m) => want.test(m)), `${name}: ${bad.join('; ')}`);
    assert.equal(st.enemies.length, n, `${name}: laid an animal`);
    assert.equal(st.proto?.bushes?.length ?? 0, b, `${name}: laid a cover`);
  }
});

/** the real engine on the planted branch with the still fork laid: he runs right, and `stopInMoss` stops him in the moss until the pass is over */
function playFork(setting: 'normal' | 'easy', how: 'run' | 'stop', facing?: 1 | -1) {
  setDifficulty(setting);
  const st = stage();
  assert.deepEqual(layStillFork(st, 0, W1_STILL_FORK, 1), []);
  if (facing) st.enemies[0].facing = facing;
  const sim = new RealPlay('1-2', 1);
  sim.safe = false;
  const e = sim.e as unknown as { currentStage: GeneratedStage; proto: unknown; enemies: unknown[]; startCast(): void; checkpoint: unknown; cast: { members: Array<{ s: { phase: string; eyeX: number; t: number } }> } | null; pieces: Array<{ kind: string; run?: { fronts: Array<{ front: number; active: boolean }> } }>; player: { hp: number; maxHp: number } };
  e.currentStage.chase = st.chase;
  sim.bare(st.platforms);
  e.enemies = st.enemies;
  // (the engine's proto as a built stage carries it: its hints, and the cover and cast the lay wrote)
  e.proto = { hints: [], ...st.proto };
  e.startCast();
  e.checkpoint = { x: 300, y: Y };
  sim.stand(300, Y);
  e.player.hp = e.player.maxHp;
  const cover = st.proto!.bushes![0];
  const m = e.cast!.members[0].s;
  const ch = () => e.pieces.find((q) => q.kind === 'chase')!.run!;
  let notice = NaN, eyeFrom = NaN, hurt = 0, passOver = NaN, maxFront0 = -Infinity, crack1 = NaN, warnAt = m.eyeX;
  const p = sim.p;
  for (let i = 0; i < 30 * 30; i++) {
    const t = i * dt;
    const inMoss = p.x > cover.x + 40 && p.x < cover.x + cover.w - 40;
    const stopping = how === 'stop' && Number.isFinite(notice) && !Number.isFinite(passOver);
    const hp = e.player.hp;
    sim.frame(stopping ? (inMoss ? {} : { left: p.x > cover.x + cover.w - 40, right: p.x < cover.x + 40 }) : { right: true });
    if (e.player.hp < hp) hurt++;
    if (!Number.isFinite(notice) && m.phase === 'hunt') notice = t;
    if (Number.isFinite(notice) && !Number.isFinite(eyeFrom) && m.eyeX !== warnAt) eyeFrom = t;
    if (Number.isFinite(notice) && !Number.isFinite(passOver) && m.phase === 'rest') passOver = t;
    if (!Number.isFinite(notice)) warnAt = m.eyeX;
    maxFront0 = Math.max(maxFront0, ch().fronts[0].front);
    if (!Number.isFinite(crack1) && ch().fronts[1].active) crack1 = p.x;
    if (p.x > 2900 + 1400 + 2400) break;
  }
  setDifficulty('normal');
  return { notice, eyeFrom, hurt, passOver, maxFront0, crack1, far: p.x, calls: m };
}

test('real engine, Normal: he arrives at a full run and the screech comes at once; the warn shows 2 s before the eye starts across', () => {
  const r = playFork('normal', 'run');
  assert.ok(Number.isFinite(r.notice), 'the pass was called');
  // (he steps onto the fork at 2,900 px at his top run, from the run-up's 300: (2900 - 300) / 285 = 9.1 s; the call within a step or two)
  assert.ok(Math.abs(r.notice - (2900 - 300) / 285) < 0.5, `the screech at ${r.notice.toFixed(2)} s`);
  assert.ok(r.eyeFrom - r.notice >= EAGLE.warn! - 0.05, `its eye started ${(r.eyeFrom - r.notice).toFixed(2)} s after the screech`);
});

test('real engine, Normal: running on through the still fork, the eagle dives on him (a heart); stopping in the moss and holding still, never', () => {
  const run = playFork('normal', 'run');
  assert.ok(run.hurt >= 1, `ran through: ${run.hurt} hearts`);
  const stop = playFork('normal', 'stop');
  assert.equal(stop.hurt, 0, `stopped in the moss: ${stop.hurt} hearts`);
  assert.ok(Number.isFinite(stop.passOver), 'the pass ended');
  // (the collapse held at the fork while he waited; and as he left it a new crack set off behind him, at the next stretch's start)
  assert.ok(stop.maxFront0 <= 2900 + 1e-6, `the front reached ${Math.round(stop.maxFront0)}`);
  assert.ok(Number.isFinite(stop.crack1) && stop.crack1 >= 4300 && stop.crack1 < 4300 + 40, `the next crack set off with him at ${Math.round(stop.crack1)}`);
  assert.ok(stop.far > 4300 + 2000, 'he ran on to the far ground');
});

test('real engine, PLANTED: with its eye crossing his way (facing 1) a runner who never stops gets through untouched; toward him he does not', () => {
  const his = playFork('normal', 'run', 1);
  assert.equal(his.hurt, 0, `its eye going his way: ${his.hurt} hearts (it never reaches him)`);
  const toward = playFork('normal', 'run');
  assert.ok(toward.hurt >= 1);
});

test('real engine, Easy: the still fork\'s one pass is harmless even to a runner (Easy\'s first pass is free, core.ts sparedPass)', () => {
  const r = playFork('easy', 'run');
  assert.ok(Number.isFinite(r.notice));
  assert.equal(r.hurt, 0, `Easy: ${r.hurt} hearts`);
});
