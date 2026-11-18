// POLISH-2 stills (stills-at.mjs's way: engine paused, Pokey placed, frames stepped then stepped+rendered), 2x, upright 412x915 and
// sideways 915x412, Normal or Easy (&difficulty=easy), at (x,y): stand on the floor under (x,y), or climb the nearest vine.
//   node shot.mjs <port> <out dir> <prefix> <stage> <layout> <normal|easy> <spot> ...   spot: x,y,stand|climb[,n shots,gap frames][,hold]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, prefix, id, layout, setting, ...spots] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const only = process.env.ONLY;
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  if (only && only !== tag) continue;
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off${setting === 'easy' ? '&difficulty=easy' : ''}`);
  await p.waitForTimeout(2500);
  await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(4000);
  for (const spot of spots) {
    const [xs, ys, mode = 'stand', ns = '1', gs = '15', hold] = spot.split(','); const x = +xs, y = +ys;
    await p.evaluate(([x, y, mode, hold, E]) => {
      const e = eval(E);
      e.isPaused = true;
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      if (mode === 'climb') {
        const v = e.vines.filter((q) => !q.off && y >= q.topY - 10 && y <= q.bottomY + 10).sort((a, c) => Math.abs(a.x - x) - Math.abs(c.x - x))[0];
        Object.assign(e.player, { x: v.x, y, vx: 0, vy: 0, grounded: false, climbing: true, hanging: false, facing: 1, invincibleTimer: 9 });
      } else {
        const under = e.platforms.filter((q) => !q.broken && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width && q.y >= y - 4).sort((a, c) => a.y - c.y)[0];
        Object.assign(e.player, { x, y: under ? under.y : y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      }
      window.__hold = hold === 'hold' ? { x: e.player.x, y: e.player.y } : null;
      for (let i = 0; i < 60; i++) { e.update(1 / 30); if (window.__hold) Object.assign(e.player, window.__hold, { vy: 0 }); }
    }, [x, y, mode, hold, E]);
    for (let k = 0; k < +ns; k++) {
      for (let i = 0; i < (k ? +gs : 30); i++) {
        await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); if (window.__hold) Object.assign(e.player, window.__hold, { vy: 0 }); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
        await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
      }
      await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
      const file = path.join(out, `${prefix}-${id}-${setting}-x${x}y${y}${+ns > 1 ? '-' + k : ''}-${tag}.jpg`);
      await p.screenshot({ path: file, type: 'jpeg', quality: 78 });
      console.log('wrote', file);
    }
  }
  await p.context().close();
}
await b.close();
