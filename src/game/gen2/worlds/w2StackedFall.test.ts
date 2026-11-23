// World 2's finish and a run leg laid UNDER another (ENG-JETTY item 2, 11-23; BUILD-27's trace of 2-7): a soft fall's river drops the
// solids under its water (its bed, pieces that would stand in it), but a solid inside a run leg stacked under the fall's own leg is that
// leg's floor, never the fall's bed. On 2-7 the out leg's soft pits (the porch walk) lie over the home leg, and the finish deleted the home
// leg's banks there (10078+340 at 1501 and its neighbours): every bot needed a rescue. A fall ON the low leg keeps the old rule.
import test from 'node:test';
import assert from 'node:assert/strict';
import { w2Finish } from './w2.ts';
import type { Platform } from '../../types.ts';

const solid = (id: number, x: number, y: number, width: number, height: number): Platform => ({ id, type: 'solid', x, y, width, height } as Platform);

/** two run legs, the home leg (left) laid under the out leg (right); a soft fall on each, with a piece under each fall's water */
function stage() {
  return {
    platforms: [
      // the out leg (its band 500-800): a soft fall 700-1000 at 700 between two banks; a piece in its pit (its bed: dropped, as always)
      solid(1, 400, 700, 300, 200), solid(2, 1000, 700, 300, 200), solid(3, 760, 900, 100, 20),
      // the home leg (its band 1300-1550), right under that fall: its bank (the 2-7 case: kept)
      solid(4, 720, 1400, 220, 200),
      // a soft fall ON the home leg, 1500-1700 at 1400, with a piece in its own pit (its bed: dropped, as always)
      solid(5, 1300, 1400, 200, 200), solid(6, 1700, 1400, 200, 200), solid(7, 1560, 1480, 60, 20),
    ],
    rivers: [],
    proto: {},
    gen2: {
      falls: [{ x0: 700, x1: 1000, y: 700, kind: 'soft' }, { x0: 1500, x1: 1700, y: 1400, kind: 'soft' }],
      tower: { flow: 'legs', legs: [{ travel: 'right', x0: 0, x1: 2400, y0: 500, y1: 800 }, { travel: 'left', x0: 0, x1: 2400, y0: 1300, y1: 1550 }] },
    },
  };
}

test("World 2 finish: an upper leg's soft fall keeps the floor of the run leg laid under it, and still drops its own bed", () => {
  const st = w2Finish(stage());
  const ids = new Set(st.platforms.map((p) => p.id));
  assert.ok(ids.has(4), "the home leg's bank under the out leg's soft fall is kept (2-7's 10078+340 at 1501)");
  assert.ok(!ids.has(3), "the out leg's own pit piece under its water is dropped, as before");
  assert.ok(!ids.has(7), "a fall ON the low leg drops its own bed, as before");
  for (const id of [1, 2, 5, 6]) assert.ok(ids.has(id), `bank ${id} kept`);
  assert.equal(st.rivers.length, 2, 'each soft fall has its river');
});
