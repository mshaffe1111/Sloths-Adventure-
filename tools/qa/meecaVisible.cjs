/**
 * Is Meeca on the screen? (5-M, Matt 2026-10-31: "she goes in and out the whole level... you only see her words")
 *
 *   node tools/qa/meecaVisible.cjs <game url> <out dir> [q0|q1|q2] [reduce] [WxH] [seconds] [dpr]
 *
 * Plays 5-M on a phone-sized page (default upright 448x998 at dpr 3, Matt's Pixel), walking and hopping right with the keys. Every
 * half second it draws the frame twice, as the game draws it and once without her (engine.qaHideHero), reads the canvas back and counts
 * the pixels in her box that change: that is how much of her shows, after everything drawn over her (the night, the lights, anything in
 * front). Her box is about 40% her when nothing covers her; a sample under 12% is a MISS and its frame is saved. The quality step is
 * forced (q0 full, q1, q2 the lite path) and `reduce` asks for reduced motion. Needs the dev server (the engine handle is dev-only).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const [url = 'http://127.0.0.1:4303/', out = '/tmp/meecaVisible', qArg = '', reduce = '', size = '448x998', secs = '60', dprArg = '3'] = process.argv.slice(2);
const [W, H] = size.split('x').map(Number);
const q = /^q[012]$/.test(qArg) ? Number(qArg[1]) : -1;
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: Number(dprArg), isMobile: true, hasTouch: true, reducedMotion: reduce === 'reduce' ? 'reduce' : 'no-preference' });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => console.log('PAGE', e.message));
  await pg.goto(url + (url.includes('?') ? '&' : '?') + 'autostart=1&level=5-M&layout=1', { timeout: 120000 });
  const eng = `(() => { const g = window.__engine; return typeof g === 'function' ? g() : g; })()`;
  for (let i = 0; i < 60; i++) {
    await pg.waitForTimeout(500);
    const ph = await pg.evaluate(`${eng}?.mc?.phase`).catch(() => null);
    if (ph === 'card') {
      await pg.waitForTimeout(1500);
      await pg.touchscreen.tap(W / 2, H / 2);
      await pg.waitForTimeout(800);
      await pg.touchscreen.tap(W / 2, H / 2);
      break;
    }
  }
  const key = (k, d) => pg.evaluate(([k, d]) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { key: k, code: k })), [k, d]);
  let n = 0, miss = 0, worst = 1;
  const t0 = Date.now();
  while (Date.now() - t0 < Number(secs) * 1000) {
    await key('ArrowRight', true);
    if (n % 3 === 1) await key(' ', true);
    await pg.waitForTimeout(350);
    await key(' ', false);
    await key('ArrowRight', false);
    await pg.waitForTimeout(150);
    const r = await pg.evaluate(([q]) => {
      const g = window.__engine;
      const e = typeof g === 'function' ? g() : g;
      if (!e?.mc || e.mc.phase !== 'play') return null;
      if (q >= 0) e.quality = q;
      const cv = e.canvas;
      const c2 = cv.getContext('2d');
      // (the frame is drawn at the engine's own scale: a forced quality step changes it before the canvas is resized)
      const k = typeof e.renderDpr === 'function' ? e.renderDpr() : cv.width / (e.viewCssW || cv.clientWidth);
      const z = e.zoom;
      const p = e.player;
      const bx = Math.round(((p.x - e.camera.x) * z - 26) * k), by = Math.round(((p.y - e.camera.y) * z - 88) * k);
      const bw = Math.round(52 * k * z), bh = Math.round(86 * k * z);
      if (bx < 0 || by < 0 || bx + bw > cv.width || by + bh > cv.height) return { off: true, x: p.x, y: p.y };
      e.render();
      const a = c2.getImageData(bx, by, bw, bh).data;
      e.qaHideHero = true;
      e.render();
      const c = c2.getImageData(bx, by, bw, bh).data;
      e.qaHideHero = false;
      e.render();
      let on = 0;
      for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - c[i]) + Math.abs(a[i + 1] - c[i + 1]) + Math.abs(a[i + 2] - c[i + 2]) > 30) on++;
      return { shows: on / (a.length / 4), x: Math.round(p.x), y: Math.round(p.y), q: e.quality, box: [bx, by, bw, bh] };
    }, [q]).catch((err) => ({ err: String(err) }));
    n++;
    if (!r) continue;
    if (r.err || r.off) {
      console.log(n, JSON.stringify(r));
      continue;
    }
    worst = Math.min(worst, r.shows);
    const bad = r.shows < 0.12;
    if (bad) {
      miss++;
      await pg.screenshot({ path: `${out}/miss-${String(n).padStart(3, '0')}.png` });
    }
    console.log(n, bad ? 'MISS' : 'ok', `shows ${(r.shows * 100).toFixed(0)}%`, `x ${r.x} y ${r.y} q${r.q}`);
  }
  console.log(`samples ${n}, misses ${miss}, worst ${(worst * 100).toFixed(0)}%`);
  await b.close();
  process.exit(miss ? 1 : 0);
})();
