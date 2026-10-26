import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, HAND_STAGES, stageSeconds } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { skillGuaranteedAt } from './skills.ts';
import { reachJump, SAFE } from './physics.ts';
import { PATIENCE } from './patience.ts';
import { NEST, nearNest, nestAt, nestFair, type Nest } from './eaglet.ts';
import { W4Play, type W4Host } from './w4Play.ts';
import type { LevelConfig, Platform, PlayerState as Player } from './types.ts';

const cfg = (): LevelConfig =>
  ({
    worldIndex: 4, miniIndex: 6, id: '4-6', name: '4-6', objectiveType: 'ascent', targetCount: 1, timeLimit: 0, levelWidth: 9000,
    levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const build = (s: number) => buildProtoStage(cfg(), s, '4-6');
const RUN = 285;
/** a wide ledge, the kind at the foot of a column of the mist (protoStage.ts MIST_FOOT) */
const MIST_WIDE = 500;

test('4-6 is hand-built, and is judged without the leaf (4-7 is the first stage that needs it)', () => {
  assert.equal(HAND_STAGES['4-6'], '4-6');
  assert.equal(skillGuaranteedAt('glide', 36), false);
});

test('4-6: every roll can be finished, has one exit, and takes a quick climber its four minutes', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    // (timed like the other climbs, 1-4, 3-4 and 4-1: a climb counts 20 s short)
    assert.ok(st.meta!.timing!.layoutSeconds >= stageSeconds('4-6') - 20, `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups had to be moved`);
  }
});

test('4-6: each mist spot has a ledge to stand still on and hides only real ledges, all inside its band of mist', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const spots = st.proto.w4?.patience ?? [];
    // the three columns that teach it, the two by the nests, and two tall ones with a ledge halfway (two spots each)
    assert.equal(spots.length, 9, `seed ${s}`);
    for (const m of spots) {
      assert.equal(m.kind, 'mist');
      assert.ok(m.area && m.area.top < m.area.bottom, `seed ${s}: a spot without its band`);
      // a place to stand still: one ledge under the whole spot, at its height
      const foot = st.platforms.find((p) => p.y === m.y && p.x <= m.x0 && p.x + p.width >= m.x1);
      assert.ok(foot, `seed ${s}: nowhere to stand on the spot`);
      assert.ok(m.fill + PATIENCE.settle <= 4, `seed ${s}: the mist takes too long to settle`);
      assert.ok(m.hides && m.hides.length >= 2, `seed ${s}`);
      for (const id of m.hides) {
        const p = st.platforms.find((q) => q.id === id);
        assert.ok(p && !p.broken && p.type === 'solid', `seed ${s}: the mist hides a ledge that is not there (${id})`);
        assert.ok(p.y >= m.area.top && p.y <= m.area.bottom, `seed ${s}: a hidden ledge outside its mist`);
        assert.ok(p.y < m.y, `seed ${s}: a hidden ledge below its spot`);
      }
    }
  }
});

