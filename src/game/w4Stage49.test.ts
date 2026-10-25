import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, HAND_STAGES, stageSeconds } from './protoStage.ts';
import { AERIE, GUARD_GOAL_49, type Aerie49 } from './w4Stage49.ts';
import { validateStage } from './levelCheck.ts';
import { maxRise } from './protoCheck.ts';
import { BLOW_OFF, capBlocks, newCapuchin, stepGuard } from './capuchin.ts';
import { PHYS } from './physics.ts';
import { zoneState } from './zones.ts';
import { BLOWN_NEAR, GUARD_LEAP, W4Play, type W4Host } from './w4Play.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { LevelConfig, PlayerState } from './types.ts';

const cfg = {
  worldIndex: 4, miniIndex: 9, id: '4-9', name: 'The Aerie', objectiveType: 'gauntlet', targetCount: 13, timeLimit: 0, levelWidth: 9000,
  levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
type Built = ReturnType<typeof buildProtoStage> & { aerie49: Aerie49 };
const cache = new Map<number, Built>();
const build = (s: number): Built => {
  if (!cache.has(s)) cache.set(s, buildProtoStage(cfg, s, '4-9') as Built);
  return cache.get(s)!;
};
const reached = (st: GeneratedStage) => new Set(validateStage(st).reachableIds);
const byId = (st: GeneratedStage, id: number) => st.platforms.find((p) => p.id === id)!;
const exitBlocked = (st: GeneratedStage) => validateStage(st).errors.some((e) => /exit platform .* is not reachable/.test(e));
const player = (x: number, y: number, extra: Partial<PlayerState> = {}) =>
  ({ x, y, vx: 0, vy: 0, grounded: true, climbing: false, invincibleTimer: 0, ...extra }) as unknown as PlayerState;
const host = (st: Built, p: PlayerState, t = 0, extra: Partial<W4Host> = {}): W4Host => ({
  t, player: p, platforms: st.platforms, vines: st.vines, collectibles: st.collectibles, zones: st.zones ?? [], punch: null, hidden: false,
  hurt: () => {}, tip: () => {}, float: () => {}, screech: () => {}, sfx: () => {}, ...extra,
});

test('4-9 is hand-built', () => {
  assert.equal(HAND_STAGES['4-9'], '4-9');
});

test('4-9: every roll can be finished, has one exit and one golden seed, and runs its full five minutes', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'seed').length, 1, `seed ${s}: not one golden seed`);
    assert.ok(st.meta!.timing!.layoutSeconds >= stageSeconds('4-9'), `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups had to be moved`);
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Start', 'Learn', 'Develop', 'Twist', 'Twist', 'Finish']);
    assert.ok(st.platforms.every((p) => p.type !== 'fragile'), `seed ${s}: a crumbling platform`);
  }
});

test('4-9: a flag at least every 40 seconds, so a miss never costs more', () => {
  for (const s of SEEDS) {
    const fs = build(s).aerie49.flagSeconds;
    assert.ok(fs.length >= 12, `seed ${s}: ${fs.length - 2} flags`);
    for (let i = 1; i < fs.length; i++) assert.ok(fs[i] - fs[i - 1] <= 40, `seed ${s}: ${Math.round(fs[i] - fs[i - 1])} s between flags`);
  }
});

test('4-9: the goal is guards blown off their ledges, and more of them than it asks stand on the way to the shrine', () => {
  for (const s of SEEDS) {
    const st = build(s);
    assert.equal(st.config.targetCount, GUARD_GOAL_49);
    const guards = st.proto.w4!.monkeys!;
    assert.ok(guards.every((m) => m.job === 'guard' && m.blowOff === BLOW_OFF), `seed ${s}`);
    assert.ok(guards.length >= GUARD_GOAL_49 + 2, `seed ${s}: ${guards.length} guards`);
    assert.ok(guards.every((m) => m.x < st.exitTotemX - 300), `seed ${s}: a guard past the shrine`);
    assert.equal(st.aerie49.guards.length, guards.length);
  }
});

