// World 2's TWO-ROAD section (w2.ts W2_FORK, w2TwoRoad; 2-8's fork, R-165.430 (2)), laid by gen2 on the out-and-back toy's home leg in
// place of its first river (gen2/toyHome.ts 'home-practise-ride', as floodLay.test lays its brick there): GREEN on every roll and both
// settings (layFlood: floodFaults, highRoad and forkFaults all empty); the built pieces in the ruled order (W on the near bank's end, the gap,
// the porch, the rise standing on it, porch2 out over the far bank); RED, each by name, on W 60 and on no gap. (flood.ts highRoad walks a porch end to end and never meets a
// block standing on it, so a rise's wall-step is held here, by the built pieces, not by the verdict: REPORT, ENGINE-WORTHY.)
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../headlessDom.ts';
import { buildGen2Stage } from '../pipeline.ts';
import { towerCfg } from '../toyTower.ts';
import { HOME_BRICKS, HOME_CODE, homeKit } from '../toyHome.ts';
import { FLOOD_HOP, FLOOD_STEP, layFlood } from '../floodLay.ts';
import { forkFaults, highRoad } from '../../flood.ts';
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
      assert.ok(road.chain.length >= 3, `${at}: the high road is W, the porch and more (lead-the-line reads it minus its shared ends): ${road.chain.length}`);
      const dir = span.to.x >= span.from.x ? 1 : -1;
      const [W, P] = road.chain;
      assert.equal(Math.round(W.w), W2_FORK.wall.w, `${at}: W is the wall-step`);
      assert.equal(Math.round(low.lip - W.y), W2_FORK.wall.h, `${at}: W one step up off the bank`);
      assert.equal(Math.round(P.y), Math.round(W.y), `${at}: the porch level with W's top`);
      // (the rise stands on the porch, one step, over the water between W and the far bank; nothing stands higher)
      const inSpan = (t: { x: number; w: number }) => t.x >= Math.min(span.from.x, span.to.x) && t.x + t.w <= Math.max(span.from.x, span.to.x);
      const rise = tops.filter((t) => Math.round(P.y - t.y) === W2_FORK.rise.h && Math.round(t.y + (t.h ?? 0)) === Math.round(P.y));
      // (within a step or two over the rise: the out leg stacked far above is no part of it)
      const higher = tops.filter((t) => t.y < P.y - W2_FORK.rise.h - 1 && t.y > P.y - W2_FORK.rise.h - 2 * FLOOD_STEP - 1 && inSpan(t));
      assert.equal(rise.length, 1, `${at}: one rise standing on the porch`);
      assert.deepEqual(higher, [], `${at}: one rise, nothing over it (BUILD-28 session 1: a block on the rise stranded the Easy child)`);
      assert.ok(inSpan(rise[0]), `${at}: the rise stands over the low road's water, out of its lane under the porch`);
      assert.equal(Math.round(rise[0].w), W2_FORK.rise.w, `${at}: the rise's tread`);
      assert.ok((dir > 0 ? road.chain.at(-1)!.x + road.chain.at(-1)!.w : road.chain.at(-1)!.x) * dir >= span.to.x * dir, `${at}: the high road ends out over the far bank`);
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
});
