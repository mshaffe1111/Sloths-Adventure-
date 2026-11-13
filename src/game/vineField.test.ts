/**
 * The vine field's moves (vineField.ts, R-165.177; Matt's rule), on toy pieces: each move proven, and each check planted against the
 * piece without the move (a single climb, no `field`), so a lost move turns it red.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Vine } from './types.ts';
import { CLIMB_SPEED } from './vinePair.ts';
import {
  FIELD_FEEL, clusterAbove, fallCluster, feelOf, floorUnder, handsSpan, handsSpeed, handsX, keepHands, neighbour, pushClusters, stepHands,
  type Hands, type VineCluster,
} from './vineField.ts';

/** a toy climb; `field` null: a single climb (no field) */
const vine = (id: number, x: number, top = 0, bottom = 450, field: Vine['field'] | null = true): Vine =>
  ({ id, x, topY: top, bottomY: bottom, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', field: field ?? undefined });
const row = () => [vine(1, 100), vine(2, 180), vine(3, 260), vine(4, 370, 0, 200)];

test("Matt's rule: one hand, a push toward a vine in reach takes it in the other hand; again lets go of the old", () => {
  const V = row();
  let h: Hands = { a: V[0], b: null };
  const two = stepHands(h, 1, 300, V);
  assert.ok(two && two.a === V[0] && two.b === V[1], 'a push right: both hands, the old and the new');
  assert.equal(handsX(two!), 140, 'he hangs between them');
  const one = stepHands(two!, 1, 300, V);
  assert.ok(one && one.a === V[1] && one.b === null, 'again right: lets go of the old, one hand on the new');
  assert.equal(handsX(one!), 180);
  // back the other way on two hands keeps the left one
  h = stepHands(one!, -1, 300, V)!;
  assert.ok(h.a === V[1] && h.b === V[0]);
  assert.equal(stepHands(h, -1, 300, V)!.a, V[0], 'a push left on two hands keeps the left vine');
  assert.equal(stepHands(h, 1, 300, V)!.a, V[1], 'a push right on two hands keeps the right vine');
});

test('a push with no vine in reach, or none at his height, or a single climb, takes nothing (a plain push: held, it hops off)', () => {
  const V = row();
  assert.equal(stepHands({ a: V[0], b: null }, -1, 300, V), null, 'nothing to the left');
  assert.equal(stepHands({ a: V[2], b: null }, 1, 150, V), null, '110 px over: out of reach (90), he must jump');
  assert.equal(neighbour(V[2], 1, 150, V, null), null);
  const near = [vine(1, 100), vine(2, 180, 0, 200)];
  assert.equal(stepHands({ a: near[0], b: null }, 1, 300, near), null, 'the neighbour ends above his height');
  assert.ok(stepHands({ a: near[0], b: null }, 1, 150, near), 'in its span it is taken');
  // planted: the same vines as single climbs (no field) never step
  const plain = [vine(1, 100, 0, 450, null), vine(2, 180, 0, 450, null)];
  assert.equal(stepHands({ a: plain[0], b: null }, 1, 300, plain), null, 'a single climb is unchanged: no second hand');
  assert.equal(FIELD_FEEL.reach, 90);
});

test('speeds: one hand up 220 px/s and a 2x slide down; two hands up 1.6x and down slow; a single climb 220 both ways', () => {
  const [a, b] = row();
  assert.equal(handsSpeed({ a, b: null }, true, false), CLIMB_SPEED, 'one hand up: unchanged');
  assert.equal(handsSpeed({ a, b: null }, false, false), CLIMB_SPEED * 2, 'one hand down: the slide');
  assert.equal(handsSpeed({ a, b }, true, false), CLIMB_SPEED * 1.6, "two hands up: Matt's 1.6x");
  assert.equal(handsSpeed({ a, b }, false, false), CLIMB_SPEED * 0.5, 'two hands down: slow');
  const plain = vine(9, 0, 0, 450, null);
  assert.equal(handsSpeed({ a: plain, b: null }, true, false), CLIMB_SPEED);
  assert.equal(handsSpeed({ a: plain, b: null }, false, false), CLIMB_SPEED, 'planted: a single climb never slides');
  // every number is the piece's own
  const own = vine(5, 0, 0, 450, { slide: 1.6, twoUp: 1.3 });
  assert.equal(feelOf(own).slide, 1.6);
  assert.equal(handsSpeed({ a: own, b: null }, false, false), CLIMB_SPEED * 1.6);
  assert.equal(handsSpeed({ a: own, b: own }, true, false), CLIMB_SPEED * 1.3);
});

test('a short vine runs out under a long one: its hand lets go, the other keeps him', () => {
  const long = vine(1, 100, 0, 450), short = vine(2, 180, 0, 200);
  const h: Hands = { a: long, b: short };
  assert.equal(keepHands(h, 150), h, 'both span him');
  assert.deepEqual(keepHands(h, 260), { a: long, b: null }, 'below the short one: one hand on the long');
  assert.deepEqual(keepHands({ a: short, b: long }, 260), { a: long, b: null }, 'whichever was first');
  assert.deepEqual(handsSpan(h), { top: 0, bottom: 200 });
});

test('pushing a cluster: slow (0.6x, two hands 1.0x, no slide), carried on his hands, torn free at the top, then it falls away', () => {
  const [a, b] = row();
  const c: VineCluster = { id: 1, vine: a.id, y: 200, h: 50 };
  const K = [c];
  // his hands (78 over his feet) under the cluster's bottom
  assert.ok(clusterAbove({ a, b: null }, 278, K), 'hands at its bottom: pushing');
  assert.equal(clusterAbove({ a, b: null }, 320, K), null, 'hands well under it: not yet');
  assert.equal(clusterAbove({ a: b, b: null }, 278, K), null, 'planted: on another vine, no cluster');
  assert.equal(handsSpeed({ a, b: null }, true, true), CLIMB_SPEED * 0.6);
  assert.equal(handsSpeed({ a, b }, true, true), CLIMB_SPEED * 1.0, 'two hands: 1.0x');
  assert.equal(handsSpeed({ a, b: null }, false, true), CLIMB_SPEED, 'no slide under it');
  assert.equal(pushClusters({ a, b: null }, 268, K).length, 0);
  assert.equal(c.y, 190, 'pushed up to his hands');
  assert.ok(clusterAbove({ a, b: null }, 268, K));
  // up to the top: torn free
  // up to the top, a frame's climb at a time: torn free when its top meets the vine's
  let torn: VineCluster[] = [];
  let y = 268;
  while (!torn.length && y > 0) torn = pushClusters({ a, b: null }, (y -= 6), K);
  assert.deepEqual(torn, [c]);
  assert.ok(c.y - c.h <= a.topY && y - 78 === c.y, `torn at the vine's top, on his hands (feet ${y})`);
  assert.ok(c.falling);
  assert.equal(clusterAbove({ a, b: null }, y, K), null, 'a falling one is not pushed');
  for (let i = 0; i < 60 && !c.gone; i++) fallCluster(c, 1 / 30, 450);
  assert.ok(c.gone, 'it falls away');
});

test('a snagged cluster below him is a floor: he cannot climb down through it; one wholly below is not pushed up', () => {
  const [a] = row();
  const c: VineCluster = { id: 1, vine: a.id, y: 300, h: 50 };
  assert.equal(floorUnder({ a, b: null }, 200, [c]), 250);
  assert.equal(floorUnder({ a, b: null }, 400, [c]), Infinity, 'above him: no floor');
  assert.equal(pushClusters({ a, b: null }, 200, [c]).length, 0);
  assert.equal(c.y, 300, 'a cluster below his feet stays where it is');
});

test('gatesOpened: the stage as it is once every fig gate is open (bough, the boughs held with it, its ways up), a copy', async () => {
  const { gatesOpened } = await import('./vineField.ts');
  const st = {
    platforms: [{ id: 1, broken: true }, { id: 2, broken: true }, { id: 3, broken: true }, { id: 4 }],
    vines: [{ id: 7, off: true }, { id: 8, off: true }] as unknown as import('./types.ts').Vine[],
    gates: [{ id: 1, platform: 1, clusters: [5], far: 1 as const, with: [2], ways: [7] }],
  };
  const o = gatesOpened(st);
  assert.deepEqual(o.platforms.map((p) => !!p.broken), [false, false, true, false], 'the gate, its held bough open; a broken bough not its own stays');
  assert.deepEqual(o.vines.map((v) => !!v.off), [false, true], 'its way up let up; another off vine stays off');
  assert.ok(st.platforms[0].broken && st.vines[0].off, 'the stage passed in is unchanged');
  const none = { platforms: [{ id: 1, broken: true }], vines: [] as import('./types.ts').Vine[] };
  assert.equal(gatesOpened(none), none, 'no gates: the same stage');
});
