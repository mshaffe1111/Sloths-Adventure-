/**
 * A world's FALL PAINTER, declared on its manifest (ENG-W2FALL; BUILD-28's finding on 2-8's boardwalk): World 2's finish (w2.ts w2Finish)
 * lays a splash-back river under every soft fall the stage left open, so the player SEES safe water there; the verdicts are judged in the
 * pipeline BEFORE that finish (pipeline.ts dropsOf, promises11.ts floorlessGaps). They read ONE definition, fallPaint.ts FALL_PAINT, by the
 * manifest's `pitPainter`: a soft fall with nothing under it is a putback drawn as safe water (safe-water-art), and no unmarked floorless gap.
 * The toy: a boardwalk, two thick banks and a thin plank between them, a soft gap each side of the plank, nothing under either.
 * RED on cc06d2f90 (dropsOf knew only 'w1Pits': both gaps void-dark; floorlessGaps had no river there: both unmarked). With the
 * declaration removed (a manifest with no painter) they read void-dark and unmarked, as before.
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Platform } from '../../types.ts';
import { dropsOf } from '../pipeline.ts';
import { floorlessGaps } from '../promises11.ts';
import { FALL_PAINT, paintsUnder } from '../fallPaint.ts';
import { w2Finish, w2Manifest } from './w2.ts';
import { w1World } from './w1.ts';

const Y = 1400;
const piece = (id: number, x: number, width: number, height: number): Platform => ({ id, x, y: Y, width, height, type: 'solid' } as Platform);

function boardwalk() {
  return {
    platforms: [piece(1, 0, 800, 200), piece(2, 900, 200, 30), piece(3, 1200, 800, 200)],
    heartFalls: [], proto: {}, waterY: Y + 700, config: { id: 'toy', levelHeight: Y + 800 },
    gen2: { budget: { world: 2 }, softFalls: true, falls: [{ x0: 800, x1: 900, y: Y, kind: 'soft' }, { x0: 1100, x1: 1200, y: Y, kind: 'soft' }] },
  } as never as Parameters<typeof dropsOf>[0] & { gen2: { drops?: unknown } };
}

test("World 2's manifest declares its fall painter: a soft fall becomes a splash-back river", () => {
  assert.equal(w2Manifest().pitPainter, 'splashRivers');
  assert.equal(paintsUnder(w2Manifest(), 'soft'), 'safe-river');
  assert.equal(paintsUnder(w2Manifest(), 'water'), 'deep-river');
  assert.equal(paintsUnder(w2Manifest(), 'void'), undefined, 'a void fall is never painted as a river');
  assert.equal(paintsUnder(w1World().manifest, 'soft'), undefined, "World 1's painter lays no river");
  assert.deepEqual(FALL_PAINT.w1Pits, {}, "World 1's 'w1Pits' paints pits, never a river");
});

test('a World 2 soft gap with nothing under it is judged safe water (putback to the take-off, safe-water-art)', () => {
  const st = boardwalk();
  const drops = dropsOf(st, w2Manifest());
  assert.equal(drops.length, 2);
  for (const d of drops) assert.deepEqual([d.ends, d.look], [{ kind: 'putback', to: 'take-off' }, 'safe-water-art'], `the soft gap at ${d.x0}..${d.x1}: ${JSON.stringify(d.ends)} ${d.look}`);
  (st.gen2 as { drops?: unknown }).drops = drops;
  assert.deepEqual(floorlessGaps(st as never), [], 'no unmarked floorless gap: each is painted wet');
});

test('with the declaration removed the same gap reads void-dark and unmarked (the toy turns back)', () => {
  const st = boardwalk();
  const drops = dropsOf(st, {});
  for (const d of drops) assert.equal(d.look, 'void-dark', `the soft gap at ${d.x0}..${d.x1} with no painter`);
  (st.gen2 as { drops?: unknown }).drops = drops;
  assert.ok(floorlessGaps(st as never).length > 0, 'unmarked: nothing paints it wet');
});

test('ONE definition: the river w2Finish lays is what the judge read before it (judged before and after the finish alike)', () => {
  const before = dropsOf(boardwalk(), w2Manifest());
  const done = w2Finish(boardwalk() as never) as ReturnType<typeof boardwalk> & { rivers: Array<{ x0: number; x1: number; safe?: object }> };
  assert.ok(done.rivers.length > 0 && done.rivers.every((r) => r.safe), `the finish lays splash-back water (${JSON.stringify(done.rivers)})`);
  for (const f of [{ x0: 800, x1: 900 }, { x0: 1100, x1: 1200 }]) assert.ok(done.rivers.some((r) => r.x0 <= f.x0 + 1 && r.x1 >= f.x1 - 1), `a river under ${f.x0}..${f.x1}`);
  const after = dropsOf(done, w2Manifest());
  assert.deepEqual(after.map((d) => [d.ends, d.look]), before.map((d) => [d.ends, d.look]), 'the judge reads the same drop before and after the finish');
});
