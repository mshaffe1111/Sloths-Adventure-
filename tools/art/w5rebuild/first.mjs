// node tools/art/w5rebuild/first.mjs <port> <outDir> <stage>...: the first frames of a stage as it starts (Matt: the painted backdrop from
// the first frame, never a flat colour): stills at 0.1, 0.4 and 1.0 s after the stage card, upright and sideways, and each frame's
// share of near-flat pixels (an 8x8 block with almost no spread) in its top two-thirds, where the backdrop shows
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, ...stages] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
for (const id of stages) for (const [o, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate((i) => window.__play(i, 1), id);
  // (wait for the engine to exist and its first frame to be drawn)
  await p.waitForFunction(() => { let e = window.__engine; if (typeof e === 'function') e = e(); return !!(e && e.currentStage); }, null, { timeout: 30000 });
  for (const t of [100, 400, 1000]) {
    await p.waitForTimeout(t === 100 ? 100 : t === 400 ? 300 : 600);
    const flat = await p.evaluate(() => {
      const c = document.querySelector('canvas'); if (!c) return -1;
      const g = c.getContext('2d'); const W = c.width, H = Math.floor(c.height * 0.66);
      const d = g.getImageData(0, 0, W, H).data; let flat = 0, n = 0;
      for (let y = 0; y + 8 <= H; y += 8) for (let x = 0; x + 8 <= W; x += 8) {
        let mn = 255, mx = 0;
        for (let k = 0; k < 8; k += 2) { const i = ((y + k) * W + x + k) * 4; const v = d[i] + d[i + 1] + d[i + 2]; mn = Math.min(mn, v); mx = Math.max(mx, v); }
        n++; if (mx - mn < 6) flat++;
      }
      return Math.round((flat / n) * 100);
    });
    await p.screenshot({ path: `${out}/${id}-${o}-${t}ms.jpg`, type: 'jpeg', quality: 70 });
    console.log(id, o, `${t}ms`, `flat ${flat}%`);
  }
  await ctx.close();
}
await b.close();
