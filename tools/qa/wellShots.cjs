/**
 * Stills of a stage's calm water at phone size (gen2-water, 2026-11-05: W3, "calm and deadly water never share a screen").
 *
 *   node tools/qa/wellShots.cjs <game url> <out dir> [level=6-7] [layouts=1,2] [difficulty=normal]
 *
 * For each layout: plays the level upright (390x844) and sideways (844x390) at deviceScaleFactor 2, puts Pokey on the bank just
 * before the stage's first calm pool (engine.calmPools(), swim.ts), lets the camera settle, and saves the frame ('bank'); one with Pokey
 * half way between the pool and the nearest deadly fall ('near': the worst screen); and one with the water raised (the room's lever on),
 * Pokey swimming in the middle of it ('swim'). Prints, per shot, the pool's span and every deadly fall
 * (gen2 falls of kind water, and any x with nothing under it down to waterY) inside the screen's world span. Needs the dev server
 * (the engine handle is dev-only).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const [url = 'http://127.0.0.1:4310/', out = '/tmp/wellShots', level = '6-7', layoutsArg = '1', diff = 'normal'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
(async () => {
  const b = await chromium.launch();
  for (const layout of layoutsArg.split(',')) for (const [orient, [W, H]] of Object.entries(SIZES)) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    pg.on('pageerror', (e) => console.log('PAGE', e.message));
    await pg.goto(url + `?autostart=1&level=${level}&layout=${layout}${diff === 'easy' ? '&difficulty=easy' : ''}`, { timeout: 120000 });
    const eng = `(() => { const g = window.__engine; return typeof g === 'function' ? g() : g; })()`;
    let ok = false;
    for (let i = 0; i < 120 && !ok; i++) {
      await pg.waitForTimeout(500);
      ok = await pg.evaluate(`${eng}?.currentStage?.config?.id === '${level}' && !!${eng}?.player`).catch(() => false);
    }
    if (!ok) { console.log(`layout ${layout} ${orient}: never reached play`); await ctx.close(); continue; }
    await pg.waitForTimeout(1500);
    await pg.waitForTimeout(3000);
    for (const pose of ['bank', 'near', 'swim']) {
      const info = await pg.evaluate(([pose]) => {
        const g = window.__engine; const e = typeof g === 'function' ? g() : g;
        const st = e.currentStage;
        for (const r of e.kit?.rooms ?? []) for (const l of r.levers ?? []) l.on = pose === 'swim';
        const pools = e.calmPools();
        if (!pools.length) return { none: true };
        const w = pools[0];
        // (the nearest deadly fall to the pool, either side: where the 'near' shot stands, half way between)
        const falls = (st.gen2?.falls ?? []).filter((f) => f.kind === 'water');
        const d = (f) => (f.x1 < w.x0 ? w.x0 - f.x1 : f.x0 > w.x1 ? f.x0 - w.x1 : 0);
        const nf = falls.slice().sort((a, b) => d(a) - d(b))[0];
        let x = pose === 'bank' ? w.x0 - 60 : pose === 'swim' ? (w.x0 + w.x1) / 2 : nf ? (nf.x1 < w.x0 ? (nf.x1 + w.x0) / 2 : (w.x1 + nf.x0) / 2) : w.x1 + 500;
        const ground = (xx) => st.platforms.filter((q) => q.type === 'solid' && !q.lift && xx >= q.x + 10 && xx <= q.x + q.width - 10 && q.y < 760).sort((a, b) => a.y - b.y)[0];
        let gr = ground(x);
        for (let k = 1; !gr && pose !== 'swim' && k < 40; k++) gr = ground(x + k * 20) ?? ground(x - k * 20), gr && (x = gr.x + gr.width / 2);
        const p = e.player;
        p.x = x; p.y = pose === 'swim' ? w.surfaceY + 30 : gr ? gr.y : w.surfaceY; p.vx = 0; p.vy = 0;
        p.invincibleTimer = 99;
        return { pool: [Math.round(w.x0), Math.round(w.x1), Math.round(w.surfaceY), Math.round(w.bottomY)], waterY: st.waterY, seed: st.gen2?.seed, nearest: nf ? `${nf.x0}-${nf.x1} (${Math.round(d(nf))} px from the pool)` : 'none' };
      }, [pose]);
      if (info.none) { console.log(`layout ${layout}: no calm pool`); break; }
      // (the raft and the water take a few seconds to rise; the camera eases in)
      await pg.waitForTimeout(pose === 'swim' ? 7000 : 2500);
      const view = await pg.evaluate(() => {
        const g = window.__engine; const e = typeof g === 'function' ? g() : g;
        const st = e.currentStage;
        const x0 = e.camera.x, x1 = e.camera.x + (e.viewCssW || 0) / e.zoom;
        const falls = (st.gen2?.falls ?? []).filter((f) => f.kind === 'water' && f.x1 > x0 && f.x0 < x1).map((f) => `${f.x0}-${f.x1}`);
        const open = [];
        for (let x = Math.floor(x0); x < x1; x += 10) if (!st.platforms.some((q) => x >= q.x && x <= q.x + q.width && q.y > (st.waterY ?? 1e9) - 900)) open.push(x);
        return { view: [Math.round(x0), Math.round(x1)], zoom: Math.round(e.zoom * 100) / 100, falls, open: open.length ? `${open[0]}..${open[open.length - 1]} (${open.length} columns)` : 'none', px: Math.round(e.player.x), swim: !!e.player.swim, lives: e.lives };
      });
      const file = `${out}/${level}-L${layout}-${diff}-${orient}-${pose}.png`;
      await pg.screenshot({ path: file });
      console.log(`${file}: seed ${info.seed}; pool ${info.pool.join(',')}; nearest deadly fall ${info.nearest}; waterY ${info.waterY}; screen x ${view.view.join('-')} (zoom ${view.zoom}); Pokey x ${view.px} swim ${view.swim} lives ${view.lives}; deadly water falls on screen: ${view.falls.join(' ') || 'none'}; open columns on screen: ${view.open}`);
    }
    await ctx.close();
  }
  await b.close();
})();
