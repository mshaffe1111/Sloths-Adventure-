// ART-W2B: a still of the wheel's foot (the pond and the painted millrace wall) on the real page, ?fixture=wheel: Pokey set in the pond (60 px in from its street-side end, clear of the jetty)
// under the wheel (it never hurts: wheel.ts), the game run 40 frames so the camera follows him down, then paused and shot. Prints what the
// game BUILT (D62).   node reference/qa-reports/ART-W2B/pond.mjs <port> <out.png> [up|side] [wheel|wheel-right] [row]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const [port, out, ori = 'up', FIX = 'wheel', ROW = 'edge'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
await ctx.route(/script\.google\.com/, (r) => r.abort());
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:${port}/?lessons=off&fixture=${FIX}&wheel=${ROW}`, { timeout: 300000 });
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { try { const e = eval(E); return !!(e && e.player && e.platforms?.some((q) => q.wheel)); } catch { return false; } }, E, { timeout: 300000, polling: 1000 });
await p.waitForTimeout(4000);
const info = await p.evaluate((E) => {
  const e = eval(E);
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  const w = e.platforms.find((q) => q.wheel).wheel.w;
  const pond = (e.currentStage?.rivers ?? e.rivers ?? []).find((r) => r.wheelPond);
  Object.assign(e.player, { x: pond ? (w.way > 0 ? pond.x1 - 60 : pond.x0 + 60) : w.cx, y: (pond?.surfaceY ?? w.cy + w.R + 160) - 60, vx: 0, vy: 0, grounded: false });
  return { stage: e.currentStage?.config?.id, wheel: { R: w.R, way: w.way, cx: w.cx, cy: w.cy }, pond: pond && { x0: pond.x0, x1: pond.x1, y: pond.surfaceY }, view: [innerWidth, innerHeight] };
}, E);
console.log('BUILT', JSON.stringify(info));
await p.waitForTimeout(1500);
await p.evaluate((E) => { eval(E).isPaused = true; }, E);
await p.waitForTimeout(300);
await p.screenshot({ path: out });
console.log('STILL', out);
await b.close();
