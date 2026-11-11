// R-165.62 stills: 1-1 seed 3747 (proven index 9), w1-log-chain-rise, real put-backs (out past the first log, falling: A1's soft fall
// sets him back), upright and sideways, dsf 1. Easy: Dot's line at 3, the grown steps at 8. Normal: the line at 3, the offer at 12 with
// its two pictures, then Escape (Back) = no. Dot's bubble is read every 250 ms the whole way (the "Flick up and forward" count).
// node reference/qa-reports/R-165.62/shoot.mjs <outdir>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = process.cwd(), out = process.argv[2], port = 5198, idx = 9;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = ''; vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const report = {};
for (const setting of ['easy', 'normal']) for (const o of [{ id: 'port', viewport: { width: 412, height: 915 } }, { id: 'land', viewport: { width: 915, height: 412 } }]) {
  const tag = `${setting}-${o.id}`;
  if (process.env.ONLY && !tag.includes(process.env.ONLY)) continue;
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(([i, s]) => { const order = [i, ...Array.from({ length: 138 }, (_, j) => j).filter((j) => j !== i)]; localStorage.setItem('sloth_difficulty', s); localStorage.setItem('sloth_coach_done', '1'); localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 138, order, i: 0 })); }, [idx, setting]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(tag, 'pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  await page.evaluate((i) => window.__play('1-1', i + 1), idx);
  await sleep(5000);
  const info = await page.evaluate(() => {
    const e = window.__engine();
    const s = e.currentStage;
    const pc = s.meta.pieces.find((q) => q.k === 'w1-log-chain-rise');
    const logs = s.platforms.filter((p) => p.type === 'solid' && p.style === 'log' && p.width >= 300 && p.x >= pc.x0 - 2 && p.x + p.width <= pc.x1 + 2).sort((a, b) => a.x - b.x);
    window.__L = logs[0];
    window.__said = [];
    // (what the engine sent Dot's guide, and when, against the put-backs: the source of any line in her bubble)
    window.__cb = [];
    const cb = e.callbacks;
    for (const k of ['onGuide', 'onLesson', 'onCoach']) { const f = cb[k]; if (f) cb[k] = (...a) => { window.__cb.push([Math.round(e.gameTime * 10) / 10, k, String(a[0]).slice(0, 60)]); return f(...a); }; }
    window.__bub = '';
    // (Dot's bubble, as the player reads it: each new text once)
    setInterval(() => { const b = document.querySelector('.dg-bub-body'); const t = b ? b.textContent.trim() : ''; if (t && t !== window.__bub) window.__said.push(t); window.__bub = t; }, 250);
    const p = e.player, L = window.__L;
    Object.assign(p, { x: L.x + 120, y: L.y, vx: 0, vy: 0, grounded: true });
    e.camera.x = e.camera.targetX = Math.max(0, p.x - e.camera.viewportWidth * 0.4);
    return { seed: s.gen2.seed, help: e.helpState().on, L: [L.x, L.y, L.width] };
  });
  console.log(tag, JSON.stringify(info));
  await sleep(1500);
  const putBack = async () => {
    await page.evaluate(() => { const e = window.__engine(); const p = e.player; p.x = window.__L.x + window.__L.width + 150; p.y = window.__L.y + 420; p.vy = 300; p.grounded = false; });
    await page.evaluate(() => window.__cb.push([Math.round(window.__engine().gameTime * 10) / 10, 'putBack']));
    for (let i = 0; i < 20; i++) { await sleep(150); if (await page.evaluate(() => window.__engine().player.grounded || !!window.__engine().helpState().asking)) break; }
    await sleep(500);
  };
  const shot = async (name) => page.screenshot({ path: `${out}/${tag}-${name}.png` });
  for (let n = 1; n <= 3; n++) await putBack();
  await sleep(Number(process.env.WAIT ?? 700));
  await shot('03-line');
  const last = setting === 'easy' ? 8 : 12;
  for (let n = 4; n <= last; n++) await putBack();
  await sleep(1200);
  if (setting === 'easy') {
    // (framed on the first grown step, the log he is set back on in view)
    await page.evaluate(() => { const e = window.__engine(); const g = e.helpState().grown[0]; Object.assign(e.player, { x: g.x - 120, y: g.y + g.height, vx: 0, vy: 0 }); });
    await sleep(1500);
    await shot('08-step');
    // walk him up to the first grown step, standing on it
    await page.evaluate(() => { const e = window.__engine(); const g = e.helpState().grown[0]; Object.assign(e.player, { x: g.x + g.width / 2, y: g.y, vx: 0, vy: 0 }); });
    await sleep(1200);
    await shot('08-on-step');
  } else {
    await page.locator('.ho-scrim').waitFor({ state: 'visible', timeout: 10000 });
    await sleep(600);
    await shot('12-offer');
    const held = await page.evaluate(async () => { const e = window.__engine(); const a = [e.player.x, e.gameTime]; await new Promise((r) => setTimeout(r, 800)); return { paused: e.helpState().paused, still: e.player.x === a[0] && e.gameTime === a[1] }; });
    await page.keyboard.press('Escape');
    await sleep(800);
    const gone = await page.evaluate(() => ({ offer: !!document.querySelector('.ho-scrim'), pauseMenu: !!document.querySelector('.pm-card'), asking: !!window.__engine().helpState().asking, grown: window.__engine().helpState().grown.length }));
    report[`${tag}-back`] = { held, gone };
    await shot('12-after-back');
  }
  report[tag] = await page.evaluate(() => ({ cb: window.__cb.map((c) => c.join(' ')), said: window.__said, flickUp: window.__said.filter((t) => /flick up and forward to jump/i.test(t)).length, events: window.__engine().helpState() }));
  delete report[tag].events.grown;
  await ctx.close();
}
fs.writeFileSync(`${out}/stills.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
await browser.close();
vite.kill();
