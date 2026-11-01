// node tools/perf/qstep.cjs <dev server url> <stage> [prof]: 2.4 s into play, steps the picture down by hand as the frame governor does (engine.stepQuality) and prints the worst frame in the 0.45 s after it and in the second before. 'prof' writes a CPU profile of that 0.45 s for frameprof.py (warmup-5m, 2026-11-01). Needs the dev server.
const { chromium } = require('playwright');
const [base, stage, mode = ''] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 448, height: 998 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (rt) => rt.abort());
  const pg = await ctx.newPage();
  await pg.addInitScript(() => {
    const w = window; w.__live = -1; w.__gaps = [];
    addEventListener('sloth-stage-live', () => { if (w.__live > 0) return; w.__live = performance.now(); let last = w.__live;
      const tick = (t) => { const g = w.__engine; const e = typeof g === 'function' ? g() : g; w.__gaps.push([Math.round(t - w.__live), Math.round(t - last), e?.quality]); last = t; if (t - w.__live < 8000) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  });
  await pg.goto(base, { timeout: 120000 }); await pg.waitForTimeout(2500);
  await pg.evaluate(() => { for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) localStorage.setItem(`sloth_story_${k}${w}`, '1'); });
  await pg.goto(base + `?autostart=1&level=${stage}&layout=1`, { timeout: 180000 });
  await pg.waitForFunction(() => window.__live > 0, null, { timeout: 120000, polling: 100 });
  await pg.touchscreen.tap(224, 500).catch(() => {});
  await pg.evaluate(() => dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' })));
  await pg.waitForFunction(() => performance.now() - window.__live > 2400, null, { polling: 50 });
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
  if (mode === 'prof') await cdp.send('Profiler.start');
  const r = await pg.evaluate(() => { const g = window.__engine; const e = typeof g === 'function' ? g() : g; e.gov && (e.gov.warm = 0); const out = []; const q0 = e.quality; let n = 0; window.__note = (e.perfLog?.notes ?? []).slice(-3);
    // (the governor also stands down for a while after a step: hold it off so only our step happens)
    while (e.quality === q0 && n++ < 6) { const t = performance.now(); e.stepQuality(); out.push([Math.round(performance.now() - t), e.quality]); }
    window.__stepAt = Math.round(performance.now() - window.__live); return out; });
  if (mode === 'prof') { await pg.waitForTimeout(450); const { profile } = await cdp.send('Profiler.stop'); require('fs').writeFileSync('/tmp/frameprof.json', JSON.stringify({ profile, live: 0, g: [] })); }
  await pg.waitForFunction(() => performance.now() - window.__live > 6000, null, { polling: 100 });
  const g = await pg.evaluate(() => window.__gaps); const at = await pg.evaluate(() => window.__stepAt);
  const win = g.filter((x) => x[0] > at && x[0] <= at + 450).map((x) => x[1]); const pre = g.filter((x) => x[0] > at - 1000 && x[0] <= at).map((x) => x[1]); console.log('SUMMARY', stage, 'worst after step', Math.max(...win), 'worst in the second before', Math.max(...pre)); if (0) console.log(stage, mode, 'step calls (ms, quality after):', JSON.stringify(r), 'at', at, 'ms; frames around it:', JSON.stringify(g.filter((x) => x[0] > at - 300 && x[0] < at + 900)));
  await b.close();
})();
