// The FLOOD's lay (gen2/floodLay.ts; reference/design/2-8.md NEW 1), proven on the out-and-back toy (gen2/toyHome.ts) laid by gen2: the
// home leg's first river is the LOW ROAD (its row marked 'close', a porch over it for the high road), its second rises ('rise'). The clock
// starts at the LAST cage MET (tower.ts lastMet, D130: on this out-and-back the last cage met lies at a smaller x than one met before it);
// GREEN on every roll and both settings; RED with the close 3 s early, with no high road, and with no cage, each by name.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { HOME_BRICKS, HOME_CODE, homeKit } from './toyHome.ts';
import { FLOOD_PADDLE, FLOOD_STEP, layFlood } from './floodLay.ts';
import { W2_FLOOD, W2_RIVERS } from './worlds/w2.ts';
import { floodTailOff, type FloodRow } from '../flood.ts';
import type { Collectible } from '../types.ts';
import type { SectionTemplate, WorldKit } from './types.ts';

const ID = '2-96';
/** the toy's rows: the ride river (the home leg's first) is the low road, the twin rises */
const RIVERS = { ...W2_RIVERS, ride: { ...W2_RIVERS.ride, flood: 'close' as const }, twin: { ...W2_RIVERS.twin, flood: 'rise' as const } };
/** the ride crossing with a HIGH ROAD and its FORK (the lead's ruling, ENG-28 session 7): a WALL-STEP on the near bank's end (a block
 *  FLOOD_STEP px tall, `fork.w` wide, its far side at the water's edge: he walks into it and climbs, flood.ts highRoad's first piece), a
 *  `fork.gap` px gap over the water's first px (the low road's way down: he falls through it), then a porch level with W's top over the rest of
 *  the river, ending over the far bank. The passing shape is W 150 + gap 60 (forkFaults: W at least the widest tier's landing + run-up,
 *  86 + 61; the gap his 44 px width up to FLOOD_HOP). (A porch alone, FLOOD_STEP px over the bank's end, is a bare edge hop up: refused by
 *  name, ENG-28 session 4's widened rule) */
const FORK = { w: 150, gap: 60 };
/** toyHome's near bank (bank('near', 280)): the porch's place past its end is a share of it */
const NEAR_W = 280;
const withPorch = (porch: boolean, fork = FORK): SectionTemplate[] => HOME_BRICKS.map((b) => (b.id !== 'home-practise-ride' || !porch ? b : {
  ...b, pieces: [...b.pieces,
    { key: 'stand', shape: 'block', w: [fork.w, fork.w], place: { kind: 'on', on: 'near', at: [1, 1], h: [FLOOD_STEP, FLOOD_STEP] }, style: 'moss_stone' },
    { key: 'porch', shape: 'branch', w: [880, 880], place: { kind: 'over', on: 'near', at: [1 + fork.gap / NEAR_W, 1 + fork.gap / NEAR_W], dy: [-FLOOD_STEP, -FLOOD_STEP] }, style: 'log', main: false }],
}));
const floodKit = (porch: boolean, flood?: FloodRow, fork = FORK): WorldKit => {
  const k = homeKit(ID, HOME_CODE);
  const briefs = k.manifest.graphs!.briefs!;
  return { ...k, manifest: { ...k.manifest, rivers: RIVERS, sections: [k.manifest.sections[0], ...withPorch(porch, fork)], graphs: { ...k.manifest.graphs!, briefs: { [ID]: { ...briefs[ID], pacer: undefined, ...(flood ? { flood } : {}) } } } } };
};
const build = (seed: number, difficulty: 'normal' | 'easy', porch = true, flood?: FloodRow, fork = FORK) => buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: floodKit(porch, flood, fork), seed, difficulty });

/** two cages: one on the out leg at the column's lip, one past the column on the home leg, at a smaller x (met later) */
function caged(st: ReturnType<typeof build>): { out: Collectible; home: Collectible } {
  const legs = st.gen2.tower!.legs!;
  const outLeg = legs[0], home = legs.at(-1)!;
  const outTop = st.platforms.filter((p) => p.type === 'solid' && p.x < outLeg.x1 && p.x + p.width > outLeg.x1 - 400 && p.y <= outLeg.y1 + 1).sort((a, b) => a.y - b.y)[0];
  const homeTop = st.platforms.filter((p) => p.type === 'solid' && p.x + p.width > home.x1 - 600 && p.x < home.x1 - 100 && p.y >= home.y0 - 60).sort((a, b) => b.x - a.x)[0];
  const mk = (id: number, x: number, y: number): Collectible => ({ id, type: 'cage', x, y: y - 30, collected: false, bobPhase: 0, cageHp: 2 });
  const out = mk(9001, outTop.x + outTop.width - 60, outTop.y);
  const h = mk(9002, Math.min(homeTop.x + homeTop.width - 80, outTop.x + outTop.width - 200), homeTop.y);
  st.collectibles.push(out, h);
  return { out, home: h };
}

