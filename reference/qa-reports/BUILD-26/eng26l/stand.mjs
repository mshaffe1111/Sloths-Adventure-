// Stills at dsf 2 with Dot's cards tapped away and Pokey set down once and left to land and stand (ENG-26l: a copy of eng26h/tools/pin.mjs, whose
// render pin froze him in the air pose under a paused card). usage: node stand.mjs <root> <outDir> <stage> <layout> <difficulty> <port> <name:x:y,...>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const [root, outDir, st, layout, diff, portS, spotsS] = process.argv.slice(2);
const { chromium } = createRequire(path.join(root, 'package.json'))('playwright');
const port = Number(portS);
const spots = spotsS.split(',').map((s) => { const [name, x, y] = s.split(':'); return { name, x: Number(x), y: Number(y) }; });
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ORIENTS = [{ id: 'side', viewport: { width: 844, height: 390 } }, { id: 'up', viewport: { width: 390, height: 844 } }];
try {
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  if (diff === 'easy') await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'easy'); } catch {} });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=${layout}&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate((id) => window.__play(id), st);
    await sleep(8000);
    ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
  }
  if (!ok) { console.log(st, o.id, 'no engine'); continue; }
  const info = await page.evaluate(() => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const s = e.currentStage;
    const R = Object.getPrototypeOf(e).render;
    return { w: s.config?.levelWidth, h: s.config?.levelHeight, seed: s.gen2?.seed, proven: s.gen2?.proven, n: s.platforms.length, diff: e.difficulty ?? null };
  });
  console.log(o.id, JSON.stringify(info));
  const hint = "Tap here when you've read it";
  const skip = async () => { const b = page.getByText('Skip tips'); if (await b.count()) { await b.first().click({ force: true }).catch(() => {}); await sleep(1200); } };
  await skip();
  for (let k = 0; k < 8; k++) { const c = page.getByText(hint); if (!(await c.count())) break; await sleep(2500); await c.first().click({ force: true }).catch(() => {}); await sleep(1500); }
  console.log(o.id, 'cards left', await page.getByText(hint).count());
  for (const sp of spots) {
    await page.evaluate((pin) => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; const p = e.player; p.x = pin.x; p.y = pin.y - (p.height || 40) - 4; p.vx = 0; p.vy = 0; if (e.lives < 5) e.lives = 9; }, sp);
    await sleep(2500);
    for (let k = 0; k < 8; k++) { const c = page.getByText(hint); if (!(await c.count())) break; await sleep(2500); await c.first().click({ force: true }).catch(() => {}); await sleep(1500); }
    await skip();
    await sleep(800);
    const at = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; const p = e.player; return { x: Math.round(p.x), feet: Math.round(p.y + (p.height || 40)), w: p.width, h: p.height, grounded: p.grounded ?? p.onGround ?? null }; });
    console.log(sp.name, o.id, JSON.stringify(at));
    const f = path.join(outDir, `${st}-${diff}-L${layout}-${sp.name}-${o.id}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f);
  }
  await ctx.close();
}
} finally { await browser.close(); try { process.kill(-vite.pid); } catch {} }
