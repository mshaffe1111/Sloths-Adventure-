// BUILD-24c: stills of any stage on the real page (dev server), the setting set by DIFF, Dot's lines marked said, the engine paused, Pokey
// placed at each x, 60 frames stepped then 30 stepped AND rendered (stills24.mjs's way), 2x, upright 412x915 and sideways 915x412.
//   node shoot.mjs <port> <out dir> <stage> <layout> <x:name> ...   (ORIENT=upright|sideways|both, DIFF=normal|easy)
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, stage, layout, ...spots] = process.argv.slice(2);
const DIFF = process.env.DIFF ?? 'normal';
const ORIENT = process.env.ORIENT ?? 'both';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  if (ORIENT !== 'both' && ORIENT !== tag) continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, DIFF);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForTimeout(2500);
  await p.evaluate(([s, v]) => window.__play(s, v), [stage, +layout]);
  await p.waitForTimeout(5000);
  for (let k = 0; k < 6 && (await p.evaluate(() => document.documentElement.dataset.hudCard === '1')); k++) { await p.touchscreen.tap(w / 2, h / 2); await p.waitForTimeout(700); }
  const built = await p.evaluate((E) => { const e = eval(E); const g = e?.currentStage?.gen2; return `${e?.currentStage?.config?.id} seed ${g?.seed} built ${g?.budget?.difficulty} stored ${localStorage.getItem('sloth_difficulty')}`; }, E);
  console.log('BUILT', tag, built);
  for (const spot of spots) {
    const [xs, name = 'spot'] = spot.split(':'); const x = +xs;
    await p.evaluate(([x, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && q.type !== 'drift' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      e.clearGuide?.();
      for (let i = 0; i < 60; i++) { e.update(1 / 30); e.clearGuide?.(); }
    }, [x, E]);
    for (let i = 0; i < 30; i++) {
      await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    const f = path.join(out, `${stage}-L${layout}-${DIFF}-x${x}-${name}-${tag}.jpg`);
    await p.screenshot({ path: f, type: 'jpeg', quality: 80 });
    console.log('wrote', f, '|', built);
  }
  await ctx.close();
}
await b.close();
