// (the mixer's 1-1 promises that needed the game's own 1-1 (nothing costs a life, plain jumps before the double, the mushroom, the double
// gap) retired with the mixer's 1-1 path when 1-1's Play became gen2 (11-06): gen2/stage11gen2.test.ts holds them on Rolls A/B/C)
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, plainOrder } from './protoStage.ts';
import { specFor } from './mixer/stages.ts';
import { modelAll } from './stageTime.ts';
import { jumpOK, validateStage } from './levelCheck.ts';
import { RealReach } from './realReach.ts';
import { RealPlay } from './realPlay.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { maxRise } from './protoCheck.ts';
import type { LevelConfig, Platform } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 1, id: '1-1', name: 'Into the Canopy', objectiveType: 'sprint', targetCount: 1, timeLimit: 0,
  levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);

// 1-1 is built by the level engine from its spec (mixer/stages.ts SPEC_11): the old builder's tests are kept promise for promise on the
// mixed stage (engine-core, 11-05). Where the old test named the old stage's shape (its four beats, the ground line G, the practice
// shelf), the new one names the spec's own (its nodes, the stage's death line, the double teach's gap).
const SPEC = specFor('1-1')!;
/** the x where a node with this job starts (the spec's beats: `${job}: ${idea}`) */
const jobAt = (st: { proto: { beats: Array<[number, number, string]> } }, job: string) => st.proto.beats.find((b) => b[2].startsWith(job + ':'))![0];

