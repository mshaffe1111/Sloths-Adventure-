/**
 * The shared petal fill keeps to the walked and landed path (ENG-16E, R-165.246; petals.ts fillGaps, fallSpans, offPath). BUILD-16c/16d,
 * 1-6: where a creaky limb (which holds no petal) or a run of lianas left a stretch over FILL_GAP, the fill laid its pairs on the soft pit's
 * floor, and the tier bots met the sealed door for them. Toy stages, no stage id: each RED with the off-path guard taken out of fillGaps.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Collectible, Platform, Vine } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { FILL_GAP, fallSpans, fillGaps, inFall, offPath } from './petals.ts';

const solid = (id: number, x: number, y: number, width: number, height: number, o: Partial<Platform> = {}): Platform => ({ id, x, y, width, height, type: 'solid', ...o });
const liana = (id: number, x: number): Vine => ({ id, x, topY: 180, bottomY: 600, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true });

/** a toy stage on the ground at y 600: the start bank, whatever is between, the far bank and the shrine; one petal at the start */
function toy(between: Platform[], o: { falls?: Array<{ x0: number; x1: number; y: number }>; heartFalls?: GeneratedStage['heartFalls']; vines?: Vine[] } = {}): GeneratedStage {
  const platforms = [solid(1, 0, 600, 300, 400), ...between, solid(9, 1700, 600, 300, 400)];
  const collectibles: Collectible[] = [{ id: 1, type: 'exit_totem', x: 1900, y: 560, collected: false, bobPhase: 0 } as Collectible];
  return {
    config: { id: 'toy', worldIndex: 1, miniIndex: 1, objectiveType: 'reach_exit' },
    platforms, vines: o.vines ?? [], ropes: [], collectibles, enemies: [], trees: [], spawnX: 100, spawnY: 600, exitTotemX: 1900, exitTotemY: 600,
    checkpoints: [], ...(o.heartFalls ? { heartFalls: o.heartFalls } : {}), ...(o.falls ? { gen2: { falls: o.falls.map((f) => ({ ...f, kind: 'soft' })) } } : {}),
  } as unknown as GeneratedStage;
}
const under = (st: GeneratedStage, c: Collectible) => st.platforms.filter((p) => c.x >= p.x && c.x <= p.x + p.width && p.y > c.y).sort((a, b) => a.y - b.y)[0];

test('a soft pit\'s floor never holds a fill petal: a creaky limb between two liana gaps, the pit floor the only wide piece (RED: its pair)', () => {
  // (the creaky landing: the bank, a liana, a creaky limb, a liana, the bank; the moss floor 220 px down under all of it)
  const st = toy([solid(2, 300, 820, 1400, 40), solid(3, 860, 600, 180, 24, { type: 'fragile' })], { falls: [{ x0: 300, x1: 860, y: 600 }, { x0: 1040, x1: 1700, y: 600 }], vines: [liana(1, 560), liana(2, 1260)] });
  assert.ok(1900 - 100 > FILL_GAP, 'the toy stretch is not long enough to be filled: the test proves nothing');
  assert.ok(offPath(fallSpans(st), st.platforms[1]), 'the pit floor is not read as off the path');
  const added = fillGaps(st);
  const bad = added.filter((c) => inFall(fallSpans(st), c) || under(st, c)?.id === 2 || under(st, c)?.type === 'fragile');
  assert.deepEqual(bad.map((c) => `${c.x},${c.y} on ${under(st, c)?.id}`), [], 'fill petals in the pit or on the creaky limb');
});

test('the fill still lays on the walked path: a perch level with the banks in the same stretch gets the trail, the pit floor none', () => {
  const st = toy([solid(2, 300, 820, 1400, 40), solid(4, 1100, 600, 300, 24)], { falls: [{ x0: 300, x1: 1100, y: 600 }, { x0: 1400, x1: 1700, y: 600 }] });
  const added = fillGaps(st);
  assert.ok(added.length >= 2, `no trail at all (${added.length}): the fix must move the petals to the path, not drop the stretch`);
  // (on the perch, or on the jump's arc from it to the far bank: above the lips, never down in the pit)
  for (const c of added) assert.ok(!inFall(fallSpans(st), c) && c.y < 600 && (under(st, c)?.id === 4 || (c.x > 1400 && c.x < 1700)), `a fill petal at ${c.x},${c.y} is off the path`);
});

test('a hurt floor (the thorn bed) never holds a fill petal, with no record of the stage\'s falls (RED: its pair)', () => {
  const st = toy([solid(2, 300, 820, 1400, 40, { pit: 'hurt' })]);
  const added = fillGaps(st);
  assert.deepEqual(added.filter((c) => under(st, c)?.pit === 'hurt').map((c) => `${c.x},${c.y}`), [], 'fill petals over the thorns');
});

test('a jump off or onto a creaky limb carries no fill petal on its arc (RED: the arc over it)', () => {
  // (the limb at bank height, 250 px short of the far bank: a jump edge the fill would line with two petals)
  const st = toy([solid(3, 1150, 600, 300, 24, { type: 'fragile' }), solid(2, 300, 900, 1400, 30)], { falls: [{ x0: 300, x1: 1150, y: 600 }, { x0: 1450, x1: 1700, y: 600 }] });
  const added = fillGaps(st);
  assert.deepEqual(added.filter((c) => c.x > 1450 && c.x < 1700).map((c) => `${c.x},${c.y}`), [], 'fill petals on the arc off the creaky limb');
});

test('a heart-fall zone counts as a fall: below its lower lip is the pit (gen2 heartFalls, any world)', () => {
  const st = toy([solid(2, 300, 820, 1400, 40)], { heartFalls: [{ x0: 300, x1: 1700, soft: true }] });
  const spans = fallSpans(st);
  assert.deepEqual(spans.map((f) => [f.x0, f.x1, f.lip]), [[300, 1700, 600]]);
  assert.ok(inFall(spans, { x: 900, y: 780 }) && !inFall(spans, { x: 900, y: 560 }) && !inFall(spans, { x: 200, y: 780 }));
  assert.deepEqual(fillGaps(st).filter((c) => under(st, c)?.id === 2).map((c) => `${c.x},${c.y}`), [], 'fill petals on the zone\'s floor');
});
