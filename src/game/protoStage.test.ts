import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, LOG } from './protoStage.ts';
import { maxRise } from './protoCheck.ts';
import { reachGlide, reachJump } from './physics.ts';
import { modelStage, MODEL_SLOW } from './stageTime.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 6, id: '1-6', name: 'First Lianas', objectiveType: 'vine_runner', targetCount: 1, timeLimit: 270,
  levelWidth: 16100, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 24 }, (_, i) => 1 + i * 37);
const rise = maxRise();
/** landing on a thin branch counts when the feet pass within this of its top; a bank's lip hoists him from this far below */
const THIN = 14;
const HOIST = 26;

test('1-6: the same roll always builds the same stage, and different rolls differ', () => {
  const a = JSON.stringify(buildProtoStage(cfg, 7));
  assert.equal(JSON.stringify(buildProtoStage(cfg, 7)), a);
  const widths = new Set(SEEDS.slice(0, 8).map((s) => Math.round(buildProtoStage(cfg, s).config.levelWidth)));
  assert.ok(widths.size >= 6, `rolls look alike: ${[...widths]}`);
});

test('1-6: every roll keeps the plan: the beats, an exit, two golden seeds, the log and flags in order', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s);
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Start', 'Learn', 'Develop', 'Puzzle', 'Twist', 'Develop again', 'Finish'], `seed ${s}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'seed').length, 2, `seed ${s}`);
    assert.equal(st.platforms.filter((p) => p.push).length, 1, `seed ${s}`);
    const xs = st.checkpoints!.map((c) => c.x);
    assert.deepEqual([...xs].sort((a, b) => a - b), xs);
    assert.ok(xs.length >= 8, `seed ${s}: ${xs.length} flags`);
    // never too long a stretch between two flags
    const gaps = [xs[0], ...xs.slice(1).map((x, i) => x - xs[i])];
    assert.ok(Math.max(...gaps) < 7000, `seed ${s}: a ${Math.round(Math.max(...gaps))} px stretch without a flag`);
  }
});

test('1-6: every roll is at least two minutes for a quick player, and not endless for a slow one', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s);
    const quick = st.meta!.timing!.layoutSeconds;
    assert.ok(quick >= EXPERT_SECONDS, `seed ${s}: ${Math.round(quick)} s`);
    assert.ok(modelStage(st, MODEL_SLOW).total < 480, `seed ${s}: too long for a slow player`);
  }
});

test('1-6: the canopy wall needs the log, and the nook needs the log against the rock', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s);
    const log = st.platforms.find((p) => p.push)!;
    const wall = st.platforms.find((p) => p.height >= 90 && Math.abs(p.x - log.push!.max - 55) < 1)!;
    assert.ok(wall, `seed ${s}: no wall at the log's far stop`);
    assert.ok(G - wall.y > rise + HOIST + 10, `seed ${s}: the wall can be jumped`);
    assert.ok(G - LOG.h - wall.y < rise - 15, `seed ${s}: the wall cannot be climbed from the log`);
    const rock = st.platforms.find((p) => p.height === 50 && Math.abs(p.x + p.width - log.push!.min) < 1)!;
    const nook = st.platforms.find((p) => p.height < 50 && p.y === 325 && p.x > rock.x - 1 && p.x < rock.x + rock.width)!;
    assert.ok(rock && nook, `seed ${s}: rock or nook missing`);
    assert.ok(G - LOG.h - nook.y < rise - 15);
    assert.ok(rock.y - nook.y > rise + THIN + 10);
    assert.ok(log.push!.min + 40 < nook.x + nook.width);
  }
});

test('1-6: the far seed needs the Leaf Glide, and the treetop vines cannot be reached from the ground', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s);
    const seedC = st.collectibles.find((c) => c.type === 'seed' && c.findId === 'seed-2')!;
    const ledge = st.platforms.find((p) => p.height < 50 && seedC.x >= p.x && seedC.x <= p.x + p.width && Math.abs(p.y - (seedC.y + 34)) < 2)!;
    assert.ok(ledge, `seed ${s}: no ledge under the far seed`);
    assert.ok(G - ledge.y > rise + THIN + 10, `seed ${s}: reachable from the floor`);
    // the branch it is jumped to from: the nearest branch to its left
    const from = st.platforms.filter((p) => p.height < 50 && p.x + p.width < ledge.x).sort((a, b) => b.x + b.width - (a.x + a.width))[0];
    const gap = ledge.x - (from.x + from.width);
    const dy = from.y - ledge.y;
    assert.ok(gap > reachJump(dy, true) + 60, `seed ${s}: a double jump makes it (${Math.round(gap)})`);
    assert.ok(gap < reachGlide(dy, true) - 60, `seed ${s}: even the glide falls short`);
    // the next thing to the right is far enough away too (no jumping back to it)
    const next = st.platforms.filter((p) => p.height < 50 && p.x > ledge.x + ledge.width).sort((a, b) => a.x - b.x)[0];
    if (next) assert.ok(next.x - (ledge.x + ledge.width) > reachJump(next.y - ledge.y, true) + 40, `seed ${s}: a branch to the right is close`);
    for (const v of st.vines) {
      if (v.vineType !== 'swing_liana' || v.bottomY > 400) continue;
      // a treetop vine: its lowest grab point is above the top of a double jump from the ground below it, unless the ground
      // below is the safe forest floor of a high run (reaching it from there is a way back up, not a short cut)
      const overFloor = st.platforms.some((p) => p.height >= 90 && p.y === G && v.x > p.x && v.x < p.x + p.width);
      if (overFloor) continue;
      assert.ok(G - rise > v.bottomY + 30, `seed ${s}: the treetop vine at ${Math.round(v.x)} can be reached from the ground`);
    }
  }
});