test('4-6: the mist starts small and grows, the hidden ledges are the way up, and every miss lands on the wide ledge below', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const spots = st.proto.w4!.patience!;
    const counts = spots.map((m) => m.hides!.length);
    // taught plainly first: two little ledges just above (and the next wide ledge), then longer columns to remember
    assert.ok(counts[0] <= 3 && counts[1] > counts[0] && counts[2] >= counts[1], `seed ${s}: ${counts}`);
    for (const m of spots) {
      const foot = st.platforms.find((p) => p.y === m.y && p.x <= m.x0 && p.x + p.width >= m.x1)!;
      // the small ledges of the column: the hidden ones, and a plain first step under the mist (by the nests)
      const mx = (m.x0 + m.x1) / 2;
      const plain = st.platforms.filter((p) => p.width < 200 && p.y < m.y && p.y > m.area!.bottom && Math.abs(p.x + p.width / 2 - mx) <= 220 && !m.hides!.includes(p.id));
      const steps = [...plain, ...m.hides!.map((id) => st.platforms.find((p) => p.id === id)!).filter((p) => p.width < MIST_WIDE)];
      let below = foot.y;
      for (const p of steps.sort((a, b) => b.y - a.y)) {
        // a plain hop up from the last (never a double jump), and caught by a wide ledge under the column (at its foot)
        assert.ok(below - p.y <= SAFE.rise1, `seed ${s}: a hidden ledge ${below - p.y} px up`);
        const catches = st.platforms.some((q) => q.width >= MIST_WIDE && q.y >= m.y && q.y - p.y <= 800 && p.x >= q.x + 20 && p.x + p.width <= q.x + q.width - 20);
        assert.ok(catches, `seed ${s}: a hidden ledge that hangs past the ledge that catches a miss`);
        below = p.y;
      }
      // the whole column fits on a phone's screen in landscape (the view drifts to the middle of it while he stands still)
      const top = Math.min(...m.hides!.map((id) => st.platforms.find((p) => p.id === id)!.y), m.area!.bottom);
      assert.ok(m.y - top <= 460 && m.view && Math.abs(m.view.y - (m.y + top) / 2) <= 60, `seed ${s}: a column ${m.y - top} px tall`);
    }
    // without the hidden ledges there is no way to the shrine
    const hidden = new Set(spots.flatMap((m) => m.hides!));
    const without = validateStage({ ...st, platforms: st.platforms.filter((p) => !hidden.has(p.id)) });
    assert.equal(without.ok, false, `seed ${s}: the shrine is reachable without the hidden ledges`);
    // nothing to pick up out in the mist (pickups are drawn over it and would give the ledges away)
    for (const c of st.collectibles) {
      if (c.type === 'heart' || c.type === 'exit_totem') continue;
      for (const m of spots) assert.ok(c.y < m.area!.top - 40 || c.y > m.area!.bottom + 40, `seed ${s}: a ${c.type} in the mist at ${c.x},${c.y}`);
    }
    assert.ok(st.proto.hints.some((h) => /Thick mist! Stand still/.test(h.text) && h.aboveY !== undefined && Math.abs(h.aboveY - spots[0].y) <= 20), `seed ${s}: the mist is not taught at the first spot`);
  }
});

test('4-6: the nests are fair: taught alone first, time to cross while they sleep, room to be blown back, clear of the trunks', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const nests = st.proto.w4?.nests ?? [];
    assert.ok(nests.length >= 2, `seed ${s}`);
    const ledgeOf = (n: Nest) => st.platforms.find((p) => p.y === n.y && p.x <= n.x0 && p.x + p.width >= n.x1);
    const first = nests[0];
    // the first is alone on its ledge, with the hint where he arrives
    assert.equal(nests.filter((n) => n.y === first.y).length, 1, `seed ${s}`);
    assert.ok(st.proto.hints.some((h) => /Sleeping eaglets/.test(h.text) && h.aboveY !== undefined && Math.abs(h.aboveY - first.y) <= 20), `seed ${s}`);
    const push = (NEST.push * NEST.blow) / 2 + 10;
    for (const n of nests) {
      assert.ok(nestFair(n, RUN), `seed ${s}: no time to cross the nest at ${n.x}`);
      const l = ledgeOf(n);
      assert.ok(l, `seed ${s}: a nest off its ledge`);
      assert.ok(n.x0 - push >= l.x && n.x1 + push <= l.x + l.width, `seed ${s}: blown back off the ledge`);
      // the trunks up to and away from the ledge stand outside the nest's sight (he is never climbing when they look)
      for (const v of st.vines) if (v.topY <= n.y + 10 && v.bottomY >= n.y - 10) assert.ok(v.x < n.x0 - 40 || v.x > n.x1 + 40, `seed ${s}: a trunk in the nest's sight`);
    }
  }
});

// ---- the mist and the nests in play (w4Play.ts)

const dt = 1 / 30;
function host(platforms: Platform[]) {
  const player = { x: 0, y: 700, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 } as unknown as Player;
  const tips: string[] = [];
  const h: W4Host = {
    t: 0, player, platforms, vines: [], collectibles: [], zones: [], punch: null, hidden: false,
    hurt: () => {}, tip: (k) => tips.push(k), float: () => {}, screech: () => {}, sfx: () => {},
  };
  return { h, player, tips };
}
function run(w: W4Play, h: W4Host, seconds: number, each?: () => void) {
  for (let i = 0; i < Math.round(seconds * 30); i++) {
    each?.();
    w.step(dt, h);
    h.t += dt;
  }
}

