// TEACH-11 stills (scratch): the real page, a fresh touch phone (Normal, default Tips), 1-1 on a given roll; Pokey stood on the
// double teach's floor just past its line's spot, before the tall step; shot upright and sideways once Dot has said it.
//   node shootdbl.mjs <tree> <outDir> <seed> [port]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [tree, outDir, seedArg, portArg] = process.argv.slice(2);
const port = Number(portArg || 5207);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: tree, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
vite.stderr.on('data', (d) => (vout += d));
for (let i = 0; i < 160 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ORIENTS = [{ id: 'sideways', viewport: { width: 844, height: 390 } }, { id: 'upright', viewport: { width: 390, height: 844 } }];
try {
  for (const o of ORIENTS) {
    const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/script\.google\.com/, (r) => r.abort());
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
    await page.goto(`http://127.0.0.1:${port}/?layout=${seedArg}`, { timeout: 300000 });
    for (let t = Date.now(); Date.now() - t < 300000; ) {
      if (await page.evaluate(() => typeof window.__play === 'function')) break;
      await sleep(1000);
    }
    await sleep(2500);
    await page.evaluate(() => window.__play('1-1'));
    await sleep(5000);
    const spot = await page.evaluate(() => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const s = e.currentStage;
      const h = (e.proto?.hints ?? []).find((q) => /twice/i.test(q.text));
      if (!h) return { err: 'no double hint', hints: (e.proto?.hints ?? []).map((q) => q.text) };
      const x = h.x + 30;
      const under = (s.platforms || []).filter((p) => p.type === 'solid' && !p.broken && p.x <= x && p.x + p.width >= x).sort((a, b) => b.y - a.y);
      const band = h.band;
      const floor = band ? under.find((p) => p.y >= band[0] && p.y <= band[1]) ?? under[0] : under[0];
      const R = Object.getPrototypeOf(e).render;
      e.render = function () {
        const pin = window.__pin;
        if (pin && this.player) { const p = this.player; p.x = pin.x; p.y = pin.y - (p.height || 40); p.vx = 0; p.vy = 0; p.grounded = true; }
        R.call(this);
      };
      return { x, y: floor.y, text: h.text, teach: !!h.teach, band };
    });
    console.log(o.id, JSON.stringify(spot));
    if (spot.err) continue;
    await page.evaluate((p) => { window.__pin = p; }, spot);
    let said = false;
    for (let i = 0; i < 24 && !said; i++) {
      await sleep(500);
      said = await page.evaluate(() => /twice/i.test(document.body.innerText));
    }
    await sleep(900);
    const f = path.join(outDir, `1-1-${seedArg}-double-line-${o.id}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f, 'line on screen:', said);
    await ctx.close();
  }
} finally {
  await browser.close();
  vite.kill();
}
