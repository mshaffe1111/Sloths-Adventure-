// PROOF-1 item 5: 1-1 played to its end in the SHIPPING build, touch only, real time, on a fresh save (lessons and Dot on).
//   node play11.mjs <base url> <tag> <up|side> [stage id, default 1-1]
// The thumbs: the left thumb steers right and stays down; the right thumb flicks up to jump. The bot READS the engine (found through
// React's fiber, the production build has no window.__engine) only to decide when it is stuck: x not moving -> flick (jump); still
// stuck -> steer up (a trunk or vine) -> a double flick. Stuck 15 s with no progress -> a RESCUE (counted): put at the next flag ahead,
// the way tools/qa/server.cjs starts a tester at a flag. A "Got it" / "OK" card is tapped like a player.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(import.meta.url)('playwright');
const [base, tag, viewId, stageId = '1-1'] = process.argv.slice(2);
const vp = { up: { width: 390, height: 844 }, side: { width: 844, height: 390 } }[viewId];
const name = `${tag}-play${stageId}-${viewId}`;
const shotsDir = path.join(here, 'shots'); fs.mkdirSync(shotsDir, { recursive: true });
const log = { name, errors: [], console: [], rescues: [], helps: [], jumps: 0, deaths: 0, track: [], end: null };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let n = 0;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
await ctx.route(/script\.google\.com/, (r) => r.abort());
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
page.on('pageerror', (e) => log.errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') log.console.push(m.text().slice(0, 300)); });
const shot = async (what) => { const f = path.join(shotsDir, `${name}-${String(++n).padStart(2, '0')}-${what}.png`); await page.screenshot({ path: f }); return f; };

let steer = null;
const pts = () => (steer ? [{ x: steer.x, y: steer.y, id: 1 }] : []);
async function steerTo(dx, dy) {
  if (!steer) { steer = { ax: Math.round(vp.width * 0.18), ay: Math.round(vp.height * 0.72) }; steer.x = steer.ax; steer.y = steer.ay; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts() }); await sleep(30); }
  const tx = steer.ax + dx, ty = steer.ay + dy;
  for (let k = 1; k <= 4; k++) { steer.x = Math.round(steer.x + (tx - steer.x) / (5 - k)); steer.y = Math.round(steer.y + (ty - steer.y) / (5 - k)); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts() }); await sleep(20); }
}
async function lift() { if (!steer) return; const p = { x: steer.x, y: steer.y, id: 1 }; steer = null; await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [p] }); }
async function flick(holdMs = 0) {
  let a = { x: Math.round(vp.width * 0.78), y: Math.round(vp.height * 0.62), id: 2 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [...pts(), a] });
  for (let k = 0; k < 4; k++) { await sleep(15); a = { ...a, y: a.y - 20 }; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [...pts(), a] }); }
  await sleep(40 + holdMs);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [a] });
  log.jumps++;
}
const ENGINE = () => {
  if (window.__E1) return window.__E1();
  window.__E1 = () => {
    for (const el of document.querySelectorAll('canvas, div')) {
      const k = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
      if (!k) continue;
      for (let f = el[k]; f; f = f.return)
        for (let h = f.memoizedState; h && typeof h === 'object' && 'next' in h; h = h.next) {
          const v = h.memoizedState;
          if (v && typeof v === 'object' && 'current' in v && v.current && typeof v.current === 'object' && 'player' in v.current && 'currentStage' in v.current) return v.current;
        }
    }
    return null;
  };
  return window.__E1();
};
const state = () => page.evaluate((src) => {
  const e = (0, eval)(src)();
  const done = !!document.querySelector('.clr-card, .clr-medals, [class*="victory"]') || /Stage cleared|Stage Clear|cleared!/i.test(document.body.innerText);
  if (!e || !e.player) return { done, none: true };
  const s = e.currentStage;
  return { done, exitY: s?.exitTotemY, x: e.player.x, y: e.player.y, lives: e.lives, exit: s?.exitTotemX, cps: (s?.checkpoints || []).map((c) => [c.x, c.y]), running: e.isRunning, paused: e.isPaused };
}, `(${ENGINE.toString()})`);

