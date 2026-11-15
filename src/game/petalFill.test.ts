/**
 * The petal fill lays as main lays it; the DOOR keeps to the walked and landed path (the lead's ruling INT-10d 11-15, restating ENG-16E's
 * fill toys, R-165.246; petals.ts fillGaps, markWalked, fallSpans; goals.ts goalCounts). BUILD-16c/16d, 1-6: where a creaky limb or a run
 * of lianas left a stretch over FILL_GAP, the fill laid its pairs on the soft pit's floor, and the tier bots met the sealed door for them.
 * ENG-16E kept the fill out of the pit; placing by the walked path stripped 13 stages, so now the fill may lay there and the door never
 * counts such a petal. Toy stages, no stage id: each RED with the door's exclusion switched off (`walked` ignored, the old count).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Collectible, Platform, Vine } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { FILL_GAP, fallSpans, fillGaps, inFall, markWalked, offPath } from './petals.ts';
import { goalCounts } from './goals.ts';

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

/** the petals the door counts on the stage, and what it would count with the walked exclusion switched off (the plant) */
const door = (st: GeneratedStage) => goalCounts(st as never).petals;
const doorOff = (st: GeneratedStage) => goalCounts({ ...st, collectibles: st.collectibles.map((c) => ({ ...c, walked: undefined })) } as never).petals;
const petals = (st: GeneratedStage) => st.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf');

test('a fill petal on a soft pit\'s floor is never one the door counts: a creaky limb between two liana gaps, the pit floor the only wide piece (RED: exclusion off)', () => {
  // (the creaky landing: the bank, a liana, a creaky limb, a liana, the bank; the moss floor 220 px down under all of it)
  const st = toy([solid(2, 300, 820, 1400, 40), solid(3, 860, 600, 180, 24, { type: 'fragile' })], { falls: [{ x0: 300, x1: 860, y: 600 }, { x0: 1040, x1: 1700, y: 600 }], vines: [liana(1, 560), liana(2, 1260)] });
  assert.ok(1900 - 100 > FILL_GAP, 'the toy stretch is not long enough to be filled: the test proves nothing');
  assert.ok(offPath(fallSpans(st), st.platforms[1]), 'the pit floor is not read as off the path');
  fillGaps(st);
  markWalked(st);
  const pit = petals(st).filter((c) => inFall(fallSpans(st), c) || under(st, c)?.id === 2);
  assert.ok(pit.length > 0, 'the fill laid nothing in the pit: the toy proves nothing (main\'s fill lays its pair on the floor)');
  assert.ok(pit.every((c) => c.walked === false), 'a pit petal is marked off the walked path');
  assert.equal(door(st), petals(st).filter((c) => c.walked !== false && under(st, c)?.type !== 'fragile').length, 'the door counts only the walked petals');
  assert.ok(doorOff(st) > door(st), 'the plant: with the exclusion off the door would ask for the pit petals');
});

test('the fill still lays on the walked path: a perch level with the banks in the same stretch gets the trail, and the door counts it', () => {
  const st = toy([solid(2, 300, 820, 1400, 40), solid(4, 1100, 600, 300, 24)], { falls: [{ x0: 300, x1: 1100, y: 600 }, { x0: 1400, x1: 1700, y: 600 }] });
  const added = fillGaps(st);
  markWalked(st);
  assert.ok(added.length >= 2, `no trail at all (${added.length})`);
  // (on the perch, or on the jump's arc from it to the far bank: above the lips, counted; in the pit, not)
  for (const c of added) {
    const onPath = !inFall(fallSpans(st), c) && c.y < 600 && (under(st, c)?.id === 4 || (c.x > 1400 && c.x < 1700));
    if (onPath) assert.notEqual(c.walked, false, `a fill petal on the path at ${c.x},${c.y} is not counted`);
    else assert.equal(c.walked, false, `a fill petal off the path at ${c.x},${c.y} is counted`);
  }
});

test('a fill petal over a hurt floor (the thorn bed) is never counted, with no record of the stage\'s falls (RED: exclusion off)', () => {
  const st = toy([solid(2, 300, 820, 1400, 40, { pit: 'hurt' })]);
  fillGaps(st);
  markWalked(st);
  const thorns = petals(st).filter((c) => under(st, c)?.pit === 'hurt' && under(st, c)!.y - c.y <= 60);
  assert.ok(thorns.length > 0, 'the fill laid nothing on the thorns: the toy proves nothing');
  assert.ok(thorns.every((c) => c.walked === false), 'a thorn-bed petal is marked off the walked path');
  assert.ok(doorOff(st) > door(st), 'the plant: with the exclusion off the door would ask for them');
});

test('a heart-fall zone counts as a fall: below its lower lip is the pit (gen2 heartFalls, any world)', () => {
  const st = toy([solid(2, 300, 820, 1400, 40)], { heartFalls: [{ x0: 300, x1: 1700, soft: true }] });
  const spans = fallSpans(st);
  assert.deepEqual(spans.map((f) => [f.x0, f.x1, f.lip]), [[300, 1700, 600]]);
  assert.ok(inFall(spans, { x: 900, y: 780 }) && !inFall(spans, { x: 900, y: 560 }) && !inFall(spans, { x: 200, y: 780 }));
  fillGaps(st);
  markWalked(st);
  assert.deepEqual(petals(st).filter((c) => under(st, c)?.id === 2 && c.walked !== false).map((c) => `${c.x},${c.y}`), [], 'a counted petal on the zone\'s floor');
});
