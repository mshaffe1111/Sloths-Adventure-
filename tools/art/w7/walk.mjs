// A World 7 stage walked end to end (upright 390 x 844 and sideways 844 x 390): Pokey set down on the floor every half screen from the
// start to the exit, a frame each, and a 2x crop of every temple-wall join in view (where a high ledge meets the bank beside it, its
// side over the floor and its foot in the soil). Frames and crops to <out>/<stage>/<size>/; the contact sheets are made by walkSheet.py.
//   NODE_ENV=development npx vite --port 4399 &   then   node tools/art/w7/walk.mjs <out dir> [port] [playwright module path]
import { mkdirSync, writeFileSync } from 'node:fs';
const out = process.argv[2];
const port = process.argv[3] ?? '4399';
const pw = await import(process.argv[4] ?? 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const STAGES = (process.env.STAGES ?? '7-1,7-3,7-5,7-7,7-9').split(',');
const E = `(typeof window.__engine === 'function' ? window.__engine() : window.__engine)`;
const b = await chromium.launch();
const index = {};
for (const [size, [w, h]] of Object.entries(SIZES)) {
  for (const id of STAGES) {
    const dir = `${out}/${id}/${size}`;
    mkdirSync(dir, { recursive: true });
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((id) => window.__play(id, 1), id);
    await p.waitForTimeout(6500);
    // the spots: every half screen along the stage, on its highest floor there; the joins: each high ledge's ends (a bank edge where the
    // next bank is 90 px or more lower) and the bank edges inside a raised run
    const plan = await p.evaluate(`(() => { const e = ${E}; const st = e.currentStage;
      const solids = st.platforms.filter((q) => q.type === 'solid');
      const banks = solids.filter((q) => q.height >= 90).sort((a, c) => a.x - c.x);
      const end = Math.max(...banks.map((q) => q.x + q.width));
      const half = e.camera.viewportWidth / 2;
      const spots = [];
      for (let x = st.spawnX ?? 100; x < end - 40; x += half) {
        const g = solids.filter((q) => x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
        if (g) spots.push({ x: Math.round(x), y: g.y });
      }
      const joins = [];
      for (let i = 1; i < banks.length; i++) { const a = banks[i - 1], c = banks[i]; if (Math.abs(a.x + a.width - c.x) < 2 && Math.abs(a.y - c.y) >= 30) joins.push({ x: c.x, y: Math.min(a.y, c.y) }); }
      return { spots, joins, half };
    })()`);
    index[`${id}/${size}`] = { frames: plan.spots.length, joins: 0 };
    let k = 0;
    const seen = new Set();
    for (const s of plan.spots) {
      await p.evaluate(`(() => { const e = ${E}; e.player.x = ${s.x}; e.player.y = ${s.y} - 2; e.player.vx = 0; e.player.vy = 0; e.player.invincibleTimer = 0; })()`);
      await p.waitForTimeout(650);
      const name = `${dir}/f${String(k++).padStart(3, '0')}.png`;
      await p.screenshot({ path: name });
      // (each join in view, at 2x: where it sits on screen, from the camera)
      const cam = await p.evaluate(`(() => { const e = ${E}; return { x: e.camera.x, y: e.camera.y, vw: e.camera.viewportWidth, vh: e.camera.viewportHeight }; })()`);
      for (const j of plan.joins) {
        const sx = ((j.x - cam.x) / cam.vw) * w, sy = ((j.y - cam.y) / cam.vh) * h;
        if (seen.has(j.x) || sx < 60 || sx > w - 60 || sy < 0 || sy > h) continue;
        seen.add(j.x);
        const cw = 120, chh = Math.min(260, h - sy);
        await p.screenshot({ path: `${dir}/join-${j.x}.png`, clip: { x: sx - cw / 2, y: Math.max(0, sy - 20), width: cw, height: chh } });
        index[`${id}/${size}`].joins++;
      }
    }
    await ctx.close();
  }
}
writeFileSync(`${out}/index.json`, JSON.stringify(index, null, 1));
await b.close();
