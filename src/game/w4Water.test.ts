/**
 * World 4's falls and boulders, across the stages that have them (4-3 Waterfall Steps, 4-6 Above the Mist, 4-8 Nests on the Cliff):
 *   - a pouring fall is a wall of water, in the game (waterfalls.ts fallWall, run by w4Play.ts) and in the level check (levelCheck.ts),
 *     so no stage can be finished, nor a puzzle skipped, through pouring water;
 *   - no boulder, wherever the push lets it be rolled, can cut him off from the shrine or from anything the stage asks for;
 *   - from anywhere he can get to, the shrine and every goal can still be reached (nothing strands him).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage } from './protoStage.ts';
import { validateStage, type CheckGraph } from './levelCheck.ts';
import { BODY, FALLS, fallWall, type Waterfall } from './waterfalls.ts';
import { blockBeside } from './physics.ts';
import { W4Play, type W4Host } from './w4Play.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { LevelConfig, Platform, PlayerState } from './types.ts';

const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const cfg = (mini: number, objectiveType: LevelConfig['objectiveType']) =>
  ({
    worldIndex: 4, miniIndex: mini, id: `4-${mini}`, name: '', objectiveType, targetCount: 1, timeLimit: 0, levelWidth: 9000, levelHeight: 900,
    description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const STAGES = [
  { id: '4-3', config: cfg(3, 'ascent') },
  { id: '4-6', config: cfg(6, 'ascent') },
  { id: '4-8', config: cfg(8, 'rescue') },
] as const;
const build = (id: string, config: LevelConfig, seed: number) => buildProtoStage(config, seed, id as Parameters<typeof buildProtoStage>[2]);
const fallsOf = (st: GeneratedStage): Waterfall[] => (st as { proto?: { w4?: { falls?: Waterfall[] } } }).proto?.w4?.falls ?? [];

// ───────────────────────── the wall of water, in the game ─────────────────────────

const pouring: Waterfall = { id: 1, x: 1000, width: 200, top: 200, bottom: 800 };
const player = (x: number, y: number, extra: Partial<PlayerState> = {}) =>
  ({ x, y, vx: 0, vy: 0, grounded: true, climbing: false, invincibleTimer: 0, ...extra }) as unknown as PlayerState;
const host = (p: PlayerState, t: number, platforms: Platform[] = []): W4Host => ({
  t, player: p, platforms, vines: [], collectibles: [], zones: [], punch: null, hidden: false,
  hurt: () => {}, tip: () => {}, float: () => {}, screech: () => {}, sfx: () => {},
});

/**
 * hold a direction for `secs` against the water, as the engine moves him: the stage steps first (and may throw him), then he walks
 * (his steering taken while a throw staggers him), on flat ground at y
 */
function holdInto(play: W4Play, p: PlayerState, dir: 1 | -1, secs: number, t0 = 0, platforms: Platform[] = []) {
  let grace = 0;
  let furthest = dir > 0 ? -Infinity : Infinity;
  for (let t = t0; t < t0 + secs; t += 1 / 30) {
    const out = play.step(1 / 30, host(p, t, platforms));
    if (out.knocked) grace = FALLS.stagger;
    grace -= 1 / 30;
    if (grace <= 0) p.vx = dir * 285 * out.speed;
    else p.vx *= 0.6;
    p.x += p.vx / 30;
    furthest = dir > 0 ? Math.max(furthest, p.x) : Math.min(furthest, p.x);
  }
  return furthest;
}

test('a pouring fall throws him back out the side he walked in from: he never gets past its edge', () => {
  for (const dir of [1, -1] as const) {
    const play = new W4Play({ falls: [{ ...pouring }] }, [], []);
    const p = player(dir > 0 ? 900 : 1300, 700);
    const furthest = holdInto(play, p, dir, 4);
    const edge = dir > 0 ? pouring.x : pouring.x + pouring.width;
    // (his middle never more than a bite and one frame's walk past the edge of his body)
    assert.ok(dir * (furthest - edge) < -BODY.half + FALLS.bite + 12, `walking ${dir}: he got to ${furthest} (the edge is at ${edge})`);
    assert.ok(dir > 0 ? p.x < pouring.x : p.x > pouring.x + pouring.width, 'he ended up in the water');
  }
});

