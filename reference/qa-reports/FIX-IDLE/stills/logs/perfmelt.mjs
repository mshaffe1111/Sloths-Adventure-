// FIX-IDLE stills: Pokey placed standing at x (the platform under it), his clip memory reset, the engine stepped frame by frame on a
// frozen clock; shots of his body at chosen frames, and per frame whether a complementary pair of part-clear draws (the old melt) ran.
//   node melt.mjs <port> <out dir> <tag> <stage> <layout> <x> <frames a,b,c> [MAXF]   (ORIENT=upright|sideways|both)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, btag, stage, layout, xs, framesArg, maxArg] = process.argv.slice(2);
const SHOTS = new Set(framesArg.split(',').map(Number));
const ISO = new Set((process.env.ISO ?? '').split(',').filter(Boolean).map(Number));
const MAXF = Number(maxArg ?? Math.max(...SHOTS));
const ORIENT = process.env.ORIENT ?? 'both';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  if (ORIENT !== 'both' && ORIENT !== tag) continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript({ path: '/home/user/Sloths-Adventure-/tools/perf/instrument.js' });
  await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
  await ctx.addInitScript(() => {
    let s = 12345; Math.random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    window.__freezeNow = () => { let now = 100000; performance.now = () => now; window.__tick = (ms) => { now += ms; }; };
    const di = CanvasRenderingContext2D.prototype.drawImage;
    window.__alphas = [];
    CanvasRenderingContext2D.prototype.drawImage = function (...a) {
      const al = this.globalAlpha;
      if (al > 0.02 && al < 0.98 && window.__watch) window.__alphas.push([+al.toFixed(3), this.globalCompositeOperation, a[0]?.src ? String(a[0].src).split('/').pop().slice(0, 24) : 'canvas' + (a[0]?.width ?? '')]);
      return di.apply(this, a);
    };
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
  const built = await p.evaluate((E) => { const e = eval(E); const g = e?.currentStage?.gen2; return { id: e?.currentStage?.config?.id, seed: g?.seed ?? e?.currentStage?.seed }; }, E);
  console.log('BUILT', btag, tag, JSON.stringify(built));
  const info = await p.evaluate(async ([X, E, process_pick]) => {
    const e = eval(E);
    e.isPaused = true;
    const under = e.platforms.filter((q) => q.x <= X && X <= q.x + q.width && !q.hidden).sort((a, c) => c.y - a.y);
    const pl = process_pick === 'top' ? under[under.length - 1] : under[0];
    if (!pl) return { none: true };
    Object.assign(e.player, { x: X - e.player.width / 2, y: pl.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 });
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    e.clearGuide?.();
    const hc = await import('/src/game/heroClips.ts');
    hc.resetHeroClips();
    return { plat: pl.id, top: Math.round(pl.y) };
  }, [+xs, E, process.env.PICK ?? 'low']);
  console.log('PLACED', JSON.stringify(info));
  await p.evaluate(() => { const cs = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height); window.__perf.main = cs[0]; window.__perf.install(); });
  for (let f = 1; f <= MAXF; f++) {
    await p.evaluate(([E, f]) => { const e = eval(E); window.__tick?.(33.3); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; window.__perf.beginFrame({ f }); e.render(); window.__perf.endFrame(); }, [E, f]);
  }
  const dump = await p.evaluate(() => { const d = window.__perf.dump(); return { frames: d.frames, sites: d.sites.filter((x) => /heroSprite/.test(JSON.stringify(x))).map((x) => JSON.stringify(x).slice(0, 400)) }; });
  fs.writeFileSync(path.join(out, `${btag}-${tag}-perf.json`), JSON.stringify(dump, null, 1));
  for (const fr of dump.frames) if (fr.f >= 115) console.log('PF', btag, tag, JSON.stringify(fr).slice(0, 420));
  await ctx.close();
}
await b.close();
