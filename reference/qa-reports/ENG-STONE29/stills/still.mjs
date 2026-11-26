// ENG-STONE29 stills: a REAL engine frame of 2-5's widest snap pond with its stones re-laid as the WIDE stone (130 px, 62 px of water: the
// court's Normal pitch of 192), Pokey on the first wide stone and on the bank beside it; upright 390x844 and sideways 844x390 at dsf 2.
// node still.mjs <outDir> [port]   (from the worktree root)
import { spawn } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [outDir, portArg] = process.argv.slice(2);
const port = Number(portArg || 5191);
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
for (const o of [{ id: 'sideways', viewport: { width: 844, height: 390 } }, { id: 'upright', viewport: { width: 390, height: 844 } }]) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate(() => window.__play('2-5'));
    await sleep(4000);
    ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
  }
  if (!ok) { console.log(o.id, 'no engine'); continue; }
  // (the goal card: let it shrink away, and tap it)
  await sleep(6000);
  await page.mouse.click(o.viewport.width / 2, o.viewport.height / 2);
  await sleep(3000);
  const spots = await page.evaluate(() => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const s = e.currentStage;
    const snaps = s.platforms.filter((p) => p.pad?.on === 'bites');
    const ponds = (s.rivers || []).filter((r) => r.speed === 0 && snaps.some((p) => p.x > r.x0 && p.x < r.x1)).sort((a, b) => (b.x1 - b.x0) - (a.x1 - a.x0));
    const r = ponds[0];
    const inPond = snaps.filter((p) => p.x > r.x0 && p.x < r.x1).sort((a, b) => a.x - b.x);
    const n = Math.max(1, Math.min(inPond.length, Math.floor((r.x1 - r.x0 - 62) / 192)));
    inPond.forEach((p, i) => { if (i < n) { p.x = r.x0 + 62 + i * 192; p.width = 130; } else { p.y += 5000; } });
    // (the pond's plain stones, if any, out of the way too: the still is the wide stone alone on the water)
    s.platforms.filter((p) => !p.pad && p.type === 'solid' && p.x > r.x0 + 1 && p.x + p.width < r.x1 - 1 && Math.abs(p.y - inPond[0].y) < 80).forEach((p) => { p.y += 5000; });
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin;
      if (pin && this.player) { const p = this.player; p.x = pin.x; p.y = pin.y; p.vx = 0; p.vy = 0; p.grounded = true; if (this.lives < 5) this.lives = 9; }
      R.call(this);
    };
    const a = inPond[0];
    return { info: `pond ${Math.round(r.x0)}-${Math.round(r.x1)}, ${n} wide stones of ${inPond.length}`, spots: [{ name: 'on-stone', x: a.x + 65, y: a.y }, { name: 'bank', x: r.x0 - 40, y: a.y }] };
  });
  console.log(o.id, spots.info);
  for (const sp of spots.spots) {
    await page.evaluate((p) => { window.__pin = p; }, sp);
    await sleep(6000);
    await page.mouse.click(o.viewport.width / 2, o.viewport.height * 0.7);
    await sleep(3000);
    console.log(sp.name, await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; const p = e.player; return `pokey ${Math.round(p.x)},${Math.round(p.y)} cam ${JSON.stringify(e.camera ? { x: Math.round(e.camera.x), y: Math.round(e.camera.y) } : null)}`; }));
    const f = path.join(outDir, `wide-${o.id}-${sp.name}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f);
  }
  await ctx.close();
}
await browser.close();
vite.kill();
