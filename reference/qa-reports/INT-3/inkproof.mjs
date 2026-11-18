/**
 * INT-3 proof that leaving out a fitted strip's clear rows (src/game/stripInk.ts, scenery.ts drawFitted) changes no pixel: for EVERY
 * backdrop strip in src/assets/backdrops (all worlds, sets, canopies, reveals), in a real Chromium, through the game's own stripInk module,
 * it measures the strip, resamples it the way scenery.ts makeFit does (imageSmoothingQuality 'high', one drawImage to bw x d) at 12 sizes
 * from 0.2x to 2.5x, and checks every row the draw leaves out (above fitInkRow) is alpha 0 in every column.
 *   node reference/qa-reports/INT-3/inkproof.mjs <port of a running `npx vite`>
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const port = process.argv[2];
const files = fs.readdirSync('src/assets/backdrops').filter((f) => /\.webp$/.test(f)).sort();
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/`);
const res = await page.evaluate(async (files) => {
  const m = await import('/src/game/stripInk.ts');
  const out = [];
  for (const f of files) {
    const img = new Image();
    img.src = `/src/assets/backdrops/${f}`;
    await img.decode();
    m.measureInk(img);
    const ink = m.inkTop(img);
    const w = img.naturalWidth, ih = img.naturalHeight;
    let bad = 0, worst = 1e9, checked = 0;
    for (const sc of [0.2, 0.31, 0.45, 0.5, 0.62, 0.77, 0.9, 1, 1.15, 1.5, 2, 2.5]) {
      const d = ih * sc + 0.37, bw = Math.ceil(w * sc) + 1;
      const row = m.fitInkRow(ink, 0, d, ih);
      if (row <= 0) continue;
      const cv = document.createElement('canvas');
      cv.width = bw; cv.height = Math.ceil(d);
      const c = cv.getContext('2d', { willReadFrequently: true });
      c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      c.drawImage(img, 0, 0, w, ih, 0, 0, bw, d);
      const px = c.getImageData(0, 0, bw, cv.height).data;
      // the first row with any alpha in the fit, against the first row the draw keeps
      let first = cv.height;
      outer: for (let y = 0; y < cv.height; y++) for (let x = 0; x < bw; x++) if (px[(y * bw + x) * 4 + 3]) { first = y; break outer; }
      checked++;
      worst = Math.min(worst, first - row);
      if (first < row) bad++;
      cv.width = 0;
    }
    out.push({ f, ink: +ink.toFixed(4), checked, bad, spare: worst === 1e9 ? null : worst });
  }
  return out;
}, files);
await browser.close();
let fails = 0;
for (const r of res) { if (r.bad) fails++; console.log(`${r.bad ? 'FAIL' : 'ok  '} ${r.f} ink ${r.ink} sizes ${r.checked} spare rows ${r.spare}`); }
console.log(`${res.length} strips; ${res.filter((r) => r.ink > 0).length} trimmed; ${fails} with a painted row left out`);
process.exit(fails ? 1 : 0);
