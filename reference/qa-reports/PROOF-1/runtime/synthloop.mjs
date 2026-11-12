// (a, load-free) the shipped frame loop fed synthetic vsync timestamps: the real engine.loop() of the deploy build is called with each
// timestamp (its own requestAnimationFrame stubbed out), and game time is compared with the timestamps' time. 30 s of each pattern.
import { chromium, newPage, seedDone, IDS, toMap, playFromMap, sleep, HEAD, MAIN } from './rtlib.mjs';
const which = process.argv[2] ?? 'head';
const url = which === 'main' ? MAIN : HEAD;
const browser = await chromium.launch();
const { page, errors } = await newPage(browser);
await page.goto(url);
await page.evaluate(seedDone, IDS);
await page.reload();
await toMap(page);
await playFromMap(page, '4-1');
await sleep(2500);
const res = await page.evaluate(() => {
  const e = window.__probeEngine();
  cancelAnimationFrame(e.animFrameId);
  window.requestAnimationFrame = () => 0;
  let r = 1;
  const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  const pats = {
    '60Hz': (i) => 1000 / 60,
    '60Hz jitter +-1.5ms': () => 1000 / 60 + (rnd() - 0.5) * 3,
    '59.94Hz': () => 1000 / 59.94,
    '60Hz, 1 of 5 refreshes dropped': (i) => (i % 5 === 4 ? 2000 / 60 : 1000 / 60),
    '30Hz, 1 of 4 dropped (66 ms)': (i) => (i % 4 === 3 ? 2000 / 30 : 1000 / 30),
    '48Hz': () => 1000 / 48,
    '75Hz': () => 1000 / 75,
    '120Hz': () => 1000 / 120,
    '144Hz': () => 1000 / 144,
    'slow phone 40-95 ms gaps': () => 40 + rnd() * 55,
    'stall 250 ms every 2 s (by design: max 3 steps)': (i) => (i % 120 === 119 ? 250 : 1000 / 60),
  };
  const out = {};
  for (const [name, gap] of Object.entries(pats)) {
    let t = e.lastRenderTime;
    const g0 = e.gameTime, t0 = t;
    let frames = 0, maxStep = 0, prevG = g0;
    for (let i = 0; t - t0 < 30000; i++) {
      t += gap(i);
      e.loop(t);
      const d = e.gameTime - prevG; if (d > maxStep) maxStep = d; prevG = e.gameTime;
      frames++;
    }
    out[name] = { ratio: (e.gameTime - g0) / ((t - t0) / 1000), frames, paused: e.isPaused, maxFrameAdvance: +maxStep.toFixed(4) };
  }
  return out;
});
for (const [k, v] of Object.entries(res)) console.log(`${which} ${k.padEnd(48)} game/real ${v.ratio.toFixed(4)}  (max ${v.maxFrameAdvance}s a frame${v.paused ? ', PAUSED' : ''})`);
console.log('page errors', errors.length, errors.slice(0, 2));
await browser.close();
