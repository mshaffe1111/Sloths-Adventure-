/**
 * ART-MATT: real game frames to judge new pieces in (D62: every frame is labelled by what the game BUILT, read back from the game).
 *
 *   node tools/art/hfmatt/frame.mjs <outDir> <stage,stage,...> [fraction=0.3] [port=5198]
 *
 * Starts its own vite (dev: window.__play / __engine), sets localStorage sloth_difficulty=normal BEFORE the page loads (the game reads
 * that key; a URL flag is never read, D62), loads each stage on the designed roll (?layout=1, lessons off), pins Pokey on the standable
 * platform at <fraction> along the stage (shoot.mjs's spot rule) and saves upright 390x844 and sideways 844x390 at deviceScaleFactor 2.
 * Writes <stage>-<orient>.png and <stage>-<orient>.json: what the game built (stage id, difficulty read back from localStorage, layout,
 * viewport), the camera (x, y, zoom: css px per world unit) and Pokey's feet in file px, so a piece can be pasted at true scale.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [outDir, stageArg, fracArg, portArg] = process.argv.slice(2);
const port = Number(portArg || 5198);
const frac = Number(fracArg || 0.3);
const DSF = 2;
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
for (const o of [{ id: 'upright', viewport: { width: 390, height: 844 } }, { id: 'sideways', viewport: { width: 844, height: 390 } }]) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: DSF, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  for (const st of stageArg.split(',')) {
    let ok = false;
    for (let tries = 0; tries < 3 && !ok; tries++) {
      await page.evaluate((id) => window.__play(id), st);
      await sleep(4000);
      ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
    }
    if (!ok) { console.log(st, o.id, 'no engine'); continue; }
    const spot = await page.evaluate((f) => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const plats = (e.currentStage.platforms || []).filter((p) => p.type === 'solid' && p.width >= 120 && !p.broken).sort((a, b) => a.x - b.x);
      const p = plats[Math.round(f * (plats.length - 1))];
      const R = Object.getPrototypeOf(e).render;
      e.render = function () {
        const pin = window.__pin;
        if (pin && this.player) { const q = this.player; q.x = pin.x; q.y = pin.y - (q.height || 40); q.vx = 0; q.vy = 0; if (this.lives < 5) this.lives = 9; }
        R.call(this);
      };
      return { x: Math.round(p.x + p.width / 2 - 20), y: p.y };
    }, frac);
    await page.evaluate((p) => { window.__pin = p; }, spot);
    await sleep(3000);
    const info = await page.evaluate(() => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const p = e.player, c = e.camera, z = e.zoom;
      const cv = document.querySelector('canvas').getBoundingClientRect();
      return { stage: e.currentStage.config.id, easy: !!e.easy, difficulty: localStorage.getItem('sloth_difficulty'), layout: new URL(location.href).searchParams.get('layout'),
        cam: { x: c.x, y: c.y }, zoom: z, canvas: { x: cv.x, y: cv.y }, feet: { x: cv.x + (p.x + p.width / 2 - c.x) * z, y: cv.y + (p.y + p.height - c.y) * z } };
    });
    const f = path.join(outDir, `${st}-${o.id}`);
    await page.screenshot({ path: `${f}.png` });
    fs.writeFileSync(`${f}.json`, JSON.stringify({ ...info, orient: o.id, viewport: o.viewport, dsf: DSF }, null, 1));
    console.log('shot', f, JSON.stringify(info));
    await page.evaluate(() => { window.__pin = null; });
  }
  await ctx.close();
}
await browser.close();
vite.kill();
