// ENG-29-e G3: stills of a barge row (scratch: 2-4's raft row turned barge in a throwaway worktree), Pokey on its deck, 2x.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const [port, out, diff = 'normal'] = process.argv.slice(2);
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.log('CERR', m.text().slice(0, 300)); });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('2-4', 0)); await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(4000);
  for (const at of [0.35, 0.85]) {
    const info = await p.evaluate(([E, at]) => {
      const e = eval(E); e.isPaused = true;
      const g = e.platforms.find((q) => q.type === 'drift' && q.drift?.look === 'barge');
      if (!g) return 'no barge';
      Object.assign(e.player, { x: g.x + g.width * at, y: g.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 20; i++) e.update(1 / 30);
      return JSON.stringify({ x: Math.round(g.x), y: g.y, w: g.width, py: Math.round(e.player.y), grounded: e.player.grounded });
    }, [E, at]);
    console.log(tag, at, info);
    for (let i = 0; i < 30; i++) { await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); }
    await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
    await p.screenshot({ path: `${out}/barge-${diff}-${at}-${tag}.jpg`, type: 'jpeg', quality: 78 });
  }
  await ctx.close();
}
await b.close();
