// BOTS FIRST (level.md rule 21; ENG-B4, 1-8.md NEW 9): the bots run a laid chase before any level lays one. A real engine on a World 1 stage
// (no stage id, seed or x of the chase's is the bot's), its ground swapped for a planted branch: a run-up, a stretch with 1-1's single gaps
// cut into the lay's branch sections, a living fork, the far side. No tier bot, Normal or Easy, is ever caught by the front; the middle
// and expert tiers reach the fork on every seed (the child's crossing is OPEN, a todo below, with its numbers). PLANTED: a player who stops at every edge for longer than the stop budget is caught with the
// skill removed (noChaseStride), and the same player with it is not, so the skill is what passes the chase. Not yet here (named): the
// rolling nut and bouncing fruit are read below (ENG-B5): a hop for the nut, stay down under the fruit; PLANTED with the reading removed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_CHILD, FT_EXPERT, FT_MIDDLE, FT_MIDDLE_EASY, freshPhone, rng, type FirstTimer } from './firsttimer.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { CHASE_ROWS, type ChaseLay, type ChaseRun } from '../../src/game/chase.ts';
import { layStillFork, stillForks, type StillForkStage } from '../../src/game/gen2/stillFork.ts';
import { W1_STILL_FORK } from '../../src/game/gen2/worlds/w1Cast.ts';
import type { GeneratedStage } from '../../src/game/stageGenerator.ts';
import type { Platform, Vine } from '../../src/game/types.ts';
import { PIECE_KINDS } from '../../src/game/pieces/index.ts';
import { RUNNER_LIANA_PIECE } from '../../src/game/pieces/runnerLianaPiece.ts';
import type { RollSpec } from '../../src/game/rolling.ts';
import type { Rolling } from '../../src/game/pieces/rollingPiece.ts';

const Y = 500;
/** the branch: ground [x0, x1) in the lay's ~222 px sections, chase or not; the gaps are 1-1's singles (120 px) */
function branch(hazards = false): { plats: Platform[]; lay: ChaseLay; forkEnd: number } {
  const plats: Platform[] = [];
  let id = 9000;
  const ground = (x0: number, x1: number, chase: boolean) => {
    for (let x = x0; x < x1; x += 222) plats.push({ id: id++, x, y: Y, width: Math.min(222, x1 - x), height: 400, type: 'solid', ...(chase ? { chase: true } : {}) } as Platform);
  };
  ground(0, 1100, false);
  if (hazards) {
    // (the hazards' branch: the same run-up and gaps, laid one threat at a time (1-8.md: 1.5 s+ apart), so each hazard has a run of
    // ground to itself between two gaps: a stretch from 1100 to its fork at 4300)
    ground(1100, 1700, true);
    ground(1820, 2900, true);
    ground(3020, 4300, true);
    ground(4300, 4900, false);
    ground(4900, 6000, false);
    return { plats, lay: { stretches: [{ start: 1100, end: 4300 }] }, forkEnd: 4900 };
  }
  // (the stretch: from the crack at 1100 to its fork at 3700, with three single gaps)
  ground(1100, 1700, true);
  ground(1820, 2500, true);
  ground(2620, 3100, true);
  ground(3220, 3700, true);
  ground(3700, 4300, false);
  ground(4300, 5400, false);
  return { plats, lay: { stretches: [{ start: 1100, end: 3700 }] }, forkEnd: 4300 };
}

