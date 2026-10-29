import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, HAND_STAGES } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { CAP } from './capuchin.ts';
import { inFall } from './waterfalls.ts';
import { hidden } from './watcher.ts';
import { W4Play, type W4Host } from './w4Play.ts';
import type { LevelConfig, PlayerState } from './types.ts';

const cfg = {
  worldIndex: 4, miniIndex: 5, id: '4-5', name: "The Sovereign's Dive", objectiveType: 'stealth', targetCount: 1, timeLimit: 0, levelWidth: 9000,
  levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const build = (s: number) => buildProtoStage(cfg, s, '4-5');
/** where he can hide along the ground: bush middles and curtain middles */
const spots = (st: ReturnType<typeof build>) => [
  ...(st.proto.bushes ?? []).filter((b) => !b.secret).map((b) => b.x + b.w / 2),
  ...(st.proto.w4?.falls ?? []).filter((w) => w.veil).map((w) => w.x + w.width / 2),
].sort((a, b) => a - b);

test('4-5 is hand-built', () => {
  assert.equal(HAND_STAGES['4-5'], '4-5');
});

test('4-5: every roll can be finished, has one exit, and takes a quick player two minutes', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS, `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups had to be moved`);
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Start', 'Learn', 'Develop', 'Twist', 'Finish']);
    // no crumbling platforms anywhere (none needed, none at all)
    assert.ok(st.platforms.every((p) => p.type !== 'fragile'), `seed ${s}`);
    // the secret: a golden seed up behind one of the curtains
    assert.ok(st.collectibles.some((c) => c.type === 'seed'), `seed ${s}: no golden seed`);
  }
});

test('4-5: every watched stretch has places to hide (a bush or a curtain of water) no farther apart than a run in one calm', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const zones = st.proto.watch ?? [];
    assert.ok(zones.length >= 6, `seed ${s}: ${zones.length} watched stretches`);
    const all = spots(st);
    for (const z of zones) {
      const inside = all.filter((x) => x >= z.x0 && x <= z.x1);
      assert.ok(inside.length >= 1, `seed ${s}: a watched stretch at ${z.x0} with nowhere to hide`);
      let at = z.x0;
      for (const sx of inside) {
        assert.ok(sx - at < 285 * (z.calm[0] + 1.4), `seed ${s}: ${Math.round(sx - at)} px to the next place to hide`);
        at = sx;
      }
    }
    // the curtains reach the path and hide him standing there; the bushes stand on the path
    for (const w of st.proto.w4!.falls!) {
      assert.equal(w.veil, true);
      assert.equal(w.bottom, G);
      assert.ok(w.width >= 120 && inFall(w, w.x + w.width / 2, G, 64), `seed ${s}`);
      assert.ok(zones.some((z) => w.x >= z.x0 && w.x + w.width <= z.x1), `seed ${s}: a curtain outside her watch`);
    }
    assert.ok((st.proto.bushes ?? []).every((b) => b.y === G && !b.hanging));
    // the first stretch is the gentle one
    assert.ok(zones[0].calm[0] >= 7);
  }
});

test('4-5: every lookout watches a stretch under her watch and has its own fruit tree in reach, low enough to punch', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const monkeys = st.proto.w4!.monkeys!;
    const fruit = st.proto.w4!.fruit!;
    assert.ok(monkeys.length >= 3, `seed ${s}: ${monkeys.length} lookouts`);
    assert.equal(fruit.length, monkeys.length, `seed ${s}`);
    const zones = st.proto.watch!;
    monkeys.forEach((m, i) => {
      assert.equal(m.job, 'lookout');
      assert.equal(m.y, G);
      const f = fruit[i];
      assert.ok(Math.abs(f.x - m.x) < CAP.lure - 20, `seed ${s}: lookout ${i}'s fruit is ${Math.round(Math.abs(f.x - m.x))} px away`);
      // no other lookout is drawn off by this one's fruit
      monkeys.forEach((o, j) => j !== i && assert.ok(Math.abs(f.x - o.x) > CAP.lure + 100, `seed ${s}: fruit ${i} lures lookout ${j}`));
      // he punches it (facing it, his fist 40 px ahead) from outside the lookout's stretch, or from behind a curtain
      const standX = f.x - 40;
      const veiled = st.proto.w4!.falls!.some((w) => inFall(w, f.x - 30, G, 64));
      assert.ok(standX < m.x0! || veiled, `seed ${s}: the fruit can only be punched in the open, in the lookout's sight`);
      assert.ok(f.y - (G - 40) < 70 && G - 40 - f.y < 70 && f.y < G - 50, `seed ${s}: fruit at ${f.y}`);
      assert.equal(f.ground, G);
      // its stretch, inside her watch, near enough to be stepped (w4Play steps monkeys within 1200 px), with somewhere to hide in it
      assert.ok(m.x0! <= m.x && m.x1! > m.x && m.x1! - m.x <= 1150, `seed ${s}`);
      assert.ok(zones.some((z) => z.x0 <= m.x0! && z.x1 >= m.x1!), `seed ${s}: a lookout outside her watch`);
      assert.ok(spots(st).some((x) => x > m.x0! && x <= m.x1!), `seed ${s}: a lookout's stretch with nowhere to hide`);
    });
  }
});