test('4-9: every idea is reminded where it first comes, the guard on the ledge taught in full', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const w4 = st.proto.w4!;
    const a = st.aerie49;
    const hints = st.proto.hints;
    const at = (re: RegExp) => hints.find((h) => re.test(h.text)) ?? { x: Infinity, text: '', pad: '', keys: '' };
    // the story: the aerie comes into view and her shadow passes, a feather drifts down, Dot at the gate
    assert.ok(at(/her aerie/).x < 400, `seed ${s}`);
    const omens = w4.omens!;
    assert.ok(omens[0].kind === 'shadow' && omens[0].x < 800, `seed ${s}: no shadow at the start`);
    assert.ok(omens.some((o) => o.kind === 'feather') && omens.filter((o) => o.kind === 'shadow').length >= 2, `seed ${s}`);
    assert.ok(at(/right above us/).x > st.exitTotemX - 2500, `seed ${s}: Dot says nothing at the gate`);
    // each idea, before its first one
    const first = {
      guard: Math.min(...a.guards.map((g) => w4.monkeys![g.monkey].x0!)),
      chime: Math.min(...w4.chimes!.map((c) => c.x)),
      rock: Math.min(...w4.rocks!.filter((r) => !r.air).map((r) => r.x)),
      grit: Math.min(...w4.rocks!.filter((r) => r.air).map((r) => r.x)),
      knot: Math.min(...w4.knots!.map((k) => k.x0)),
      fall: Math.min(...w4.falls!.map((f) => f.x)),
      glide: Math.min(...a.glides.map((g) => byId(st, g.from).x + byId(st, g.from).width)),
      draft: Math.min(...w4.updrafts!.map((u) => u.x0)),
      mist: Math.min(...w4.patience!.map((p) => p.x0)),
    };
    assert.ok(at(/chimes/).x < first.chime, `seed ${s}: the chimes`);
    assert.ok(at(/Rocks coming loose/).x < first.rock, `seed ${s}: the rocks`);
    assert.ok(at(/Grit trickling/).x < first.grit, `seed ${s}: the grit`);
    assert.ok(at(/Stand still under the knot/).x < first.knot, `seed ${s}: the knot`);
    const boulder = at(/boulder/);
    assert.ok(boulder.x < first.fall - 300 && /pad/.test(boulder.pad) && /right/.test(boulder.keys), `seed ${s}: the boulder`);
    const leaf = at(/open your leaf/);
    assert.ok(leaf.x < first.glide - 100 && /hold Jump/.test(leaf.pad) && /Space/.test(leaf.keys), `seed ${s}: the leaf`);
    assert.ok(at(/Warm air/).x < first.draft, `seed ${s}: the warm air`);
    assert.ok(at(/Mist again/).x < first.mist && at(/Wait for the chimes to stop/).x < first.mist, `seed ${s}: the mist`);
    // the new twist: taught in full before the first guard's ledge, and said again before the second
    assert.ok(at(/Get up close behind it/).x < first.guard - 400, `seed ${s}: the guard is not taught`);
    assert.ok(at(/Be right behind it/).x < w4.monkeys![a.guards[1].monkey].x0! - 400, `seed ${s}`);
    assert.ok(at(/Two guards/).x < Math.min(...a.guards.filter((g) => g.kind === 'pass').slice(3).map((g) => w4.monkeys![g.monkey].x0!)), `seed ${s}`);
    assert.ok(at(/guard on the edge/).x < w4.monkeys![a.guards.find((g) => g.kind === 'perch')!.monkey].x0!, `seed ${s}`);
  }
});

