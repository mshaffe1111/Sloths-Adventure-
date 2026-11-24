// scratch (TOOLS-1124c): stills of the two side-wall pieces on main, real game, Pokey pinned beside each; prints the piece's screen box
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 5233;
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
// piece: the flagged block; shots: where Pokey is pinned (his feet)
const JOBS = [
  { st: '1-6', layout: 0, piece: { x: 27896, y: 865, w: 24, h: 345 }, shots: { close: { x: 27860, y: 1090 }, wide: { x: 27560, y: 970 } } },
  { st: '8-1', layout: 0, piece: { x: 1466, y: 526, w: 14, h: 224 }, shots: { close: { x: 1505, y: 640 }, top: { x: 1440, y: 526 }, wide: { x: 1180, y: 482 } } },
];
const browser = await chromium.launch();
const ORIENTS = [{ id: 'land', viewport: { width: 844, height: 390 } }, { id: 'port', viewport: { width: 390, height: 844 } }];
const log = [];
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  for (const j of JOBS) {
    let ok = false;
    for (let tries = 0; tries < 3 && !ok; tries++) {
      await page.evaluate(([id, l]) => window.__play(id, l), [j.st, j.layout]);
      await sleep(11000);
      ok = await page.evaluate(() => !!((typeof window.__engine === 'function' ? window.__engine() : window.__engine) && (typeof window.__engine === 'function' ? window.__engine() : window.__engine).currentStage));
    }
    if (!ok) { console.log(j.st, o.id, 'no engine'); continue; }
    const info = await page.evaluate((pc) => {
      const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
      const s = e.currentStage;
      const seed = (s.gen2 ?? s.proto?.gen2)?.seed;
      const hit = (e.platforms || s.platforms).find((p) => Math.round(p.x) === pc.x && Math.round(p.width) === pc.w);
      const R = Object.getPrototypeOf(e).render;
      e.render = function () {
        const pin = window.__pin;
        if (pin && this.player) { const p = this.player; p.x = pin.x - (p.width || 30) / 2; p.y = pin.y - (p.height || 40); p.vx = 0; p.vy = 0; if (this.lives < 5) this.lives = 9; }
        R.call(this);
      };
      return { seed, piece: hit ? { x: hit.x, y: hit.y, w: hit.width, h: hit.height, style: hit.style, type: hit.type } : null };
    }, j.piece);
    for (const [name, spot] of Object.entries(j.shots)) {
      await page.evaluate((p) => { window.__pin = p; }, spot);
      await sleep(2500);
      const box = await page.evaluate((pc) => {
        const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
        const c = document.querySelector('canvas').getBoundingClientRect();
        const z = e.zoom ?? 1;
        return { x: c.left + (pc.x - e.camera.x) * z, y: c.top + (pc.y - e.camera.y) * z, w: pc.w * z, h: pc.h * z, zoom: z };
      }, j.piece);
      const f = `${out}/${j.st}-${o.id}-${name}.png`;
      await page.screenshot({ path: f });
      log.push({ file: f, stage: j.st, orient: o.id, shot: name, seed: info.seed, piece: info.piece, screenBox: box });
      console.log('shot', f, JSON.stringify(box), 'seed', info.seed, JSON.stringify(info.piece));
    }
    await page.evaluate(() => { window.__pin = null; });
  }
  await ctx.close();
}
fs.writeFileSync(`${out}/boxes.json`, JSON.stringify(log, null, 1));
await browser.close();
vite.kill();
