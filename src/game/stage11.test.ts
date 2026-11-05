import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS } from './protoStage.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { badPickups } from './flowerReach.ts';
import { normalGoal } from './goals.ts';
import type { LevelConfig } from './types.ts';

// 1-1 Into the Canopy, rebuilt on the beat (w1Rise.ts, w1-rhythm-b 2026-11-04): the old plan's tests (learn, test, twist, finish; nothing
// costs a life) went with the old stage (new replaces old)
const cfg = {
  worldIndex: 1, miniIndex: 1, id: '1-1', name: 'Into the Canopy', objectiveType: 'sprint', targetCount: 1, timeLimit: 0,
  levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 12 }, (_, i) => 1 + i * 41);

test('1-1: every roll keeps the curve (intro, ramps up and down the bank, the twist, the spike, the choice, the finale, three short rests), one shrine, one golden seed, two minutes for a quick player', () => {
  for (const easy of [false, true]) {
    for (const s of SEEDS) {
      const st = buildProtoStage(cfg, s, '1-1', easy);
      const kinds = st.proto.beats.map((b) => b[2].split(':')[0]);
      assert.deepEqual(kinds, ['Intro', 'Ramp', 'Ramp', 'Rest', 'Ramp', 'Twist', 'Spike', 'Rest', 'Choice', 'Rest', 'Finale'], `seed ${s}`);
      // three rests (the bank top, the high bough, before the finale), 3-4 s of walking each (the lead, 11-04: five of 5 s read slow)
      const rests = st.proto.beats.filter((b) => b[2].startsWith('Rest'));
      for (const r of rests) assert.ok((r[1] - r[0]) / 285 < 4.6, `seed ${s}: ${r[2]} is ${((r[1] - r[0]) / 285).toFixed(1)} s`);
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

test('1-1: open air only on the high road and in the finale, and before the choice only as guarded heart falls in the spike; every other gap has moss, the bank or a bough under it', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    const finale = st.proto.beats.find((b) => b[2].startsWith('Finale'))!;
    const choice = st.proto.beats.find((b) => b[2].startsWith('Choice'))!;
    // (the guarded stretches are heart falls: a heart and back on the ledge, never a life; the rest is the open air)
    const hf = st.heartFalls ?? [];
    const zones = (st.fallZones ?? []).filter((z) => !hf.some((h) => h.x0 === z.x0 && h.x1 === z.x1));
    assert.ok(hf.length >= 3, `seed ${s}: the twist, the spike and the low road are guarded`);
    assert.ok(zones.length >= 2, `seed ${s}: ${zones.length} stretches of open air`);
    for (const z of zones.filter((q) => q.x1 >= choice[0])) assert.ok(z.x0 >= choice[0] - 60 && (z.x1 <= choice[1] + 600 || z.x0 >= finale[0] - 60), `seed ${s}: open air at ${z.x0}`);
    // before the choice, every x has something within 260 px under the surface at that x
    // (the spike's open air, one gap in three: inside a heart fall, never a life, the lead's ruling 2026-11-04)
    const spike = st.proto.beats.find((b) => b[2].startsWith('Spike'))!;
    const spikeAir = (st.fallZones ?? []).filter((z) => z.x1 < choice[0] && !hf.some((h) => h.x0 === z.x0 && h.x1 === z.x1));
    assert.ok(spikeAir.length >= 1, `seed ${s}: some open air in the spike`);
    for (const z of spikeAir) {
      assert.ok(z.x0 >= spike[0] && z.x1 <= spike[1], `seed ${s}: open air before the choice at ${z.x0}, outside the spike`);
      assert.ok(hf.some((h) => h.x0 <= z.x0 && h.x1 >= z.x1), `seed ${s}: the spike's open air at ${z.x0} is not a guarded heart fall`);
    }
    for (let x = 300; x < choice[0]; x += 25) {
      if (spikeAir.some((z) => x >= z.x0 && x <= z.x1)) continue;
      const tops = st.platforms.filter((p) => p.x <= x && p.x + p.width >= x).map((p) => p.y);
      assert.ok(tops.length, `seed ${s}: nothing at all under x ${x}`);
    }
  }
});

/** stand on the ledge before one of the finale's open gaps and walk off its end */
function walkOff(easy: boolean, hp?: number) {
  setDifficulty(easy ? 'easy' : 'normal');
  const sim = new RealPlay('1-1', 1);
  setDifficulty('normal');
  const st = sim.stage as unknown as { fallZones: Array<{ x0: number; x1: number; depth: number }>; proto: { beats: Array<[number, number, string]> } };
  const fin = st.proto.beats.find((b) => b[2].startsWith('Finale'))!;
  const z = st.fallZones.find((q) => q.x0 > fin[0])!;
  const ledge = sim.platforms.find((p) => Math.abs(p.x + p.width - (z.x0 + 40)) < 3 && p.type === 'solid')!;
  sim.stand(ledge.x + ledge.width - 30, ledge.y);
  sim.wait(0.3);
  if (hp !== undefined) sim.p.hp = hp;
  const hp0 = sim.p.hp;
  let t = 0;
  const y0 = sim.p.y;
  let lowest = y0;
  while (t < 3 && !sim.died) {
    // (holding the way on: the engine's edge help stops a slow walk at the lip)
    sim.frame({ right: t < 0.6 });
    lowest = Math.max(lowest, sim.p.y);
    t += 1 / 30;
    if (easy && t > 0.3 && sim.p.grounded && Math.abs(sim.p.y - y0) < 2) break;
    if (!easy && sim.p.hp < hp0 && sim.p.grounded) break;
  }
  return { sim, t, fell: lowest - y0, z, hp0 };
}

test('1-1 in the real engine: off the end of a finale bough into open air costs a heart at once on Normal and puts him back at the gap (not a long drop to the stage floor); on his last heart it costs a life', () => {
  // (as real pits the first-timer adult bot lost 7-9 lives in the finale, two game overs a run: 2026-11-04)
  const r = walkOff(false);
  assert.ok(!r.sim.died, 'no life while he has hearts');
  assert.equal(r.sim.p.hp, r.hp0 - 1, 'a heart');
  assert.ok(r.sim.p.grounded, 'back on a bough');
  assert.ok(r.t < 1.6, `after ${r.t.toFixed(2)} s`);
  assert.ok(r.fell <= r.z.depth + 60, `he fell ${r.fell} px first`);
  const last = walkOff(false, 1);
  assert.ok(last.sim.died, 'on the last heart the fall costs a life');
  assert.ok(last.t < 1.2, `after ${last.t.toFixed(2)} s`);
});

test('1-1 in the real engine: a fall past the catch boughs in the spike is a heart and back on the ledge on Normal, never a life', () => {
  const sim = new RealPlay('1-1', 1);
  sim.safe = false;
  const st = sim.stage as unknown as { heartFalls: Array<{ x0: number; x1: number }>; proto: { beats: Array<[number, number, string]> } };
  const sp = st.proto.beats.find((b) => b[2].startsWith('Spike'))!;
  // stand on a ledge in the spike (the game notes it), then drop into the open air past everything there
  const ledge = sim.platforms.filter((p) => p.type === 'solid' && p.x > sp[0] + 200 && p.x + p.width < sp[1] - 200).sort((a, b) => a.y - b.y)[0];
  sim.stand(ledge.x + ledge.width / 2, ledge.y);
  sim.wait(0.3);
  let ax = sp[0];
  while (ax < sp[1] && sim.platforms.some((p) => p.x - 40 < ax && p.x + p.width + 40 > ax && p.y > ledge.y - 40 && p.y < ledge.y + 1200)) ax += 10;
  assert.ok(ax < sp[1], 'some open air in the spike');
  sim.p.invincibleTimer = 0;
  const hp = sim.p.hp;
  sim.fly(ax, ledge.y - 20, 0, 0, 0);
  for (let f = 0; f < 90 && !sim.died; f++) sim.frame({});
  assert.ok(!sim.died, 'no life lost');
  assert.equal(sim.p.hp, hp - 1, 'a heart');
  assert.ok(sim.p.grounded, 'back on a ledge');
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
  // (a finale bough with open air past its end: nothing under the next 100 px for 450 px down)
  const open = (p: { x: number; width: number; y: number }) => !sim.platforms.some((q) => q !== p && q.x < p.x + p.width + 100 && q.x + q.width > p.x + p.width + 10 && q.y > p.y - 10 && q.y < p.y + 450);
  const ledge = sim.platforms.filter((p) => p.type === 'solid' && p.x > fin[0] + 300 && p.x + p.width < fin[1] - 300 && st.fallZones.some((q) => p.x + p.width > q.x0 && p.x + p.width < q.x1) && open(p)).sort((a, b) => b.x - a.x)[0]!;
  sim.stand(ledge.x + ledge.width - 30, ledge.y);
  sim.wait(0.2);
  // (on his last heart: on Normal a finale fall is a heart and back at the gap while he has hearts, a life on the last)
  sim.p.hp = 1;
  for (let f = 0; f < 150; f++) sim.frame({ right: f < 18 });
  // (back at the last flag he reached: the finale's, where he stood; being put past the next flag does not take it)
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

test('1-1: the petals split 70/30 (Matt, 2026-11-04): the shared path 66-74%, each road of the choice 13-17%, the goal reachable either way, every petal reachable', () => {
  for (const easy of [false, true]) {
    for (const s of SEEDS) {
      const st = buildProtoStage(cfg, s, '1-1', easy);
      const petals = st.collectibles.filter((c) => c.type === 'flower');
      const n = petals.length;
      const { low, high } = st.proto.roads!;
      const shared = n - low.length - high.length;
      const tag = `seed ${s} ${easy ? 'Easy' : 'Normal'}`;
      assert.ok(shared / n >= 0.66 && shared / n <= 0.74, `${tag}: shared ${shared}/${n}`);
      for (const r of [low, high]) assert.ok(r.length / n >= 0.13 && r.length / n <= 0.17, `${tag}: a road ${r.length}/${n}`);
      // (the roads' petals are petals the stage holds, and no petal is on both)
      assert.equal(new Set([...low, ...high]).size, low.length + high.length);
      for (const id of [...low, ...high]) assert.ok(petals.some((c) => c.id === id), `${tag}: petal ${id}`);
      // (the lead: goal <= shared + the smaller road - 5%; 1-1 is a sprint with no petal goal today, so 0, but the rule holds by math)
      const goal = normalGoal(st) ?? 0;
      assert.ok(goal <= shared + Math.min(low.length, high.length) - 0.05 * n, `${tag}: goal ${goal}`);
      assert.deepEqual(badPickups({ platforms: st.platforms, vines: st.vines }, st.collectibles), [], tag);
    }
  }
});

test('1-1 in the real engine: at the choice, walking on passes under the mushroom\'s perch to the low road; on the perch the mushroom puts him on the high road', () => {
  // (the mushroom used to sit on the walking line: every player bounced up, and the low road was only a drop through a bough)
  const sim = new RealPlay('1-1', 1);
  sim.safe = false;
  const st = sim.stage as unknown as { proto: { beats: Array<[number, number, string]> } };
  const ch = st.proto.beats.find((b) => b[2].startsWith('Choice'))!;
  const m = sim.platforms.find((p) => p.type === 'bouncy' && p.x > ch[0] - 200 && p.x < ch[0] + 600)!;
  const perch = sim.platforms.find((p) => p.type === 'solid' && Math.abs(p.y - (m.y + 30)) < 2 && p.x <= m.x && p.x + p.width >= m.x + m.width)!;
  assert.ok(perch, 'the mushroom stands on a perch');
  const path = sim.platforms.filter((p) => p.type === 'solid' && p.y > perch.y + 60 && p.y < perch.y + 140 && p.x < perch.x && p.x + p.width > perch.x).sort((a, b) => a.y - b.y)[0];
  assert.ok(path, 'the path runs on under the perch');
  // walking on, no jump
  // (no root knot under the perch or just before it)
  assert.ok(!sim.platforms.some((p) => p.style === 'moss_stone' && p.x < perch.x + perch.width && p.x + p.width > perch.x - 60), 'no knot under the perch');
  sim.stand(perch.x - 50, path.y);
  sim.wait(0.2);
  let topY = sim.p.y;
  for (let f = 0; f < 75; f++) { sim.frame({ right: true }); topY = Math.min(topY, sim.p.y); }
  assert.ok(sim.p.x > perch.x + perch.width + 60, `walked on to ${Math.round(sim.p.x)}`);
  assert.ok(topY > perch.y, 'never up on the perch or the high road');
  // on the perch: on along it onto the mushroom
  const hi = new RealPlay('1-1', 1);
  hi.safe = false;
  hi.stand(perch.x + 10, perch.y);
  hi.wait(0.2);
  let landedHigh = false;
  for (let f = 0; f < 120 && !landedHigh; f++) {
    hi.frame({ right: true });
    if (hi.p.grounded && hi.p.y < perch.y - 150) landedHigh = true;
  }
  assert.ok(landedHigh, 'the mushroom put him on the high road');
});

test('1-1\'s canopy look (the lead\'s polish review, 2026-11-04): every bough grows from a kapok or tucks into leaves at each end, the trunks are scenery and not climbs, most boughs are bare bark, and the boughs vary in thickness', () => {
  for (const easy of [false, true]) {
    for (const s of SEEDS) {
      const st = buildProtoStage(cfg, s, '1-1', easy);
      const boughs = st.platforms.filter((p) => p.style === 'branch' && p.type !== 'bouncy' && p.height < 50);
      const trunks = st.proto.trunks!;
      // (each end grows from a kapok or tucks into a leafy clump: nothing floats; the kapoks are few, one to every 2-5 boughs)
      const leaves = st.proto.leaves!;
      // (or meets a neighbour's end a hop away, where a clump would stack on the next bough: the quality supervisor, 11-04)
      const hop = (b: (typeof boughs)[number], x: number) => boughs.some((q) => q !== b && Math.abs(q.y - b.y) < 90 && (Math.abs(q.x - x) < 70 || Math.abs(q.x + q.width - x) < 70));
      const held = (b: (typeof boughs)[number], x: number, y: number) => trunks.some((t) => Math.abs(t.x - x) < 42 * (t.w ?? 1)) || leaves.some((l) => Math.abs(l.x - x) < 12 && Math.abs(l.y - y) < 12) || hop(b, x);
      for (const b of boughs) assert.ok(held(b, b.x, b.y + 8) && held(b, b.x + b.width, b.y + 8), `seed ${s}: bough ${b.id} has a bare end`);
      // (the big kapoks few, one to every 2-5 boughs; with the slimmer trees, never more trees than three in five boughs)
      const kapoks = trunks.filter((t) => (t.w ?? 1) >= 1.6).length;
      // (one to every 2-9 boughs: the slimmer trees hold the rest, and at least four in five boughs grow from a tree, below)
      assert.ok(kapoks <= boughs.length / 2 && kapoks >= boughs.length / 9, `seed ${s}: ${kapoks} kapoks for ${boughs.length} boughs`);
      assert.ok(trunks.length <= boughs.length * 0.6, `seed ${s}: ${trunks.length} trees for ${boughs.length} boughs`);
      // (the kapoks 1.6-2.6 times a climb's width, full height; the slimmer trees a lone bough grows from, 1.0-1.35, crowned in leaves
      // just over it: the quality supervisor, 11-04, half the boughs read as floating planks)
      for (const t of trunks) assert.ok((t.w! >= 1.6 && t.w! <= 2.6) || (t.w! >= 1.0 && t.w! <= 1.35 && t.topY > -1000 && leaves.some((l) => l.x === t.x && Math.abs(l.y - t.topY - 30) < 2)), `seed ${s}: trunk at ${t.x}, w ${t.w}`);
      // (and now most boughs grow from a tree: at most one in six held by leaves alone)
      const byTree = boughs.filter((b) => trunks.some((t) => t.x + 42 * (t.w ?? 1) * 0.7 >= b.x && t.x - 42 * (t.w ?? 1) * 0.7 <= b.x + b.width)).length;
      assert.ok(byTree >= boughs.length * 0.8, `seed ${s}: ${byTree} of ${boughs.length} boughs grow from a tree`);
      assert.equal(st.vines.filter((v) => v.vineType === 'tree_climb').length, 0, 'no climb added');
      const bare = boughs.filter((b) => b.bare).length / boughs.length;
      assert.ok(bare > 0.5 && bare < 0.85, `seed ${s}: ${bare}`);
      assert.ok(new Set(boughs.map((b) => b.thick)).size > 10, 'thicknesses vary');
    }
  }
});
