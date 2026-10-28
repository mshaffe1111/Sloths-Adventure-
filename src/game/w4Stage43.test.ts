import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, HAND_STAGES, stageSeconds } from './protoStage.ts';
import { buildWaterfallSteps, POOL, ROCK_TIP, ROCK_WARN, SURGE_CLIMB, WET, type FallInfo } from './w4Stage43.ts';
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

/**
 * the stage as it is while some falls pour: their steps cannot be climbed (taken out), a pool's log sits where its water has it, and
 * the boulders of the falls in `plugged` sit in their slots (the level check models the rest of the water itself: levelCheck.ts)
 */
function withWater(st: Stage, pouring: FallInfo[], logAt: Record<number, number> = {}, plugged: FallInfo[] = []): GeneratedStage {
  const gone = new Set(pouring.flatMap((f) => f.steps));
  const slot = new Map<number, number>();
  for (const f of plugged) {
    const w = st.proto.w4!.falls!.find((q) => q.id === f.fallId)!;
    if (w.plug) slot.set(w.plug.platformId, w.plug.atX);
  }
  const platforms: Platform[] = st.platforms
    .filter((p) => !gone.has(p.id))
    .map((p) => (logAt[p.id] !== undefined ? { ...p, y: logAt[p.id] } : slot.has(p.id) ? { ...p, x: slot.get(p.id)! } : p));
  return { ...st, platforms };
}
/** somewhere on a platform he can stand (not under a boulder: a boulder is a wall on the ground it stands on) */
const standX = (stage: GeneratedStage, p: Platform) =>
  [p.x + p.width / 2, p.x + 30, p.x + p.width - 30].find((x) => !stage.platforms.some((b) => b.push && b.y + b.height === p.y && x > b.x - 20 && x < b.x + b.width + 20)) ?? p.x + p.width / 2;
/** can he get to the shrine from standing on this platform? */
const exitFrom = (stage: GeneratedStage, p: Platform) => {
  const res = validateStage({ ...stage, spawnX: standX(stage, p), spawnY: p.y });
  return !res.errors.some((e) => /exit platform .* not reachable|no platform under the spawn/.test(e));
};
const reachable = (stage: GeneratedStage) => new Set(validateStage(stage).reachableIds);

test('4-3 is hand-built', () => {
  assert.equal(HAND_STAGES['4-3'], '4-3');
  const st = buildProtoStage(cfg, 1, '4-3');
  assert.ok(st.proto.w4?.falls?.length, 'buildProtoStage builds Waterfall Steps');
});

