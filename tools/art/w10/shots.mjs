// Screenshots of World 10's gen2 stages (upright 390 x 844 and sideways 844 x 390), for Matt and the lead's QA read:
//   NODE_ENV=development npx vite --port 4399 &   then   node tools/art/w10/shots.mjs <out dir> [port] [playwright module path]
// Per stage (layout LAYOUT, default 1): the start; the first lightning rod; the first spike bed; the first crumbling rampart; the first
// gust; the first soldier; the stage's puzzle room.
import { mkdirSync } from 'node:fs';
const out = process.argv[2];
const port = process.argv[3] ?? '4399';
const pw = await import(process.argv[4] ?? 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const STAGES = (process.env.STAGES ?? '10-1,10-3,10-6,10-7,10-9').split(',');
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const id of STAGES) {
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate(([id, l]) => window.__play(id, l), [id, Number(process.env.LAYOUT ?? 1)]);
    await p.waitForTimeout(6500);
    await p.screenshot({ path: `${out}/${id}-start-${size}.png` });
    // the spots worth a look, found in the stage the engine is playing
    const spots = await p.evaluate(() => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const st = e.currentStage;
      const tiles = st.platforms.filter((q) => q.type === 'fragile').sort((a, c) => a.x - c.x);
      const zone = (k) => (st.zones ?? []).filter((z) => z.kind === k).sort((a, c) => a.x0 - c.x0)[0];
      const soldier = st.enemies.filter((q) => q.look === 'soldier').sort((a, c) => a.x - c.x)[0];
      const room = st.kit?.rooms?.[0];
      const roomPlat = room && st.platforms.find((q) => q.id === room.left.on);
      const out = [];
      if (tiles.length) out.push(['rampart', tiles[0].x - 140, top(tiles[0].x - 140)]);
      // (Pokey stands on the highest floor at x)
      const top = (x) => st.platforms.filter((q) => q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0]?.y ?? 0;
      for (const k of ['bolt', 'spikes', 'wind']) { const z = zone(k); if (z) { const x = z.x0 - (k === 'bolt' ? 140 : 90); out.push([k, x, top(x)]); } }
      if (soldier) out.push(['soldier', soldier.x - 220, top(soldier.x - 220)]);
      if (roomPlat) out.push(['room', roomPlat.x + 60, roomPlat.y]);
      return out;
    });
    for (const [name, x, y] of spots) {
      await p.evaluate(([x, y]) => {
        const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
        e.player.x = x;
        e.player.y = y - 2;
        e.player.vx = 0;
        e.player.vy = 0;
        e.player.invincibleTimer = 0;
      }, [x, y]);
      await p.waitForTimeout(1800);
      await p.screenshot({ path: `${out}/${id}-${name}-${size}.png` });
    }
  }
  await ctx.close();
}
await b.close();
