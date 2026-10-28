import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, HAND_STAGES, NEST_GOAL_48, W48_SECONDS } from './protoStage.ts';
import { maxRise } from './protoCheck.ts';
import { validateStage } from './levelCheck.ts';
import { CAP, capBlocks, newCapuchin, stepGuard } from './capuchin.ts';
import { FALLS } from './waterfalls.ts';
import { zoneState } from './zones.ts';
import { GUARD_LEAP, W4Play, type W4Host } from './w4Play.ts';
import { NEST_WIND, nestWind, type CliffNest, type NestKind } from './w4Nests.ts';
import type { LevelConfig, PlayerState } from './types.ts';

const cfg = {
  worldIndex: 4, miniIndex: 8, id: '4-8', name: 'Nests on the Cliff', objectiveType: 'rescue', targetCount: 4, timeLimit: 0, levelWidth: 9000,
  levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const build = (s: number) => buildProtoStage(cfg, s, '4-8');
const KINDS: NestKind[] = ['plain', 'knot', 'fall', 'guard', 'glide'];
/** does this nest need that idea (on its own, or as one of two)? */
const has = (n: CliffNest, k: NestKind) => n.kind === k || n.also === k;
const player = (x: number, y: number, extra: Partial<PlayerState> = {}) =>
  ({ x, y, vx: 0, vy: 0, grounded: true, climbing: false, invincibleTimer: 0, ...extra }) as unknown as PlayerState;
const host = (st: ReturnType<typeof build>, p: PlayerState, t = 0): W4Host => ({
  t, player: p, platforms: st.platforms, vines: st.vines, collectibles: st.collectibles, zones: st.zones ?? [], punch: null, hidden: false,
  hurt: () => {}, tip: () => {}, float: () => {}, screech: () => {}, sfx: () => {},
});

test('4-8 is hand-built', () => {
  assert.equal(HAND_STAGES['4-8'], '4-8');
});

test('4-8: every roll can be finished, has one exit, and takes a quick player about three minutes', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    assert.ok(W48_SECONDS >= EXPERT_SECONDS + 40 && st.meta!.timing!.layoutSeconds >= 180, `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups had to be moved`);
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Start', 'Learn', 'Develop', 'Twist', 'Twist', 'Finish']);
    // no crumbling platforms anywhere, and a golden seed (the secret, out past the last nest)
    assert.ok(st.platforms.every((p) => p.type !== 'fragile'), `seed ${s}`);
    assert.ok(st.collectibles.some((c) => c.type === 'seed'), `seed ${s}: no golden seed`);
  }
});

test('4-8: the goal is the nests, with one and a half times as many on the cliff, every one of them reachable', () => {
  for (const s of SEEDS) {
    const st = build(s);
    assert.equal(st.config.targetCount, NEST_GOAL_48);
    const cages = st.collectibles.filter((c) => c.type === 'cage');
    assert.ok(cages.length >= Math.ceil(NEST_GOAL_48 * 1.5), `seed ${s}: ${cages.length} nests`);
    assert.ok(cages.every((c) => c.critter === 'eaglet' && c.cageHp === 2));
    const nests = st.proto.w4!.cliffNests!;
    assert.deepEqual(nests.map((n) => n.cageId).sort((a, b) => a - b), cages.map((c) => c.id).sort((a, b) => a - b));
    // the first nest is the plain one; each puzzle comes at least twice on its own, and the second twist puts two together three ways
    assert.equal(nests[0].kind, 'plain');
    for (const k of KINDS.slice(1)) assert.ok(nests.filter((n) => n.kind === k && !n.also).length >= 2, `seed ${s}: fewer than two ${k} nests`);
    const pairs = new Set(nests.filter((n) => n.also).map((n) => [n.kind, n.also].sort().join('+')));
    // (round 5: the roll's flavour picks the pairs, at least one, from these three)
    assert.ok(pairs.size >= 1 && [...pairs].every((p) => ['glide+guard', 'glide+knot', 'guard+knot'].includes(p)), `seed ${s}: ${[...pairs].join(', ')}`);
    const res = validateStage(st);
    for (const n of nests) {
      const c = cages.find((q) => q.id === n.cageId)!;
      const pl = st.platforms.find((p) => p.id === n.platformId)!;
      assert.ok(res.reachableIds.includes(pl.id), `seed ${s}: the ${n.kind} nest at ${n.x} cannot be reached`);
      assert.ok(c.x > pl.x + 40 && c.x < pl.x + pl.width - 40 && c.y === pl.y - 26, `seed ${s}: the ${n.kind} nest is not on its ledge`);
      assert.ok(c.x < st.exitTotemX - 300, `seed ${s}: a nest past the shrine`);
    }
  }
});

