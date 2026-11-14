// BOTS FIRST (level.md rule 21; ENG-B4, 1-8.md NEW 9): the bots run a laid chase before any level lays one. A real engine on a World 1 stage
// (no stage id, seed or x of the chase's is the bot's), its ground swapped for a planted branch: a run-up, a stretch with 1-1's single gaps
// cut into the lay's branch sections, a living fork, the far side. No tier bot, Normal or Easy, is ever caught by the front; the middle
// and expert tiers reach the fork on every seed (the child's crossing is OPEN, a todo below, with its numbers). PLANTED: a player who stops at every edge for longer than the stop budget is caught with the
// skill removed (noChaseStride), and the same player with it is not, so the skill is what passes the chase. Not yet here (named): the
// rolling nut and bouncing fruit (no such hazard in src/game until 1-8.md NEW 2 is built; their bot reading lands with it).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_CHILD, FT_EXPERT, FT_MIDDLE, FT_MIDDLE_EASY, freshPhone, rng, type FirstTimer } from './firsttimer.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { CHASE_ROWS, type ChaseLay } from '../../src/game/chase.ts';
import type { GeneratedStage } from '../../src/game/stageGenerator.ts';
import type { Platform } from '../../src/game/types.ts';

const Y = 500;
/** the branch: ground [x0, x1) in the lay's ~222 px sections, chase or not; the gaps are 1-1's singles (120 px) */
function branch(): { plats: Platform[]; lay: ChaseLay; forkEnd: number } {
  const plats: Platform[] = [];
  let id = 9000;
  const ground = (x0: number, x1: number, chase: boolean) => {
    for (let x = x0; x < x1; x += 222) plats.push({ id: id++, x, y: Y, width: Math.min(222, x1 - x), height: 400, type: 'solid', ...(chase ? { chase: true } : {}) } as Platform);
  };
  ground(0, 1100, false);
  // (the stretch: from the crack at 1100 to its fork at 3700, with three single gaps)
  ground(1100, 1700, true);
  ground(1820, 2500, true);
  ground(2620, 3100, true);
  ground(3220, 3700, true);
  ground(3700, 4300, false);
  ground(4300, 5400, false);
  return { plats, lay: { stretches: [{ start: 1100, end: 3700 }] }, forkEnd: 4300 };
}

function onBranch(who: FirstTimer, seed: number) {
  freshPhone(who.setting);
  setDifficulty(who.setting);
  Math.random = rng(seed);
  const b = branch();
  const route = Array.from({ length: 120 }, (_, i) => ({ x: 300 + i * 40, y: Y }));
  const run = new FirstTimerRun('1-2', seed, who, { route, cap: 60 });
  const sim = run.sim as unknown as { bare(p: Platform[]): void; stand(x: number, y: number): void; e: { currentStage: GeneratedStage; player: { hp: number; maxHp: number; x: number }; proto: unknown; checkpoint: { x: number; y: number } } };
  sim.e.currentStage.chase = b.lay;
  sim.bare(b.plats);
  sim.e.checkpoint = { x: 300, y: Y };
  sim.stand(300, Y);
  sim.e.player.hp = sim.e.player.maxHp;
  // (every heart lost on this branch is the chase's, nothing else here can hurt him: CAUGHT by the front with his feet on the branch,
  // or a FALL off it (a missed gap: the bots miss as the testers did, 1-1's calibration). Only a catch is the chase beating a runner)
  let caught = 0, falls = 0, far = 0;
  const e = sim.e as typeof sim.e & { player: { y: number; height: number } };
  const frame = (run as unknown as { sim: { frame: (pad: unknown) => void } }).sim.frame.bind(run.sim);
  (run.sim as unknown as { frame: (pad: unknown) => void }).frame = (pad: unknown) => {
    const hp = e.player.hp, feet = e.player.y + e.player.height, py0 = e.player.y, px0 = e.player.x, vx0 = (e.player as unknown as { vx: number }).vx;
    frame(pad);
    if (e.player.hp < hp) {
      py0 > Y + 60 ? falls++ : caught++;
      if (process.env.CHASE_BOTS_DEBUG) console.log('  hurt', who.name, Math.round(px0), Math.round(feet), 'vx', Math.round(vx0));
    }
    far = Math.max(far, e.player.x);
  };
  run.play();
  if (process.env.CHASE_BOTS_DEBUG) console.log(who.name, seed, (run as unknown as { end: string }).end, run.harms.map((h) => `${h.kind}@${Math.round(h.x)},${Math.round(h.y)} t${h.t.toFixed(1)} ${h.cause}`).join(' '), 'far', Math.round(far), 'caught', caught, 'falls', falls, 't', (run as unknown as { t: number }).t.toFixed(1));
  setDifficulty('normal');
  return { caught, falls, far, forkStart: b.lay.stretches[0].end };
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
