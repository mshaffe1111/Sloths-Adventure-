// World 2's TWO-ROAD section (w2.ts W2_FORK, w2TwoRoad; 2-8's fork, R-165.430 (2), BUILD-28 1d), laid by gen2 on the out-and-back toy's
// home leg in place of its first river (gen2/toyHome.ts 'home-practise-ride', as floodLay.test lays its brick there): GREEN on every roll and
// both settings (layFlood: floodFaults, highRoad, forkFaults and strandFaults all empty); the built pieces in the ruled order (W set back on
// the near bank, the gap, the porch over the marsh, the rises standing centred, every tread at least 400 px, down the way it came up onto
// the far bank); RED, each by name, on W 60, on no gap and on W flush on the water (a 120 px drop: the line stranded at W's lip).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../headlessDom.ts';
import { buildGen2Stage } from '../pipeline.ts';
import { towerCfg } from '../toyTower.ts';
import { HOME_BRICKS, HOME_CODE, homeKit } from '../toyHome.ts';
import { FLOOD_HOP, FLOOD_STEP, layFlood } from '../floodLay.ts';
import { forkFaults, highRoad, strandFaults } from '../../flood.ts';
import { W2_FLOOD, W2_FORK, W2_FORK_RIVERS, W2_RIVERS, w2TwoRoad, type W2ForkShape } from './w2.ts';
import type { Collectible } from '../../types.ts';
import type { WorldKit } from '../types.ts';

const ID = '2-96';
const SWAP = 'home-practise-ride';
const kit = (f: W2ForkShape): WorldKit => {
  const k = homeKit(ID, HOME_CODE);
  const briefs = k.manifest.graphs!.briefs!;
  const sections = [k.manifest.sections[0], ...HOME_BRICKS.map((b) => (b.id === SWAP ? w2TwoRoad(b.id, b.jobs![0], f) : b))];
  return { ...k, manifest: { ...k.manifest, rivers: { ...W2_RIVERS, ...W2_FORK_RIVERS, twin: { ...W2_RIVERS.twin, flood: 'rise' as const } }, sections, graphs: { ...k.manifest.graphs!, briefs: { [ID]: { ...briefs[ID], pacer: undefined } } } } };
};
const build = (seed: number, difficulty: 'normal' | 'easy', f: W2ForkShape = W2_FORK) => buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: kit(f), seed, difficulty });

/** two cages (floodLay.test's): one on the out leg at the column's lip, one past the column on the home leg, at a smaller x (met later) */
function caged(st: ReturnType<typeof build>): void {
  const legs = st.gen2.tower!.legs!;
  const outLeg = legs[0], home = legs.at(-1)!;
  const outTop = st.platforms.filter((p) => p.type === 'solid' && p.x < outLeg.x1 && p.x + p.width > outLeg.x1 - 400 && p.y <= outLeg.y1 + 1).sort((a, b) => a.y - b.y)[0];
  const homeTop = st.platforms.filter((p) => p.type === 'solid' && p.x + p.width > home.x1 - 600 && p.x < home.x1 - 100 && p.y >= home.y0 - 60).sort((a, b) => b.x - a.x)[0];
  const mk = (id: number, x: number, y: number): Collectible => ({ id, type: 'cage', x, y: y - 30, collected: false, bobPhase: 0, cageHp: 2 });
  st.collectibles.push(mk(9001, outTop.x + outTop.width - 60, outTop.y), mk(9002, Math.min(homeTop.x + homeTop.width - 80, outTop.x + outTop.width - 200), homeTop.y));
}

/** the low road and the high road's walk over it on a built stage (floodLay.ts's own span and tops) */
function roads(st: ReturnType<typeof build>, easy: boolean) {
  const r = layFlood(st, W2_FLOOD, easy);
  const low = r.flood!.waters.find((w) => w.deep)!;
  const nearIsX0 = low.deep!.near.x < low.x0;
  const span = { x0: low.x0, x1: low.x1, from: { x: nearIsX0 ? low.x0 : low.x1, y: low.lip }, to: { x: nearIsX0 ? low.x1 : low.x0, y: low.lip } };
  const tops = st.platforms.filter((p) => p.type === 'solid' && !p.pad && !p.broken && p.y < low.lip - 1).map((p) => ({ x: p.x, w: p.width, y: p.y, h: p.height }));
  return { r, low, span, tops, road: highRoad(tops, span, FLOOD_STEP, FLOOD_HOP) };
}

