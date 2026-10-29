// node tools/art/w5rebuild/shot5.mjs <port> <outDir> <tag> <stage@layout:x>...: Pokey stood at x (on the piece under him nearest the
// ground), a still upright (390x844) and sideways (844x390) after the camera settles; <outDir>/<tag>-<stage>-<x>-up|side.jpg
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, tag, ...specs] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
for (const spec of specs) {
  const [idl, xs] = spec.split(':');
  const [id, layout] = idl.split('@');
  for (const [o, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`); if (process.env.NOPIT) await p.evaluate(() => { globalThis.__noPit = true; });
    await p.waitForTimeout(2500);
    await p.evaluate(([i, l]) => window.__play(i, l === undefined ? undefined : +l), [id, layout]);
    await p.waitForTimeout(6000);
    for (let k = 0; k < 3; k++) {
      await p.evaluate((x) => {
        let e = window.__engine; if (typeof e === 'function') e = e(); const pl = e.player;
        const tops = e.platforms.filter((q) => q.x <= x && q.x + q.width >= x + pl.width && q.height >= 40).map((q) => q.y).sort((a, b) => b - a);
        pl.x = x; pl.y = (tops.length ? Math.min(...tops.filter((t) => t <= tops[0])) : pl.y + pl.height) - pl.height; pl.vx = 0; pl.vy = 0; pl.invincibleTimer = 0;
      }, +xs);
      await p.waitForTimeout(900);
    }
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/${tag}-${id}-${xs}-${o}.jpg`, type: 'jpeg', quality: 85 });
    await ctx.close();
  }
}
await b.close();