test('1-1: every roll keeps the plan (the spec\'s nodes in order), one exit, a secret seed above a mushroom, two minutes for a quick player', () => {
  const jobs = [...new Set(SPEC.nodes.map((n) => n.job))];
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    assert.deepEqual([...new Set(st.proto.beats.map((b) => b[2].split(':')[0]))], jobs, `seed ${s}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    assert.equal(st.collectibles.filter((c) => c.type === 'seed').length, 1, `seed ${s}: one golden seed`);
    const seedC = st.collectibles.find((c) => c.type === 'seed')!;
    // the seed is more than 200 px over the ground under it (main: G - seed.y > 200), with a mushroom within 260 px below it
    const ground = st.platforms.filter((p) => p.type === 'solid' && p.height >= 90 && seedC.x >= p.x - 200 && seedC.x <= p.x + p.width + 200 && p.y > seedC.y).sort((a, b) => a.y - b.y)[0];
    assert.ok(ground && ground.y - seedC.y > 200, `seed ${s}: ${ground ? ground.y - seedC.y : 'no ground'} px over the ground`);
    assert.ok(st.platforms.some((p) => p.type === 'bouncy' && Math.abs(p.x - seedC.x) < 260 && p.y > seedC.y), `seed ${s}: no mushroom close below it`);
    const fast = modelAll(st).fast.total;
    assert.ok(fast >= EXPERT_SECONDS - 15, `seed ${s}: ${fast.toFixed(0)} s`);
  }
});

test('1-1: every gap is within a jump, the whole stage by the level check; before the double is taught, a plain jump', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    const r = validateStage(st, { rooms: false });
    assert.ok(r.ok, `seed ${s}: ${r.errors.slice(0, 3).join('; ')}`);
  }
  assert.ok(maxRise() > 100);
});

test('1-1: the stepping stones are laid out for one plain jump: each stone at most 90 up from the one before, in the rolled order where it fits', () => {
  assert.deepEqual(plainOrder([60, 120, 60]), [60, 120, 60]);
  assert.deepEqual(plainOrder([90, 30, 120, 60]), [90, 30, 120, 60]);
  for (const order of [[140, 100, 40, 80], [40, 140, 100, 80], [100, 140, 80, 40], [80, 40, 140, 100]]) {
    const o = plainOrder(order);
    assert.deepEqual([...o].sort(), [...order].sort());
    o.forEach((h, i) => assert.ok(h - (i ? o[i - 1] : 0) <= 90, `${order} -> ${o}`));
  }
});

/** 1-1 up to the double jump's teach, in the real engine, played with plain jumps only */
function beforeTheTip(seed: number) {
  const rr = new RealReach('1-1', seed, { single: true });
  const sim = rr.sim;
  const st = sim.stage as GeneratedStage & { proto: { beats: Array<[number, number, string]> } };
  const tip = jobAt(st, 'teach double');
  const at = sim.platforms.filter((p) => p.x <= tip && p.x + p.width >= tip && p.type === 'solid').sort((a, b) => a.y - b.y)[0];
  sim.e.platforms = sim.platforms.filter((p) => p.x < tip);
  sim.e.collectibles = sim.collectibles.filter((c) => c.x < tip && c.type !== 'exit_totem');
  st.exitTotemX = tip - 30;
  st.exitTotemY = at.y;
  return rr;
}

/**
 * The double teach's gap: walking the way's pieces from `tip` (a piece lying more than 80 px under the last kept one is below the way, such
 * as a safe floor in the gap, and is skipped: the planner's proposal, so the floor ruled into the gap never hides the gap), the first gap
 * within 1,500 px that a plain jump can't cross and a double can, with a piece under its middle above the death line. Undefined: none.
 */
function doubleGap(platforms: Platform[], tip: number, death: number): { a: Platform; b: Platform; safe: boolean } | undefined {
  const way: Platform[] = [];
  for (const p of platforms.filter((q) => q.type === 'solid' && q.x + q.width > tip).sort((a, b) => a.x - b.x)) {
    if (way.length && p.y > way[way.length - 1].y + 80) continue;
    way.push(p);
  }
  for (let i = 0; i + 1 < way.length; i++) {
    const [a, b] = [way[i], way[i + 1]];
    if (b.x - (a.x + a.width) < 40 || b.x > tip + 1500) continue;
    if (jumpOK(a, b, false).ok || !jumpOK(a, b, true).ok) continue;
    const mid = (a.x + a.width + b.x) / 2;
    return { a, b, safe: platforms.some((p) => p !== a && p !== b && p.x <= mid && p.x + p.width >= mid && p.y > Math.max(a.y, b.y) && p.y < death) };
  }
  return undefined;
}

test('the double-gap finder: sees a gap with a safe floor ruled into it, and finds none where a plain jump crosses every gap', () => {
  const P = (id: number, x: number, w: number, y: number): Platform => ({ id, x, y, width: w, height: 120, type: 'solid', style: 'moss_stone' });
  // (a double-only gap, 200 px (jumpOK: a plain jump fails from 120, a double from 240), with a moss floor 140 px down inside it and a
  // one-jump step back by the near wall, R2)
  const r2 = [P(1, 0, 400, 1000), P(2, 400, 200, 1140), P(3, 410, 60, 1080), P(4, 600, 400, 1000)];
  const g = doubleGap(r2, 0, 2000);
  // (from the lip or from the step back, 80 px down: either way the far bank needs the double, with the floor under it)
  assert.ok(g && (g.a.id === 1 || g.a.id === 3) && g.b.id === 4 && g.safe, JSON.stringify(g && [g.a.id, g.b.id, g.safe]));
  // (the same gap with no floor: found, and not safe)
  const bare = doubleGap([P(1, 0, 400, 1000), P(4, 600, 400, 1000)], 0, 2000);
  assert.ok(bare && !bare.safe);
  // (planted: every gap a plain jump crosses, 45 px as today's 1-1 has: none found, so the 1-1 test fails)
  assert.equal(doubleGap([P(1, 0, 400, 1000), P(2, 445, 400, 1000), P(3, 890, 400, 1000)], 0, 2000), undefined);
});

test('in the air against a wall too tall to catch, his drawing stands off the face (it is not a grab); his body does not move', () => {
  const sim = new RealPlay('1-1', 1);
  sim.bare([{ id: 1, x: 0, y: 2000, width: 3000, height: 300, type: 'solid' }, { id: 2, x: 1000, y: 1800, width: 200, height: 200, type: 'solid', style: 'moss_stone' }]);
  sim.stand(900, 2000);
  let off = 0, x = 0;
  for (let f = 0; f < 14; f++) {
    sim.frame({ right: true, jump: true, press: f === 2 });
    if (!sim.p.grounded) {
      off = Math.min(off, sim.e.wallOff);
      x = Math.max(x, sim.p.x);
    }
  }
  assert.ok(off < -5, `drawn ${off} off the wall`);
  assert.equal(Math.round(x), 1000 - 19, 'his body still stops against the face');
  for (let f = 0; f < 40; f++) sim.frame({});
  assert.ok(Math.abs(sim.e.wallOff) < 0.5, 'and comes back once he is off it');
});
