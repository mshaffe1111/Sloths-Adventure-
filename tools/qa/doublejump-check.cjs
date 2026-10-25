/**
 * Retest: does a second flick up give a double jump, with and without a steering thumb down? (QA, batch 2, 2026-10-25)
 *   node tools/qa/doublejump-check.cjs 'http://127.0.0.1:<port>/?proto=1'     (a dev build, as for server.cjs)
 * Prints, for each case, the rise in px, whether player.isDoubleJumping was seen, and the touch intents the game produced.
 * Passes when every row shows doubleJump: true.
 */
const { chromium } = require('playwright');
const URL = process.argv[2];
async function trial(browser, gap, steering) {
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const T0 = Date.UTC(2026, 9, 25, 12);
  await page.clock.install({ time: T0 }); await page.clock.pauseAt(T0 + 1000);
  await page.goto(URL + '&layout=1');
  await page.clock.runFor(3500);
  await page.evaluate(() => { window.__play('1-1'); });
  await page.clock.runFor(3000);
  // close any card
  for (let i = 0; i < 4; i++) { const b = page.locator('button', { hasText: /Got it/ }); if (await b.count()) { await page.clock.runFor(1200); await b.first().click(); await page.clock.runFor(300); } }
  const st = () => page.evaluate(() => { const e = window.__engine(); const p = e.player; return { y: Math.round(p.y), g: p.grounded, dj: !!p.isDoubleJumping, jl: p.jumpsLeft, paused: e.isPaused }; });
  const pts = [];
  let steer = null, act = null;
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...(steer ? [{ x: steer.x, y: steer.y, id: 1 }] : []), ...(act ? [{ x: act.x, y: act.y, id: 2 }] : [])] });
  if (steering) { steer = { x: 70, y: 520 }; await send('touchStart'); for (let k = 0; k < 4; k++) { steer.x += 18; await send('touchMove'); await page.clock.runFor(25); } await page.clock.runFor(300); }
  await page.evaluate(() => { const i = window.__engine().input; window.__log = []; for (const m of ['triggerTouchUp','releaseTouchUp','triggerTouchKick','triggerTouchPunch','triggerTouchMega','triggerTouchDuck','triggerTouchMove','triggerTouchClimb']) { const f = i[m].bind(i); i[m] = (...a) => { window.__log.push(m.replace('triggerTouch','').replace('releaseTouch','rel') + (a.length ? '(' + a.join(',') + ')' : '')); return f(...a); }; } });
  const s0 = await st();
  async function flick() { act = { x: 310, y: 450 }; await send('touchStart'); for (let k = 0; k < 3; k++) { await page.clock.runFor(20); act.y -= 27; await send('touchMove'); } await page.clock.runFor(20); act = null; await send('touchEnd'); }
  await flick();
  let minY = 1e9, sawDJ = false;
  for (let t = 0; t < gap; t += 10) { await page.clock.runFor(10); }
  await flick();
  for (let t = 0; t < 1500; t += 33) { await page.clock.runFor(33); const s = await st(); minY = Math.min(minY, s.y); sawDJ = sawDJ || s.dj; }
  const log = await page.evaluate(() => window.__log.join(' '));
  await ctx.close();
  return { log, gap, steering, startY: s0.y, grounded0: s0.g, rise: s0.y - minY, doubleJump: sawDJ, paused: s0.paused };
}
(async () => {
  const b = await chromium.launch();
  const out = [];
  for (const steering of [false, true]) for (const gap of [80, 250]) out.push(await trial(b, gap, steering));
  // single flick baseline
  for (const o of out) console.log(JSON.stringify(o));
  await b.close();
})();
