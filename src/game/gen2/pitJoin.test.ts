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
import { earthHoles, joinPitFloors, pitFloorJoin, pitHoleFill, PIT_JOIN } from './pipeline.ts';
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

/** gen2Pits.test's "slot under a bank" rule (INT-9), word for word: a piece 40 px or taller whose side meets a floor's end, its foot 0-48 px
 *  over that floor's top (a stair stone laid flush against a floor's end reads as drawn past its ground's lip) */
const slots = (plats: readonly Platform[]): string[] => {
  const solid = plats.filter((p) => p.type === 'solid' && !p.lift);
  const out: string[] = [];
  for (const p of solid) for (const q of solid) {
    if (q === p || q.height < 40) continue;
    const touch = Math.abs(q.x + q.width - p.x) < 3 || Math.abs(q.x - (p.x + p.width)) < 3;
    const foot = q.y + q.height;
    if (touch && q.y < p.y - 40 && foot <= p.y + 3 && foot >= p.y - 48) out.push(`bank at x ${q.x} ends ${p.y - foot} px over the floor at x ${p.x}`);
  }
  return out;
};

// INT-10b (11-15): 1-6 raw seed 1 Normal, the creaky landing at x 28090 (gen2Pits.test:61 RED, both settings' list builds): the earlier
// pit's floor, the join under the creaky limb and the later pit's floor lay as THREE pieces at one height, and the later pit's stair (its
// way back to the limb) stood on its own floor flush with the join's end, a floor end 0 px under a stair stone. Joined floors are ONE
// piece now: no floor end is left inside a joined run, so a stair always starts inside its floor. Every join kind, on toys cut from the
// built stages: same height (1-6 Normal), a step (1-1, 23-47 px), a chain of three, and a floor reaching a bank (1-6 Easy, 1-8 Normal).
test('joined soft-pit floors are ONE piece: no floor end inside a joined run, a stair starts inside its floor, the wall still stands', () => {
  // (1-6 seed 1 Normal at x 27384-28939, as built before the fix)
  const before = P(10, 27124, 893, 260, 480), A = P(1, 27384, 1133, 549, 120), limb = P(2, 27933, 893, 157, 24, 'fragile');
  const B = P(3, 28090, 1133, 569, 120), after = P(4, 28659, 893, 280, 416);
  const stair = [P(5, 28090, 1073, 300, 60), P(6, 28090, 1013, 200, 120), P(7, 28090, 953, 100, 180)];
  const plats = [before, A, limb, B, ...stair, after];
  const { gone, walls } = joinPitFloors(plats, [A, B], (x) => (Math.abs(x - 27933) <= 4 ? 893 : undefined), 60, 120);
  assert.deepEqual(gone.map((p) => p.id), [3], 'the later floor is taken into the earlier one');
  assert.ok(!plats.includes(B), 'and out of the stage');
  assert.deepEqual([A.x, A.y, A.width, A.height], [27384, 1133, 1275, 120], 'one floor from the earlier pit\'s start to the later pit\'s end');
  assert.equal(plats.filter((p) => p.type === 'solid' && p.y === 1133).length, 1, 'one piece at the floor\'s height, no join piece');
  assert.deepEqual(slots(plats), [], 'no stair stands flush with a floor end');
  assert.equal(walls.length, 1, 'the wall at the earlier floor\'s old end (R-165.265)');
  assert.deepEqual([walls[0].x, walls[0].w, walls[0].y + walls[0].h], [27933, 24, 1133], 'standing on the floor under the limb\'s near end');

  // (a step: 1-1's joins, the later floor 45 px under the earlier; the deeper floor reaches under the perch to the shallower one's end, and
  //  the shallower one, a bank beside it now, reaches down past it (INT-9's rule for every bank))
  const a2 = P(1, 0, 669, 300, 120), limb2 = P(2, 300, 430, 160, 24, 'fragile'), b2 = P(3, 460, 714, 300, 120);
  const st2 = [P(5, 460, 654, 200, 60), P(6, 460, 594, 100, 120)];
  const plats2 = [a2, limb2, b2, ...st2];
  const r2 = joinPitFloors(plats2, [a2, b2], () => undefined, 60, 120);
  assert.deepEqual(r2.gone, [], 'two heights: two pieces');
  assert.deepEqual([b2.x, b2.width], [300, 460], 'the deeper (later) floor reaches the shallower one\'s end');
  assert.equal(a2.y + a2.height, 714 + 120, 'the shallower floor reaches down to the deeper one\'s foot');
  assert.deepEqual(slots(plats2), []);
  // (the earlier floor the deeper: it reaches the later one's start; the later one's stair stands on its own floor, its face the step's)
  const a3 = P(1, 0, 714, 300, 120), b3 = P(3, 460, 669, 300, 120);
  const plats3 = [a3, P(2, 300, 430, 160, 24, 'fragile'), b3];
  joinPitFloors(plats3, [a3, b3], () => undefined, 60, 120);
  assert.deepEqual([a3.x, a3.width, b3.x, b3.width, b3.y + b3.height], [0, 460, 460, 300, 834]);

  // (a chain: three pits a perch apart at one height lay one floor)
  const c = [P(1, 0, 900, 300, 120), P(2, 450, 900, 300, 120), P(3, 900, 900, 300, 120)];
  const plats4 = [...c, P(4, 300, 700, 150, 24, 'fragile'), P(5, 750, 700, 150, 24, 'fragile')];
  const r4 = joinPitFloors(plats4, [c[2], c[0], c[1]], () => undefined, 60, 120);
  assert.deepEqual(r4.gone.map((p) => p.id).sort(), [2, 3]);
  assert.deepEqual([c[0].x, c[0].width], [0, 1200], 'one floor under all three');

  // (a floor whose lip has a perch over a hole up to the next bank: the floor reaches the bank as one piece, the bank deepened past it;
  //  the pit's far stair stands inside it)
  const f = P(1, 23383, 1131, 547, 120), perch = P(5, 23930, 891, 134, 24), bank = P(6, 24064, 836, 240, 300), b0 = P(7, 23123, 891, 260, 418);
  const far = [P(8, 23830, 1071, 100, 60)];
  const plats5 = [b0, f, perch, bank, ...far];
  const r5 = joinPitFloors(plats5, [f], () => undefined, 60, 120);
  assert.deepEqual(r5.gone, []);
  assert.deepEqual([f.x, f.width], [23383, 681], 'the floor reaches the bank');
  assert.equal(bank.y + bank.height, 1131 + 120, 'the bank reaches down past it');
  assert.equal(plats5.length, 5, 'no fill piece');
  assert.deepEqual(slots(plats5), []);
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