test('two roads: GREEN on the toy\'s rolls, both settings: the flood, the high road and the fork all fair; the pieces in the ruled order', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 4; seed++) {
      const at = `${difficulty} seed ${seed}`;
      const st = build(seed, difficulty);
      assert.deepEqual(st.gen2.errors, [], at);
      caged(st);
      const { r, low, span, tops, road } = roads(st, difficulty === 'easy');
      assert.deepEqual(r.problems, [], at);
      assert.deepEqual(road.faults, [], `${at}: the high road walks`);
      assert.deepEqual(forkFaults(road.chain, span, W2_FLOOD.climb), [], `${at}: the fork (W ${W2_FORK.wall.w}, gap ${W2_FORK.gap})`);
      const n = W2_FORK.rises.length;
      assert.equal(road.chain.length, 2 + 2 * n, `${at}: the high road is W, the porch, the rises up, then each rise and the porch again down (a piece met again further along: highRoad)`);
      const dir = span.to.x >= span.from.x ? 1 : -1;
      const near = (t: { x: number; w: number }) => (dir > 0 ? t.x : t.x + t.w);
      const far = (t: { x: number; w: number }) => (dir > 0 ? t.x + t.w : t.x);
      const [W, P] = road.chain;
      assert.equal(Math.round(W.w), W2_FORK.wall.w, `${at}: W is the wall-step`);
      assert.equal(Math.round(low.lip - W.y), W2_FORK.wall.h, `${at}: W one step up off the bank`);
      assert.equal(Math.round((span.from.x - far(W)) * dir), W2_FORK.wall.back, `${at}: W stands back from the water's edge, its lip over the bank`);
      assert.equal(Math.round(P.y), Math.round(W.y), `${at}: the porch level with W's top`);
      // (the rises: each a step up, standing on the piece before it, the ruled width; then met again on the way down)
      const ups = road.chain.slice(2, 2 + n);
      ups.forEach((r, i) => {
        const under = i ? ups[i - 1] : P;
        assert.equal(Math.round(under.y - r.y), W2_FORK.rises[i].h, `${at}: rise ${i + 1} one step up`);
        assert.equal(Math.round(r.y + (r.h ?? 0)), Math.round(under.y), `${at}: rise ${i + 1} stands on the piece under it (a wall-step)`);
        assert.equal(Math.round(r.w), W2_FORK.rises[i].w, `${at}: rise ${i + 1}'s width`);
      });
      assert.deepEqual(road.chain.slice(2 + n), [...ups.slice(0, -1).reverse(), P], `${at}: down the way it came up: each rise's far tread, then the porch's`);
      // (every tread at least 400 px, both ways: BUILD-28 session 1's probe, 80 and 220 px treads stranded the line)
      const stack = [P, ...ups];
      for (let i = 0; i + 1 < stack.length; i++) {
        const [lo, hi] = [stack[i], stack[i + 1]];
        assert.ok((near(hi) - near(lo)) * dir >= 400 && (far(lo) - far(hi)) * dir >= 400, `${at}: the treads either side of rise ${i + 1} at least 400 px`);
      }
      assert.ok(ups.at(-1)!.w >= 400, `${at}: the top's tread at least 400 px`);
      // (nothing stands over the top within two steps in the span: the out leg stacked far above is no part of it)
      const top = ups.at(-1)!;
      const inSpan = (t: { x: number; w: number }) => t.x >= Math.min(span.from.x, span.to.x) && t.x + t.w <= Math.max(span.from.x, span.to.x);
      const higher = tops.filter((t) => t.y < top.y - 1 && t.y > top.y - 2 * FLOOD_STEP - 1 && inSpan(t));
      assert.deepEqual(higher, [], `${at}: nothing over the top`);
      assert.ok(far(P) * dir >= span.to.x * dir, `${at}: the high road ends out over the far bank`);
      // (the marsh: its zone reads the floor it laid (a shifted leg moves both: pipeline.ts), four dips, the floor a step under the banks)
      const zone = st.rivers!.find((q) => q.floodMark?.kind === 'close')!;
      const floor = st.platforms.filter((p) => p.type === 'solid' && p.x >= low.x0 - 1 && p.x + p.width <= low.x1 + 1 && Math.round(p.y) === Math.round(zone.marsh!.floor));
      assert.equal(floor.length, W2_FORK_RIVERS[W2_FORK.row].marsh.dips + 1, `${at}: the marsh's floor pieces under its zone's floor`);
      assert.equal(Math.round(zone.marsh!.lip), Math.round(low.lip), `${at}: the marsh's lip is the banks' top`);
      assert.equal(Math.round(zone.marsh!.floor - low.lip), W2_FORK_RIVERS[W2_FORK.row].marsh.floor, `${at}: the floor ${W2_FORK_RIVERS[W2_FORK.row].marsh.floor} px under the banks`);
      // (THE STRAND VERDICT, laid by floodLay: off every end of every piece, ground within the line's step)
      const all = st.platforms.filter((p) => p.type === 'solid' && !p.pad && !p.broken).map((p) => ({ x: p.x, w: p.width, y: p.y }));
      assert.deepEqual(strandFaults(road.chain, [...road.chain, ...all], (x) => (x >= low.x0 && x <= low.x1 ? low.y0 : Infinity), W2_FLOOD.step), [], `${at}: nobody stranded`);
    }
  }
});

test('two roads: RED by name on W 60 (every tier walks off) and on no gap (no way down)', () => {
  const faults = (f: W2ForkShape) => {
    const st = build(1, 'normal', f);
    caged(st);
    return layFlood(st, W2_FLOOD, false).problems.join('; ');
  };
  assert.match(faults({ ...W2_FORK, wall: { ...W2_FORK.wall, w: 60 } }), /the adult lands 86 px past its face .* walks off into the 60 px gap/, 'RED: W 60');
  assert.match(faults({ ...W2_FORK, gap: 0 }), /no way down onto the low road: the gap after it is 0 px/, 'RED: no gap');
  // (W flush on the water's edge (BUILD-28 1e): off its lip onto the marsh floor is one 120 px drop, deeper than the line's step)
  assert.match(faults({ ...W2_FORK, wall: { ...W2_FORK.wall, back: 0 } }), /off the (left|right) end of the high road's piece at x \d+-\d+ the first ground is 120 px down, deeper than the line's 90 px step/, 'RED: W flush on the water');
});