test('4-9: a guard\'s ledge is the only way on, and nothing near is high enough to jump or glide over the guard', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const w4 = st.proto.w4!;
    for (const g of st.aerie49.guards) {
      const m = w4.monkeys![g.monkey];
      const z = st.zones![g.lane];
      // the gust lane covers the guard's whole beat, its chimes before the guard
      assert.ok(z.kind === 'wind' && z.x0 <= m.x0! - 200 && z.x1 >= m.x1! && z.top < m.y && z.bottom > m.y, `seed ${s}: no lane over the guard`);
      assert.ok(w4.chimes!.some((c) => st.zones![c.zone] === z && c.x < m.x0! - 200 && c.x >= z.x0), `seed ${s}: no chimes before the guard`);
      // nothing a jump or a glide could set off from is higher than a jump over it (the guard leaps GUARD_LEAP up at him)
      for (const p of st.platforms) {
        if (p.x + p.width < m.x0! - 1100 || p.x > m.x0!) continue;
        assert.ok(p.y >= m.y - (GUARD_LEAP - maxRise()) - 150, `seed ${s}: platform ${p.id} stands ${m.y - p.y} px over the guard at ${m.x}`);
      }
      for (const v of st.vines) if (v.x > m.x0! - 1100 && v.x < m.x0!) assert.ok(v.topY >= m.y - 30, `seed ${s}: a vine over the guard`);
      if (g.kind === 'pass') {
        const ledge = byId(st, g.ledge);
        assert.ok(ledge.height < 50 && ledge.y === m.y && m.x0! >= ledge.x + 300 && m.x1! < ledge.x + ledge.width - 150, `seed ${s}: the guard is not out on its ledge`);
        // without the ledge there is no way on (no jump, no glide, no climb out of the drop under it)
        assert.ok(exitBlocked({ ...st, platforms: st.platforms.filter((p) => p !== ledge) }), `seed ${s}: the guard at ${m.x} can be got around`);
      } else {
        // the perch: the guard paces short of the edge, and past it only the leaf crosses the drop
        const perch = byId(st, g.ledge);
        assert.ok(perch.y === m.y && perch.x + perch.width - m.x1! >= 190, `seed ${s}: no room past the guard to set off`);
        assert.equal(z.dir, 1, `seed ${s}: the gust over the perch is not behind him`);
        assert.ok(perch.height < 50 && exitBlocked({ ...st, platforms: st.platforms.filter((p) => p !== perch) }), `seed ${s}: the perch's guard can be got around`);
      }
    }
  }
});

