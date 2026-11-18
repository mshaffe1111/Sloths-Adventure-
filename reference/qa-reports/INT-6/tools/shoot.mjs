// INT-6 stills (POLISH-2's shot.mjs, with two fixes: Easy is set the game's own way (localStorage sloth_difficulty before load; the page has
// NO ?difficulty= switch, so POLISH-2's '&difficulty=easy' shot Normal) and the setting the stage was built on is printed; plus a 'grab' spot:
// he stands 90 px left of the vine nearest (x,y) and jumps into it (vineFeelClip.mjs's grab keys), n shots gap frames apart from the jump.
// (stills-at.mjs's way: engine paused, Pokey placed, frames stepped then stepped+rendered), 2x, upright 412x915 and
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
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch { /* storage blocked */ } }, setting);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(4000);
  console.log(tag, 'built on', await p.evaluate((E) => { const e = eval(E); return [localStorage.getItem('sloth_difficulty'), e?.currentStage?.gen2?.budget?.difficulty, e?.currentStage?.gen2?.seed]; }, E));
  for (const spot of spots) {
    const [xs, ys, mode = 'stand', ns = '1', gs = '15', hold] = spot.split(','); const x = +xs, y = +ys;
    await p.evaluate(([x, y, mode, hold, E]) => {
      const e = eval(E);
      e.isPaused = true;
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      if (mode === 'grab') {
        const v = e.vines.filter((q) => !q.off && q.vineType === 'tree_climb' && Math.abs(q.bottomY - y) < 200).sort((a, c) => Math.abs(a.x - x) - Math.abs(c.x - x))[0];
        const under = e.platforms.filter((q) => !q.broken && !q.decorative && v.x - 90 >= q.x && v.x - 90 <= q.x + q.width && q.y >= v.bottomY - 30).sort((a, c) => a.y - c.y)[0];
        Object.assign(e.player, { x: v.x - 90, y: under ? under.y : v.bottomY, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
        for (let i = 0; i < 20; i++) e.update(1 / 30);
        window.__hold = null; return;
      }
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
    let fr = 0; const keysAt = (f) => (f < 7 ? ['Space', 'ArrowRight', 'ArrowUp'] : f < 27 ? ['ArrowUp'] : []);
    let held = [];
    for (let k = 0; k < +ns; k++) {
      for (let i = 0; i < (mode === 'grab' ? (k ? +gs : 2) : (k ? +gs : 30)); i++) {
        if (mode === 'grab') { const want = keysAt(fr++); for (const kk of held) if (!want.includes(kk)) await p.keyboard.up(kk); for (const kk of want) if (!held.includes(kk)) await p.keyboard.down(kk); held = want; }
        await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); if (window.__hold) Object.assign(e.player, window.__hold, { vy: 0 }); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
        await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
      }
      await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
      const file = path.join(out, `${prefix}-${id}-${setting}-${mode}-x${x}y${y}${+ns > 1 ? '-f' + String(fr || (k ? 30 + k * +gs : 30)) : ''}-${tag}.jpg`);
      await p.screenshot({ path: file, type: 'jpeg', quality: 78 });
      console.log('wrote', file);
    }
    for (const kk of held) await p.keyboard.up(kk);
  }
  await p.context().close();
}
await b.close();
