/**
 * The draw watch's own cost (drawWatch.ts, the measured release): the same frozen frame drawn with the watch and without it, on the
 * same page. Without it = the 2D canvas methods put back from a fresh iframe (an untouched CanvasRenderingContext2D.prototype).
 *   node tools/qa/drawWatchCost.cjs <dev url> [stages, default 1-1,5-M,8-1] [WxH, default 412x915] [frames, default 120]
 * Prints, per stage, the median ms a frame with and without the watch, alternating blocks of 20 frames so drift hits both alike.
 */
const { chromium } = require('playwright');
const [base = 'http://127.0.0.1:4303/', stagesArg = '1-1,5-M,8-1', size = '412x915', framesArg = '120'] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
const N = Number(framesArg);
(async () => {
  const b = await chromium.launch();
  const rows = [];
  for (const stage of stagesArg.split(',')) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.route(/script\.google\.com/, (r) => r.fulfill({ status: 200, body: 'ok' }));
    const pg = await ctx.newPage();
    await pg.addInitScript(() => {
      Element.prototype.requestFullscreen = function () { return Promise.resolve(); };
      window.__live = 0;
      addEventListener('sloth-stage-live', () => { window.__live = 1; }, { once: true });
      for (let i = 1; i <= 11; i++) for (const k of ['w', 'm', 'g', 'n']) try { localStorage.setItem(`sloth_story_${k}${i}`, '1'); } catch {}
    });
    await pg.goto(base + `?autostart=1&level=${stage}&layout=1`, { timeout: 120000 });
    await pg.waitForFunction(() => window.__live, null, { timeout: 120000 });
    for (let i = 0; i < 6; i++) { await pg.touchscreen.tap(W / 2, H / 2).catch(() => {}); await pg.waitForTimeout(400); }
    await pg.waitForTimeout(2000);
    const res = await pg.evaluate((n) => {
      const names = ['drawImage', 'fill', 'stroke', 'fillRect', 'getImageData', 'putImageData', 'createPattern', 'fillText'];
      const proto = CanvasRenderingContext2D.prototype;
      const watched = Object.fromEntries(names.map((k) => [k, proto[k]]));
      const fr = document.createElement('iframe');
      document.body.appendChild(fr);
      const clean = Object.fromEntries(names.map((k) => [k, fr.contentWindow.CanvasRenderingContext2D.prototype[k]]));
      const wrapped = names.filter((k) => watched[k] !== clean[k]).length;
      const e = window.__engine();
      e.stop();
      e.gameTime = 10;
      for (let i = 0; i < 40; i++) e.render();
      const on = [];
      const off = [];
      const block = (arr) => { for (let i = 0; i < 20; i++) { const t = performance.now(); e.render(); arr.push(performance.now() - t); } };
      for (let r = 0; r < n / 20; r++) {
        for (const k of names) proto[k] = watched[k];
        block(on);
        for (const k of names) proto[k] = clean[k];
        block(off);
      }
      for (const k of names) proto[k] = watched[k];
      const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
      return { wrapped, on: med(on), off: med(off) };
    }, N);
    rows.push({ stage, ...res });
    console.log(`${stage} ${size}: methods watched ${res.wrapped}; median frame with the watch ${res.on.toFixed(2)} ms, without ${res.off.toFixed(2)} ms, cost ${(res.on - res.off).toFixed(2)} ms`);
    await ctx.close();
  }
  const worst = Math.max(...rows.map((r) => r.on - r.off));
  console.log(`worst cost ${worst.toFixed(2)} ms a frame (limit about 1 ms)`);
  console.log(rows.every((r) => r.wrapped > 0) ? (worst <= 1 ? 'PASS' : 'OVER') : 'FAIL: the watch was not installed');
  await b.close();
})();
