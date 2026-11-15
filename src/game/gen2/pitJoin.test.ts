/**
 * Soft pits laid end to end with only a perch between them share ONE floor (pipeline.ts pitFloorJoin; ENG-16H 11-14, R-165.246, rule 22:
 * a shared fault fixed in the lay for every stage). Under 1-6's creaky landing (a creaky limb with a liana pit either side) each pit's
 * floor ended at its own lip, so a column the limb's width with no earth at any depth lay between two soft floors: a drop off the limb fell
 * through it (no fall record named it), and the second pit's stair stood against that air, its stone drawn over nothing. INT-9's settle
 * (R-165.226) refused that stone, so on the merged engine every 1-6 roll threw "the pool is spent" (libstage 0/24 both settings).
 * And past a pit's lip a perch can float over a hole up to the next BANK (1-6's FAR boughs in the snake on your vine and the gorge): INT-9's
 * per-gap ruler (w1Pits.ts) refused every roll on drop.untyped / floor.unmarked; the floor reaches that bank, which is deepened past it
 * (pitHoleFill). Planted: python3 reference/qa-reports/ENG-16H/planted-faults.py (the fill not laid: the 1-6 case goes RED).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { earthHoles, pitFloorJoin, pitHoleFill, PIT_JOIN } from './pipeline.ts';
import { buildStage } from '../../../tools/engine/libstage.ts';
import type { Platform } from '../types.ts';

const P = (id: number, x: number, y: number, width: number, height: number, type: Platform['type'] = 'solid'): Platform =>
  ({ id, x, y, width, height, type } as Platform);

test('the join: two soft floors either side of a perch with no earth under it are joined at the deeper floor; earth, width or depth keep them apart', () => {
  const a = P(1, 0, 1133, 549, 120), b = P(2, 706, 1133, 569, 120);
  const limb = P(3, 549, 893, 157, 24, 'fragile');
  assert.deepEqual(pitFloorJoin(a, b, [a, b, limb], 60), { x: 549, y: 1133, w: 157 });
  assert.deepEqual(pitFloorJoin(b, a, [a, b, limb], 60), { x: 549, y: 1133, w: 157 }, 'either order');
  // (a bough is no earth; a bank between them is: the two pits are two pits)
  assert.deepEqual(pitFloorJoin(a, b, [a, b, P(4, 560, 893, 140, 24)], 60), { x: 549, y: 1133, w: 157 });
  assert.equal(pitFloorJoin(a, b, [a, b, P(5, 549, 893, 157, 416)], 60), null);
  // (the deeper floor's top: the shallower one's end is a step he hops; over a hop apart they are not joined)
  assert.deepEqual(pitFloorJoin(a, P(6, 706, 1093, 569, 120), [a, limb], 60), { x: 549, y: 1133, w: 157 });
  assert.equal(pitFloorJoin(a, P(7, 706, 1033, 569, 120), [a, limb], 60), null);
  assert.equal(pitFloorJoin(a, P(8, 549 + PIT_JOIN.px + 1, 1133, 300, 120), [a], 60), null, 'wider than any perch between two lianas');
  assert.equal(pitFloorJoin(a, P(9, 549, 1133, 300, 120), [a], 60), null, 'already touching');
});

test('the fill to a bank: a floor whose lip has a perch over a hole up to the next bank reaches that bank; a pit\'s own stair is no bank', () => {
  const floor = P(1, 23383, 1131, 547, 120);
  const stair = [P(2, 23383, 1071, 300, 60), P(3, 23383, 1011, 200, 120), P(4, 23383, 951, 100, 180)];
  const perch = P(5, 23930, 891, 134, 24), bank = P(6, 24064, 836, 240, 473), before = P(7, 23123, 891, 260, 418);
  const plats = [before, floor, ...stair, perch, bank];
  const floors = new Set([floor]);
  const j = pitHoleFill(floor, 1, plats, floors, 60);
  assert.ok(j && j.x === 23930 && j.w === 134 && j.y === 1131 && j.deepen === bank, JSON.stringify(j));
  // (its left: the take-off bank reaches down past the floor at the edge, and the stair standing on it is no bank: no hole there)
  assert.equal(pitHoleFill(floor, -1, plats, floors, 60), null);
  assert.equal(pitHoleFill(floor, 1, [floor, P(8, 23930 + PIT_JOIN.px + 1, 836, 240, 473)], floors, 60), null, 'too far: not a perch\'s hole');
});

test('1-6, every roll 1-6 on both settings: it builds, and no hole in the earth lies between two soft falls a perch apart, or beside one', () => {
  for (const d of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 6; seed++) {
      const st = buildStage('1-6', seed, d) as { platforms: Platform[]; gen2: { falls: Array<{ x0: number; x1: number; kind: string }> } };
      const soft = st.gen2.falls.filter((f) => f.kind === 'soft').sort((p, q) => p.x0 - q.x0);
      const holes = earthHoles(st.platforms);
      for (let i = 1; i < soft.length; i++) {
        const [x0, x1] = [soft[i - 1].x1, soft[i].x0];
        if (x1 - x0 < 2 || x1 - x0 > PIT_JOIN.px) continue;
        const h = holes.find((q) => q.x0 >= x0 - 2 && q.x1 <= x1 + 2);
        assert.equal(h, undefined, `1-6 ${d} seed ${seed}: a hole in the earth at ${h?.x0}-${h?.x1}, between the soft pits ${soft[i - 1].x0}-${x0} and ${x1}-${soft[i].x1}`);
      }
      // (and none beside a soft pit's lip, under a perch, within PIT_JOIN: the fill to the next bank)
      for (const f of soft) {
        const h = holes.find((q) => q.x1 - q.x0 <= PIT_JOIN.px && (Math.abs(q.x0 - f.x1) <= 2 || Math.abs(q.x1 - f.x0) <= 2));
        assert.equal(h, undefined, `1-6 ${d} seed ${seed}: a hole in the earth at ${h?.x0}-${h?.x1} beside the soft pit ${f.x0}-${f.x1}`);
      }
    }
  }
});
