/**
 * The GPU layer's check (GPU-RENDERER-PLAN stage 0, R-3.1): node tools/qa/gpuLayer.cjs <dev server url> <out dir> [stage] [WxH]
 *
 * Run A (the layer, start to finish):
 *  1. a stage starts with the layer NOT started (stage 0 puts nothing on it): no fallback, its canvas hidden, the game canvas still the
 *     first canvas in the page and stacked over the layer's;
 *  2. putting a probe box on it starts it: WebGL 2 (never 1), its drawing buffer the game canvas's size, one layer frame per game frame;
 *  3. it is UNDER the game canvas: with both shown no probe pixel is on screen; with the 2D canvas hidden the probe lands on Pokey's
 *     world box within 1 CSS px, before and after he walks (the camera drives it);
 *  4. context loss (WEBGL_lose_context): no page error, the 2D game keeps running, the layer stands down and skips its frames; restored:
 *     the layer draws the probe again in the right place; probe off: hidden again, back to a 1x1 buffer;
 *  5. lost a second time: off for the session (gpuFallback says why), the 2D game still running.
 * Run B (no WebGL 2 on the phone: getContext('webgl2') gives null): the stage plays on the 2D canvas alone, a probe is refused,
 *     gpuFallback() is 'no WebGL 2', no page errors.
 * Run C (lost and never given back): after the wait the layer is off for the session ('context lost and not restored'), the game running.
 * Prints PASS or the failures; exit 1 on a failure. Needs the dev server (window.__engine, window.__gpu).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const [base = 'http://127.0.0.1:4711/', out = '/tmp/gpuLayer', stage = '1-1', size = '412x915'] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const fails = [];
const ok = (c, msg) => { console.log(`${c ? '✓' : '✗'} ${msg}`); if (!c) fails.push(msg); };
const E = `(() => { const g = window.__engine; return typeof g === 'function' ? g() : g; })()`;
const GPU = `document.querySelector('canvas[data-gpu-layer]')`;
const GAME = `document.querySelector('canvas:not([data-gpu-layer])')`;

async function open(b, init) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('pageerror', (e) => errors.push(e.message));
  await pg.addInitScript(() => {
    window.__live = 0;
    addEventListener('sloth-stage-live', () => { window.__live = performance.now(); }, { once: true });
    // (the game asks for fullscreen on a tap, which breaks later page calls in a headless browser)
    Element.prototype.requestFullscreen = () => Promise.resolve();
  });
  if (init) await pg.addInitScript(init);
  await pg.goto(base, { timeout: 120000 });
  await pg.waitForTimeout(2000);
  await pg.evaluate(() => { for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) localStorage.setItem(`sloth_story_${k}${w}`, '1'); });
  await pg.goto(base + (base.includes('?') ? '&' : '?') + `autostart=1&level=${stage}&layout=1`, { timeout: 120000 });
  await pg.waitForFunction(() => window.__live > 0, null, { timeout: 120000 });
  await pg.touchscreen.tap(W / 2, H / 2).catch(() => {});
  await pg.waitForTimeout(2500);
  return { pg, errors, close: () => ctx.close() };
}

/** the box of probe-coloured pixels in a screenshot, in CSS px (null: none) */
async function magenta(pg, file) {
  const png = await pg.screenshot({ path: file });
  return pg.evaluate(async (b64) => {
    const im = new Image();
    im.src = 'data:image/png;base64,' + b64;
    await im.decode();
    const c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (d[i] > 230 && d[i + 1] < 40 && d[i + 2] > 230) { n++; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
    }
    const k = im.width / innerWidth;
    return n ? { x0: x0 / k, y0: y0 / k, x1: (x1 + 1) / k, y1: (y1 + 1) / k, n } : null;
  }, png.toString('base64'));
}
const near = (a, e) => !!a && Math.max(Math.abs(a.x0 - e.x0), Math.abs(a.y0 - e.y0), Math.abs(a.x1 - e.x1), Math.abs(a.y1 - e.y1)) <= 1;
const box = (b) => (b ? `${b.x0.toFixed(1)},${b.y0.toFixed(1)} to ${b.x1.toFixed(1)},${b.y1.toFixed(1)}` : 'none');
const gameTime = (pg) => pg.evaluate(`${E}.gameTime`);

