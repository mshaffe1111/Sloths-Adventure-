// FIX-284 final stills: 2-2's pads on the real page (dev server), BUILD-24c's frozen pattern (FREEZE: Math.random seeded, the clock stepped
// only by this shooter, so no still catches Pokey mid idle-pose cross-fade), the engine paused, Pokey set standing on each pad's floor at a
// share of its width and stepped STEP frames (8: a weight pad holds 1-2 s, so it is still up), Dot's lines marked said, dsf 2.
//   node shootfinal.mjs <port> <out dir> <stage> <layout> <padId:share:name> ...   (ORIENT=upright|sideways|both, DIFF=normal|easy)
// padId 'crown' = the crown lily, 'bigN' = the n-th big pad by x. Prints the pad's floor and his feet per shot.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, stage, layout, ...spots] = process.argv.slice(2);
const DIFF = process.env.DIFF ?? 'normal';
const ORIENT = process.env.ORIENT ?? 'both';
const STEP = Number(process.env.STEP ?? 8);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  if (ORIENT !== 'both' && ORIENT !== tag) continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, DIFF);
  await ctx.addInitScript(() => {
    let s = 12345; Math.random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    // (the clock freezes only once the stage's goal card has gone: frozen from the start, its shrink never ends and it covers every frame)
    window.__freezeNow = () => { let now = 100000; performance.now = () => now; window.__tick = (ms) => { now += ms; }; };
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 160)));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await p.evaluate(() => typeof window.__play === 'function')) break; await p.waitForTimeout(1000); }
  await p.waitForTimeout(2500);
  await p.evaluate(([s, v]) => window.__play(s, v), [stage, +layout]);
  await p.waitForTimeout(5000);
  // (the stage's goal card runs on real timers and comes up a moment after the stage: wait for it, tap it away, then wait for it to go)
  { let seen = false, gone = 0; for (let k = 0; k < 40 && gone < 4; k++) { const up = await p.evaluate(() => document.documentElement.dataset.hudCard === '1'); if (up) { seen = true; gone = 0; await p.touchscreen.tap(w / 2, h / 2); } else if (seen) gone++; await p.waitForTimeout(500); } }
  // (Dot's own boxes ("Tap here when you've read it"): tapped away so no box sits over the frames)
  for (let k = 0; k < 6; k++) { const box = p.getByText("Tap here when you", { exact: false }).first(); if (!(await box.isVisible().catch(() => false))) break; await box.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(600); }
  await p.evaluate(() => window.__freezeNow?.());
  const built = await p.evaluate((E) => { const e = eval(E); const g = e?.currentStage?.gen2; return `${e?.currentStage?.config?.id} seed ${g?.seed} built ${g?.budget?.difficulty} stored ${localStorage.getItem('sloth_difficulty')}`; }, E);
  console.log('BUILT', tag, built);
  for (const spot of spots) {
    const [id, shareS = '0.5', name = 'pad'] = spot.split(':');
    const info = await p.evaluate(([id, share, E, STEP]) => {
      const e = eval(E);
      e.isPaused = true;
      // ('crown', 'bigN' the n-th big pad by x (1-based, the same call on either setting), or a platform id)
      const bigs = e.platforms.filter((q) => q.pad?.look === 'big').sort((a, c) => a.x - c.x);
      const pl = id === 'crown' ? e.platforms.find((q) => q.art === 'crownLily') : id.startsWith('big') ? bigs[+id.slice(3) - 1] : e.platforms.find((q) => q.id === +id);
      if (!pl) return null;
      const x = pl.x + pl.width * +share - e.player.width / 2;
      Object.assign(e.player, { x, y: pl.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      e.clearGuide?.();
      for (let i = 0; i < STEP; i++) { e.update(1 / 30); e.clearGuide?.(); }
      return { pad: { id: pl.id, x: Math.round(pl.x), w: pl.width, top: Math.round(pl.y), look: pl.pad?.look ?? pl.art }, feet: Math.round(e.player.y), px: Math.round(e.player.x), grounded: e.player.grounded };
    }, [id, shareS, E, STEP]);
    if (!info) { console.log('no pad', id); continue; }
    for (let i = 0; i < 6; i++) await p.evaluate((E) => { const e = eval(E); window.__tick?.(33.3); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
    const f = path.join(out, `${stage}-L${layout}-${DIFF}-pad${id}-${name}-${tag}.jpg`);
    await p.screenshot({ path: f, type: 'jpeg', quality: 85 });
    console.log('wrote', f, JSON.stringify(info));
  }
  await ctx.close();
}
await b.close();
