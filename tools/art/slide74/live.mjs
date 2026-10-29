// node live.mjs -> the slide's draw time (ms) in the game's own loop, sideways and upright, at 1x and a 4x CPU slow-down, 180 frames of
// sliding (perf.mjs steps frames by hand in one long call, which shows stalls the game's own loop doesn't have). Dev server on 4301.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const b = await chromium.launch();
for (const vp of [{ width: 844, height: 390 }, { width: 390, height: 844 }]) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off');
  await p.waitForTimeout(4000);
  await p.evaluate(() => window.__play('7-4'));
  await p.waitForTimeout(4000);
  await p.evaluate(() => { const e = window.__engine(); e.player.x = 3320; e.player.y = 580; e.player.maxHp = 99; e.player.hp = 99; });
  await p.waitForTimeout(6000);
  const cdp = await p.context().newCDPSession(p);
  for (const rate of [1, 4]) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    const r = await p.evaluate(() => new Promise((res) => {
      const e = window.__engine();
      const orig = e.render.bind(e); const t = [];
      e.render = (...a) => { const s = performance.now(); const x = orig(...a); t.push(performance.now() - s); return x; };
      const gaps = []; let last = performance.now();
      const f = (now) => { gaps.push(now - last); last = now; if (gaps.length < 180) requestAnimationFrame(f); else { e.render = orig; t.sort((a, b) => a - b); gaps.sort((a, b) => a - b); res({ phase: e.slideRun.phase, rMed: t[t.length >> 1]?.toFixed(1), r90: t[Math.floor(t.length * 0.9)]?.toFixed(1), rMax: t[t.length - 1]?.toFixed(1), gap90: gaps[162].toFixed(1), gapMax: gaps[179].toFixed(1) }); } };
      requestAnimationFrame(f);
    }));
    console.log(vp.width + 'x' + vp.height, 'x' + rate, JSON.stringify(r));
  }
  await p.close();
}
await b.close();
