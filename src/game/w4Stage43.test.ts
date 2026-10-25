import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, HAND_STAGES } from './protoStage.ts';
import { buildWaterfallSteps, WET, type FallInfo } from './w4Stage43.ts';
import { validateStage } from './levelCheck.ts';
import { PHYS, reachJump } from './physics.ts';
import { FALLS } from './waterfalls.ts';
import { rockFits } from './rockfall.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { LevelConfig, Platform } from './types.ts';

const cfg: LevelConfig = {
  worldIndex: 4, miniIndex: 3, id: '4-3', name: 'Waterfall Steps', objectiveType: 'ascent', targetCount: 1, timeLimit: 0, levelWidth: 9000,
  levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const build = (s: number) => buildWaterfallSteps(cfg, s);
type Stage = ReturnType<typeof build>;

/** the stage as it is while some falls pour: their steps cannot be climbed (taken out), and a pool's log sits where its water has it */
function withWater(st: Stage, pouring: FallInfo[], logAt: Record<number, number> = {}): GeneratedStage {
  const gone = new Set(pouring.flatMap((f) => f.steps));
  const platforms: Platform[] = st.platforms.filter((p) => !gone.has(p.id)).map((p) => (logAt[p.id] !== undefined ? { ...p, y: logAt[p.id] } : p));
  return { ...st, platforms };
}
/** can he get to the shrine from standing on this platform? */
const exitFrom = (stage: GeneratedStage, p: Platform) => {
  const res = validateStage({ ...stage, spawnX: p.x + p.width / 2, spawnY: p.y });
  return !res.errors.some((e) => /exit platform .* not reachable|no platform under the spawn/.test(e));
};
const reachable = (stage: GeneratedStage) => new Set(validateStage(stage).reachableIds);

test('4-3 is hand-built', () => {
  assert.equal(HAND_STAGES['4-3'], '4-3');
  const st = buildProtoStage(cfg, 1, '4-3');
  assert.ok(st.proto.w4?.falls?.length, 'buildProtoStage builds Waterfall Steps');
});

test('4-3: every roll can be finished, has one exit, takes a quick player two minutes, and needs no pickup moved', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS, `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.equal(st.proto.movedPickups ?? 0, 0, `seed ${s}: ${st.proto.movedPickups} pickups had to be moved`);
    // an ascent: the shrine is the highest ground, the start the lowest
    const top = Math.min(...st.platforms.map((p) => p.y));
    assert.ok(Math.abs(st.exitTotemY - top) < 1, `seed ${s}: the shrine is not at the top`);
    assert.ok(st.spawnY - st.exitTotemY > 3000, `seed ${s}: only ${st.spawnY - st.exitTotemY} px of climb`);
    // nothing crumbles, and every terrace is solid to the floor (a slip only ever lands on a lower step)
    assert.ok(st.platforms.every((p) => p.type === 'solid'), `seed ${s}`);
  }
});

test('4-3: each fall is a different idea, in order: plugs, the pool and its log, then the surges', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const kinds = st.falls43.map((f) => f.kind);
    assert.deepEqual(kinds.slice(0, 3), ['plug', 'plug', 'pool'], `seed ${s}: ${kinds.join(',')}`);
    assert.ok(kinds.slice(3).length >= 2 && kinds.slice(3).every((k) => k === 'surge'), `seed ${s}: ${kinds.join(',')}`);
    const falls = st.proto.w4!.falls!;
    for (const f of st.falls43) {
      const w = falls.find((q) => q.id === f.fallId)!;
      assert.ok(f.steps.length >= 2, `seed ${s}: fall ${f.fallId} pours over ${f.steps.length} steps`);
      // every step under the water is inside the falling water, and is a full wet step up
      for (const id of f.steps) {
        const p = st.platforms.find((q) => q.id === id)!;
        assert.ok(p.x >= w.x && p.x + p.width <= w.x + w.width + 1 && p.y > w.top && p.y < w.bottom, `seed ${s}: step ${id} is not under fall ${f.fallId}`);
      }
      if (f.kind === 'surge') {
        assert.ok(w.surge && !w.plug, `seed ${s}`);
        assert.ok(w.surge!.quiet >= 2.8 && w.surge!.ease >= 1, `seed ${s}: a surge with too short a quiet spell or no warning`);
        continue;
      }
      // a plug: the boulder rolls along the shelf into the slot at its end, and starts out of it
      const b = st.platforms.find((q) => q.id === w.plug!.platformId)!;
      const shelf = st.platforms.find((q) => q.id === f.shelf)!;
      assert.equal(b.art, 'boulder');
      assert.ok(b.push && b.height >= 50, `seed ${s}: the boulder cannot be pushed`);
      assert.equal(b.push!.max - b.width, w.plug!.atX, `seed ${s}: the slot is not at the end of the boulder's roll`);
      assert.ok(b.x < w.plug!.atX - 150, `seed ${s}: the boulder starts in the slot`);
      assert.equal(b.y + b.height, shelf.y, `seed ${s}: the boulder is not on its shelf`);
      assert.equal(shelf.x + shelf.width, w.x, `seed ${s}: the water does not pour off the end of the shelf`);
      assert.equal(w.top, shelf.y);
    }
    // the pool is fed by the pool fall, and its log floats on it
    const pool = st.proto.w4!.pools![0];
    const pf = st.falls43.find((f) => f.kind === 'pool')!;
    assert.equal(pool.fedBy, pf.fallId);
    assert.equal(pool.platformId, pf.log);
    assert.ok(pool.emptyY - pool.fullY >= 80, `seed ${s}: the log hardly sinks`);
  }
});

