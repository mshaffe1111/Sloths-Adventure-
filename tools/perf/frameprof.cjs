// node tools/perf/frameprof.cjs <dev server url> <stage> [WxH]: CPU profile (0.5 ms samples) of the first 5.6 s after the stage goes live, with a 4 ms busy marker at the live moment, written for frameprof.py; prints the frame gaps over 60 ms (warmup-5m, 2026-11-01).
const { chromium } = require('playwright');
const fs = require('fs');
const [base, stage, size='448x998'] = process.argv.slice(2);
const [W,H] = size.split('x').map(Number);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await pg.addInitScript(() => { window.__live = -1; window.__lives = []; window.__MARK_LIVE = function __MARK_LIVE() { const e = performance.now() + 4; while (performance.now() < e); }; addEventListener('sloth-stage-live', () => { window.__lives.push(performance.now()); if (window.__live > 0) return; window.__MARK_LIVE(); window.__live = performance.now(); let last = performance.now(); window.__g = []; const f = (t) => { window.__g.push([Math.round(last - window.__live), Math.round(t - last)]); last = t; if (t - window.__live < 5500) requestAnimationFrame(f); }; requestAnimationFrame(f); }); });
  pg.on('console', m => { const t = m.text(); if (/^ready|preloaded/.test(t)) console.log('C', t); });
  await pg.goto(base, { timeout: 120000 }); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) localStorage.setItem(`sloth_story_${k}${w}`, '1'); });
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
  await pg.goto(base + `?autostart=1&level=${stage}&layout=1`, { timeout: 180000 });
  await cdp.send('Profiler.start');
  await pg.waitForFunction(() => window.__live > 0 && performance.now() - window.__live > 5600, null, { timeout: 120000, polling: 200 });
  const { profile } = await cdp.send('Profiler.stop');
  const g = await pg.evaluate(() => window.__g);
  const live = await pg.evaluate(() => window.__live);
  console.log('lives', JSON.stringify(await pg.evaluate(() => window.__lives.map(x => Math.round(x - window.__live))))); console.log('gaps', JSON.stringify(g.filter(x => x[1] > 60)));
  fs.writeFileSync('/tmp/frameprof.json', JSON.stringify({ profile, live, g }));
  await b.close();
})();
