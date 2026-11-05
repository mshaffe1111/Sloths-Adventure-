/**
 * The measured release (GPU plan stage 1, Matt 2026-11-04): the GPU backdrop is OFF for every player and ON only with #ctest (the
 * testers' link). Run it on a PRODUCTION build (`npx vite build` then `npx vite preview`, VITE_QA_BUILD unset), never the dev server
 * (a QA build has the switch on).
 *   node tools/qa/gpuDefaultOff.cjs <preview url> [stages, default 1-1,5-M,8-1] [sizes, default 412x915,915x412]
 * Player (no #ctest), every stage and size: no WebGL context asked for, no Pixi chunk (gpuPixi-*.js) fetched, the GPU canvas never shown.
 * #ctest: the layer starts (a webgl2 context, the Pixi chunk) and the run's recording carries a `backdrop` line.
 * #ctest&gpuback=0: the recording's `backdrop` line says 2D (gpuback=0).
 * Service workers are blocked in the pages (each would precache the whole game); the precache list is read from sw.js instead: none of
 * the chunks only the testers' link fetches (Pixi's) may be in it.
 * The collector (the testers' sheet) is answered here and never reached: nothing from this check lands in Matt's sheet.
 */
const { chromium } = require('playwright');
const zlib = require('zlib');
const [base = 'http://127.0.0.1:4173/', stagesArg = '1-1,5-M,8-1', sizesArg = '412x915,915x412'] = process.argv.slice(2);
const fails = [];
const ok = (c, m) => { console.log(`${c ? '✓' : '✗'} ${m}`); if (!c) fails.push(m); };

async function open(b, size, url, { ctest = false } = {}) {
  const [W, H] = size.split('x').map(Number);
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const pixi = [];
  const js = new Set();
  const sent = [];
  // (the testers' sheet: answered here, never reached)
  await ctx.route(/script\.google\.com/, (r) => { sent.push(r.request().postData() || ''); r.fulfill({ status: 200, body: 'ok' }); });
  ctx.on('request', (r) => { const u = r.url(); if (/gpuPixi-[^/]*\.js/.test(u)) pixi.push(u); const m = u.match(/assets\/([^/?]+\.js)/); if (m) js.add(m[1]); });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.addInitScript(() => {
    window.__gl = 0;
    const gc = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
      if (/webgl/.test(String(kind))) window.__gl++;
      return gc.call(this, kind, ...rest);
    };
    Element.prototype.requestFullscreen = function () { return Promise.resolve(); };
    window.__live = 0;
    addEventListener('sloth-stage-live', () => { window.__live = 1; }, { once: true });
    for (let i = 1; i <= 11; i++) for (const k of ['w', 'm', 'g', 'n']) try { localStorage.setItem(`sloth_story_${k}${i}`, '1'); } catch {}
  });
  await pg.goto(base + url, { timeout: 120000 });
  if (ctest) {
    await pg.waitForSelector('#ctest-name', { timeout: 60000 });
    await pg.fill('#ctest-name', 'gpuDefaultOff check');
    await pg.click('button[type=submit]');
  }
  await pg.waitForFunction(() => window.__live, null, { timeout: 120000 });
  // (into play, and a few seconds of it)
  for (let i = 0; i < 6; i++) { await pg.touchscreen.tap(W / 2, H / 2).catch(() => {}); await pg.waitForTimeout(500); }
  await pg.waitForTimeout(3000);
  const st = await pg.evaluate(() => {
    const cvs = [...document.querySelectorAll('canvas')];
    // (the GPU layer's canvas is the one just under the game's canvas, App.tsx)
    const game = cvs.find((c) => c.style.touchAction === 'none');
    const gpu = game && game.previousElementSibling && game.previousElementSibling.tagName === 'CANVAS' ? game.previousElementSibling : null;
    return { gl: window.__gl, canvases: cvs.length, gpuFound: !!gpu, gpuShown: gpu && getComputedStyle(gpu).visibility !== 'hidden' ? 1 : 0, dev: typeof window.__gpu !== 'undefined' };
  });
  return { ctx, pg, pixi, js, sent, errs, st };
}

/** every line the recording sent so far (each part's `d`: gz64: gzip+base64, or raw:) */
function sentLines(sent) {
  const out = [];
  for (const body of sent) {
    try {
      const d = JSON.parse(body).d || '';
      const txt = d.startsWith('gz64:') ? zlib.gunzipSync(Buffer.from(d.slice(5), 'base64')).toString() : d.startsWith('raw:') ? d.slice(4) : '';
      if (txt) out.push(...JSON.parse(txt));
    } catch { /* a part that is not ours */ }
  }
  return out;
}
const backdropOf = (lines) => lines.filter((l) => l[0] === 'e' && l[2] === 'backdrop').map((l) => String(l[3]));

(async () => {
  const b = await chromium.launch();
  const stages = stagesArg.split(',');
  const playerJs = new Set();
  const testerJs = new Set();
  const sizes = sizesArg.split(',');
  for (const size of sizes) {
    for (const stage of stages) {
      const r = await open(b, size, `?autostart=1&level=${stage}&layout=1`);
      ok(!r.st.dev, `${stage} ${size} player: a production build (no dev hooks)`);
      ok(r.st.gl === 0, `${stage} ${size} player: no WebGL context asked for (${r.st.gl})`);
      ok(r.pixi.length === 0, `${stage} ${size} player: the Pixi chunk is never fetched (${r.pixi.length})`);
      ok(r.st.gpuFound && r.st.gpuShown === 0, `${stage} ${size} player: the GPU canvas (found: ${r.st.gpuFound}) is never shown`);
      ok(r.errs.length === 0, `${stage} ${size} player: no page errors (${r.errs.join(' | ')})`);
      for (const f of r.js) playerJs.add(f);
      await r.ctx.close();
    }
    // the testers' link, both ways (its own stage: the control test's)
    for (const [hash, want] of [['#ctest', /^GPU, copy|^2D \((copy|no WebGL)/], ['#ctest&gpuback=0', /^2D \(gpuback=0\)/]]) {
      const r = await open(b, size, hash, { ctest: true });
      ok(r.st.gl >= 1, `${hash} ${size}: the layer starts (webgl contexts asked for: ${r.st.gl})`);
      ok(r.pixi.length >= 1, `${hash} ${size}: the Pixi chunk is fetched (${r.pixi.length})`);
      // (the recording sends every 20 s and when the page is hidden: hide it to flush)
      await r.pg.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
      await r.pg.waitForTimeout(3000);
      const bl = backdropOf(sentLines(r.sent));
      ok(bl.length >= 1 && bl.every((l) => want.test(l)), `${hash} ${size}: the recording carries the backdrop line (${bl.join(' | ') || 'none'})`);
      ok(r.errs.length === 0, `${hash} ${size}: no page errors (${r.errs.join(' | ')})`);
      for (const f of r.js) testerJs.add(f);
      await r.ctx.close();
    }
  }
  // the service worker's precache list: none of the chunks only the testers' link fetches (Pixi's), so a player never downloads them
  const onlyTesters = [...testerJs].filter((f) => !playerJs.has(f));
  const sw = await (await fetch(new URL('sw.js', base))).text();
  ok(onlyTesters.length >= 1, `the testers' link fetches chunks a player never does (${onlyTesters.join(', ')})`);
  const cached = onlyTesters.filter((f) => sw.includes(f));
  ok(cached.length === 0, `none of them is in the service worker's precache (${cached.join(', ') || 'none'})`);
  console.log(fails.length ? `FAIL (${fails.length})` : 'PASS');
  await b.close();
  process.exit(fails.length ? 1 : 0);
})();
