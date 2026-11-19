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
  // (FREEZE=1: the same frame on every run, for a before/after pair: the page's randomness seeded and its clock stepped only by the
  //  shooter (Pokey's idle poses and their cross-fade, Dot's comings and goings run on them; a pair once caught him mid-blend))
  if (process.env.HOP) await ctx.addInitScript(() => { window.__HOP = true; });
  if (process.env.FREEZE) await ctx.addInitScript(() => {
    let s = 12345; Math.random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    let now = 100000; performance.now = () => now; window.__tick = (ms) => { now += ms; };
  });
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
    await p.evaluate(([x, E, name]) => {
      const e = eval(E);
      e.isPaused = true;
      // (a spot named ride*: he stands on the drift carrier nearest x, the raft or log, and rides it)
      const ride = name.startsWith('ride') ? e.platforms.filter((q) => q.type === 'drift').sort((a, c) => Math.abs(a.x - x) - Math.abs(c.x - x))[0] : null;
      if (ride) { Object.assign(e.player, { x: ride.x + ride.width / 2 - e.player.width / 2, y: ride.y - e.player.height, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 }); for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true; e.clearGuide?.(); for (let i = 0; i < 20; i++) { e.update(1 / 30); e.clearGuide?.(); } return; }
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && q.type !== 'drift' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      e.clearGuide?.();
      // (HOP=1: a player who has hopped: one jump press on the real input, landed, before the 60 frames)
      if (window.__HOP) { e.input.triggerTouchUp(0, 200); for (let i = 0; i < 40; i++) e.update(1 / 30); e.input.releaseTouchUp?.(); for (let i = 0; i < 30; i++) e.update(1 / 30); }
      for (let i = 0; i < 60; i++) { e.update(1 / 30); e.clearGuide?.(); }
    }, [x, E, name]);
    for (let i = 0; i < (name.startsWith('ride') ? 4 : 30); i++) {
      await p.evaluate((E) => { const e = eval(E); window.__tick?.(33.3); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
      if (!process.env.FREEZE) await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    const st = await p.evaluate((E) => { const e = eval(E), pl = e.player; return Object.entries(pl).filter(([k, v]) => v === true || (typeof v === 'number' && v !== 0 && /timer|hid|cover|hurt|blink|fade|alpha/i.test(k)) || (typeof v === 'string' && /state|anim|pose|mode/i.test(k))).map(([k, v]) => `${k}=${typeof v === 'number' ? v.toFixed(2) : v}`).join(' '); }, E);
    console.log('STATE', tag, x, st);
    const f = path.join(out, `${stage}-L${layout}-${DIFF}-x${x}-${name}-${tag}.jpg`);
    await p.screenshot({ path: f, type: 'jpeg', quality: 80 });
    console.log('wrote', f, '|', built);
  }
  await ctx.close();
}
await b.close();
