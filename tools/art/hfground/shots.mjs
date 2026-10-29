// hf-art-ground screenshots: node tools/art/hfground/shots.mjs <port> <outDir> <tag> <stage[@layout][:dx]>...
// each stage upright (390x844) and sideways (844x390) at phone dpr; <outDir>/<tag>-<stage>-up.jpg / -side.jpg.
// `:dx` moves Pokey dx units right of the start before the shot (to show a bank end or a stretch of soil).
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, tag, ...stages] = process.argv.slice(2);
const b = await chromium.launch();
for (const spec of stages) {
  const [idl, dx = '0'] = spec.split(':');
  const [id, layout] = idl.split('@');
  for (const [o, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2.5, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate(([i, l]) => window.__play(i, l === undefined ? undefined : +l), [id, layout]);
    await p.waitForTimeout(3500);
    if (+dx) await p.evaluate((d) => { const e = window.__engine(); const pl = e.player; pl.x += d; if (pl.position) pl.position.x += d; }, +dx);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${tag}-${idl.replace('@', 'L')}${+dx ? '-x' + dx : ''}-${o}.jpg`, type: 'jpeg', quality: 80 });
    await ctx.close();
  }
}
await b.close();
