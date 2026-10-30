// hf-art-ground screenshots with Pokey set down at an absolute x: node tools/art/hfground/shots2.mjs <port> <outDir> <tag> <stage[@layout]:x>...
// He is stood on the highest solid top (bank or ledge) under x that is at or below the spawn height minus 400, so he lands on ground,
// not in water; each stage upright (390x844) and sideways (844x390); <outDir>/<tag>-<stage>-x<x>-up.jpg / -side.jpg.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, tag, ...stages] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
for (const spec of stages) {
  const [idl, ax] = spec.split(':');
  const [id, layout] = idl.split('@');
  for (const [o, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2.5, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate(([i, l]) => window.__play(i, l === undefined ? undefined : +l), [id, layout]);
    // (the stage starts once its sheets are in: wait for the engine, then a moment)
    await p.waitForFunction(() => { let e = window.__engine; if (typeof e === 'function') e = e(); return !!(e && e.player); }, null, { timeout: 30000 });
    await p.waitForTimeout(1500);
    const put = async () => p.evaluate((x) => {
      let e = window.__engine; if (typeof e === 'function') e = e();
      const pl = e.player;
      const tops = e.platforms.filter((q) => q.type !== 'water' && q.x < x && q.x + q.width > x + pl.width && q.y > pl.y - 400).sort((a, c) => a.y - c.y);
      if (!tops.length) return;
      pl.x = x; pl.y = tops[0].y - pl.height; pl.vx = 0; pl.vy = 0;
      if (pl.position) { pl.position.x = x; pl.position.y = pl.y; }
    }, +ax);
    if (ax) { await put(); await p.waitForTimeout(600); await put(); }
    await p.waitForTimeout(+(process.env.SETTLE ?? 3500));
    await p.screenshot({ path: `${out}/${tag}-${idl.replace('@', 'L')}${ax ? '-x' + ax : ''}-${o}.jpg`, type: 'jpeg', quality: 80 });
    await ctx.close();
  }
}
await b.close();