test('4-8: each puzzle is needed: the nest cannot be reached without what it teaches', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const w4 = st.proto.w4!;
    const nests = w4.cliffNests!;
    const reached = (stage: Parameters<typeof validateStage>[0]) => new Set(validateStage(stage).reachableIds);
    // Dot's knots: without the vines they let down, the knot nests' ledges are out of reach (nothing else gets there: no jump, no glide)
    const knotVines = new Set(w4.knots!.map((k) => k.releases.id));
    assert.equal(w4.knots!.length, nests.filter((n) => has(n, 'knot')).length);
    assert.ok(w4.knots!.every((k) => k.releases.kind === 'vine'));
    const noKnots = reached({ ...st, vines: st.vines.filter((v) => !knotVines.has(v.id)) });
    for (const n of nests.filter((q) => has(q, 'knot'))) assert.ok(!noKnots.has(n.platformId), `seed ${s}: a knot nest is reachable without its vine`);
    for (const k of w4.knots!) {
      const v = st.vines.find((q) => q.id === k.releases.id)!;
      assert.ok(v.rope && v.bottomY >= G - 10 && k.ground === G && k.x0 < v.x && k.x1 > v.x, `seed ${s}: the knot's spot is not under its vine`);
    }
    // the falls: the only way to their nests is across the water from the shelf the boulder rolls along
    const falls = w4.falls!;
    assert.equal(falls.length, nests.filter((n) => n.kind === 'fall').length);
    const shelves = new Set<number>();
    for (const f of falls) {
      const b = st.platforms.find((p) => p.id === f.plug!.platformId)!;
      const shelf = st.platforms.find((p) => p.y === b.y + b.height && p.x <= b.x && p.x + p.width === b.push!.max)!;
      assert.ok(shelf, `seed ${s}: the boulder is not on the fall's shelf`);
      shelves.add(b.id).add(shelf.id);
      assert.ok(b.push && b.push.max - b.width === f.plug!.atX && b.push.min < b.x, `seed ${s}: the boulder does not roll to the channel`);
      // the water pours from higher than a double jump off the boulder goes, onto the boulder's last stretch of the shelf
      assert.ok(f.bottom === G && f.top < b.y - maxRise() - 20, `seed ${s}: a jump goes over the water`);
      assert.ok(f.x < b.push!.max && f.x >= f.plug!.atX, `seed ${s}: the boulder does not stop under the water`);
      // the water fills the whole gap to the nest's ledge
      const ledge = st.platforms.find((p) => p.x === f.x + f.width && Math.abs(p.y - shelf.y) < 30)!;
      assert.ok(ledge, `seed ${s}: no ledge past the water`);
      assert.ok(nests.some((n) => n.kind === 'fall' && n.platformId === ledge.id), `seed ${s}: the fall does not stand before its nest`);
    }
    const noShelves = reached({ ...st, platforms: st.platforms.filter((p) => !shelves.has(p.id)) });
    for (const n of nests.filter((q) => q.kind === 'fall')) assert.ok(!noShelves.has(n.platformId), `seed ${s}: a fall nest is reachable around the water`);
    // the guards: the ledge is reached only by its own way up (a trunk or a knotted vine), and the guard paces between that and the
    // nest (or the end of the perch the nest is glided to), under a gust lane, with chimes before it
    const guards = w4.monkeys!;
    assert.equal(guards.length, nests.filter((n) => has(n, 'guard')).length);
    for (const m of guards) {
      assert.equal(m.job, 'guard');
      const ledge = st.platforms.find((p) => p.y === m.y && p.x < m.x && p.x + p.width > m.x && p.height < 50)!;
      const up = st.vines.find((v) => v.vineType === 'tree_climb' && Math.abs(v.topY + 2 - ledge.y) < 3 && v.x >= ledge.x && v.x <= ledge.x + 60)!;
      assert.ok(up, `seed ${s}: no way up to the guard's ledge`);
      const noWay = reached({ ...st, vines: st.vines.filter((v) => v !== up) });
      assert.ok(!noWay.has(ledge.id), `seed ${s}: the guard's ledge is reachable another way`);
      assert.ok(m.x0! - up.x >= 90, `seed ${s}: the guard paces up to the way up`);
      const n = nests.find((q) => has(q, 'guard') && (q.platformId === ledge.id || (q.x > ledge.x + ledge.width && q.x < ledge.x + ledge.width + 900)))!;
      assert.ok(n, `seed ${s}: no nest behind the guard`);
      if (n.platformId === ledge.id) {
        // out of reach of his blows (108 px from his middle) while it holds him back 30 px short of it
        assert.ok(n.x - 24 - (m.x1! - 30) > 108, `seed ${s}: the nest can be punched past the guard`);
      } else {
        assert.ok(n.also === 'glide' || n.kind === 'glide');
        assert.ok(!noWay.has(n.platformId), `seed ${s}: the glide nest is reachable without the guard's perch`);
        assert.ok(ledge.x + ledge.width - m.x1! >= 120, `seed ${s}: no room past the guard to set off`);
      }
      const z = (st.zones ?? []).find((q) => q.kind === 'wind' && q.x0 <= m.x0! && q.x1 >= m.x1! && q.top < m.y && q.bottom > m.y);
      assert.ok(z && z.dir === 1, `seed ${s}: no gust lane over the guard`);
      assert.ok(w4.chimes!.some((c) => st.zones![c.zone] === z && c.x < up.x), `seed ${s}: no chimes before the guard`);
    }
    // the leaf: judged as a stage before the leaf can be counted on (4-6), the glide nests' branches are out of reach
    const noLeaf = reached({ ...st, config: { ...st.config, miniIndex: 6 } });
    for (const n of nests.filter((q) => has(q, 'glide'))) {
      assert.ok(!noLeaf.has(n.platformId), `seed ${s}: a glide nest is reachable without the leaf`);
      assert.ok(n.y < G - 230, `seed ${s}: a glide nest a double jump reaches from the floor`);
    }
  }
});

