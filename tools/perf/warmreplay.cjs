// node tools/perf/warmreplay.cjs <dev server url> <stage>: frame gaps of the first 10 s of a cold play, then of a second play of the same stage in the same page forced to q0 (everything already decoded, uploaded, baked). A frame over 100 ms in the warm play too is the container, not a first draw (warmup-5m, 2026-11-01). Needs the dev server (window.__engine, __play).
const { chromium } = require('playwright');
const [base, stage] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 448, height: 998 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (rt) => rt.abort());
  const pg = await ctx.newPage();
  await pg.addInitScript(() => {
    const w = window; w.__runs = [];
    addEventListener('sloth-stage-live', () => {
      const run = { live: performance.now(), gaps: [], q: [] }; w.__runs.push(run);
      if (w.__runs.length === 2) { const g = w.__engine; const e = typeof g === 'function' ? g() : g; if (e) { e.quality = 0; e.resizeCanvas?.(); e.render?.(); } }
      let last = performance.now();
      const tick = (t) => { const g = w.__engine; const e = typeof g === 'function' ? g() : g; run.gaps.push([Math.round(t - run.live), Math.round(t - last), e?.quality]); last = t; if (t - run.live < 10000) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  });
  await pg.goto(base, { timeout: 120000 }); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) localStorage.setItem(`sloth_story_${k}${w}`, '1'); });
  await pg.goto(base + `?autostart=1&level=${stage}&layout=1`, { timeout: 180000 });
  const key = (k, d) => pg.evaluate(([k, d]) => dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { key: k, code: k })), [k, d]);
  for (let n = 1; n <= 2; n++) {
    await pg.waitForFunction((n) => window.__runs.length >= n, n, { timeout: 120000, polling: 200 });
    await pg.touchscreen.tap(224, 500).catch(() => {});
    await key('ArrowRight', true);
    for (let i = 0; i < 10; i++) { await pg.waitForTimeout(800); await key(' ', true); await pg.waitForTimeout(200); await key(' ', false); }
    await key('ArrowRight', false);
    await pg.waitForFunction((n) => performance.now() - window.__runs[n - 1].live > 10200, n, { timeout: 60000 });
    if (n === 1) await pg.evaluate((s) => window.__play(s, 1), stage);
  }
  const runs = await pg.evaluate(() => window.__runs.map((r) => r.gaps));
  runs.forEach((g, i) => { const qi = g.findIndex((x, j) => j > 0 && x[2] !== g[j - 1][2]); if (!i) console.log('around first q change', JSON.stringify(g.slice(Math.max(0, qi - 4), qi + 6)), 'worst 0.3-3.4 s', Math.max(...g.filter((x) => x[0] > 300 && x[0] < 3400).map((x) => x[1]))); const big = g.slice(1).filter((x) => x[1] > 100); const qs = [...new Set(g.map((x) => x[2]))]; console.log(stage, i ? 'warm (2nd play)' : 'cold (1st play)', 'frames', g.length, 'worst', Math.max(...g.slice(1).map((x) => x[1])), '>100:', JSON.stringify(big), 'quality seen', JSON.stringify(qs)); });
  await b.close();
})();
