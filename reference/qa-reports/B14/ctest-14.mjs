/**
 * The testers' front still of 1-4 (src/assets/ui/ctest-1-4.webp, 880x425 like ctest-1-1.webp): the real game on Normal, Pokey holding
 * two field vines in a field with a fig bunch in view, the HUD hidden. Writes <out>.png; the caller converts it to webp.
 *   node reference/qa-reports/B14/ctest-14.mjs <out.png> <port> [seed] [template] [vineA] [rise px] [dx px]
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, portArg, seedArg = '1', tpl = 'w1-14-under-fire', vineArg = '1', riseArg = '140', dxArg = '0'] = process.argv.slice(2);
const port = Number(portArg);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 880, height: 425 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
await ctx.addInitScript(() => { Element.prototype.requestFullscreen = function () { return Promise.resolve(); }; });
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
await page.evaluate(() => localStorage.setItem('sloth_difficulty', 'normal'));
await page.reload({ timeout: 300000 });
await sleep(2500);
await page.evaluate(([id, v]) => window.__play(id, v), ['1-4', Number(seedArg)]);
for (let t = Date.now(); Date.now() - t < 120000; ) {
  const ok = await page.evaluate(() => { const e = (typeof window.__engine === 'function' ? (typeof window.__engine === 'function' ? window.__engine() : window.__engine) : window.__engine); return !!(e?.currentStage?.gen2 && e.currentStage.config.id === '1-4'); });
  if (ok) break;
  await sleep(500);
}
await sleep(3000);
const at = await page.evaluate(([tpl, n]) => {
  const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine), st = e.currentStage;
  const s = st.gen2.sections.find((q) => q.template === tpl);
  const a = st.vines.find((v) => v.tag === `${s.uid}:f${n}`), b = st.vines.find((v) => v.tag === `${s.uid}:f${n + 1}`);
  return { ax: a.x, bx: b.x, foot: a.bottomY };
}, [tpl, Number(vineArg)]);
// (on the foot between the two vines, then up: the field's two-hand hold, then a rise up them)
await page.evaluate((at) => { const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine); Object.assign(e.player, { x: (at.ax + at.bx) / 2 + Number(0), y: at.foot - 2, vx: 0, vy: 0, grounded: true, climbing: false }); }, at);
await sleep(600);
await page.keyboard.down('ArrowUp');
await sleep(Number(riseArg) * 3);
await page.keyboard.up('ArrowUp');
if (Number(dxArg)) { const k = Number(dxArg) > 0 ? 'ArrowRight' : 'ArrowLeft'; await page.keyboard.down(k); await sleep(Math.abs(Number(dxArg))); await page.keyboard.up(k); }
await sleep(700);
const info = await page.evaluate(() => { const p = (typeof window.__engine === 'function' ? window.__engine() : window.__engine).player; return { x: Math.round(p.x), y: Math.round(p.y), climbing: p.climbing, pair: p.climbPair }; });
console.log('player', JSON.stringify(info), 'vines', at.ax, at.bx);
// (the HUD off: every DOM layer over the canvas hidden, the game's own frame kept)
await page.evaluate(() => { const c = document.querySelector('canvas'); for (const el of document.body.querySelectorAll('*')) { if (el === c || el.contains(c)) continue; if (getComputedStyle(el).position === 'fixed' || getComputedStyle(el).position === 'absolute') el.style.visibility = 'hidden'; } });
await sleep(200);
await page.locator('canvas').first().screenshot({ path: out });
await browser.close();
vite.kill();
process.exit(0);
