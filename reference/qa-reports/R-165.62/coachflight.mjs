// flight: 1-1 Easy seed 3747, fresh save with the first-run touch coach on; put-backs at the coach's first jump spot; Dot's bubble read every 250 ms
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = process.cwd(), port = 5197, idx = 9;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = ''; vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await ctx.addInitScript(([i, s]) => { const order = [i, ...Array.from({ length: 138 }, (_, j) => j).filter((j) => j !== i)]; localStorage.setItem('sloth_difficulty', s); localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 138, order, i: 0 })); }, [idx, process.argv[2] ?? 'easy']);
const page = await ctx.newPage();
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
  return { spot: e.coach?.spot, x: e.player.x, y: e.player.y, coach: !!e.coach };
});
console.log(JSON.stringify(info));
// run him (really) toward the first jump spot: hold right on the keyboard until near it
await page.keyboard.down('ArrowRight');
for (let i = 0; i < 60; i++) { await sleep(200); const x = await page.evaluate(() => window.__engine().player.x); if (info.spot && x > info.spot - 30) break; }
await page.keyboard.up('ArrowRight');
await sleep(2500);
const ground = await page.evaluate(() => { const e = window.__engine(); window.__G = { x: e.player.x, y: e.player.y }; return window.__G; });
console.log('at', JSON.stringify(ground));
for (let n = 1; n <= 6; n++) {
  // walk off the edge for real: hold right until he falls and is set back
  await page.evaluate(() => window.__cb.push([Math.round(window.__engine().gameTime * 10) / 10, 'walkOff']));
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 40; i++) { await sleep(100); if (await page.evaluate(() => window.__engine().player.y > window.__G.y + 150)) break; }
  await page.keyboard.up('ArrowRight');
  await sleep(4000);
}
console.log(JSON.stringify(await page.evaluate(() => ({ cb: window.__cb, said: window.__said, falls: window.__engine().helpState() })), null, 0));
await browser.close();
vite.kill();