test('the mist: thick until he stands still on the spot, clear once it settles, and back again a couple of seconds after he moves', () => {
  for (const s of SEEDS.slice(0, 4)) {
    const st = build(s);
    const m = st.proto.w4!.patience![0];
    const plats = st.platforms.map((p) => ({ ...p }));
    const w = new W4Play(st.proto.w4!, plats, st.vines);
    const { h, player, tips } = host(plats);
    const step = plats.find((p) => p.id === m.hides![0])!;
    player.x = (m.x0 + m.x1) / 2;
    player.y = m.y;
    assert.ok(w.mistAt(step.y) > 0.9, `seed ${s}: the mist is thin before he waits`);
    assert.equal(w.look(player.x, player.y), null);
    run(w, h, m.fill + PATIENCE.settle + 0.2);
    assert.ok(w.mistAt(step.y) < 0.05, `seed ${s}: the mist did not settle`);
    // the view drifts up over the column while he stands there
    const look = w.look(player.x, player.y);
    assert.ok(look && look.u === 1 && look.y < m.y, `seed ${s}`);
    // moving, it rises again slowly: still clear-ish for a moment, gone in about two seconds
    player.vx = 200;
    run(w, h, 0.5);
    assert.ok(w.mistAt(step.y) < 0.5, `seed ${s}: the mist came back at once`);
    run(w, h, 2);
    assert.ok(w.mistAt(step.y) > 0.9, `seed ${s}: the mist never came back`);
    assert.ok(tips.includes('w4:mist'), `seed ${s}: Dot does not say to remember the way`);
    // the hidden ledges stay solid the whole time (the engine never takes them away)
    for (const id of m.hides!) assert.ok(!plats.find((p) => p.id === id)!.broken);
  }
});

test('the nests: moving while they look blows him back a few steps; standing still while they look, nothing happens', () => {
  const nest: Nest = { x: 1000, y: 700, x0: 800, x1: 1200, every: 6, offset: 0 };
  const lookAt = 6 - NEST.look + 0.05; // a moment into the first look
  assert.equal(nestAt(nest, lookAt).phase, 'look');
  assert.equal(nestAt(nest, 6 - NEST.look - NEST.stir / 2).phase, 'stir');
  assert.equal(nestAt(nest, 1).phase, 'sleep');
  assert.ok(nearNest(nest, 900, 700) && !nearNest(nest, 700, 700) && !nearNest(nest, 900, 900));
  const flurry = (NEST.push * NEST.blow) / 2;
  // walking in from the left while they look: blown back to the left, and held back while he keeps pushing on in their sight
  {
    const { h, player, tips } = host([]);
    const w = new W4Play({ nests: [nest] }, [], []);
    h.t = lookAt;
    player.x = 900;
    player.vx = 250;
    let slowed = false;
    for (let i = 0; i < 6; i++) {
      player.vx = 250;
      slowed ||= w.step(dt, h).speed < 0.5;
      h.t += dt;
    }
    assert.ok(slowed, 'a flurry does not hold him back');
    run(w, h, 0.6, () => { player.vx = 250; });
    assert.ok(player.x < 900 - 60, `not blown back (x ${Math.round(player.x)})`);
    assert.ok(tips.includes('w4:nestBlow'));
    // keep walking (in the test nothing moves him on, so only the flurries move him): out of their sight, and never far past it
    run(w, h, NEST.look, () => { player.vx = 250; });
    assert.ok(player.x < nest.x0, `still in their sight (x ${Math.round(player.x)})`);
    assert.ok(player.x > nest.x0 - flurry - 1, `blown too far (x ${Math.round(player.x)})`);
  }
  // standing still through the whole look: not moved
  {
    const { h, player } = host([]);
    const w = new W4Play({ nests: [nest] }, [], []);
    h.t = lookAt - NEST.stir;
    player.x = 950;
    run(w, h, NEST.stir + NEST.look);
    assert.equal(player.x, 950);
  }
  // moving while they sleep: not moved
  {
    const { h, player } = host([]);
    const w = new W4Play({ nests: [nest] }, [], []);
    h.t = 0.5;
    player.x = 950;
    player.vx = 250;
    run(w, h, 1.5, () => { player.vx = 250; });
    assert.equal(player.x, 950);
  }
});

test('4-6: no hop in the mist needs more than a plain jump across', () => {
  for (const s of SEEDS) {
    const st = build(s);
    for (const m of st.proto.w4!.patience!) {
      const steps = m.hides!.map((id) => st.platforms.find((p) => p.id === id)!).sort((a, b) => b.y - a.y);
      for (let i = 1; i < steps.length; i++) {
        const a = steps[i - 1], b = steps[i];
        const gap = Math.max(0, b.x - (a.x + a.width), a.x - (b.x + b.width));
        assert.ok(gap <= reachJump(a.y - b.y, false) * 0.6, `seed ${s}: a ${gap} px gap in the mist`);
      }
    }
  }
});

