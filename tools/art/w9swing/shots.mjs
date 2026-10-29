// Screenshots of World 9's chain swings and puzzle rooms (gen2/worlds/w9Swing.ts, w9Rooms.ts) in 9-3, upright 390 x 844 and sideways
// 844 x 390, from a dev-hooks build:
//   NODE_ENV=development npx vite build && npx vite preview --port 4301 &   then
//   node tools/art/w9swing/shots.mjs <out dir> [port] [layout]
// Pokey is stood: on the ledge of the first chain, of the third, and at each room's post (rooms by their id: bucket, plates, lift).
import { mkdirSync } from 'node:fs';
const pw = await import(process.env.PW ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const out = process.argv[2] ?? 'reference/prop-sheets/qa-notes/w9-swing';
const port = process.argv[3] ?? '4301';
const layout = Number(process.argv[4] ?? 0);
const id = process.env.STAGE ?? '9-3';
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const WHAT = (process.env.WHAT ?? 'chain1,chain3,bucket,plates,lift').split(',');
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const what of WHAT) {
    await p.goto(`http://127.0.0.1:${port}/`);
    await p.waitForTimeout(2500);
    await p.evaluate(([s, l]) => window.__play(s, l), [id, layout]);
    await p.waitForTimeout(3000);
    await p.mouse.click(w / 2, h / 2);
    await p.waitForTimeout(1200);
    const where = await p.evaluate((what) => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const st = e.currentStage;
      const plats = e.platforms ?? st.platforms;
      const topAt = (x) => {
        const under = plats.filter((q) => q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y);
        return under.length ? under[0].y : null;
      };
      let x = null;
      const chains = (st.vines ?? []).filter((v) => v.vineType === 'swing_liana').sort((a, c) => a.x - c.x);
      const m = /^chain(\d+)$/.exec(what);
      if (m && chains[Number(m[1]) - 1]) x = chains[Number(m[1]) - 1].x - 210;
      const room = (e.kit?.rooms ?? []).find((r) => r.spec.id.endsWith(`-${what}`));
      if (room) x = room.resets[0].x + 60;
      if (x === null) x = e.player.x;
      const y = topAt(x) ?? e.player.y;
      Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
      return { x: Math.round(x), y: Math.round(y) };
    }, what);
    await p.waitForTimeout(2200);
    await p.screenshot({ path: `${out}/${id}-${what}-${size}.png` });
    console.log(id, what, size, JSON.stringify(where));
  }
  await ctx.close();
}
await b.close();