test('a jump into pouring water is thrown back and down, and the leaf folds in it', () => {
  const play = new W4Play({ falls: [{ ...pouring }] }, [], []);
  const p = player(pouring.x - BODY.half + 14, 500, { grounded: false, vx: 285, vy: -200 });
  play.step(1 / 30, host(p, 0));
  assert.ok(p.vx < 0, 'not thrown back');
  assert.ok(p.vy >= FALLS.drop * 0.99, 'not pushed down');
  assert.ok(p.x + BODY.half <= pouring.x + FALLS.bite + 0.01, 'left inside the water');
});

test('caught under a fall when it comes back, the water carries him out the way he came, and down', () => {
  const surge: Waterfall = { id: 1, x: 1000, width: 400, top: 200, bottom: 800, surge: { pour: 3, ease: 1, quiet: 3, offset: 0 } };
  const play = new W4Play({ falls: [surge] }, [], []);
  // in the quiet he walks in from the left, to the middle
  const p = player(900, 700);
  for (let t = 4.2; t < 6.4; t += 1 / 30) {
    play.step(1 / 30, host(p, t));
    if (p.x < 1200) p.x += 285 / 30;
  }
  assert.ok(p.x >= 1200, `he could not walk in in the quiet (${p.x})`);
  // the water comes back (t = 7 is the start of the next pour): he stands still, and it carries him out to the left
  for (let t = 6.4; t < 9.5; t += 1 / 30) {
    play.step(1 / 30, host(p, t));
    p.x += p.vx / 30;
    p.vx *= 0.9;
  }
  assert.ok(p.x + BODY.half <= surge.x + FALLS.bite + 12, `still in the water at ${p.x}`);
});

test('in a cave behind the water he waits out the pour; and a curtain (4-5) never pushes', () => {
  const surge: Waterfall = { id: 1, x: 1000, width: 400, top: 200, bottom: 800, surge: { pour: 3, ease: 1, quiet: 3, offset: 0 }, shelter: [{ x0: 1150, x1: 1300, y: 600 }] };
  const play = new W4Play({ falls: [surge] }, [], []);
  const p = player(1200, 600);
  for (let t = 4; t < 12; t += 1 / 30) play.step(1 / 30, host(p, t));
  assert.equal(p.x, 1200, 'the water moved him in the cave');
  const veil = new W4Play({ falls: [{ ...pouring, veil: true }] }, [], []);
  const q = player(1100, 700);
  for (let t = 0; t < 2; t += 1 / 30) veil.step(1 / 30, host(q, t));
  assert.equal(q.x, 1100);
});

test('as the flow drops the wall fades, and a dry fall lets him walk through', () => {
  const w = { ...pouring };
  const at = (flow: number) => fallWall(w, flow, -1, { x: w.x + 40, y: 700, vx: 285, vy: 0, grounded: true }, 1 / 30);
  assert.ok(at(1), 'full water lets him in');
  assert.ok(at(FALLS.full), 'the wall is gone too early');
  assert.equal(at(FALLS.trickle), null, 'a trickle still pushes');
  assert.equal(at(0), null);
  // half way down, it lets him a good way further in than at full pour
  const deep = (flow: number) => {
    for (let d = 0; d < w.width + 40; d += 2) if (fallWall(w, flow, -1, { x: w.x - BODY.half + d, y: 700, vx: 285, vy: 0, grounded: true }, 1 / 30)) return d;
    return Infinity;
  };
  assert.ok(deep((FALLS.full + FALLS.trickle) / 2) > deep(1) + 60);
  // plugged: the fall dries, and he walks straight through
  const boulder: Platform = { id: 7, x: 0, y: 100, width: 80, height: 80, type: 'solid', push: { min: 0, max: 980 } };
  const plugFall: Waterfall = { ...pouring, plug: { platformId: 7, atX: 900 } };
  const play = new W4Play({ falls: [plugFall] }, [boulder], []);
  const p = player(900, 700);
  assert.ok(holdInto(play, p, 1, 2, 0, [boulder]) < pouring.x, 'he walked through a pouring fall');
  boulder.x = 900;
  for (let t = 2; t < 2 + FALLS.dry + 0.3; t += 1 / 30) play.step(1 / 30, host(player(0, 0), t, [boulder]));
  p.x = 900;
  assert.ok(holdInto(play, p, 1, 3, 4, [boulder]) > pouring.x + pouring.width + 100, 'a dry fall still stops him');
});

