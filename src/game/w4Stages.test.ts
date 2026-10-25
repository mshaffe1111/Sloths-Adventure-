import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, HAND_STAGES, stageSeconds } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { reachJump } from './physics.ts';
import { ROCK, rockFits } from './rockfall.ts';
import type { LevelConfig } from './types.ts';

const cfg = (id: string, type: LevelConfig['objectiveType']): LevelConfig =>
  ({
    worldIndex: 4, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: type, targetCount: 1, timeLimit: 0, levelWidth: 9000,
    levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const build41 = (s: number) => buildProtoStage(cfg('4-1', 'ascent'), s, '4-1');

test('4-1 is hand-built', () => {
  assert.equal(HAND_STAGES['4-1'], '4-1');
});

test('4-1: every roll can be finished, has one exit, and takes a quick climber most of two minutes', () => {
  for (const s of SEEDS) {
    const st = build41(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    // (timed like the other climbs, 1-4 and 3-4)
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 20, `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
  }
});

test('4-1: the rocks are fair: a warning first, time to spare, never where he must climb, and one rock to a ledge', () => {
  for (const s of SEEDS) {
    const st = build41(s);
    const rocks = st.proto.w4?.rocks ?? [];
    assert.ok(rocks.length >= 3, `seed ${s}: only ${rocks.length} rocks`);
    const lands = new Set<number>();
    for (const r of rocks) {
      assert.ok(rockFits(r) && r.warn >= 1, `seed ${s}: a rock without time to warn`);
      assert.ok(r.top < r.land - 200, `seed ${s}: a rock that hardly falls`);
      assert.ok(!lands.has(r.land), `seed ${s}: two rocks on one ledge`);
      lands.add(r.land);
      const ledge = st.platforms.find((p) => p.y === r.land && p.x <= r.x && p.x + p.width >= r.x);
      assert.ok(ledge, `seed ${s}: a rock that lands on nothing`);
      for (const v of st.vines) {
        if (v.topY <= r.land + 10 && v.bottomY >= r.land - 10) assert.ok(Math.abs(v.x - r.x) > ROCK.radius + 60, `seed ${s}: a rock falls where he climbs`);
      }
    }
    // the first rock is taught
    assert.ok(st.proto.hints.some((h) => /Rocks are coming loose/.test(h.text)), `seed ${s}`);
  }
});

test('4-1: the shrine is across a gap no jump crosses, bridged by the fern frond, and the frond is taught', () => {
  for (const s of SEEDS) {
    const st = build41(s);
    const spot = st.proto.w4?.patience?.[0];
    assert.ok(spot && spot.kind === 'frond' && spot.platformId !== undefined, `seed ${s}`);
    const bridge = st.platforms.find((p) => p.id === spot.platformId)!;
    assert.equal(bridge.art, 'frond');
    assert.ok(bridge.width > reachJump(0, true) + 60, `seed ${s}: the gap is ${bridge.width}, a double jump crosses ${Math.round(reachJump(0, true))}`);
    // standing on the spot is standing at the bridge's end
    const end = spot.dir === -1 ? bridge.x + bridge.width : bridge.x;
    assert.ok(Math.abs((spot.dir === -1 ? spot.x0 : spot.x1) - end) <= 30, `seed ${s}: the spot is not at the edge`);
    // without the bridge the shrine cannot be reached
    const without = validateStage({ ...st, platforms: st.platforms.filter((p) => p !== bridge) });
    assert.equal(without.ok, false, `seed ${s}: the shrine is reachable without the fern`);
    assert.ok(st.proto.hints.some((h) => /curled-up fern/.test(h.text)), `seed ${s}`);
  }
});

const build42 = (s: number) => buildProtoStage(cfg('4-2', 'sprint'), s, '4-2');

test('4-2: every roll can be finished without the leaf (none is needed before 4-7), has one exit, and runs its full length (STAGE_SECONDS)', () => {
  assert.equal(HAND_STAGES['4-2'], '4-2');
  for (const s of SEEDS) {
    const st = build42(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    assert.ok(st.meta!.timing!.layoutSeconds >= stageSeconds('4-2'), `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups had to be moved`);
  }
});

test('4-2: every gust lane has its chimes, gusts blow both ways, and the leaf and the chimes are taught', () => {
  for (const s of SEEDS) {
    const st = build42(s);
    const winds = (st.zones ?? []).filter((z) => z.kind === 'wind');
    const chimes = st.proto.w4?.chimes ?? [];
    assert.ok(winds.length >= 4, `seed ${s}: ${winds.length} gust lanes`);
    assert.equal(chimes.length, winds.length, `seed ${s}`);
    for (const c of chimes) {
      const z = st.zones![c.zone];
      assert.equal(z.kind, 'wind', `seed ${s}: chimes that listen to a ${z.kind} zone`);
      assert.ok(c.x >= z.x0 && c.x <= z.x1, `seed ${s}: chimes outside their lane`);
    }
    assert.ok(winds.some((z) => z.dir === 1) && winds.some((z) => z.dir === -1), `seed ${s}`);
    assert.ok(st.proto.hints.some((h) => /Your leaf/.test(h.text)), `seed ${s}`);
    assert.ok(st.proto.hints.some((h) => /chimes/.test(h.text)), `seed ${s}`);
    // the secret: a golden seed out where only the leaf reaches
    assert.ok(st.collectibles.some((c) => c.type === 'seed'), `seed ${s}: no golden seed`);
  }
});

test('4-2: the second twist rides the leaf on a high wind and turns the wind halfway over the stones, each taught as it first comes', () => {
  for (const s of SEEDS) {
    const st = build42(s);
    const names = st.proto.beats.map((b) => b[2]);
    const at = names.findIndex((n) => n.startsWith('Twist again'));
    assert.ok(at > names.findIndex((n) => n.startsWith('Twist:')) && at < names.findIndex((n) => n === 'Finish'), `seed ${s}: ${names.join(' / ')}`);
    const [b0, b1] = st.proto.beats[at];
    const lanes = (st.zones ?? []).map((z, i) => ({ z, i })).filter(({ z }) => z.kind === 'wind' && z.x0 >= b0 - 200 && z.x0 < b1);
    const chimes = st.proto.w4?.chimes ?? [];
    const chimeOf = (i: number) => chimes.find((c) => c.zone === i)!;
    // the high wind: behind him, stopping short of the ground (no bank is in it), its chimes up on the perch the leaf leaves from
    const high = lanes.filter(({ z }) => z.bottom < G - 20);
    assert.ok(high.length >= 2, `seed ${s}: ${high.length} high winds`);
    for (const { z, i } of high) {
      assert.equal(z.dir, 1, `seed ${s}`);
      const c = chimeOf(i);
      assert.ok(c.y < G - 200 && st.platforms.some((p) => p.style === 'branch' && p.y === c.y && p.x <= c.x && p.x + p.width >= c.x), `seed ${s}: the chimes are not on the perch`);
      assert.ok(!st.platforms.some((p) => p.y === G && p.x < z.x1 && p.x + p.width > z.x0 && p.y > z.top && p.y < z.bottom + 20), `seed ${s}`);
    }
    const hintAt = (re: RegExp) => st.proto.hints.find((h) => re.test(h.text))?.x ?? Infinity;
    assert.ok(hintAt(/Wind up high! Open your leaf/) < high[0].z.x0, `seed ${s}: the high wind is not taught`);
    // the turn: a lane behind him straight into one in his face, the second's chimes on a stone in the middle, where it turns
    const turn = lanes.find(({ z }, k) => z.dir === 1 && lanes[k + 1] && lanes[k + 1].z.dir === -1 && lanes[k + 1].z.x0 === z.x1);
    assert.ok(turn, `seed ${s}: the wind never turns`);
    const back = lanes[lanes.indexOf(turn) + 1];
    const c = chimeOf(back.i);
    assert.ok(c.y < G && st.platforms.some((p) => p.style === 'moss_stone' && p.y === c.y && p.x <= c.x && p.x + p.width >= c.x + 20), `seed ${s}: the turning chimes are not on a stone`);
    assert.ok(hintAt(/The wind turns halfway across/) < turn.z.x0, `seed ${s}: the turn is not taught`);
  }
});
