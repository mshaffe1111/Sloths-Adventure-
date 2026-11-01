// node tools/perf/firstframes.cjs <built game url (vite preview)> <stage> [WxH] [cpu throttle] [runs]: per run, nav-to-stage-live ms and the frame gaps (rAF) of the first 10 s of play, walking right and hopping (warmup-5m, 2026-11-01)
const { chromium } = require('playwright');
const [base, stage, size = '448x998', thr = '6', runs = '3'] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
(async () => {
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
  const out = [];
  for (let r = 0; r < Number(runs); r++) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/script\.google\.com/, (rt) => rt.abort());
    // warm the HTTP/offline cache once per context so we measure decode/upload, not the network
    const pg = await ctx.newPage();
    await pg.addInitScript(() => {
      const w = window; w.__ft = { live: -1, gaps: [], nav: performance.now(), long: [] };
      addEventListener('sloth-stage-live', () => {
        if (w.__ft.live > 0) return;
        w.__ft.live = performance.now();
        let last = performance.now();
        const tick = (t) => { w.__ft.gaps.push(t - last); last = t; if (t - w.__ft.live < 10000) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (w.__ft.live > 0 && e.startTime > w.__ft.live) w.__ft.long.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: false }); } catch {}
    });
    const cdp = await ctx.newCDPSession(pg);
    // first load untimed (fills the cache), then a timed one
    await pg.goto(base, { timeout: 120000 }); await pg.waitForTimeout(3000);
    await pg.evaluate(() => { for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) localStorage.setItem(`sloth_story_${k}${w}`, '1'); });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(thr) });
    const t0 = Date.now();
    await pg.goto(base + (base.includes('?') ? '&' : '?') + `autostart=1&level=${stage}&layout=1`, { timeout: 180000 });
    await pg.waitForFunction(() => window.__ft && window.__ft.live > 0, null, { timeout: 120000, polling: 200 });
    const loadMs = await pg.evaluate(() => Math.round(window.__ft.live - window.__ft.nav));
    // a tap (5-M's card) and walking right, hopping now and then
    await pg.touchscreen.tap(W / 2, H / 2).catch(() => {});
    const key = (k, d) => pg.evaluate(([k, d]) => dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { key: k, code: k })), [k, d]);
    await key('ArrowRight', true);
    for (let i = 0; i < 10; i++) { await pg.waitForTimeout(800); await key(' ', true); await pg.waitForTimeout(200); await key(' ', false); }
    await key('ArrowRight', false);
    await pg.waitForFunction(() => window.__ft.gaps.length && performance.now() - window.__ft.live > 10100, null, { timeout: 60000 });
    const ft = await pg.evaluate(() => window.__ft);
    const g = ft.gaps.slice(1);
    const s = [...g].sort((a, b) => a - b);
    out.push({ run: r, loadMs, frames: g.length, avg: +(g.reduce((a, b) => a + b, 0) / g.length).toFixed(1), p95: Math.round(s[Math.floor(s.length * 0.95)]), max: Math.round(s[s.length - 1]), over50: g.filter((x) => x > 50).length, over100: g.filter((x) => x > 100).length, first2sMax: Math.round(Math.max(...(() => { let t = 0; const a = []; for (const x of g) { t += x; if (t > 2000) break; a.push(x); } return a; })())), long: ft.long, big: (() => { let t = 0; const a = []; for (const x of g) { t += x; if (x > 100) a.push([Math.round(t), Math.round(x)]); } return a; })() });
    await ctx.close();
  }
  console.log(JSON.stringify({ stage, size, thr, out }));
  await b.close();
})();
