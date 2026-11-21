/**
 * The four readers that judged water by x alone (ENG-26e, the lead's 12:10 PM ET 11-21 ruling, after ENG-26d's G6 fix to the engine's
 * own read): the drop judge (pipeline.ts dropsOf), Easy's flags (easyMode.ts clearOfWater), Easy's steps over a gap (easyStones and
 * easyWaterLandings) and the water lesson (lessons.ts pickLesson). On a stage of storeys (a tower, legs laid one under another) a pond's
 * window shares x with ground a storey above or below it, so each misread a storey's water as this storey's. They read it now by ONE
 * rule, river.ts waterUnder / waterNear (riverAt's: the window holds x, he is no deeper than RIVER_DEPTH under the surface, and no floor
 * lies between him and the water).
 * The toy tower: a lower storey at LOW with a deep river (1900-2300); an upper storey at HIGH with a splash-back pond (600-1400) over the
 * lower storey's gap, and a ledge over the lower river.
 * RED on the x-only reads (river.ts waterUnder = the river whose window holds x, waterNear = its window near x): every test below.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { RiverZone } from '../river.ts';
import type { Platform } from '../types.ts';
import { jumpOK } from '../levelCheck.ts';
import { clearOfWater, easyStones, easyWaterLandings } from '../easyMode.ts';
import { LESSONS, pickLesson, type LessonId, type LessonScene } from '../lessons.ts';
import { dropsOf } from './pipeline.ts';

const LOW = 3000, HIGH = 1500;
const solid = (id: number, x: number, y: number, width: number): Platform => ({ id, x, y, width, height: 60, type: 'solid' } as Platform);
const pond: RiverZone = { x0: 600, x1: 1400, surfaceY: HIGH + 20, speed: 0, dir: 1, wheelPond: true, safe: { backX: 500, backY: HIGH } };
const deep: RiverZone = { x0: 1900, x1: 2300, surfaceY: LOW + 20, speed: 0, dir: 1 };

/** the lower storey's gap under the pond: the widest a held jump clears and a plain one does not (the far jump Easy's step is for) */
function heldGap(): number {
  let best = 0;
  for (let g = 40; g < 520; g += 4) {
    const a = solid(1, 0, LOW, 800), b = solid(2, 800 + g, LOW, 1100 - g);
    if (jumpOK(a, b, true).ok && !jumpOK(a, b, false).ok) best = g;
  }
  assert.ok(best > 0, 'a held-only gap');
  return best;
}

function tower(gap: number) {
  return [
    // (the lower storey: its floor either side of the gap under the pond, and either side of its deep river)
    solid(1, 0, LOW, 800), solid(2, 800 + gap, LOW, 1100 - gap), solid(3, 2300, LOW, 900),
    // (the upper storey: its ground either side of the pond, and a ledge over the lower river)
    solid(4, 200, HIGH, 400), solid(5, 1400, HIGH, 300), solid(6, 1800, HIGH, 600),
  ];
}

test("the drop judge: a fall ends in the FIRST thing under its lip, this storey's water or ground, never a storey above's pond", () => {
  const gap = heldGap();
  const st = {
    platforms: tower(gap), rivers: [pond, deep], heartFalls: [], proto: {}, waterY: LOW + 600, config: { levelHeight: LOW + 800 },
    gen2: { budget: { world: 2 }, falls: [
      // (the lower storey's gap, under the pond's window: it falls to the death line, a life; not the pond's splash back)
      { x0: 800, x1: 800 + gap, y: LOW, kind: 'void' },
      // (the pond itself, from its own bank on the upper storey: its splash back, as ever)
      { x0: 600, x1: 1400, y: HIGH, kind: 'water' },
      // (the lower river itself, from its bank: its deep water, a life)
      { x0: 1900, x1: 2300, y: LOW, kind: 'water' },
    ] },
  };
  const [under, own, river] = dropsOf(st as never);
  assert.notEqual(under.look, 'safe-water-art', `a gap a storey under the pond is not the pond (${JSON.stringify(under.ends)} ${under.look})`);
  assert.deepEqual(under.ends, { kind: 'life', cause: 'void' }, 'the lower gap: the death line under it');
  assert.deepEqual([own.ends, own.look], [{ kind: 'putback', to: 'take-off' }, 'safe-water-art'], "the pond from its own bank: its splash back");
  assert.deepEqual(river.ends, { kind: 'life', cause: 'water' }, "the lower river from its own bank: its water");
});

