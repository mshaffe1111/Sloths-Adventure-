/**
 * B14 stills of the feel room v2 (crude by Matt's rule): lane 2 (pods: a tell trickling down a column beside him, then a pod falling),
 * lane 3a (a bough shut by one cluster, then open), lane 3b (a gate of two, one notch lifted), upright 412x915 and sideways 915x412.
 *   node reference/qa-reports/B14/shoot-room.mjs <outDir> [port]
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
const port = Number(portArg || 5214);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
for (const [tag, w, h] of [['port', 412, 915], ['land', 915, 412]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
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
  const place = (x) => page.evaluate((x) => { const e = window.__engine(); Object.assign(e.player, { x, y: 1300, vx: 0, vy: 0, grounded: true, climbing: false, invincibleTimer: 0 }); }, x);
  const key = async (k, ms) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); };
  const shot = (name) => page.screenshot({ path: path.join(outDir, `${tag}-${name}.jpg`), quality: 85 });
  // the phase of pod i now (rockfall's clock: rockfall.ts rockAt, speed 620, burst 0.5)
  const phase = (i) => page.evaluate((i) => {
    const e = window.__engine(), p = e.field.pods[i], t = e.gameTime;
    const fallT = (p.land - p.top) / 620, warnAt = p.every - p.warn - fallT - 0.5;
    const c = (((t + p.offset) % p.every) + p.every) % p.every;
    return c < warnAt ? 'idle' : c < warnAt + p.warn ? `warn${((c - warnAt) / p.warn).toFixed(2)}` : c < warnAt + p.warn + fallT ? `fall${((c - warnAt - p.warn) / fallT).toFixed(2)}` : 'burst';
  }, i);
  const waitFor = async (i, re) => { for (let k = 0; k < 400; k++) { if (re.test(await phase(i))) return true; await sleep(15); } return false; };
  // (the room's vines in order: 5 even, 6 mixed, 3 push, 5 pods, 5 under)
  const P2 = 5 + 6 + 3, P3B = P2 + 5;
  // lane 2: hang on the FREE first vine (one hand), the podded second vine's tell trickling beside him; then its pod falling
  await place(vx[P2]);
  await sleep(800);
  await key('ArrowUp', 900);
  await waitFor(0, /^warn0\.[6-8]/);
  await shot('2-pod-tell');
  await waitFor(0, /^fall0\.[3-5]/);
  await shot('2-pod-falls');
  // lane 3a: the shut bough sagging, the cluster low on its vine; then pushed free and the bough open
  await place(vx[11] - 150);
  await sleep(1200);
  await shot('3a-gate-shut');
  await place(vx[11]);
  await sleep(600);
  await key('ArrowUp', 6200);
  await sleep(900);
  await shot('3a-gate-open');
  // lane 3b: free the first of two (a notch lifted), shot from the floor beside it
  await place(vx[P3B]);
  await sleep(600);
  await page.evaluate(() => { window.__engine().player.invincibleTimer = 60; });
  await key('ArrowUp', 6200);
  await sleep(1200);
  await place(vx[P3B + 2]);
  await sleep(1000);
  await shot('3b-gate-notch');
  console.log(tag, await page.evaluate(() => { const e = window.__engine(); return `freed ${e.clustersFreed} gates ${e.platforms.filter((p) => p.id >= 4).map((p) => p.id + ':' + !!p.broken).join(',')}`; }));
  await ctx.close();
}
await browser.close();
vite.kill();
