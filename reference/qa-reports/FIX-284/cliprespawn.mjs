// FIX-284: a clip of a put-back at 2-2's finale beat pair (deepBeat22): he runs onto the pair as it goes under, drowns, the death beat's
// iris closes and opens at his flag, and he runs back to the pair turned on its breath (breathAim.ts) and crosses. Real page (dev server),
// BUILD-24c's frozen pattern (Math.random seeded, the clock stepped only here), every press through the touch layer's own calls
// (InputEngine triggerTouchMove / triggerTouchUp / releaseTouchUp), stepped frame by frame and shot every 2nd frame (15 fps), dsf 2.
//   node cliprespawn.mjs <port> <out dir> [up|side]     then ffmpeg (printed)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, ori = 'side'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
await ctx.addInitScript(() => {
  let s = 12345; Math.random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  let now = 100000; performance.now = () => now; window.__tick = (ms) => { now += ms; };
});
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 160)));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
for (let t = Date.now(); Date.now() - t < 300000; ) { if (await p.evaluate(() => typeof window.__play === 'function')) break; await p.waitForTimeout(1000); }
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('2-2', 1));
await p.waitForTimeout(5000);
for (let k = 0; k < 6 && (await p.evaluate(() => document.documentElement.dataset.hudCard === '1')); k++) { await p.touchscreen.tap(VP.width / 2, VP.height / 2); await p.waitForTimeout(700); }
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const setup = await p.evaluate((E) => {
  const e = eval(E);
  e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  e.clearGuide?.();
  const beat = e.platforms.filter((q) => q.pad?.by === 'beat').sort((a, c) => a.x - c.x);
  const pair = beat.slice(-2);
  // (the floor he waits on: the bank before the pair)
  const bank = e.platforms.filter((q) => !q.pad && q.x + q.width <= pair[0].x + 2 && q.x + q.width >= pair[0].x - 200 && Math.abs(q.y - pair[0].y) < 80).sort((a, c) => c.x - a.x)[0];
  // (his flag: the stage's nearest flag before the pair, reached)
  const cps = (e.currentStage.checkpoints ?? []).filter((c) => c.x < pair[0].x).sort((a, c) => c.x - a.x);
  const flag = cps[0];
  if (flag) { flag.reached = true; e.checkpoint = { x: flag.x, y: flag.y }; }
  Object.assign(e.player, { x: bank.x + bank.width - 160, y: bank.y, vx: 0, vy: 0, grounded: true, facing: 1, invincibleTimer: 0 });
  window.__pair = pair.map((q) => q.id);
  window.__lives = e.lives;
  return { pair: pair.map((q) => [q.id, q.x, q.width, q.y]), bank: [bank.x, bank.width, bank.y], flag: flag ? [flag.x, flag.y] : null, clock: pair[0].pad.clock };
}, E);
console.log('SETUP', JSON.stringify(setup));
// (one step: the controller, then the engine; returns what happened)
const step = (shoot) => p.evaluate(([E, shoot]) => {
  const e = eval(E), pl = e.player, inp = e.input;
  const pair = window.__pair.map((id) => e.platforms.find((q) => q.id === id));
  const now = e.clock.read(pair[0].pad.clock, pair[0].pad.shift);
  window.__phase = now.phase;
  // waiting: he stands until the pair starts its warning, then runs on (the late start that drowns him); after a put-back he runs at once
  const go = window.__go || (window.__wait && now.phase === 'warn') || e.lives < window.__lives;
  if (!window.__wait && !window.__go) window.__wait = true;
  if (go) window.__go = true;
  const dir = go && !e.down ? 1 : 0;
  if (dir !== window.__dir) { inp.triggerTouchMove(dir > 0 ? 'right' : 'none'); window.__dir = dir; }
  // (a flick at a floor's end, the next floor ahead: a full jump, as the touch layer gives one)
  const under = pl.grounded ? e.platforms.find((q) => q.id === e.standingOn) : null;
  if (go && under && pl.grounded && under.x + under.width - (pl.x + pl.width / 2) < 30 && !window.__pressed) { inp.triggerTouchUp(0); window.__pressed = 3; }
  if (window.__pressed) { window.__pressed--; if (!window.__pressed) inp.releaseTouchUp(); }
  window.__tick?.(33.3);
  e.update(1 / 30);
  e.clearGuide?.();
  if (shoot) e.render();
  return { x: Math.round(pl.x), lives: e.lives, down: !!e.down, phase: now.phase };
}, [E, shoot]);
let f = 0, shot = 0, crossedAt = -1;
for (; f < 30 * 22; f++) {
  const shoot = f % 2 === 0;
  const s = await step(shoot);
  if (shoot) { await p.screenshot({ path: path.join(out, `f${String(shot).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 82 }); shot++; }
  if (f % 30 === 0) console.log('t', (f / 30).toFixed(1), JSON.stringify(s));
  if (s.x > setup.pair[1][1] + setup.pair[1][2] + 160 && crossedAt < 0) { crossedAt = f; }
  if (crossedAt >= 0 && f > crossedAt + 30) break;
}
console.log('frames', f, 'shots', shot, 'crossed at frame', crossedAt);
console.log(`ffmpeg -y -framerate 15 -i ${out}/f%04d.jpg -c:v libx264 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${out}.mp4`);
await b.close();