test('4-8: each idea is taught where it first comes, and the netting for every control', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const hints = st.proto.hints;
    const nests = st.proto.w4!.cliffNests!;
    const first = (k: NestKind) => Math.min(...nests.filter((n) => has(n, k)).map((n) => n.x));
    const at = (re: RegExp) => hints.find((h) => re.test(h.text))?.x ?? Infinity;
    assert.ok(at(/Eaglet chicks/) < first('plain') - 400, `seed ${s}`);
    const net = hints.find((h) => /netting/.test(h.text) && /Tap twice/.test(h.text))!;
    assert.ok(net && /Punch/.test(net.pad) && /J/.test(net.keys) && net.x < first('plain') - 100, `seed ${s}: the netting is not taught first`);
    assert.ok(at(/knot/) < first('knot') - 300 && /Dot/.test(hints.find((h) => /knot/.test(h.text))!.text), `seed ${s}: the knot is not taught first`);
    assert.ok(at(/boulder/) < first('fall') - 400, `seed ${s}: the boulder is not taught first`);
    const boulder = hints.find((h) => /boulder/.test(h.text))!;
    assert.ok(/pad/.test(boulder.pad) && /right/.test(boulder.keys), `seed ${s}: pushing is not taught for every control`);
    assert.ok(at(/guards/) < first('guard') - 400 && /chimes/.test(hints.find((h) => /guards/.test(h.text))!.text), `seed ${s}: the guard is not taught first`);
    const leaf = hints.find((h) => /leaf/.test(h.text))!;
    assert.ok(leaf && leaf.x < first('glide') - 600 && /hold Jump/.test(leaf.pad) && /Space/.test(leaf.keys), `seed ${s}: the glide nest is not taught first`);
    assert.ok(hints.some((h) => /wings/.test(h.text) && h.x > first('plain')), `seed ${s}: the tailwind is not told`);
    // the pairs, each told where it comes
    for (const [pair, re] of [['glide+knot', /Dot first, then your leaf/], ['guard+knot', /tied up too/], ['glide+guard', /high perch/]] as const) {
      // (round 5: the roll's flavour picks which pairs come, so a pair may be missing; each one that comes is told)
      const n = nests.find((q) => q.also && [q.kind, q.also].sort().join('+') === pair);
      if (!n) continue;
      const h = hints.find((q) => re.test(q.text));
      assert.ok(h && h.x < n.x - 400 && h.x > n.x - 2200, `seed ${s}: the ${pair} nest is not told`);
    }
  }
});

test('4-8 runtime: standing still under a knot, Dot frees the vine and it drops to the ground', () => {
  const st = structuredClone(build(SEEDS[0]));
  const play = new W4Play(st.proto.w4!, st.platforms, st.vines);
  const k = st.proto.w4!.knots![0];
  const v = st.vines.find((q) => q.id === k.releases.id)!;
  assert.ok(v.bottomY < G - 200, 'the vine hangs rolled up out of reach');
  const p = player((k.x0 + k.x1) / 2, G);
  for (let t = 0; t < 5; t += 1 / 30) play.step(1 / 30, host(st, p, t));
  assert.ok(v.bottomY >= G - 10, `the vine reached ${v.bottomY}`);
});

