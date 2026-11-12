// the set-back at w1-log-chain-rise, 1-1 Normal seed 3747: frames through the fall and the set-back, upright and sideways, dsf 1
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = process.cwd(), out = process.argv[2], port = 5199;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const idx = Number(process.argv[3]);
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = ''; vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
for (const o of [{ id: 'land', viewport: { width: 844, height: 390 } }, { id: 'port', viewport: { width: 390, height: 844 } }]) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((i) => { const order = [i, ...Array.from({ length: 138 }, (_, j) => j).filter((j) => j !== i)]; localStorage.setItem('sloth_difficulty', 'normal'); localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 138, order, i: 0 })); }, idx);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  await page.evaluate((i) => window.__play('1-1', i + 1), idx);
  await sleep(5000);
  const info = await page.evaluate(() => {
    const e = window.__engine();
    const s = e.currentStage;
    const pc = s.meta.pieces.find((q) => q.k === 'w1-log-chain-rise');
    const logs = s.platforms.filter((p) => p.type === 'solid' && p.style === 'log' && p.width >= 300 && p.x >= pc.x0 - 2 && p.x + p.width <= pc.x1 + 2).sort((a, b) => a.x - b.x);
    const L = logs[0];
    window.__L = L; window.__log = [];
    const p = e.player;
    Object.assign(p, { x: L.x + L.width - 60, y: L.y, vx: 0, vy: 0, grounded: true });
    e.camera.x = e.camera.targetX = Math.max(0, p.x - e.camera.viewportWidth * 0.4);
    const U = Object.getPrototypeOf(e).update;
    e.update = function (dt) { U.call(this, dt); window.__log.push([Math.round(this.gameTime * 100) / 100, Math.round(this.camera.x), Math.round(this.camera.y), Math.round(this.player.x), Math.round(this.player.y), Math.round(this.irisOpen * 100) / 100, this.lives, this.player.grounded ? 1 : 0]); };
    return { seed: s.gen2.seed, softOn: e.softOn, softFalls: s.gen2.softFalls, lives: e.lives, L: [L.x, L.y, L.width], diff: localStorage.getItem('sloth_difficulty') };
  });
  console.log(o.id, JSON.stringify(info));
  await sleep(1200);
  await page.screenshot({ path: `${out}/${o.id}-00-before.png` });
  // off the ledge: out past its edge and the catch branch under it, falling
  await page.evaluate(() => { const e = window.__engine(); const p = e.player; window.__t0 = window.__log.length; p.x = window.__L.x + window.__L.width + 150; p.y = window.__L.y + 420; p.vy = 300; p.grounded = false; });
  for (let i = 1; i <= 16; i++) { await sleep(170); await page.screenshot({ path: `${out}/${o.id}-${String(i).padStart(2, '0')}.png` }); }
  await sleep(1500);
  await page.screenshot({ path: `${out}/${o.id}-99-after.png` });
  const log = await page.evaluate(() => window.__log.slice(window.__t0));
  fs.writeFileSync(`${out}/${o.id}-log.json`, JSON.stringify(log));
  await ctx.close();
}
await browser.close();
vite.kill();
