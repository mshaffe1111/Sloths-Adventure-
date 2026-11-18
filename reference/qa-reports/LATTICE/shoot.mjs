/**
 * LATTICE stills (R-165.177): the vine field test room in the real game (a dev build: a QA build, so the room exists), sideways 844x390
 * (the lead's ask, 10:36 PM: one still per lane, sideways only), played with the keyboard's real input path (ArrowUp climbs, ArrowRight
 * tapped on a vine is the push toward the next).
 *
 *   node reference/qa-reports/LATTICE/shoot.mjs <outDir> [port]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [outDir, portArg] = process.argv.slice(2);
const port = Number(portArg || 5208);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
await ctx.addInitScript(() => { Element.prototype.requestFullscreen = function () { return Promise.resolve(); }; });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
await page.goto(`http://127.0.0.1:${port}/?lessons=off#autostart=1&level=feel-pair`, { timeout: 300000 });
for (let t = Date.now(); Date.now() - t < 240000; ) {
  if (await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage && e.currentStage.feelRoom); })) break;
  await sleep(500);
}
await sleep(4000);
const vx = await page.evaluate(() => window.__engine().currentStage.vines.map((v) => v.x));
const place = (x) => page.evaluate((x) => { const e = window.__engine(); Object.assign(e.player, { x, y: 1300, vx: 0, vy: 0, grounded: true, climbing: false }); }, x);
const key = async (k, ms) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); };
const state = () => page.evaluate(() => { const p = window.__engine().player; return `x ${Math.round(p.x)} y ${Math.round(p.y)} climbing ${p.climbing} pair ${p.climbPair}`; });
// lane 1: the even field, two hands (up a little, a push right)
await place(vx[1]);
await sleep(1000);
await key('ArrowUp', 1100);
await key('ArrowRight', 160);
await sleep(400);
console.log('even, two hands:', await state());
await page.screenshot({ path: path.join(outDir, 'land-1-even-two-hands.jpg'), quality: 85 });
// lane 1 on: the mixed field, one hand high on the short vine (stepped across from the long one)
await place(vx[5]);
await sleep(1000);
await key('ArrowUp', 1500);
await key('ArrowRight', 160);
await sleep(200);
await key('ArrowRight', 160);
await sleep(400);
console.log('mixed, one hand on the next:', await state());
await page.screenshot({ path: path.join(outDir, 'land-2-mixed.jpg'), quality: 85 });
// lane 3: pushing the cluster up its vine
await place(vx[11]);
await sleep(1000);
await key('ArrowUp', 1500);
await sleep(300);
console.log('pushing:', await state(), await page.evaluate(() => JSON.stringify(window.__engine().clusters)));
await page.screenshot({ path: path.join(outDir, 'land-3-push.jpg'), quality: 85 });
await browser.close();
vite.kill();