function onBranch(who: FirstTimer, seed: number, rolling?: RollSpec[]) {
  freshPhone(who.setting);
  setDifficulty(who.setting);
  Math.random = rng(seed);
  const b = branch(!!rolling);
  const route = Array.from({ length: rolling ? 150 : 120 }, (_, i) => ({ x: 300 + i * 40, y: Y }));
  const run = new FirstTimerRun('1-2', seed, who, { route, cap: 60 });
  const sim = run.sim as unknown as { bare(p: Platform[]): void; stand(x: number, y: number): void; e: { currentStage: GeneratedStage; player: { hp: number; maxHp: number; x: number }; proto: unknown; checkpoint: { x: number; y: number } } };
  sim.e.currentStage.chase = b.lay;
  (sim.e.currentStage as GeneratedStage).rolling = rolling;
  sim.bare(b.plats);
  sim.e.checkpoint = { x: 300, y: Y };
  sim.stand(300, Y);
  sim.e.player.hp = sim.e.player.maxHp;
  // (every heart lost on this branch is the chase's, nothing else here can hurt him: CAUGHT by the front with his feet on the branch,
  // or a FALL off it (a missed gap: the bots miss as the testers did, 1-1's calibration). Only a catch is the chase beating a runner)
  let caught = 0, falls = 0, far = 0, touched = 0;
  const dropped = new Set<number>();
  const e = sim.e as typeof sim.e & { player: { y: number; height: number } };
  const frame = (run as unknown as { sim: { frame: (pad: unknown) => void } }).sim.frame.bind(run.sim);
  (run.sim as unknown as { frame: (pad: unknown) => void }).frame = (pad: unknown) => {
    const hp = e.player.hp, feet = e.player.y + e.player.height, py0 = e.player.y, px0 = e.player.x, vx0 = (e.player as unknown as { vx: number }).vx;
    const rl = (sim.e as unknown as { pieces: Array<{ kind: string; list?: Rolling[] }> }).pieces.find((q) => q.kind === 'rolling')?.list ?? [];
    const sp = rl.map((h) => h.spent);
    frame(pad);
    // (counted as it happens: a respawn sets every hazard ahead of his flag waiting again)
    rl.forEach((h, i) => {
      if (h.phase !== 'wait') dropped.add(i);
      if (h.spent && !sp[i]) touched++;
    });
    if (process.env.CHASE_BOTS_DEBUG) rl.forEach((h, i) => { if (h.spent && !sp[i]) console.log('  TOUCH', h.spec.kind, h.spec.dropX, 'at', Math.round(h.x), Math.round(h.y), 'him', Math.round(px0), Math.round(py0), '->', Math.round(e.player.x), Math.round(e.player.y), 'vx', Math.round(vx0), 'pad', JSON.stringify(pad)); });
    if (e.player.hp < hp) {
      py0 > Y + 60 ? falls++ : caught++;
      if (process.env.CHASE_BOTS_DEBUG) console.log('  hurt', who.name, Math.round(px0), Math.round(feet), 'vx', Math.round(vx0));
    }
    far = Math.max(far, e.player.x);
  };
  run.play();
  if (process.env.CHASE_BOTS_DEBUG) console.log(who.name, seed, (run as unknown as { end: string }).end, run.harms.map((h) => `${h.kind}@${Math.round(h.x)},${Math.round(h.y)} t${h.t.toFixed(1)} ${h.cause}`).join(' '), 'far', Math.round(far), 'caught', caught, 'falls', falls, 't', (run as unknown as { t: number }).t.toFixed(1));
  setDifficulty('normal');
  return { caught, falls, far, forkStart: b.lay.stretches[0].end, touched, dropped: dropped.size };
}

const TIERS: FirstTimer[] = [FT_CHILD, FT_MIDDLE, FT_EXPERT, FT_MIDDLE_EASY];

for (const who of TIERS) {
  const child = who.name === 'CHILD';
  test(`chase bots: the ${who.name} bot on ${who.setting} on a laid stretch, three seeds: the front never catches him${child ? '' : '; he reaches the fork on every seed (a missed gap is a fall: a heart and the flag)'}`, () => {
    const rs = [1, 2, 3].map((seed) => ({ seed, ...onBranch(who, seed) }));
    for (const r of rs) assert.equal(r.caught, 0, `seed ${r.seed}: caught by the front ${r.caught} times`);
    if (!child) for (const r of rs) assert.ok(r.far >= r.forkStart + 100, `seed ${r.seed}: reached x ${Math.round(r.far)}, short of the fork at ${r.forkStart} (${r.falls} falls)`);
  });
}

// (ENG-B4's finding, OPEN for the Designer (R-165.206), shown as a todo, never hidden: the child tier on Normal reaches the fork on 1 of
// 3 seeds in 60 s. Every miss is a fall at a 120 px single gap (1-1's), never a catch: in stride he presses jump as his testers did, up
// to 232 px before an edge (aimQ), and on a chase a fall is a heart and back to the flag (on 1-1 it sets him back on the ledge). On the
// same branch with no chase he is slow too (seed 2: x 3,606 in 60 s). Whether the child must run 1-8's stretches in stride on Normal,
// or 1-8's gaps on a stretch are narrower, is a design call)
test('chase bots (OPEN, todo): the CHILD bot on Normal reaches the fork on 2 or more of 3 seeds', { todo: 'measured 1 of 3 (ENG-B4): every miss a fall at a 120 px gap, never a catch' }, () => {
  const through = [1, 2, 3].map((seed) => onBranch(FT_CHILD, seed)).filter((r) => r.far >= r.forkStart + 100);
  assert.ok(through.length >= 2, `reached the fork on ${through.length} of 3`);
});

