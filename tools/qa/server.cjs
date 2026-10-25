/**
 * Blind play-test harness: one phone-sized browser playing the dev build, driven only by the keys a player presses.
 *
 *   node tools/qa/server.cjs <port> <game url> <out dir>        (then drive it with tools/qa/qa.cjs)
 *
 * The page's clock is faked (Playwright clock): the game only moves while a command runs, so a tester can look, think and then act,
 * the way a player who pauses would. Nothing here reads the game's insides: a tester sees the screenshots and the text on screen.
 * `start` is the one exception: it opens a stage straight away (window.__play) so a tester need not walk the map.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [port, url, outDir] = [Number(process.argv[2] || 4401), process.argv[3] || 'http://127.0.0.1:4303/', process.argv[4] || '/tmp/qa'];
fs.mkdirSync(outDir, { recursive: true });
// (to stop it: kill $(cat <out dir>/server.pid))
fs.writeFileSync(path.join(outDir, 'server.pid'), String(process.pid));

const KEYS = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', jump: 'Space', punch: 'KeyJ', kick: 'KeyK', mega: 'KeyL' };
const VIEWS = { land: { width: 844, height: 390 }, port: { width: 400, height: 720 } };
let browser, page, cdp, shotN = 0, view = 'land';
/** the steering thumb (left side) while it is down: where it went down, and where it is now */
let steer = null;
/** errors the page threw since the last command (a player would see a freeze or a blank screen; a tester should hear about it) */
const errors = [];