test('4-9: each puzzle is needed: take it away and the way is shut', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const w4 = st.proto.w4!;
    const a = st.aerie49;
    // Dot's knots: without the vine she unties, the cliff (or the perch) above it is out of reach
    assert.equal(a.knots.length, w4.knots!.length);
    for (const k of a.knots) {
      const v = st.vines.find((q) => q.id === k.vine)!;
      const knot = w4.knots![k.knot];
      assert.ok(v.rope && knot.releases.id === v.id && knot.x0 < v.x && knot.x1 > v.x && Math.abs(knot.y - v.topY) < 30, `seed ${s}: the knot is not at the vine's top`);
      assert.ok(Math.abs(knot.ground - v.bottomY) < 10, `seed ${s}: the knot's spot is not under its vine`);
      const without = { ...st, vines: st.vines.filter((q) => q !== v) };
      assert.ok(!reached(without).has(k.top), `seed ${s}: the top of the knotted vine at ${v.x} is reached without it`);
      if (!k.secret) assert.ok(exitBlocked(without), `seed ${s}: the shrine is reached without the knotted vine at ${v.x}`);
    }
    // the falls: the only way past is across the water from the shelf the boulder rolls along, and the water pours from higher than a
    // double jump off the boulder
    assert.ok(a.falls.length >= 2, `seed ${s}`);
    for (const f of a.falls) {
      const w = w4.falls!.find((q) => q.id === f.fall)!;
      const b = byId(st, f.boulder), shelf = byId(st, f.shelf), far = byId(st, f.far);
      assert.ok(b.push && b.push.max === shelf.x + shelf.width && b.push.max - b.width === w.plug!.atX && b.y + b.height === shelf.y, `seed ${s}: the boulder does not roll to the spout`);
      assert.ok(w.top < b.y - maxRise() - 20 && w.x < b.push.max && w.x >= w.plug!.atX && w.x + w.width === far.x, `seed ${s}: the water leaves a way past`);
      const without = { ...st, platforms: st.platforms.filter((p) => p !== shelf && p !== b) };
      assert.ok(!reached(without).has(far.id) && exitBlocked(without), `seed ${s}: the fall at ${w.x} is got around`);
    }
    // the glides: judged before the leaf can be counted on (4-6), the far side of every one is out of reach
    assert.ok(a.glides.length >= 4, `seed ${s}`);
    const noLeaf = reached({ ...st, config: { ...st.config, miniIndex: 6 } });
    const all = reached(st);
    for (const g of a.glides) assert.ok(all.has(g.to) && !noLeaf.has(g.to), `seed ${s}: a glide gap a jump crosses`);
    assert.ok(a.glides.some((g) => g.rock !== undefined) && a.glides.some((g) => g.draft !== undefined), `seed ${s}`);
    // the mist: the hidden ledges are the only way up the cliff, and the mist hides them (and the top), over that stretch only
    assert.ok(a.mists.length >= 1, `seed ${s}`);
    for (const m of a.mists) {
      const spot = w4.patience![m.spot];
      const foot = byId(st, m.foot);
      assert.ok(spot.kind === 'mist' && spot.y === foot.y && spot.x0 > foot.x && spot.x1 < foot.x + foot.width, `seed ${s}: the mist spot is not on the foot`);
      assert.deepEqual(spot.hides, [...m.ledges, m.top]);
      const without = { ...st, platforms: st.platforms.filter((p) => !m.ledges.includes(p.id)) };
      assert.ok(!reached(without).has(m.top) && exitBlocked(without), `seed ${s}: the mist's cliff is climbed without its ledges`);
      const area = spot.area!;
      assert.ok(area.x0 !== undefined && area.x1 !== undefined && area.bottom < foot.y && area.top < byId(st, m.top).y, `seed ${s}`);
      for (const p of st.platforms) {
        if ([...m.ledges, m.top, m.foot].includes(p.id) || p.x > area.x1 + 260 || p.x + p.width < area.x0 - 260) continue;
        assert.ok(p.y >= foot.y || p.y <= byId(st, m.top).y, `seed ${s}: the mist covers platform ${p.id} too`);
      }
      // the wind across the column stands clear of the foot, so waiting there is never pushed off the spot
      const z = st.zones![m.lane];
      assert.ok(z.bottom < foot.y - 20 && z.x0 < spot.x0 && z.x1 >= Math.max(...m.ledges.map((id) => byId(st, id).x + byId(st, id).width)), `seed ${s}`);
    }
    // the secret: the seed's ledge, behind leaves, is reached only by the knot's perch and the leaf
    const sec = a.secret!;
    const seed = st.collectibles.find((c) => c.type === 'seed')!;
    const sl = byId(st, sec.ledge);
    assert.ok(seed.x > sl.x && seed.x < sl.x + sl.width && st.proto.covers.some((cv) => seed.x > cv.x && seed.x < cv.x + cv.w && seed.y > cv.y), `seed ${s}: the seed is not hidden on its ledge`);
    assert.ok(all.has(sl.id) && !noLeaf.has(sl.id), `seed ${s}: the seed's ledge is reached without the leaf`);
    const knot = a.knots.find((k) => k.secret)!;
    assert.ok(!reached({ ...st, vines: st.vines.filter((v) => v.id !== knot.vine) }).has(sl.id), `seed ${s}: the seed is reached without Dot`);
  }
});

