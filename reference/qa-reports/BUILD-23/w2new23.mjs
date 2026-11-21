// BUILD-23b: the w2-new pieces on 2-3 on the real page (needs a vite dev server on 5181): each laid piece in view, its draws from the w2-new sheet counted on that frame, a still upright and sideways.
//   node reference/qa-reports/BUILD-23/w2new23.mjs <out dir> [easy]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [out, easy] = process.argv.slice(2);
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:5181/?lessons=off${easy ? '&difficulty=easy' : ''}`);
  await p.waitForTimeout(2500);
  await p.evaluate(([id, v]) => window.__play(id, v), ['2-3', 1]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  const d = await p.evaluate((E) => { const e = eval(E); return (e.proto.decor ?? []).filter((q) => q.nw).map((q) => ({ ...q })); }, E);
  console.log(tag, 'decor', JSON.stringify(d));
  for (const q of d) {
    const at = q.nw === 'mooring-post' ? q.x - 200 : q.x - 120;
    const r = await p.evaluate(([E, x]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((k) => !k.broken && !k.decorative && k.type === 'solid' && x >= k.x && x <= k.x + k.width).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 60; i++) e.update(1 / 30);
      const ctx = e.ctx ?? e.canvas?.getContext('2d');
      let n = 0;
      const orig = ctx.drawImage;
      ctx.drawImage = function (...a) { if (a[0] && a[0].src && a[0].src.includes('w2-new')) n++; return orig.apply(this, a); };
      e.render();
      ctx.drawImage = orig;
      return { n, under: under && [under.x, under.y, under.width] };
    }, [E, at]);
    for (let i = 0; i < 3; i++) await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    console.log(tag, q.nw, 'w2-new drawImage calls this frame:', JSON.stringify(r));
    await p.screenshot({ path: `${out}/b23-L1-${easy ? 'easy' : 'normal'}-w2new-${q.nw}-${tag}.jpg`, type: 'jpeg', quality: 80 });
  }
  await p.context().close();
}
await b.close();