// ---- the longer climb (Matt, 2026-10-25: stages vary, 4-6 is a four-minute one): the nests and the mist together, across the tree,
// and the high mist with a ledge halfway

/** the mist spots whose standing ledge has eaglets watching the spot */
const nestSpots = (st: ReturnType<typeof build>) =>
  st.proto.w4!.patience!.filter((m) => (st.proto.w4!.nests ?? []).some((n) => n.y === m.y && nearNest(n, (m.x0 + m.x1) / 2, m.y)));

test('4-6: the nests and the mist together: the eaglets watch the spot and the first step, stand clear of the mist, and the climb leaves their sight', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const spots = nestSpots(st);
    const nests = st.proto.w4!.nests!;
    // one nest by the first, then one either side of a longer column
    assert.equal(spots.length, 2, `seed ${s}`);
    assert.deepEqual(spots.map((m) => nests.filter((n) => n.y === m.y).length), [1, 2], `seed ${s}`);
    assert.ok(st.proto.hints.some((h) => /Eaglets by the mist/.test(h.text) && h.aboveY !== undefined && Math.abs(h.aboveY - spots[0].y) <= 20), `seed ${s}: not taught`);
    for (const m of spots) {
      const mx = (m.x0 + m.x1) / 2;
      const watching = nests.filter((n) => n.y === m.y);
      // the whole spot is in their sight (standing still there is what keeps him safe, and what settles the mist)
      for (const n of watching) assert.ok(nearNest(n, m.x0, m.y) && nearNest(n, m.x1, m.y), `seed ${s}: the spot is half out of their sight`);
      // the nests (heads up, and the z over them) stand clear of the mist
      assert.ok(m.area!.bottom <= m.y - 140, `seed ${s}: the nests are in the mist`);
      // the first step: plain to see (not hidden), a plain hop up, and in their sight
      const step = st.platforms.find((p) => p.width < 200 && p.y < m.y && p.y > m.area!.bottom && Math.abs(p.x + p.width / 2 - mx) <= 220);
      assert.ok(step && !m.hides!.includes(step.id) && m.y - step.y <= SAFE.rise1, `seed ${s}: no first step`);
      assert.ok(watching.every((n) => nearNest(n, step.x + step.width / 2, step.y)), `seed ${s}: the first step is out of their sight`);
      // two hops into the mist and he is out of their sight
      const hidden = m.hides!.map((id) => st.platforms.find((p) => p.id === id)!).sort((a, b) => b.y - a.y);
      assert.ok(watching.every((n) => !nearNest(n, hidden[1].x + hidden[1].width / 2, hidden[1].y)), `seed ${s}: still in their sight high in the mist`);
    }
    // two nests on one spot: on the same rhythm, one waking a little after the other, so both sleep long enough to climb out of sight
    const pair = nests.filter((n) => n.y === spots[1].y);
    assert.equal(pair[0].every, pair[1].every, `seed ${s}`);
    let both = 0, best = 0;
    for (let t = 0; t < pair[0].every * 2; t += 0.05) {
      both = pair.every((n) => nestAt(n, t).phase === 'sleep') ? both + 0.05 : 0;
      best = Math.max(best, both);
    }
    assert.ok(best >= 1.9, `seed ${s}: both sleep at once for only ${best.toFixed(2)} s`);
  }
});

test('4-6: across the tree: ropes between nest ledges, each rope landing and leaving out of the eaglets\' sight', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const nests = st.proto.w4!.nests!;
    assert.ok(st.proto.hints.some((h) => /All the way across the tree/.test(h.text)), `seed ${s}: not explained`);
    const on = (p: Platform) => nests.filter((n) => n.y === p.y && n.x > p.x && n.x < p.x + p.width);
    // the ledges with nests that a rope reaches
    const roped = st.platforms.filter((p) => on(p).length && (st.ropes ?? []).some((r) => r.g0 === p.y || r.g1 === p.y));
    assert.ok(roped.length >= 3, `seed ${s}: ${roped.length} nest ledges across the tree`);
    assert.ok(roped.some((p) => on(p).length === 2), `seed ${s}: no ledge with two nests`);
    for (const p of roped) {
      for (const r of (st.ropes ?? []).filter((q) => q.g0 === p.y)) {
        // the rope's ends over this ledge: he lets go or jumps up there, never where they can see him
        for (const rx of [r.x0, r.x1].filter((x) => x >= p.x && x <= p.x + p.width)) {
          for (const n of on(p)) assert.ok(rx < n.x0 - 60 || rx > n.x1 + 60, `seed ${s}: a rope ends in the eaglets' sight at ${rx}`);
        }
      }
    }
  }
});

