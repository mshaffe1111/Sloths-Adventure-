import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, plainOrder, PRACTICE_AT, PRACTICE_H } from './protoStage.ts';
import { RealReach } from './realReach.ts';
import { RealPlay } from './realPlay.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { reachJump } from './physics.ts';
import { maxRise } from './protoCheck.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 1, id: '1-1', name: 'Into the Canopy', objectiveType: 'sprint', targetCount: 1, timeLimit: 0,
  levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);

test('1-1: every roll keeps the plan: learn, test, twist, finish, one exit, a secret seed above a mushroom, two minutes for a quick player', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Learn', 'Test', 'Twist', 'Finish'], `seed ${s}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    assert.equal(st.collectibles.filter((c) => c.type === 'seed').length, 1, 'one golden seed');
    const seedC = st.collectibles.find((c) => c.type === 'seed')!;
    // the seed is higher than a double jump reaches, with a mushroom close below it
    assert.ok(G - seedC.y > 200 && st.platforms.some((p) => p.type === 'bouncy' && Math.abs(p.x - seedC.x) < 260), `seed ${s}`);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${s}: ${st.meta!.timing!.layoutSeconds.toFixed(0)} s`);
  }
});

test('1-1: nothing can cost a life: every drop lands on moss, every floor sits above the water', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    assert.ok(st.platforms.every((p) => p.y < (st.waterY ?? 730)), `seed ${s}`);
    // walk along: every x from start to exit has a floor under it (ground, a pillar or a moss pit)
    const exit = st.exitTotemX;
    for (let x = 0; x < exit; x += 20) {
      assert.ok(st.platforms.some((p) => p.x <= x && p.x + p.width >= x && p.y >= G - 200), `seed ${s}: no floor at x ${x}`);
    }
  }
});

test('1-1: the stepping stones and the twist gaps are within a jump (a double jump only where the twist asks for one)', () => {
  const one = reachJump(0, false), two = reachJump(0, true);
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    const [, twistStart] = st.proto.beats[1];
    const twistEnd = st.proto.beats[2][1];
    // the ground banks: a gap between two G-level banks
    const banks = st.platforms.filter((p) => p.y === G).sort((a, b) => a.x - b.x);
    for (let i = 1; i < banks.length; i++) {
      const gap = banks[i].x - (banks[i - 1].x + banks[i - 1].width);
      if (gap <= 0) continue;
      const inTwist = banks[i].x > twistStart && banks[i].x < twistEnd;
      // gaps with pillars inside are crossed stone by stone (checked by construction); plain gaps must be jumpable
      const stones = st.platforms.some((p) => p.style === 'moss_stone' && p.y < G && p.x > banks[i - 1].x + banks[i - 1].width && p.x < banks[i].x);
      if (stones) continue;
      assert.ok(gap < (inTwist ? two : one) * 0.9 || (!inTwist && gap < two * 0.9), `seed ${s}: gap ${gap} at ${banks[i].x}`);
    }
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

/** 1-1 up to the tip for the second jump, in the real engine, played with plain jumps only (the tip is where the twist starts) */
function beforeTheTip(seed: number) {
  const rr = new RealReach('1-1', seed, { single: true });
  const sim = rr.sim;
  const st = sim.stage as GeneratedStage & { proto: { beats: Array<[number, number, string]> } };
  const tip = st.proto.beats[2][0];
  // (the secret cache over the mushroom is a bonus to come back for with the second jump: left out, and so is the mushroom, which
  // walking into only bounces him over: checked below)
  sim.e.platforms = sim.platforms.filter((p) => p.x < tip && p.type !== 'bouncy' && p.y > G - 200);
  sim.e.collectibles = sim.collectibles.filter((c) => c.x < tip && c.type !== 'exit_totem' && c.y > G - 200);
  st.exitTotemX = tip + 30;
  st.exitTotemY = G;
  return rr;
}

test('1-1 in the real engine: before the second jump is taught, plain jumps get everywhere, every pit is a hop out, nothing strands him', () => {
  const problems: string[] = [];
  for (const seed of SEEDS.slice(0, 8)) {
    const r = beforeTheTip(seed).search();
    if (!r.exitReached) problems.push(`seed ${seed}: the tip is never reached with plain jumps`);
    for (const c of r.missed) problems.push(`seed ${seed}: ${c.type} at (${Math.round(c.x)}, ${Math.round(c.y)}) needs the second jump`);
    for (const a of r.traps) problems.push(`seed ${seed}: stranded at ${a.key}${a.kind === 'p' ? ` (x ${Math.round(a.a!)}..${Math.round(a.b!)}, y ${a.y})` : ''} without the second jump`);
  }
  assert.deepEqual(problems, []);
});

test('1-1 in the real engine: running into the mushroom bounces him over it and on along the path', () => {
  for (const seed of SEEDS.slice(0, 4)) {
    const sim = new RealPlay('1-1', seed);
    const m = sim.platforms.find((p) => p.type === 'bouncy')!;
    sim.stand(m.x - 200, G);
    let bounced = false;
    for (let f = 0; f < 90 && !(sim.p.grounded && sim.p.x > m.x + m.width + 60); f++) {
      sim.frame({ right: true });
      bounced ||= sim.p.y < G - 100;
    }
    assert.ok(bounced && sim.p.grounded && sim.p.x > m.x + m.width + 60 && sim.p.y === G, `seed ${seed}: at ${Math.round(sim.p.x)}, ${Math.round(sim.p.y)}`);
  }
});

test('1-1 in the real engine: right after the tip, a shelf over the path that only the second jump reaches (a miss lands him back on the path)', () => {
  for (const seed of SEEDS.slice(0, 4)) {
    const sim = new RealPlay('1-1', seed);
    const st = sim.stage as GeneratedStage & { proto: { beats: Array<[number, number, string]> } };
    const tip = st.proto.beats[2][0];
    const shelf = sim.platforms.find((p) => p.x === tip + PRACTICE_AT && p.y === G - PRACTICE_H)!;
    assert.ok(shelf, `seed ${seed}: no practice shelf`);
    // nothing but the path under it: no pit, no wall
    assert.ok(sim.platforms.some((p) => p.y === G && p.x <= shelf.x - 120 && p.x + p.width >= shelf.x + shelf.width + 120), `seed ${seed}`);
    const tries = (dbl?: number) => {
      let hits = 0;
      for (let t = shelf.x - 140; t <= shelf.x + shelf.width - 20; t += 10) {
        sim.stand(shelf.x - 260, G);
        let took = -1;
        for (let f = 0; f < 120; f++) {
          const air = took >= 0 ? f - took : -1;
          const press = (took < 0 && sim.p.x >= t) || (dbl !== undefined && air === dbl);
          sim.frame({ right: sim.p.x < shelf.x + 80, jump: press || (took >= 0 && !(dbl !== undefined && air === dbl - 1)), press });
          if (took < 0 && !sim.p.grounded) took = f;
          if (took >= 0 && sim.p.grounded && f > took + 2) break;
        }
        if (sim.standingOn === shelf.id) hits++;
        assert.ok(sim.p.grounded && !sim.died, `seed ${seed}: after a try from ${t}`);
      }
      return hits;
    };
    assert.equal(tries(), 0, `seed ${seed}: a plain jump lands on the shelf`);
    assert.ok(tries(8) >= 3, `seed ${seed}: a second jump seldom lands on the shelf`);
  }
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
