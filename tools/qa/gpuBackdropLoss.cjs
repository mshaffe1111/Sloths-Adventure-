/**
 * GPU plan stage 1 (R-3.2): losing the WebGL context in play, with the backdrop on the GPU.
 *   node tools/qa/gpuBackdropLoss.cjs <dev url> <out dir> [stage] [WxH]
 * The GPU path kept on (backdropCheck.keepGpu: this container's copy is a readback). Checks: copies made in play; loseContext() -> no
 * copies, the backdrop drawn on the 2D canvas (the frozen frame then matches the 2D backdrop exactly), the game running, no page errors;
 * restoreContext() -> copies again, and the frozen GPU frame matches the 2D backdrop as before the loss (>32 under 0.5%).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const { execFileSync } = require('child_process');
const [base = 'http://127.0.0.1:4303/', out = '/tmp/gpuBackdropLoss', stage = '1-1', size = '412x915'] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const fails = [];
const ok = (c, m) => { console.log(`${c ? '✓' : '✗'} ${m}`); if (!c) fails.push(m); };
const cmp = (a, b) => JSON.parse(execFileSync('python3', ['-c', `
import sys, json
from PIL import Image, ImageChops
a = Image.open(sys.argv[1]).convert('RGB'); b = Image.open(sys.argv[2]).convert('RGB')
v = list(ImageChops.difference(a, b).convert('L').get_flattened_data())
print(json.dumps({'over0': sum(1 for x in v if x), 'over32': sum(1 for x in v if x > 32) / len(v)}))`, a, b]).toString());
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.addInitScript(() => { window.__live = 0; addEventListener('sloth-stage-live', () => { window.__live = 1; }, { once: true }); for (let i = 1; i <= 11; i++) for (const k of ['w', 'm', 'g', 'n']) try { localStorage.setItem(`sloth_story_${k}${i}`, '1'); } catch {} });
  await pg.goto(base + `?autostart=1&level=${stage}&layout=1`, { timeout: 120000 });
  await pg.waitForFunction(() => window.__gpu, null, { timeout: 60000 });
  await pg.evaluate(() => { window.__gpu.check.keepGpu = true; });
  await pg.waitForFunction(() => window.__live, null, { timeout: 120000 });
  await pg.touchscreen.tap(W / 2, H / 2).catch(() => {});
  await pg.waitForTimeout(2500);
  const copies = () => pg.evaluate(() => window.__gpu.backdrop.copies);
  const frozen = async (force2d, file) => {
    const url = await pg.evaluate((f) => { window.__gpu.check.force2d = f; const e = window.__engine(); e.stop(); e.gameTime = 10; for (let i = 0; i < 10; i++) e.render(); window.__gpu.check.force2d = false; return e.canvas.toDataURL('image/png'); }, force2d);
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  };
  const resume = () => pg.evaluate(() => window.__engine().start());
  const c0 = await copies(); await pg.waitForTimeout(800); const c1 = await copies();
  ok(c1 > c0, `in play the backdrop is copied from the GPU every frame (${c1 - c0} copies in 0.8 s)`);
  // lose it
  await pg.evaluate(() => { const gl = document.querySelectorAll('canvas')[0].getContext('webgl2'); window.__lc = gl.getExtension('WEBGL_lose_context'); window.__lc.loseContext(); });
  await pg.waitForTimeout(600);
  const t0 = await pg.evaluate(() => window.__engine().gameTime); const l0 = await copies(); await pg.waitForTimeout(1000); const l1 = await copies(); const t1 = await pg.evaluate(() => window.__engine().gameTime);
  ok(l1 === l0, `context lost: no GPU copies (${l1 - l0} in 1 s)`);
  ok(t1 - t0 > 0.3, `the game keeps running (game time +${(t1 - t0).toFixed(2)} s)`);
  await frozen(false, `${out}/lost-asplayed.png`); await frozen(true, `${out}/lost-2d.png`);
  const dl = cmp(`${out}/lost-asplayed.png`, `${out}/lost-2d.png`);
  ok(dl.over0 === 0, `while lost the frame is the 2D backdrop's, pixel for pixel (${dl.over0} px differ)`);
  await resume();
  // restore it
  await pg.evaluate(() => window.__lc.restoreContext());
  await pg.waitForTimeout(1500);
  const r0 = await copies(); await pg.waitForTimeout(800); const r1 = await copies();
  ok(r1 > r0, `context restored: GPU copies again (${r1 - r0} in 0.8 s)`);
  console.log('sizes after restore', JSON.stringify(await pg.evaluate(() => ({ gpu: window.__gpu.sizes(), game: [window.__engine().canvas.width, window.__engine().canvas.height, window.__engine().quality] }))));
  await frozen(false, `${out}/restored-gpu.png`); await frozen(true, `${out}/restored-2d.png`);
  const dr = cmp(`${out}/restored-gpu.png`, `${out}/restored-2d.png`);
  ok(dr.over32 < 0.005, `after the restore the GPU backdrop matches the 2D one as before (>32: ${(100 * dr.over32).toFixed(3)}%)`);
  ok(errs.length === 0, `no page errors (${errs.join(' | ')})`);
  console.log(fails.length ? `FAIL (${fails.length})` : 'PASS');
  await b.close();
  process.exit(fails.length ? 1 : 0);
})();