test('4-3: pouring water is too strong to climb a wet step, and a dry one is an easy double jump', () => {
  // in full water the push adds to gravity on the way up: the best rise is both jumps against it, plus catching the step's lip
  const g = PHYS.gravUp + FALLS.push;
  const wetRise = PHYS.jumpV ** 2 / (2 * g) + PHYS.doubleV ** 2 / (2 * g) + 26;
  assert.ok(wetRise < WET.rise - 15, `in the water he still rises ${Math.round(wetRise)} px`);
  assert.ok(reachJump(WET.rise, true) > WET.tread, 'a dry wet step is too high');
});

test('4-3: while a fall pours, its steps are the only way on, and the way to stop it is open', () => {
  for (const s of SEEDS) {
    const st = build(s);
    st.falls43.forEach((f, i) => {
      // (the falls before this one are dry by now: plugged, or climbed in a quiet spell)
      const pouring = withWater(st, [f]);
      const top = st.platforms.find((p) => p.id === f.steps[f.steps.length - 1])!;
      const reach = reachable(pouring);
      assert.ok(!reach.has(st.platforms.find((p) => p.y < top.y - WET.rise + 2 && p.x === top.x + top.width)?.id ?? -1), `seed ${s}: fall ${i + 1} can be got past without its steps`);
      assert.ok(!exitFrom(pouring, st.platforms.find((p) => p.x <= st.spawnX && p.x + p.width >= st.spawnX && p.y === st.spawnY)!), `seed ${s}: the shrine is reachable past pouring fall ${i + 1}`);
      if (f.shelf !== undefined) assert.ok(reach.has(f.shelf), `seed ${s}: the boulder's shelf of fall ${i + 1} cannot be reached while it pours`);
    });
  }
});

test('4-3: the order puzzle: the log is the only way to the boulder, and nothing done in any order strands him', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const pf = st.falls43.find((f) => f.kind === 'pool')!;
    const pool = st.proto.w4!.pools![0];
    const full = withWater(st, [pf], { [pf.log!]: pool.fullY });
    const drained = withWater(st, [pf], { [pf.log!]: pool.emptyY });
    const dry = withWater(st, [], { [pf.log!]: pool.emptyY });
    // with the pool full the log takes him up to the boulder; had the pool drained first, the boulder would be out of reach (so
    // stopping the fall before riding the log cannot happen: the boulder is only reached from the log)
    assert.ok(reachable(full).has(pf.shelf!), `seed ${s}: the log does not reach the boulder`);
    assert.ok(!reachable(drained).has(pf.shelf!), `seed ${s}: the boulder is reached without riding the log`);
    // once the fall is stopped (the log sunk, the steps dry), the shrine can be reached from anywhere he could be in this beat
    const beat = st.proto.beats.find((b) => b[2].startsWith('Twist: the pool'))!;
    const here = st.platforms.filter((p) => p.x + p.width > beat[0] - 200 && p.x < beat[1] + 200 && !p.push);
    const couldBe = new Set([...reachable(full), ...reachable(dry)]);
    let checked = 0;
    for (const p of here) {
      if (!couldBe.has(p.id)) continue;
      const q = dry.platforms.find((d) => d.id === p.id)!;
      assert.ok(exitFrom(dry, q), `seed ${s}: stuck on platform ${p.id} once the pool fall is stopped`);
      checked++;
    }
    assert.ok(checked >= 6, `seed ${s}: only ${checked} platforms checked`);
    // and while it still pours, anywhere he can be, the boulder can still be reached (he can always go back and stop it)
    for (const p of here) {
      if (!reachable(full).has(p.id)) continue;
      const q = full.platforms.find((d) => d.id === p.id)!;
      const res = validateStage({ ...full, spawnX: q.x + q.width / 2, spawnY: q.y });
      assert.ok(res.reachableIds.includes(pf.shelf!), `seed ${s}: from platform ${p.id} the boulder is out of reach while the fall pours`);
    }
  }
});