async function open(stage, v, flag = 0) {
  if (page) await page.close().catch(() => {});
  view = VIEWS[v] ? v : 'land';
  // (a phone: touch screen, mobile browser, so the game shows and reads its touch controls)
  const ctx = await browser.newContext({ viewport: VIEWS[view], deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
  page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('page error: ' + e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push('console error: ' + m.text().slice(0, 200)));
  cdp = await ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  steer = null;
  await page.clock.install();
  await page.goto(url);
  await page.clock.runFor(3500);
  await page.evaluate((id) => window.__play(id), stage);
  await page.clock.runFor(3000);
  // a later flag to start from, the way a play-tester is handed a checkpoint select (the stage itself is untouched)
  if (flag > 0) {
    const ok = await page.evaluate((n) => {
      const e = window.__engine();
      const cps = [...(e.currentStage.checkpoints ?? [])].sort((a, b) => a.x - b.x);
      const cp = cps[Math.min(n, cps.length) - 1];
      if (!cp) return 0;
      for (const c of e.currentStage.checkpoints) if (c.x <= cp.x) c.reached = true;
      e.checkpoint = { x: cp.x, y: cp.y };
      e.respawnAtCheckpoint('hurt');
      return cps.length;
    }, flag);
    await page.clock.runFor(1500);
    return ok;
  }
  return 0;
}

/** what is written on screen (the HUD, cards, Dot's lines), as a player would read it */
async function screenText() {
  return page.evaluate(() => {
    const t = (document.body.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
    return `[game time ${Math.round(performance.now() / 1000)} s] ` + [...new Set(t)].slice(0, 40).join(' | ');
  });
}

async function shot(tag = '') {
  const p = path.join(outDir, `${String(++shotN).padStart(4, '0')}${tag ? '-' + tag : ''}.png`);
  await page.screenshot({ path: p });
  return p;
}

// ───── touch: the phone's real controls (TouchController.tsx / touchGestures.ts read these) ─────
const W = () => VIEWS[view].width, H = () => VIEWS[view].height;
let actionAt = null;
const points = () => [...(steer ? [{ x: steer.x, y: steer.y, id: 1 }] : []), ...(actionAt ? [{ x: actionAt.x, y: actionAt.y, id: 2 }] : [])];
const touch = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points() });
const frames = async (ms) => { for (let t = 0; t < ms; t += 33) await page.clock.runFor(Math.min(33, ms - t)); };
async function steerTo(dir) {
  if (!steer) {
    steer = { ax: Math.round(W() * 0.18), ay: Math.round(H() * 0.72) };
    steer.x = steer.ax; steer.y = steer.ay;
    await touch('touchStart');
    await frames(33);
  }
  const [dx, dy] = { right: [70, 0], left: [-70, 0], none: [0, 0], up: [0, -55], down: [0, 55] }[dir] ?? [0, 0];
  const tx = steer.ax + dx, ty = steer.ay + dy;
  // a thumb slides over about a tenth of a second, not in one jump
  for (let k = 1; k <= 4; k++) {
    steer.x = Math.round(steer.x + (tx - steer.x) / (5 - k));
    steer.y = Math.round(steer.y + (ty - steer.y) / (5 - k));
    await touch('touchMove');
    await frames(25);
  }
}
async function action(kind, dir, holdMs) {
  actionAt = { x: Math.round(W() * 0.78), y: Math.round(H() * 0.62) };
  await touch('touchStart');
  if (kind === 'flick') {
    const [dx, dy] = { up: [0, -80], down: [0, 80], left: [-80, 0], right: [80, 0] }[dir] ?? [0, -80];
    for (let k = 1; k <= 3; k++) {
      await page.clock.runFor(20);
      actionAt = { x: actionAt.x + dx / 3, y: actionAt.y + dy / 3 };
      await touch('touchMove');
    }
  }
  await frames(kind === 'tap' ? 60 : kind === 'hold' ? holdMs : 20);
  if (kind === 'flick' && holdMs) await frames(holdMs);
  actionAt = null;
  await touch('touchEnd');
  await frames(33);
}

/** "right+jump 400": hold those keys 400 ms of game time. "jump": a quick press. "wait 1000": hands off. */
async function step(s) {
  const [what, a, b] = s.trim().split(/\s+/);
  const msStr = a;
  if (what === 'wait') return frames(Number(msStr || 500));
  // touch: "steer right 800" (the thumb stays down until "lift"), "tap", "flick up", "flickhold up 600", "hold 700", "lift"
  if (what === 'steer') { await steerTo(a); return frames(Number(b || 0)); }
  if (what === 'lift') { if (steer) { steer = null; await touch('touchEnd'); } return frames(33); }
  if (what === 'tap') return action('tap');
  if (what === 'flick') return action('flick', a);
  if (what === 'flickhold') return action('flick', a, Number(b || 500));
  if (what === 'hold') return action('hold', null, Number(a || 700));
  const keys = what.split('+').map((k) => KEYS[k]);
  if (keys.some((k) => !k)) throw new Error(`unknown key in "${s}" (keys: ${Object.keys(KEYS).join(', ')}, or wait / steer / lift / tap / flick / flickhold / hold)`);
  const ms = Number(msStr || 120);
  for (const k of keys) await page.keyboard.down(k);
  // (the game reads input once a frame: advance in frame-sized steps so a short press is never missed)
  for (let t = 0; t < ms; t += 33) await page.clock.runFor(Math.min(33, ms - t));
  for (const k of keys) await page.keyboard.up(k);
  await page.clock.runFor(33);
}

async function handle(cmd) {
  if (cmd.cmd === 'start') {
    const flags = await open(cmd.stage, cmd.view, Number(cmd.flag || 0));
    return { shot: await shot('start'), text: (cmd.flag ? `[started at flag ${cmd.flag} of ${flags}] ` : '') + (await screenText()) };
  }
  if (!page) throw new Error('no stage open: start one first');
  if (cmd.cmd === 'do') {
    for (const s of cmd.steps) await step(s);
    return { shot: await shot(), text: await screenText() };
  }
  if (cmd.cmd === 'click') {
    // press a button on screen by its words (a lesson card's "Got it!", a menu)
    const b = page.locator('button', { hasText: new RegExp(`^\\s*${cmd.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') });
    if (!(await b.count())) return { error: `no button "${cmd.text}" on screen`, text: await screenText() };
    await b.first().click();
    await page.clock.runFor(300);
    return { shot: await shot(), text: await screenText() };
  }
  if (cmd.cmd === 'look') return { shot: await shot(), text: await screenText() };
  if (cmd.cmd === 'burst') {
    // eight frames in a row in one strip: flicker, jitter and things popping in and out show up side by side
    const paths = [];
    for (let k = 0; k < 8; k++) { await page.clock.runFor(33); paths.push(await shot(`burst${k}`)); }
    return { shots: paths, text: await screenText() };
  }
  if (cmd.cmd === 'perf') {
    const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
    const canv = await page.evaluate(() => document.querySelectorAll('canvas').length);
    return { text: `memory in use ${(m.JSHeapUsedSize / 1048576).toFixed(1)} MB of ${(m.JSHeapTotalSize / 1048576).toFixed(1)} MB, page objects ${m.Nodes}, canvases ${canv}, listeners ${m.JSEventListeners}` };
  }
  if (cmd.cmd === 'turn') {
    // turn the phone: same stage, other way up
    view = view === 'land' ? 'port' : 'land';
    await page.setViewportSize(VIEWS[view]);
    await page.clock.runFor(300);
    return { shot: await shot(view), text: await screenText() };
  }
  throw new Error(`unknown command ${cmd.cmd}`);
}

(async () => {
  browser = await chromium.launch();
  let busy = Promise.resolve();
  http
    .createServer((req, res) => {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        busy = busy.then(async () => {
          let out;
          try {
            out = await handle(JSON.parse(body || '{}'));
          } catch (e) {
            out = { error: String(e && e.message ? e.message : e) };
          }
          if (errors.length) out.errors = errors.splice(0);
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify(out));
        });
      });
    })
    .listen(port, '127.0.0.1', () => console.log(`qa harness on ${port}, shots in ${outDir}`));
})();
