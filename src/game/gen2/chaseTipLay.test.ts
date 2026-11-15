/**
 * gen2/chaseTip (ENG-CL (6)): the branch's tip and a still fork's ground as gen2 lays any chase stage calls, lifted from the dev fixture
 * (which only ever laid fork 0, and filtered the runner's run line out). Red before: no such module; the fixture's copy laid fork 0 only.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import type { ChaseLay } from '../chase.ts';
import type { RollSpec } from '../rolling.ts';
import type { Platform, Vine } from '../types.ts';
import { layTip, readyStillFork, type TipStage } from './chaseTip.ts';
import { layStillFork, stillForks, STILL_FORK } from './stillFork.ts';
import { W1_STILL_FORK, W1_TIP } from './worlds/w1Cast.ts';

const Y = 500;
/** flat ground in the lay's ~222 px sections, three stretches with a fork after each of the first two, the far ground past the last */
function toy(step?: { at: number; dy: number }): TipStage & { platforms: Platform[]; chase: ChaseLay; vines: Vine[]; checkpoints: Array<{ x: number }>; collectibles: Array<{ x: number }>; rolling: RollSpec[]; enemies: Array<{ x: number; y: number; width: number; height: number }>; proto: { dress: Array<{ x: number; b: number }> } } {
  const plats: Platform[] = [];
  let id = 100;
  const ground = (x0: number, x1: number, chase: boolean) => {
    for (let x = x0; x < x1; x += 222) {
      const y = step && x >= step.at ? Y + step.dy : Y;
      plats.push({ id: id++, x, y, width: Math.min(222, x1 - x), height: 400, type: 'solid', ...(chase ? { chase: true } : {}) } as Platform);
    }
  };
  ground(0, 900, false);
  ground(900, 2900, true);
  ground(2900, 4300, false);
  ground(4300, 6300, true);
  ground(6300, 7700, false);
  ground(7700, 10364, true);
  ground(10364, 13000, false);
  return {
    platforms: plats,
    chase: { stretches: [{ start: 900, end: 2900 }, { start: 4300, end: 6300 }, { start: 7700, end: 10364, last: true }] },
    vines: [],
    checkpoints: [{ x: 2950 }, { x: 6400 }, { x: 10500 }],
    collectibles: [{ x: 10400 }, { x: 9000 }],
    rolling: [{ kind: 'low', dropX: 9600, speed: 140, bounce: 8 }, { kind: 'high', dropX: 8800, speed: 140, bounce: 165 }],
    enemies: [{ x: 10600, y: Y - 40, width: 40, height: 40 }],
    proto: { dress: [{ x: 10450, b: Y }] },
  };
}

test('layTip: the last stretch made the tip, a runner liana in the gap off it, the far branch at its height; the gap kept clear', () => {
  const st = toy();
  assert.deepEqual(layTip(st, W1_TIP), []);
  const last = st.chase.stretches[2];
  assert.equal(last.tip, true);
  const g0 = 10364, g1 = g0 + W1_TIP.gap, g2 = g1 + W1_TIP.land;
  const v = st.vines.at(-1)!;
  assert.ok(v.runner && v.x === g0 + W1_TIP.liana.out && v.topY === Y - W1_TIP.liana.up && v.bottomY === Y + W1_TIP.liana.foot, `the liana ${JSON.stringify(v)}`);
  assert.ok(!st.platforms.some((p) => p.x < g1 && p.x + p.width > g0), 'nothing stands in the gap');
  assert.ok(st.platforms.some((p) => p.x === g1 && p.width === W1_TIP.land && p.y === Y), 'the far branch at the tip\'s height');
  assert.ok(st.platforms.some((p) => p.x === g2), 'the stage\'s own ground resumes past it');
  // (a flag in the gap stands on the far ground; a pickup, dressing and a creature in it are left out; a hazard on the run to the lip too)
  assert.equal(st.checkpoints[2].x, g1 + 120);
  assert.deepEqual(st.collectibles.map((c) => c.x), [9000]);
  assert.deepEqual(st.proto.dress, []);
  assert.deepEqual(st.enemies, []);
  assert.deepEqual(st.rolling.map((h) => h.dropX), [8800]);
});

test('layTip: a runner tip with too little level run to its lip is refused by name and nothing is laid; a plain liana there is laid', () => {
  const st = toy({ at: 9900, dy: 40 });
  const before = JSON.stringify(st);
  const bad = layTip(st, W1_TIP);
  assert.ok(bad.some((m) => /px of run to its lip, 1188 px eases it to a runner/.test(m)), bad.join('; '));
  assert.equal(JSON.stringify(st), before, 'nothing laid');
  assert.deepEqual(layTip(st, { ...W1_TIP, liana: { ...W1_TIP.liana, runner: false } }), []);
  assert.ok(st.chase.stretches[2].tip && !st.vines.at(-1)!.runner, 'the tip, its liana a plain one');
});

test('readyStillFork on ANY fork (here fork 1): bare rocks in its cover and post cleared, one carrying dressing kept, its flag past the post; then the fork lays', () => {
  const st = toy();
  const x0 = 6300;
  const bare = { id: 900, x: x0 + 200, y: Y - 40, width: 60, height: 40, type: 'solid' } as Platform;
  const dressed = { id: 901, x: x0 + 700, y: Y - 40, width: 60, height: 40, type: 'solid' } as Platform;
  st.platforms.push(bare, dressed);
  st.proto.dress.push({ x: x0 + 730, b: Y - 40 });
  assert.deepEqual(readyStillFork(st, 1, W1_STILL_FORK), []);
  assert.ok(!st.platforms.includes(bare), 'the bare rock in the cover is cleared');
  assert.ok(st.platforms.includes(dressed), 'the rock carrying dressing stays (D16)');
  const span = x0 + STILL_FORK.runIn + W1_STILL_FORK.cover.w + STILL_FORK.postPast + 60;
  assert.ok(st.checkpoints[1].x >= span + STILL_FORK.flagClear || st.checkpoints[1].x === 7700 - 40, `its flag at ${st.checkpoints[1].x}, past the post`);
  assert.deepEqual(layStillFork(st as never, 1, W1_STILL_FORK, 1), []);
  assert.deepEqual(stillForks(st as never).map((f) => f.fork), [1]);
  // (the last stretch has no fork after it)
  assert.ok(readyStillFork(toy(), 2, W1_STILL_FORK).some((m) => /no stretch after it/.test(m)));
});
