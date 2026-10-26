/**
 * Blind play-test harness: one phone-sized browser playing the dev build, driven only by the keys a player presses.
 *
 *   node tools/qa/server.cjs <port> <game url> <out dir>        (then drive it with tools/qa/qa.cjs)
 *
 * The page's clock is faked (Playwright clock): the game only moves while a command runs, so a tester can look, think and then act,
 * the way a player who pauses would. Nothing here reads the game's insides: a tester sees the screenshots and the text on screen.
 * `start` is the one exception: it opens a stage straight away (window.__play) so a tester need not walk the map.
 *
 * `persona <name>` (tools/playtesters/personas/<name>.json) makes the touch commands land and move the way that tester's thumbs did:
 * their phone size, where their thumbs sit, how long a tap lasts, how far and fast a flick goes and how far off straight it leans.
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

// ───── persona: one real tester's thumbs (from tools/playtesters/profile.py) ─────
let persona = null;
let seed = 1;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
/** a value from a tester's p10 / p50 / p90 spread (two halves of a rough bell), or the fallback when the spread is missing */
function draw(spread, fallback) {
  if (!spread || spread.p50 == null) return fallback;
  const u = rand();
  const lo = spread.p10 ?? spread.p50, hi = spread.p90 ?? spread.p50;
  return u < 0.5 ? lo + (spread.p50 - lo) * (u / 0.5) : spread.p50 + (hi - spread.p50) * ((u - 0.5) / 0.5);
}
function personaViews(p) {
  // their own phone, both ways up (the portrait size is what the browser showed them)
  const dev = Object.keys(p.devices).find((d) => d.includes('portrait')) || '';
  const m = dev.match(/(\d+)x(\d+)/);
  if (!m) return VIEWS;
  const w = Number(m[1]), h = Number(m[2]);
  return { port: { width: w, height: h }, land: { width: h, height: Math.round(w * 0.9) } };
}
let views = VIEWS;

