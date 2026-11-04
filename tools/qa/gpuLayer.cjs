/**
 * The GPU layer's check (GPU-RENDERER-PLAN stage 0, R-3.1): node tools/qa/gpuLayer.cjs <dev server url> <out dir> [stage] [WxH]
 *
 *  0. started under the title card (stage 1's backdrop); where the copy is a readback (this container) the backdrop went back to the 2D
 *     canvas before play;
 *  1. mounted: WebGL 2 (never 1); with nothing on it, hidden and idle (no GPU frames, 1x1 buffer), the game running;
 *  2. the camera drives it: a magenta probe box on the layer at Pokey's world box lands where the 2D canvas draws him, before and after
 *     he walks (the 2D canvas hidden for the shot), within 2 CSS px;
 *  3. context loss: WEBGL_lose_context.loseContext() -> no page error, the 2D game keeps running, the layer skips its frames;
 *     restoreContext() -> the layer draws the probe again where it should.
 * Prints PASS or the failures; exit 1 on a failure. Needs the dev server (window.__engine, __gpu).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const [base = 'http://127.0.0.1:4303/', out = '/tmp/gpuLayer', stage = '1-1', size = '448x998'] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const fails = [];
const ok = (c, msg) => { console.log(`${c ? '✓' : '✗'} ${msg}`); if (!c) fails.push(msg); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('pageerror', (e) => errors.push(e.message));
  await pg.addInitScript(() => { window.__live = 0; addEventListener('sloth-stage-live', () => { window.__live = performance.now(); }, { once: true }); });
  await pg.goto(base, { timeout: 120000 }); await pg.waitForTimeout(2000);
  await pg.evaluate(() => { for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) localStorage.setItem(`sloth_story_${k}${w}`, '1'); });
  await pg.goto(base + (base.includes('?') ? '&' : '?') + `autostart=1&level=${stage}&layout=1`, { timeout: 120000 });
  await pg.waitForFunction(() => window.__live > 0, null, { timeout: 120000 });
  await pg.touchscreen.tap(W / 2, H / 2).catch(() => {});
  await pg.waitForTimeout(2500);
  const E = `(() => { const g = window.__engine; return typeof g === 'function' ? g() : g; })()`;
  // stage 1: started under the title card for the backdrop (here the copy is a readback, so the backdrop itself went back to the 2D
  // canvas before play: backdropGpuOff names why)
  const idle0 = await pg.evaluate(() => ({ live: window.__gpu.live(), off: window.__gpu.off(), bd: { ...window.__gpu.backdrop } }));
  ok(idle0.live, `started under the title card (backdrop: ${idle0.off || 'on the GPU'}, ${idle0.bd.copies} copies)`);
  await pg.waitForTimeout(300);
  const st = await pg.evaluate(`(() => { const cvs = [...document.querySelectorAll('canvas')]; const gpu = cvs[0]; const gl = gpu.getContext('webgl2');
    return { live: window.__gpu.live(), stats: { ...window.__gpu.stats }, gl2: gl instanceof WebGL2RenderingContext, vis: gpu.style.visibility, under: cvs[0].compareDocumentPosition(cvs[1]) & Node.DOCUMENT_POSITION_FOLLOWING, size: [gpu.width, gpu.height], game: [cvs[1].width, cvs[1].height] }; })()`);
  console.log(JSON.stringify(st));
  ok(st.live, 'the layer is running');
  ok(st.gl2, 'its context is WebGL 2');
  await pg.waitForTimeout(600);
  const drawnLater = await pg.evaluate(() => window.__gpu.stats.drawn);
  ok(st.vis === 'hidden' && drawnLater === st.stats.drawn, `emptied, hidden and no GPU frames (drawn ${st.stats.drawn} then ${drawnLater} 0.6 s later)`);
  // (the loop drives it: one call a frame. Over half a second, as many layer calls as the game's own frames)
  const drive = await pg.evaluate(`new Promise((res) => { const e = ${E}; const i0 = window.__gpu.stats.idle; let n = 0; const t0 = performance.now(); let last = e.frameCount ?? 0;
    const f = () => { n++; if (performance.now() - t0 < 600) requestAnimationFrame(f); else res({ calls: window.__gpu.stats.idle - i0, rafs: n }); }; requestAnimationFrame(f); })`);
  ok(drive.calls > 0 && drive.calls <= drive.rafs, `the loop hands it each frame: ${drive.calls} layer calls in ${drive.rafs} animation frames (the game draws at most one frame per animation frame, 30 fps)`);
  ok(!!st.under, 'it sits under the game canvas');
  ok(idle0.off ? st.size[0] === 1 && st.size[1] === 1 : true, `with nothing on it and the backdrop on the 2D canvas, its drawing buffer is 1x1 (${st.size})`);
  // the probe at Pokey's box, and where the 2D canvas puts that box on screen
  const probeAt = async (tag) => {
    const want = await pg.evaluate(`(async () => { const e = ${E}; const p = e.player; await window.__gpu.probe({ x: p.x - 20, y: p.y - 60, w: 40, h: 60 }); return true; })()`);
    await pg.waitForTimeout(400);
    // the expected box, from the very frame the layer drew: freeze the game, draw one more frame of both
    const exp = await pg.evaluate(`(() => { const e = ${E}; e.stop(); e.render(); window.__gpuFrame && 0; const p = e.player; const z = e.zoom; const tx = e.gpuTx, ty = e.gpuTy;
      return { x0: (p.x - 20 + tx) * z, y0: (p.y - 60 + ty) * z, x1: (p.x + 20 + tx) * z, y1: (p.y + ty) * z, tx, ty, z }; })()`);
    await pg.evaluate(`(() => { const e = ${E}; const g = window.__gpu; return g; })()`);
    // (one layer frame for the frozen camera, then the 2D canvas hidden for the shot)
    await pg.evaluate(`(async () => { const m = await import('/src/game/gpuLayer.ts'); const e = ${E}; m.drawGpuFrame(e.gpuTx, e.gpuTy, e.zoom); document.querySelectorAll('canvas')[1].style.visibility = 'hidden'; })()`);
    await pg.waitForTimeout(300);
    const shot = `${out}/probe-${tag}.png`;
    await pg.screenshot({ path: shot });
    await pg.evaluate(`(() => { document.querySelectorAll('canvas')[1].style.visibility = ''; const e = ${E}; e.start(); })()`);
    return { exp, shot };
  };
  const bbox = (file) => {
    const { execFileSync } = require('child_process');
    const r = execFileSync('python3', ['-c', `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB'); w, h = im.size; px = im.load()
xs = []; ys = []
for y in range(0, h):
  for x in range(0, w):
    r, g, b = px[x, y]
    if r > 230 and g < 40 and b > 230: xs.append(x); ys.append(y)
print(f"{min(xs)} {min(ys)} {max(xs)+1} {max(ys)+1}" if xs else "none")`, file]).toString().trim();
    if (r === 'none') return null;
    const [x0, y0, x1, y1] = r.split(' ').map(Number);
    return { x0: x0 / 2, y0: y0 / 2, x1: x1 / 2, y1: y1 / 2 };
  };
  const near = (a, e) => a && Math.max(Math.abs(a.x0 - e.x0), Math.abs(a.y0 - e.y0), Math.abs(a.x1 - e.x1), Math.abs(a.y1 - e.y1)) <= 2;
  let r = await probeAt('start');
  const full = await pg.evaluate(() => { const c = document.querySelectorAll('canvas'); return [c[0].width, c[0].height, c[1].width, c[1].height]; });
  ok(full[0] === full[2] && full[1] === full[3], `with something on it, its drawing buffer is the game canvas's size (${full.slice(0, 2)} vs ${full.slice(2)})`);
  let got = bbox(r.shot);
  ok(near(got, r.exp), `probe at the start lands on Pokey's box: got ${JSON.stringify(got)}, want ${JSON.stringify(r.exp)}`);
  // walk right a second and a half: the camera moves; the probe stays with the world
  await pg.evaluate(() => dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' })));
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', code: 'ArrowRight' })));
  const r2 = await pg.evaluate(`(async () => { const e = ${E}; return { tx: e.gpuTx }; })()`);
  // (the probe was put at the old place: it should now be where that world box is on screen)
  const old = r.exp;
  const moved = await probeAt('walked');
  got = bbox(moved.shot);
  ok(near(got, moved.exp) && Math.abs(moved.exp.tx - old.tx) > 10, `after walking (camera moved ${Math.round(moved.exp.tx - old.tx)} units) the probe still lands on his box: got ${JSON.stringify(got)}, want ${JSON.stringify(moved.exp)}`);
  // context loss and restore
  const t0 = await pg.evaluate(`${E}.gameTime`);
  await pg.evaluate(() => { const gl = document.querySelectorAll('canvas')[0].getContext('webgl2'); window.__lc = gl.getExtension('WEBGL_lose_context'); window.__lc.loseContext(); });
  await pg.waitForTimeout(1500);
  const lostSt = await pg.evaluate(`(() => ({ live: window.__gpu.live(), stats: { ...window.__gpu.stats }, t: ${E}.gameTime }))()`);
  console.log('lost', JSON.stringify(lostSt));
  ok(!lostSt.live && lostSt.stats.losses === 1 && lostSt.stats.lostFrames > 10, 'context lost: the layer stands down and skips its frames');
  ok(lostSt.t - t0 > 1, `the 2D game keeps running while it is lost (game time +${(lostSt.t - t0).toFixed(2)} s)`);
  await pg.screenshot({ path: `${out}/while-lost.png` });
  await pg.evaluate(() => window.__lc.restoreContext());
  await pg.waitForTimeout(1500);
  const backSt = await pg.evaluate(`(() => ({ live: window.__gpu.live(), stats: { ...window.__gpu.stats } }))()`);
  ok(backSt.live && backSt.stats.restores === 1, 'context restored: the layer is running again');
  r = await probeAt('restored');
  got = bbox(r.shot);
  ok(near(got, r.exp), `after the restore it draws again, in the right place: got ${JSON.stringify(got)}, want ${JSON.stringify(r.exp)}`);
  await pg.evaluate(() => window.__gpu.probe(null));
  await pg.waitForTimeout(400);
  const end = await pg.evaluate(() => { const c = document.querySelectorAll('canvas')[0]; return [c.style.visibility, c.width, c.height]; });
  ok(end[0] === 'hidden' && end[1] === 1 && end[2] === 1, `probe off: the layer hides again and drops back to 1x1 (${end})`);
  ok(errors.length === 0, `no page errors (${errors.join(' | ')})`);
  console.log(fails.length ? `FAIL (${fails.length})` : 'PASS');
  await b.close();
  process.exit(fails.length ? 1 : 0);
})();