test('4-5: each idea is taught where it first appears', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const hints = st.proto.hints;
    const at = (re: RegExp) => hints.find((h) => re.test(h.text))?.x ?? Infinity;
    const bushes = st.proto.bushes!.map((b) => b.x);
    const falls = st.proto.w4!.falls!.map((w) => w.x);
    const monkeys = st.proto.w4!.monkeys!.map((m) => m.x);
    assert.ok(at(/Sovereign/) < st.proto.watch![0].x0, `seed ${s}`);
    assert.ok(at(/bush/) <= Math.min(...bushes), `seed ${s}: the bushes are not taught first`);
    assert.ok(at(/waterfall/) <= Math.min(...falls), `seed ${s}: the curtains are not taught first`);
    assert.ok(at(/fruit/) <= Math.min(...st.proto.w4!.fruit!.map((f) => f.x)) && at(/lookout/) < Math.min(...monkeys), `seed ${s}: the lookouts are not taught first`);
    assert.ok(hints.some((h) => /Punch/.test(h.pad) && /J/.test(h.keys) && /punch/i.test(h.text)), `seed ${s}: punching taught for every control`);
  }
});

test('4-5: behind a curtain he is hidden; the water never pushes or slows him', () => {
  const st = build(SEEDS[0]);
  const w4 = st.proto.w4!;
  const play = new W4Play(w4, st.platforms, st.vines);
  const w = w4.falls![0];
  const cx = w.x + w.width / 2;
  assert.equal(play.behindFall(cx, G), true);
  assert.equal(play.behindFall(w.x - 40, G), false);
  const player = { x: cx, y: G - 30, vx: 100, vy: 0, grounded: false, invincibleTimer: 0 } as unknown as PlayerState;
  const host: W4Host = {
    t: 0, player, platforms: st.platforms, vines: st.vines, collectibles: st.collectibles, zones: [], punch: null, hidden: true,
    hurt: () => {}, tip: () => {}, float: () => {}, screech: () => {}, sfx: () => {},
  };
  const out = play.step(1 / 30, host);
  assert.equal(out.speed, 1);
  assert.equal(player.vy, 0);
  // (a bush hides him only crouched, as in 1-7)
  const b = st.proto.bushes![0];
  assert.equal(hidden(st.proto.bushes!, { x: b.x + b.w / 2, y: G, ducking: true, grounded: true, hanging: false }), true);
  assert.equal(hidden(st.proto.bushes!, { x: b.x + b.w / 2, y: G, ducking: false, grounded: true, hanging: false }), false);
});

test('4-5: a lookout that sees him screeches; the fruit punched down from its tree keeps it eating while he runs its stretch', () => {
  for (const s of SEEDS.slice(0, 4)) {
    const st = build(s);
    const w4 = st.proto.w4!;
    w4.monkeys!.forEach((m, i) => {
      const f = w4.fruit![i];
      const runAcross = (punchFirst: boolean) => {
        const play = new W4Play({ monkeys: [m], fruit: [f] }, [], []);
        const player = { x: f.x - 40, y: G, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 } as unknown as PlayerState;
        let screech = 0;
        const host: W4Host = {
          t: 0, player, platforms: [], vines: [], collectibles: [], zones: [], punch: null, hidden: false,
          hurt: () => {}, tip: () => {}, float: () => {}, screech: () => screech++, sfx: () => {},
        };
        if (punchFirst) {
          host.punch = { x: player.x + 40, y: G - 40 };
          play.step(1 / 30, host);
          host.punch = null;
          // the fruit falls and the lookout goes to it
          for (let k = 0; k < 30; k++) play.step(1 / 30, host);
        }
        // he runs the stretch at full speed (a curtain on the way hides him)
        while (player.x < m.x1! + 40) {
          player.x += 285 / 30;
          host.hidden = w4.falls!.some((w) => inFall(w, player.x, G, 64));
          play.step(1 / 30, host);
          host.t += 1 / 30;
        }
        return screech;
      };
      assert.ok(runAcross(false) >= 1, `seed ${s}: lookout ${i} never saw him`);
      assert.equal(runAcross(true), 0, `seed ${s}: lookout ${i} screeched while it ate`);
    });
  }
});

test('4-5 (LV-13): under her eye, every hop run between two places to hide has cover beside its rock: no spot of the path more than ~200 px from cover (was 330-386), and Dot calls her first strike', async () => {
  for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const st = buildProtoStage(cfg, s, '4-5');
    const pr = st.proto as unknown as { bushes: Array<{ x: number; w: number; y: number; hanging?: boolean }>; watch: Array<{ x0: number; x1: number }> | { zones: Array<{ x0: number; x1: number }> }; w4: { falls: Array<{ x: number; width: number; veil?: boolean }> } };
    const covers: Array<[number, number]> = [...pr.bushes.filter((b) => !b.hanging && b.y === G).map((b): [number, number] => [b.x, b.x + b.w]), ...pr.w4.falls.filter((f) => f.veil).map((f): [number, number] => [f.x, f.x + f.width])];
    const zones = Array.isArray(pr.watch) ? pr.watch : pr.watch.zones;
    let worst = 0;
    for (const z of zones) {
      for (let x = z.x0; x <= z.x1; x += 10) {
        if (!st.platforms.some((p) => p.y === G && x >= p.x && x <= p.x + p.width)) continue;
        worst = Math.max(worst, Math.min(...covers.map(([a, b]) => (x < a ? a - x : x > b ? x - b : 0))));
      }
    }
    assert.ok(worst <= 215, `seed ${s}: ${Math.round(worst)} px from cover under her eye`);
  }
  // her first strike's call is a warning: it comes at once, over anything else Dot is saying
  const { engineGuideLine } = await import('./dotLines.ts');
  assert.equal(engineGuideLine('Hide in the bush!', '4-5', { dot: true })?.kind, 'danger');
});
