// RULER stills: real game frames, sideways 844x390 dsf 1, with Pokey pinned on the standable piece nearest a chosen x (tools/art/kitaudit/
// shoot.mjs's pin, at a named x instead of 20/50/80%). Serves the tree you name, so "before" is d8d6a97's and "after" this branch's.
//   node reference/qa-reports/VARIETY-2/ruler/shootAt.mjs <root> <outDir> <tag> <stage@layout@x,...> [port]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [root, outDir, tag, spotArg, portArg] = process.argv.slice(2);
const port = Number(portArg || 5207);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
for (const spot of spotArg.split(',')) {
  const [st, layout, xs] = spot.split('@');
  await page.goto(`http://127.0.0.1:${port}/?layout=${layout}&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(2000);
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate((id) => window.__play(id), st);
    await sleep(4000);
    ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
  }
  if (!ok) { console.log(spot, tag, 'NO STAGE (the build failed or never loaded)'); continue; }
  const at = await page.evaluate((x) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const plats = (e.currentStage.platforms || []).filter((p) => p.type === 'solid' && p.width >= 40 && !p.broken);
    const p = plats.sort((a, b) => Math.abs(a.x + a.width / 2 - x) - Math.abs(b.x + b.width / 2 - x))[0];
    const R = Object.getPrototypeOf(e).render;
    e.render = function () { const pin = window.__pin; if (pin && this.player) { const q = this.player; q.x = pin.x; q.y = pin.y - (q.height || 40); q.vx = 0; q.vy = 0; if (this.lives < 5) this.lives = 9; } R.call(this); };
    return { x: Math.round(p.x + p.width / 2), y: p.y };
  }, Number(xs));
  await page.evaluate((p) => { window.__pin = p; }, at);
  await sleep(Number(process.env.SETTLE_MS || 2500));
  const f = path.join(outDir, `${st}-L${layout}-x${xs}-${tag}.png`);
  await page.screenshot({ path: f });
  console.log('shot', f, 'pinned at', JSON.stringify(at));
  await page.evaluate(() => { window.__pin = null; });
}
await browser.close();
vite.kill();