test('4-3: every roll can be finished, has one exit, takes a quick player its own length (3.5 minutes), and needs no pickup moved', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    assert.ok(st.meta!.timing!.layoutSeconds >= stageSeconds('4-3'), `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok(st.meta!.timing!.layoutSeconds <= stageSeconds('4-3') + 25, `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s is far over`);
    assert.equal(st.proto.movedPickups ?? 0, 0, `seed ${s}: ${st.proto.movedPickups} pickups had to be moved`);
    // an ascent: the shrine is the highest ground, the start the lowest
    const top = Math.min(...st.platforms.map((p) => p.y));
    assert.ok(Math.abs(st.exitTotemY - top) < 1, `seed ${s}: the shrine is not at the top`);
    assert.ok(st.spawnY - st.exitTotemY > 3000, `seed ${s}: only ${st.spawnY - st.exitTotemY} px of climb`);
    // nothing crumbles, and every terrace is solid to the floor (a slip only ever lands on a lower step)
    assert.ok(st.platforms.every((p) => p.type === 'solid'), `seed ${s}`);
  }
});

test('4-3: each fall is a different idea, in order: plugs, the pool and its log, the surges, then the surges with the others', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const kinds = st.falls43.map((f) => f.kind);
    // the lessons (two plugs, the pool, the surge); then, in the roll's order (w4Sections.ts), the thief up a surge, the tide pool and a
    // surge stair up to a plug; then the surges of the finish
    assert.deepEqual(kinds.slice(0, 4), ['plug', 'plug', 'pool', 'surge'], `seed ${s}: ${kinds.join(',')}`);
    const mid = kinds.slice(4, 8).join(',');
    assert.ok(['surge,tide,surge,plug', 'tide,surge,surge,plug', 'surge,plug,tide,surge', 'surge,surge,plug,tide', 'tide,surge,plug,surge', 'surge,plug,surge,tide'].includes(mid), `seed ${s}: ${kinds.join(',')}`);
    assert.ok(kinds.slice(8).length >= 2 && kinds.slice(8).every((k) => k === 'surge'), `seed ${s}: ${kinds.join(',')}`);
    const falls = st.proto.w4!.falls!;
    for (const f of st.falls43) {
      const w = falls.find((q) => q.id === f.fallId)!;
      if (f.kind === 'tide') continue; // (it pours into its pool, over no steps: its own test below)
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
      if (f.kind === 'tide') return;
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
    const dry = withWater(st, [], { [pf.log!]: pool.emptyY }, [pf]);
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
      const res = validateStage({ ...full, spawnX: standX(full, q), spawnY: q.y });
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
    assert.equal(monkeys.length, 2);
    const reach = new Set(validateStage(st).reachableIds);
    const on = (x: number, y: number) => st.platforms.find((p) => p.x <= x && p.x + p.width >= x && Math.abs(p.y - y) < 1);
    for (const m of monkeys) {
      assert.equal(m.job, 'thief');
      const petal = st.collectibles.find((c) => c.id === m.petalId);
      assert.ok(petal && petal.type === 'flower', `seed ${s}: the thief has no petal`);
      // he meets the monkey before he can touch the petal (it sits on the far side of it)
      assert.ok(petal!.x > m.x && petal!.x - m.x < 80, `seed ${s}`);
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
    // the second runs up behind a surge: one of its posts is the cave behind the water, on a step of that surge's stair
    const second = monkeys[1];
    // (its surge: the first surge after the lesson's one that the second thief's posts run up behind)
    const fallOf = (f: FallInfo) => st.proto.w4!.falls!.find((q) => q.id === f.fallId)!;
    const surge = st.falls43.slice(4).find((f) => f.kind === 'surge' && second.path!.some((q) => q.x > fallOf(f).x && q.x < fallOf(f).x + fallOf(f).width)) ?? st.falls43[4];
    assert.equal(surge.kind, 'surge');
    const w = fallOf(surge);
    const inCave = second.path!.find((q) => q.x > w.x && q.x < w.x + w.width);
    assert.ok(inCave, `seed ${s}: the second thief does not run behind the water`);
    const caveLedge = on(inCave!.x, inCave!.y)!;
    assert.ok(surge.steps.includes(caveLedge.id) && caveLedge.width > WET.tread + 60, `seed ${s}: its post behind the water is not the cave`);
    assert.ok(st.proto.w4!.decor!.some((d) => d.n === 'cave' && Math.abs(d.x - inCave!.x) < 2), `seed ${s}: that cave is not painted`);
    assert.ok(second.x > w.x - 1600 && second.x < w.x, `seed ${s}: the second thief does not sit just before the surge`);
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
    // the thief behind the falls, the tide pool and the surge up to the boulder, each explained before it
    const m2 = st.proto.w4!.monkeys![1];
    const behind = said(/runs up behind the falling water/);
    assert.ok(behind && behind.x < m2.x, `seed ${s}: the second thief is not explained`);
    const tide = falls.find((w) => w.id === st.falls43.find((f) => f.kind === 'tide')!.fallId)!;
    const fills = said(/only fills while its fall pours/);
    assert.ok(fills && /log/.test(fills.text) && fills.x < tide.x - 400, `seed ${s}: the tide pool is not explained`);
    const quiet = said(/Cross when it goes quiet/);
    assert.ok(quiet && quiet.aboveY !== undefined && quiet.aboveY <= tide.top + 170, `seed ${s}: the gap at the top of the tide pool is not explained up there`);
    const upTo = st.falls43[6];
    const stair = falls.find((w) => w.id === upTo.fallId)!;
    const climbUp = said(/to the boulder above the next fall/);
    assert.ok(climbUp && climbUp.x < stair.x, `seed ${s}: the surge up to the boulder is not explained`);
    const pair = falls.filter((w) => w.surge)[4];
    const two = said(/Two falls/);
    assert.ok(two && two.x < pair.x, `seed ${s}: the pair of surges is not explained`);
    // the rocks came in 4-1; here they come back on a few long terraces, with a reminder at the first
    const rocks = st.proto.w4!.rocks ?? [];
    assert.ok(rocks.length >= 1, `seed ${s}: no rocks`);
    assert.ok(said(/Rocks/)!.x < Math.min(...rocks.map((r) => r.x)), `seed ${s}`);
    for (const r of rocks) {
      assert.ok(rockFits(r) && r.warn >= 1, `seed ${s}`);
      // (round 4, Matt 2026-10-28 "Harder, still safe": a grit-warned rock may come down a tree's trunk, knocking him off it, the climb
      // again; the terrace rocks keep clear of every climb)
      if (!r.air) for (const v of st.vines) assert.ok(Math.abs(v.x - r.x) > 120 || v.bottomY < r.land - 20, `seed ${s}: a rock falls where he climbs`);
      for (const w of falls) assert.ok(r.x < w.x - 60 || r.x > w.x + w.width + 60, `seed ${s}: a rock falls in the water`);
    }
  }
});

test('4-3: the tide pool: the surge lifts the log to the only way up, and the fall pours over the gap at the top', () => {
  for (const s of SEEDS) {
    const st = build(s);
    assert.equal(st.tides43.length, 1);
    const t = st.tides43[0];
    const w = st.proto.w4!.falls!.find((q) => q.id === t.fallId)!;
    const pool = st.proto.w4!.pools!.find((q) => q.fedBy === t.fallId)!;
    assert.ok(w.surge && !w.plug, `seed ${s}: the tide pool's fall is not on its own rhythm`);
    assert.ok(w.surge!.quiet >= 2.8 && w.surge!.ease >= 1, `seed ${s}`);
    assert.equal(pool.platformId, t.log);
    assert.ok(pool.emptyY - pool.fullY >= 80, `seed ${s}: the log hardly rises`);
    // the log is clear of the falling water (standing on it, the pour neither pushes nor slows him)
    const log = st.platforms.find((p) => p.id === t.log)!;
    assert.ok(log.x + log.width < w.x - 5, `seed ${s}: the log is in the water`);
    const at = (y: number) => validateStage({ ...st, platforms: st.platforms.map((p) => (p.id === t.log ? { ...p, y } : p)) });
    // the log high: the way on is open; the log low (the pool drained in a quiet spell): the ledge beside it, and the shrine, are not
    const high = at(pool.fullY), low = at(pool.emptyY);
    assert.ok(high.ok, `seed ${s}: ${high.errors.join('; ')}`);
    assert.ok(!low.reachableIds.includes(t.ledge) && !low.ok, `seed ${s}: the ledge is reached without the water lifting the log`);
    // half full is not enough either: he has to wait for the water to lift it most of the way
    const half = at(Math.round((pool.fullY + pool.emptyY) / 2));
    assert.ok(!half.reachableIds.includes(t.ledge), `seed ${s}: a half-full pool is enough`);
    // at the top the water pours over the whole gap between the shelf and the cliff top, from well above them: in the pour he is
    // washed down into the pool, in the quiet he jumps across
    const lip = st.platforms.find((p) => p.id === t.lip)!;
    const beyond = st.platforms.find((p) => Math.abs(p.y - lip.y) < 1 && p.x > lip.x + lip.width && p.x - (lip.x + lip.width) < 200)!;
    assert.ok(beyond, `seed ${s}: no cliff top across the gap`);
    assert.ok(w.x >= lip.x + lip.width && w.x + w.width <= beyond.x + 1 && w.x - (lip.x + lip.width) < 40, `seed ${s}: the water does not fill the gap`);
    assert.ok(w.top <= lip.y - 150 && w.bottom >= log.y + 100, `seed ${s}: the water does not reach from above the gap to the pool`);
    // without the shelf the cliff top cannot be reached: the shelf is the only way, and the shelf is only reached from the log's ledge
    const noLip = validateStage({ ...st, platforms: st.platforms.filter((p) => p.id !== t.lip) });
    assert.ok(!noLip.ok, `seed ${s}: the cliff top is reached without the shelf`);
  }
});

