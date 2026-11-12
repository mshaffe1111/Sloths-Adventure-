/**
 * P12S: stills of the REAL game's 1-2 (the listed road, no hook): the start, the first bounce chain, the thorn floor, the hardest beat
 * (the signature chain), the end; upright 390x844 and sideways 844x390, dsf 1. Dev vite (window.__play / __engine), ?layout=N.
 *   node reference/qa-reports/P12S/shoot12.mjs <outDir> [layout] [port] [easy]
 * Pokey is set down just above each spot once (kitaudit/shoot.mjs's render wrapper, one frame) and lands by the game's own physics.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const [outDir, layoutArg, portArg, easyArg] = process.argv.slice(2);
const layout = Number(layoutArg || 1), port = Number(portArg || 5207), easy = easyArg === 'easy';
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
console.log('vite', /Local:|ready in/.test(vout));
const browser = await chromium.launch();
const ORIENTS = [{ id: 'up', viewport: { width: 390, height: 844 } }, { id: 'side', viewport: { width: 844, height: 390 } }];
const meta = [];
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  if (easy) await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'easy'); } catch {} });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=${layout}&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  console.log(o.id, 'page up', await page.evaluate(() => typeof window.__play));
  await sleep(3000);
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate(() => window.__play('1-2'));
    await sleep(6000);
    ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
  }
  if (!ok) { console.log(o.id, 'no engine'); continue; }
  const spots = await page.evaluate(() => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const s = e.currentStage, g = s.gen2 || {};
    const secs = g.sections || [], plan = (g.plan || []).map((p) => p.template);
    const at = (pred) => { const i = plan.findIndex(pred); return i >= 0 && secs[i] ? secs[i] : null; };
    const standAt = (x) => { const ps = s.platforms.filter((p) => p.type === 'solid' && p.pit !== 'hurt' && p.x <= x && p.x + p.width >= x); ps.sort((a, b) => a.y - b.y); const p = ps[0]; return p ? { x: Math.round(x), y: p.y } : null; };
    const teach = at((t) => t === 'lib-thorn-teach'), sig = at((t) => t === 'lib-thorn-chain' || t === 'lib-thorn-chain-rise');
    const hurt = s.platforms.filter((p) => p.pit === 'hurt').sort((a, b) => a.x - b.x)[0];
    const out = [
      ['1-start', standAt(s.spawnX + 60)],
      ['2-first-chain', teach ? standAt(teach.x0 + (teach.x1 - teach.x0) * 0.55) || standAt(teach.x0 + 40) : null],
      ['3-thorn-floor', hurt ? standAt(hurt.x - 40) : null],
      ['4-hardest', sig ? standAt(sig.x0 + (sig.x1 - sig.x0) * 0.5) || standAt(sig.x0 + 40) : null],
      ['5-end', standAt(s.exitTotemX - 120)],
    ];
    const R = Object.getPrototypeOf(e).render;
    e.render = function () { const pin = window.__pin; if (pin && this.player) { window.__pin = null; const p = this.player; p.x = pin.x; p.y = pin.y - (p.height || 40) - 30; p.vx = 0; p.vy = 0; p.grounded = false; if (this.lives < 5) this.lives = 9; } R.call(this); };
    return { seed: g.seed, plan, w: s.config.levelWidth, diff: s.difficulty ?? null, spots: out };
  });
  meta.push({ orient: o.id, seed: spots.seed, plan: spots.plan, w: spots.w });
  for (const [name, p] of spots.spots) {
    if (!p) { console.log('no spot', name); continue; }
    await page.evaluate((q) => { window.__pin = q; }, p);
    await sleep(Number(process.env.SETTLE_MS || 2500));
    const f = path.join(outDir, `${name}-${o.id}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f, p.x, p.y);
  }
  await ctx.close();
}
fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 1));
await browser.close();
vite.kill();
