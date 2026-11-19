/**
 * FIX-284 pad stills: real frames of a stage's pond (default 2-2, designed roll ?layout=1), Pokey pinned standing on each chosen pad.
 *   node reference/qa-reports/FIX-284/shootpads.mjs <outDir> [stage] [port] [which: big|all|crown] [settings: normal|easy]
 * Upright 412x915 and sideways 915x412, dsf 1. Pins him on the pad's middle (and its two ends with ENDS=1) a short moment after
 * landing, so a weight pad is still up. Prints, per shot, the pad's floor (x, width, top) and Pokey's feet, for the report.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [outDir, stageArg, portArg, whichArg, setArg] = process.argv.slice(2);
const stage = stageArg || '2-2', port = Number(portArg || 5207), which = whichArg || 'big', settings = setArg || 'normal';
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ORIENTS = [
  { id: 'land', viewport: { width: 915, height: 412 } },
  { id: 'port', viewport: { width: 412, height: 915 } },
];
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  if (settings === 'easy') await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'easy'); } catch {} });
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off${settings === 'easy' ? '&difficulty=easy' : ''}`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) {
    if (await page.evaluate(() => typeof window.__play === 'function')) break;
    await sleep(1000);
  }
  await sleep(3000);
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate((id) => window.__play(id), stage);
    await sleep(4000);
    ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
  }
  if (!ok) { console.log(stage, o.id, 'no engine'); continue; }
  const spots = await page.evaluate(({ which, ends }) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const s = e.currentStage;
    const pads = (s.platforms || []).filter((p) => which === 'crown' ? p.art === 'crownLily' : which === 'all' ? (!!p.pad || p.art === 'crownLily') : !!p.pad && (p.pad.look === 'big' || (p.pad.look === 'beat' && p.width > 150)));
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin;
      // a one-time drop: set him just over the pad's floor once, then physics lands him (a pin every frame drew him off his floor)
      if (pin && this.player && !pin.done) { const p = this.player; p.x = pin.x - (p.width || 0) / 2; p.y = pin.y - (p.height || 40) - 2; p.vx = 0; p.vy = 0; pin.done = true; }
      if (this.lives < 5) this.lives = 9;
      R.call(this);
    };
    const out = [];
    for (const p of pads) {
      const fr = ends ? [0.12, 0.5, 0.88] : [0.5];
      for (const f of fr) out.push({ x: Math.round(p.x + p.width * f), y: p.y, id: p.id, px: p.x, pw: p.width, look: p.pad ? p.pad.look : p.art, f });
    }
    return out;
  }, { which, ends: process.env.ENDS === '1' });
  console.log(o.id, 'pads', spots.length);
  await sleep(Number(process.env.CARD_MS || 7000)); // the stage card goes
  for (const sp of spots) {
    await page.evaluate((p) => { window.__pin = p; }, sp);
    await sleep(Number(process.env.SETTLE_MS || 500));
    const feet = await page.evaluate((id) => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; const p = e.player; const pl = e.currentStage.platforms.find((q) => q.id === id); return { x: Math.round(p.x), feet: Math.round(p.y + p.height), w: p.width, h: p.height, onGround: p.onGround, padTopNow: pl && Math.round(pl.y) }; }, sp.id);
    const f = path.join(outDir, `${stage}-${settings}-${o.id}-pad${sp.id}-${Math.round(sp.f * 100)}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f, JSON.stringify({ pad: { id: sp.id, x: sp.px, w: sp.pw, top: sp.y, look: sp.look }, pokey: feet }));
  }
  await page.evaluate(() => { window.__pin = null; });
  await ctx.close();
}
await browser.close();
vite.kill();