test('4-3: the boulder up the surge: its shelf is reached only up the surge stair, and a slip off the shelf only costs a climb', () => {
  for (const s of SEEDS) {
    const st = build(s);
    // (the one plug after the lessons, and the surge stair just before it; their place in the stage is the roll's)
    const at = st.falls43.findIndex((f, i) => i >= 4 && f.kind === 'plug');
    const stair = st.falls43[at - 1];
    const plugF = st.falls43[at];
    assert.equal(stair.kind, 'surge');
    assert.equal(plugF.kind, 'plug');
    const shelf = st.platforms.find((p) => p.id === plugF.shelf)!;
    // while the surge pours (its steps out of reach) the shelf cannot be reached; once it is quiet it can
    assert.ok(!reachable(withWater(st, [stair, plugF])).has(shelf.id), `seed ${s}: the shelf is reached past the pouring surge`);
    assert.ok(reachable(withWater(st, [plugF])).has(shelf.id), `seed ${s}: the shelf cannot be reached up the quiet surge`);
    // the floor under the shelf: a tree there climbs back up to it
    const floor = st.platforms.find((p) => p.y > shelf.y + 400 && p.x <= shelf.x + 60 && p.x + p.width >= shelf.x + 60)!;
    assert.ok(floor, `seed ${s}: nothing under the shelf`);
    const tree = st.vines.find((v) => v.x > shelf.x && v.x < shelf.x + 120 && Math.abs(v.topY + 2 - shelf.y) < 1 && v.bottomY > floor.y - 20);
    assert.ok(tree, `seed ${s}: no tree from the floor back up to the shelf`);
    const pouring = withWater(st, [plugF]);
    const res = validateStage({ ...pouring, spawnX: floor.x + 40, spawnY: floor.y });
    assert.ok(res.reachableIds.includes(shelf.id), `seed ${s}: dropped to the floor before plugging, he cannot get back to the boulder`);
  }
});

