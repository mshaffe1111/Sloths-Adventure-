/**
 * The same look with the ground's squares on the GPU (GPU-RENDERER-PLAN stage 2, R-3.3):
 *   node tools/qa/gpuGround.cjs <dev url> <out dir> [stages] [port|land] [--pipeline sw|gpu] [--q 0,1,2]
 * For each stage, way up and picture quality: Math.random seeded, the stage opened and played 3 s, then FROZEN (engine stopped, intro
 * over, a fixed game time, drawn 40 times so every square in view has painted). The same frozen frame is then drawn three ways in the
 * one page and the game canvas's own pixels read back (never a screenshot: the DOM over it moves on its own clock):
 *   A   the squares stamped on the 2D canvas (today's way);   A2  the same again (what moves by itself between two draws: left out);
 *   B   the squares drawn by WebGL and copied in.
 * Prints the pixels that differ between A and B, the largest difference in any colour channel, and how many differ by more than 2 and
 * by more than 8 (of 255). It proves B really ran on the GPU (the layer's own frame counter moved, with squares on it), or fails.
 * Saves A, B and a map of where they differ (white = differs) for each run. PASS = 0 differing pixels everywhere.
 * A two-page comparison is noise (webgl.md, 2026-11-04): this one is one page, one frame.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf(name); return i < 0 ? null : argv.splice(i, 2)[1]; };
const PIPE = opt('--pipeline') || 'sw';
const QS = (opt('--q') || '0,1,2').split(',').map(Number);
const [base, out, stagesArg, oArg] = argv;
const STAGES = (stagesArg && stagesArg !== '-' ? stagesArg : '1-1,3-2,8-1').split(',');
const OR = [{ id: 'port', w: 412, h: 915 }, { id: 'land', w: 915, h: 412 }].filter((o) => !oArg || o.id === oArg);
const GPU_ARGS = ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-accelerated-2d-canvas', '--use-angle=swiftshader'];
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', ...(PIPE === 'gpu' ? GPU_ARGS : [])] });
  const c2d = await (await b.newBrowserCDPSession()).send('SystemInfo.getInfo').then((i) => i.gpu.featureStatus['2d_canvas'], () => '?');
  console.log(`2D canvas: ${c2d} (pipeline ${PIPE})`);
  let bad = 0;
  for (const o of OR) for (const st of STAGES) {
    const ctx = await b.newContext({ viewport: { width: o.w, height: o.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/script\.google\.com/, (r) => r.abort());
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.addInitScript(() => {
      let s = 12345; Math.random = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      window.__live = 0; addEventListener('sloth-stage-live', () => { window.__live = performance.now(); }, { once: true });
      Element.prototype.requestFullscreen = () => Promise.resolve();
      for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) try { localStorage.setItem(`sloth_story_${k}${w}`, '1'); } catch {}
    });
    try {
      await pg.goto(base + `?autostart=1&level=${st}&layout=1`, { timeout: 120000 });
      await pg.waitForFunction(() => window.__live > 0, null, { timeout: 120000 });
      await pg.waitForTimeout(3000);
      for (const q of QS) {
        const r = await pg.evaluate(async ({ q }) => {
          const g = window.__engine; const e = typeof g === 'function' ? g() : g;
          // (the game's own copies, on the dev-only window.__gpu: App.tsx)
          const L = window.__gpu, G = { groundCheck: L.ground.check, groundGpuStats: L.ground.stats, groundGpuOff: L.ground.off };
          const mounted = await L.mount();
          e.stop(); e.introT = 99;
          if (e.gov) { e.gov.takeUp = () => false; e.gov.feed = () => false; }
          if (e.quality !== q) { e.quality = q; e.resizeCanvas(); }
          e.applyZoom(); e.gameTime = 10;
          const cv = e.canvas, w = cv.width, h = cv.height;
          // (a scratch canvas reads the game canvas's pixels: reading the game canvas itself would move it off the GPU for good)
          const sc = document.createElement('canvas'); sc.width = w; sc.height = h;
          const sx = sc.getContext('2d', { willReadFrequently: true });
          const grab = () => { sx.clearRect(0, 0, w, h); sx.drawImage(cv, 0, 0); return sx.getImageData(0, 0, w, h); };
          const draw = (n) => { for (let i = 0; i < n; i++) e.render(); };
          G.groundCheck.force2d = true; G.groundCheck.keepGpu = false;
          draw(40);
          const A = grab(); draw(3); const A2 = grab();
          const f0 = G.groundGpuStats.frames, s0 = G.groundGpuStats.sprites;
          G.groundCheck.force2d = false; G.groundCheck.keepGpu = true;
          draw(6);
          const B = grab();
          const frames = G.groundGpuStats.frames - f0, sprites = (G.groundGpuStats.sprites - s0) / Math.max(1, frames);
          G.groundCheck.force2d = true; G.groundCheck.keepGpu = false;
          let differ = 0, over2 = 0, over8 = 0, max = 0, self = 0;
          const D = sx.createImageData(w, h);
          for (let i = 0; i < A.data.length; i += 4) {
            let d = 0, n = 0;
            for (let k = 0; k < 3; k++) { d = Math.max(d, Math.abs(A.data[i + k] - B.data[i + k])); n = Math.max(n, Math.abs(A.data[i + k] - A2.data[i + k])); }
            if (n) { self++; continue; }
            if (d) { differ++; if (d > 2) over2++; if (d > 8) over8++; if (d > max) max = d; D.data[i] = D.data[i + 1] = D.data[i + 2] = 255; }
            D.data[i + 3] = 255;
          }
          const png = (img) => { sx.putImageData(img, 0, 0); return sc.toDataURL('image/png').split(',')[1]; };
          return { mounted, off: G.groundGpuOff(), fallback: L.fallback(), canvas: `${w}x${h}`, frames, sprites, differ, over2, over8, max, self, total: w * h, a: png(A), b: png(B), d: differ ? png(D) : null };
        }, { q });
        const tag = `${st}-${o.id}-q${q}`;
        fs.writeFileSync(`${out}/${tag}-A-2d.png`, Buffer.from(r.a, 'base64'));
        fs.writeFileSync(`${out}/${tag}-B-gpu.png`, Buffer.from(r.b, 'base64'));
        if (r.d) fs.writeFileSync(`${out}/${tag}-differs.png`, Buffer.from(r.d, 'base64'));
        const ran = r.mounted && r.frames >= 6 && r.sprites > 0;
        const same = r.differ === 0;
        if (!ran || !same) bad++;
        console.log(`${st} ${o.id === 'port' ? 'upright' : 'sideways'} q${q} ${r.canvas}: ${ran ? `GPU drew ${r.sprites.toFixed(0)} squares a frame` : `THE GPU PATH DID NOT RUN (mounted ${r.mounted}, frames ${r.frames}, squares ${r.sprites}, ${r.fallback || r.off || 'no reason given'})`}; ` +
          `${r.differ} px differ of ${r.total} (${((100 * r.differ) / r.total).toFixed(3)}%), largest difference ${r.max}/255, over 2: ${r.over2}, over 8: ${r.over8}; moves by itself: ${r.self} px (left out) ${ran && same ? 'SAME' : 'DIFFERENT'}`);
      }
      if (errs.length) { console.log(`${st} ${o.id} PAGE ERRORS: ${errs.join(' | ').slice(0, 300)}`); bad++; }
    } catch (err) { console.log(`${st} ${o.id} COULD NOT RUN: ${err.message.split('\n')[0]}`); bad++; }
    await ctx.close();
  }
  console.log(bad ? `FAIL (${bad})` : 'PASS');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