test('chase bots, PLANTED (rule 21): a player who stops at every edge past the stop budget is caught without the skill and safe with it', () => {
  const budget = (CHASE_ROWS.normal.behind - CHASE_ROWS.normal.catchAt) / CHASE_ROWS.normal.base;
  const stop = +(budget + 0.6).toFixed(2);
  const stopper: FirstTimer = { ...FT_MIDDLE, name: 'STOPPER', lateShare: 0, standShare: 1, standQ: [stop, stop, stop, stop, stop] };
  const without = onBranch({ ...stopper, noChaseStride: true }, 1);
  assert.ok(without.caught >= 1, `without the skill, stopping ${stop} s at each edge (the stop budget is ${budget.toFixed(2)} s), he is caught: ${without.caught}`);
  const withIt = onBranch(stopper, 1);
  assert.equal(withIt.caught, 0, 'with it the same player keeps moving and is never caught');
  assert.ok(withIt.far >= withIt.forkStart + 100);
});

// (ENG-B5, 1-8.md NEW 2 + 9: the nut and the fruit on the hazards' branch. A teach nut and a teach fruit before the crack (beats 1-2),
// then on the stretch a nut and a fruit, each on its own run of ground between two gaps (one threat at a time, 1.5 s+ apart). Placed by
// the branch's own gaps: no x of the hazard's is the bot's or the engine's)
const HAZARDS: RollSpec[] = [
  { kind: 'low', dropX: 700, speed: 110, bounce: 8 },
  { kind: 'high', dropX: 1050, speed: 130, bounce: 160 },
  { kind: 'low', dropX: 2600, speed: 140, bounce: 8 },
  { kind: 'high', dropX: 3900, speed: 140, bounce: 165 },
];

for (const who of [FT_MIDDLE, FT_EXPERT, FT_MIDDLE_EASY]) {
  test(`chase bots read the nut and the fruit: the ${who.name} bot on ${who.setting}, three seeds: every hazard drops in, none touches him, the front never catches him, he reaches the fork`, () => {
    for (const seed of [1, 2, 3]) {
      const r = onBranch(who, seed, HAZARDS);
      assert.equal(r.dropped, HAZARDS.length, `seed ${seed}: ${r.dropped} of ${HAZARDS.length} dropped in`);
      assert.equal(r.touched, 0, `seed ${seed}: ${r.touched} touched him`);
      assert.equal(r.caught, 0, `seed ${seed}: caught ${r.caught}`);
      assert.ok(r.far >= r.forkStart + 100, `seed ${seed}: reached x ${Math.round(r.far)}`);
    }
  });
}

test('chase bots, PLANTED (rule 21): with the nut and fruit reading removed the same player is touched; with it he is not', () => {
  const without = [1, 2, 3].map((seed) => onBranch({ ...FT_MIDDLE, noRollRead: true }, seed, HAZARDS));
  assert.ok(without.every((r) => r.touched >= 1), `without the reading: touched ${without.map((r) => r.touched).join(', ')}`);
  const withIt = [1, 2, 3].map((seed) => onBranch(FT_MIDDLE, seed, HAZARDS));
  assert.ok(withIt.every((r) => r.touched === 0), `with it: touched ${withIt.map((r) => r.touched).join(', ')}`);
});

// (ENG-B6, 1-8.md NEW 7 + 9, beat 9: THE STILL FORK. A stretch, then a living fork the lay carpets in moss with the harpy eagle on its
// post past it (gen2/stillFork.ts, World 1's row), then a second stretch. Its one pass is called as he steps onto the fork at a full run
// and its eye crosses TOWARD him: the bot, who knows to hide from 1-7 (RunOptions.knows: a player plays the world in order), stops from
// the run in the moss, holds still through the pass, and runs on as the next crack sets off behind him. Placed by the branch's own fork:
// no x of the fork's is the bot's or the engine's)

function forkBranch(): { plats: Platform[]; lay: ChaseLay } {
  const plats: Platform[] = [];
  let id = 9500;
  const ground = (x0: number, x1: number, chase: boolean) => {
    for (let x = x0; x < x1; x += 222) plats.push({ id: id++, x, y: Y, width: Math.min(222, x1 - x), height: 400, type: 'solid', ...(chase ? { chase: true } : {}) } as Platform);
  };
  ground(0, 1100, false);
  ground(1100, 2900, true);
  ground(2900, 4300, false);
  ground(4300, 5600, true);
  ground(5600, 7000, false);
  return { plats, lay: { stretches: [{ start: 1100, end: 2900 }, { start: 4300, end: 5600 }] } };
}

