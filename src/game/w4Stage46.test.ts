import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, HAND_STAGES } from './protoStage.ts';
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

test('4-6 is hand-built, and is judged without the leaf (4-7 is the first stage that needs it)', () => {
  assert.equal(HAND_STAGES['4-6'], '4-6');
  assert.equal(skillGuaranteedAt('glide', 36), false);
});

test('4-6: every roll can be finished, has one exit, and takes a quick climber two minutes', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    // (timed like the other climbs, 1-4, 3-4 and 4-1)
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 20, `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups had to be moved`);
  }
});

test('4-6: each mist spot has a ledge to stand still on and hides only real ledges, all inside its band of mist', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const spots = st.proto.w4?.patience ?? [];
    assert.equal(spots.length, 3, `seed ${s}`);
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
      const steps = m.hides!.map((id) => st.platforms.find((p) => p.id === id)!).filter((p) => p.width < foot.width);
      let below = foot.y;
      for (const p of steps.sort((a, b) => b.y - a.y)) {
        // a plain hop up from the last (never a double jump), and caught by the wide ledge at the column's foot
        assert.ok(below - p.y <= SAFE.rise1, `seed ${s}: a hidden ledge ${below - p.y} px up`);
        assert.ok(p.x >= foot.x + 20 && p.x + p.width <= foot.x + foot.width - 20, `seed ${s}: a hidden ledge that hangs past the ledge that catches a miss`);
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
