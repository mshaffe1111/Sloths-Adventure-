// scratch proof shooter (not candidate code): 1-4 on one layout + setting, Pokey pinned on the wood nearest (px,py), both orientations, dsf 1.
// node shoot14.mjs <root> <port> <outDir> <label> <layout> <difficulty> <px> <py>
import { createRequire } from 'node:module'; import { spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const [root, port, outDir, label, layout, diff, px, py] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', port, '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = ''; vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
for (const o of [{ id: 'port', viewport: { width: 390, height: 844 } }, { id: 'land', viewport: { width: 844, height: 390 } }]) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) { await page.evaluate((l) => window.__play('1-4', l), Number(layout)); await sleep(5000);
    ok = await page.evaluate(() => { const e = window.__engine(); return !!(e && e.currentStage); }); }
  if (!ok) { console.log('no engine', o.id); continue; }
  const info = await page.evaluate(([x, y]) => {
    const e = window.__engine(); const s = e.currentStage;
    const near = (s.platforms || []).filter((p) => p.type === 'solid' && Math.abs(p.y - y) < 160 && p.x < x + 400 && p.x + p.width > x - 400 && !p.broken)
      .map((p) => `${Math.round(p.x)}-${Math.round(p.x + p.width)}@${Math.round(p.y)}${p.style ? ' ' + p.style : ''}`);
    const best = (s.platforms || []).filter((p) => p.type === 'solid' && !p.broken).sort((a, b) => Math.hypot(a.x + a.width / 2 - x, a.y - y) - Math.hypot(b.x + b.width / 2 - x, b.y - y))[0];
    const R = Object.getPrototypeOf(e).render;
    e.render = function () { const pin = window.__pin; if (pin && this.player) { const p = this.player; p.x = pin.x; p.y = pin.y - (p.height || 40); p.vx = 0; p.vy = 0; if (this.lives < 5) this.lives = 9; } R.call(this); };
    window.__pin = { x: Math.round(Math.min(Math.max(x, best.x + 10), best.x + best.width - 30)), y: best.y };
    return { built: { stage: s.id ?? e.level?.id, difficulty: localStorage.getItem('sloth_difficulty'), variant: e.layoutVariant ?? null }, near, pin: window.__pin };
  }, [Number(px), Number(py)]);
  console.log(o.id, JSON.stringify(info));
  await sleep(3000);
  const f = path.join(outDir, `${label}-${o.id}.png`); await page.screenshot({ path: f }); console.log('shot', f);
  await ctx.close();
}
await browser.close(); vite.kill();