test('flood lay: GREEN on the toy\'s rolls, both settings: the clock at the last cage MET, the low road deep at the close, the rest paddling', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 4; seed++) {
      const at = `${difficulty} seed ${seed}`;
      const st = build(seed, difficulty);
      assert.deepEqual(st.gen2.errors, [], at);
      const c = caged(st);
      assert.ok(c.home.x < c.out.x, `${at}: the last cage met lies at a SMALLER x than the one met before it (the D130 trap)`);
      const r = layFlood(st, W2_FLOOD, difficulty === 'easy');
      assert.deepEqual(r.problems, [], at);
      const F = r.flood!;
      assert.equal(F.start.id, c.home.id, `${at}: the clock starts at the last cage met, not the last by x`);
      assert.equal(F.close, difficulty === 'easy' ? W2_FLOOD.close.easy : W2_FLOOD.close.normal);
      const low = F.waters.filter((w) => w.deep);
      assert.equal(low.length, 1, `${at}: one low road`);
      assert.equal(F.waters.length, 2, `${at}: the low road and the rising river`);
      for (const w of F.waters) assert.equal(w.y1, Math.min(w.y0, w.lip + FLOOD_PADDLE), `${at}: paddling depth, ${FLOOD_PADDLE} px under the banks`);
      // (the near bank is the one he meets first: on the home leg, running left, the river's right end)
      assert.ok(low[0].deep!.near.x > low[0].x1, `${at}: the near bank is the right one on a leg run left`);
      assert.ok(F.px > 0 && Math.abs(F.tailOff - floodTailOff(W2_FLOOD, F.px, difficulty === 'easy')) < 1e-9, `${at}: the tail-off over the laid ${Math.round(F.px)} px`);
    }
  }
});

test('flood lay: RED with T_CLOSE 3 s early, with no high road, with no cage, each by name; and through the pipeline', () => {
  const st = build(1, 'normal');
  caged(st);
  const ok = layFlood(st, W2_FLOOD, false).flood!;
  const tight: FloodRow = { ...W2_FLOOD, close: { normal: ok.tailOff + ok.spare - 3, easy: W2_FLOOD.close.easy } };
  assert.match(layFlood(st, tight, false).problems.join('; '), /no tier beats it \(3 s short\)/, 'RED: the close 3 s early');
  const bare = build(1, 'normal', false);
  caged(bare);
  assert.match(layFlood(bare, W2_FLOOD, false).problems.join('; '), /no high road over the low road/, 'RED: no high road');
  assert.match(layFlood(build(1, 'normal'), W2_FLOOD, false).problems.join('; '), /no cage to start its clock/, 'RED: no cage');
  // RED, planted on the old brick (W 60 flush against the porch: no way down onto the low road) and on the old toy's numbers (W 60, gap 60:
  // every tier lands past W's lip and walks off into the gap), each by name (flood.ts forkFaults)
  const flush = build(1, 'normal', true, undefined, { w: 60, gap: 0 });
  caged(flush);
  assert.match(layFlood(flush, W2_FLOOD, false).problems.join('; '), /no way down onto the low road: the gap after it is 0 px/, 'RED: the flush brick');
  const narrow = build(1, 'normal', true, undefined, { w: 60, gap: 60 });
  caged(narrow);
  assert.match(layFlood(narrow, W2_FLOOD, false).problems.join('; '), /the adult lands 86 px past its face .* walks off into the 60 px gap/, 'RED: W 60 + gap 60');
  // (through the pipeline: a brief that names the flood lays it, and refuses this base's caged-less roll by name (designed cages are
  //  main's 2-3 piece, pipeline.ts 'objective' sockets allowing 'cage'; not on this base: REPORT Pushback 1))
  const piped = build(1, 'normal', true, W2_FLOOD);
  assert.match(piped.gen2.errors.join('; '), /flood: no cage to start its clock/);
});
