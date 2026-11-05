/**
 * The water rule W3 (waterRule.ts): calm and deadly water never share one screen. The measure on fixtures (a pool, an open column, a
 * floor that closes it, a river, a teaching river), the screen tied to the engine's own view, the gate's two kinds of miss
 * (tools/validate/watercheck.ts missesOf), and gen2's placement (pipeline.ts layDry) on 6-7, the only stage with calm water: all 16
 * shipped rolls, Normal and Easy, keep every deadly column more than a screen from the well, on the plan that was curated, and the
 * water left is still deadly water (the fix moves the water away from the well; it does not take World 6's water out).
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_VIEW_H } from './engine.ts';
import { calmSpans, distTo, openColumns, VIEW_H, W3_SCREEN, W3_SPEC_PX, w3Misses, WIDEST_PHONE } from './waterRule.ts';
import { missesOf } from '../../tools/validate/watercheck.ts';
import { GEN2_SEEDS } from './gen2/seeds.ts';
import { buildGen2Stage, checkStage } from './gen2/pipeline.ts';
import { resolveStage } from '../../tools/gen2/curate.ts';
import type { Platform } from './types.ts';

const solid = (id: number, x: number, y: number, width: number, height = 90): Platform => ({ id, x, y, width, height, type: 'solid' });
/** a bank, a 330 px well (the raft's floor, id 2) and a bank, then a gap `gap` px past the well, then a bank */
function fixture(gap: number, opt: { floor?: boolean; river?: { safe?: boolean } } = {}) {
  const platforms = [solid(1, 0, 580, 1000), solid(2, 1000, 660, 330), solid(3, 1330, 580, gap), solid(4, 1330 + gap + 400, 580, 2000)];
  if (opt.floor) platforms.push(solid(5, 1330 + gap, 700, 400));
  const rooms = [{ pieces: [{ kind: 'lever', id: 'w' }, { kind: 'lift', id: 'raft', at: { on: 2, at: 0.5 }, water: 72 }] }];
  const rivers = opt.river ? [{ x0: 1330 + gap, x1: 1730 + gap, ...(opt.river.safe ? { safe: { backX: 0, backY: 0 } } : {}) }] : undefined;
  return { platforms, waterY: opt.river ? undefined : 790, rivers, kit: { rooms }, config: { levelWidth: 6000 } };
}

test('W3: the screen is the widest sideways view the engine shows, and over the spec\'s 844', () => {
  assert.equal(VIEW_H, WORLD_VIEW_H, 'waterRule.ts VIEW_H is the engine\'s WORLD_VIEW_H');
  assert.equal(W3_SCREEN, Math.ceil((WORLD_VIEW_H * WIDEST_PHONE.w) / WIDEST_PHONE.h));
  assert.equal(W3_SCREEN, 1203);
  assert.ok(W3_SCREEN > W3_SPEC_PX);
  // (an 844 x 390 phone sideways shows 1,169 world px: the spec's 844 is the CSS width, not the world's)
  assert.ok(Math.round((844 * WORLD_VIEW_H) / 390) > W3_SPEC_PX && Math.round((844 * WORLD_VIEW_H) / 390) <= W3_SCREEN);
});

test('W3: the measure on fixtures: an open column within a screen of a calm pool is a miss, a floor or a teaching river is not', () => {
  assert.deepEqual(calmSpans(fixture(500).kit.rooms, fixture(500).platforms), [{ x0: 1000, x1: 1330 }]);
  assert.deepEqual(openColumns([solid(1, 0, 0, 100), solid(2, 130, 0, 100)], 300), [110, 120, 240, 250, 260, 270, 280, 290, 300]);
  assert.equal(distTo(900, { x0: 1000, x1: 1330 }), 100);
  assert.equal(distTo(1100, { x0: 1000, x1: 1330 }), 0);
  const near = w3Misses(fixture(500));
  assert.equal(near.length, 1);
  assert.equal(near[0].what, 'open column');
  assert.ok(near[0].dist > 500 && near[0].dist <= 510, `the gap starts 500 px past the pool (${near[0].dist})`);
  assert.deepEqual(w3Misses(fixture(500, { floor: true })), [], 'a floor under the gap: nothing deadly shows');
  assert.deepEqual(w3Misses(fixture(W3_SCREEN + 20)), [], 'more than a screen away');
  assert.equal(w3Misses(fixture(W3_SCREEN - 20)).length, 1, 'just under a screen away');
  assert.equal(w3Misses(fixture(500, { river: {} }))[0]?.what, 'river', 'a deadly river near the pool');
  assert.deepEqual(w3Misses(fixture(500, { river: { safe: true } })), [], 'a teaching river is not deadly');
  // (no calm pool: no pair, whatever the water)
  assert.deepEqual(w3Misses({ ...fixture(500), kit: { rooms: [] } }), []);
});

test("the water gate's two kinds: deadly water near a calm pool, and water drawn calm that costs a life", () => {
  assert.deepEqual(missesOf(fixture(500)).map((m) => m.kind), ['near']);
  // (1-1's kind of creek: a zone drawn with the calm water's art over an open column; with a floor under it, or a teaching pool, it is fine)
  const creek = { ...fixture(500), kit: null, proto: { water: [{ x0: 1840, x1: 2220, y: 640 }] } };
  assert.deepEqual(missesOf(creek).map((m) => m.kind), ['calm-drawn']);
  assert.deepEqual(missesOf({ ...creek, platforms: [...creek.platforms, solid(9, 1830, 700, 400)] }), []);
  assert.deepEqual(missesOf({ ...creek, safeWater: [{ x0: 1820, x1: 2240 }] }), []);
});

test("6-7's shipped rolls, Normal and Easy: no deadly water within a screen of the well, on the curated plan, and World 6's water kept", async () => {
  const ent = GEN2_SEEDS['6-7'];
  const stage = await resolveStage('6-7', ent.kit);
  for (const s of ent.seeds) {
    for (const difficulty of ['normal', 'easy'] as const) {
      const st = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: s.seed, difficulty, recent: ent.recent });
      const what = `6-7 seed ${s.seed} (${difficulty})`;
      const pools = calmSpans(st.kit?.rooms, st.platforms);
      assert.equal(pools.length, 1, `${what}: the well`);
      assert.deepEqual(w3Misses(st), [], `${what}: deadly water within a screen of the well`);
      assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], what);
      assert.equal(st.gen2.plan.map((p) => `${p.template}${p.mirrored ? '~' : ''}`).join(' '), s.sections, `${what}: the plan changed`);
      // (the deadly water is moved away from the well, not taken out: the stage keeps its creeks past the screen)
      const water = (st.gen2.falls ?? []).filter((f) => f.kind === 'water');
      assert.ok(water.length >= 10, `${what}: ${water.length} water gaps left`);
      for (const f of water) assert.ok(Math.min(distTo(f.x0, pools[0]), distTo(f.x1, pools[0])) > W3_SCREEN, `${what}: water ${f.x0}-${f.x1}`);
    }
  }
});