test('4-6: the high mist: two tall columns, each with a ledge halfway that the lower mist shows and that settles the upper mist', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const spots = st.proto.w4!.patience!;
    const standOn = (m: (typeof spots)[number]) => st.platforms.find((p) => p.y === m.y && p.x <= m.x0 && p.x + p.width >= m.x1)!;
    const halfway = spots.filter((m) => standOn(m).width < MIST_WIDE);
    assert.equal(halfway.length, 2, `seed ${s}`);
    for (const m of halfway) {
      const mid = standOn(m);
      // the spot below shows the ledge halfway, and only up to it
      const below = spots.find((q) => q.hides!.includes(mid.id));
      assert.ok(below && below.y > m.y, `seed ${s}: nothing shows the ledge halfway`);
      assert.ok(below.area!.top >= mid.y - 40, `seed ${s}: the lower mist shows the upper half too`);
      // the upper mist reaches down over the ledge halfway, and its steps are above it
      assert.ok(m.area!.bottom >= mid.y, `seed ${s}`);
      for (const id of m.hides!) assert.ok(st.platforms.find((p) => p.id === id)!.y < mid.y, `seed ${s}`);
    }
    assert.ok(st.proto.hints.some((h) => /halfway up/.test(h.text) && h.aboveY !== undefined && Math.abs(h.aboveY - halfway[0].y) <= 20), `seed ${s}: the ledge halfway is not explained`);
    // and the shrine is above it all
    const exit = st.collectibles.find((c) => c.type === 'exit_totem')!;
    for (const m of spots) assert.ok(exit.y < m.area!.top - 200, `seed ${s}: the shrine is in the mist`);
  }
});

test('the high mist in play: standing at the foot shows the ledge halfway but not above it; standing on that ledge shows the rest', () => {
  for (const s of SEEDS.slice(0, 4)) {
    const st = build(s);
    const spots = st.proto.w4!.patience!;
    const plats = st.platforms.map((p) => ({ ...p }));
    const standOn = (m: (typeof spots)[number]) => plats.find((p) => p.y === m.y && p.x <= m.x0 && p.x + p.width >= m.x1)!;
    const upper = spots.find((m) => standOn(m).width < MIST_WIDE)!;
    const mid = standOn(upper);
    const lower = spots.find((q) => q.hides!.includes(mid.id))!;
    const up1 = plats.find((p) => p.id === upper.hides![0])!;
    {
      const w = new W4Play(st.proto.w4!, plats, st.vines);
      const { h, player } = host(plats);
      player.x = (lower.x0 + lower.x1) / 2;
      player.y = lower.y;
      run(w, h, lower.fill + PATIENCE.settle + 0.2);
      assert.ok(w.mistAt(mid.y) < 0.05, `seed ${s}: the ledge halfway is still in the mist`);
      assert.ok(w.mistAt(up1.y) > 0.9, `seed ${s}: the upper half shows from the foot`);
    }
    {
      const w = new W4Play(st.proto.w4!, plats, st.vines);
      const { h, player } = host(plats);
      player.x = (upper.x0 + upper.x1) / 2;
      player.y = upper.y;
      run(w, h, upper.fill + PATIENCE.settle + 0.2);
      assert.ok(w.mistAt(up1.y) < 0.05 && w.mistAt(mid.y) < 0.05, `seed ${s}: the upper mist did not settle`);
      const look = w.look(player.x, player.y);
      assert.ok(look && look.y < upper.y, `seed ${s}: the view does not look up the upper half`);
    }
  }
});