async function open(stage, v, flag = 0, layout = 1) {
  if (page) await page.close().catch(() => {});
  // a size of its own ("740x360"): that screen, as the phone is held then
  const sized = /^(\d+)x(\d+)$/.exec(v || '');
  if (sized) { views = { ...views, [v]: { width: Number(sized[1]), height: Number(sized[2]) } }; }
  view = views[v] ? v : 'land';
  // (a phone: touch screen, mobile browser, so the game shows and reads its touch controls)
  const ctx = await browser.newContext({ viewport: views[view], deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('page error: ' + e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push('console error: ' + m.text().slice(0, 200)));
  cdp = await ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  steer = null;
  // the clock stands still between commands: install() alone lets fake time flow in real time, so a tester died while thinking.
  // Same layout every entry (?layout=N, stageGenerator.ts layoutForEntry), so repro steps hold.
  const T0 = Date.UTC(2026, 9, 25, 12);
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 1000);
  await page.goto(url + (url.includes('?') ? '&' : '?') + `layout=${layout}`);
  await page.clock.runFor(3500);
  await page.evaluate((id) => window.__play(id), stage);
  await page.clock.runFor(3000);
  // a later flag to start from, the way a play-tester is handed a checkpoint select (the stage itself is untouched)
  if (flag > 0) {
    const ok = await page.evaluate((n) => {
      const e = window.__engine();
      // Dot's netting flight has no flags: her flowers are her checkpoints, so start at the Nth flower she would drink at
      const dot = e.dotRun;
      if (dot) {
        const fls = [...dot.fl.stage.flowers].sort((a, b) => a.x - b.x);
        const f = fls[Math.min(n, fls.length) - 1];
        if (!f) return 0;
        dot.fl.checkpoint = { x: f.x + (f.face > 0 ? 34 : -34), y: f.y };
        dot.fl.respawn();
        return fls.length;
      }
      // flags in stage order (some stages run downhill or back left), and placing him there costs no life
      const cps = e.currentStage.checkpoints ?? [];
      const cp = cps[Math.min(n, cps.length) - 1];
      if (!cp) return 0;
      cps.forEach((c, i) => { if (i < n) c.reached = true; });
      e.checkpoint = { x: cp.x, y: cp.y };
      const p = e.player; p.x = cp.x; p.y = cp.y; p.vx = 0; p.vy = 0;
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
  // (css pixels, not the 1.5x device pixels: a tester reads many of these, and smaller pictures go further)
  await page.screenshot({ path: p, scale: 'css' });
  return p;
}

// ───── touch: the phone's real controls (TouchController.tsx / touchGestures.ts read these) ─────
const W = () => views[view].width, H = () => views[view].height;
let actionAt = null;
const points = () => [...(steer ? [{ x: steer.x, y: steer.y, id: 1 }] : []), ...(actionAt ? [{ x: actionAt.x, y: actionAt.y, id: 2 }] : [])];
const touch = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points() });
// CDP's touchEnd lifts the points it is GIVEN, so a lift names only the finger leaving the glass (it used to send the fingers still
// down: lifting the action thumb lifted the steering thumb and left the action finger stuck; found by the World 4 session)
const liftFinger = (pt) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [pt] });
const frames = async (ms) => { for (let t = 0; t < ms; t += 33) await page.clock.runFor(Math.min(33, ms - t)); };
async function steerTo(dir) {
  if (!steer) {
    // a persona's thumb lands where theirs did (left share of their touches), with a little scatter
    const fx = persona ? Math.min(0.45, Math.max(0.08, draw(persona.touchStartX, 0.18) * (persona.leftHalfShare > 0.5 ? 0.5 : 0.35))) : 0.18;
    const fy = persona ? Math.min(0.92, Math.max(0.55, draw(persona.touchStartY, 0.72))) : 0.72;
    steer = { ax: Math.round(W() * fx), ay: Math.round(H() * fy) };
    steer.x = steer.ax; steer.y = steer.ay;
    await touch('touchStart');
    await frames(33);
  }
  const reach = persona ? 50 + rand() * 40 : 70;
  const [dx, dy] = { right: [reach, 0], left: [-reach, 0], none: [0, 0], up: [0, -55], down: [0, 55] }[dir] ?? [0, 0];
  const tx = steer.ax + dx, ty = steer.ay + dy + (persona && (dir === 'left' || dir === 'right') ? (rand() - 0.5) * 24 : 0);
  // a thumb slides over about a tenth of a second, not in one jump
  for (let k = 1; k <= 4; k++) {
    steer.x = Math.round(steer.x + (tx - steer.x) / (5 - k));
    steer.y = Math.round(steer.y + (ty - steer.y) / (5 - k));
    await touch('touchMove');
    await frames(25);
  }
}
async function action(kind, dir, holdMs) {
  const ax = persona ? Math.min(0.92, Math.max(0.55, 0.78 + (rand() - 0.5) * 0.16)) : 0.78;
  const ay = persona ? Math.min(0.9, Math.max(0.45, draw(persona.touchStartY, 0.62) - 0.08)) : 0.62;
  actionAt = { x: Math.round(W() * ax), y: Math.round(H() * ay) };
  await touch('touchStart');
  if (kind === 'flick') {
    // a persona's flick: their length, their speed, and their lean off straight
    const len = persona ? draw(persona.flickPx, 80) : 80;
    const ms = persona ? Math.max(30, Math.min(260, len / Math.max(0.2, draw(persona.flickPxPerMs, 1.3)))) : 60;
    const lean = persona ? ((rand() < 0.5 ? -1 : 1) * draw(persona.jumpFlickOffVerticalDeg, 0) * Math.PI) / 180 : 0;
    const base = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir] ?? [0, -1];
    const ux = base[0] * Math.cos(lean) - base[1] * Math.sin(lean), uy = base[0] * Math.sin(lean) + base[1] * Math.cos(lean);
    const n = Math.max(3, Math.round(ms / 20));
    for (let k = 1; k <= n; k++) {
      await page.clock.runFor(ms / n);
      actionAt = { x: actionAt.x + (ux * len) / n, y: actionAt.y + (uy * len) / n };
      await touch('touchMove');
    }
  }
  const tapMs = persona ? Math.max(25, draw(persona.tapMs, 60)) : 60;
  await frames(kind === 'tap' ? tapMs : kind === 'hold' ? holdMs : 20);
  if (kind === 'flick' && holdMs) await frames(holdMs);
  const up = { x: actionAt.x, y: actionAt.y, id: 2 };
  actionAt = null;
  await liftFinger(up);
  await frames(33);
}