function onStillFork(who: FirstTimer, seed: number, knows: string[]) {
  freshPhone(who.setting);
  setDifficulty(who.setting);
  Math.random = rng(seed);
  const b = forkBranch();
  const st: StillForkStage = { platforms: b.plats, chase: b.lay, enemies: [], checkpoints: [{ x: 4200 }], proto: {} };
  assert.deepEqual(layStillFork(st, 0, W1_STILL_FORK, 1), []);
  const fork = stillForks(st)[0];
  const route = Array.from({ length: 160 }, (_, i) => ({ x: 300 + i * 40, y: Y }));
  const run = new FirstTimerRun('1-2', seed, who, { route, cap: 70, knows });
  const sim = run.sim as unknown as { bare(p: Platform[]): void; stand(x: number, y: number): void; e: { currentStage: GeneratedStage; player: { hp: number; maxHp: number; x: number; vx: number }; proto: unknown; enemies: unknown[]; startCast(): void; checkpoint: { x: number; y: number }; cast: { members: Array<{ s: { phase: string } }> } | null; pieces: Array<{ kind: string; run?: ChaseRun }> } };
  sim.e.currentStage.chase = b.lay;
  sim.bare(b.plats);
  sim.e.enemies = st.enemies;
  sim.e.proto = { hints: [], ...st.proto };
  sim.e.startCast();
  sim.e.checkpoint = { x: 300, y: Y };
  sim.stand(300, Y);
  sim.e.player.hp = sim.e.player.maxHp;
  let hurt = 0, far = 0, stopped = false, inMossStill = 0, ranOnAfter = false, passOver = false, crackWithHim = NaN, fullAtFork = 0;
  const m = () => sim.e.cast!.members[0].s;
  const e = sim.e;
  const frame = (run as unknown as { sim: { frame: (pad: unknown) => void } }).sim.frame.bind(run.sim);
  (run.sim as unknown as { frame: (pad: unknown) => void }).frame = (pad: unknown) => {
    const hp = e.player.hp, x0 = e.player.x;
    if (Math.abs(x0 - fork.x0) < 30) fullAtFork = Math.max(fullAtFork, Math.abs(e.player.vx));
    frame(pad);
    if (e.player.hp < hp) hurt++;
    const p = e.player;
    if (process.env.CHASE_BOTS_DEBUG && (e.player.hp < hp || m().phase !== (onStillFork as unknown as { ph?: string }).ph)) {
      (onStillFork as unknown as { ph?: string }).ph = m().phase;
      console.log('  fork', who.name, seed, 't', (run.sim as unknown as { t: number }).t.toFixed(2), 'x', Math.round(p.x), 'vx', Math.round(p.vx), 'phase', m().phase, 'eye', Math.round((m() as unknown as { eyeX: number }).eyeX), e.player.hp < hp ? 'HURT' : '', 'cover', fork.cover.x, fork.cover.x + fork.cover.w);
    }
    const inMoss = p.x > fork.cover.x + 10 && p.x < fork.cover.x + fork.cover.w - 10;
    if (inMoss && Math.abs(p.vx) < 25 && m().phase !== 'rest') {
      stopped = true;
      inMossStill++;
    }
    if (m().phase === 'rest' && stopped) passOver = true;
    if (passOver && p.x > fork.x1 + 200) ranOnAfter = true;
    const ch = e.pieces.find((q) => q.kind === 'chase')?.run;
    if (ch && !Number.isFinite(crackWithHim) && ch.fronts[1].active) crackWithHim = p.x;
    far = Math.max(far, p.x);
  };
  run.play();
  setDifficulty('normal');
  return { hurt, far, stopped, inMossStill, ranOnAfter, crackWithHim, fork, fullAtFork };
}

