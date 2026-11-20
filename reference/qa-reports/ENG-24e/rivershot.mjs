// ENG-24e: river stills on the real page (dev server), the whole screen, 2x, upright 412x915 and sideways 915x412, the setting set
// (localStorage sloth_difficulty, the game's own read; the built setting printed from the engine). Each spot: Pokey stood at x on the ground
// under it (or `y` given), the guide cleared, 20 frames run, shot; with CROP=1 also a 2x crop of the screen from the bank's face to its foot.
//   node reference/qa-reports/ENG-24e/rivershot.mjs <port> <out dir> <stage> <layout> <x[:name[:cropX]]> ...   (DIFF=normal|easy, ORIENT=both|upright|sideways)
import fs from 'node:fs';
import path from 'node:path';
const pw = await import(process.env.PW ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const [port, out, stage, layout, ...spots] = process.argv.slice(2);
const DIFF = process.env.DIFF ?? 'normal';
const ORIENT = process.env.ORIENT ?? 'both';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const log = [];
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  if (ORIENT !== 'both' && ORIENT !== tag) continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, DIFF);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForTimeout(2500);
  await p.evaluate(([s, v]) => window.__play(s, v), [stage, +layout]);
  await p.waitForTimeout(4000);
  for (let k = 0; k < 6 && (await p.evaluate(() => document.documentElement.dataset.hudCard === '1')); k++) { await p.touchscreen.tap(w / 2, h / 2); await p.waitForTimeout(700); }
  const built = await p.evaluate((E) => { const e = eval(E); e.isPaused = true; return `${e.currentStage?.config?.id} easy=${!!e.easy}`; }, E);
  for (const spot of spots) {
    const [xs, name = 'spot', cropX] = spot.split(':');
    const x = +xs;
    const cam = await p.evaluate(([x, E, diag]) => {
      const e = eval(E);
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 600, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      e.clearGuide?.();
      for (let i = 0; i < 40; i++) { e.updateCamera?.(1 / 30); }
      // (DIAG: a diagnostic snippet run on the engine `e` before the frames, e.g. the under-bank run switched off)
      if (diag) new Function('e', diag)(e);
      for (let i = 0; i < 20; i++) { e.update(1 / 30); }
      e.render();
      return { cx: e.camera.x, cy: e.camera.y, vw: e.camera.viewportWidth, vh: e.camera.viewportHeight };
    }, [x, E, process.env.DIAG ?? '']);
    await p.waitForTimeout(150);
    const f = path.join(out, `${stage}-L${layout}-${DIFF}-x${x}-${name}-${tag}.jpg`);
    await p.screenshot({ path: f, type: 'jpeg', quality: 88 });
    log.push(`${tag} ${built} x${x} ${name}: cam ${Math.round(cam.cx)},${Math.round(cam.cy)} view ${Math.round(cam.vw)}x${Math.round(cam.vh)} -> ${f}`);
    if (cropX) {
      // (the bank's face at world x cropX, from the bank top's screen row to the screen's foot, 400 css px wide (or the screen), at 2x)
      const sx = ((+cropX - cam.cx) / cam.vw) * w;
      const cw = Math.min(w, 400), clip = { x: Math.max(0, Math.min(w - cw, sx - cw / 2)), y: Math.round(h * 0.4), width: cw, height: h - Math.round(h * 0.4) };
      const fc = path.join(out, `${stage}-L${layout}-${DIFF}-x${x}-${name}-${tag}-crop.jpg`);
      await p.screenshot({ path: fc, clip, scale: 'device', type: 'jpeg', quality: 90 });
      log.push(`  crop at world x${cropX} (screen ${Math.round(sx)}) -> ${fc}`);
    }
  }
  await ctx.close();
}
await b.close();
console.log(log.join('\n'));
