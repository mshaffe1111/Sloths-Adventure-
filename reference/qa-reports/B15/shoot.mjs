// B15: stills of 1-5 as the real game builds it, one per beat (and named spots), upright 412x915 and sideways 915x412, 2x, fresh save.
// stills-at.mjs's way (the engine paused, Pokey placed, 60 frames stepped, then 30 stepped AND rendered). The beat x is read from the
// built stage (gen2.sections), so the stills follow the roll.
//   node reference/qa-reports/B15/shoot.mjs <port> <out dir> <normal|easy> [layout] [only-beat-substring]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, setting = 'normal', layout = '1', only = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
// (where in each beat to stand, px past the beat's start; several spots for the long beats)
const SPOTS = {
  'w1-15-arrival': [60, 420], 'w1-15-through-or-over': [300, 700], 'w1-15-creak-lesson': [80, 900, 1300], 'w1-15-her-road': [180, 700],
  'w1-15-blocked': [200, 1100, 1500], 'w1-15-big-sign': [120, 700], 'w1-15-stone': [300, 560], 'w1-15-weave': [200, 1100], 'w1-15-freshest-mark': [200, 600],
};
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  if (setting === 'easy') await p.evaluate(() => { try { localStorage.setItem('slothDifficulty', 'easy'); } catch { /* */ } window.__setDifficulty?.('easy'); });
  await p.evaluate(([v]) => window.__play('1-5', v), [+layout]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(4000);
  const secs = await p.evaluate((E) => { const e = eval(E); const g = e?.currentStage?.gen2; return { seed: g?.seed, diff: g?.budget?.difficulty, secs: (g?.sections ?? []).map((s) => ({ t: s.template, x0: s.x0, x1: s.x1 })) }; }, E);
  console.log('seed', secs.seed, secs.diff);
  for (const s of secs.secs) {
    if (!SPOTS[s.t] || (only && !s.t.includes(only))) continue;
    for (const dx of SPOTS[s.t]) {
      const x = Math.round(s.x0 + dx);
      await p.evaluate(([x, E]) => {
        const e = eval(E);
        e.isPaused = true;
        const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0];
        Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
        for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
        for (let i = 0; i < 60; i++) e.update(1 / 30);
      }, [x, E]);
      for (let i = 0; i < 30; i++) {
        await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
        await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
      }
      await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
      const file = path.join(out, `${setting}-${s.t.replace('w1-15-', '')}-${dx}-${tag}.jpg`);
      await p.screenshot({ path: file, type: 'jpeg', quality: 72 });
      console.log('wrote', file);
    }
  }
  await ctx.close();
}
await b.close();
