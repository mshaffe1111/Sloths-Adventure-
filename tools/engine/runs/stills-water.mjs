// RUNS #92 (and #80): stills of a stepping stone at 30 / 50 / 70 px over a drawn water zone, upright 412 x 915 and sideways 915 x 412,
// in the real game: a dev build of the engine-render tip (it carries the water-zone draw) with ONE uncommitted line in a scratch worktree's
// engine.ts, after the stage is built: `if (import.meta.env?.DEV && window.__scratch) window.__scratch(this.currentStage)`. The page's
// __scratch lays the scene into 1-1 (layout 1) at x 520-1760: a bank, 800 px of drawn water (proto.water), three stones, a bank. Nothing
// is committed to src/; the files are labelled SCRATCH, as engine-render's own 1-1 stills were. Built the way tools/validate/stills.mjs builds its shots
// (the engine paused, stepped and rendered).   node tools/engine/runs/stills-water.mjs <port> <out dir>
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4311', out = 'reference/engine/runs/out/stills'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  for (const lift of [30, 50, 70]) {
    // (the scratch scene goes into the stage as it is built: the dev build's one-line page hook, never committed; see the header)
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((lift) => {
      window.__scratch = (st) => {
        const G = 1290, a = 700, b = 1500, surf = G + 40;
        st.platforms = st.platforms.filter((q) => q.x + q.width <= a - 180 || q.x >= b + 260);
        const stone = (x, top) => ({ id: 9000 + x, x, y: top, width: 96, height: 40, type: 'solid', style: 'moss_stone' });
        st.platforms.push({ id: 8001, x: a - 180, y: G, width: 180, height: 120, type: 'solid', style: 'moss_stone' },
          stone(a + 120, surf - lift), stone(a + 340, surf - lift), stone(a + 560, surf - lift),
          { id: 8002, x: b, y: G, width: 260, height: 120, type: 'solid', style: 'moss_stone' });
        st.platforms.sort((q, r) => q.x - r.x);
        st.proto = st.proto ?? {};
        st.proto.water = [{ x0: a, x1: b, y: surf }];
      };
      window.__play('1-1', 1);
    }, lift);
    await p.waitForTimeout(4000);
    await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(5000);
    await p.evaluate((E) => {
      const e = eval(E);
      e.isPaused = true;
      Object.assign(e.player, { x: 560, y: 1290, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (let i = 0; i < 60; i++) e.update(1 / 30);
      e.clearGuide?.();
      e.render();
    }, E);
    const file = path.join(out, `92-stone-${lift}px-over-water-${tag}-SCRATCH.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
    console.log('wrote', file);
  }
  await p.context().close();
}
await b.close();