for (const who of [FT_MIDDLE, FT_EXPERT, FT_MIDDLE_EASY]) {
  test(`chase bots at the still fork: the ${who.name} bot on ${who.setting}, three seeds: at a full run onto the fork, he stops in the moss, holds still through the eagle's pass, no heart, and runs on as the next crack sets off`, () => {
    for (const seed of [1, 2, 3]) {
      const r = onStillFork(who, seed, ['hide']);
      assert.ok(r.fullAtFork >= 250, `seed ${seed}: onto the fork at ${Math.round(r.fullAtFork)} px/s (a full run)`);
      assert.ok(r.stopped && r.inMossStill >= 15, `seed ${seed}: still in the moss for ${r.inMossStill} frames through the pass`);
      assert.equal(r.hurt, 0, `seed ${seed}: ${r.hurt} hearts`);
      assert.ok(r.ranOnAfter, `seed ${seed}: did not run on after the pass (far ${Math.round(r.far)})`);
      assert.ok(r.crackWithHim >= r.fork.x1 && r.crackWithHim < r.fork.x1 + 60, `seed ${seed}: the next crack set off with him at ${Math.round(r.crackWithHim)}`);
    }
  });
}

test('chase bots, PLANTED (rule 21): at the still fork a player without the hide runs on into the eagle\'s pass and is dived on; with it he is not', () => {
  const without = [1, 2, 3].map((seed) => onStillFork(FT_MIDDLE, seed, []));
  assert.ok(without.every((r) => r.hurt >= 1), `without the hide: hearts ${without.map((r) => r.hurt).join(', ')}`);
  const withIt = [1, 2, 3].map((seed) => onStillFork(FT_MIDDLE, seed, ['hide']));
  assert.ok(withIt.every((r) => r.hurt === 0), `with it: hearts ${withIt.map((r) => r.hurt).join(', ')}`);
});

// (ENG-B6, 1-8.md NEW 4 + 9: A LIANA PHASED TO A RUNNER. A run-up, a gap, a liana 250 px past the lip marked `runner`, the far bank.
// Its plain swing is luck at a run (a run's jump meets it at 5 of 12 moments, runnerLiana.test.ts), so a tier bot stands at the lip and
// watches it come (lianaWait); phased (pieces/runnerLianaPiece.ts) it swings to meet him and he catches it in stride: no stand, no wait.
// From six moments its swing may start at; no x of the liana's is the bot's or the engine's)

const RL_LIP = 2600, RL_D0 = 250;
function onRunnerLiana(who: FirstTimer, phase: number, seed = 1) {
  freshPhone(who.setting);
  setDifficulty(who.setting);
  Math.random = rng(seed);
  const plats: Platform[] = [];
  let id = 9800;
  for (let x = 0; x < RL_LIP; x += 222) plats.push({ id: id++, x, y: Y, width: Math.min(222, RL_LIP - x), height: 400, type: 'solid' } as Platform);
  plats.push({ id: id++, x: RL_LIP + RL_D0 + 230, y: Y, width: 1800, height: 400, type: 'solid' } as Platform);
  const v: Vine = { id: 88, x: RL_LIP + RL_D0, topY: Y - 380, bottomY: Y + 30, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, swingPhase: phase, runner: true };
  const route = [...Array.from({ length: 66 }, (_, i) => ({ x: 300 + i * 35, y: Y })), { x: v.x, y: Y - 60 }, ...Array.from({ length: 30 }, (_, i) => ({ x: RL_LIP + RL_D0 + 300 + i * 40, y: Y }))];
  const run = new FirstTimerRun('1-2', seed, who, { route, cap: 30 });
  const sim = run.sim as unknown as { bare(p: Platform[], v: Vine[]): void; stand(x: number, y: number): void; e: { currentStage: GeneratedStage; player: { hp: number; maxHp: number; x: number; y: number; vx: number; grounded: boolean; isVineSwinging?: boolean; swingVineId?: number }; checkpoint: { x: number; y: number }; vineClock: number } };
  sim.e.currentStage.vines = [v];
  sim.bare(plats, [v]);
  sim.e.checkpoint = { x: 300, y: Y };
  sim.stand(300, Y);
  sim.e.vineClock = 0;
  let stood = 0, waitWas = 0, caughtAt = NaN, tookOff = NaN, slowest = Infinity, far = 0, t = 0, fell = 0;
  const e = sim.e;
  const frame = (run as unknown as { sim: { frame: (pad: unknown) => void } }).sim.frame.bind(run.sim);
  (run.sim as unknown as { frame: (pad: unknown) => void }).frame = (pad: unknown) => {
    const was = e.player.grounded, hp = e.player.hp;
    frame(pad);
    t += 1 / 30;
    const p = e.player;
    if (e.player.hp < hp) fell++;
    if (p.grounded && p.x > RL_LIP - 800 && p.x < RL_LIP) slowest = Math.min(slowest, Math.abs(p.vx));
    // (the time he stood at the lip watching the liana come: the bot's own wait for it, lianaWait; a thumb's slip on the way is his
    // testers' calibration, never the liana's doing)
    const w = (run as unknown as { lianaWaitT: number }).lianaWaitT;
    if (w > waitWas) stood += w - waitWas;
    waitWas = w;
    if (was && !p.grounded && p.x > RL_LIP - 200 && p.x <= RL_LIP + 20 && !Number.isFinite(tookOff)) tookOff = t;
    if (p.isVineSwinging && p.swingVineId === v.id && !Number.isFinite(caughtAt)) caughtAt = t;
    far = Math.max(far, p.x);
  };
  run.play();
  setDifficulty('normal');
  return { stood, slowest, inStride: Number.isFinite(caughtAt) && Number.isFinite(tookOff) && caughtAt - tookOff < 1, far, fell, farBank: RL_LIP + RL_D0 + 230 };
}