test("the drop judge: a storey's floor between the lip and a lower river's water ends the fall", () => {
  const st = {
    platforms: [solid(1, 1600, HIGH, 300), solid(2, 2000, HIGH, 400), solid(3, 1850, 2200, 300), solid(4, 0, LOW, 1900), solid(5, 2300, LOW, 900)],
    rivers: [deep], heartFalls: [], proto: {}, waterY: LOW + 600, config: { levelHeight: LOW + 800 },
    gen2: { budget: { world: 2 }, falls: [{ x0: 1900, x1: 2000, y: HIGH, kind: 'void' }] },
  };
  const [d] = dropsOf(st as never);
  assert.deepEqual(d.ends, { kind: 'floor', y: 2200 }, `the mid storey's floor at 2200 under the upper gap, before the river at ${deep.surfaceY} (${JSON.stringify(d.ends)})`);
});

test("Easy's flags: a pond a storey above is no water ahead; this storey's water is", () => {
  const stage = { platforms: tower(heldGap()), rivers: [pond, deep] };
  assert.ok(clearOfWater(stage as never, 1000, LOW), 'a flag on the lower storey under the pond: clear of water');
  assert.ok(clearOfWater(stage as never, 2100, HIGH), 'a flag on the upper ledge over the lower river: clear of water');
  assert.ok(!clearOfWater(stage as never, 500, HIGH), "a flag on the pond's own bank: not clear");
  assert.ok(!clearOfWater(stage as never, 1700, LOW), "a flag on the lower river's own bank: not clear");
});

test("Easy's step over a held gap is laid under a pond a storey above (the pond is not this gap's crossing)", () => {
  const gap = heldGap();
  const stage = { platforms: tower(gap), rivers: [pond, deep], vines: [], ropes: [] };
  const stones = easyStones(stage as never);
  assert.ok(stones.some((s) => s.x > 800 && s.x + s.width < 800 + gap && s.y >= LOW - 200), `a stone in the lower gap 800-${800 + gap} (stones: ${JSON.stringify(stones.map((s) => [s.x, s.y]))})`);
});

test("Easy's water landing widens a lower-storey hop under a pond a storey above", () => {
  const gap = 200;
  const stage = { platforms: tower(gap), rivers: [pond, deep], vines: [], ropes: [], waterY: LOW + 400, spawnY: LOW };
  const n = easyWaterLandings(stage as never);
  assert.equal(n, 1, `the far ledge of the lower hop is widened (${n})`);
  assert.equal(stage.platforms[1].x, 800 + gap - 24, 'by EASY_WATER_LAND');
});

test("the water lesson: at this storey's water, never at a pond's window a storey above or a river a storey below", () => {
  const scene = (px: number, py: number): LessonScene => ({
    px, py, view: { x0: px - 400, x1: px + 400, y0: py - 300, y1: py + 300 },
    enemies: [], collectibles: [], vines: [], checkpoints: [], platforms: tower(200), rivers: [pond, deep],
  });
  // (every other lesson seen: this asks the water lesson alone)
  const seen = new Set((Object.keys(LESSONS) as LessonId[]).filter((id) => id !== 'water'));
  assert.equal(pickLesson(scene(1000, LOW), seen), null, 'on the lower storey under the pond: no water lesson');
  assert.equal(pickLesson(scene(2100, HIGH), seen), null, 'on the upper ledge over the lower river: no water lesson');
  assert.equal(pickLesson(scene(450, HIGH), seen), 'water', "on the pond's bank: the water lesson");
  assert.equal(pickLesson(scene(1750, LOW), seen), 'water', "on the lower river's bank: the water lesson");
});
