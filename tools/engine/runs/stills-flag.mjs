// RUNS #80: a checkpoint flag 0 / 4 / 8 px off its ledge's top, upright 412 x 915 and sideways 915 x 412, in the real game (the same dev
// build and one-line scratch page hook as stills-water.mjs; nothing committed to src/). 1-1 layout 1, its second flag (x 1694, on its
// ledge at y 1200), the flag raised by the page's __scratch; Pokey stands 120 px before it.   node tools/engine/runs/stills-flag.mjs <port> <out>
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4312', out = 'reference/engine/runs/out/stills'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  for (const up of [0, 4, 8]) {
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((up) => { window.__scratch = (st) => { for (const c of st.checkpoints) if (Math.abs(c.x - 1694) < 5) c.y -= up; }; window.__play('1-1', 1); }, up);
    await p.waitForTimeout(4000);
    await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(5000);
    await p.evaluate((E) => {
      const e = eval(E);
      e.isPaused = true;
      Object.assign(e.player, { x: 1574, y: 1200, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (let i = 0; i < 60; i++) e.update(1 / 30);
      e.clearGuide?.();
      e.render();
    }, E);
    const file = path.join(out, `80-flag-${up}px-off-top-${tag}-SCRATCH.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
    console.log('wrote', file);
  }
  await p.context().close();
}
await b.close();