const RL_PHASES = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6];
/** the tier's player taking every edge in stride (no calibrated stand or late press: the STOPPER's opposite), so any stand at the lip
 *  is the liana's doing (a tier bot otherwise stands at about half its edges, as its testers did: firsttimer.ts standShare) */
const strider = (who: FirstTimer): FirstTimer => ({ ...who, name: `${who.name} STRIDER`, standShare: 0, lateShare: 0 });
for (const who of [FT_EXPERT].map(strider)) {
  test(`chase bots and the runner liana: the ${who.name} bot on ${who.setting}, from six moments of its swing: he never stands at the lip, catches it in stride and reaches the far bank`, () => {
    for (const ph of RL_PHASES) {
      const r = onRunnerLiana(who, ph);
      assert.ok(r.stood < 0.1, `swing at ${ph.toFixed(2)}: stood ${r.stood.toFixed(2)} s at the lip waiting for it`);
      assert.ok(r.inStride, `swing at ${ph.toFixed(2)}: not caught within a second of his take-off`);
      assert.ok(r.far >= r.farBank + 100, `swing at ${ph.toFixed(2)}: reached ${Math.round(r.far)}, short of the far bank (${r.fell} falls)`);
    }
  });
}

// (OPEN, todo, named with its numbers (ENG-B6): the MIDDLE tier's strider, Normal and Easy, still stands at the lip from some moments.
// Not the liana's doing: about 200 px before the lip his own approach stops him (pad empty, liana wait 0, edge 'run'), his full run ends,
// so the liana keeps its plain swing there (RUNNER.atRun, as promised: a run), and from a stand his hop misses, so he waits (lianaWait).
// Measured, stood at the lip by the swing's starting moment: plain 1.33 0.87 0.40 0.00 0.00 1.07 s, phased 1.60 1.10 0.40 0.27 0.13 0.00
// (Normal). Whether the middle tier's approach to a lip should run on in stride on a chase is the bot calibration's call (BOTS.md))
for (const who of [FT_MIDDLE, FT_MIDDLE_EASY].map(strider)) {
  test(`chase bots and the runner liana (OPEN, todo): the ${who.name} bot on ${who.setting} never stands at the lip`, { todo: 'his own stop ~200 px before the lip ends the run (see above)' }, () => {
    for (const ph of RL_PHASES) assert.ok(onRunnerLiana(who, ph).stood < 0.1);
  });
}

test('chase bots, PLANTED (rule 21): the liana not phased (the piece off the hook), the same strider stands at the lip to wait for it from some moments; phased, from none', () => {
  const who = strider(FT_EXPERT);
  const i = PIECE_KINDS.indexOf(RUNNER_LIANA_PIECE);
  PIECE_KINDS.splice(i, 1);
  let plain: number[];
  try {
    plain = RL_PHASES.map((ph) => onRunnerLiana(who, ph).stood);
  } finally {
    PIECE_KINDS.splice(i, 0, RUNNER_LIANA_PIECE);
  }
  const phased = RL_PHASES.map((ph) => onRunnerLiana(who, ph).stood);
  const say = (a: number[]) => a.map((w) => w.toFixed(2)).join(', ');
  console.log(`stood at the lip (s), by the swing's starting moment: plain swing ${say(plain)}; phased ${say(phased)}`);
  assert.ok(plain.filter((w) => w >= 0.3).length >= 2, `without phasing he waited at ${plain.filter((w) => w >= 0.3).length} of ${RL_PHASES.length}`);
  assert.ok(phased.every((w) => w < 0.1), `phased: ${say(phased)}`);
});
