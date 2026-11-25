// INT-14 stills: any stage on the real page (dev server), FIX-284's frozen pattern (Math.random seeded, the clock stepped only by this
// shooter), the engine paused, Pokey set standing at x on the platform there, stepped STEP frames, Dot's lines marked said, dsf 2.
//   node shootx.mjs <port> <out dir> <stage> <layout> <spot> ...   (ORIENT=upright|sideways|both, DIFF=normal|easy, STEP=8)
// spot = x:<px>:<name>[:<pick>]  the platform under x (pick: 'top' the highest, 'low' the lowest (default), or a platform id)
// Prints what was built (stage, seed, setting) and Pokey's feet per shot; the file name carries the built seed (D62).
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
    window.__freezeNow = () => { let now = 100000; performance.now = () => now; window.__tick = (ms) => { now += ms; }; };
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 160)));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await p.evaluate(() => typeof window.__play === 'function')) break; await p.waitForTimeout(1000); }
  await p.waitForTimeout(2500);
  await p.evaluate(([s, v]) => window.__play(s, v), [stage, +layout]);
  await p.waitForTimeout(5000);
  { let gone = 0; for (let k = 0; k < 40 && gone < 4; k++) { const up = await p.evaluate(() => document.documentElement.dataset.hudCard === '1'); if (up) { gone = 0; await p.touchscreen.tap(w / 2, h / 2); } else gone++; await p.waitForTimeout(500); } }
  for (let k = 0; k < 6; k++) { const box = p.getByText("Tap here when you", { exact: false }).first(); if (!(await box.isVisible().catch(() => false))) break; await box.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(400); }
  await p.evaluate(() => window.__freezeNow?.());
  const built = await p.evaluate((E) => { const e = eval(E); const g = e?.currentStage?.gen2; return { id: e?.currentStage?.config?.id, seed: g?.seed ?? e?.currentStage?.seed, set: g?.budget?.difficulty ?? localStorage.getItem('sloth_difficulty') }; }, E);
  console.log('BUILT', tag, JSON.stringify(built));
  for (const spot of spots) {
    const [, xs, name = 'x', pick = 'low'] = spot.split(':');
    const info = await p.evaluate(([X, pick, E, STEP]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((q) => q.x <= X && X <= q.x + q.width && !q.hidden).sort((a, c) => c.y - a.y);
      const pl = /^\d+$/.test(pick) ? e.platforms.find((q) => q.id === +pick) : pick === 'top' ? under[under.length - 1] : under[0];
      if (!pl) return { none: true, under: under.length };
      Object.assign(e.player, { x: X - e.player.width / 2, y: pl.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      e.clearGuide?.();
      for (let i = 0; i < STEP; i++) { e.update(1 / 30); e.clearGuide?.(); }
      return { plat: { id: pl.id, x: Math.round(pl.x), w: Math.round(pl.width), top: Math.round(pl.y), art: pl.art ?? pl.cut ?? null }, under: under.map((q) => `${q.id}@${Math.round(q.y)}`).join(' '), feet: Math.round(e.player.y), px: Math.round(e.player.x), grounded: e.player.grounded };
    }, [+xs, pick, E, STEP]);
    if (info.none) { console.log('no platform at', xs, info.under); continue; }
    for (let i = 0; i < 6; i++) await p.evaluate((E) => { const e = eval(E); window.__tick?.(33.3); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
    console.log('STATE', xs, JSON.stringify(await p.evaluate((E) => { const e = eval(E); const c = e.cast; return { cast: !!c, calm: c ? c.calmNow(false) : null, covered: c ? !!c.prey?.covered : null, still: c ? c.isStill(false) : null, inv: e.player.invincibleTimer, hurt: e.player.hurtTimer ?? null, power: e.player.activePowerUp ?? null, bushes: (e.proto?.bushes ?? []).filter((b) => Math.abs(b.x + b.w / 2 - e.player.x) < 300).map((b) => [Math.round(b.x), Math.round(b.w), Math.round(b.y)]) }; }, E)));
    const f = path.join(out, `${stage}-L${layout}-${built.set}-seed${built.seed}-x${xs}-${name}-${tag}.jpg`);
    await p.screenshot({ path: f, type: 'jpeg', quality: 85 });
    console.log("wrote", f, JSON.stringify(info)); console.log("CAM", JSON.stringify(await p.evaluate((E) => { const e = eval(E); return { x: e.camera.x, y: e.camera.y, z: e.zoom, banks: e.platforms.filter((q) => q.x < e.camera.x + e.camera.viewportWidth && q.x + q.width > e.camera.x).map((q) => [q.id, Math.round(q.x), Math.round(q.y), Math.round(q.width), Math.round(q.height), q.style, q.cut ?? "", q.soil ? "soil" : ""]) }; }, E)));
  }
  await ctx.close();
}
await b.close();
