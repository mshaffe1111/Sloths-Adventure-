/**
 * B14 stills of 1-4 Up the Kapok: Pokey placed at each laid section's way in (gen2.tower.route legs), upright 412x915 and sideways
 * 915x412, fresh save, on Normal or Easy. A dev build (vite) of the tree it runs in.
 *   node reference/qa-reports/B14/shoot-14.mjs <outDir> <port> [normal|easy] [seed] [uids,comma]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = process.cwd();
const [outDir, portArg, setting = 'normal', seedArg = '1', only = ''] = process.argv.slice(2);
const port = Number(portArg || 5220);
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
  await ctx.addInitScript((easy) => {
    Element.prototype.requestFullscreen = function () { return Promise.resolve(); };
    try { if (easy) localStorage.setItem('sloth_difficulty', 'easy'); } catch {}
  }, setting === 'easy');
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?lessons=off&layout=${seedArg}#autostart=1&level=1-4`, { timeout: 300000 });
  let ok = false;
  for (let t = Date.now(); Date.now() - t < 240000; ) {
    ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage && e.currentStage.gen2); });
    if (ok) break;
    await sleep(500);
  }
  if (!ok) { console.log(tag, 'no stage'); await ctx.close(); continue; }
  await sleep(3000);
  const legs = await page.evaluate(() => { const st = window.__engine().currentStage; return st.gen2.tower.route.legs.map((l) => ({ uid: l.uid, x: l.entry.x, y: l.entry.y, t: st.gen2.sections.find((s) => s.uid === l.uid)?.template })); });
  for (const L of legs) {
    if (only && !only.split(',').includes(L.uid)) continue;
    await page.evaluate((L) => { const e = window.__engine(); Object.assign(e.player, { x: L.x + 30, y: L.y, vx: 0, vy: 0, grounded: true, climbing: false, invincibleTimer: 30 }); }, L);
    await sleep(1600);
    await page.screenshot({ path: path.join(outDir, `${tag}-${L.uid}-${(L.t || '').replace('w1-14-', '')}.jpg`), quality: 80 });
  }
  console.log(tag, legs.length, 'legs');
  await ctx.close();
}
await browser.close();
vite.kill();
