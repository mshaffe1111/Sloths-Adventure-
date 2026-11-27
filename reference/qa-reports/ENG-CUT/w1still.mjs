// ENG-CUT: a World 1 cut piece on 1-1 (designed layout), Pokey dropped beside it; the same frame on two servers (before / after).
//   node w1still.mjs <port> <out dir> <tag>
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/user/Sloths-Adventure-/package.json')('playwright');
const [port, out, tag] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const eng = "typeof window.__engine === 'function' ? window.__engine() : window.__engine";
const b = await chromium.launch();
for (const [o, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 160)));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await p.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  let ok = false;
  for (let k = 0; k < 3 && !ok; k++) { await p.evaluate(() => window.__play('1-1', 1)); await sleep(4000); ok = await p.evaluate(`(() => { const e = ${eng}; return !!(e && e.currentStage); })()`); }
  if (!ok) { console.log(o, 'no engine'); process.exit(4); }
  const info = await p.evaluate(`(() => {
    const e = ${eng};
    const q = (e.currentStage.platforms || []).filter((x) => x.cut && x.x > 600).sort((a, c) => a.x - c.x)[0];
    if (!q) return { err: 'no cut piece' };
    window.__pin = { x: q.x - 60, y: q.y };
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin, pl = this.player;
      if (pin && pl && !pin.done) { pl.x = pin.x - (pl.width || 40) / 2; pl.y = pin.y - (pl.height || 40) - 160; pl.vx = 0; pl.vy = 0; pl.facing = 1; pin.done = true; }
      if (pl) { pl.vx = 0; if (this.lives < 5) this.lives = 9; }
      R.call(this);
    };
    return { id: q.id, cut: q.cut, x: q.x, y: q.y, w: q.width, h: q.height };
  })()`);
  console.log(tag, o, JSON.stringify(info));
  await sleep(9000);
  await p.evaluate(() => { window.__pin.done = false; });
  await sleep(4000);
  const f = path.join(out, `w1cut-${tag}-${o}.png`); await p.screenshot({ path: f }); console.log('shot', f);
  await ctx.close();
}
await b.close();
