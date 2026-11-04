/**
 * The draw watch (drawWatch.ts): testers only, and the slow-call line names what was drawn and where.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { installDrawWatch, slowLine, sourceName, SLOW_MS } from './drawWatch.ts';

test('a player never gets the draw watch (the measurement switch is off outside QA builds and #ctest)', () => {
  const g = globalThis as { location?: unknown };
  const had = g.location;
  g.location = { hash: '', search: '' };
  try {
    assert.equal(installDrawWatch(), false);
  } finally {
    g.location = had;
  }
  assert.equal(SLOW_MS, 30);
});

test('the slow-call line: what was drawn, how big, and on which canvas', () => {
  const img = { src: 'https://x/Sloths-Adventure-/assets/w1-near-BjmL0cXf.webp?v=1' };
  assert.equal(sourceName(img), 'w1-near-BjmL0cXf.webp');
  assert.equal(sourceName({ tagName: 'CANVAS', width: 2048, height: 512, isConnected: false }), 'canvas 2048x512');
  const screen = { width: 1080, height: 2289, isConnected: true };
  assert.equal(slowLine(312.4, 'drawImage', [{ tagName: 'CANVAS', width: 2048, height: 512 }, 0, 0, 2048, 512, 0, 10, 1080, 270], screen), '312ms drawImage canvas 2048x512 -> 1080x270 on screen 1080x2289');
  assert.equal(slowLine(45, 'drawImage', [img, 5, 6, 300, 200], screen), '45ms drawImage w1-near-BjmL0cXf.webp -> 300x200 on screen 1080x2289');
  assert.equal(slowLine(80, 'getImageData', [0, 0, 512, 256], { width: 512, height: 256 }), '80ms getImageData 512x256 on canvas 512x256');
  assert.equal(slowLine(31, 'fill', [], screen), '31ms fill on screen 1080x2289');
});