test('4-3: every surge goes quiet for long enough to climb from the foot of its water to the next dry spot (its water washes him down)', () => {
  for (const s of SEEDS) {
    const st = build(s);
    for (const f of st.falls43) {
      if (f.kind !== 'surge') continue;
      const w = st.proto.w4!.falls!.find((q) => q.id === f.fallId)!;
      const steps = f.steps.map((id) => st.platforms.find((p) => p.id === id)!).sort((a, b) => a.x - b.x);
      // the stretches between dry spots: up to the cave behind the water (where the pour goes past in front of him), and on out of it
      const runs: number[] = [];
      let n = 0;
      for (const p of steps) {
        n++;
        const sheltered = (w.shelter ?? []).some((q) => q.y === p.y && q.x0 >= p.x && q.x1 <= p.x + p.width);
        if (sheltered) { runs.push(n); n = 0; }
      }
      runs.push(n + 1); // (and the step up out of the water at the top)
      const most = Math.max(...runs);
      assert.ok(w.surge!.quiet >= SURGE_CLIMB.start + SURGE_CLIMB.perJump * most - 0.05, `seed ${s}: ${w.surge!.quiet} s of quiet for ${most} wet jumps`);
      // every cave on a stair is sheltered, and only a cave
      for (const p of steps) if (p.width > WET.tread + 60) assert.ok((w.shelter ?? []).some((q) => q.y === p.y && q.x0 >= p.x && q.x1 <= p.x + p.width), `seed ${s}: a cave the water still pushes in`);
    }
  }
});

