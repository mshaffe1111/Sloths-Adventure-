/**
 * ART-HERO (R-165.378): Pokey going from his plain pose into the non-idle animations (climb, push, cheer) on a real stage, at 2x, so a
 * colour jump at the change shows. Built on idleshoot.mjs (its vite, its pin, its crop).
 *
 *   node tools/art/hfnext/heroshoot.mjs <outDir> <stage> <climb,push,cheer> [switchSec 1.0] [toSec 2.4] [everyMs 33] [port 5198]
 *
 * For each scene: pins Pokey standing on the stage's middle solid platform; from `switchSec` game seconds after the pin the render hook
 * FORCES the state the scene names every frame (the renderer, the sheets, the sizes and the blend are the game's own; the vine or the
 * block is not there): climb = p.climbing, and he rises at 60 units/s so the climb cycle runs; push = p.pushing; cheer = p.cheerAt set
 * once at the switch; walk / run = vx 60 / 150 for 0.8 s then a stop (x stays pinned, so he walks on the spot); jab = the jab twice. The page runs on a paused clock stepped `everyMs` (one 30 fps game frame) at a time; a crop around him is saved at each step, each file named <stage>-<scene>-t<game seconds>.png.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [outDir, stageArg, sceneArg, swA, toA, everyA, portA] = process.argv.slice(2);
const SW = Number(swA || 1.0), TO = Number(toA || 2.4), EVERY = Number(everyA || 1000 / 30), port = Number(portA || 5198), FROM = 0.3;
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
// the game runs on Playwright's paused clock (as tools/perf/run.mjs does), so every game frame is shot: the strip is at game speed
const T0 = Date.UTC(2026, 10, 21, 12);
await page.clock.install({ time: T0 });
await page.clock.pauseAt(T0 + 1000);
await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
for (let t = Date.now(); Date.now() - t < 300000; ) {
  await page.clock.runFor(200);
  if (await page.evaluate(() => typeof window.__play === 'function')) break;
  await sleep(1000);
}
for (let i = 0; i < 6; i++) { await page.clock.runFor(500); await sleep(200); }
const eng = () => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return e; };
const st = stageArg;
for (const scene of sceneArg.split(',')) {
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate((id) => window.__play(id), st);
    for (let i = 0; i < 12; i++) { await page.clock.runFor(250); await sleep(300); }
    ok = await page.evaluate(`(${eng})()?.currentStage ? true : false`);
  }
  if (!ok) { console.log(st, 'no engine'); continue; }
  await page.evaluate(`(() => {
    const e = (${eng})(); const s = e.currentStage;
    const plats = (s.platforms || []).filter((p) => p.type === 'solid' && p.width >= 80 && !p.broken).sort((a, b) => a.x - b.x);
    const p = plats[Math.round(0.5 * (plats.length - 1))];
    window.__pin = { x: Math.round(p.x + p.width / 2), y: p.y, t0: e.gameTime, scene: ${JSON.stringify(scene)}, sw: ${SW}, cheered: false };
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin; const q = this.player;
      if (pin && q) {
        q.x = pin.x; q.vx = 0; if (this.lives < 5) this.lives = 9;   // (walk/run set vx again below, after the pin)
        const dt = this.gameTime - pin.t0;
        if (dt >= pin.sw) {
          if (pin.scene === 'climb') { q.climbing = true; q.grounded = false; q.vy = 0; q.y = pin.y - (q.height || 40) - 60 * (dt - pin.sw); }
          if (pin.scene === 'push') { q.pushing = true; }
          if (pin.scene === 'cheer' && !pin.cheered) { q.cheerAt = this.gameTime; pin.cheered = true; }
          // walk / run: he starts at the switch and stops 0.8 s later (the start and the stop both show); the cycle runs on game time
          const on = dt < pin.sw + 0.8;
          if ((pin.scene === 'walk' || pin.scene === 'run') && on) { q.vx = (pin.scene === 'walk' ? 60 : 150) * (q.facing || 1); q.walkCycle = (dt - pin.sw) * Math.abs(q.vx) * 0.08; }
          if (pin.scene === 'jab' && on) { q.attackMove = 'jab'; q.attackU = Math.min(1, ((dt - pin.sw) % 0.4) / 0.35); }
          if (pin.scene === 'jab' && !on) { q.attackMove = undefined; q.attackU = undefined; }
        }
      }
      R.call(this);
    };
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
      const w = 90 * v.zoom * 1.4, h = 110 * v.zoom * 1.4;
      const clip = { x: Math.max(0, sx - w / 2), y: Math.max(0, sy - h + 6 * v.zoom), width: w, height: h };
      const f = path.join(outDir, `${st}-${scene}-t${dt.toFixed(2)}.png`);
      await page.screenshot({ path: f, clip });
      shots.push(f);
    }
    await page.clock.runFor(EVERY);
  }
  console.log(st, scene, 'shots', shots.length);
  await page.evaluate(() => { window.__pin = null; });
}
await browser.close();
vite.kill();
process.exit(0);   // (ART-NEXT-d: vite.kill stops only the npx wrapper; without this the run never returned)
