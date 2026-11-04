import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS } from './protoStage.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import type { LevelConfig } from './types.ts';

// 1-1 Into the Canopy, rebuilt on the beat (w1Rise.ts, w1-rhythm-b 2026-11-04): the old plan's tests (learn, test, twist, finish; nothing
// costs a life) went with the old stage (new replaces old)
const cfg = {
  worldIndex: 1, miniIndex: 1, id: '1-1', name: 'Into the Canopy', objectiveType: 'sprint', targetCount: 1, timeLimit: 0,
  levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 12 }, (_, i) => 1 + i * 41);

test('1-1: every roll keeps the curve (intro, ramps, the twist, the spike, the choice, the finale, rests between), one shrine, one golden seed, two minutes for a quick player', () => {
  for (const easy of [false, true]) {
    for (const s of SEEDS) {
      const st = buildProtoStage(cfg, s, '1-1', easy);
      const kinds = st.proto.beats.map((b) => b[2].split(':')[0]);
      assert.deepEqual(kinds, ['Intro', 'Ramp', 'Rest', 'Ramp', 'Rest', 'Twist', 'Rest', 'Spike', 'Rest', 'Choice', 'Rest', 'Finale'], `seed ${s}`);
      // never two groups of moves without a rest between them (STAGE-RULES §0b.1), past the ramps
      kinds.slice(4).forEach((k, i, a) => { if (k !== 'Rest' && i > 0) assert.equal(a[i - 1], 'Rest', `seed ${s}: ${k} after ${a[i - 1]}`); });
      assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
      assert.equal(st.collectibles.filter((c) => c.type === 'seed').length, 1, 'one golden seed');
      assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${s}: ${st.meta!.timing!.layoutSeconds.toFixed(0)} s`);
      // it rises: the shrine is at least 1000 px over the start
      assert.ok(st.spawnY - st.exitTotemY > 1000, `seed ${s}: rises ${st.spawnY - st.exitTotemY}`);
      // the backdrop turns over on the way up
      assert.ok(st.proto.rise && st.proto.rise.y0 > st.proto.rise.y1 && st.proto.rise.y1 > st.exitTotemY);
    }
  }
});

test('1-1: open air only on the high road and in the finale; every other gap has moss, the bank or a bough under it', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    const finale = st.proto.beats.find((b) => b[2].startsWith('Finale'))!;
    const choice = st.proto.beats.find((b) => b[2].startsWith('Choice'))!;
    const zones = st.fallZones ?? [];
    assert.ok(zones.length >= 2, `seed ${s}: ${zones.length} stretches of open air`);
    for (const z of zones) assert.ok(z.x0 >= choice[0] - 60 && (z.x1 <= choice[1] + 600 || z.x0 >= finale[0] - 60), `seed ${s}: open air at ${z.x0}`);
    // before the choice, every x has something within 260 px under the surface at that x
    for (let x = 300; x < choice[0]; x += 25) {
      const tops = st.platforms.filter((p) => p.x <= x && p.x + p.width >= x).map((p) => p.y);
      assert.ok(tops.length, `seed ${s}: nothing at all under x ${x}`);
    }
  }
});

/** stand on the ledge before one of the finale's open gaps and walk off its end */
function walkOff(easy: boolean) {
  setDifficulty(easy ? 'easy' : 'normal');
  const sim = new RealPlay('1-1', 1);
  setDifficulty('normal');
  const st = sim.stage as unknown as { fallZones: Array<{ x0: number; x1: number; depth: number }>; proto: { beats: Array<[number, number, string]> } };
  const fin = st.proto.beats.find((b) => b[2].startsWith('Finale'))!;
  const z = st.fallZones.find((q) => q.x0 > fin[0])!;
  const ledge = sim.platforms.find((p) => Math.abs(p.x + p.width - (z.x0 + 40)) < 3 && p.type === 'solid')!;
  sim.stand(ledge.x + ledge.width - 30, ledge.y);
  sim.wait(0.3);
  let t = 0;
  const y0 = sim.p.y;
  let lowest = y0;
  while (t < 3 && !sim.died) {
    // (holding the way on: the engine's edge help stops a slow walk at the lip)
    sim.frame({ right: t < 0.6 });
    lowest = Math.max(lowest, sim.p.y);
    t += 1 / 30;
    if (easy && t > 0.3 && sim.p.grounded && Math.abs(sim.p.y - y0) < 2) break;
  }
  return { sim, t, fell: lowest - y0, z };
}

test('1-1 in the real engine: off the end of a finale bough into open air costs a life at once on Normal (not a long drop to the stage floor)', () => {
  const r = walkOff(false);
  assert.ok(r.sim.died, 'the fall costs a life');
  assert.ok(r.t < 1.2, `after ${r.t.toFixed(2)} s`);
  assert.ok(r.fell <= r.z.depth + 60, `he fell ${r.fell} px first`);
});

test('1-1 in the real engine: the same fall on Easy is a soft fall: back on the bough, no life lost', () => {
  const r = walkOff(true);
  assert.ok(!r.sim.died, 'no life lost on Easy');
  assert.ok(r.sim.p.grounded, 'he is set back on the ground he left');
});

test('fallZones in the real engine: outside a zone a long fall lands as it always did; inside one it is a fall at once; the life brings him back to the flag', () => {
  const drop = (zones: Array<{ x0: number; x1: number; depth: number }> | undefined) => {
    const sim = new RealPlay('1-1', 1);
    sim.bare([{ id: 1, x: 0, y: 1000, width: 400, height: 24, type: 'solid', style: 'branch' }, { id: 2, x: 0, y: 1700, width: 3000, height: 90, type: 'solid' }]);
    (sim.e.currentStage as { fallZones?: unknown }).fallZones = zones;
    sim.stand(370, 1000);
    sim.wait(0.2);
    for (let f = 0; f < 90 && !sim.died; f++) sim.frame({ right: f < 20 });
    return sim;
  };
  const outside = drop(undefined);
  assert.ok(!outside.died && outside.p.grounded && Math.abs(outside.p.y - 1700) < 2, 'no zone: he lands on the floor 700 px down');
  const away = drop([{ x0: 2000, x1: 2600, depth: 420 }]);
  assert.ok(!away.died, 'a zone elsewhere changes nothing here');
  assert.ok(drop([{ x0: 380, x1: 900, depth: 420 }]).died, 'in a zone: a fall');
  // the real life lost: back at the node's flag
  const sim = new RealPlay('1-1', 1);
  const e = sim.e as unknown as { loseLife: (r: string) => void; currentStage: { checkpoints: Array<{ x: number; y: number }>; fallZones: Array<{ x0: number; x1: number }>; proto: { beats: Array<[number, number, string]> } } };
  e.loseLife = Object.getPrototypeOf(sim.e).loseLife.bind(sim.e);
  const st = e.currentStage;
  const fin = st.proto.beats.find((b) => b[2].startsWith('Finale'))!;
  const flagAt = st.checkpoints.find((c) => c.x > fin[0] - 10)!;
  sim.stand(flagAt.x, flagAt.y);
  sim.wait(0.3);
  const z = st.fallZones[st.fallZones.length - 1];
  const ledge = sim.platforms.find((p) => p.type === 'solid' && p.x + p.width > z.x0 + 30 && p.x + p.width < z.x0 + 400 && p.x < z.x0 + 30)!;
  sim.stand(ledge.x + ledge.width - 30, ledge.y);
  sim.wait(0.2);
  for (let f = 0; f < 150; f++) sim.frame({ right: f < 18 });
  assert.ok(Math.abs(sim.p.x - flagAt.x) < 140 && Math.abs(sim.p.y - flagAt.y) < 4, `back at the finale's flag (${Math.round(sim.p.x)}, ${Math.round(sim.p.y)}) vs (${flagAt.x}, ${flagAt.y})`);
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
