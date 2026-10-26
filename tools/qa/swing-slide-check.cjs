/**
 * Retest: on a liana, does a steering thumb pumping sideways (Matt's swing-stage control test, 2026-10-26) let go of the vine? And does
 * a flick up and forward still let go at once? Plays 1-6 in the real engine, upright (Matt's 498x1034) and sideways, one thumb, touch
 * through CDP the way a phone sends it (a move every 16 ms).
 *   node tools/qa/swing-slide-check.cjs 'http://127.0.0.1:<port>/?lessons=off'     (a dev build, as for server.cjs)
 * Prints, per view, how many of the logged steering fingers let go (want 0) and how many flicks up and forward did (want all).
 */
const { chromium } = require('playwright');
const URL = process.argv[2];
/** finger travel from touch-down at the moment of each logged jump (px, + is down), and how long it had been down (ms) */
const LOGGED = [[108, 0, 974], [120, -10, 1008], [94, 10, 532], [101, 49, 974], [113, 48, 908], [72, 145, 841]];
const pump = (dx, dy, strokes, amp, arc) => (u) => { const k = Math.sin(u * Math.PI * strokes); return [dx * u + amp * k, dy * u + arc * Math.abs(k)]; };
const SHAPES = {
  slide: (dx, dy) => (u) => [dx * u, dy * u],
  pumpDip: (dx, dy) => pump(dx, dy, 5, 60, 25),
  pumpBow: (dx, dy) => pump(dx, dy, 5, 60, -40),
};
const VIEWS = { upright: { width: 498, height: 1034, thumb: [330, 760] }, sideways: { width: 1034, height: 466, thumb: [820, 330] } };

async function run(browser, viewName) {
  const v = VIEWS[viewName];
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const T0 = Date.UTC(2026, 9, 26, 12);
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 1000);
  await page.goto(URL + '&layout=1');
  await page.clock.runFor(3500);
  await page.evaluate(() => window.__play('1-6'));
  await page.clock.runFor(3000);
  for (let i = 0; i < 4; i++) { const b = page.locator('button', { hasText: /Got it/ }); if (await b.count()) { await page.clock.runFor(1200); await b.first().click(); await page.clock.runFor(300); } }
  await page.evaluate(() => {
    const i = window.__engine().input;
    window.__jumps = 0;
    const f = i.triggerTouchUp.bind(i);
    i.triggerTouchUp = () => { window.__jumps++; return f(); };
  });
  /** hang him on the stage's first liana, swinging a little, with no finger down */
  const seat = () => page.evaluate(() => {
    const e = window.__engine();
    const lianas = e.vines.filter((x) => x.vineType === 'swing_liana');
    const vine = lianas[1] || lianas[0];
    const p = e.player;
    p.x = vine.x + 10; p.y = vine.topY + (vine.bottomY - vine.topY) * 0.7; p.vx = 80; p.vy = 0; p.grounded = false; p.climbing = false; p.hanging = false;
    e.vineCooldownTimer = 0;
    e.input.state.right = true;
    return vine.id;
  });
  const state = () => page.evaluate(() => { const e = window.__engine(); return { s: !!e.player.isVineSwinging, jumps: window.__jumps, over: e.isGameOver }; });
  let id = 10;
  async function finger(path, ms, keep = false) {
    const [x0, y0] = v.thumb;
    const tid = ++id;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: tid }] });
    let letGo = false;
    for (let t = 16; t <= ms; t += 16) {
      await page.clock.runFor(16);
      const [dx, dy] = path(Math.min(1, t / ms));
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx, y: y0 + dy, id: tid }] });
      if (t % 64 === 0 && !(await state()).s) letGo = true;
    }
    await page.clock.runFor(100);
    if (!(await state()).s) letGo = true;
    const [dx, dy] = path(1);
    if (!keep) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: x0 + dx, y: y0 + dy, id: tid }] });
    return letGo;
  }
  const out = { view: viewName, steering: 0, steeringLetGo: 0, steeringJumps: 0, flicks: 0, flicksLetGo: 0, notSeated: 0 };
  for (const [dx, dy, ms] of LOGGED) {
    for (const [name, shape] of Object.entries(SHAPES)) {
      for (const side of [1, -1]) {
        await seat();
        await page.clock.runFor(100);
        await page.evaluate(() => { window.__engine().input.state.right = false; });
        await page.clock.runFor(300); // (past the grab's 0.25 s grace, so a press now would let go)
        if (!(await state()).s) { out.notSeated++; continue; }
        const j0 = (await state()).jumps;
        out.steering++;
        if (await finger((u) => { const [a, b] = shape(dx, dy)(u); return [a * side, b]; }, ms)) {
          out.steeringLetGo++;
          // (no jump: he landed on something the swing carried him to, or climbed down off the end, which is not the touch rules letting go)
          const why = await page.evaluate(() => { const p = window.__engine().player; return p.grounded ? 'landed' : p.climbing ? 'climbing' : 'in the air'; });
          (out.letGoWhy ||= []).push(`(${dx * side},${dy},${ms}) ${name}: ${why}, jumps ${(await state()).jumps - j0}`);
        }
        out.steeringJumps += (await state()).jumps - j0;
        void name;
      }
    }
  }
  // flicks up and forward (Steph's: about 200 px in 200 ms, 20 to 40 degrees over), either way
  for (const lean of [22, 30, 40]) {
    for (const side of [1, -1]) {
      await seat();
      await page.clock.runFor(100);
      await page.evaluate(() => { window.__engine().input.state.right = false; });
      await page.clock.runFor(300);
      if (!(await state()).s) { out.notSeated++; continue; }
      out.flicks++;
      const r = (lean * Math.PI) / 180;
      if (await finger((u) => [side * Math.sin(r) * 200 * u, -Math.cos(r) * 200 * u], 200)) out.flicksLetGo++;
    }
  }
  await ctx.close();
  return out;
}

(async () => {
  const b = await chromium.launch();
  for (const view of Object.keys(VIEWS)) console.log(JSON.stringify(await run(b, view)));
  await b.close();
})();