test('4-8 runtime: the fall pushes a jump down and folds the leaf until the boulder is in its channel', () => {
  const st = structuredClone(build(SEEDS[1]));
  const f = st.proto.w4!.falls![0];
  const play = new W4Play({ falls: [f] }, st.platforms, []);
  const b = st.platforms.find((q) => q.id === f.plug!.platformId)!;
  const p = player(f.x + f.width / 2, f.top + 120, { grounded: false, vy: -300 });
  play.step(1 / 30, host(st, p));
  assert.ok(p.vy > -300, 'the water did not push him down');
  assert.equal(play.inPour(p.x, p.y), true);
  assert.equal(play.inPour(f.x - 20, p.y), false);
  b.x = f.plug!.atX;
  for (let t = 0; t < FALLS.dry + 0.5; t += 1 / 30) play.step(1 / 30, host(st, player(b.x - 40, b.y + b.height), t));
  assert.equal(play.inPour(f.x + f.width / 2, f.top + 120), false, 'the plugged fall still pours');
});

test('4-8 runtime: a guard will not let him by, nor over; a gust knocks it down long enough to pass, on every beat', () => {
  const st = build(SEEDS[2]);
  for (const m of st.proto.w4!.monkeys!) {
    // walking into it, and jumping over it, he is shoved back
    for (const dy of [0, 150, GUARD_LEAP - 20]) {
      const play = new W4Play({ monkeys: [m] }, [], []);
      const p = player(m.x - 20, m.y - dy, { grounded: dy === 0 });
      play.step(1 / 30, { ...host(st, p), zones: [] });
      assert.ok(p.x <= m.x - 25, `pushed to ${p.x - m.x} at ${dy} px up`);
    }
    // the gust lane over it knocks it down every cycle, for most of the cycle
    const z = st.zones!.find((q) => q.kind === 'wind' && q.x0 <= m.x0! && q.x1 >= m.x1!)!;
    const s = newCapuchin(m);
    let down = 0, knocks = 0;
    // (three cycles, and the last knock's time on the ground to its end: with a gust right at the start of the clock, the third knock's
    // down time ran past the third cycle and was cut short, 2026-10-28)
    for (let t = 0; t < z.period * 3 + CAP.down; t += 1 / 30) {
      const zs = zoneState(z, t);
      if (stepGuard(m, s, zs.phase === 'active' ? z.dir * zs.strength : 0, 1 / 30).knocked) knocks++;
      if (!capBlocks(m, s, s.x)) down += 1 / 30;
    }
    assert.ok(knocks >= 3, `knocked ${knocks} times in three gusts`);
    assert.ok(down >= CAP.down * 2.5, `down ${down.toFixed(1)} s of ${z.period * 3} s`);
  }
});

test('4-8 runtime: a freed chick\'s parent blows a tailwind ahead of the nest for a while, and only then', () => {
  const c = { x: 1000, y: 300, collected: false, critter: 'eaglet' as const, freedAt: undefined as number | undefined };
  assert.equal(nestWind([c], 1100, 320, false, 5), 0);
  c.collected = true;
  c.freedAt = 5;
  assert.equal(nestWind([c], 1100, 320, false, 5.2), 0, 'the parent has not arrived yet');
  const t = 5 + NEST_WIND.arrive + 2;
  assert.equal(nestWind([c], 1100, 320, false, t), NEST_WIND.force);
  assert.ok(nestWind([c], 1100, 320, true, t) > 0 && nestWind([c], 1100, 320, true, t) < NEST_WIND.force);
  assert.equal(nestWind([c], c.x + NEST_WIND.ahead + 40, 320, false, t), 0, 'past the lane');
  assert.equal(nestWind([c], c.x - NEST_WIND.back - 40, 320, false, t), 0, 'behind the lane');
  assert.equal(nestWind([c], c.x - 30, 320, false, t), 0, 'it pushes him while he stands at the nest');
  assert.equal(nestWind([c], 1100, 320, false, 5 + NEST_WIND.arrive + NEST_WIND.beat + 0.1), 0, 'it stops');
  // the stage's own step hands it to the engine
  const st = structuredClone(build(SEEDS[0]));
  const play = new W4Play(st.proto.w4!, st.platforms, st.vines);
  const cage = st.collectibles.find((q) => q.id === st.proto.w4!.cliffNests![0].cageId)!;
  cage.collected = true;
  cage.freedAt = 0;
  const out = play.step(1 / 30, host(st, player(cage.x + 200, G), NEST_WIND.arrive + 1));
  assert.ok(out.wind > 0);
});
