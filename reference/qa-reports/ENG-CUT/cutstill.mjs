// ENG-CUT stills: 2-8's reed island drawn by the NEW path (Platform.cut = the inventory id; art/invCut.ts via stageReady + protoArt),
// on the real 2-8 build, Pokey dropped onto it by the engine's physics. A scratch-only build hook (stageGenerator: globalThis.__stillHook)
// sets the island solid's cut and its width to the row's stand line (340, centred) BEFORE the engine is made: what BUILD-28's data will do.
//   node cutstill.mjs <port> <out dir> [stage 2-8] [mode reed|plain]
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/user/Sloths-Adventure-/package.json')('playwright');
const [port, out, stage = '2-8', mode = 'reed'] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 160)));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await p.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  await p.evaluate((mode) => {
    window.__stillHook = (s) => {
      const rivers = s.rivers || s.riverZones || [];
      const inWater = (q) => rivers.some((r) => q.x >= r.x0 && q.x + q.width <= r.x1);
      const isl = (s.platforms || []).filter((q) => q.type === 'solid' && q.width >= 200 && q.width <= 460 && q.height <= 140 && inWater(q))[0];
      window.__isl = isl ? { id: isl.id, x: isl.x, w: isl.width, y: isl.y, h: isl.height, style: isl.style } : { err: 'none', rivers: rivers.length };
      if (!isl || mode !== 'reed') return;
      const c = isl.x + isl.width / 2;
      isl.width = 340; isl.x = c - 170; isl.cut = 'w2-reed28#reed-isle-28';
    };
  }, mode);
  let ok = false;
  for (let k = 0; k < 3 && !ok; k++) {
    await p.evaluate((id) => window.__play(id), stage); await sleep(4000);
    ok = await p.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
  }
  if (!ok) { console.log(tag, 'no engine'); process.exit(4); }
  const info = await p.evaluate(() => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; const isl = window.__isl;
    const q = (e.currentStage.platforms || []).find((x) => x.id === isl.id) || {};
    window.__pin = { x: q.x + q.width * 0.45, y: q.y };
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin, pl = this.player;
      if (pin && pl && !pin.done) { pl.x = pin.x - (pl.width || 40) / 2; pl.y = pin.y - (pl.height || 40) - 120; pl.vx = 0; pl.vy = 0; pl.facing = 1; pin.done = true; }
      if (pl) { pl.vx = 0; if (this.lives < 5) this.lives = 9; }
      R.call(this);
    };
    return { built: isl, live: { x: q.x, y: q.y, w: q.width, cut: q.cut } };
  });
  console.log(tag, JSON.stringify(info));
  await sleep(9000);
  await p.evaluate(() => { window.__pin.done = false; });
  await sleep(14000);
  console.log(tag, 'him', await p.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; const q = e.player; const mod = window.__isl; return JSON.stringify({ x: Math.round(q.x), feet: Math.round(q.y + q.height), grounded: !!(q.onGround ?? q.grounded), top: mod.y }); }));
  const f = path.join(out, `cut-${stage}-${mode}-${tag}.png`); await p.screenshot({ path: f }); console.log('shot', f);
  await ctx.close();
}
await b.close();
