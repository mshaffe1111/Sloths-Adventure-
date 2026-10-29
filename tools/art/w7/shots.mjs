// Screenshots of World 7's gen2 stages (upright 390 x 844 and sideways 844 x 390), for Matt and the lead's QA read:
//   NODE_ENV=development npx vite --port 4399 &   then   node tools/art/w7/shots.mjs <out dir> [port] [playwright module path]
// Per stage (layout 1): the start; the first crumbling tiles (and the hall under them); a brown-vine wall; the stage's puzzle room.
import { mkdirSync } from 'node:fs';
const out = process.argv[2];
const port = process.argv[3] ?? '4399';
const { chromium } = await import(process.argv[4] ?? 'playwright');
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const STAGES = ['7-1', '7-3', '7-5', '7-6', '7-7', '7-9'];
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const id of STAGES) {
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((id) => window.__play(id, 1), id);
    await p.waitForTimeout(6500);
    await p.screenshot({ path: `${out}/${id}-start-${size}.png` });
    // the spots worth a look, found in the stage the engine is playing
    const spots = await p.evaluate(() => {
      const e = window.__engine();
      const st = e.currentStage;
      const tiles = st.platforms.filter((q) => q.type === 'fragile').sort((a, c) => a.x - c.x);
      const vine = (st.vines ?? []).find((v) => v.vineType === 'tree_climb');
      const room = st.kit?.rooms?.[0];
      const roomPlat = room && st.platforms.find((q) => q.id === room.left.on);
      const out = [];
      if (tiles.length) out.push(['tiles', tiles[0].x - 140, tiles[0].y]);
      if (vine) out.push(['wall', vine.x - 120, vine.bottomY]);
      if (roomPlat) out.push(['room', roomPlat.x + 60, roomPlat.y]);
      return out;
    });
    for (const [name, x, y] of spots) {
      await p.evaluate(([x, y]) => {
        const e = window.__engine();
        e.player.x = x;
        e.player.y = y - 2;
        e.player.vx = 0;
        e.player.vy = 0;
        e.player.invincibleTimer = 999;
      }, [x, y]);
      await p.waitForTimeout(1800);
      await p.screenshot({ path: `${out}/${id}-${name}-${size}.png` });
    }
  }
  await ctx.close();
}
await b.close();
