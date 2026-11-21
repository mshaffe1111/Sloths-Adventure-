/**
 * ART-NEXT-c (R-165.354): Pokey's idle start (the melt from his plain pose into an idle clip) on real stages, at 2x.
 *
 *   node tools/art/hfnext/idleshoot.mjs <outDir> <stage,stage,...> [fromSec 3.7] [toSec 4.6] [everyMs 60] [port 5197]
 *
 * Like tools/art/kitaudit/shoot.mjs (its vite, its pin): loads each stage (?layout=1&lessons=off), pins Pokey standing on the middle
 * solid platform, then saves a crop around him (dsf 2, sideways 844x390) every `everyMs` of real time from `fromSec` to `toSec` after
 * the pin (the first idle clip starts IDLE_WAIT = 4 s after he stands still; its melt is CLIP_FADE = 0.2 s). Each file is named by the
 * game seconds since the pin. Also writes <stage>-sheet.png: every crop in a row, the time over each.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [outDir, stageArg, fromA, toA, everyA, portA] = process.argv.slice(2);
const FROM = Number(fromA || 3.7), TO = Number(toA || 4.6), EVERY = Number(everyA || 60), port = Number(portA || 5197);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
for (let t = Date.now(); Date.now() - t < 300000; ) {
  if (await page.evaluate(() => typeof window.__play === 'function')) break;
  await sleep(1000);
}
await sleep(3000);
const eng = () => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return e; };
for (const st of stageArg.split(',')) {
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate((id) => window.__play(id), st);
    await sleep(4000);
    ok = await page.evaluate(`(${eng})()?.currentStage ? true : false`);
  }
  if (!ok) { console.log(st, 'no engine'); continue; }
  await page.evaluate(`(() => {
    const e = (${eng})(); const s = e.currentStage;
    const plats = (s.platforms || []).filter((p) => p.type === 'solid' && p.width >= 80 && !p.broken).sort((a, b) => a.x - b.x);
    const p = plats[Math.round(0.5 * (plats.length - 1))];
    window.__pin = { x: Math.round(p.x + p.width / 2), y: p.y };
    const R = Object.getPrototypeOf(e).render;
    e.render = function () { const pin = window.__pin; if (pin && this.player) { const q = this.player; q.x = pin.x; q.vx = 0; if (this.lives < 5) this.lives = 9; } R.call(this); };
    const q = e.player; q.x = window.__pin.x; q.y = window.__pin.y - (q.height || 40); q.vx = 0; q.vy = 0;
  })()`);
  const t0 = await page.evaluate(`(${eng})().gameTime`);
  const shots = [];
  for (;;) {
    const v = await page.evaluate(`(() => { const e = (${eng})(); const g = {}; e.guideView(g); return g; })()`);
    const dt = v.t - t0;
    if (dt > TO) break;
    if (dt >= FROM) {
      const sx = (v.px + v.pw / 2 - v.camX) * v.zoom, sy = (v.py + v.ph - v.camY) * v.zoom;
      const w = 70 * v.zoom * 1.4, h = 100 * v.zoom * 1.4;
      const clip = { x: Math.max(0, sx - w / 2), y: Math.max(0, sy - h + 6 * v.zoom), width: w, height: h };
      const f = path.join(outDir, `${st}-t${dt.toFixed(2)}.png`);
      await page.screenshot({ path: f, clip });
      shots.push(f);
    }
    await sleep(EVERY);
  }
  console.log(st, 'shots', shots.length);
  await page.evaluate(() => { window.__pin = null; });
}
await browser.close();
vite.kill();