test('4-3: the boulder is taught as it is moved (walk into it from beside it on its shelf), and every plug fall knows the ground past it', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const h = st.proto.hints.find((q) => /boulder/.test(q.text))!;
    for (const t of [h.text, h.pad, h.keys]) assert.ok(/Walk right into it/.test(t) && /push/.test(t), `seed ${s}: "${t}"`);
    // (said only before the boulder's slot: from further on, higher than its shelf, it used to come up late, well past it)
    for (const q of st.proto.hints.filter((q) => /boulder in/.test(q.text) || q === h)) assert.ok(q.beforeX !== undefined && q.beforeX > q.x, `seed ${s}: "${q.text}" has no beforeX`);
    for (const f of st.falls43.filter((q) => q.kind === 'plug' || q.kind === 'pool')) {
      const w = st.proto.w4!.falls!.find((q) => q.id === f.fallId)!;
      const top = st.platforms.find((p) => p.id === f.steps[f.steps.length - 1])!;
      // the ground past it: right of the stair, at the height of the terrace the stair climbs to (and not the stair's own steps)
      assert.ok(w.past && w.past.x > w.x + w.width && w.past.y < top.y, `seed ${s}: fall ${f.fallId} has no "past"`);
      const on = st.platforms.find((p) => p.x <= w.past!.x && p.x + p.width > w.past!.x && Math.abs(p.y - (w.past!.y - 10)) < 1);
      assert.ok(on, `seed ${s}: nothing to stand on past fall ${f.fallId}`);
    }
  }
});

test('4-3: from the log at its highest the ledge is a double jump straight up (it reaches out over the log), with a petal on it there and Dot saying so', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const pairs = [
      { log: st.falls43.find((f) => f.kind === 'pool')!.log!, ledge: undefined as number | undefined },
      { log: st.tides43[0].log, ledge: st.tides43[0].ledge },
    ];
    for (const pr of pairs) {
      const log = st.platforms.find((p) => p.id === pr.log)!;
      const pool = st.proto.w4!.pools!.find((q) => q.platformId === pr.log)!;
      // the ledge over the log's near end
      const ledge = st.platforms.find((p) => (pr.ledge === undefined || p.id === pr.ledge) && p.height === 24 && Math.abs(p.y - (pool.fullY - POOL.ledge)) < 1 && p.x < log.x && p.x + p.width >= log.x + POOL.over - 1)!;
      assert.ok(ledge, `seed ${s}: no ledge reaching over the log ${pr.log}`);
      assert.ok(POOL.ledge + 20 < PHYS.jumpV ** 2 / (2 * PHYS.gravUp) + PHYS.doubleV ** 2 / (2 * PHYS.gravUp), 'the jump up from the log is not a plain double jump');
      assert.ok(st.collectibles.some((c) => c.type === 'flower' && c.x > log.x && c.x < log.x + POOL.over && Math.abs(c.y - (ledge.y - 34)) < 1), `seed ${s}: no petal on the ledge over the log`);
      assert.ok(st.proto.hints.some((q) => /near end of the log/.test(q.text) && /straight up/.test(q.text) && q.x < log.x), `seed ${s}: Dot does not say where to jump from`);
    }
  }
});

test('4-3: every rock warns for ROCK_WARN seconds, and Dot\'s rock line is the one w4Play says if it was missed', () => {
  assert.ok(ROCK_WARN >= 2);
  for (const s of SEEDS) {
    const st = build(s);
    for (const r of st.proto.w4!.rocks ?? []) assert.equal(r.warn, ROCK_WARN, `seed ${s}`);
    assert.equal(st.proto.w4!.rockTip, ROCK_TIP);
    assert.ok(st.proto.hints.some((h) => h.text === ROCK_TIP), `seed ${s}`);
  }
});