// ───────────────────────── the wall of water, in the level check ─────────────────────────

/** a flat floor with a fall across it, a ledge up a trunk, and the shrine past the fall; `fall` decides what kind of fall it is */
function floorStage(fall: Partial<Waterfall>, boulder?: { onShelf: boolean }): GeneratedStage {
  const G = 800;
  const platforms: Platform[] = [{ id: 1, x: 0, y: G, width: 4000, height: 60, type: 'solid' }];
  const vines = [] as GeneratedStage['vines'];
  if (boulder) {
    // a shelf up a trunk, the boulder on it, and its slot at the shelf's end, where the water pours from
    platforms.push({ id: 2, x: 1300, y: G - 240, width: 500, height: 24, type: 'solid' });
    platforms.push({ id: 3, x: 1400, y: G - 240 - 84, width: 100, height: 84, type: 'solid', push: { min: 1360, max: boulder.onShelf ? 1800 : 1360 + 100 } });
    vines.push({ id: 1, x: 1340, topY: G - 242, bottomY: G - 6, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' });
  }
  return {
    config: { ...cfg(8, 'rescue'), levelWidth: 4000, targetCount: 0 }, trees: [], platforms, vines, enemies: [], boss: null,
    collectibles: [{ id: 1, type: 'exit_totem', x: 3600, y: G - 30, collected: false, bobPhase: 0 }],
    spawnX: 100, spawnY: G, exitTotemX: 3600, exitTotemY: G,
    proto: { hints: [], covers: [], beats: [], w4: { falls: [{ id: 1, x: 1800, width: 260, top: G - 600, bottom: G, ...fall } as Waterfall] } },
  } as unknown as GeneratedStage;
}

test('the level check: a stage that needs a pouring fall passed cannot be finished; a quiet spell, a curtain or a boulder in the slot can', () => {
  assert.ok(!validateStage(floorStage({})).ok, 'walked through a fall that always pours');
  assert.ok(validateStage(floorStage({ surge: { pour: 3, ease: 1.5, quiet: 3.4, offset: 0 } })).ok, 'a surge goes quiet');
  assert.ok(validateStage(floorStage({ veil: true })).ok, 'a curtain is no wall');
  // a plug fall: the boulder up on the shelf rolls into the slot (the fall dries) once he can stand behind it
  const plug = floorStage({ plug: { platformId: 3, atX: 1700 } }, { onShelf: true });
  assert.ok(validateStage(plug).ok, validateStage(plug).errors.join('; '));
  assert.ok(!validateStage(plug, { frozen: new Set([3]) }).ok, 'passed the fall with its boulder held out of the slot');
  // a boulder whose roll stops short of the slot does not dry the fall
  assert.ok(!validateStage(floorStage({ plug: { platformId: 3, atX: 1700 } }, { onShelf: false })).ok, 'a boulder that cannot reach the slot dried the fall');
});

test('a boulder up on a shelf is no wall to him on the ground under the shelf, so he cannot push it from below', () => {
  const boulder = { y: 476, height: 84 }; // (on a shelf at 560, 240 over the floor at 800)
  assert.equal(blockBeside(800, 48, boulder), false, 'walking on the floor under the shelf, he bumps into the boulder');
  assert.equal(blockBeside(560, 48, boulder), true, 'on the shelf, the boulder is not a wall');
  assert.equal(blockBeside(boulder.y, 48, boulder), false, 'on top of it, it is a wall');
  // jumping up beside it, his head in its height, it is a wall again
  assert.equal(blockBeside(600, 48, boulder), true);
});

test('the level check: a boulder is a wall on its shelf, climbed over, never a way to push from below', () => {
  const st = floorStage({ veil: true }, { onShelf: true });
  let g: CheckGraph | undefined;
  validateStage(st, { inspect: (x) => (g = x) });
  const pieces = g!.plats.filter((p) => p.id === 2);
  assert.equal(pieces.length, 2, 'the shelf is not two pieces either side of the boulder');
  assert.ok(pieces.every((p) => p.x + p.width <= 1400 || p.x >= 1500));
});

// ───────────────────────── every World 4 stage that has them: no fall skipped, no boulder trap, nothing out of reach ─────────────────────────

/** what he must always be able to get to: the shrine, and every goal (a nest, the keepsake), as the pieces of ground they are on */
function targets(st: GeneratedStage, g: CheckGraph): Array<{ what: string; keys: Set<string> }> {
  const near = (x: number, y: number) =>
    new Set(g.plats.filter((p) => x >= p.x - 150 && x <= p.x + p.width + 150 && p.y - y >= -14 && p.y - y <= 190).map((p) => g.key(p)));
  const out = [{ what: 'the shrine', keys: new Set(g.plats.filter((p) => st.exitTotemX >= p.x && st.exitTotemX <= p.x + p.width && Math.abs(p.y - st.exitTotemY) < 6).map((p) => g.key(p))) }];
  for (const c of st.collectibles) if (c.type === 'cage' || c.type === 'find') out.push({ what: `${c.type} #${c.id} at ${Math.round(c.x)}`, keys: near(c.x, c.y) });
  return out;
}

/** the links of a graph turned round */
function backLinks(nodes: Iterable<string>, edges: (n: string) => Iterable<string>): Map<string, string[]> {
  const back = new Map<string, string[]>();
  for (const n of nodes) for (const m of edges(n)) (back.get(m) ?? back.set(m, []).get(m)!).push(n);
  return back;
}

/** the nodes from which some node in `to` can be reached (`back`: the graph's links turned round) */
function reachersOf(back: Map<string, string[]>, to: Set<string>): Set<string> {
  const out = new Set(to);
  const q = [...to];
  while (q.length) for (const m of back.get(q.pop()!) ?? []) if (!out.has(m)) { out.add(m); q.push(m); }
  return out;
}

test('World 4: from anywhere he can get to, the shrine and every goal can still be reached', () => {
  for (const { id, config } of STAGES) {
    for (const s of SEEDS) {
      const st = build(id, config, s);
      let g!: CheckGraph;
      const res = validateStage(st, { inspect: (x) => (g = x) });
      assert.ok(res.ok, `${id} seed ${s}: ${res.errors.join('; ')}`);
      const back = backLinks(new Set([...g.adj.keys(), ...g.seen]), (n) => g.adj.get(n) ?? []);
      for (const t of targets(st, g)) {
        assert.ok(t.keys.size, `${id} seed ${s}: ${t.what} stands on nothing`);
        const can = reachersOf(back, t.keys);
        const stuck = [...g.seen].filter((n) => !can.has(n));
        assert.deepEqual(stuck, [], `${id} seed ${s}: from ${stuck.join(', ')} he can no longer get to ${t.what}`);
      }
    }
  }
});

test('World 4: no puzzle is skipped through water: with every boulder held at its start, no fall it plugs can be got past', () => {
  for (const { id, config } of STAGES) {
    for (const s of SEEDS) {
      const st = build(id, config, s);
      const plugs = fallsOf(st).filter((w) => w.plug);
      if (id === '4-6') assert.equal(fallsOf(st).length, 0, '4-6 has falls now: give them their own checks');
      if (!plugs.length) continue;
      // with the boulders held, nothing past the first plug fall on the way can be reached
      const held = validateStage(st, { frozen: new Set(plugs.map((w) => w.plug!.platformId)) });
      assert.ok(!held.ok, `${id} seed ${s}: finished without rolling a boulder`);
      const first = Math.min(...plugs.map((w) => w.x));
      const past = st.platforms.filter((p) => p.x > first + 2000 && !p.push);
      assert.ok(past.length && past.every((p) => !held.reachableIds.includes(p.id)), `${id} seed ${s}: got past a pouring plug fall`);
    }
  }
});

test('World 4: no boulder traps him: wherever the push can roll it, he can still get to the shrine and every goal', () => {
  const STEP = 30;
  for (const { id, config } of STAGES) {
    for (const s of SEEDS) {
      const st = build(id, config, s);
      const plugs = fallsOf(st).filter((w) => w.plug);
      const boulders = st.platforms.filter((p) => p.push && p.type === 'solid' && p.height >= 50);
      assert.equal(boulders.length, plugs.length, `${id} seed ${s}: a boulder with no fall, or a fall with no boulder`);
      const all = new Set(boulders.map((b) => b.id));
      for (const b of boulders) {
        const w = plugs.find((q) => q.plug!.platformId === b.id)!;
        // the others sit in their slots (their own puzzles solved: each is checked on its own turn), this one wherever it can roll
        const lo = b.push!.min, hi = b.push!.max - b.width;
        const xs = [...new Set([lo, ...Array.from({ length: Math.floor((hi - lo) / STEP) }, (_, k) => lo + (k + 1) * STEP), hi, b.x])].filter((x) => x >= lo && x <= hi).sort((p, q) => p - q);
        const shelfY = b.y + b.height;
        const graphs = xs.map((x) => {
          const platforms = st.platforms.map((p) => (p.id === b.id ? { ...p, x } : p.push ? { ...p, x: plugs.find((q) => q.plug!.platformId === p.id)!.plug!.atX } : p));
          let g!: CheckGraph;
          validateStage({ ...st, platforms }, { frozen: all, inspect: (q) => (g = q) });
          const piece = (f: (p: Platform) => boolean) => g.plats.find((p) => Math.abs(p.y - shelfY) < 2 && f(p));
          const left = piece((p) => Math.abs(p.x + p.width - x) < 2);
          const right = piece((p) => Math.abs(p.x - (x + b.width)) < 2);
          return { x, g, left: left && g.key(left), right: right && g.key(right) };
        });
        // the states: (where the boulder is, where he is). He moves about with it where it is; standing behind it he rolls it on
        const node = (i: number, k: string) => `${i}|${k}`;
        const edges = (n: string): string[] => {
          const bar = n.indexOf('|');
          const i = Number(n.slice(0, bar)), k = n.slice(bar + 1);
          const G = graphs[i];
          const out = [...(G.g.adj.get(k) ?? [])].map((m) => node(i, m));
          if (k === G.left) for (let j = i + 1; j < graphs.length; j++) if (graphs[j].left) out.push(node(j, graphs[j].left!));
          if (k === G.right) for (let j = 0; j < i; j++) if (graphs[j].right) out.push(node(j, graphs[j].right!));
          return out;
        };
        const i0 = xs.indexOf(b.x);
        const start = graphs[i0].g.plats.find((p) => st.spawnX >= p.x - 4 && st.spawnX <= p.x + p.width + 4 && Math.abs(p.y - st.spawnY) < 6)!;
        const seen = new Set([node(i0, graphs[i0].g.key(start))]);
        const q = [...seen];
        while (q.length) for (const m of edges(q.pop()!)) if (!seen.has(m)) { seen.add(m); q.push(m); }
        assert.ok([...seen].some((n) => n.startsWith(`${xs.indexOf(w.plug!.atX)}|`)), `${id} seed ${s}: the boulder at ${b.x} cannot be rolled into its slot`);
        const back = backLinks(graphs.flatMap((G, i) => [...new Set([...G.g.adj.keys(), ...G.g.seen])].map((k) => node(i, k))), edges);
        const goals = graphs.map((G) => new Map(targets(st, G.g).map((t) => [t.what, t.keys])));
        for (const what of goals[i0].keys()) {
          const to = new Set(goals.flatMap((m, i) => [...(m.get(what) ?? [])].map((k) => node(i, k))));
          const can = reachersOf(back, to);
          const stuck = [...seen].filter((n) => !can.has(n));
          assert.deepEqual(stuck.slice(0, 3), [], `${id} seed ${s}: with boulder ${b.id} rolled to x=${stuck[0]?.split('|').map((v, k) => (k ? v : xs[Number(v)])).join(', standing on ')}, ${what} is out of reach`);
        }
      }
    }
  }
});
