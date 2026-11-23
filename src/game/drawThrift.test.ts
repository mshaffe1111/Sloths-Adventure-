// DRESS-27b: the shared helpers that took 2-7's rivers under the per-frame limits (gradients 2, clips 19) with the same picture.
// Planted: red on the base (drawThrift.ts and aboveLinesPath did not exist), green with the change.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cropToBox, polygonInBox, vGradient } from './drawThrift.ts';
import { aboveLinesPath, clipAboveLines, type Ceiling } from './groundStack.ts';
import { riverWaterOutline } from './riverArt.ts';

const fakeGradCtx = () => {
  const made: number[][] = [];
  return {
    made,
    createLinearGradient: (x0: number, y0: number, x1: number, y1: number) => {
      made.push([x0, y0, x1, y1]);
      return { addColorStop() {} } as unknown as CanvasGradient;
    },
  };
};

test('vGradient: one gradient per (ends, stops) and context, not one a frame', () => {
  const c = fakeGradCtx();
  const stops = [[0, '#264247'], [1, 'rgba(38, 66, 71, 0)']] as const;
  const a = vGradient(c, 500, 570, stops);
  for (let f = 0; f < 30; f++) assert.equal(vGradient(c, 500, 570, stops), a);
  assert.equal(c.made.length, 1);
  vGradient(c, 500, 660, stops);
  vGradient(c, 500, 570, [[0, '#000'], [1, '#fff']]);
  assert.equal(c.made.length, 3);
  assert.deepEqual(c.made[0], [0, 500, 0, 570]);
  // a second context makes its own
  const d = fakeGradCtx();
  vGradient(d, 500, 570, stops);
  assert.equal(d.made.length, 1);
});

test('cropToBox: a picture wholly inside is drawn whole; one across the box keeps exactly the part inside, at the same scale', () => {
  assert.deepEqual(cropToBox(10, 20, 100, 50, 200, 100, 0, 0, 500, 500), [0, 0, 200, 100, 10, 20, 100, 50]);
  // cut 30 off the left and 10 off the top: source scaled by 2
  assert.deepEqual(cropToBox(10, 20, 100, 50, 200, 100, 40, 30, 500, 500), [60, 20, 140, 80, 40, 30, 70, 40]);
  // cut at the right and the foot
  assert.deepEqual(cropToBox(10, 20, 100, 50, 200, 100, 0, 0, 60, 45), [0, 0, 100, 50, 10, 20, 50, 25]);
  assert.equal(cropToBox(10, 20, 100, 50, 200, 100, 200, 0, 300, 500), null);
  assert.equal(cropToBox(10, 20, 100, 50, 200, 100, 0, 70, 300, 500), null);
});

const inside = (poly: ReadonlyArray<readonly [number, number]>, x: number, y: number) => {
  let w = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yj <= y) { if (yi > y && (xi - xj) * (y - yj) - (x - xj) * (yi - yj) > 0) w++; }
    else if (yi <= y && (xi - xj) * (y - yj) - (x - xj) * (yi - yj) < 0) w--;
  }
  return w !== 0;
};

test('polygonInBox: one clip to the cut outline is the box and the outline in turn (a river under two painted banks, and a concave one)', () => {
  const top = 840, bottom = 1500;
  const shapes: Array<Array<[number, number]>> = [
    riverWaterOutline(2, 10028, 10766, 880, 860, top - 10, bottom),
    riverWaterOutline(2, 500, 900, null, null, top - 10, bottom),
    [[0, 0], [400, 0], [400, 300], [250, 120], [150, 500], [0, 300]],
  ];
  const boxes: Array<[number, number, number, number]> = [[9900, top, 10900, bottom], [9990, top, 10700, bottom], [480, top, 950, bottom], [100, 50, 350, 400]];
  let checked = 0;
  for (const poly of shapes) {
    for (const [x0, y0, x1, y1] of boxes) {
      const cut = polygonInBox(poly, x0, y0, x1, y1);
      for (let i = 0; i < 1500; i++) {
        // points a hair off any grid line, so none sits on an edge
        const x = x0 - 60 + ((i * 37.13) % (x1 - x0 + 120)), y = y0 - 60 + ((i * 91.71) % (y1 - y0 + 120));
        const want = inside(poly, x, y) && x >= x0 && x <= x1 && y >= y0 && y <= y1;
        assert.equal(inside(cut, x, y), want, `at ${x},${y}`);
        checked++;
      }
    }
  }
  assert.ok(checked > 10000);
});

test('aboveLinesPath: the outline clipAboveLines clips to, point for point', () => {
  const c: Ceiling = { x0: 1000, x1: 1600, ys: [900, 920, 940, 930, 910, 905, 900], lower: [] } as unknown as Ceiling;
  const pts: number[][] = [];
  const ctx = {
    beginPath() {}, closePath() {}, clip() {},
    moveTo: (x: number, y: number) => pts.push([x, y]),
    lineTo: (x: number, y: number) => pts.push([x, y]),
  } as unknown as CanvasRenderingContext2D;
  clipAboveLines(ctx, [c], 950, 1650, 840);
  assert.deepEqual(aboveLinesPath([c], 950, 1650, 840), pts);
  assert.ok(pts.length > 5);
});
