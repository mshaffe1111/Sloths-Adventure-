// ART-REED-28: stills of 2-8's reed island beside Pokey on the real World 2 water, upright 412x915 and sideways 915x412 at 2x.
// The piece is not wired yet (BUILD-28 lays it), so it is drawn over the real frame at the engine's own camera (viewNow().k), its stand
// line on a real island solid of the 2-8 build on the branch (a solid standing in a river), its walk line stretched to that solid's width.
// Draw order is the overlay's: the piece is drawn last (over the cage's foot and his feet if he stands on it).
//   (a background command) npx vite --port 5199 --strictPort --host 127.0.0.1
//   node tools/art/hfreed28/stills.mjs 5199 <cut.png> <walk_y> <walk_x0> <walk_x1> <out dir> [stage 2-8] [spot bank|top]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, cut, wy, wx0, wx1, out, stage = '2-8', spot = 'bank'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const png = 'data:image/png;base64,' + fs.readFileSync(cut).toString('base64');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 160)));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await p.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(2000);
  let ok = false;
  for (let k = 0; k < 3 && !ok; k++) {
    await p.evaluate((id) => window.__play(id), stage); await sleep(4000);
    ok = await p.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
  }
  if (!ok) { console.log(tag, 'no engine'); process.exit(4); }
  const info = await p.evaluate(async ([png, wy, wx0, wx1, spot]) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const s = e.currentStage;
    const rivers = s.rivers || s.riverZones || [];
    const inWater = (q) => rivers.some((r) => q.x >= r.x0 && q.x + q.width <= r.x1);
    const isl = (s.platforms || []).filter((q) => q.type === 'solid' && q.width >= 200 && q.width <= 400 && q.height <= 140 && inWater(q))[0];
    if (!isl) return { err: 'no island solid in a river', rivers: rivers.length };
    const img = new Image(); img.src = png; await img.decode();
    const sc = isl.width / (wx1 - wx0);                       // world px a cut px
    const R = Object.getPrototypeOf(e).render;
    const left = (s.platforms || []).filter((q) => q.type === 'solid' && q.x + q.width <= isl.x && q.y <= isl.y + 60).sort((a, c) => c.x + c.width - (a.x + a.width))[0];
    window.__pin = spot === 'top' ? { x: isl.x + isl.width * 0.3, y: isl.y } : { x: left.x + left.width - 40, y: left.y };
    e.render = function () {
      const pin = window.__pin, pl = this.player;
      if (pin && pl) { pl.x = pin.x - (pl.width || 40) / 2; pl.y = pin.y - (pl.height || 40); pl.vx = 0; pl.vy = 0; pl.grounded = true; pl.facing = 1; if (this.lives < 5) this.lives = 9; }
      R.call(this);
      const v = this.viewNow(); const c = this.canvas || document.querySelector('canvas'); const g = c.getContext('2d');
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      const x = (isl.x - wx0 * sc - v.x) * v.k, y = (isl.y - wy * sc - v.y) * v.k;
      g.drawImage(img, x, y, img.width * sc * v.k, img.height * sc * v.k); g.restore();
    };
    return { isl: { x: isl.x, y: isl.y, w: isl.width, h: isl.height, style: isl.style }, sc, pin: window.__pin };
  }, [png, +wy, +wx0, +wx1, spot]);
  console.log(tag, JSON.stringify(info));
  if (info.err) process.exit(5);
  await sleep(9000);  // (the stage card clears)
  const f = path.join(out, `reed28-${spot}-${tag}.png`); await p.screenshot({ path: f }); console.log('shot', f);
  await ctx.close();
}
await b.close();