test('4-9 runtime: a gust knocks a guard clean off its ledge, it is back up BLOW_OFF later, and only then does it block him', () => {
  const st = structuredClone(build(SEEDS[0]));
  const g = st.aerie49.guards.find((q) => q.kind === 'pass')!;
  const m = st.proto.w4!.monkeys![g.monkey];
  const z = st.zones![g.lane];
  const chime = st.proto.w4!.chimes!.find((c) => st.zones![c.zone] === z)!;
  let defeats = 0;
  // he waits right behind the guard on its ledge
  const play = new W4Play({ monkeys: [m] }, st.platforms, []);
  const s0 = newCapuchin(m);
  const p = player(m.x0! - 40, m.y);
  let knockedAt = -1, backAt = -1;
  for (let t = 0; t < z.period * 2; t += 1 / 30) {
    play.step(1 / 30, host(st, p, t, { zones: [z], defeat: () => defeats++ }));
    const zs = zoneState(z, t);
    const wasDown = knockedAt >= 0 && backAt < 0;
    if (knockedAt < 0 && zs.phase === 'active' && zs.strength >= 0.6) knockedAt = t;
    if (wasDown && t - knockedAt >= BLOW_OFF + 0.05) backAt = t;
  }
  assert.ok(knockedAt >= 0, 'the gust never came');
  assert.equal(defeats, 1, 'a guard blown off near him counts once');
  // the same, step by step, on the pure rules: blown off by the gust, tumbling its way, back up after BLOW_OFF, blocking again
  let knocked = 0;
  for (let t = 0; t < z.period * 2; t += 1 / 30) {
    const zs = zoneState(z, t);
    const was = s0.mode;
    if (stepGuard(m, s0, zs.phase === 'active' ? z.dir * zs.strength : 0, 1 / 30).knocked) {
      knocked++;
      assert.equal(s0.fell, z.dir, 'it tumbles the way the wind blows');
      assert.ok(!capBlocks(m, s0, s0.x), 'blown off, it does not block the ledge');
    }
    if (was === 'blown' && s0.mode === 'pace') {
      assert.ok(Math.abs(s0.t) < 1e-9 && s0.x === m.x && s0.y === m.y, 'it climbs back to its post');
      assert.ok(capBlocks(m, s0, m.x), 'back on its feet, it blocks again');
    }
  }
  assert.ok(knocked >= 2, `knocked off ${knocked} times in two gusts`);
  // timing: from right behind it he is past the far end of its beat long before it is back; from the chimes, running only once the
  // gust hits, he is not (he has to set off as the chimes ring, or be close)
  const speed = PHYS.maxRun + (z.dir > 0 ? z.force / 2 : -z.force / 2);
  assert.ok((m.x1! + 30 - (m.x0! - 40)) / speed < BLOW_OFF - 0.8, 'from behind it there is no time to spare');
  assert.ok((m.x1! + 30 - chime.x) / speed > BLOW_OFF - 0.15, 'from the chimes the gap is easy');
  // far from him, a guard blown off does not count
  let far = 0;
  const away = new W4Play({ monkeys: [m] }, st.platforms, []);
  const q = player(m.x - BLOWN_NEAR - 150, m.y);
  for (let t = 0; t < z.period * 2; t += 1 / 30) away.step(1 / 30, host(st, q, t, { zones: [z], defeat: () => far++ }));
  assert.equal(far, 0);
});

test('4-9 runtime: on its feet the guard will not let him walk by, nor jump over it', () => {
  const st = build(SEEDS[3]);
  for (const m of st.proto.w4!.monkeys!) {
    for (const dy of [0, 150, GUARD_LEAP - 20]) {
      const play = new W4Play({ monkeys: [m] }, [], []);
      const p = player(m.x - 20, m.y - dy, { grounded: dy === 0 });
      play.step(1 / 30, { ...host(st, p), zones: [] });
      assert.ok(p.x <= m.x - 25, `pushed to ${p.x - m.x} at ${dy} px up`);
    }
  }
  assert.ok(maxRise() < GUARD_LEAP - 20, 'a double jump clears the guard');
  assert.ok(AERIE.deep >= 4 * AERIE.step);
});
