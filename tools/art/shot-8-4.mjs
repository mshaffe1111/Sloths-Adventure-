// Screenshots of 8-4 Lantern Run (src/game/w8Lantern.ts), upright 390 x 844 and sideways 844 x 390, from the dev server or a dev-hooks build:
//   npx vite --port 4301 &   then   node tools/art/shot-8-4.mjs <out dir> [port] [layout] [playwright module path]
// Moments: the opening (the jar half full, the first flower ahead), the refill (walking into a flower's light, the jar low), running
// low (a dark stretch, the jar nearly out), a moth coming at the jar, and the firefly tree's swarm.
import { mkdirSync } from 'node:fs';
const pw = await import(process.argv[5] ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const out = process.argv[2] ?? 'reference/prop-sheets/qa-notes/8-4-mockup';
const port = process.argv[3] ?? '4301';
const layout = Number(process.argv[4] ?? 1);
const only = process.env.SHOTS ? process.env.SHOTS.split(',') : null;
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const MOMENTS = ['opening', 'refill', 'low', 'moth', 'swarm'].filter((m) => !only || only.includes(m));
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const what of MOMENTS) {
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate(([s, l]) => window.__play(s, l), ['8-4', layout]);
    await p.waitForTimeout(3500);
    await p.mouse.click(w / 2, h / 2);
    await p.waitForTimeout(800);
    const where = await p.evaluate((what) => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const lr = e.lanternRun;
      const plan = lr.plan;
      const plats = e.platforms;
      const topAt = (x) => {
        const under = plats.filter((q) => x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y);
        return under.length ? under[0].y : null;
      };
      let x = e.player.x;
      if (what === 'refill') { x = plan.flowers[2].x - 200; lr.st.level = 0.22; }
      else if (what === 'low') {
        // the middle of the longest dark stretch between two flowers, on a bough
        const fs = [...plan.flowers].sort((a, c) => a.x - c.x);
        let best = 0;
        for (let i = 1; i < fs.length - 1; i++) if (fs[i].x - fs[i - 1].x > fs[best + 1].x - fs[best].x) best = i - 1;
        x = (fs[best].x + fs[best + 1].x) / 2;
        while (topAt(x) === null) x += 20;
        lr.st.level = 0.2;
      } else if (what === 'moth') { const m = plan.moths[0]; x = m.x - 260; lr.st.level = 0.9; }
      else if (what === 'swarm') { x = plan.swarmX - 60; }
      const y = topAt(x) ?? e.player.y;
      Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
      e.camCut = true;
      return { x: Math.round(x), y: Math.round(y) };
    }, what);
    if (what === 'refill') {
      await p.waitForTimeout(600);
      await p.keyboard.down('ArrowRight');
      await p.waitForTimeout(650);
      await p.keyboard.up('ArrowRight');
      await p.waitForTimeout(250);
    } else if (what === 'swarm') {
      await p.keyboard.down('ArrowRight');
      await p.waitForTimeout(500);
      await p.keyboard.up('ArrowRight');
      await p.waitForTimeout(2600);
    } else if (what === 'moth') {
      await p.waitForTimeout(2600);
    } else await p.waitForTimeout(1800);
    await p.screenshot({ path: `${out}/${what}-${size}.png` });
    console.log(what, size, JSON.stringify(where));
  }
  await ctx.close();
}
await b.close();