const t0 = Date.now();
await page.goto(base);
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('sloth_difficulty', 'normal'); });
await page.goto(base + `?autostart=1&level=${stageId}`);
// the prologue / cards: skipped as a player who has seen them skips
for (let i = 0; i < 25; i++) {
  await sleep(1000);
  const k = page.locator('button:has-text("Skip")').first();
  if (await k.count() && await k.isVisible()) { await k.evaluate((e) => e.click()); continue; }
  if (await page.locator('.vh-menu').count()) break;
}
await sleep(3000);
await shot('start');
let best = -1e9, bestAt = Date.now(), lastX = null, stuckSince = Date.now(), tries = 0, lastLives = null, lastShotX = 0;
const LIMIT = 9 * 60 * 1000;
while (Date.now() - t0 < LIMIT) {
  // a card or tip that asks for a tap
  const ok = page.locator('button:has-text("Got it"), button:has-text("OK"), button:has-text("Okay"), button:has-text("Continue")').first();
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await lift(); await shot('card'); await ok.evaluate((e) => e.click()); await sleep(600); continue; }
  // Dot's help offer (HelpOffer.tsx: the game waits for an answer): a stuck player takes the step
  const ho = page.locator('.ho-yes').first();
  if (await ho.count() && await ho.isVisible().catch(() => false)) { await lift(); const st = await state(); log.helps.push({ t: Date.now() - t0, x: Math.round(st.x ?? -1) }); await shot(`help-offer-x${Math.round(st.x ?? 0)}`); const b = await ho.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(800); bestAt = Date.now(); continue; }
  const s = await state();
  if (s.done) { log.end = 'cleared'; break; }
  if (s.none) {
    // the stage is over when the engine is gone and a story or card is up: shoot what a player sees, skipping the story like a player
    if (log.track.length && (await page.locator('.sp-skip, button:has-text("Skip"), .clr-card').count())) { log.end = 'cleared'; break; }
    await sleep(500); continue;
  }
  if (lastLives != null && s.lives < lastLives) log.deaths++;
  lastLives = s.lives;
  if (s.x > lastShotX + 5000) { lastShotX = s.x; await shot(`x${Math.round(s.x)}`); }
  if (log.track.length === 0 || Date.now() - log.track.at(-1).t > 2000) log.track.push({ t: Date.now() - t0, x: Math.round(s.x), y: Math.round(s.y), lives: s.lives });
  if (s.x > best + 30) { best = s.x; bestAt = Date.now(); tries = 0; }
  const moving = lastX == null || Math.abs(s.x - lastX) > 3;
  lastX = s.x;
  if (moving) stuckSince = Date.now();
  const stuck = Date.now() - stuckSince, noProg = Date.now() - bestAt;
  if (noProg > 15000) {
    // a rescue: the next flag ahead (or near the exit when none is left)
    const next = s.cps.filter(([x]) => x > s.x + 60).sort((a, b) => a[0] - b[0])[0];
    await page.evaluate(([src, nx]) => {
      const e = (0, eval)(src)(); const p = e.player;
      if (nx) { e.checkpoint = { x: nx[0], y: nx[1] }; p.x = nx[0]; p.y = nx[1]; } else { p.x = e.currentStage.exitTotemX - 60; p.y = e.currentStage.exitTotemY - 80; }
      p.vx = 0; p.vy = 0;
    }, [`(${ENGINE.toString()})`, next]);
    log.rescues.push({ t: Date.now() - t0, from: Math.round(s.x), to: next ? Math.round(next[0]) : 'exit' });
    await shot(`rescue-from-x${Math.round(s.x)}`);
    bestAt = Date.now(); best = s.x;
    continue;
  }
  if (stuck > 400) {
    tries++;
    if (tries % 6 === 3) { await steerTo(0, -55); await sleep(1200); await steerTo(70, 0); }
    else if (tries % 6 === 5) { await flick(0); await sleep(220); await flick(0); }
    else await flick(tries % 2 ? 250 : 0);
    stuckSince = Date.now();
  } else {
    await steerTo(70, 0);
    await sleep(150);
  }
}
await lift();
await sleep(2500);
await shot(log.end === 'cleared' ? 'END-cleared' : 'END-timeout');
log.endAt = Math.round((Date.now() - t0) / 1000);
for (let i = 0; i < 8 && log.end === 'cleared'; i++) {
  const k = page.locator('.sp-skip, button:has-text("Skip")').first();
  if (await k.count() && await k.isVisible().catch(() => false)) { await shot(`after-${i}-story`); await k.evaluate((e) => e.click()); await sleep(2500); continue; }
  await sleep(2000);
  await shot(`after-${i}`);
  if (await page.locator('.clr-card').count()) { await sleep(2500); await shot('stage-cleared-card'); break; }
}
await sleep(2500);
await shot('END-after');
log.exit = (await state()); delete log.exit.cps;
log.seconds = Math.round((Date.now() - t0) / 1000);
fs.writeFileSync(path.join(here, 'logs', `${name}.json`), JSON.stringify(log, null, 1));
console.log(`${name}: end=${log.end} helps=${log.helps.length} ${log.seconds}s rescues=${log.rescues.length} deaths=${log.deaths} jumps=${log.jumps} pageErrors=${log.errors.length} consoleErrors=${log.console.length}`);
for (const e of log.errors) console.log('  PAGEERROR', e.slice(0, 200));
for (const e of log.console) console.log('  CONSOLE', e.slice(0, 200));
await browser.close();
