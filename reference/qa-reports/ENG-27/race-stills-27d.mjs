// ENG-27c scratch: stills of the home toy (?fixture=home via __play('2-97')): Pokey placed at x, the boat set `dx` px from him
//   node race-stills.mjs <port> <out> <x:boatDx:tag> ...   (boatDx 'none' leaves the boat's own clock)
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, ...spots] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: Number(process.env.DSF ?? 1) })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.__play('2-97', 1));
  await p.waitForTimeout(6000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(4000);
  for (const spot of spots) {
    const [xs, dxs, name] = spot.split(':'); const x = +xs;
    const info = await p.evaluate(([x, dxs, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && !q.drift && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 1500, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: dxs !== "none" && Number(dxs) > 0 ? 1 : -1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < Number(globalThis.SETTLE ?? 90); i++) { e.player.vx = 0; e.update(1 / 30); }
      const pc = e.pieces?.find((q) => q.kind === 'pacer');
      if (pc && dxs !== 'none') { const P = pc.pacer; const bx = x + Number(dxs); pc.clock = Math.max(0.01, ((bx - P.x0) / (P.x1 - P.x0)) * P.seconds); }
      return { px: Math.round(e.player.x), cam: Math.round(e.camera.x), y: e.player.y, boat: pc ? Math.round(pc.x) : null, clock: pc?.clock, lane: pc?.pacer.lane, open: e.pieces?.find((q) => q.kind === 'post')?.open };
    }, [x, dxs, E]);
    for (let i = 0; i < 8; i++) {
      await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.render(); }, E);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
    const file = path.join(out, `${name}-x${x}-${tag}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 70 });
    console.log('wrote', file, JSON.stringify(info));
  }
  await p.context().close();
}
await b.close();
