// usage: node measure.cjs <outdir> [stages...]  — counts renderScenery's canvas calls, times it, and dumps a PNG per world/orientation
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const stages = process.argv.slice(3).length ? process.argv.slice(3) : ['1-2', '2-2', '3-2', '4-2', '5-2', '6-2', '7-2', '8-2', '9-2', '10-2'];
const VIEWS = [
  { name: 'up', w: 400, h: 880 },
  { name: 'side', w: 880, h: 400 },
];

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
  const results = [];
  for (const v of VIEWS) {
    const page = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2 });
    page.on('pageerror', (e) => console.error('pageerror', e.message));
    await page.goto('http://localhost:4305/?seed=7', { waitUntil: 'load' });
    await page.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 60000 });
    for (const id of stages) {
      await page.evaluate((id) => window.__play(id), id);
      await page.waitForFunction(() => { const g = window.__engine; const e = typeof g === 'function' ? g() : g; return e && e.currentStage && e.camera; }, null, { timeout: 60000 });
      await page.waitForTimeout(4500);
      const r = await page.evaluate(async ({ id }) => {
        const sc = await import('/src/game/scenery.ts');
        const hl = await import('/src/game/heroLane.ts');
        const g = window.__engine; const e = typeof g === 'function' ? g() : g;
        const world = e.currentStage.config.worldIndex;
        const vw = e.camera.viewportWidth, vh = e.camera.viewportHeight;
        const stripVh = vh > vw ? (540 * vw) / 440 : vh;
        const K = 2 * (e.zoom || 1);
        const cv = document.createElement('canvas');
        cv.width = Math.round(vw * K);
        cv.height = Math.round(vh * K);
        const real = cv.getContext('2d', { alpha: false });
        const counts = { grad: 0, gradLin: 0, gradRad: 0, drawImage: 0, drawPx: 0, fills: 0, fillPx: 0, clip: 0, save: 0, comp: {}, smoothHigh: 0, scaled: [], fullscreen: 0 };
        let curComp = 'source-over';
        let smoothQ = 'low';
        const screen = vw * vh * K * K;
        const ctx = new Proxy(real, {
          get(t, p) {
            const val = t[p];
            if (typeof val !== 'function') return val;
            return function (...a) {
              if (p === 'createLinearGradient') { counts.grad++; counts.gradLin++; }
              if (p === 'createRadialGradient') { counts.grad++; counts.gradRad++; }
              if (p === 'clip') counts.clip++;
              if (p === 'save') counts.save++;
              if (p === 'fillRect') {
                const m = t.getTransform();
                const px = Math.abs(a[2] * a[3] * m.a * m.d);
                counts.fills++; counts.fillPx += px;
                if (px >= screen * 0.9) counts.fullscreen++;
                counts.comp[curComp] = (counts.comp[curComp] || 0) + 1;
              }
              if (p === 'drawImage') {
                const img = a[0];
                const m = t.getTransform();
                let sw, sh, dw, dh;
                if (a.length === 9) { sw = a[3]; sh = a[4]; dw = a[7]; dh = a[8]; }
                else if (a.length === 5) { sw = img.width; sh = img.height; dw = a[3]; dh = a[4]; }
                else { sw = img.width; sh = img.height; dw = img.width; dh = img.height; }
                const ddw = Math.abs(dw * m.a), ddh = Math.abs(dh * m.d);
                const px = ddw * ddh;
                counts.drawImage++; counts.drawPx += px;
                if (px >= screen * 0.9) counts.fullscreen++;
                counts.comp[curComp] = (counts.comp[curComp] || 0) + 1;
                if (smoothQ !== 'low') counts.smoothHigh++;
                const sx = ddw / sw, sy = ddh / sh;
                const tag = (img.src ? img.src.split('/').pop().split('?')[0] : `canvas${img.width}x${img.height}`);
                counts.scaled.push(`${tag} src ${Math.round(sw)}x${Math.round(sh)} -> ${Math.round(ddw)}x${Math.round(ddh)} (x${sx.toFixed(2)},${sy.toFixed(2)})`);
              }
              return val.apply(t, a);
            };
          },
          set(t, p, val) {
            if (p === 'globalCompositeOperation') curComp = val;
            if (p === 'imageSmoothingQuality') smoothQ = val;
            t[p] = val;
            return true;
          },
        });
        const camX = 1800, camY = e.camera.y, time = 12.3;
        hl.setHeroScreen(vw * 0.35, vh * 0.62);
        real.setTransform(K, 0, 0, K, 0, 0);
        real.imageSmoothingEnabled = true; real.imageSmoothingQuality = 'high'; smoothQ = 'high';
        sc.renderOverlay(ctx, world, camX, vw, vh, time, false);
        const png = cv.toDataURL('image/png');
        // timing: render many frames (moving camera), each finished with a one-pixel read so the GPU work is counted
        const real2 = document.createElement('canvas');
        real2.width = cv.width; real2.height = cv.height;
        const c2 = real2.getContext('2d', { alpha: false });
        c2.setTransform(K, 0, 0, K, 0, 0); c2.imageSmoothingEnabled = true; c2.imageSmoothingQuality = 'high';
        for (let i = 0; i < 10; i++) sc.renderOverlay(c2, world, camX + i * 7, vw, vh, time + i / 30, false);
        c2.getImageData(0, 0, 1, 1);
        const N = 60;
        const t0 = performance.now();
        for (let i = 0; i < N; i++) {
          hl.setHeroScreen(vw * 0.35, vh * 0.62);
          sc.renderOverlay(c2, world, camX + i * 7, vw, vh, time + i / 30, false);
          c2.getImageData(0, 0, 1, 1);
        }
        const ms = (performance.now() - t0) / N;
        return { id, world, vw, vh, counts: { ...counts, drawScreens: +(counts.drawPx / screen).toFixed(2), fillScreens: +(counts.fillPx / screen).toFixed(2), fillPx: undefined, drawPx: undefined }, ms: +ms.toFixed(2), png };
      }, { id });
      const file = path.join(out, `${v.name}-w${r.world}-${id}.png`);
      fs.writeFileSync(file, Buffer.from(r.png.split(',')[1], 'base64'));
      delete r.png;
      r.view = v.name;
      results.push(r);
      console.log(v.name, id, 'w' + r.world, `${r.ms}ms`, JSON.stringify({ ...r.counts, scaled: r.counts.scaled.length }));
    }
    await page.close();
  }
  fs.writeFileSync(path.join(out, 'counts.json'), JSON.stringify(results, null, 1));
  await browser.close();
})();