/** "right+jump 400": hold those keys 400 ms of game time. "jump": a quick press. "wait 1000": hands off. */
async function step(s) {
  const [what, a, b] = s.trim().split(/\s+/);
  const msStr = a;
  if (what === 'wait') return frames(Number(msStr || 500));
  // touch: "steer right 800" (the thumb stays down until "lift"), "tap", "flick up", "flickhold up 600", "hold 700", "lift"
  if (what === 'steer') { await steerTo(a); return frames(Number(b || 0)); }
  if (what === 'lift') { if (steer) { const up = { x: steer.x, y: steer.y, id: 1 }; steer = null; await liftFinger(up); } return frames(33); }
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
  if (cmd.cmd === 'persona') {
    const file = path.join(__dirname, '..', 'playtesters', 'personas', `${cmd.name}.json`);
    persona = JSON.parse(fs.readFileSync(file, 'utf8'));
    seed = [...cmd.name].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) & 0x7fffffff;
    views = personaViews(persona);
    // "persona sally 1": their thumbs as they were in their first real session (2 = second, ...), so a bot gets better the way they did
    const curve = persona.curve || [];
    const level = Math.min(Number(cmd.level || 0), curve.length);
    if (level > 0) Object.assign(persona, curve[level - 1]);
    const at = level > 0 ? `, thumbs as in their session ${level} of ${curve.length}` : '';
    return { text: `playing as ${persona.name}: phone ${views.port.width}x${views.port.height} upright, ${views.land.width}x${views.land.height} sideways${at}` };
  }
  if (cmd.cmd === 'start') {
    const flags = await open(cmd.stage, cmd.view, Number(cmd.flag || 0), Number(cmd.layout || 1));
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
    // a player lifts their thumbs off the glass to press a button: the bot's fingers must not stay down under the card
    if (actionAt) { const up = { x: actionAt.x, y: actionAt.y, id: 2 }; actionAt = null; await liftFinger(up); }
    if (steer) { const up = { x: steer.x, y: steer.y, id: 1 }; steer = null; await liftFinger(up); }
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
  if (cmd.cmd === 'die') {
    // lose a life on the spot (as from a fall), to reach the retry and game-over screens quickly
    await page.evaluate(() => window.__engine().loseLife('pit'));
    await page.clock.runFor(2500);
    return { shot: await shot(), text: await screenText() };
  }
  if (cmd.cmd === 'perf') {
    // (rubbish collected first: listeners on screens already thrown away still count until then, and look like a leak)
    await cdp.send('HeapProfiler.collectGarbage').catch(() => {});
    const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
    const canv = await page.evaluate(() => document.querySelectorAll('canvas').length);
    return { text: `memory in use ${(m.JSHeapUsedSize / 1048576).toFixed(1)} MB of ${(m.JSHeapTotalSize / 1048576).toFixed(1)} MB, page objects ${m.Nodes}, canvases ${canv}, listeners ${m.JSEventListeners}` };
  }
  if (cmd.cmd === 'turn') {
    // turn the phone: same stage, other way up
    view = view === 'land' ? 'port' : 'land';
    // (the game asks for full screen on the first touch (wideMode.ts), and a full-screen window cannot be resized: step out of it
    // first, as the browser does when a real phone turns, then resize)
    await page.evaluate(() => document.fullscreenElement && document.exitFullscreen().catch(() => {}));
    await page.clock.runFor(50);
    await page.setViewportSize(views[view]);
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
