// (a) game time vs real time on the shipped build: baseline, CPU x4, dropped frames (main thread blocked 45 ms every 300 ms), and a long
// stall (250 ms every 2 s: by the loop's design at most 3 steps are caught up, engine.ts loop). 20 s each, stage 4-1 standing still.
import os from 'node:os';
import { chromium, newPage, seedDone, IDS, toMap, playFromMap, sleep, HEAD, MAIN } from './rtlib.mjs';
const which = process.argv[2] ?? 'head';
const url = which === 'main' ? MAIN : HEAD;
const SECS = Number(process.argv[3] ?? 20);
const browser = await chromium.launch();
const out = [];
for (const cond of ['baseline', 'cpu4', 'drop45', 'stall250', 'cpu4+drop45']) {
  const { ctx, page, errors } = await newPage(browser);
  await page.goto(url);
  await page.evaluate(seedDone, IDS);
  await page.reload();
  await toMap(page);
  if (!(await playFromMap(page, '4-1'))) { out.push(`${cond}: engine never ran`); await ctx.close(); continue; }
  await sleep(2500);
  const cdp = await ctx.newCDPSession(page);
  if (cond.startsWith('cpu4')) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate((cond) => {
    const e = window.__probeEngine();
    window.__renders = 0;
    const r = e.render.bind(e);
    e.render = (...a) => { window.__renders++; return r(...a); };
    const block = (ms) => { const t = performance.now(); while (performance.now() - t < ms) {} };
    if (cond.includes('drop45')) window.__blk = setInterval(() => block(45), 300);
    if (cond === 'stall250') window.__blk = setInterval(() => block(250), 2000);
  }, cond);
  const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < SECS * 1000) {
    samples.push(await page.evaluate(() => { const e = window.__probeEngine(); return { g: e.gameTime, now: performance.now(), p: e.isPaused, a: !!e.helpAsking, d: !!e.down, h: e.hitstopTimer > 0, r: window.__renders }; }));
    await sleep(1000);
  }
  await page.evaluate(() => clearInterval(window.__blk));
  const a = samples[0], b = samples[samples.length - 1];
  const held = samples.filter((s) => s.p || s.a || s.d || s.h).length;
  const ratio = (b.g - a.g) / ((b.now - a.now) / 1000);
  const fps = (b.r - a.r) / ((b.now - a.now) / 1000);
  out.push(`${which} ${cond}: game ${(b.g - a.g).toFixed(3)} s over real ${((b.now - a.now) / 1000).toFixed(3)} s = ratio ${ratio.toFixed(4)}; drawn ${fps.toFixed(1)} fps; held samples ${held}/${samples.length}; errors ${errors.length}; load ${os.loadavg()[0].toFixed(1)}`);
  console.log(out[out.length - 1]);
  await ctx.close();
}
await browser.close();
