// Rotation with the offer up, through the browser's own device emulation (CDP), both ways. node rotate.mjs <port> <out>
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const VP = { port: { width: 412, height: 915 }, land: { width: 915, height: 412 } };
const report = {};
for (const o of ['port', 'land']) {
  const other = o === 'port' ? 'land' : 'port';
  const ctx = await browser.newContext({ viewport: VP[o], deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { const order = [1, ...Array.from({ length: 200 }, (_, j) => j).filter((j) => j !== 1)]; localStorage.setItem('sloth_difficulty', 'normal'); localStorage.setItem('sloth_coach_done', '1'); localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 200, order, i: 0 })); });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(2500);
  await page.evaluate(() => window.__play('1-1', 2));
  for (let t = Date.now(); Date.now() - t < 90000; ) { if (await page.evaluate(() => typeof window.__engine === 'function' && !!window.__engine()?.currentStage?.meta?.pieces)) break; await sleep(500); }
  await sleep(4500);
  await page.evaluate(() => { const e = window.__engine(), s = e.currentStage, pc = s.meta.pieces.find((q) => q.k === 'w1-log-chain-rise'); const L = s.platforms.filter((p) => p.type === 'solid' && p.style === 'log' && p.width >= 300 && p.x >= pc.x0 - 2 && p.x + p.width <= pc.x1 + 2).sort((a, b) => a.x - b.x)[0]; window.__L = L; Object.assign(e.player, { x: L.x + 120, y: L.y, vx: 0, vy: 0, grounded: true }); });
  await sleep(1200);
  for (let n = 1; n <= 12; n++) {
    await page.evaluate(() => { const e = window.__engine(); const p = e.player; p.x = window.__L.x + window.__L.width + 150; p.y = window.__L.y + 420; p.vy = 300; p.grounded = false; });
    for (let i = 0; i < 20; i++) { await sleep(150); if (await page.evaluate(() => window.__engine().player.grounded || !!window.__engine().helpState().asking)) break; }
    await sleep(450);
  }
  await page.locator('.ho-scrim').waitFor({ state: 'visible', timeout: 10000 });
  await sleep(600);
  const read = () => page.evaluate(() => { const q = (s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; }; const h = window.__engine().helpState(); return { w: innerWidth, h: innerHeight, card: q('.ho-card'), yes: q('.ho-yes'), no: q('.ho-no'), say: q('.ho-say'), asking: !!h.asking, paused: h.paused, canvas: q('canvas') }; });
  const R = (report[o] = { errs });
  R.before = await read();
  const cdp = await ctx.newCDPSession(page);
  const turn = async (to) => { await cdp.send('Emulation.setDeviceMetricsOverride', { width: VP[to].width, height: VP[to].height, deviceScaleFactor: 1, mobile: true, screenOrientation: to === 'land' ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } }); await sleep(1500); };
  await turn(other);
  R.turned = await read();
  await page.screenshot({ path: `${out}/rotate-from-${o}-turned.png` });
  // inside the screen, 44 px taps, the card whole
  const inside = (b, v) => b && b[0] >= 0 && b[1] >= 0 && b[0] + b[2] <= v.w && b[1] + b[3] <= v.h;
  R.ok = { cardInside: inside(R.turned.card, R.turned), yesInside: inside(R.turned.yes, R.turned), noInside: inside(R.turned.no, R.turned), stillAsking: R.turned.asking && R.turned.paused };
  await turn(o);
  R.back = await read();
  await page.screenshot({ path: `${out}/rotate-from-${o}-back.png` });
  // answer with a finger after the turns: NO, then play goes on
  const b = await page.locator('.ho-no').boundingBox();
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  await sleep(1200);
  R.afterNo = await page.evaluate(() => { const h = window.__engine().helpState(); return { asking: !!h.asking, paused: h.paused, offer: !!document.querySelector('.ho-scrim'), pm: !!document.querySelector('.pm-card') }; });
  await ctx.close();
}
fs.writeFileSync(`${out}/rotate.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report));
await browser.close();
process.exit(0);
