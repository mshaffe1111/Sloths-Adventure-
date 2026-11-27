// World 2's finish and a soft gap between two THIN pieces (LAND-26, R-165.471, the lead's ruling DRY): on any stage (not only one that
// lays a run leg under another, ENG-GROUND-d's ruling (B)) such a gap stays dry and keeps its floor when every drop through it lands on
// wood, a walk-off at a run off either lip included. A pit's floor laid inside its gap (pipeline.ts pitSteps, one hop under the far lip)
// has no wall under a thin piece: on the dry 2-6 a walk-off came down on its end or past it and went on under the far plank and down the
// storey (Easy kid seed 12 and adult seed 4, three falls each; 27 rescues over seeds 1-40). The floor runs on under each thin lip to where
// that walk-off brings his middle down, and half his body past it (1 rescue left: kid Easy seed 36 walks off the floor's end, the lay's
// root, KNOWN). A fall between two earth banks keeps its river and loses its floor, as ever.
// THE PLANTS: the ruling's old gate back (overLowFloor: only a stage that stacks a run leg; 42e3b30fc) turns the first toy RED ('no pool
// over a porch gap'); the gate gone but the floor left the gap's width (the dry counterfactual) turns it RED ('off the near lip').
// reference/qa-reports/LAND-26
import test from 'node:test';
import assert from 'node:assert/strict';
import { w2Finish } from './w2.ts';
import { runX, walkOff } from '../tower.ts';
import type { RiverZone } from '../../river.ts';
import type { Platform } from '../../types.ts';

const solid = (id: number, x: number, y: number, width: number, height: number): Platform => ({ id, type: 'solid', x, y, width, height } as Platform);
const WIDTH = 1280;

/** one storey of a tower: a street of two thin planks with a soft gap between, its floor one hop (70) under, the storey below 500 down */
function porch(gap: number, h = 24) {
  return {
    platforms: [solid(1, 400, 1000, 300, h), solid(2, 700 + gap, 1000, 300, h), solid(3, 700, 1070, gap, 24), solid(4, 0, 1500, WIDTH, 90)],
    rivers: [] as RiverZone[],
    proto: {},
    gen2: { falls: [{ x0: 700, x1: 700 + gap, y: 1000, kind: 'soft' }], tower: { flow: 'up', width: WIDTH } },
  };
}

test('World 2 finish: a soft gap between two thin planks, its floor one hop under, stays DRY, the floor widened to catch a walk-off at a run', () => {
  for (const gap of [66, 79, 90]) {
    const st = w2Finish(porch(gap));
    assert.equal(st.rivers.length, 0, `gap ${gap}: no pool over a porch gap`);
    const bed = st.platforms.find((p) => p.id === 3);
    assert.ok(bed, `gap ${gap}: its floor is kept`);
    const near = st.platforms.find((p) => p.id === 1)!, far = st.platforms.find((p) => p.id === 2)!;
    // (his middle comes down at least half his body inside the floor's ends, off either lip)
    assert.ok(bed.x + bed.width >= runX(near.x + near.width, 1, bed.y - near.y, WIDTH) + 22, `gap ${gap}: off the near lip, ${bed.x}..${bed.x + bed.width}`);
    assert.ok(bed.x <= runX(far.x, -1, bed.y - far.y, WIDTH) - 22, `gap ${gap}: off the far lip, ${bed.x}..${bed.x + bed.width}`);
    // (never past either lip's own piece)
    assert.ok(bed.x >= near.x && bed.x + bed.width <= far.x + far.width, `gap ${gap}: under its own street`);
    for (const [p, side] of [[near, 1], [far, -1]] as const) assert.equal(walkOff(st.platforms, p, side, WIDTH)?.y, bed.y, `gap ${gap}: a walk-off lands on the floor`);
    // (calling it twice changes nothing)
    const once = JSON.stringify(st.platforms), twice = w2Finish(structuredClone(st));
    assert.equal(JSON.stringify(twice.platforms), once, `gap ${gap}: twice, the same pieces`);
    assert.equal(twice.rivers.length, 0, `gap ${gap}: twice, still no pool`);
  }
});

test('World 2 finish: a soft gap between two thin planks with NOTHING to catch a drop (a floor out of the fall rule) keeps its pool', () => {
  const s = porch(80);
  s.platforms = s.platforms.filter((p) => p.id !== 3);
  const st = w2Finish(s);
  assert.equal(st.rivers.length, 1, 'the open gap has its splash-back pool');
  assert.ok(st.rivers[0].safe, 'a soft gap: splash-back');
});

test('World 2 finish: a soft fall between two EARTH banks keeps its river and drops its floor, as ever (unchanged)', () => {
  const st = w2Finish(porch(80, 90));
  assert.equal(st.rivers.length, 1, 'the earth-bank fall has its river');
  assert.ok(!st.platforms.some((p) => p.id === 3), "its pit's floor is dropped under the water");
  for (const id of [1, 2, 4]) assert.ok(st.platforms.some((p) => p.id === id), `piece ${id} kept`);
});
