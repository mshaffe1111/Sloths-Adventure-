/**
 * Kit-audit stills (reference/art/KIT-AUDIT.md): real game frames of chosen stages, upright 390x844 and sideways 844x390, dsf 1.
 *
 *   node tools/art/kitaudit/shoot.mjs <outDir> <stage,stage,...> [port]
 *
 * Starts its own vite (dev, so window.__play / __engine exist), loads each stage on the designed roll (?layout=1), pins Pokey on
 * standable platforms at 20/50/80% along the stage (the perf harness's spot rule, tools/perf/run.mjs), lets the frame settle and saves
 * a PNG per spot. Sideways gets all three spots, upright the middle one. Lessons are off so no tutorial card covers the art.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
// (playwright is global in the container: require() finds it through NODE_PATH, an ESM import does not)
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [outDir, stageArg, portArg] = process.argv.slice(2);
const port = Number(portArg || 5199);
const stages = stageArg.split(',');
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);

const browser = await chromium.launch();
const ORIENTS = [
  { id: 'land', viewport: { width: 844, height: 390 }, fr: [0.2, 0.5, 0.8] },
  { id: 'port', viewport: { width: 390, height: 844 }, fr: (process.env.PORT_FR || '0.5').split(',').map(Number) },
];
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) {
    if (await page.evaluate(() => typeof window.__play === 'function')) break;
    await sleep(1000);
  }
  await sleep(3000);
  for (const st of stages) {
    let ok = false;
    for (let tries = 0; tries < 3 && !ok; tries++) {
      await page.evaluate((id) => window.__play(id), st);
      await sleep(4000);
      ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
    }
    if (!ok) { console.log(st, o.id, 'no engine'); continue; }
    const spots = await page.evaluate((fr) => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const s = e.currentStage;
      const plats = (s.platforms || []).filter((p) => p.type === 'solid' && p.width >= 60 && !p.broken);
      const xs = plats.map((p) => p.x), ys = plats.map((p) => p.y);
      const vertical = Math.max(...ys) - Math.min(...ys) > (Math.max(...xs) - Math.min(...xs)) * 0.8;
      const sorted = [...plats].sort((a, b) => (vertical ? b.y - a.y : a.x - b.x));
      const R = Object.getPrototypeOf(e).render;
      e.render = function () {
        const pin = window.__pin;
        if (pin && this.player) { const p = this.player; p.x = pin.x; p.y = pin.y - (p.height || 40); p.vx = 0; p.vy = 0; if (this.lives < 5) this.lives = 9; }
        R.call(this);
      };
      return fr.map((f) => { const p = sorted[Math.round(f * (sorted.length - 1))]; return { x: Math.round(p.x + p.width / 2), y: p.y }; });
    }, o.fr);
    for (let i = 0; i < spots.length; i++) {
      await page.evaluate((p) => { window.__pin = p; }, spots[i]);
      await sleep(Number(process.env.SETTLE_MS || 2500));
      const f = path.join(outDir, `${st}-${o.id}-${Math.round(o.fr[i] * 100)}.png`);
      await page.screenshot({ path: f });
      console.log('shot', f);
    }
    await page.evaluate(() => { window.__pin = null; });
  }
  await ctx.close();
}
await browser.close();
vite.kill();
