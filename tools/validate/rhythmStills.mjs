// Stills of a beat-built World 1 stage (w1-rhythm, 2026-11-04): the real game (dev server), a spot in each node of the tension curve,
// Pokey stood on the ledge there, the engine stepped 40 frames so the camera settles, upright 412x915 and sideways 915x412.
//   npx vite --port 4311; node tools/validate/rhythmStills.mjs 4311 1-2 [layout] [outDir] [normal|easy]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port = '4311', id = '1-2', layout = '1', out = 'reference/notes/w1-rhythm/stills', diff = 'normal'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate(([id, l]) => window.__play(id, Number(l)), [id, layout]);
  await p.waitForTimeout(5000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(5000);
  const spots = await p.evaluate((E) => {
    const e = eval(E);
    const nodes = e.currentStage?.proto?.rhythm?.nodes ?? [];
    // (a spot on a ledge of the node near 500 px in from its entrance, at the node's own height)
    return nodes.map((n, i) => {
      const want = n.dir < 0 ? n.x1 - 500 : n.x0 + 500;
      const qs = e.platforms.filter((q) => q.type === 'solid' && q.height < 300 && q.width >= 90 && q.x + q.width > n.x0 && q.x < n.x1 && Math.abs(q.y - n.y) < 140);
      const q = qs.sort((a, c) => Math.abs(a.x + a.width / 2 - want) - Math.abs(c.x + c.width / 2 - want))[0];
      const x = q ? Math.max(q.x + 30, Math.min(q.x + q.width - 30, want)) : want;
      return { i, tag: n.tag, tier: n.tier, x: Math.round(x), y: q ? q.y : n.y };
    }).concat(
      // (1-2's rotten wood: Pokey beside the first rotten branch over the base bough, and beside each rotten stretch of the bough leg,
      // on the side he comes from: the leg runs right to left)
      e.platforms.filter((q) => q.type === 'fragile').sort((a, c) => a.y - c.y || a.x - c.x).filter((q, k, all) => q.y >= 600 || all.findIndex((o) => o.y < 600) === k)
        .map((q, k) => ({ i: 90 + k, tag: 'rot', tier: q.y >= 600 ? 'B' : 'A', x: Math.round(q.y >= 600 ? q.x + q.width + 50 : q.x - 60), y: q.y >= 600 ? q.y : 330 })),
    );
  }, E);
  for (const s of spots) {
    await p.evaluate(([s, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((q) => !q.broken && q.type !== 'bouncy' && s.x >= q.x && s.x <= q.x + q.width).sort((a, c) => Math.abs(a.y - s.y) - Math.abs(c.y - s.y))[0];
      Object.assign(e.player, { x: s.x, y: under ? under.y : s.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 40; i++) e.update(1 / 30);
      e.clearGuide?.();
      e.render();
    }, [s, E]);
    const file = path.join(out, `${id}-L${layout}-${diff}-${String(s.i).padStart(2, '0')}-${s.tag}${s.tier}-${tag}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 72 });
    console.log(file);
  }
  await ctx.close();
}
await b.close();
