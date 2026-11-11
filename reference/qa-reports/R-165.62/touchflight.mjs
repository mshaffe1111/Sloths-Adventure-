// R-165.62 attempt 3: ONE browser flight on Normal with TOUCH input (real touch events through CDP, not keys): a fresh save, so the
// first-run touch coach is on; 1-1 seed 3747. He runs with a thumb slide, jumps with flicks through the coach's first gap, then is set
// back 8 times at the chain (dropped past its first log: A1's soft fall). Dot's bubble is read every 250 ms the whole way; the count of
// "Flick up and forward to jump." is the result. Then, with the offer up (12 put-backs), the browser's Back (history.back, a back swipe)
// must answer no: the offer gone, no pause menu. node reference/qa-reports/R-165.62/touchflight.mjs <outdir>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = process.cwd(), out = process.argv[2], port = 5196, idx = 9;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = ''; vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await ctx.addInitScript((i) => { const order = [i, ...Array.from({ length: 138 }, (_, j) => j).filter((j) => j !== i)]; localStorage.setItem('sloth_difficulty', 'normal');  localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 138, order, i: 0 })); }, idx);
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
const cdp = await ctx.newCDPSession(page);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
await page.goto(`http://127.0.0.1:${port}/?layout=1`, { timeout: 300000 });
for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
await sleep(3000);
await page.evaluate((i) => window.__play('1-1', i + 1), idx);
await sleep(4000);
const info = await page.evaluate(() => {
  const e = window.__engine();
  window.__said = []; window.__bub = ''; window.__cb = [];
  setInterval(() => { const b = document.querySelector('.dg-bub-body'); const t = b ? b.textContent.trim() : ''; if (t && t !== window.__bub) window.__said.push([Math.round(e.gameTime * 10) / 10, t]); window.__bub = t; }, 250);
  const cb = e.callbacks;
  for (const k of ['onGuide', 'onLesson', 'onCoach']) { const f = cb[k]; if (f) cb[k] = (...a) => { window.__cb.push([Math.round(e.gameTime * 10) / 10, k, String(a[0]).slice(0, 60)]); return f(...a); }; }
  return { coach: !!e.coach, spot: e.coach?.spot, x: Math.round(e.player.x), input: e.input?.source };
});
console.log('start', JSON.stringify(info));
// run: a thumb down on the lower screen, slid right and held
const run = async (ms) => { await touch('touchStart', 120, 760); for (let i = 1; i <= 6; i++) { await touch('touchMove', 120 + i * 12, 760); await sleep(16); } await sleep(ms); };
// a flick: the thumb (already down and running) slides up and forward quickly, then back to the run
const flick = async () => { for (let i = 1; i <= 4; i++) { await touch('touchMove', 192 + i * 10, 760 - i * 28); await sleep(16); } await sleep(250); for (let i = 1; i <= 4; i++) { await touch('touchMove', 232 - i * 10, 648 + i * 28); await sleep(16); } };
await run(1500);
// toward the coach's jump spot, flicking as he gets there
for (let i = 0; i < 40; i++) {
  const s = await page.evaluate(() => ({ x: window.__engine().player.x, step: window.__engine().coach?.step ?? null, done: !window.__engine().coach || window.__engine().coach.done }));
  if (s.step === 'jump' || (info.spot && s.x > info.spot - 60)) { await flick(); await sleep(900); }
  if (s.done) break;
  await sleep(200);
}
await touch('touchEnd', 0, 0);
await sleep(1500);
const coachDone = await page.evaluate(() => !window.__engine().coach || window.__engine().coach.done);
// set back at the chain: dropped past its first log (the engine's own fall and A1's soft fall), 12 times (the offer comes at 12)
await page.evaluate(() => {
  const e = window.__engine(); const s = e.currentStage;
  const pc = s.meta.pieces.find((q) => q.k === 'w1-log-chain-rise');
  window.__L = s.platforms.filter((p) => p.type === 'solid' && p.style === 'log' && p.width >= 300 && p.x >= pc.x0 - 2 && p.x + p.width <= pc.x1 + 2).sort((a, b) => a.x - b.x)[0];
  Object.assign(e.player, { x: window.__L.x + 120, y: window.__L.y, vx: 0, vy: 0, grounded: true });
});
await sleep(1500);
for (let n = 1; n <= 12; n++) {
  await page.evaluate(() => { const e = window.__engine(); const p = e.player; p.x = window.__L.x + window.__L.width + 150; p.y = window.__L.y + 420; p.vy = 300; p.grounded = false; });
  for (let i = 0; i < 20; i++) { await sleep(150); if (await page.evaluate(() => window.__engine().player.grounded || !!window.__engine().helpState().asking)) break; }
  await sleep(n === 3 ? 6000 : 900);
}
await page.locator('.ho-scrim').waitFor({ state: 'visible', timeout: 15000 });
await sleep(600);
await page.screenshot({ path: `${out}/touch-normal-port-12-offer.png` });
// the browser's Back (a back swipe): a no
await page.evaluate(() => history.back());
await sleep(1500);
const back = await page.evaluate(() => ({ offer: !!document.querySelector('.ho-scrim'), pauseMenu: !!document.querySelector('.pm-card'), asking: !!window.__engine().helpState().asking, paused: window.__engine().helpState().paused }));
await page.screenshot({ path: `${out}/touch-normal-port-12-after-back-swipe.png` });
const res = await page.evaluate(() => ({ said: window.__said, cb: window.__cb.map((c) => c.join(' ')), input: window.__engine().input?.source }));
const flickUp = res.said.filter(([, t]) => /flick up and forward to jump/i.test(t)).length;
const report = { info, coachDone, flickUp, back, ...res };
fs.writeFileSync(`${out}/touchflight.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ coachDone, flickUp, back, input: res.input, said: res.said }, null, 1));
await browser.close();
vite.kill();
