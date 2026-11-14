import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firstInkRow, fitInkRow, inkTop } from './stripInk.ts';

/** RGBA rows `w` wide, `h` tall, clear except the pixels listed ([x, y, alpha]) */
function pixels(w: number, h: number, ink: Array<[number, number, number]>) {
  const d = new Uint8ClampedArray(w * h * 4);
  for (const [x, y, a] of ink) d[(y * w + x) * 4 + 3] = a;
  return (y0: number, n: number) => d.slice(y0 * w * 4, (y0 + n) * w * 4);
}

test('stripInk: the first row holding any paint, however faint and wherever across, read a band at a time', () => {
  // one faint pixel (alpha 1) at the far right of row 37, read 8 rows at a time: the band boundary does not hide it
  assert.equal(firstInkRow(20, 100, pixels(20, 100, [[19, 37, 1], [3, 80, 255]]), 8), 37 / 100);
  // paint on row 0: nothing to leave out
  assert.equal(firstInkRow(4, 10, pixels(4, 10, [[0, 0, 200]]), 3), 0);
  // a strip with no paint at all, or one that could not be read, is drawn whole (0), never trimmed away
  assert.equal(firstInkRow(4, 10, pixels(4, 10, []), 3), 0);
  assert.equal(firstInkRow(4, 10, () => null, 3), 0);
  // a colour with no alpha is clear: only alpha decides (premultiplied canvas data)
  const d = new Uint8ClampedArray(4 * 4 * 4);
  d[0] = 255; d[1] = 255; d[2] = 255; // row 0, a white pixel with alpha 0
  d[(2 * 4 + 1) * 4 + 3] = 9;
  assert.equal(firstInkRow(4, 4, (y0, n) => d.slice(y0 * 16, (y0 + n) * 16), 2), 2 / 4);
});

test('stripInk: a fit leaves out only rows above its paint, less a margin for the resampling filter', () => {
  // unknown or no clear rows: from row 0, as before
  assert.equal(fitInkRow(0, 0, 700, 1302), 0);
  assert.equal(inkTop({}), 0);
  // shrunk (700 device rows from 1302): the paint at 40% starts at row 280; 6 rows of margin
  assert.equal(fitInkRow(0.4, 0, 700, 1302), 274);
  // enlarged 2x: the bicubic filter's reach grows with it (3 x 2 + 3 = 9 rows)
  assert.equal(fitInkRow(0.5, 0, 2604, 1302), 1302 - 9);
  // rows over the strip (a fit's `oy`) count from the canvas top
  assert.equal(fitInkRow(0.4, 50, 700, 1302), 324);
  // never above the canvas
  assert.equal(fitInkRow(0.001, 0, 700, 1302), 0);
  // the margin holds on every scale a strip is fitted at (0.2x to 3x): the trimmed rows end above the painted row by at least the
  // filter's reach, 2 source rows scaled, plus 2 device rows
  for (let d = 200; d <= 4000; d += 37) {
    const ih = 1302, ink = 0.3;
    const row = fitInkRow(ink, 0, d, ih);
    assert.ok(ink * d - row >= 2 * Math.max(1, d / ih) + 2, `d ${d}: trimmed to ${row}, paint at ${ink * d}`);
  }
});