test('4-3: the surge: a cave halfway up behind the water, and the keepsake in a fern at its back', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const surge = st.falls43.find((f) => f.kind === 'surge')!;
    const w = st.proto.w4!.falls!.find((q) => q.id === surge.fallId)!;
    const cave = surge.steps.map((id) => st.platforms.find((p) => p.id === id)!).find((p) => p.width > WET.tread + 60);
    assert.ok(cave, `seed ${s}: no cave ledge on the stair`);
    assert.ok(st.proto.w4!.decor!.some((d) => d.n === 'cave' && d.x > cave!.x && d.x < cave!.x + cave!.width), `seed ${s}: the cave is not painted`);
    assert.ok(cave!.x > w.x && cave!.x + cave!.width <= w.x + w.width + 1, `seed ${s}: the cave is not behind the water`);
    const finds = st.collectibles.filter((c) => c.type === 'find');
    assert.equal(finds.length, 1, `seed ${s}`);
    assert.equal(finds[0].findId, 'w4_keepsake');
    assert.equal(finds[0].hidden, true, 'a keepsake hides in a fern');
    assert.ok(finds[0].x > cave!.x && finds[0].x < cave!.x + cave!.width && Math.abs(finds[0].y + 26 - cave!.y) < 1, `seed ${s}: the ribbon is not in the cave`);
  }
});

test('4-3: the thief sits by a petal and runs off up the terraces, post to post, every post on ground he can reach', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const monkeys = st.proto.w4!.monkeys!;
    assert.equal(monkeys.length, 1);
    const m = monkeys[0];
    assert.equal(m.job, 'thief');
    const petal = st.collectibles.find((c) => c.id === m.petalId);
    assert.ok(petal && petal.type === 'flower', `seed ${s}: the thief has no petal`);
    // he meets the monkey before he can touch the petal (it sits on the far side of it)
    assert.ok(petal!.x > m.x && petal!.x - m.x < 80, `seed ${s}`);
    const reach = new Set(validateStage(st).reachableIds);
    const on = (x: number, y: number) => st.platforms.find((p) => p.x <= x && p.x + p.width >= x && Math.abs(p.y - y) < 1);
    assert.ok(on(m.x, m.y), `seed ${s}: the monkey sits on nothing`);
    let lastX = m.x;
    assert.ok((m.path ?? []).length >= 3, `seed ${s}`);
    for (const post of m.path!) {
      const p = on(post.x, post.y);
      assert.ok(p && reach.has(p.id), `seed ${s}: a post at ${post.x} is not on reachable ground`);
      assert.ok(post.x > lastX + 150, `seed ${s}: the posts do not run on ahead`);
      lastX = post.x;
    }
  }
});

test('4-3: every new thing is taught where it first appears, and the rocks are fair', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const said = (re: RegExp) => st.proto.hints.find((h) => re.test(h.text));
    const falls = st.proto.w4!.falls!;
    const first = falls[0];
    const h1 = said(/water pushes you back down/);
    assert.ok(h1 && h1.x < first.x, `seed ${s}: the first fall is not explained before it`);
    const boulder = said(/boulder/);
    assert.ok(boulder && boulder.aboveY !== undefined && boulder.aboveY >= first.top, `seed ${s}: the boulder is not explained on its shelf`);
    const thief = said(/monkey/);
    assert.ok(thief && thief.x < st.proto.w4!.monkeys![0].x, `seed ${s}: the thief is not explained`);
    const pf = falls.find((w) => w.id === st.falls43.find((f) => f.kind === 'pool')!.fallId)!;
    const pool = said(/pool/);
    assert.ok(pool && /log/.test(pool.text) && pool.x < pf.x - 400, `seed ${s}: the pool is not explained`);
    const sf = falls.find((w) => w.surge)!;
    const surge = said(/comes and goes/);
    assert.ok(surge && /cave/.test(surge.text) && surge.x < sf.x, `seed ${s}: the surge is not explained`);
    const pair = falls.filter((w) => w.surge)[1];
    const two = said(/Two falls/);
    assert.ok(two && two.x < pair.x, `seed ${s}: the pair of surges is not explained`);
    // the rocks came in 4-1; here they come back on a few long terraces, with a reminder at the first
    const rocks = st.proto.w4!.rocks ?? [];
    assert.ok(rocks.length >= 1, `seed ${s}: no rocks`);
    assert.ok(said(/Rocks/)!.x < Math.min(...rocks.map((r) => r.x)), `seed ${s}`);
    for (const r of rocks) {
      assert.ok(rockFits(r) && r.warn >= 1, `seed ${s}`);
      for (const v of st.vines) assert.ok(Math.abs(v.x - r.x) > 120 || v.bottomY < r.land - 20, `seed ${s}: a rock falls where he climbs`);
      for (const w of falls) assert.ok(r.x < w.x - 60 || r.x > w.x + w.width + 60, `seed ${s}: a rock falls in the water`);
    }
  }
});
