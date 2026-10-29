// w5-rebuild walk: frames every half screen along a stage, upright (390x844) and sideways (844x390).
// node tools/art/w5rebuild/walk5.mjs <port> <outDir> <stage[@layout]>...   (env DIFF=easy|normal, STEP=0.5 of a screen)
// Pokey is put on the walkable piece under each x closest to where he last stood (so the frame follows the path, not the treetops).
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, ...stages] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const step = +(process.env.STEP ?? 0.5);
for (const spec of stages) {
  const [id, layout] = spec.split('@');
  for (const [o, w, h] of (process.env.ORIENT === 'side' ? [['side', 844, 390]] : process.env.ORIENT === 'up' ? [['up', 390, 844]] : [['up', 390, 844], ['side', 844, 390]])) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate(([i, l]) => window.__play(i, l === undefined ? undefined : +l), [id, layout]);
    await p.waitForTimeout(6000);
    const info = await p.evaluate(() => { let e = window.__engine; if (typeof e === "function") e = e(); return { W: e.currentStage.config.levelWidth, vw: e.camera.viewportWidth }; });
    let n = 0;
    for (let x = 40; x < info.W; x += Math.max(150, info.vw * step)) {
      await p.evaluate((x) => {
        let e = window.__engine; if (typeof e === "function") e = e(); const pl = e.player;
        const tops = e.platforms.filter((q) => q.x <= x && q.x + q.width >= x + pl.width && q.height > 0).map((q) => q.y);
        const prev = pl.y + pl.height;
        const y = tops.length ? tops.sort((a, b) => Math.abs(a - prev) - Math.abs(b - prev))[0] : prev;
        pl.x = x; pl.y = y - pl.height; if ('vx' in pl) pl.vx = 0; if ('vy' in pl) pl.vy = 0;
        pl.invincibleTimer = 0.9; if ('health' in pl && 'maxHealth' in pl) pl.health = pl.maxHealth;
      }, x);
      await p.waitForTimeout(700);
      await p.screenshot({ path: `${out}/${id}${layout ? 'L' + layout : ''}-${o}-${String(n++).padStart(3, '0')}-x${Math.round(x)}.jpg`, type: 'jpeg', quality: 70 });
    }
    console.log(id, o, n, 'frames, width', info.W);
    await ctx.close();
  }
}
await b.close();
