/**
 * INT-3: 1-4 sideways in the canopy crossfade (engine.ts setCanopy: both strip sets drawn), before and after stripInk (a fitted strip's
 * clear top rows left out), from two running vite servers, at the same spots, the engine paused and stepped the same way, then a pixel
 * diff of the two stills.
 *   node reference/qa-reports/INT-3/crossfade.mjs <port before> <port after> <out dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [pb, pa, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch();
const shots = {};
for (const [tag, port] of [['before', pb], ['after', pa]]) {
  const ctx = await b.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 300000 });
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('1-4', 1));
  await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.currentStage.config.id === '1-4' && e.player); }, E, { timeout: 120000 });
  await p.waitForTimeout(6000);
  // three heights in the 2600 px band (k = 0.25, 0.5, 0.75 of the way to the canopy), the drawcheck's spot 1 x
  const spawnY = await p.evaluate((E) => eval(E).currentStage.spawnY, E);
  for (const k of [0.25, 0.5, 0.75]) {
    const y = Math.round(spawnY - 1200 - 2600 * k);
    await p.evaluate(([E, y]) => {
      const e = eval(E);
      e.isPaused = true;
      for (let i = 0; i < 90; i++) { Object.assign(e.player, { x: 922, y, vx: 0, vy: 0, invincibleTimer: 0 }); e.update(1 / 30); }
      Object.assign(e.player, { x: 922, y, vx: 0, vy: 0 });
      e.render();
    }, [E, y]);
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    const file = path.join(out, `crossfade-k${k}-${tag}.png`);
    await p.screenshot({ path: file });
    (shots[k] ??= {})[tag] = file;
  }
  await ctx.close();
}
// the diff, in the page itself (no image library in node here): count the pixels that differ, and write a picture of where
const ctx = await b.newContext({ viewport: { width: 400, height: 300 } });
const p = await ctx.newPage();
for (const [k, s] of Object.entries(shots)) {
  const [A, B] = [s.before, s.after].map((f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
  const r = await p.evaluate(async ([A, B]) => {
    const load = (u) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = u; });
    const [a, c] = await Promise.all([load(A), load(B)]);
    const w = a.width, h = a.height;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(a, 0, 0); const da = g.getImageData(0, 0, w, h).data;
    g.clearRect(0, 0, w, h); g.drawImage(c, 0, 0); const dc = g.getImageData(0, 0, w, h).data;
    const out = g.createImageData(w, h);
    let n = 0, big = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i] - dc[i]), Math.abs(da[i + 1] - dc[i + 1]), Math.abs(da[i + 2] - dc[i + 2]));
      if (d > 0) n++;
      if (d > 8) big++;
      out.data[i] = d > 0 ? 255 : da[i] * 0.3; out.data[i + 1] = d > 0 ? 0 : da[i + 1] * 0.3; out.data[i + 2] = d > 0 ? 0 : da[i + 2] * 0.3; out.data[i + 3] = 255;
    }
    g.putImageData(out, 0, 0);
    return { w, h, n, big, url: cv.toDataURL('image/png') };
  }, [A, B]);
  fs.writeFileSync(path.join(out, `crossfade-k${k}-diff.png`), Buffer.from(r.url.split(',')[1], 'base64'));
  console.log(`k ${k}: ${r.w}x${r.h}, ${r.n} pixels differ (${(100 * r.n / (r.w * r.h)).toFixed(3)}%), ${r.big} by more than 8 levels`);
}
await b.close();
