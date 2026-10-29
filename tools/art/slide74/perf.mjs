// node perf.mjs -> the slide's draw time per frame (ms), sideways and upright, at 1x and at a 4x CPU slow-down (the budget is 33 ms)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const b = await chromium.launch();
for (const vp of (process.env.ONLY ? [{ width: 844, height: 390 }] : [{ width: 844, height: 390 }, { width: 390, height: 844 }])) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off');
  await p.waitForTimeout(4000);
  await p.evaluate((o) => { globalThis.__off = o; window.__play('7-4'); }, process.env.OFF ?? '');
  await p.waitForTimeout(4000);
  await p.evaluate(() => { const e = window.__engine(); e.player.x = 3320; e.player.y = 580; });
  await p.waitForTimeout(5000);
  const cdp = await p.context().newCDPSession(p);
  for (const rate of (process.env.ONLY ? [1] : [1, 4])) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    const ms = await p.evaluate(() => {
      const e = window.__engine();
      e.isPaused = true;
      const s = e.slideRun.sim;
      s.z = s.sorted.find((o) => o.kind === 'rubble').z - 8; s.clock = 5;
      for (let i = 0; i < 20; i++) { e.update(1 / 30); e.render(); }
      const t = [];
      for (let i = 0; i < 40; i++) { const a = performance.now(); e.update(1 / 30); e.render(); t.push(performance.now() - a); }
      t.sort((x, y) => x - y);
      return { median: t[20].toFixed(1), p90: t[36].toFixed(1) };
    });
    console.log(`${vp.width}x${vp.height} cpu x${rate}: median ${ms.median} ms, 90% ${ms.p90} ms`);
  }
  await p.close();
}
await b.close();