(async () => {
  const b = await chromium.launch();
  // ───────────── run A ─────────────
  console.log(`— run A: the layer (${stage}, ${W}x${H}) —`);
  {
    const { pg, errors, close } = await open(b);
    const st0 = await pg.evaluate(`(() => { const cvs = [...document.querySelectorAll('canvas')]; const gpu = ${GPU}, game = ${GAME}; const z = (e) => getComputedStyle(e).zIndex;
      return { live: window.__gpu.live(), fallback: window.__gpu.fallback(), sizes: window.__gpu.sizes(), stats: { ...window.__gpu.stats }, vis: gpu.style.visibility, firstIsGame: cvs[0] === game, n: cvs.length,
        zGame: z(game), zGpu: z(gpu), iso: getComputedStyle(gpu.parentElement).isolation, sameBox: gpu.parentElement === game.parentElement, ptr: getComputedStyle(gpu).pointerEvents }; })()`);
    console.log(JSON.stringify(st0));
    ok(!st0.live && st0.sizes === null && st0.fallback === '' && st0.stats.drawn === 0, 'a stage starts without starting the layer (nothing is on it yet): no context, no Pixi, no fallback');
    ok(st0.vis === 'hidden', 'its canvas is hidden');
    ok(st0.firstIsGame && st0.sameBox, 'the game canvas is still the first canvas in the page, the layer beside it in the same box');
    ok(Number(st0.zGame) > Number(st0.zGpu) && st0.iso === 'isolate' && st0.ptr === 'none', `the layer is stacked under the game canvas (z ${st0.zGpu} under ${st0.zGame}, inside an isolated box) and takes no touches`);

    const probeAt = async (tag) => {
      // (the probe's WORLD box is fixed when it is put: he may still be moving, so the expected screen box is worked out from that box)
      const at = await pg.evaluate(`(async () => { const e = ${E}; const p = e.player; const at = { x: p.x - 20, y: p.y - 60, w: 40, h: 60 }; return { ...at, put: await window.__gpu.probe(at) }; })()`);
      const put = at.put;
      await pg.waitForTimeout(400);
      // the expected box, from the very frame the layer drew: freeze the game, draw one more frame of both
      const exp = await pg.evaluate(`((at) => { const e = ${E}; e.stop(); e.resizeCanvas(); e.render(); const z = e.zoom; const tx = e.gpuTx, ty = e.gpuTy;
        window.__gpu.frame(tx, ty, z);
        return { x0: (at.x + tx) * z, y0: (at.y + ty) * z, x1: (at.x + at.w + tx) * z, y1: (at.y + at.h + ty) * z, tx, ty, z }; })(${JSON.stringify(at)})`);
      await pg.waitForTimeout(200);
      const covered = await magenta(pg, `${out}/probe-${tag}-under.png`);
      await pg.evaluate(`${GAME}.style.visibility = 'hidden'`);
      await pg.waitForTimeout(200);
      const got = await magenta(pg, `${out}/probe-${tag}.png`);
      await pg.evaluate(`(() => { ${GAME}.style.visibility = ''; ${E}.start(); })()`);
      return { put, exp, got, covered };
    };
    let r = await probeAt('start');
    const st = await pg.evaluate(`(() => { const gpu = ${GPU}, game = ${GAME}; const gl = gpu.getContext('webgl2');
      return { live: window.__gpu.live(), gl2: gl instanceof WebGL2RenderingContext, gl1: !!gpu.getContext('webgl'), sizes: window.__gpu.sizes(), buf: [gpu.width, gpu.height], game: [game.width, game.height], vis: gpu.style.visibility,
        renderer: gl ? gl.getParameter(gl.VERSION) : '', maxTex: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0 }; })()`);
    console.log(JSON.stringify(st));
    ok(r.put && st.live, 'putting something on it starts it');
    ok(st.gl2 && !st.gl1, `its context is WebGL 2, never WebGL 1 (${st.renderer}; MAX_TEXTURE_SIZE ${st.maxTex})`);
    ok(st.buf[0] === st.game[0] && st.buf[1] === st.game[1] && st.sizes.res === 1, `with something on it, its drawing buffer is the game canvas's size at resolution 1 (${st.buf} vs ${st.game})`);
    ok(st.vis === 'visible', 'and its canvas is shown');
    ok(r.covered === null, `it is under the game canvas: with both shown, no probe pixel is on screen (${box(r.covered)})`);
    ok(near(r.got, r.exp), `the 2D canvas hidden: the probe lands on Pokey's box: got ${box(r.got)}, want ${box(r.exp)}`);
    // the loop drives it: one layer frame per game frame
    const drive = await pg.evaluate(`new Promise((res) => { const d0 = window.__gpu.stats.drawn; let n = 0; const t0 = performance.now();
      const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res({ calls: window.__gpu.stats.drawn - d0, rafs: n }); }; requestAnimationFrame(f); })`);
    ok(drive.calls >= 15 && drive.calls <= 33 && drive.calls <= drive.rafs, `the 30 fps loop drives it: ${drive.calls} layer frames in 1 s (${drive.rafs} animation frames)`);
    // walk right a second and a half: the camera moves; the probe is put on him again and must land on him
    const old = r.exp;
    await pg.evaluate(() => dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' })));
    await pg.waitForTimeout(1500);
    await pg.evaluate(() => dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', code: 'ArrowRight' })));
    r = await probeAt('walked');
    ok(Math.abs(r.exp.tx - old.tx) > 10, `he walked: the camera moved ${Math.round(r.exp.tx - old.tx)} world units`);
    ok(near(r.got, r.exp) && r.covered === null, `after walking the probe still lands on his box, still under the game canvas: got ${box(r.got)}, want ${box(r.exp)}`);
    // context loss and restore
    const t0 = await gameTime(pg);
    await pg.evaluate(`(() => { const gl = ${GPU}.getContext('webgl2'); window.__lc = gl.getExtension('WEBGL_lose_context'); window.__lc.loseContext(); })()`);
    await pg.waitForTimeout(1500);
    const lostSt = await pg.evaluate(`(() => ({ live: window.__gpu.live(), fallback: window.__gpu.fallback(), stats: { ...window.__gpu.stats }, t: ${E}.gameTime, vis: ${GPU}.style.visibility }))()`);
    console.log('lost', JSON.stringify(lostSt));
    ok(!lostSt.live && lostSt.stats.losses === 1 && lostSt.stats.lostFrames > 10 && lostSt.fallback === '', `context lost: the layer stands down and skips its frames (${lostSt.stats.lostFrames} skipped), not yet given up on`);
    ok(lostSt.vis === 'hidden', 'its canvas is hidden while lost');
    ok(lostSt.t - t0 > 1, `the 2D game keeps running while it is lost (game time +${(lostSt.t - t0).toFixed(2)} s)`);
    await pg.screenshot({ path: `${out}/while-lost.png` });
    await pg.evaluate(() => window.__lc.restoreContext());
    await pg.waitForTimeout(1500);
    const backSt = await pg.evaluate(`(() => ({ live: window.__gpu.live(), fallback: window.__gpu.fallback(), stats: { ...window.__gpu.stats } }))()`);
    ok(backSt.live && backSt.stats.restores === 1 && backSt.fallback === '', 'context restored: the layer is running again');
    r = await probeAt('restored');
    ok(near(r.got, r.exp), `after the restore it draws again, in the right place: got ${box(r.got)}, want ${box(r.exp)}`);
    await pg.evaluate(() => window.__gpu.probe(null));
    await pg.waitForTimeout(400);
    const end = await pg.evaluate(`(() => { const c = ${GPU}; return [c.style.visibility, c.width, c.height]; })()`);
    ok(end[0] === 'hidden' && end[1] === 1 && end[2] === 1, `probe off: the layer hides again and drops back to a 1x1 buffer (${end})`);
    // a second loss: off for the session
    const t1 = await gameTime(pg);
    await pg.evaluate(() => window.__lc.loseContext());
    await pg.waitForTimeout(1200);
    const again = await pg.evaluate(`(() => ({ live: window.__gpu.live(), fallback: window.__gpu.fallback(), t: ${E}.gameTime, vis: ${GPU}.style.visibility }))()`);
    const refused = await pg.evaluate(() => window.__gpu.probe({ x: 0, y: 0, w: 10, h: 10 }));
    ok(!again.live && again.fallback === 'context lost again' && again.vis === 'hidden', `lost a second time: off for the session (gpuFallback: '${again.fallback}')`);
    ok(refused === false, 'and nothing can be put on it again this session');
    ok(again.t - t1 > 0.8, `the 2D game still running (game time +${(again.t - t1).toFixed(2)} s)`);
    ok(errors.length === 0, `no page errors (${errors.join(' | ')})`);
    await close();
  }
  // ───────────── run B ─────────────
  console.log('— run B: a phone with no WebGL 2 —');
  {
    const { pg, errors, close } = await open(b, () => {
      const real = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...rest) { return kind === 'webgl2' ? null : real.call(this, kind, ...rest); };
    });
    const t0 = await gameTime(pg);
    const put = await pg.evaluate(`(async () => { const e = ${E}; const p = e.player; return window.__gpu.probe({ x: p.x - 20, y: p.y - 60, w: 40, h: 60 }); })()`);
    await pg.waitForTimeout(1200);
    const st = await pg.evaluate(`(() => ({ live: window.__gpu.live(), fallback: window.__gpu.fallback(), t: ${E}.gameTime, vis: ${GPU}.style.visibility, sizes: window.__gpu.sizes() }))()`);
    console.log(JSON.stringify(st));
    ok(put === false && !st.live && st.sizes === null, 'the layer does not start, and the probe is refused');
    ok(st.fallback === 'no WebGL 2', `gpuFallback says why: '${st.fallback}'`);
    ok(st.vis === 'hidden', 'its canvas stays hidden');
    ok(st.t - t0 > 0.8, `the stage plays on the 2D canvas alone (game time +${(st.t - t0).toFixed(2)} s)`);
    const shot = await magenta(pg, `${out}/no-webgl2.png`);
    ok(shot === null, 'nothing of the layer is on screen');
    const again = await pg.evaluate(() => window.__gpu.probe({ x: 0, y: 0, w: 10, h: 10 }));
    ok(again === false, 'asked again, it is still off (the session stays on the 2D canvas)');
    ok(errors.length === 0, `no page errors (${errors.join(' | ')})`);
    await close();
  }
  // ───────────── run C ─────────────
  console.log('— run C: the context lost and never given back —');
  {
    const { pg, errors, close } = await open(b);
    const put = await pg.evaluate(`(async () => { const e = ${E}; const p = e.player; return window.__gpu.probe({ x: p.x - 20, y: p.y - 60, w: 40, h: 60 }); })()`);
    await pg.waitForTimeout(600);
    ok(put && (await pg.evaluate(() => window.__gpu.live())), 'the layer is running, a probe on it');
    const t0 = await gameTime(pg);
    await pg.evaluate(`(() => { const gl = ${GPU}.getContext('webgl2'); gl.getExtension('WEBGL_lose_context').loseContext(); })()`);
    await pg.waitForTimeout(1500);
    const mid = await pg.evaluate(() => ({ live: window.__gpu.live(), fallback: window.__gpu.fallback() }));
    ok(!mid.live && mid.fallback === '', 'lost: standing down, waiting for it to come back');
    await pg.waitForTimeout(4000);
    const st = await pg.evaluate(`(() => ({ live: window.__gpu.live(), fallback: window.__gpu.fallback(), t: ${E}.gameTime, vis: ${GPU}.style.visibility, buf: [${GPU}.width, ${GPU}.height] }))()`);
    console.log(JSON.stringify(st));
    ok(!st.live && st.fallback === 'context lost and not restored', `not given back within the wait: off for the session (gpuFallback: '${st.fallback}')`);
    ok(st.vis === 'hidden' && st.buf[0] === 1 && st.buf[1] === 1, `its canvas hidden, its buffer let go (${st.buf})`);
    ok(st.t - t0 > 4, `the 2D game ran the whole time (game time +${(st.t - t0).toFixed(2)} s)`);
    await pg.screenshot({ path: `${out}/after-fallback.png` });
    ok(errors.length === 0, `no page errors (${errors.join(' | ')})`);
    await close();
  }
  console.log(fails.length ? `FAIL (${fails.length})` : 'PASS');
  await b.close();
  process.exit(fails.length ? 1 : 0);
})();
