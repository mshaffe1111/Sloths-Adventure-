/**
 * R-165.265 (ENG-PETAL 11-14, every stage): where the lay joins two soft pits' floors (pitFloorJoin, ENG-16H), a miss in the earlier pit
 * must never walk on under the perch to the later pit's stair and its liana: a wall stands at the earlier floor's end, its face more than a
 * double jump and the engine's hoist over the floor, never over the lip. Planted: python3 reference/qa-reports/ENG-PETAL/planted.py wall.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { pitJoinWall, PIT_JOIN } from './pipeline.ts';
import { buildStage } from '../../../tools/engine/libstage.ts';
import { DOUBLE_RISE, FORGIVE } from '../physics.ts';
import type { Platform } from '../types.ts';

const CLIMB = DOUBLE_RISE + Math.max(FORGIVE.normal.mantle, FORGIVE.easy.mantle);

test('the wall: at the earlier floor\'s end, a face he cannot climb, never over the lip; none in a floor too shallow for one', () => {
  const w = pitJoinWall({ x: 1000, y: 1091, w: 150 }, 866)!;
  assert.ok(w, 'a wall where two deep floors are joined');
  assert.equal(w.x, 1000, 'at the earlier floor\'s end');
  assert.ok(w.y >= 866, 'its top never over the lip');
  assert.ok(1091 - w.y > CLIMB, `its face (${1091 - w.y} px) more than a double jump and the hoist (${Math.round(CLIMB)})`);
  assert.equal(pitJoinWall({ x: 1000, y: 1000, w: 150 }, 866), null, 'a floor too shallow under the lip: no wall');
  assert.equal(pitJoinWall({ x: 1000, y: 1091, w: 150 }, undefined), null, 'no fall record: no wall');
});

test('1-6 rolls 1-4, both settings: every joined pair of soft pits has its wall, so the earlier pit\'s only way up is its own stair', () => {
  let joins = 0;
  for (const d of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 4; seed++) {
      const st = buildStage('1-6', seed, d) as { platforms: Platform[]; gen2: { falls?: Array<{ x0: number; x1: number; y: number; kind: string }> } };
      const soft = (st.gen2.falls ?? []).filter((f) => f.kind === 'soft').sort((a, b) => a.x0 - b.x0);
      const out: string[] = [];
      for (let i = 1; i < soft.length; i++) {
        const a = soft[i - 1], b = soft[i];
        if (b.x0 - a.x1 > PIT_JOIN.px || b.x0 < a.x1) continue;
        // (the joined floor: one solid under the lip reaching from the earlier gap's end to the later's start)
        const join = st.platforms.find((p) => p.type === 'solid' && p.y > a.y + 60 && Math.abs(p.x - a.x1) <= 4 && Math.abs(p.x + p.width - b.x0) <= 4);
        if (!join) continue;
        joins++;
        const wall = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x - a.x1) <= 4 && p.y >= a.y && join.y - p.y > CLIMB && p.y + p.height >= join.y);
        if (!wall) out.push(`${d} seed ${seed}: the floor joined under ${Math.round(a.x1)}..${Math.round(b.x0)} (y ${join.y}) has no wall`);
      }
      assert.deepEqual(out, [], `1-6 ${d} seed ${seed}`);
    }
  }
  assert.ok(joins > 0, 'the rolls hold joined floors (the creaky landing)');
});