test('4-6: no high branch ends in a long fall: each end over a drop of more than a few hops has a knot of wood (a little wall) at it', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const lips = st.platforms.filter((p) => p.lip);
    assert.ok(lips.length >= 10, `seed ${s}: only ${lips.length} lips`);
    for (const l of lips) {
      // a wall (the engine's solid blocks: 50 px tall or more), low enough to hop over, standing on the end of its branch
      assert.ok(l.height >= 50 && l.height < 100 && l.type === 'solid', `seed ${s}`);
      assert.ok(st.platforms.some((p) => p.height === 24 && Math.abs(p.y - (l.y + l.height)) < 1 && (Math.abs(p.x - l.x) < 1 || Math.abs(p.x + p.width - (l.x + l.width)) < 1)), `seed ${s}: a lip on no branch end`);
    }
    // a knot at each ledge end where a rope's post stands: walking up to the post he stops there, not 44 px on, off the end
    for (const r of st.ropes ?? []) {
      for (const [end, y] of [[r.x0 + 44, r.g0], [r.x1 - 44, r.g1]]) {
        assert.ok(lips.some((l) => Math.abs(l.y + l.height - y) < 1 && (Math.abs(l.x - end) < 1 || Math.abs(l.x + l.width - end) < 1)), `seed ${s}: rope ${r.id}'s end at ${end} has no knot`);
      }
    }
    // the branches across the tree, by the nests (where play-testers walked off into a ten-second fall): every end is caught or walled
    const beat = st.proto.beats.find((b) => b[2] === 'Test: across the tree')!;
    const across = st.platforms.filter((p) => p.height === 24 && p.width >= 150 && p.y <= beat[0] + 1 && p.y >= beat[1] - 1);
    assert.ok(across.length >= 3, `seed ${s}`);
    for (const p of across) {
      for (const side of [-1, 1]) {
        const end = side < 0 ? p.x : p.x + p.width;
        const walled = lips.some((l) => Math.abs(l.y + l.height - p.y) < 1 && Math.abs((side < 0 ? l.x : l.x + l.width) - end) < 1);
        const x = end + side * 60;
        const under = st.platforms.filter((q) => q !== p && q.y > p.y && q.x <= x + 19 && q.x + q.width >= x - 19);
        const drop = under.length ? Math.min(...under.map((q) => q.y)) - p.y : Infinity;
        assert.ok(walled || drop < 600, `seed ${s}: branch ${p.id}'s ${side < 0 ? 'left' : 'right'} end drops ${drop} px`);
      }
    }
  }
});

test('4-6: back on the forest floor, a trail of petals leads to the one trunk up from it, and Dot points the way', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const floor = st.platforms[0];
    const help = st.proto.w4!.floor!;
    assert.equal(help.y, floor.y);
    assert.ok(st.vines.some((v) => v.x === help.trunkX && Math.abs(v.bottomY + 6 - floor.y) < 1), `seed ${s}: no trunk up from the floor at ${help.trunkX}`);
    const trail = st.collectibles.filter((c) => c.type === 'flower' && Math.abs(c.y - (floor.y - 34)) < 1 && c.x > help.trunkX);
    assert.ok(trail.length >= 6, `seed ${s}: only ${trail.length} petals on the floor`);
  }
  // in play: once he has been up the tree, landing on the floor far from the trunk gets Dot's line, and which way to go
  const st = build(1);
  const help = st.proto.w4!.floor!;
  const player = { x: help.trunkX + 1200, y: help.y - 2000, vx: 0, vy: 0, grounded: false, invincibleTimer: 0 } as unknown as Player;
  const tips: string[] = [];
  const h = { t: 0, player, platforms: st.platforms, vines: st.vines, collectibles: st.collectibles, zones: [], punch: null, hidden: false, hurt: () => {}, tip: (_k: string, text: string) => tips.push(text), float: () => {}, screech: () => {}, sfx: () => {} } as W4Host;
  const w = new W4Play(st.proto.w4!, st.platforms, st.vines);
  w.step(1 / 30, h);
  player.y = help.y;
  player.grounded = true;
  w.step(1 / 30, h);
  assert.ok(tips.some((t) => /Back on the ground/.test(t) && /left/.test(t)), `no line on the floor (${tips.join(' / ')})`);
});

test('4-6: the ledge halfway up the high mist settles the mist from anywhere on it', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const spots = st.proto.w4!.patience!.filter((m) => m.kind === 'mist');
    // the two ledges halfway (the 7th and 9th spots): the spot is the whole ledge, less a little at each end
    for (const m of [spots[6], spots[8]]) {
      const ledge = st.platforms.find((p) => p.height === 24 && p.y === m.y && p.x <= m.x0 && p.x + p.width >= m.x1)!;
      assert.ok(ledge, `seed ${s}`);
      assert.ok(m.x0 - ledge.x <= 15 && ledge.x + ledge.width - m.x1 <= 15, `seed ${s}: only ${m.x1 - m.x0} px of a ${ledge.width} px ledge settles the mist`);
    }
  }
});
