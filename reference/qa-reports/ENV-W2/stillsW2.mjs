// ENV-W2 (R-165.362): before/after stills of World 2's ground on the real page, Normal, 2x, upright 412 x 915 and sideways 915 x 412.
// The engine is paused and stepped by hand (BUILD-23's stills23.mjs way). Pokey stands on the stage's widest solid ground (the busiest
// stretch of ground decoration), the same spot on both builds (the layouts do not move: lockall).
//   node reference/qa-reports/ENV-W2/stillsW2.mjs <port> <out dir> <tag: before|after> [stages, default 2-1,2-2,2-4,2-5] [layout, default 1]
import fs from 'node:fs';
import path from 'node:path';
const pw = await import(process.env.PW ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const [port, out, tag, stagesArg, layoutArg] = process.argv.slice(2);
const stages = (stagesArg ?? '2-1,2-2,2-4,2-5').split(',');
const layout = Number(layoutArg ?? 1);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const id of stages) {
  for (const [way, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate(([id, v]) => window.__play(id, v), [id, layout]);
    await p.waitForTimeout(4000);
    await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(3000);
    const at = await p.evaluate((E) => {
      const e = eval(E);
      e.isPaused = true;
      const q = e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && q.x > 300).sort((a, c) => c.width - a.width)[0];
      const x = Math.round(q.x + Math.min(q.width / 2, 900));
      Object.assign(e.player, { x, y: q.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 60; i++) e.update(1 / 30);
      return { x, y: q.y, w: q.width, px: Math.round(e.player.x) };
    }, E);
    for (let i = 0; i < 40; i++) {
      await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    await p.waitForTimeout(1500);
    await p.evaluate((E) => { const e = eval(E); e.render(); }, E);
    const file = path.join(out, `w2-${id}-L${layout}-normal-${tag}-${way}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 82 });
    console.log('wrote', file, JSON.stringify(at));
    await p.context().close();
  }
}
await b.close();
